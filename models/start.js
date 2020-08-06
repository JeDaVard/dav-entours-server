const mongoose = require('mongoose');
const Tour = require('./tour')

const startSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Start date must have a start date']
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    participantsCount: {
        type: Number,
        default: 0
    },
    staff: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Start date must belong to a tour']
    },
    end: {
        type: Date,
        required: [true, 'Start must have an end time']
    },
    ended: {
        type: Boolean,
        required: [true, 'Order must specify if its ended or not'],
        default: false
    }
},
{
    timestamps: true
});

// startSchema.pre(/find/, function () {
//     this.populate('participants tour staff')
// })

startSchema.pre('save', async function (next) {
    const tour = await Tour.findOne({_id: this.tour});
    this.staff = [tour.author, ...tour.guides];

    this.participantsCount = this.participants.length;
    console.log(this.participantsCount)
    console.log(this.participants.length)
    next()
})

const Start = mongoose.model('Start', startSchema)

module.exports = Start