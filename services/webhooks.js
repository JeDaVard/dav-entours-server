const express = require('express');

const router = express.Router();

router.get('/ping', async (req, res) => {
    res.json({ping: 'pong'})
})

module.exports = router;