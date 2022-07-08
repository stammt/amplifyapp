"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const node_fetch_1 = require("node-fetch");
const documentClient = new aws_sdk_1.DynamoDB.DocumentClient();
const environment = process.env.ENV;
const apiGraphQLAPIIdOutput = process.env.API_AMPLIFYAPP_GRAPHQLAPIIDOUTPUT;
const stravaUsersTableName = `strava_users-${apiGraphQLAPIIdOutput}-${environment}`;
/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    console.log(`table name: ${stravaUsersTableName}`);
    const user = await documentClient.get({
        TableName: "strava_users",
        Key: { "username": "tomstamm" },
    }).promise();
    console.log(`user: ${JSON.stringify(user)}`);
    const token = user.Item ? user.Item["accesstoken"] : "none";
    const response = await (0, node_fetch_1.default)("https://www.strava.com/api/v3/athlete", {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log(`response: ${response.ok} ${response.statusCode} ${response.statusText}`);
    const athlete = await response.json();
    console.log(`athlete: ${JSON.stringify(athlete)}`);
    return {
        statusCode: 200,
        //  Uncomment below to enable CORS requests
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(`Hello from Lambda 1! ${token} `),
    };
};
exports.handler = handler;
//# sourceMappingURL=index.js.map