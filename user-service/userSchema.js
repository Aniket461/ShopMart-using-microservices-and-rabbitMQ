const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    firstname:String,
    lastname:String,
    email:{
        type:String,
        unique:true
    },
    phoneNumber:String,
    createdAt:{

        type:Date,
        default:Date.now()
    },
    password:String,
    addressLine1:String,
    addressLine2:String,
    City:String,
    State:String,
    Country:String

});

module.exports = User = mongoose.model("User",userSchema);