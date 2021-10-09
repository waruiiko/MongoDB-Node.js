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

        // await findOneListingByName(client,"xiaoming2");

        // await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client,{
        //     minimumNumberOfBedrooms:4, 
        //     minimumNumberOfBathrooms:2, 
        //     maximumNumberOfResults:5
        // })

        // await updateListingByName(client,"xiaoming3",{bedrooms:2,bed_type:"Real Beds"})

        // await upsertListingByName(client, "xiaoming3", { bedrooms: 2, bed_type: "Real Beds", property_type: "House" })

        // await updateAllListingsToHavePropertyType(client)

        // await deleteListingByName(client, "xiaoming3")

        // await deleteListingsScrapedBeforeDate(client,new Date("2019-02-15"));

        await deleteListings(client)

    } catch (err) {
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
async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the followed id: ${result.insertedId}`)
}

// insertMany()
async function createmultiListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListing);
    console.log(`${result.count} lists have been inserted`)
    console.log(result.insertedIds)
}

//findOne()
async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });
    if (result) {
        console.log(`Found a listing in the collection with the name ${nameOfListing}`)
        console.log(result)
    } else {
        console.log(`could not find a listing in the collection with the name ${nameOfListing}`)
    }
}

//find()
async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = await client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms: { $gte: minimumNumberOfBedrooms },
        bathrooms: { $gte: minimumNumberOfBathrooms },

    }).sort({ last_review: -1 }).limit(maximumNumberOfResults);

    const results = await cursor.toArray();
    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            const date = new Date(result.last_review).toDateString()
            console.log();
            console.log(`${i + 1}. name:${result.name}`);
            console.log(`   _id:${result._id}`);
            console.log(`   bedrooms:${result.bedrooms}`)
            console.log(`   bathrooms:${result.bathrooms}`)
            console.log(`   most recent review date: ${date}`);
            // console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }

}

//updateOne()
async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({ name: nameOfListing }, { $set: updatedListing });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`)
    console.log(`${result.modifiedCount} document(s) was/were updated.`)
}

//upsert()
async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({ name: nameOfListing }, { $set: updatedListing }, { upsert: true });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`)
    console.log(`${result.modifiedCount} document(s) was/were upserted.`)
}

//updateMany()
async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({ property_type: { $exists: false } }, { $set: { property_type: "Unknow" } })

    console.log(`${result.matchedCount} document(s) matched the query criteria.`)
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//deleteOne()
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({ name: nameOfListing })

    console.log(`${result.deletedCount} document(s) was/were deleted.`)
}

//deleteMany()
async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany(
        {"last_scraped": { $lt: date }}
    )
    console.log(`${result.deletedCount} document(s) was/were deleted.`)
}
async function deleteListings(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany(
        {"property_type":"Unknow"}
    )
    console.log(`${result.deletedCount} document(s) was/were deleted.`)
}