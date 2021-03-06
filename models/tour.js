const mongoose = require('mongoose');
const slugify = require('slugify');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const mongoosePaginate = require('mongoose-paginate-v2');
const _ = require('lodash');
// const User = require('./user');

const locationSchema = new mongoose.Schema({
    type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number,
})

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name']
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        slug: {
            type: String,
            unique: true
        },
        hashtags: [String],
        firstMessage: {
            type: String,
        },
        summary: {
            type: String,
            trim: true,
            // required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            // required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        duration: {
            type: Number,
            // required: [true, 'Please, provide the duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'easy',
            required: [true, 'Please, provide a difficulty level'],
        },
        price: {
            type: Number,
            // required: [true, 'Please, provide the price'],
        },
        priceDiscount: Number,
        ratingsAverage: {
            type: Number,
            default: 5,
            min: [1, 'Rating must be 1 or above'],
            max: [5, 'Rating must be 5 or below'],
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        draft: {
            type: Boolean,
            default: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

tourSchema.plugin(aggregatePaginate)

// For example when we search we receive a result of 3 documents, but mongo actually examine all documents, or let's
//    say more then we need, but when we set an index for a specific field, mongo does less queries
//    that's the theory, well said by Jonas, but I tried and I am guessing this new mongo isn't as stupid as before,
//    or it is smarter than before, I just checked the number of examined docs for 3 result, it was just three.
//    This could be a serious performance gape otherwise, that's why I write so much for future me to check it
//    better for a real world project.
//    Just a remark, after good test series, I realized that (not always, but) in some cases mongo actually does
//    a lot of queries, for ex. 7q. for 1 doc, it's too much. And unfortunately the stuff down here did not help
//    So, future me, hope you resolved this in the future projects.
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ locations: '2dsphere' });
tourSchema.index({ starts: 1 });

// tourSchema.pre(/^find/, function (next) {
//     // "populate" means when we request it finds each guide by ObjectId located in the 'guides' array
//     this.populate({
//         path: 'guides',
//         // we exclude these props by writing a string starting with minus symbol
//         select: '-__v -passwordResetExpires -passwordResetToken',
//     });
//     next();
// });

// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     console.log(guidesPromises)
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })

// tourSchema.virtual('durationWeeks').get(function ()  {
//     return this.duration / 7;
// });

// virtual populate
// tourSchema.virtual('reviews', {
//     ref: 'Review',
//     foreignField: 'tour',
//     localField: '_id'
// });

tourSchema.pre('save', function (next) {
    if (this.locations.length) {
        this.startLocation = this.locations[0]
        return next();
    }

    if (this.draft && !this.startLocation.coordinates && !this.locations.length) {
        this.startLocation = undefined
    }
    next();
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this._id.toString().slice(18) + '-' + this.name, { lower: true });
    next();
});

tourSchema.pre('save', function (next) {
    const hashtags = [...this.hashtags, ...this.name.split(' ').filter(hash => hash.length > 3)];
    this.hashtags = _.uniq(hashtags)
    next();
});

tourSchema.pre('save', function (next) {
    this.duration = this.locations.reduce((ac, loc) => {
        return ac + loc.day
    }, 0)
    next();
});

tourSchema.pre('find', function (next) {
    this.find({ draft: { $ne: true } });
    next();
});

// Aggregation middleware
// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//
//     next()
// })

tourSchema.plugin(mongoosePaginate)

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;