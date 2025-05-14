import { MdSubdirectoryArrowLeft } from "react-icons/md";
import { Footer } from "../../layouts/Footer";
import HeaderStaff from "../../layouts/HeaderStaff";
import { Link, useNavigate } from "react-router";
import {
    LuCircleUser,
    LuUserCog,
    LuHistory,
    LuLogOut,
    LuKey,
    LuShield,
    LuBell,
    LuSettings,
    LuChevronRight
} from "react-icons/lu";
import '../../styles/panel-usuario-nuevo.css'

const PanelUsuario = () => {
    const navigate = useNavigate();
    const handleVolver = () => {
        navigate(-1);
    };

    // Datos del usuario (en un caso real vendrían del store/contexto)
    const userData = {
        username: "usuario@empresa.com",
        role: "Administrador",
        lastLogin: "Hoy, 14:30",
        totalActions: 127,
        lastAction: "Carga individual - Prestador",
        actionDate: "Hace 2 horas"
    };

    const menuItems = [
        {
            id: 'change-password',
            title: 'Cambiar contraseña',
            description: 'Actualiza tu contraseña de acceso',
            icon: <LuKey />,
            link: '/cambiar-contraseña',
            color: 'blue'
        },
        {
            id: 'activity-history',
            title: 'Historial de actividad',
            description: 'Revisa tus acciones recientes',
            icon: <LuHistory />,
            link: '/historial-actividad',
            color: 'purple'
        },
        {
            id: 'account-settings',
            title: 'Configuración de cuenta',
            description: 'Personaliza tu experiencia',
            icon: <LuSettings />,
            link: '/configuracion-cuenta',
            color: 'orange'
        },
        {
            id: 'logout',
            title: 'Cerrar sesión',
            description: 'Salir del sistema de forma segura',
            icon: <LuLogOut />,
            link: '/logout',
            color: 'red'
        }
    ];

    const statsCards = [
        {
            title: 'Total de acciones',
            value: userData.totalActions,
            icon: <LuUserCog />,
            color: 'green'
        },
        {
            title: 'Último acceso',
            value: userData.lastLogin,
            icon: <LuShield />,
            color: 'blue'
        },
        {
            title: 'Última acción',
            value: userData.lastAction,
            subtitle: userData.actionDate,
            icon: <LuBell />,
            color: 'purple'
        }
    ];

    return (
        <div className="panel-usuario-container">
            <HeaderStaff />

            {/* Header mejorado */}
            <div className="panel-header">
                <div className="container">
                    <h1 className="panel-title">Panel Usuario</h1>
                    <p className="panel-subtitle">
                        Gestiona tu cuenta, revisa tu actividad y configura tus preferencias
                    </p>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="panel-content">
                <div className="container">
                    <div className="panel-grid">

                        {/* Tarjeta de perfil */}
                        <div className="profile-card">
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    <LuCircleUser />
                                </div>
                                <div className="profile-info">
                                    <h2 className="profile-name">{userData.username}</h2>
                                    <span className="profile-role">{userData.role}</span>
                                </div>
                            </div>

                            <div className="profile-details">
                                <div className="detail-item">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{userData.username}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Rol:</span>
                                    <span className="detail-value">{userData.role}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Último acceso:</span>
                                    <span className="detail-value">{userData.lastLogin}</span>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="stats-grid">
                            {statsCards.map((stat, index) => (
                                <div key={index} className={`stat-card stat-card-${stat.color}`}>
                                    <div className="stat-icon">
                                        {stat.icon}
                                    </div>
                                    <div className="stat-content">
                                        <h3 className="stat-value">{stat.value}</h3>
                                        <p className="stat-title">{stat.title}</p>
                                        {stat.subtitle && (
                                            <p className="stat-subtitle">{stat.subtitle}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Menú de acciones */}
                        <div className="actions-section">
                            <h2 className="section-title">Acciones rápidas</h2>
                            <div className="actions-grid">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={item.link}
                                        className={`action-card action-card-${item.color}`}
                                    >
                                        <div className="action-icon">
                                            {item.icon}
                                        </div>
                                        <div className="action-content">
                                            <h3 className="action-title">{item.title}</h3>
                                            <p className="action-description">{item.description}</p>
                                        </div>
                                        <div className="action-arrow">
                                            <LuChevronRight />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón volver */}
            <div className="back-button-container">
                <button className="back-button" onClick={handleVolver}>
                    <MdSubdirectoryArrowLeft />
                    <span>Volver</span>
                </button>
            </div>

            <Footer />
        </div>
    );
}

export default PanelUsuario;