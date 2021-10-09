//Transaction
//ACID:Atomicity原子性 Consistency一致性 Isolation隔离性 Durability持久性

import { MongoClient } from 'mongodb';
// const uri = "localhost:27017";
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