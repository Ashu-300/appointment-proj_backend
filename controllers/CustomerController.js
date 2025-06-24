const Customer = require('../models/CustomerModel') ;
const Salon = require('../models/SalonModel') ;
const Booking = require('../models/BookingModel')
const { setCustomer  } = require('../jwtMapping/CustomerMapping') ;
const generateTimeSlots = require('../utils/generateTimeSlots');
// const {matchPassword} = require('../models/CustomerModel')

async function signuppage(req , res){
    const body = req.body ;
   try{ Customer.create({
        name: body.name ,
        email: body.email ,
        password: body.password ,   
        phone: body.phone ,
        bookings:[]
    })
    res.status(201).send('user details are registered') ;
    }
    catch(err){
        res.status(300).send('something went wrong') ;
    }

}

async function loginpage(req, res) {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if customer exists and password matches
    const customer = await Customer.matchPassword(email, password);

    if (!customer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Generate token (JWT)
    const token = setCustomer(customer); // returns plain JWT, not "Bearer <token>"

    // ✅ Return token and customer info
    res.status(200).json({
      message: "Login successful",
      token, // ✅ plain token, frontend will attach "Bearer " prefix
      customer
    });

  } catch (err) {
    console.error("❌ Login error:", err.message); 
    res.status(400).json({ message: "user error", error: err.message });
  }
}


async function getAllSalons(req , res){
 try {
    const salons = await Salon.find();
    
    res.status(200).json(salons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

}

async function newBooking(req , res){
  
// Assume req.body has: customerEmail, salonEmail, service, appointmentDate
const { customerEmail, salonEmail, services, appointmentDate } = req.body;

const customer = await Customer.findOne({ email: customerEmail });
const salon = await Salon.findOne({ email: salonEmail });

if (!customer || !salon) {
  return res.status(404).json({ error: 'Customer or Salon not found' });
}

// Create booking
const anotherBooking = await Booking.create({
  customerId: customer._id,
  salonId: salon._id,
  services,
  appointmentDate
});

customer.bookings.push(anotherBooking);
await customer.save();

salon.bookings.push(anotherBooking);
await salon.save();

res.status(201).json(anotherBooking);
}

async function myBooking(req,res){
   try {
    const {email} = req.params
    const customer = await Customer.findOne({email:email})
    const bookings = await Booking.find({customerId : customer._id}) ;
      
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function slots (req, res){
  try {
    const { salonId, serviceName, date } = req.query; // date in YYYY-MM-DD

    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ message: "Salon not found" });

    // Find service duration
    const service = salon.services.find(s => s.serviceName === serviceName);
    if (!service) return res.status(400).json({ message: "Service not found in salon" });

    const duration = service.duration;

    // Generate all possible time slots (hardcoded open/close for now)
    const allSlots = generateTimeSlots("09:00", "18:00", duration);

    // Get all bookings on the same date
    const startOfDay = new Date(date + "T00:00:00");
    const endOfDay = new Date(date + "T23:59:59");

    const bookings = await Booking.find({
      salonId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // Convert booked times to a Set
    const bookedSet = new Set(bookings.map(booking => {
      const time = new Date(booking.appointmentDate).toTimeString().slice(0,5); // e.g., "10:30"
      const end = new Date(new Date(booking.appointmentDate).getTime() + duration * 60000);
      const endTime = end.toTimeString().slice(0,5);
      return `${time}-${endTime}`;
    }));

    // Filter available
    const availableSlots = allSlots.filter(slot => {
      return !bookedSet.has(`${slot.start}-${slot.end}`);
    });

    res.json({ availableSlots });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function info(req,res) {
   try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer info:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
    signuppage,
    loginpage,
    getAllSalons,
    newBooking,
    myBooking,
    info ,
}