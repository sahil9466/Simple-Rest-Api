const ErrorResponse = require("../utiles/errorResponse")
const asyncHandler = require("../middleware/async");

const Course = require("../models/Course");
const Bootcamp = require("../models/bootcamps");
//const { ObjectId } = require('mongodb')

//  @ desc    get courses
//  @route    GET/api/v1/courses
//  @route    GET/api/v1/bootcamps/:bootcampId/courses
//  @access  public
exports.getCourses = asyncHandler(async(req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});
//  get single course
//GET/api/v1/courses/:id
//GET/api/v1/bootcamps/:bootcampId/courses
//public

exports.getCourse = asyncHandler(async(req, res, next) => {

    const course = await Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: 'name description'
    });
    if (!course) {
        return next(new ErrorResponse(`no course with the id of ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

///                  add single bootcamp course
//   routes          http://localhost:5000/api/v1/courses
//                   private
exports.addcourse = asyncHandler(async(req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    //console.log(req.body);
    req.body.user = req.user.id;




    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`), 404);
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not  authorized to add course bootcamp ${bootcamp._id} `, 401)
        );
    }


    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: Course
    });




});

//update  course
//route      PUT/api/v1/courses/:id
// access    Private 

exports.updateCourse = asyncHandler(async(req, res, next) => {

    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404);
    }

    //Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not  authorized to update  course  ${course._id} `, 401)
        );
    }


    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        success: true,
        data: Course
    });




});


//             delete course
//route         delete/api/v1/courses/:id
//access        private

exports.deleteCourse = asyncHandler(async(req, res, next) => {

    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(
            new ErrorResponse(`No course with the id of ${req.params.id}`),
            404
        );
    }

    //Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not  authorized to delete  course  ${course._id} `, 401)
        );
    }


    await course.remove();

    res.status(201).json({
        success: true,
        data: {}
    });




});