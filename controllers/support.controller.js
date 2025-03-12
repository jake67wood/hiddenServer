const db = require('../config/db')

exports.support = async (req, res) => {
    const { name, email, subject, message } = req.body;

    const sql = "INSERT INTO support (name, email, subject, message) VALUES ($1, $2, $3, $4)";

    try {
        await db.query(sql, [name, email, subject, message]);
        res.status(200).json({ message: "Mensaje enviado con éxito" });
    } catch (err) {
        console.error("❌ Error al insertar datos:", err.message);
        res.status(500).json({ message: "Error en el servidor" });
    }
}