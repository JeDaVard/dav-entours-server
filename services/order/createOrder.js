const { Order, Start, Conversation, Message} = require("../../models");
const { pubsub } = require('../../graphql/pubsub');

async function createOrder(amount, { tour, buyer, start, invited, firstMessage }) {
    const tourStart = await Start.findOne({ _id: start });

    const order = await Order.create({
        tour,
        buyer,
        start,
        end: tourStart.end,
        amount: amount / 100,
        invited: invited ? invited.split(',') : []
    });

    await tourStart.participants.push(buyer);
    await tourStart.save();

    const conversation = await Conversation.findOne({start});
    const message = await Message.create({
        sender: buyer,
        conversation: conversation._id,
        text: firstMessage,
        isImage: false
    });

    await pubsub.publish(`CONVERSATION_${conversation._id}`, { messageAdded: message })
}

module.exports = {
    createOrder
}