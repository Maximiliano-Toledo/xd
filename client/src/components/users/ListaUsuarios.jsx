import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardDoubleArrowRight, MdSubdirectoryArrowLeft, MdEdit, MdClose } from 'react-icons/md';
import AuthService from '../../api/services/authService';
import HeaderStaff from '../../layouts/HeaderStaff';
import Pagination from '../../components/Pagination';
import '../../styles/panel-usuario-nuevo.css';

export default function ListaUsuarios() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const handleVolver = () => {
    navigate(-1);
  };

  const fetchUsers = async () => {
    try {
        setLoading(true);
        const response = await AuthService.getAllUsers(currentPage, itemsPerPage);
        setUsers(response.data.items);
        // Convertir a número los valores de paginación
        setTotalItems(Number(response.data.pagination.totalItems));
        setCurrentPage(Number(response.data.pagination.currentPage));
        setItemsPerPage(Number(response.data.pagination.itemsPerPage));
        setLoading(false);
    } catch (err) {
        setError(err.message || 'Error al cargar los usuarios');
        setLoading(false);
    }
    };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      password: '',
      confirmPassword: ''
    });
    setEditMode(false);
    setErrors({});
    setSuccessMessage('');
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditForm({
      email: selectedUser.email,
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editForm.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Solo validar contraseña si se está cambiando
    if (editForm.password || editForm.confirmPassword) {
      if (!editForm.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (!validatePassword(editForm.password)) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
      }

      if (!editForm.confirmPassword) {
        newErrors.confirmPassword = 'Debes confirmar la contraseña';
      } else if (editForm.password !== editForm.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateEditForm()) return;

    try {
      await AuthService.editUser(
        selectedUser.id,
        editForm.email,
        editForm.password || undefined // Solo enviar password si se cambió
      );
      
      setSuccessMessage('Usuario actualizado con éxito');
      setEditMode(false);
      // Actualizar la lista de usuarios
      fetchUsers();
      // Actualizar el usuario seleccionado
      setSelectedUser({
        ...selectedUser,
        email: editForm.email
      });
    } catch (error) {
      if (error.message === 'El email ya está registrado') {
        setErrors({
          ...errors,
          email: error.message
        });
      } else {
        setErrors({
          ...errors,
          general: error.message || 'Ocurrió un error al actualizar el usuario'
        });
      }
    }
  };

  return (
    <div>
      <HeaderStaff />
      <div className="container-fluid px-3 px-md-4">
        <h1 className="fs-3 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-3 mb-3">
          Panel usuario
        </h1>
        
        <div className="row justify-content-center mb-4">
          <div className="col-12">
            <div className="border shadow-input p-3 rounded-3 shadow">
              <h6 className="fs-4 fs-md-2 h1-titulo fw-bold border p-2 d-flex align-items-center">
                <div className="rounded-color d-flex justify-content-center align-items-center me-2 me-md-4">
                  <MdOutlineKeyboardDoubleArrowRight className="fs-3 fs-md-1 text-white" />
                </div>
                <span>Lista de usuarios</span>
              </h6>
              <h2 className="fs-5 fs-md-2 h1-titulo p-2 fw-normal">
                Seleccione un usuario para ver o editar sus datos.
              </h2>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : (
              <div className="border shadow-input rounded-3 shadow">
                <div className="row">
                  {/* Lista de usuarios */}
                  <div className="col-md-6">
                    <div className="p-3">
                      <h5 className="title-style fs-4 mb-3">Usuarios</h5>
                      <div className="list-group">
                        {users.map(user => (
                          <div
                            key={user.id}
                            className={`list-group-item list-group-item-action ${selectedUser?.id === user.id ? 'active' : ''}`}
                            onClick={() => handleSelectUser(user)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{user.username}</strong> - {user.email}
                                <div className="small">Rol: {user.role}</div>
                              </div>
                              {selectedUser?.id === user.id && (
                                <button 
                                  className="btn btn-sm btn-outline-light"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick();
                                  }}
                                >
                                  <MdEdit />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Paginación */}
                      <div className="mt-3">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={Math.ceil(totalItems / itemsPerPage)}
                          onPageChange={setCurrentPage}
                          itemsPerPage={itemsPerPage}
                          onItemsPerPageChange={setItemsPerPage}
                          totalItems={totalItems}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detalle/Edición del usuario */}
                  <div className="col-md-6">
                    <div className="p-3 border-start">
                      {selectedUser ? (
                        <div>
                          <h5 className="title-style fs-4 mb-3">
                            {editMode ? 'Editar usuario' : 'Detalle del usuario'}
                          </h5>

                          {errors.general && (
                            <div className="alert alert-danger">{errors.general}</div>
                          )}

                          {successMessage && (
                            <div className="alert alert-success">{successMessage}</div>
                          )}

                          {editMode ? (
                            <form onSubmit={handleEditSubmit}>
                              <div className="mb-3">
                                <label className="form-label">Nombre de usuario</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={selectedUser.username}
                                  readOnly
                                  disabled
                                />
                              </div>

                              <div className="mb-3">
                                <label htmlFor="editEmail" className="form-label">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                  id="editEmail"
                                  name="email"
                                  value={editForm.email}
                                  onChange={handleEditChange}
                                />
                                {errors.email && (
                                  <div className="invalid-feedback">{errors.email}</div>
                                )}
                              </div>

                              <div className="mb-3">
                                <label htmlFor="editPassword" className="form-label">
                                  Nueva contraseña (opcional)
                                </label>
                                <input
                                  type="password"
                                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                  id="editPassword"
                                  name="password"
                                  value={editForm.password}
                                  onChange={handleEditChange}
                                  placeholder="Dejar en blanco para no cambiar"
                                />
                                {errors.password && (
                                  <div className="invalid-feedback">{errors.password}</div>
                                )}
                              </div>

                              <div className="mb-3">
                                <label htmlFor="editConfirmPassword" className="form-label">
                                  Confirmar nueva contraseña
                                </label>
                                <input
                                  type="password"
                                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                  id="editConfirmPassword"
                                  name="confirmPassword"
                                  value={editForm.confirmPassword}
                                  onChange={handleEditChange}
                                  placeholder="Solo si cambió la contraseña"
                                />
                                {errors.confirmPassword && (
                                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                                )}
                              </div>

                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={handleCancelEdit}
                                >
                                  <MdClose /> Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="btn btn-search"
                                >
                                  <MdEdit /> Guardar cambios
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div>
                              <div className="mb-3">
                                <label className="form-label">Nombre de usuario</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={selectedUser.username}
                                  readOnly
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={selectedUser.email}
                                  readOnly
                                />
                              </div>

                              <div className="mb-3">
                                <label className="form-label">Rol</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={selectedUser.role}
                                  readOnly
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-muted p-4">
                          <h5>Seleccione un usuario para ver los detalles</h5>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón volver */}
        <div className="back-button-container mb-4 text-center text-md-start">
          <button className="back-button" onClick={handleVolver}>
            <MdSubdirectoryArrowLeft />
            <span>Volver</span>
          </button>
        </div>
      </div>
    </div>
  );
}