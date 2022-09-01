const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name:String,
    description:String,
    price:Number,
    created_At:{
        type:Date,
        default:Date.now()
    },
    ispublished:{
        type:Boolean,
        default:false,
    },
    publishedBy:String,
    productImage1:String,
    productImage2:String,
    productImage3:String,
    productImage4:String,
    Status:{type:String,default:"Pending"}

});

module.exports = Product = mongoose.model("Product",ProductSchema);