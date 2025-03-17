const express = require('express');
const { login, register, session, logout, dashboardInfo } = require('../controllers/authController');
const { createOrder, captureOrder, cancelOrder } = require('../controllers/payment.controller')
const { support } = require('../controllers/support.controller')

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/session/:username', session)
router.post('/logout', logout)

router.post('/paypal/create-order', createOrder)
router.get('/paypal/capture-order', captureOrder)
router.get('/paypal/cancel-order', cancelOrder)
router.get('/dashboard-info', dashboardInfo)
router.post('/support', support)

module.exports = router;
