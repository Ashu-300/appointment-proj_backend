const express = require('express') ;
const router = express.Router() ;
const {signup , loginpage , allBookings, handleCheckAuth ,
     salonInfo , allCompletedBookings , confirmBooking, completeBooking } = require('../controllers/SalonController') ;

router.get('/', salonInfo)
router.get('/:email/allbooking' , allBookings) ;
router.post('/signup/submit' , signup) ;
router.post('/login/submit' , loginpage) ;
router.get('/checkAuth', handleCheckAuth);
router.get('/:email/completed' , allCompletedBookings) ;
router.put('/booking/confirm/:id' , confirmBooking ) ;
router.put('/booking/complete/:id' , completeBooking ) ;


module.exports = router ;