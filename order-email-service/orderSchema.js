const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    

    products:[{
        _id:String,
        name:String,
        price:Number,
    }],

    userEmail: String,
    total_Price:Number,
    created_At:{
        type:Date,
        default:Date.now()
    },
    isEmailSent:
    {   type:Boolean,
        default:false
    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    Status:{
        type:String,
        default:"Processing",
    }
});

module.exports = Order = mongoose.model("Order",OrderSchema);