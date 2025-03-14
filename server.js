const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session')
const app = express();
const PORT = process.env.PORT || 5000;

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 30,
        httpOnly: true,
        secure: false
    }
}))

app.use(cors({
    origin:'https://hiddenfrontend.onrender.com',
    credentials: true,
    methods: ['GET','POST']
}));
app.use(bodyParser.json());

const db = require('./config/db');
db.connect()
  .then(() => console.log("✅ Conexión exitosa a PostgreSQL en Render"))
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err.message));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
