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
        
    await db.query(
      'UPDATE users SET is_logged_in = TRUE WHERE id = $1',
      [user.id]
    );
        /* req.session.user = { username } */
        res.status(200).json({ message: 'Login successful',user: { username } });
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
  const { username } = req.params;
        console.log('userNAME',username)

  try {
    // Busca al usuario en la base de datos
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Responde con el estado de la sesión
    res.status(200).json({ user: user.is_logged_in });
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
    
/*     if (req.session.user) {
        console.log('checar sesion')
        res.status(200).json({user: req.session.user})
    } else {
        console.log('no sesion')
        res.status(401).json({message: 'Not autheticated'})
    } */
}
exports.logout = async (req,res)=>{

      const { username } = req.body;

  try {
    // Busca al usuario en la base de datos
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Actualiza el campo is_logged_in a FALSE
    await db.query(
      'UPDATE users SET is_logged_in = FALSE WHERE id = $1',
      [user.id]
    );

    // Responde con un mensaje de éxito
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en el logout:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
    
/*     req.session.destroy((err)=>{
        if (err) {
            return res.status(500).json({message: 'Invalid logout'})
        }
        res.clearCookie('connect.sid')
        res.status(200).json({message: 'Logout session successfully'})
    }) */
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
