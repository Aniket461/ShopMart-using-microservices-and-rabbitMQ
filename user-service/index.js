const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./userSchema')

const dbUrl = "mongodb://localhost:27017/shopmartUser";

app.use(express.json());

mongoose.connect(dbUrl,()=>{
    console.log("User Database Connected")
});

app.post('/user/login',async (req,res)=>{

    const {email,password} = req.body

    const user = await User.findOne({email:email});
    console.log(user)
    if(!user){
        return res.status(500).json({message:"Email ID does not exist, Please try again"});
    }
    else{
        const result = bcrypt.compareSync(password,user.password) 

        if(result){

            const payload = {
                email:user.email,
                name: user.firstname + " " + user.lastname
            }

            jwt.sign(payload,"secret",(err,token)=>{
                if(err) res.status(500).json({"message":err});
                else{
            res.status(200).json({"user":user,"token":token});
                }
            })
        }
        else{
            res.status(500).json({"message":"Invalid login credentials"});
        }
    }


});



app.post('/user/register',async (req,res) => {

    const {firstname,lastname,email,phoneNumber,password,addressLine1,addressLine2,City,State,Country} = req.body;

    const user = await User.find({email:email})
    console.log(user);
    if(user.length != 0){
        return res.status(500).json({message:"User with the entered email id already exists, please login!"});
    }

    const salt = bcrypt.genSaltSync(10);
    const newpassword = bcrypt.hashSync(password,salt);

    var newUser = new User({
      
        email:email,
        password:newpassword,
        firstname:firstname,
        lastname:lastname,
        phoneNumber:phoneNumber,
        addressLine1:addressLine1,
        addressLine2:addressLine2,
        City:City,
        State:State,
        Country:Country
    });

  const ress = await newUser.save();
  console.log(ress);
   res.status(200).json({"message":`User Successfully Created: ${newUser}`});

});


const port = 6060;
app.listen(port,()=>{
    console.log(`User service is running on port: ${port}`);
})

