const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Obtener usuarios
router.get('/', (req, res) => {
	const query = 'SELECT id, nombre, email FROM usuarios ORDER BY id DESC';

	db.query(query, (err, results) => {
		if (err) {
			console.error('Error al obtener usuarios:', err);
			return res.status(500).json({
				error: 'Error al obtener usuarios',
				details: err.message,
			});
		}
		res.json(results);
	});
});

// Crear un nuevo usuario (hash de contraseña con bcrypt)
router.post('/', (req, res) => {
	const { nombre, email, password } = req.body;

	if (!nombre || !email || !password) {
		return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
	}

	// comprobar si ya existe el email
	const checkQuery = 'SELECT id FROM usuarios WHERE email = ? LIMIT 1';
	db.query(checkQuery, [email], (err, rows) => {
		if (err) {
			console.error('Error comprobando usuario existente:', err);
			return res.status(500).json({ error: 'Error del servidor' });
		}

		if (rows.length > 0) {
			return res.status(409).json({ error: 'El email ya está registrado' });
		}

		// hashear la contraseña antes de insertar
		const saltRounds = 10;
		const hashed = bcrypt.hashSync(password, saltRounds);

		const insertQuery = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
		db.query(insertQuery, [nombre, email, hashed], (insertErr, result) => {
			if (insertErr) {
				console.error('Error insertando usuario:', insertErr);
				return res.status(500).json({ error: 'Error al crear usuario' });
			}

			const newUser = {
				id: result.insertId,
				nombre,
				email,
			};

			res.status(201).json({ message: 'Usuario creado', usuario: newUser });
		});
	});
});

// Actualizar usuario (puede incluir cambio de contraseña)
router.put('/:id', (req, res) => {
	const { id } = req.params;
	const { nombre, email, password } = req.body;

	// Construir campos a actualizar
	const fields = [];
	const values = [];

	if (nombre) {
		fields.push('nombre = ?');
		values.push(nombre);
	}
	if (email) {
		fields.push('email = ?');
		values.push(email);
	}
	if (password) {
		const hashed = bcrypt.hashSync(password, 10);
		fields.push('password = ?');
		values.push(hashed);
	}

	if (fields.length === 0) {
		return res.status(400).json({ error: 'No hay campos para actualizar' });
	}

	const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
	values.push(id);

	db.query(query, values, (err, result) => {
		if (err) {
			console.error('Error actualizando usuario:', err);
			return res.status(500).json({ error: 'Error al actualizar usuario' });
		}
		res.json({ message: 'Usuario actualizado' });
	});
});

// Eliminar usuario
router.delete('/:id', (req, res) => {
	const { id } = req.params;
	const query = 'DELETE FROM usuarios WHERE id = ?';
	db.query(query, [id], (err, result) => {
		if (err) {
			console.error('Error eliminando usuario:', err);
			return res.status(500).json({ error: 'Error al eliminar usuario' });
		}
		res.json({ message: 'Usuario eliminado' });
	});
});

// Reset simple de contraseña: requiere email y nueva contraseña
router.post('/reset-password', (req, res) => {
	const { email, newPassword } = req.body;
	if (!email || !newPassword) {
		return res.status(400).json({ error: 'Email y nueva contraseña son requeridos' });
	}

	const checkQuery = 'SELECT id FROM usuarios WHERE email = ? LIMIT 1';
	db.query(checkQuery, [email], (err, rows) => {
		if (err) {
			console.error('Error buscando usuario para reset:', err);
			return res.status(500).json({ error: 'Error del servidor' });
		}
		if (rows.length === 0) {
			return res.status(404).json({ error: 'Usuario no encontrado' });
		}

		const hashed = bcrypt.hashSync(newPassword, 10);
		const updateQuery = 'UPDATE usuarios SET password = ? WHERE email = ?';
		db.query(updateQuery, [hashed, email], (updErr) => {
			if (updErr) {
				console.error('Error actualizando contraseña:', updErr);
				return res.status(500).json({ error: 'Error al actualizar contraseña' });
			}
			res.json({ message: 'Contraseña actualizada' });
		});
	});
});

module.exports = router;