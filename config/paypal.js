const { config } = require('dotenv')
config()

const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT
const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET
const PAYPAL_API = process.env.PAYPAL_API
const PORT = process.env.PORT
const HOST = process.env.HOST
const HOST_FRONTEND = process.env.HOST_FRONTEND

module.exports = {
  PAYPAL_API_CLIENT,
  PAYPAL_API_SECRET,
  PAYPAL_API,
  PORT,
  HOST,
  HOST_FRONTEND
}
