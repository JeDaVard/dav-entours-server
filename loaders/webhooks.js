const express = require('express');
const { createOrder } = require("../services/order/createOrder");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        const { amount, metadata } = req.body.data.object

        await createOrder(amount, metadata);

    } else if (eventType === "payment_intent.payment_failed") {
        console.log("❌ Payment failed.");
    } else if (eventType === "charge.succeeded") {
        console.log('charged')
    }
    res.sendStatus(200);
});

module.exports = router;