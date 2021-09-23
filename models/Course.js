const mongoose = require("mongoose");
const CourseSchema = new mongoose.Schema({
        title: {
            type: String,
            trim: true,
            required: [true, 'please add a course tittle']
        },
        description: {
            type: String,
            required: [true, 'please add a description']
        },
        weeks: {
            type: String,
            required: [true, 'please add number of weeks']
        },
        tuition: {
            type: Number,
            required: [true, 'please add a tuition cost']
        },
        minumumSkill: {
            type: String,
            //required: [true, 'please add a minimum skill'],
            enum: ['beginner', 'intermediate', 'advanced']
        },
        scholarshipAvailable: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        bootcamp: {
            type: mongoose.Schema.ObjectId,
            ref: 'bootcamp',
            required: true

        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true

        }
    },
    /*{
    timestamps: true
}*/
);
///static method to get avg of course tutions

CourseSchema.statics.getAverageCost = async function(bootcampId) {

    const obj = await this.aggregate([{
        $match: { bootamp: bootcampId }
    }, {
        $group: {
            _id: "$bootcamp",
            averageCost: { $avg: '$tuition' }
        }
    }]);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: obj[0].averageCost
        })
    } catch (err) {
        console.error(err);
    }
}

// Call get AverageCost after  save
CourseSchema.post("save", function() {
    this.constructor.getAverageCost(this.bootcamp);

});


// Call get AverageCost before  remove
CourseSchema.pre("remove", function() {
    this.constructor.getAverageCost(this.bootcamp);


});

module.exports = mongoose.model('Course', CourseSchema);