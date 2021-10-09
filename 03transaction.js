//Transaction
//ACID:Atomicity原子性 Consistency一致性 Isolation隔离性 Durability持久性

import { MongoClient } from 'mongodb';
const uri = "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.yiyle.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        console.log(
            createReservationDocument(
                "Infinite Views",
                [new Date("2021-12-31"), new Date("2022-01-01")],
                { pricePerNight: 180, specialRequests: "Late checkout", breakfastIncluded: true }
            )
        )
    } catch (err) {
        console.error(err)
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.error);

//Add functions that make DB calls here
function createReservationDocument(nameOfListing, reservationDates, reservationDetails) {
    let reservation = {
        name: nameOfListing,
        dates: reservationDates
    };
    for (let detail in reservationDetails) {
        reservation[detail] = reservationDetails[detail]
    }

    return reservation;
}

async function purchaseBook(client, userId, bookId, quantity, status) {

    /**
     * The orders collection in the book-store database
     */
    const ordersCollection = client.db("book-store").collection("orders");

    /**
     * The inventory collection in the book-store database
     */
     const inventoryCollection = client.db("book-store").collection("inventory");

    // Step 1: Start a Client Session
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html#startSession for the startSession() docs
    const session = client.startSession();

    // Step 2: Optional. Define options for the transaction
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    try {
        // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
        // Note: The callback for withTransaction MUST be async and/or return a Promise.
        // See https://mongodb.github.io/node-mongodb-native/3.6/api/ClientSession.html#withTransaction for the withTransaction() docs        
        const transactionResults = await session.withTransaction(async () => {

            // Important:: You must pass the session to each of the operations   

            // Update the inventory to reflect the book has been sold
            const updateInventoryResults = await inventoryCollection.updateOne(
                { _id: bookId },
                { $inc: { numberInStock: quantity * -1 } },
                { session });
            console.log(`${updateInventoryResults.matchedCount} document(s) found in the inventory collection with _id ${bookId}.`);
            console.log(`${updateInventoryResults.modifiedCount} document(s) was/were updated.`);
            if (updateInventoryResults.modifiedCount !== 1) {
                await session.abortTransaction();
                return;
            }

            // Record the order in the orders collection
            const insertOrderResults = await ordersCollection.insertOne(
                { "userId": userId , bookId: bookId, quantity: quantity, status: status },
                { session });
            console.log(`New order recorded with the following id: ${insertOrderResults.insertedId}`);

        }, transactionOptions);

        if (transactionResults) {
            console.log("The order was successfully processed. Database operations from the transaction are now visible outside the transaction.");
        } else {
            console.log("The order was not successful. The transaction was intentionally aborted.");
        }
    } catch (e) {
        console.log("The order was not successful. The transaction was aborted due to an unexpected error: " + e);
    } finally {
        // Step 4: End the session
        await session.endSession();
    }

}