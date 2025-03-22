import { Staff, CreateStaffInput } from './type';
import { DynamoDB } from 'aws-sdk';


export function createStaff(input: CreateStaffInput): Staff {
  return {
    staffId: input.staffId,
    staffName: input.staffName,
    description: input.description,
    attendance: input.attendance ?? false, 
    rating: input.rating ?? undefined,
    translations: { en: input.description },
  };
}


export function generateBatch(staffs: Staff[]): DynamoDB.Types.WriteRequests {
  return staffs.map((b) => {
    const item = convertToDynamoFormat(b);
    return {
      PutRequest: { Item: item },
    };
  });
}

function convertToDynamoFormat(staff: Staff): DynamoDB.AttributeMap {
  return DynamoDB.Converter.marshall(staff);
}