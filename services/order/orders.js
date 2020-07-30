const { Tour, User, Order, Start } = require('../../models');

async function findOrders(userId, past = false) {
    const orderQuery = Order.find({$or: [{buyer: userId}, {invited: {$in: userId}}]})
    return await orderQuery.find({ended: past})
}


module.exports = {
    findOrders
}