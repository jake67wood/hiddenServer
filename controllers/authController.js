const jwt = require('jsonwebtoken');
const User = require('../models/User');

const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = $1'; // Se usa $1 en lugar de ?
    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
        console.log('No user')
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
        res.status(401).json({ message: 'Invalid username or password' });
    }else{
        req.session.user = { username }
        res.status(200).json({ message: 'Login successful',user: req.session.user });
    }
};

exports.register = (req, res) => {
    const { name, last_name, phone, address, email, city, country, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({message: 'Las contraseñas no coinciden'})
    }

    User.create({ name, last_name, phone, address, email, city, country, password });
    res.status(201).json({ message: 'User registered successfully' });

};
exports.session = async (req,res)=>{

      const sessionId = req.cookies['connect.sid']; // Obtén el ID de la sesión desde la cookie

  if (!sessionId) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    // Busca la sesión en la base de datos
    const result = await db.query(
      'SELECT sess FROM session WHERE sid = $1 AND expire > NOW()',
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    // Obtén los datos de la sesión
    const sessionData = result.rows[0].sess;
    req.user = sessionData.user; // Guarda el usuario en el objeto `req`
    next(); // Continúa con la siguiente función
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
    /* 
    if (req.session.user) {
        console.log('checar sesion')
        res.status(200).json({user: req.session.user})
    } else {
        console.log('no sesion')
        res.status(401).json({message: 'Not autheticated'})
    } */
}
exports.logout = (req,res)=>{
    req.session.destroy((err)=>{
        if (err) {
            return res.status(500).json({message: 'Invalid logout'})
        }
        res.clearCookie('connect.sid')
        res.status(200).json({message: 'Logout session successfully'})
    })
}
exports.dashboardInfo = async (req,res)=>{
    const { username } = req.query.us // it's username not user | username is in login and local state

    const sql = "SELECT * FROM users WHERE email = $1"
    const result = await db.query(sql, [username])

        if (result.rows.length === 0) {
            res.status(500).json({message: 'Error email not found'})
            return
        }
        res.status(200).json(result.rows[0])
        
}
