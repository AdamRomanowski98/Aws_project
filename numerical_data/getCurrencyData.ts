const axios = require("axios");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");
dotenv.config();

AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

async function putData(Currency: string, Timestamp: number, price: number) {
    //Create new DocumentClient
    let documentClient = new AWS.DynamoDB.DocumentClient();

    //Table name and data for table
    let params = {
        TableName: "CurrencyData",
        Item: {
            "currency": Currency,
            "timestamp":Timestamp,
            "currencyPrice": price
        }
    }

    //Store data in DynamoDB and handle errors
    try {
        let result = await documentClient.put(params).promise();
        console.log("Data uploaded successfully: " + JSON.stringify(result));
    } catch (err) {
        console.error("ERROR uploading data: " + JSON.stringify(err));
    }
}

/* Downloads data from web service */
class DataDownloader {
    url: string;

    constructor(url: string){
        this.url = url;
    }

    async getData(){
        return axios.get(this.url).then(resp => {
            return(resp.data);
        });    
    }
}

/* Contains the main logic of the application */
class downloadData {
    dataDownloader: DataDownloader;

    constructor(){
        //Create instances of classes
        this.dataDownloader = new DataDownloader("https://api.currencyapi.com/v3/range" +
        "?apikey=" + process.env.CURRENCY_API_KEY + 
        "&base_currency=USD" +
        "&datetime_start=2021-01-01T00:00:00Z" +
        "&datetime_end=2022-01-01T23:30:00Z" +
        "&currencies=EUR,PLN,GBP,CAD,AUD"
        );
    }

    async getData(){
        try{
            //Get promise to download data
            let downloadPromise = this.dataDownloader.getData();

            //Execute promise and wait for result.
            let data: object = await downloadPromise;

            let stringData: any = data['data'];
            
            stringData.forEach(function(key) {
                let timestamp: any = key.datetime;
                timestamp = timestamp.split("T")[0];
                timestamp = timestamp.split("-").reverse().join("-");
                timestamp = timestamp.split("-");
                let newDate: Date = new Date(timestamp[2], timestamp[1] - 1, timestamp[0]);
                let final: number = newDate.getTime();

                let currencies: string[] = Object.keys(key['currencies'])

                for(let i: number = 0; i<Object.keys(key['currencies']).length; i++){
                    console.log(currencies[i], final, key['currencies'][currencies[i]]['value'])
                    putData(currencies[i], final, key['currencies'][currencies[i]]['value']);
                }
            });
        }
        catch(err){
            console.error(err);
        }
    }
}

let main: downloadData = new downloadData();
main.getData();