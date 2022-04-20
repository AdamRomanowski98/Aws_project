let AWS = require("aws-sdk");

//Create instance of Comprehend
let comprehend = new AWS.Comprehend();

//Create new DocumentClient
let documentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    for(let record of event.Records){
        if(record.eventName === "INSERT"){
            let getSentiment = async function Sentiment(){
                return new Promise ((resolve, reject) =>{
                    //Parameters for call to AWS Comprehend
                    let params = {
                        LanguageCode: "en",
                        Text: record.dynamodb.NewImage.text.S
                    };
            
            
                    //Call comprehend to detect sentiment of text
                    comprehend.detectSentiment(params, (err, data) => {
                        //Log result or error
                        if (err) {
                            console.log("\nError with call to Comprehend:\n" + JSON.stringify(err));
                        }
                        else {
                            console.log("\nSuccessful call to Comprehend:\n" + JSON.stringify(data));
                            resolve(data);
                        }
                    });
                });
            };
            
            let uploadSentiment = async function uploadSentiment(){
                
                
                let data = await getSentiment();
                let tweetId = record.dynamodb.NewImage.id.N;
                let createdAt = parseInt(record.dynamodb.NewImage.CreatedAt.N);
                let currency = record.dynamodb.NewImage.currency.S;
                let sentiment = JSON.stringify(data['Sentiment']);
                let positive = JSON.stringify(data['SentimentScore']['Positive']);
                let negative = JSON.stringify(data['SentimentScore']['Negative']);
                let neutral = JSON.stringify(data['SentimentScore']['Neutral']);
                let mixed = JSON.stringify(data['SentimentScore']['Mixed']);
                
                positive = Math.round(positive * 100) / 100;
                negative = Math.round(negative * 100) / 100;
                neutral = Math.round(neutral * 100) / 100;
                mixed = Math.round(mixed * 100) / 100;
   
                console.log(tweetId);    
                //Table name and data for table
                let uploadParams = {
                    TableName: "TwitterSentiment",
                    Item: {
                        id: tweetId,
                        createdAt: createdAt,
                        currency: currency,
                        sentiment: sentiment,
                        positive: positive,
                        negative: negative,
                        neutral: neutral,
                        mixed: mixed
                       
                    }
                };
            
                //Store data in DynamoDB and handle errors
                return new Promise ((resolve, reject) =>{
                    documentClient.put(uploadParams, (err, data) => {
                        if (err) {
                            reject("Unable to add item: " +  JSON.stringify(err));
                        }
                        else {
                            resolve("Item added to table with id: " + tweetId);
                        }
                    });
                });
            };
            let response = await uploadSentiment();
         
        }
    }
};