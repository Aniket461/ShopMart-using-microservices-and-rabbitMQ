const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.Db_URL;
const Order = require('./orderSchema');
const amqp = require('amqplib/callback_api');
const nodemailer = require('nodemailer');
const port = 9090;
var ch;

app.use(express.json());

mongoose.connect(dbUrl,()=>{
    console.log("Database connected!");
});




amqp.connect(process.env.AMQP_URL,(err,connection)=>{
    if(err)console.log(err)
    else{
        connection.createChannel((err,channel)=>{
            if(err)console.log(err)
            else {ch = channel;    
                
    ch.assertQueue("EMAILSERVICE",{durable:false});

                console.log("Channel and connection created");
                
  SendEmailService();
            }
        });
    }
});


const sendEmail = async (orderId,products, total_Price, email)=>{


    let message = `<h3>This is the confirmation for your order number: ${orderId}<h3>
    <h3>You have ordered: <h3>
    <table border="1">
    <tr><th>Product ID</th><th>Name</td><th>Price</th></th>
    ${products.map((element => {
      
                return `<tr><td>${element._id}</td><td>${element.name}</td> <td>${element.price}</td></tr>`
    })).join("")
  }
    <tr><td colspan="2">Total Value:</td> <td>${total_Price}</td></tr>
</table>
    <h2 style="text-align: center;">Thank you for shopping with SHOPMART!</h2>
    `.toString();

var transporter = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
      user: 'surveaniket461@hotmail.com',
      pass: 'Australia@20'
    }
  });
  
  var mailOptions = {
    from: 'surveaniket461@hotmail.com',
    to: email,
    subject: `Order Confirmation for order no ${orderId}`,
    html: message
  };
  
  const res = await transporter.sendMail(mailOptions);
 
   if(res.accepted.length !=0){
     return true
   }
   else{
     return false;
   }

}


const SendEmailService = ()=>{

    ch.consume("EMAILSERVICE",async (orderDetails)=>{

        const order = JSON.parse(orderDetails.content);

        var details = await Order.findOne({_id:order.newOrder._id});
        
       var response = await sendEmail(details._id,details.products, details.total_Price, details.userEmail);

        if(response){

         await Order.updateOne({_id:details._id},{$set:{isEmailSent:true,Status:"Confirmed"}});

            console.log("================= Email Service Start ====================")
        console.log(`Order with Order ID: ${details._id} is confirmed and Email is sent to the User`);
        console.log("================= Email Service End ====================")
        
            ch.ack(orderDetails);
        }
        else{
            console.log(`Confirmation email failed for order ID ${order.orderId}`)
        }

        
    });

}



app.listen(port,()=>{
    console.log(`Email service is running on port ${port}`);
})
