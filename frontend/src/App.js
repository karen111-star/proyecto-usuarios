import React, { useState } from 'react';
import UserList from './componentes/ListaUsuarios';
import Login from './componentes/Login';

function App() {
	const [user, setUser] = useState(null);

	function handleLogin(usuario) {
		setUser(usuario);
	}

	function handleLogout() {
		setUser(null);
	}

		return (
			<div>
				<h1>Inicio de sesión</h1>

				{user ? (
				<div style={{ padding: '20px' }}>
					<p>
						Bienvenido, <strong>{user.nombre}</strong> ({user.email}){' '}
						<button onClick={handleLogout}>Cerrar sesión</button>
					</p>
					<UserList />
				</div>
			) : (
				<Login onLogin={handleLogin} />
			)}
		</div>
	);
}

export default App;