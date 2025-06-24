require('dotenv').config()
const express = require('express') ;
const {restrictToLoggedInCustomerOnly} = require('./middleware/customerAuth')
const {restrictToLoggedInSalonOnly} = require('./middleware/salonAuth')
const {connectMongo} = require('./Connection/Connection') ;
const customerRouter = require('./routes/CustomerRoutes') ;
const salonRouter = require('./routes/SalonRoutes');
const cookieParser = require('cookie-parser');
const {initializeSocketIO} = require('./socket')

const http = require('http');
const cors = require('cors');

const app = express() ;
const port = process.env.PORT || 8000 ;

const server = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  methods: ['GET', 'POST' , 'PUT'],
  credentials: true
}));

app.use(express.urlencoded({extended:true}));
app.use(express.json()) ;
app.use(cookieParser()) ;

connectMongo(process.env.MONGO_URL).then(()=>console.log(`MongoDB connected`)) ;

initializeSocketIO(server);

app.use('/customer' , restrictToLoggedInCustomerOnly , customerRouter ) ;
app.use('/salon'  , restrictToLoggedInSalonOnly , salonRouter ) ;

server.listen(port ,()=> {console.log(`server started at port ${port} `)} ) ;