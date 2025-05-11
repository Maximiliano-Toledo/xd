import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { Footer } from "../../layouts/Footer";
import HeaderStaff from "../../layouts/HeaderStaff";
import { Link, useNavigate } from "react-router";
import { LuCircleUser } from "react-icons/lu";
import '../../styles/panel-usuario.css'
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { MdOutlineKeyboardDoubleArrowRight, MdOutlineAccountCircle, MdOutlineHistory, MdOutlineLogout } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { useEffect, useState } from "react";
import useAuthStore from '../../stores/authStore';

const PanelUsuario = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [userData, setUserData] = useState({ username: "Cargando..." });

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    const handleVolver = () => {
        navigate(-1);
    };

    const menuItems = [
        {
            title: "Editar contraseña",
            icon: <FiSettings className="menu-icon" />,
            description: "Actualiza tu contraseña para mantener tu cuenta segura",
            path: "/cambiar-contraseña"
        },
        {
            title: "Historial de actividad",
            icon: <MdOutlineHistory className="menu-icon" />,
            description: "Revisa tus acciones recientes en el sistema",
            path: "/historial-actividad"
        },
        {
            title: "Cerrar sesión",
            icon: <MdOutlineLogout className="menu-icon" />,
            description: "Finaliza tu sesión actual de manera segura",
            path: "/logout"
        }
    ];

    return (
        <div className="panel-usuario-container">
            <HeaderStaff />

            <div className="panel-header">
                <h1 className="panel-title">Panel de Usuario</h1>
                <p className="panel-subtitle">
                    Administra tu cuenta y accede a las funciones de usuario
                </p>
            </div>

            <div className="panel-content-container">
                <div className="panel-profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <LuCircleUser />
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-name">{userData.username}</h2>
                            <span className="profile-role">{userData.role || "Usuario"}</span>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{userData.email || "No disponible"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Última actividad:</span>
                            <span className="detail-value">Hoy, 10:45 AM</span>
                        </div>
                    </div>
                </div>

                <div className="panel-menu-container">
                    <h3 className="section-title">Gestión de cuenta</h3>

                    <div className="menu-grid">
                        {menuItems.map((item, index) => (
                            <Link to={item.path} className="menu-card" key={index}>
                                <div className="menu-icon-container">
                                    {item.icon}
                                </div>
                                <div className="menu-content">
                                    <h4 className="menu-title">{item.title}</h4>
                                    <p className="menu-description">{item.description}</p>
                                </div>
                                <div className="menu-arrow">
                                    <FaRegArrowAltCircleRight />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="panel-stats-container">
                    <h3 className="section-title">Resumen de actividad</h3>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-number">12</div>
                            <div className="stat-title">Ediciones este mes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">4</div>
                            <div className="stat-title">Cargas realizadas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">2</div>
                            <div className="stat-title">Acciones pendientes</div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                className='back-button'
                type='button'
                onClick={handleVolver}
            >
                <MdSubdirectoryArrowLeft />
                <span>Volver</span>
            </button>

            <Footer />
        </div>
    );
}

export default PanelUsuario;