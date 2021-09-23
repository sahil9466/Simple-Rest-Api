const path = require('path');
const express = require("express");
const dotenv = require("dotenv");
//const logger = require('./middleware/logger');
const morgan = require("morgan");
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");



//const { connect } = require("mongoose");


dotenv.config({ path: "./config/config.env" });



//connect to db

connectDB();

//routes files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");


const app = express();

//body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//dev logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}

//File uploading
app.use(fileupload());

///set static  folder
app.use(express.static(path.join(__dirname, "public")))

//mount routes

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(
    PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);