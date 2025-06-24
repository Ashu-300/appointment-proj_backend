const { default: mongoose } = require("mongoose");

const BookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  customerName: {type:String} , 
  customerEmail :{type:String},
  customerPhone:{type:Number},
  salonName: {type:String} , 
  salonEmail :{type:String},
  salonPhone:{type:Number},
  services: [],
  slots:[],
  appointmentDate: Date,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const BookingModel = mongoose.model('BookingModel' , BookingSchema) ;

module.exports = BookingModel ;  