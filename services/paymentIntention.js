const stripe = require('./stripe')
const { Tour, User } = require('../models')


async function createTourIntent(paymentData) {
    const  { userId, tourId, startId, firstMessage, invitedIds } = paymentData;

    const tour = await Tour.findOne({_id: tourId});
    const user = await User.findOne({_id: userId});

    // Calculate the amount of the order
    const price = invitedIds ? (invitedIds.split(',').length + 1) * tour.price : tour.price;
    let amount = price + price * Number(process.env.TOUR_ORDER_FEE) / 100;
    amount = Math.floor(amount) !== amount ? +amount.toFixed(2) * 100 : amount;

    // Intent a payment
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        receipt_email: user.email.toString(),
        metadata: {
            tour: tour._id.toString(),
            start: startId,
            buyer:user._id.toString(),
            invited: invitedIds,
            firstMessage,
        },
    });

    return {
        publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        clientSecret: paymentIntent.client_secret,
    }
}

module.exports = {
    createTourIntent
}