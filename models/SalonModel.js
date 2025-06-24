const mongoose = require('mongoose');
const {createHmac , randomBytes} = require('crypto') ;


const SalonSchema = new mongoose.Schema({
  salonName:
    {type:String , required: true},
  ownerName:  {type:String , required: true},
  email: { type: String },
  password:{type:String , required: true},
  salt:{type:String},
  phone: { type: String, unique: true },
  address:  {type:String , required: true},

  // Services offered by the salon
  services: [
    {
      serviceName: {type:String , required: true},       // e.g., "Haircut"
      price: {type:String },                // e.g., 
    }
  ],

  bookings: [{ type: mongoose.Schema.Types.ObjectId , ref: 'Booking' }]
});
SalonSchema.pre('save', function (next) {
  const salon = this;

  // Only hash password if it is new or modified
  if (!salon.isModified('password')) return next();

  const salt = randomBytes(16).toString('hex');  // hex string salt
  const hashedPassword = createHmac('sha256', salt).update(salon.password).digest('hex');

  salon.salt = salt;
  salon.password = hashedPassword;

  next();
});


SalonSchema.static('matchPassword', async function (email, password) {
  const salon = await this.findOne({ email });
  if (!salon) return null; // no throw

  const salt = salon.salt;
  const hashedPassword = salon.password;

  const salonProvidedPassword = createHmac('sha256', salt)
    .update(password)
    .digest('hex');

  if (hashedPassword !== salonProvidedPassword) return null; // no throw

  const salonObj = salon.toObject();
  delete salonObj.password;
  delete salonObj.salt;
  return salonObj;
});

const Salon = mongoose.model( 'SalonModel' , SalonSchema) ;

module.exports = Salon;
