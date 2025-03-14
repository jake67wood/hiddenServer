const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: (userData) => {
        bcrypt.hash(userData.password, 10, async (err, hash) => {
            if (err) throw err;
            userData.password = hash;
            const query = 'INSERT INTO users (name, last_name, phone,address, email, city,country, password, is_paid, package, price, date_today, token) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *';
            const values = [userData.name, userData.last_name, userData.phone, userData.address, userData.email, userData.city, userData.country, userData.password, 0, 'null','0','date','token'];

            try {
                const res = await db.query(query, values);
                console.log('user registered');
            } catch (error){
                console.log('user error',error.message);
            }
        });
    }
};

module.exports = User;
