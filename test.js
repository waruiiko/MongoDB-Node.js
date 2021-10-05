import { MongoClient } from 'mongodb';
// const uri = "localhost:27017";
const uri = "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.yiyle.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        await listDatabases(client);
    } catch(err) {
        console.error(err)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.error);
console.log("nice")

async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();
    console.log("databases:")
    databasesList.databases.forEach(db => {
        // console.log(`- ${db.name}`)
        console.log(`- ${db.name}`)
    })
}
