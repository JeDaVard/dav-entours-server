const mongoose = require('mongoose');
const Tour = require('./tour');
const Conversation = require('./conversation')
const Message = require('./message')

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
        // required: [true, 'Start must have an end time']
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
    next()
});

startSchema.pre('save', async function (next) {
    const tour = await Tour.findOne({_id: this.tour});
    // const locations = [...tour.locations];
    if (!tour.duration) {
        this.end = this.date;
        return next();
    }
    this.end = +new Date(this.date) + tour.duration * 86400000
    next()
})

startSchema.pre('save', async function (next) {
    const isConvExist = await Conversation.findOne({start: this._id})
    if (!isConvExist) {
        const tour = await Tour.findById(this.tour)
        const conversation = await Conversation.create({start: tour._id, tour})
        await Message.create({
            conversation: conversation._id,
            text: tour.firstMessage,
            sender: tour.author,
            isImage: false})
    }
    next()
})

const Start = mongoose.model('Start', startSchema)

module.exports = Start