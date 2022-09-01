const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dbUrl = "mongodb://localhost:27017/shopmartProduct";
const Product = require('./productSchema');
const amqp = require('amqplib/callback_api');
const isAuthenticated = require('../shared-services/Auth');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
var ch;

amqp.connect('amqp://localhost',(err,connection)=>{
    if(err)console.log(err)
    else{
        connection.createChannel((err,channel)=>{
            if(err)console.log(err)
            else {ch = channel;    
                
    ch.assertQueue("ORDER",{
        durable:false,
    });
    ch.assertQueue("AWSUPLOADS",{
        durable:false,
    });
                console.log("Channel and connection created")
            }


        });
    }
})


app.use(express.json());
app.use(upload.any());

mongoose.connect(dbUrl,()=>{
    console.log("Database connected!");
});

app.post('/products/create', isAuthenticated,async (req,res)=>{

    const {name,description,price} = req.body;
    const user = req.user.email;
    var newProduct = new Product({
        name,
        description,
        price,
        publishedBy:user,
        
    });
    await newProduct.save();

    let filebuffers = [];
    req.files.forEach((file)=>{
        filebuffers.push({buffer:file.buffer,name:file.originalname})
    });
        const payload = {
            Files:filebuffers,
            productId:newProduct._id
        }
        console.log(payload);
       // const d = fs.readFileSync(req.file.path,{encoding:'base64'});
      await ch.sendToQueue("AWSUPLOADS",Buffer.from(JSON.stringify(payload)))

    
    res.status(200).json(newProduct);

});

app.get('/products',async (req,res)=>{


    console.log(req.user);
    const products =await Product.find({ispublished:true});
    res.status(200).json(products);

});

app.post('/products/buy',isAuthenticated,async (req,res)=>{

    const {productids} = req.body;
    useremail = req.user.email;

    var products = await Product.find({_id:{$in:productids}});

    let total =0;
    for(let i =0;i<products.length;i++){
        total = products[i].price + total;
    }
    const order = {
        products:products,
        total_Price:total
    }
    const payload = {useremail,order}

    ch.sendToQueue("ORDER",new Buffer.from(JSON.stringify(payload)));

    res.status(200).json({message:"Order Placed!"});

});

const port = 7070;

app.listen(port,(err)=>{
    if(err) console.log(err)
    else console.log(`Product service is on ${port}`);
})