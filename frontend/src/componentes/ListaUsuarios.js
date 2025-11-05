import React, { useEffect, useState } from "react";
import axios from "axios";

function UserList() {
  const [users, setUsers] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedNombre, setEditedNombre] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  const fetchUsers = () => {
    axios
      .get("http://localhost:5001/api/usuarios")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/api/usuarios", {
        nombre,
        email,
        password,
      });

      if (res.data && res.data.usuario) {
        setMessage({ type: "success", text: "Usuario creado correctamente" });
        setNombre("");
        setEmail("");
        setPassword("");
        fetchUsers();
      } else {
        setMessage({ type: "error", text: "Respuesta inesperada del servidor" });
      }
    } catch (err) {
      const errMsg = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : "Error de conexión";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/usuarios/${id}`);
      setMessage({ type: 'success', text: 'Usuario eliminado' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al eliminar' });
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditedNombre(u.nombre);
    setEditedEmail(u.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedNombre('');
    setEditedEmail('');
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/usuarios/${id}`, {
        nombre: editedNombre,
        email: editedEmail,
      });
      setMessage({ type: 'success', text: 'Usuario actualizado' });
      cancelEdit();
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar' });
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h2>Agregar usuario</h2>
        <form onSubmit={handleCreate} className="user-form">
          <label>Nombre</label>
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

          <label>Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Contraseña</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear usuario'}</button>
        </form>

        {message && (
          <div className={message.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginTop: 12 }}>{message.text}</div>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2>Lista de usuarios</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {editingId === u.id ? (
                    <input className="input" value={editedNombre} onChange={(e) => setEditedNombre(e.target.value)} />
                  ) : (
                    u.nombre
                  )}
                </td>
                <td>
                  {editingId === u.id ? (
                    <input className="input" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} />
                  ) : (
                    u.email
                  )}
                </td>
                <td>
                  {editingId === u.id ? (
                    <>
                      <button className="btn-primary" onClick={() => saveEdit(u.id)} style={{ marginRight: 8 }}>Guardar</button>
                      <button className="btn-link" onClick={cancelEdit}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-primary" onClick={() => startEdit(u)} style={{ marginRight: 8 }}>Editar</button>
                      <button className="btn-link" onClick={() => handleDelete(u.id)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserList;
