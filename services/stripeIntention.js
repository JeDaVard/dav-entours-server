// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripeIntention = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour')
const User = require('../models/user')

async function createTourIntent(paymentData) {
    const  { userId, tourId, startId, firstMessage, invitedIds } = paymentData;

    const tour = await Tour.findOne({_id: tourId});
    const user = await User.findOne({_id: userId});

    let price = tour.price;
    if (invitedIds) {
        price += invitedIds.split(',').length * price
    }

    const amount = price + price * Number(process.env.TOUR_ORDER_FEE) / 100;

    const paymentIntent = await stripeIntention.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: user._id,
        receipt_email: user.email,
        // Verify your integration in this guide by including this parameter
        metadata: {
            integration_check: 'accept_a_payment',
            tourId,
            startId,
            firstMessage
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