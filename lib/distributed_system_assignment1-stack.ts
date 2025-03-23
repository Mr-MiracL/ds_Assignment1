import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as custom from 'aws-cdk-lib/custom-resources';
import { generateBatch } from '../shared/util';
import { Staffs } from '../seed/staff';


export class DistributedSystemAssignment1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
     const table = new dynamodb.Table(this, 'staffTable',{
       partitionKey: {name:"staffId", type:dynamodb.AttributeType.STRING },
      sortKey:{name:"staffName", type: dynamodb.AttributeType.STRING},
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName:'Staff',
          });

           const postStaffFn = new lambdanode.NodejsFunction(this, 'PostStaffFunction', {
             runtime:lambda.Runtime.NODEJS_18_X,
             architecture: lambda.Architecture.ARM_64,
             entry: `${__dirname}/../lambdas/postStaff.ts`,
             timeout: cdk.Duration.seconds(10),
             memorySize:128,
             environment:{
            TABLE_NAME: table.tableName,
             REGION: 'eu-west-1'
             }
             })

             const getStaffsFn = new lambdanode.NodejsFunction(this, 'GetMoviesFunction', {
              runtime:lambda.Runtime.NODEJS_18_X,
              architecture: lambda.Architecture.ARM_64,
              entry: `${__dirname}/../lambdas/getStaffs.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize:128,
              environment:{
                TABLE_NAME: table.tableName,
                REGION: 'eu-west-1'
              }
            })

            const getStaffFn = new lambdanode.NodejsFunction(this, 'GetMovieFunction', {
              runtime: lambda.Runtime.NODEJS_18_X,
              architecture: lambda.Architecture.ARM_64,
              entry: `${__dirname}/../lambdas/getStaff.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize: 128,
              environment: {
                TABLE_NAME: table.tableName,
                REGION: 'eu-west-1',
              },
            });

            const updateStaffFn = new lambdanode.NodejsFunction(this, 'UpdateStaffFunction', {
              runtime: lambda.Runtime.NODEJS_18_X,
              architecture: lambda.Architecture.ARM_64,
              entry: `${__dirname}/../lambdas/updateStaff.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize: 128,
              environment: {
                TABLE_NAME: table.tableName,
                REGION: 'eu-west-1',
              },
            });
        
            const translateMovieFn = new lambdanode.NodejsFunction(this, 'TranslateMovieFunction', {
              runtime: lambda.Runtime.NODEJS_18_X,
              architecture: lambda.Architecture.ARM_64,
              entry: `${__dirname}/../lambdas/translation.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize: 128,
              environment: {
                TABLE_NAME: table.tableName,
                REGION: 'eu-west-1',
              },
            });
             
              //赋予权限
              table.grantWriteData(postStaffFn);
              table.grantReadData(getStaffsFn);
              table.grantReadData(getStaffFn);
              table.grantWriteData(updateStaffFn);
              table.grantReadWriteData(translateMovieFn);
             
              //创建API权限管理
              const api = new apig.RestApi(this, 'StaffApi', {
              restApiName: "Staff Service",
              description: 'staffs Api',
              deployOptions:{
              stageName:"dev",
              },
              defaultCorsPreflightOptions:{
              allowHeaders: ["Content-Type","X-Amz-Date","X-Api-Key"],
             allowMethods: ["OPTONS","GET", "PUT", "PATCH", "DELETE","POST"],
              allowCredentials: true,
              allowOrigins: ["*"],
             },
              apiKeySourceType: apig.ApiKeySourceType.HEADER,
              })
             
          
              const apiKey = api.addApiKey('StaffApiKey');
             
              //创建使用计划
              const plan = api.addUsagePlan("UsagePlan",{
              name: 'BasicUsagePlan',
              throttle: { rateLimit: 10, burstLimit: 2 },
             })
             
              plan.addApiStage({ stage: api.deploymentStage });
             
              plan.addApiKey(apiKey);
              
              const staffs = api.root.addResource('staffs');
             
              staffs.addMethod('POST', new apig.LambdaIntegration(postStaffFn),{
              apiKeyRequired: true,
              });

              staffs.addMethod('GET', new apig.LambdaIntegration(getStaffsFn),{
                apiKeyRequired: true,
              })

              const staffById = staffs.addResource('staff').addResource('{staffId}');
              staffById.addMethod('GET', new apig.LambdaIntegration(getStaffFn), {
                apiKeyRequired: true,
              });
             
              staffs.addMethod('PUT',new apig.LambdaIntegration(updateStaffFn),{
                apiKeyRequired: true,
              });
          
              const translation = staffs
              .addResource('{staffId}')
              .addResource('{staffName}')
              .addResource('translation');
          
            translation.addMethod('GET', new apig.LambdaIntegration(translateMovieFn));

              //自动化播种
              new custom.AwsCustomResource(this, 'SeedStaffsData', {
                onCreate: {
          
                  service: 'DynamoDB', 
                  action: 'batchWriteItem',
                  parameters: {
                    RequestItems: {
                      [table.tableName]: generateBatch(Staffs), 
                    },
                  },
                  physicalResourceId: custom.PhysicalResourceId.of('SeedStaffsData'), 
                },
                policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
                  resources: [table.tableArn],
                }),
              });
             
              }
             }