require('dotenv').config();
const jwt = require('jsonwebtoken') ;
function setCustomer(customer){
    return jwt.sign({
        _id: customer._id,
        email : customer.email
    } , process.env.SECRET ) ;
}
function getCustomer(token){
    if(!token) return null ;
   return jwt.verify(token , process.env.SECRET) ;  
}


module.exports = {
    setCustomer,
    getCustomer,
    
}