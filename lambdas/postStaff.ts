import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { createStaff } from '../shared/util'; 
import { CreateStaffInput } from '../shared/type';

const dynamo = new DynamoDB.DocumentClient(); 
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body!);
    const input: CreateStaffInput = body; 

    const staff = createStaff(input);

    await dynamo.put({
      TableName: TABLE_NAME,
      Item: staff,
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Staff added!', staffId: staff.staffId }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not add Staff', detail: (error as Error).message }),
    };
  }
};