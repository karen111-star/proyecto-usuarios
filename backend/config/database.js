const mysql = require('mysql2');
// Cargar variables de entorno opcionales desde .env
require('dotenv').config();

const connection = mysql.createConnection({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASS || '',
	database: process.env.DB_NAME || 'usuarios_app',
});

connection.connect((err) => {
	if (err) {
		console.error('Error conectando a la base de datos:', err);
		return;
	}
	console.log('✅ Conectado a MySQL');
});

module.exports = connection;
