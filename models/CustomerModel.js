const { default: mongoose } = require("mongoose");
const {createHmac , randomBytes} = require('crypto') ;

const CustomerSchema = new mongoose.Schema({
  name:  {type:String , required: true},
  email: { type: String, unique: true },
  password: {type:String , required: true},
  salt:{type:String},
  phone: { type: String, unique: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
});

CustomerSchema.pre('save', function (next) {
  const customer = this;

  // Only run if password field is modified or new
  if (!customer.isModified('password')) return next();

  const salt = randomBytes(16).toString('hex');  // added .toString('hex') for consistency
  const hashedPassword = createHmac('sha256', salt).update(customer.password).digest('hex');
  
  customer.salt = salt;
  customer.password = hashedPassword;
  
  next();
});


CustomerSchema.static('matchPassword', async function(email, password) {
  const customer = await this.findOne({ email });

  if (!customer) return null;

  const salt = customer.salt;
  const hashedPassword = customer.password;
  const customerProvidedPassword = createHmac('sha256', salt)
    .update(password)
    .digest('hex');

  if (hashedPassword !== customerProvidedPassword) return null;

  const customerObj = customer.toObject();
  delete customerObj.password;
  delete customerObj.salt;

  return customerObj;
});


const Customer = mongoose.model('CustomerModel' , CustomerSchema) ;

module.exports = Customer ;