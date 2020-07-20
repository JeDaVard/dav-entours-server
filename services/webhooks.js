const express = require('express');
const { PubSub } = require('apollo-server-express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Tour, User, Order } = require('../models');



const router = express.Router();


router.post("/stripe",async (req, res) => {
    let data, eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers["stripe-signature"];
        try {
            event = stripe.webhooks.constructEvent(
                req.rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`);
            return res.sendStatus(400);
        }
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // we can retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === "payment_intent.succeeded") {
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)

        // Create an order
        const { tour, buyer, start, invited } = req.body.data.object.metadata;
        const { amount } = req.body.data.object

        const order = await Order.create({
            tour,
            buyer,
            start,
            amount: amount / 100,
            invited: invited ? invited.split(',') : []
        });
    } else if (eventType === "payment_intent.payment_failed") {
        console.log("❌ Payment failed.");
    } else if (eventType === "charge.succeeded") {
        console.log('charged')
    }
    res.sendStatus(200);
});

module.exports = router;