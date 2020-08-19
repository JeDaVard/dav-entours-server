const { Start, Conversation, Message, Tour } = require('../../models');

async function manageStart(date, startId, tourId) {
    let start;
    if (date) {
        start = await Start.create({
            date,
            tour: tourId,
        })
    }
    if (startId) {
        start = await Start.findById(startId);
        if (start.participants.length) throw new Error('You can\'t remove a start which has already at least one order')
        start = await Start.findOneAndDelete({_id: startId})
        await Conversation.findOneAndDelete({start: startId})
    }
    return start
}

module.exports = {
    manageStart
}