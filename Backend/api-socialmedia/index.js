const express = require('express');
const app = express();
// Have to declare very beginning of here
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config();

// Default Route
app.get('/',(req,res)=>{
    res.send('Welcome to Social Media Backend API');
});

// User Route
const userRoute = require('./routes/userRoute');
app.use(`${process.env.API_ROUTE}/users`,userRoute);

// Post Route
const postRoute = require('./routes/postRoute');
app.use(`${process.env.API_ROUTE}/posts`,postRoute);

// Auth Route
const authRoute = require('./routes/authRoute');
app.use(`${process.env.API_ROUTE}/auth`,authRoute);

// configuration for require package.
const helmet = require('helmet');
app.use(helmet());
const morgan = require('morgan');
app.use(morgan('common'));
const cors = require('cors');
app.use(cors())

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(msg=>console.info(`Social Media Database is connected...`))
    .catch(err=>console.error(`Social Media Database can't connected...`))

app.listen(process.env.PORT,()=>{
    console.info(`Social Media Backend Server is running at ${process.env.PORT} `);
});