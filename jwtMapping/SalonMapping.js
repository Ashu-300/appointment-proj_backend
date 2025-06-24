const jwt = require('jsonwebtoken') ;
require('dotenv').config()
function setSalon(salon){
    return jwt.sign({
        _id: salon._id,
        email : salon.email
    } , process.env.SECRET ) ;
}
function getSalon(token){
    if(!token) return null ;
   return jwt.verify(token , process.env.SECRET ) ;
}


module.exports = {
    setSalon,
    getSalon,
    
}