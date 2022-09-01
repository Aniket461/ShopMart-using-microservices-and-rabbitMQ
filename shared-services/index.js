const express = require('express');
const app = express();
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const AWS = require('aws-sdk');
const dbUrl = "mongodb://localhost:27017/shopmartProduct";
const Product = require('./productSchema');

app.use(express.json());
var ch;

const s3 = new AWS.S3({

    accessKeyId: "AKIA6MRROXHTAUOBVAWJ",
    secretAccessKey: "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"

});
mongoose.connect(dbUrl,()=>{
    console.log("Database connected!");
});


amqp.connect('amqp://localhost',(err,connection)=>{
    if(err)console.log(err)
    else{
        connection.createChannel((err,channel)=>{
            if(err)console.log(err)
            else {ch = channel;    
                
    ch.assertQueue("AWSUPLOADS",{durable:false});

                console.log("Channel and connection created");
                
  UploadImages();
            }
        });
    }
});

const UploadImages = async()=>{

    ch.consume("AWSUPLOADS",async (images)=>{        
    console.log("============ Starting Image upload =====================")
        console.log(JSON.parse(images.content));

        let res = 0;
        let ImageUrls = [];

        var result = JSON.parse(images.content);
        console.log(result);
        const productId = result.productId;
        result.Files.forEach(async (data) => {

                 const fileName = data.name.toString().replace(/ /g, "");
        const params = {
            Bucket: "nodepractice",
            Key:fileName,
            Body:Buffer.from(data.buffer)
        }
       await s3.upload(params, async(err,data)=>{

            if(err){
                console.log(`S3 error is ${err}`);
            }
            if(data){
                res = res +1;
                console.log(`Data from s3 is ${JSON.stringify(data)}`);      
        console.log(res);
        ImageUrls.push(data.Location);

        if(res === result.Files.length){

            if(ImageUrls.length != 4){
                await Product.updateOne({_id:productId},{$set:{Status:"Error"}});
                ch.ack(images);
            }
            else{

               await Product.updateOne({_id:productId},
                    {$set:{Status:"Success",ispublished:true,productImage1:ImageUrls[0],
                    productImage2:ImageUrls[1],productImage3:ImageUrls[2],productImage4:ImageUrls[3]}}); 

                    ch.ack(images);
            }
        }            }

        });
        });
        
        console.log("============ Ending Image upload =====================")
    })

}


const port = 5050;

app.listen(port,()=>{
    console.log(`Shared Services are running on port:${port}`);
})