import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB, Translate } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();
const translator = new Translate();
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const staffId = event.pathParameters?.staffId;
    const staffName = event.pathParameters?.staffName;
    const language = event.queryStringParameters?.language;

    if (!staffId || !staffName || !language) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing staffId, title, or language in request' }),
      };
    }

    // get staff record
    const { Item } = await dynamo.get({
      TableName: TABLE_NAME,
      Key: { staffId, staffName },
    }).promise();

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'staff not found' }),
      };
    }

    const originalDescription = Item.description;
    const cachedTranslation = Item.translations?.[language];

    if (cachedTranslation) {
      return {
        statusCode: 200,
        body: JSON.stringify({ translated: cachedTranslation, cached: true }),
      };
    }

    const translated = await translator.translateText({
      SourceLanguageCode: 'en',
      TargetLanguageCode: language,
      Text: originalDescription,
    }).promise();

    const translatedText = translated.TranslatedText;

    await dynamo.update({
      TableName: TABLE_NAME,
      Key: { staffId, staffName },
      UpdateExpression: 'set #translations.#lang = :text',
      ExpressionAttributeNames: {
        '#translations': 'translations',
        '#lang': language,
      },
      ExpressionAttributeValues: {
        ':text': translatedText,
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ translated: translatedText, cached: false }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Translation failed', detail: (err as Error).message }),
    };
  }
};