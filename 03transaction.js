//Transaction
//ACID:Atomicity原子性 Consistency一致性 Isolation隔离性 Durability持久性

import { MongoClient } from 'mongodb';
const uri = "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.yiyle.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        // console.log(
        //     createReservationDocument(
        //         "Infinite Views",
        //         [new Date("2021-12-31"), new Date("2022-01-01")],
        //         { pricePerNight: 180, specialRequests: "Late checkout", breakfastIncluded: true }
        //     )
        // )

        await createReservation(client,
            "xiaomingbian@example.com",
            "Infinite Views",
            [new Date("2021-12-31"), new Date("2022-01-01")],
            { pricePerNight: 180, specialRequests: "Late checkout", breakfastIncluded: true }
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

async function createReservation(client, userEmail, nameOfListing, reservationDates, reservationDetails) {

    /**
     * The orders collection in the book-store database
     */
    const usersCollection = client.db("sample_airbnb").collection("users");

    /**
     * The inventory collection in the book-store database
     */
    const listingsAndReviewsCollection = client.db("sample_airbnb").collection("listingsAndReviews");

    const reservation = createReservationDocument(nameOfListing, reservationDates, reservationDetails);

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
            const usersUpdateResults = await usersCollection.updateOne(
                { email: userEmail },
                { $addToSet: { reservations: reservation } },
                { session });
            console.log(`${usersUpdateResults.matchedCount} document(s) found in the inventory collection with the email address ${userEmail}.`);
            console.log(`${usersUpdateResults.modifiedCount} document(s) was/were updated to include the reservation.`);
            // if (usersUpdateResults.modifiedCount) {
            //     await session.abortTransaction();
            //     return;
            // }

            const isListingReservedResults = await listingsAndReviewsCollection.findOne(
                { name: nameOfListing, dateReserved: { $in: reservationDates } }, { session }
            )

            if (isListingReservedResults) {
                await session.abortTransaction();
                console.error("This listing is already reserved for at least one of the given dates. The reservation could not be created.")
                console.error("Any operations that already occurred as part of this transaction will be rolled back.")
                return;
            }

            const listingsAndReviewsUpdateResults = await listingsAndReviewsCollection.updateOne(
                { name: nameOfListing },
                { $addToSet: { datesReerved: { $each: reservationDates } } },
                { session }
            )

            console.log(`${listingsAndReviewsUpdateResults.matchedCount} document(s) found in the listingsAndReviews collection with the name ${nameOfListing}`);
            console.log(`${listingsAndReviewsUpdateResults.modifiedCount} document(s) was/were updated to include the reservation dates.`)

        }, transactionOptions);

        if (transactionResults) {
            console.log("The reservation was successfully created. Database operations from the transaction are now visible outside the transaction.");
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