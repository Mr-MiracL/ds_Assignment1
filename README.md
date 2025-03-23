## Serverless REST Assignment - Distributed Systems.

__Name:__ Yuheng Gu

__Demo:__ https://youtu.be/ft5t0g76rYo

### Context.

State the context you chose for your web API and detail the attributes of the DynamoDB table items, e.g.

Context: Staff Cast

Table item attributes:
+  staffId: string;  
+ staffName: string; 
+  description: string;  
+ attendance?: boolean;
+ rating?: number; 
+ translations: Partial<Record<Language, string>>; 

### App API endpoints.

[ Provide a bullet-point list of the app's endpoints (excluding the Auth API) you have successfully implemented. ]
e.g.
 
+ POST /staffs/ - add a new staff;
+ GET /staffs/  - get all the staffs in the base ;
+ PUT/ staffs/ - change information of a staff;
+ GET/staffs/staffID/staffName/translation?language=fr- get a french version of a staff's name;


### Features.

#### Translation persistence (if completed)

[ Explain briefly your solution to the translation persistence requirement - no code excerpts required. Show the structure of a table item that includes review translations, e.g.

+  staffId: string;  
+ staffName: string; 
+  description: string;  
+ attendance?: boolean;
+ rating?: number; 
+ translations: Partial<Record<Language, string>>; 
]

#### Custom L2 Construct (if completed)

[State briefly the infrastructure provisioned by your custom L2 construct. Show the structure of its input props object and list the public properties it exposes, e.g. taken from the Cognito lab,

Construct Input props object:
~~~
type AuthApiProps = {
 userPoolId: string;
 userPoolClientId: string;
}
~~~
Construct public properties
~~~
export class MyConstruct extends Construct {
 public  PropertyName: type
 etc.
~~~
 ]

#### Multi-Stack app (if completed)

[Explain briefly the stack composition of your app - no code excerpts required.]

#### Lambda Layers (if completed)

[Explain briefly where you used the Layers feature of the AWS Lambda service - no code excerpts required.]


#### API Keys. (if completed)

[Explain briefly how to implement API key authentication to protect API Gateway endpoints. Include code excerpts from your app to support this. ][]

~~~ts
// This is a code excerpt markdown 
 defaultCorsPreflightOptions:{
              allowHeaders: ["Content-Type","X-Amz-Date","X-Api-Key"],
             allowMethods: ["OPTONS","GET", "PUT", "PATCH", "DELETE","POST"],
              allowCredentials: true,
              allowOrigins: ["*"],
             },
~~~
[use three ways to make authenication,detailed information in distributed_system_assignment1-stack.ts file]

###  Extra (If relevant).

[ State any other aspects of your solution that use CDK/serverless features not covered in the lectures ]