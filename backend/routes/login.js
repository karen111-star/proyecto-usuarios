const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Ruta de login — soporta contraseñas en texto plano o bcrypt hash
router.post('/', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor ingrese correo y contraseña' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const usuario = results[0];

        // Si el password almacenado parece un hash bcrypt (empieza por $2), usar compare
        const stored = usuario.password || '';
        let passwordOk = false;

        try {
            if (stored.startsWith('$2')) {
                passwordOk = bcrypt.compareSync(password, stored);
            } else {
                // fallback: comparación plana (útil para datos legacy)
                passwordOk = stored === password;
            }
        } catch (e) {
            console.error('Error verificando contraseña:', e);
            return res.status(500).json({ error: 'Error verificando credenciales' });
        }

        if (!passwordOk) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // ✅ Login exitoso
        res.json({
            message: 'Login exitoso',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
            },
        });
    });
});

module.exports = router;
