const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const dbUrl = process.env.Db_URL;
const Order = require('./orderSchema');
const amqp = require('amqplib/callback_api');
const isAuthenticated = require('../shared-services/Auth');

var ch;

amqp.connect(process.env.AMQP_URL,(err,connection)=>{
    if(err)console.log(err)
    else{
        connection.createChannel((err,channel)=>{
            if(err)console.log(err)
            else {ch = channel;    
                
    ch.assertQueue("ORDER",{
        durable:false,
    });
    ch.assertQueue("EMAILSERVICE",{durable:false});

                console.log("Channel and connection created");
                
  ConfirmOrders();
            }
        });
    }
});


 const ConfirmOrders = ()=>{

    ch.consume("ORDER",async (orderDetails)=>{

        const {order,useremail} = JSON.parse(orderDetails.content);
        var newOrder = new Order({
            products: order.products,
            userEmail: useremail,
            total_Price: order.total_Price,
            isConfirmed:true
        });
        await newOrder.save()
        console.log("========================== ORDER START =====================");
        console.log(newOrder);
        console.log("========================== ORDER END =====================+==");
        ch.ack(orderDetails);
        const EmailServicePayload = {
            newOrder,
        }
        ch.sendToQueue("EMAILSERVICE",new Buffer.from(JSON.stringify(EmailServicePayload)));
        
        
    });
}




app.use(express.json());

mongoose.connect(dbUrl,()=>{
    console.log("Database connected!");
});



app.get('/order/', isAuthenticated,async (req,res)=>{

    const email = req.user.email;
    const orders = await Order.find({userEmail:email});
    res.status(200).json(orders);

})

const port = 8082;

app.listen(port,(err)=>{
    if(err) console.log(err)
    else console.log(`Order service is on ${port}`);
})