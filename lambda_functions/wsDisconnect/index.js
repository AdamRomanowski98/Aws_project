// disconnect.js
const DynamoDB = require('aws-sdk/clients/dynamodb');

exports.handler = async function(event, context, callback) {
  const db = new DynamoDB.DocumentClient();
  var deleteParams = {
    TableName: "WebSocketClients", // In our case, "WebSocketManager"
    Key: {
      ConnectionId: event.requestContext.connectionId,
    }
  };

  try {
    // If the client dis
    await db.delete(deleteParams).promise();
    return {
      statusCode: 200,
      body: "Disconnected"
    }
  } catch (e) {
    console.error('error!', e);
    return {
      statusCode: 501,
      body: "Failed to disconnect: " + JSON.stringify(e),
    };
  }
};