const Salon = require('../models/SalonModel') ;
const Booking = require('../models/BookingModel')
const {setSalon} = require('../jwtMapping/SalonMapping') ;
const mongoose = require('mongoose');


async function signup(req , res){
    const body = req.body ;
    const salon = await Salon.create({
        salonName: body.salonName , 
        ownerName: body.ownerName,
        email: body.email,
        password: body.password,
        phone: body.phone,
        address: body.address,
        services: body.services,
        bookings: []
    })

   
    res.status(201).send('salon details are registered') ;
}
async function loginpage(req, res) {
  const { email, password } = req.body;

  try {
    const salon = await Salon.matchPassword(email, password);
    
    
    if (!salon) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = setSalon(salon); 
   

    res.status(200).json({
      message: "Login successful",
      token, 
      salon: salon
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

const allBookings = async (req, res) => {
  try {
    const email = req.params.email; // ✅ Correct way to access route param
    const salon = await Salon.findOne({ email }); // ✅ Use variable email

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const bookings = await Booking.find({ salonId: salon._id });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


async function handleCheckAuth(req, res) {
  try {
    const user = req.user;

    const salon = await Salon.findById(user._id);

    if(!salon){
      return res.status(404).json({
        msg: 'no salon found'
      })
    }

    return res.status(200).json({
      msg: 'user is authorized'
    })

  } catch (error) {
    res.status(400).json({
      error: error
    })
  }
}

async function salonInfo(req, res) {
  try {
    // Assuming a middleware attaches `req.user` after verifying the token
    const email = req.user?.email; // or req.user.id if you store user ID in token

    if (!email) {
      return res.status(400).json({ message: 'Invalid token or missing email' });
    }

    const salon = await Salon.findOne({ email });

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    
   const salonObj = salon.toObject();
  delete salonObj.password;
  delete salonObj.salt;

    res.status(200).json(salonObj);
  } catch (error) {
    console.error('Error fetching salon info:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function allCompletedBookings(req , res) {
  const salon = await Salon.findOne({email : req.params.email}) ;
  const bookings = await Booking.find({salonId : salon._id}) ;
  const completedBooking = bookings.filter(booking=> booking.status === "completed") ;
  res.status(200).json(completedBooking) ;
}

async function confirmBooking (req, res)  {
  const { id } = req.params;
  const update = req.body;
  
  

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(id, update, { new: true });
 
    

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
}

async function completeBooking(req,res) {

  const {id} = req.params ;
  const update = req.body;
  const confirmedBooking = await Booking.findByIdAndUpdate(id , update , {new : true} ) ;
  res.status(200).json(confirmedBooking) ;
}


module.exports = {
    signup,
    loginpage,
    allBookings,
    handleCheckAuth,
    salonInfo,
    allCompletedBookings,
    confirmBooking,
    completeBooking
    
}