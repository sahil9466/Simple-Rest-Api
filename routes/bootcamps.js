const express = require("express");
const {
    getBootcamp,
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require("../controllers/bootcamps");

const Bootcamp = require('../models/bootcamps')

const advancedResults = require('../middleware/advancedResults');

// include other resourse routers 
const courseRouter = require('./courses');
const bootcamps = require("../models/bootcamps");


const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

//re routes into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
//router.route("/").get(getBootcamps).post(createBootcamp);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route("/")
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)
    //.get(getBootcampsInRadius)


module.exports = router;