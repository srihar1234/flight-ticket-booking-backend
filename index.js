const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin:"*"
}))


const { MongoClient } = require('mongodb');
const url = process.env.DATABASE_URL;


app.post("/orders",async(req,res)=>{
    try{
        const instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
          });
          const amount = req.body.amount
          const options = {
            amount:amount*100,
            currency:"INR",
            receipt:crypto.randomBytes(10).toString("hex"),
          };

          instance.orders.create(options, function(err, order) {
            if(err){
                console.log(err);
                return res.status(500).json({message:"Something went wrong"});
            }
            res.status(200).json({data:order});
          });
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Serever Error"});
    }
});


app.post("/verify",async(req,res)=>{
    try{
        const{
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature} = req.body;
        const sign = razorpay_order_id+"|"+razorpay_payment_id;
        const expectedSign = crypto
           .createHmac("sha256",'hWvkYEMrO43SK7cehBHa0LRA') 
           .update(sign.toString())
           .digest("hex"); 

           if (razorpay_signature === expectedSign){
            return res.status(200).json({message:"Payment verified successfully"});
           }else{
            return res.status(400).json({message:"Invalid signature sent"});
           }
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Serever Error"});
    }
})



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