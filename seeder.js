const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

//load env vars
dotenv.config({ path: './config/config.env' });

//load models
const bootcamp = require('./models/bootcamps');
//const Bootcamp = require('./models/bootcamps');
const course = require('./models/Course');
const User = require('./models/User');

//connect to  db

mongoose.connect(process.env.MONGO_URI,
    /*{
           useUnifiedTopology: true,
           useNewUrlParser: true,
           useFindAndModify: false
       }*/
);


/// read the json file


const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/data/bootcamps.json`, 'utf-8'));



const courses = JSON.parse(fs.readFileSync(`${__dirname}/data/courses.json`, 'utf-8'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/data/User.json`, 'utf-8'));


//import into db
const importData = async() => {
        try {
            await bootcamp.create(bootcamps);
            await course.create(courses);
            await User.create(users);


            console.log("Data Imported...".green.inverse);
            process.exit();

        } catch (err) {
            console.error(err);

        }

    }
    ///delete data
const deleteData = async() => {
    try {
        await bootcamp.deleteMany();
        await course.deleteMany();
        await User.deleteMany();

        console.log("Data destroyed...".red.inverse);
        process.exit();

    } catch (err) {
        console.error(err);

    }
}
if (process.argv[2] === '-i') {
    importData();


} else if (process.argv[2] === '-d') {
    deleteData();
}