//Import external library with websocket functions
let ws = require('websocket');
const AWS = require("aws-sdk");
//Hard coded domain name and stage - use when pushing messages from server to client
let domainName = "wss://2p3siz4ef9.execute-api.us-east-1.amazonaws.com";   
let stage = "prod";

exports.handler = async (event) => {
    
    try {
        if(event["Records"]){ //dynamo db New Record
        for (var record of event.Records) {
          if (record.eventName == "INSERT" || record.eventName == 'REMOVE') {
          
            const newImages = event.Records.map(
                (record) => AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
            );
            
            var ddData = newImages[0]
                 domainName = '2p3siz4ef9.execute-api.us-east-1.amazonaws.com'
        stage = 'prod'
     
       

        //Get promises message to connected clients
        let sendMsgPromises = await ws.getNewMessagePromises( domainName, stage,ddData);

        //Execute promises
        await Promise.all(sendMsgPromises);
            
          }
        }
           
        }else{
        domainName = event.requestContext.domainName;
        stage = event.requestContext.stage;
        var connectionId=event.requestContext.connectionId
        console.log("Domain: " + domainName + " stage: " + stage+ " connectionId: " + connectionId);

        //Get promises message to connected clients
        let sendMsgPromises = await ws.getSendMessagePromises( domainName, stage,connectionId);

        //Execute promises
        await Promise.all(sendMsgPromises);
        }
    }
    catch(err){
        console.log("ERROR: " + JSON.stringify(err));
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    //Success
    return { statusCode: 200, body: "Data sent successfully." };
};