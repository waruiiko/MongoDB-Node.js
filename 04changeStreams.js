// https://www.mongodb.com/developer/quickstart/nodejs-change-streams-triggers/
//connect with 04changeStreamsTestData.js
const { MongoClient } = require('mongodb');
// import { MongoClient } from 'mongodb';

const stream = require('stream');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    const uri = "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.yiyle.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        const pipeline = [
            {
                '$match': {
                    'operationType': 'insert',
                    'fullDocument.address.country': 'Australia',
                    'fullDocument.address.market': 'Sydney'
                },
            }
        ];

        // Make the appropriate DB calls
        // await monitorListingsUsingEventEmitter(client,15000,pipeline);

        // await monitorListingsUsingHasNext(client, 15000, pipeline);

        await monitorListingsUsingStreamAPI(client,15000, pipeline);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

// Add functions that make DB calls here

//Create a Helper Function to Close the Change Stream
// Regardless of how we monitor changes in our change stream, we will want to close the change stream after a certain amount of time. Let's create a helper function to do just that.
function closeChangeStream(timeInMs = 60000, changeStream) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Closing the change stream");
            changeStream.close();
            resolve();
        }, timeInMs)
    })
};

async function monitorListingsUsingEventEmitter(client, timeInMs = 60000, pipeline = []) {
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);

    changeStream.on('change', (next) => {
        console.log(next);
    });

    await closeChangeStream(timeInMs, changeStream);
}

//hasNext()
async function monitorListingsUsingHasNext(client, timeInMs = 60000, pipeline = []) {
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);
    closeChangeStream(timeInMs, changeStream);

    try {
        while (await changeStream.hasNext()) {
            console.log(await changeStream.next());
        }
    } catch (error) {
        if (changeStream.isClosed()) {
            console.log("The change stream is closed. Will not wait on any more changes.")
        } else {
            throw error;
        }
    }
}

//using Node's Stream API
async function monitorListingsUsingStreamAPI(client, timeInMs = 60000, pipeline = []) {
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);

    changeStream.stream().pipe(
        new stream.Writable({
            objectMode: true,
            write: function (doc, _, cb) {
                console.log(doc);
                cb();
            }
        })
    );

    await closeChangeStream(timeInMs,changeStream)
}