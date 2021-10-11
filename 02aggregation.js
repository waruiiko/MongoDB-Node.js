// import { MongoClient } from 'mongodb';
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.yiyle.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        await printCheapestSuburbs(client,"Australia","Sydney",10)
    } catch (err) {
        console.error(err)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.error);

//Add functions that make DB calls here
async function printCheapestSuburbs(client,country,market,maxNumberToPrint) {
    const pipeline = [
        {
            '$match': {
                'bedrooms': 1,
                'address.country': country,
                'address.market': market,
                'address.suburb': {
                    '$exists': 1,
                    '$ne': ''
                },
                'room_type': 'Entire home/apt'
            }
        }, {
            '$group': {
                '_id': '$address.suburb',
                'averagePrice': {
                    '$avg': '$price'
                }
            }
        }, {
            '$sort': {
                'averagePrice': 1
            }
        }, {
            '$limit': maxNumberToPrint
        }
    ];

    const aggCursor = client.db("sample_airbnb").collection("listingsAndReviews").aggregate(pipeline)

    await aggCursor.forEach(airbnbListing=>{
        console.log(`${airbnbListing._id}:${airbnbListing.averagePrice}`)
    })
}