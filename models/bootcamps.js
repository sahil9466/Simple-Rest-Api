const mongoose = require("mongoose");
const { Geocoder } = require("node-geocoder");
const slugify = require("slugify");
const geocoder = require("../utiles/geocoder");

const BootcampSchema = new mongoose.Schema({
        name: {
            type: String,



            required: [true, "please add a name"],
            unique: true,
            trim: true,
            maxlength: [50]
        },
        slug: String,
        description: {
            type: String,
            match: false,
            required: [true, "please add a description"],
            maxlength: [500, 'description can not be more than 500 characters ']
        },
        email: {
            type: String,
            match: [
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/

            ],
            default: " no email"
        },
        phone: {
            type: String,
            maxlength: [20, 'phone number can not be longer than 20 character']

        },
        address: {
            type: String,
            require: [true, 'please add an address'],
            default: "no address"
        },



        website: {
            type: String,
            match: [
                /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
                "please add a valid url"
            ]
        },


        location: {
            //geojson
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ['Point'], // 'location.type' must be 'Point'
                // required: true
            },
            coordinates: {
                type: [Number],
                //required: true,
                index: "2dsphere"
            },
            formattedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String,
            country: String

        },
        careers: {
            type: String,
            required: true,
            enum: [
                'web development',
                'mobile development',
                'unix',
                'data scrience',
                'other'
            ]
        },
        averageRating: {
            type: Number,
            min: [1, "minimum reting is 1"],
            max: [10, "maximum rating is 10"]
        },
        averagecost: {
            type: Number
        },

        photo: {
            type: String,
            default: 'no-photo'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true

        }


    },

    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }

    }
);

//create bootcamp slug from the name 
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    //console.log('Slugify ran', this.name);
    next();

});
//Geocode and create location field
BootcampSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
            type: 'point',
            coordinates: [loc[0].longitude, loc[0].latitude],
            formatterAddress: loc[0].formattedAddress,
            street: loc[0].streetName,
            city: loc[0].city,
            state: loc[0].stateCode,
            zipcode: loc[0].zipCode,
            country: loc[0].countryCode,
        }
        //do not save address
    this.address = undefined;
    next();
});
//// cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function(next) {
    console.log(`Courses being removed ${this._id}`);
    await this.model('courses').deleteMany({ bootcamp: this._id });
    next();
});

//reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});


module.exports = mongoose.model('bootcamps', BootcampSchema);