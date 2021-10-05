import { MongoClient } from 'mongodb';
// const uri = "localhost:27017";
const uri = "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.yiyle.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        // await listDatabases(client);

        // await createListing(client,{
        //     name:"xiaoming",
        //     summary:"hello xiaoming",
        //     bedrooms:1,
        //     bed_type:"Real Bed"
        // })

        // await createmultiListing(client,[
        //     {
        //         name:"xiaoming1",
        //         summary:"hello xiaoming1",
        //         bedrooms:11,
        //         bed_type:"Real Bed1"
        //     },
        //     {
        //         name:"xiaoming2",
        //         summary:"hello xiaoming2",
        //         bedrooms:12,
        //         bed_type:"Real Bed2"
        //     },
        //     {
        //         name:"xiaoming3",
        //         summary:"hello xiaoming3",
        //         bedrooms:13,
        //         bed_type:"Real Bed3"
        //     }
        // ])

        await findOneListingByName(client,"xiaoming2");

    } catch(err) {
        console.error(err)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.error);

//connect to the database
async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();
    console.log("databases:")
    databasesList.databases.forEach(db => {
        // console.log(`- ${db.name}`)
        console.log(`- ${db.name}`)
    })
}

// insertOne()
async function createListing(client,newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the followed id: ${result.insertedId}`)
}

// insertMany()
async function createmultiListing(client,newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListing);
    console.log(`${result.count} lists have been inserted`)
    console.log(result.insertedIds)
}

//findOne()
async function findOneListingByName(client,nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name:nameOfListing});
    if(result){
        console.log(`Found a listing in the collection with the name ${nameOfListing}`)
        console.log(result)
    }else{
        console.log(`could not find a listing in the collection with the name ${nameOfListing}`)
    }
}

//find()
async function findListingsByName(client,nameOfListing){
    
}