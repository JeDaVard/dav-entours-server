const {findOrders} = require("./orders");
const { Start, Order } = require('../../models')

async function cancelOrder(userId, orderId) {
    const order = await Order.findOne({_id: orderId, buyer: userId});
    const start = await Start.findOne({_id: order.start});

    const participantsToRemove = [userId, ...order.invited];
    start.participants = start.participants.filter(p => participantsToRemove.indexOf(p) !== -1);
    await start.save()

    await Order.findByIdAndDelete(orderId)
    return await findOrders(userId)
}

module.exports = {
    cancelOrder
}