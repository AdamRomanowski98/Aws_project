let AWS = require("aws-sdk");

//Create new DocumentClient
let documentClient = new AWS.DynamoDB.DocumentClient();
var indexName='currency-timestamp-index'
//Returns all of the connection IDs
module.exports.getConnectionIds = async () => {
    let params = {
        TableName: "WebSocketClients"
    };
    return documentClient.scan(params).promise();
};

//Deletes the specified connection ID
module.exports.deleteConnectionId = async (connectionId) => {
    console.log("Deleting connection Id: " + connectionId);

    let params = {
        TableName: "WebSocketClients",
        Key: {
            ConnectionId: connectionId
        }
    };
    return documentClient.delete(params).promise();
};

//Returns all of the connection IDs
module.exports.getCurrencyData = async () => {

        let paramsGBP = {

                        TableName: 'CurrencyData',
                        Limit: 100,
                        IndexName: indexName,
                        KeyConditionExpression: 'currency = :currency  ',
                        ScanIndexForward: false,
                             ExpressionAttributeValues: {
                         ':currency': 'GBP'
                     }

                    } 
     let paramsPLN = {

                        TableName: 'CurrencyData',
                        Limit: 100,
                        IndexName: indexName,
                        KeyConditionExpression: 'currency = :currency  ',
                        ScanIndexForward: false,
                             ExpressionAttributeValues: {
                         ':currency': 'PLN'
                     }

                    } 
   let paramsAUD = {

                        TableName: 'CurrencyData',
                        Limit: 100,
                        IndexName: indexName,
                        KeyConditionExpression: 'currency = :currency  ',
                        ScanIndexForward: false,
                             ExpressionAttributeValues: {
                         ':currency': 'AUD'
                     }

                    }
   let paramsCAD = {

                        TableName: 'CurrencyData',
                        Limit: 100,
                        IndexName: indexName,
                        KeyConditionExpression: 'currency = :currency  ',
                        ScanIndexForward: false,
                             ExpressionAttributeValues: {
                         ':currency': 'CAD'
                     }

                    }
   let paramsEUR = {

                        TableName: 'CurrencyData',
                        Limit: 100,
                        IndexName: indexName,
                        KeyConditionExpression: 'currency = :currency  ',
                        ScanIndexForward: false,
                             ExpressionAttributeValues: {
                         ':currency': 'EUR'
                     }

                    }
    



     
     
     let promise = async (params) => {
         return new Promise((resolve, reject) => {
          
             documentClient.query(params, (err, data) => {
                 if (err) {
                     reject((err));
                 } else {
                     let response = {
                         statusCode: 200,
                         body: data
                     };
                     resolve(response);
                 }
             });
         });
     };
     
     

     return Promise.all([
         promise(paramsGBP),
         promise(paramsPLN),
         promise(paramsAUD),
         promise(paramsCAD),
         promise(paramsEUR)
         
         ]);
}