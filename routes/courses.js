const { Router } = require("express");
const express = require("express");
const {
    getCourses,
    addcourse,
    getCourse,
    updateCourse,
    deleteCourse

} = require("../controllers/courses");

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });


const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(advancedResults(Course, {

        path: 'bootcamp',
        select: "name "

    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addcourse);
router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);
//router.route('/add').post(addcourse);
module.exports = router;