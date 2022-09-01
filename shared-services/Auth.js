const jwt = require('jsonwebtoken');


module.exports = async function isAuthenticated(req,res,next){

    if(!req.headers["authorization"]){
        res.status(500).json({"message":"Something went wrong with login, please login again"});
    }

    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token,"secret",(err,user)=>{
        if(err){
            res.status(500).json({"message":"Something went wrong with login, please login again"});
        }
        else{
            console.log(user);
            req.user = user;
          next();
        }
    });
    console.log(token);
}


