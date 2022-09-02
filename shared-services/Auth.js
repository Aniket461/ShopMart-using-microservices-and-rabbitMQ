const jwt = require('jsonwebtoken');
require('dotenv').config({path:'./.env'});


module.exports = async function isAuthenticated(req,res,next){

    if(!req.headers["authorization"]){
        res.status(500).json({"message":"Something went wrong with login, please login again from headers"});
    }

    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            res.status(500).json({"message":"Something went wrong with login, please login again from verified"});
        }
        else{
            console.log(user);
            req.user = user;
          next();
        }
    });
}


