const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');
const loginRoutes = require('./routes/login');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/login', loginRoutes);

// Root health
app.get('/', (req, res) => {
    res.json({ message: 'API de Usuarios funcionando correctamente' });
});

// Status endpoint: intenta una consulta mínima a la DB para confirmar conexión
const db = require('./config/database');
app.get('/api/status', (req, res) => {
    db.query('SELECT 1', (err) => {
        if (err) {
            console.error('DB status check failed:', err);
            return res.status(500).json({ db: 'down', error: err.message });
        }
        res.json({ db: 'ok' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
