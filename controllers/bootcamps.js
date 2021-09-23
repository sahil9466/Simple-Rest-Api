const path = require('path');
const ErrorResponse = require("../utiles/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require('../utiles/geocoder');
const Bootcamp = require('../models/bootcamps');
const { Geocoder } = require("node-geocoder");
const bootcamp = require("../models/bootcamps");
const { $where } = require("../models/bootcamps");
const { param } = require("../routes/bootcamps");
const { ObjectId } = require('mongodb');
const bootcamps = require('../models/bootcamps');




exports.getBootcamps = asyncHandler(async(req, res, next) => {
    //console.log('testing');

    res
        .status(200)
        .json(res.advancedResults);

});

exports.getBootcamp = asyncHandler(async(req, res, next) => {
    //console.log('iddddd', req.params.id)
    const bootcamp = await Bootcamp.findOne({ bootcampId: ObjectId(req.params.id) });
    if (!bootcamp) {

        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    res.status(200).json({ success: true, data: bootcamp });

});

exports.createBootcamp = asyncHandler(async(req, res, next) => {
    //Add user to req,body
    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    //if the user is not an admin ,they can only add ane bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`the user with Id ${req.user.id} has already published a bootcamp`, 400));

    }
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });

});

exports.updateBootcamp = asyncHandler(async(req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);
    // res.status(200).json({ success: true, msg: `update bootcamp ${req.params.id}` })
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not  authorized to update this bootcamp `, 401)
        );
    }



    bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        eunValidators: true
    });

    res.status(200).json({ success: true, data: bootcamp });

});

exports.deleteBootcamp = asyncHandler(async(req, res, next) => {
    //res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}` })


    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not  authorized to delete this bootcamp `, 401)
        );
    }


    bootcamp.remove();
    res.status(200).json({ success: true, data: {} });

});
///get bootcamps within a radius

exports.getBootcampsInRadius = asyncHandler(async(req, res, next) => {

    const { zipcode, distance } = req.params;

    //get  lan/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;


    ///cal radius using radians
    //divide dist by radius of Earth
    //Earth Radius=3963mi/6378km
    const radius = distance / 6378;
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });
    res.status(200).json({
        sucess: true,
        count: bootcamps.length,
        data: bootcamps

    });

});
// desc    upload photom for bootcamp
//route     PUT/api/v1/bootcamps/:id/photo
//access   private


exports.bootcampPhotoUpload = asyncHandler(async(req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not  authorized to update this bootcamp `, 401)
        );
    }


    if (!req.files) {
        return next(new ErrorResponse(`please upload a file`, 400));
    }


    const file = req.files.file;

    ///make sure the image is photo
    if (!file.mimetype.startsWith("image")) {
        return next(new ErrorResponse(`please upload a image  file`, 400));
    }

    //CHECK  FILE SIZE 
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`please upload a image LESS THAN ${process.env.MAX_FILE_UPLOAD}`, 400));

    }
    /// CREATE CUSTOM FILE NAME 
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`problem with file upload`, 500));

        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });


        res.status(200).json({
            sucess: true,

            data: file.name

        });
    });


});
///g