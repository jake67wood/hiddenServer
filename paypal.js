const paypal = require('@paypal/checkout-server-sdk')

// Configure the client paypal
const Environment = process.env.NODE_ENV === 'production'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment

    const paypalClient = new paypal.core.PayPalHttpClient(new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_SECRET
    ))
module.exports = paypalClient