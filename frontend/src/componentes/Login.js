import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  const [mode, setMode] = useState('login'); // login | register | forgot
  const [nombre, setNombre] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post('http://localhost:5001/api/login', { email, password });
      if (res.data && res.data.usuario) {
        onLogin(res.data.usuario);
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/usuarios', { nombre, email, password });
      if (res.data && res.data.usuario) {
        setMessage('Cuenta creada correctamente. Puedes iniciar sesión.');
        setNombre(''); setEmail(''); setPassword('');
        setMode('login');
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/usuarios/reset-password', { email, newPassword });
      if (res.data && res.data.message) {
        setMessage('Contraseña actualizada correctamente. Inicia sesión con la nueva contraseña.');
        setEmail(''); setNewPassword('');
        setMode('login');
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-outer">
      <div className="login-card">
        <h2 style={{ marginTop: 0 }}>{mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Recuperar contraseña'}</h2>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="user-form">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Contraseña</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="user-form">
            <label>Nombre</label>
            <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Contraseña</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="user-form">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Nueva contraseña</label>
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Actualizando...' : 'Cambiar contraseña'}</button>
          </form>
        )}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          {mode !== 'login' ? <button className="btn-link" onClick={() => { setMode('login'); setError(null); setMessage(null); }}>Volver a iniciar sesión</button>
            : <button className="btn-link" onClick={() => { setMode('register'); setError(null); setMessage(null); }}>Crear cuenta</button>}

          {mode !== 'forgot' && <button className="btn-link" onClick={() => { setMode('forgot'); setError(null); setMessage(null); }}>Olvidé mi contraseña</button>}
        </div>

        {error && <div className="msg-error" style={{ marginTop: 12 }}>{error}</div>}
        {message && <div className="msg-success" style={{ marginTop: 12 }}>{message}</div>}
      </div>
    </div>
  );
}

export default Login;
