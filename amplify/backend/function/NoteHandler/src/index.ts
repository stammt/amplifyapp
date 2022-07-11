import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from "aws-sdk";
// import fetch from 'node-fetch'

// API_AMPLIFYAPP_GRAPHQLAPIENDPOINTOUTPUT
// API_AMPLIFYAPP_GRAPHQLAPIIDOUTPUT
// API_AMPLIFYAPP_GRAPHQLAPIKEYOUTPUT
// API_AMPLIFYAPP_NOTETABLE_ARN
// API_AMPLIFYAPP_NOTETABLE_NAME
// AUTH_AMPLIFYAPPCDC172C4_USERPOOLID
// STORAGE_S3PHOTOS_BUCKETNAME

const documentClient = new DynamoDB.DocumentClient();

const environment = process.env.ENV;
const apiGraphQLAPIIdOutput = process.env.API_AMPLIFYAPP_GRAPHQLAPIIDOUTPUT;
const stravaUsersTableName = `strava_users-${apiGraphQLAPIIdOutput}-${environment}`;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
 export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    console.log(`table name: ${stravaUsersTableName}`)

    const authProvider = event.requestContext.identity.cognitoAuthenticationProvider;
    if (!authProvider) {
        console.log("no auth")
    } else {
        console.log(`auth provider: ${authProvider}`)   
    }

    const user = await documentClient.get({
        TableName: "strava_users",
        Key: { "username": "tomstamm" },
      }).promise();

    console.log(`user: ${JSON.stringify(user)}`)

    const token = user.Item ? user.Item["accesstoken"] : "none"

    // const response = await fetch("https://www.strava.com/api/v3/athlete",
    //     {
    //         headers: {
    //         'Authorization': `Bearer ${token}`
    //         }
    //     }
    // );
    // console.log(`response: ${response.ok} ${response.statusCode} ${response.statusText}`)
    // const athlete = await response.json()
    // console.log(`athlete: ${JSON.stringify(athlete)}`)

    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
     headers: {
         "Access-Control-Allow-Origin": "*",
         "Access-Control-Allow-Headers": "*"
     }, 
        body: JSON.stringify(`Hello from Lambda 1! ${token} `),
    };
}
