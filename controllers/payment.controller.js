const axios = require('axios')
const { PAYPAL_API, PAYPAL_API_CLIENT, PAYPAL_API_SECRET, HOST, HOST_FRONTEND } = require('../config/paypal')
const connection = require('../config/db')
const nodemailer = require('nodemailer')

exports.createOrder = async (req,res)=>{
    const { package, isPaid, price, date, email } = req.body
    try {


        const order = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: "MXN",
                        value: `0.01`
                    },
                    description: `${package}`
    
                }
            ],
            application_context: {
                brand_name: 'Secretos Ocultos',
                landing_page: 'LOGIN', 
                user_action: 'PAY_NOW', 
                return_url: `${HOST}/api/auth/paypal/capture-order`, 
                cancel_url: `${HOST}/api/auth/paypal/cancel-order`
            }
        }
    
        const params = new URLSearchParams()
        params.append("grant_type", "client_credentials")
        const {data: {access_token}} = await axios.post(`${PAYPAL_API}/v1/oauth2/token`,params,{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
                username: PAYPAL_API_CLIENT,
                password: PAYPAL_API_SECRET
            }
        })
    
        const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, order,{
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        console.log("heello")

        // 🔹 Guardamos la orden en la BD antes de enviarla a PayPal
        const sql = `
        UPDATE users 
        SET package = $1, is_paid = $2, price = $3, date_today = $4, token = $5 
        WHERE email = $6`

        const result = await connection.query(sql, [package, 0, price, date, response.data.id, email]);
            
        console.log(response.data.id)
    
        res.json(response.data)
    } catch (error) {
        console.error("❌ Error creating order:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Error creating PayPal order", error: error.response?.data || error.message });
    }
}
exports.captureOrder = async (req,res)=>{
    const {token} = req.query
    console.log('capture order before',token)
    
    const response = await  axios.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`,{},{
        auth: {
            username: PAYPAL_API_CLIENT,
            password: PAYPAL_API_SECRET
        }
    })
    console.log('capture order after',token)

    console.log(response.data)

    // 🔹 Marcar la orden como pagada en MySQL
    const sql = `
        UPDATE users 
        SET is_paid = $1
        WHERE token = $2
    `;
    const result = await connection.query(sql, [1,token]);

    console.log('✅ Orden marcada como pagada.');

        // 🔹 Marcar la orden como pagada en MySQL
    const query = `SELECT * FROM users WHERE token = $1`;
    const resu = await connection.query(query, [token])

        const toStartCase = (string)=>{
            return string
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
        }
        // Send email
        const config = {
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'jose20.jmmorales@gmail.com',
                pass: 'lteb omes kfmz hdat'
            }
        }
        const message = {
            from: `${resu[0].email}`,
            to: 'jakewood6788@gmail.com',
            subject: 'Test mail',
            html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
                <h2 style="color: #333; text-align: center;">Hola ${toStartCase(resu[0].name)} ${toStartCase(resu[0].last_name)}</h2>
                <h2 style="color: #333; text-align: center;">🎉 ¡Gracias por tu compra! 🎉</h2>
                <p style="font-size: 16px; color: #555; text-align: center;">Aquí están los detalles de tu paquete adquirido:</p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>📦 Paquete:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #444;">${resu[0].package}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>💰 Precio:</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #28a745;">$${resu[0].price} USD</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px;"><strong>📅 Fecha de Pago:</strong></td>
                        <td style="padding: 10px; color: #444;">${resu[0].date_today}</td>
                    </tr>
                </table>

                <div style="margin-top: 20px; text-align: center;">
                    <p style="font-size: 14px; color: #777;">Si tienes alguna duda, contáctanos.</p>
                    <a href="${HOST_FRONTEND}/support" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">📩 Contactar Soporte</a>
                </div>

                <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 20px;">© 2025 Secretos Ocultos. Todos los derechos reservados.</p>
            </div>
        </div>
    `   // I can use HTML if i want
        }
        const transport = nodemailer.createTransport(config)
        const info = await transport.sendMail(message)
        console.log(info)
        console.log('✅ Sent mail correctly.');

    return res.redirect(`${HOST_FRONTEND}/payed`);
    

}
exports.cancelOrder = (req,res)=>{
    return res.redirect(`${HOST_FRONTEND}/`)
}
