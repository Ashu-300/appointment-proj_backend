const express = require('express') ;
const router = express.Router() ;
const {signuppage , loginpage , getAllSalons , newBooking , myBooking ,
     info } = require('../controllers/CustomerController')

router.get('/' , getAllSalons) ;
router.post('/signup/submit' , signuppage) ;
router.post('/login/submit' , loginpage) ;
router.post('/newbooking' , newBooking ) ;
router.get('/mybooking/:email' , myBooking);
router.get('/info' , info) ;
 
module.exports = router ;
  