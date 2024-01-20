const express = require("express");
const app = express();

const cors = require('cors');

const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://Hari: aPxVCb1J3qbBPket@cluster0.yow2osx.mongodb.net/';


app.use(express.json());
app.use(cors({
    origin:"*"
}))

app.post("/flights", async (req, res) => {
    try {
        const request = req.body;
        const connection = await MongoClient.connect(url);
        const db = connection.db("flight-ticket-booking");
        const flight = await db.collection("flights").find({from:request.from,to:request.to}).toArray();
        if (flight.length>0){
            res.json(flight);
        }
        else{
            res.send("no flights");
        }
        await connection.close();
    }
    catch (err) {
        res.send(err);
    }
});

app.listen(4001);