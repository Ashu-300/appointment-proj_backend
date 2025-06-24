const { Server } = require("socket.io");
const Customer = require("./models/CustomerModel");
const Booking = require('./models/BookingModel') ;
const Salon = require('./models/SalonModel');
// const cors = require('cors');

let io;

async function initializeSocketIO(httpServer) {
    const io = new Server(httpServer, { 
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
     });

     const salonOwners = {};
     const customer = {};

    io.on("connection", (socket) => {
       socket.on('customer_joined', (customerId) => {
        customer[customerId] = socket.id;
        });

       
        socket.on('salon_owner_join', (salonId) => {
            salonOwners[salonId] = socket.id;
        });

        socket.on('customerBookingRequest', async ({ services , slots , salonId , customerEmail }) => {
         const customer = await Customer.findOne({email : customerEmail}) ;
         const salon = await Salon.findOne({_id:salonId}) ;
         
         
         const newBooking = new Booking({
            customerId : customer?._id , 
            salonId : salonId,
            customerName:customer?.name,
            customerEmail:customer?.email,
            customerPhone:customer?.phone, 
            salonName:salon?.salonName,
            salonEmail:salon?.email,
            salonPhone:salon?.phone, 
            services : services,
            slots: slots,
            appointmentDate : slots[0],
            status : 'pending' ,
         })
        const savedBooking = await newBooking.save();
        await Customer.findByIdAndUpdate(
            customer._id,
            { $push: { bookings: savedBooking._id } },
            { new: true }
        );
        await Salon.findByIdAndUpdate(
            salon._id,
            { $push: { bookings: savedBooking._id } },
            { new: true }
        );

        const salonSocketId = salonOwners[salonId];
            
            
            if (salonSocketId) {  
          io.to(salonSocketId).emit('new_booking_notification', savedBooking);

            } else {
                socket.emit('booking_status', { 
                    status: false,
                    message: 'The salon is currently not online. Your booking has been saved and will be sent once the salon is back.'
                });
            }
        });
      socket.on('booking_confirmed', async ({ customerId, booking }) => {
        try {
            const customerSocketId = customer[customerId];
            if (customerSocketId) {
            io.to(customerSocketId).emit('booking_confirmed', booking);
            }
        } catch (err) {
            console.error('Error updating booking:', err);
        }
        });
        socket.on('booking_decline' , async({bookingId, customerId , booking})=>{
            try{
                 await Booking.findByIdAndDelete(bookingId);
                 const customerSocketId = customer[customerId] ;
                 if(customerSocketId){
                    io.to(customerSocketId).emit('booking_decline' , {
                        message:"❌ booking can't be accepted due to unabvailability of slot"
                    })
                 }
            }catch(err){
                console.error('Error updating booking:', err);
            }
        }) 
        socket.on('disconnect', () => {
        })
    });   
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = {
    initializeSocketIO,
    getIO
}