import { APIGatewayProxyHandler } from 'aws-lambda'; 
import { DynamoDB } from 'aws-sdk'; 

const dynamo = new DynamoDB.DocumentClient(); 
const TABLE_NAME = process.env.TABLE_NAME!; 

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const staffId = event.pathParameters?.staffId; 

    if (!staffId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing StaffId in path' }),
      };
    }

    const result = await dynamo.scan({
      TableName: TABLE_NAME,
      FilterExpression: 'staffId = :bid',
      ExpressionAttributeValues: {
        ':bid': staffId,
      },
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Staff not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items), 
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch Staff', detail: (err as Error).message }),
    };
  }
};