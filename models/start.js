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

},
{
    timestamps: true
});

// startSchema.pre(/find/, function () {
//     this.populate('participants tour staff')
// })

const Start = mongoose.model('start', startSchema)

module.exports = Start