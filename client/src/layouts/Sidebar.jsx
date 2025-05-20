import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  IoMdHome,
  IoIosCreate,
  IoIosInformationCircleOutline
} from "react-icons/io";
import {
  AiOutlineFileAdd,
  AiOutlineMenu,
  AiOutlineClose
} from "react-icons/ai";
import {
  RiFileList3Line,
  RiMedicineBottleLine
} from "react-icons/ri";
import {
  FiUser,
  FiChevronDown,
  FiChevronRight
} from "react-icons/fi";
import {
  FaPowerOff,
  FaStethoscope
} from "react-icons/fa6";
import {
  CiFolderOn
} from "react-icons/ci";
import {
  GoDownload,
  GoUpload
} from "react-icons/go";
import {
  PiNumberSquareOneLight,
  PiNumberSquareTwoLight
} from "react-icons/pi";
import {
  LuLogOut
} from "react-icons/lu";
import Logo from "../components/utils/Logo";
import "../styles/sidebar-nuevo.css";

export default function Sidebar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Detectar cambios de tamaño de ventana con throttling para mejor performance
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);

    // En desktop, mantener el sidebar siempre visible
    if (!mobile) {
      setIsMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    // Detectar el tamaño inicial
    handleResize();

    // Throttled resize handler
    let timeoutId;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isMobileMenuOpen]);

  const toggleSubmenu = (key) => {
    setActiveSubmenu(activeSubmenu === key ? null : key);
  };

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const menuItems = [
    {
      key: "home",
      icon: <IoMdHome />,
      label: "Gestión de cartilla",
      path: "/admin/dashboard",
      type: "link"
    },
    {
      key: "vista",
      icon: <RiFileList3Line />,
      label: "Vista",
      path: "/",
      type: "link"
    },
    {
      key: "cargar",
      icon: <GoUpload />,
      label: "Carga",
      type: "submenu",
      children: [
        {
          key: "individual",
          icon: <PiNumberSquareOneLight />,
          label: "Carga Individual",
          path: "/carga-individual"
        },
        {
          key: "masiva",
          icon: <PiNumberSquareTwoLight />,
          label: "Carga Masiva",
          path: "/carga-masiva"
        }
      ]
    },
    {
      key: "descargar",
      icon: <GoDownload />,
      label: "Descargar cartilla",
      type: "submenu",
      children: [
        {
          key: "pdf",
          icon: <PiNumberSquareOneLight />,
          label: "Descargar PDF",
          path: "/descargar-cartilla-pdf"
        },
        {
          key: "csv",
          icon: <PiNumberSquareTwoLight />,
          label: "Descargar CSV",
          path: "/descargar-cartilla-csv"
        }
      ]
    },
    {
      key: "editar",
      icon: <IoIosCreate />,
      label: "Editar prestador",
      path: "/editar-prestador",
      type: "link"
    },
    {
      key: "plan",
      icon: <CiFolderOn />,
      label: "Gestión de planes",
      path: "/gestion-plan",
      type: "link"
    },
    {
      key: "especialidad",
      icon: <FaStethoscope />,
      label: "Gestión especialidades",
      path: "/gestion-especialidad",
      type: "link"
    },
    {
      key: "usuario",
      icon: <FiUser />,
      label: "Panel de usuario",
      path: "/panel-usuario",
      type: "link"
    },
    {
      key: "salir",
      icon: <LuLogOut />,
      label: "Cerrar sesión",
      path: "/logout",
      type: "link",
      className: "logout-item"
    },
    {
      key: "info",
      icon: <IoIosInformationCircleOutline />,
      label: "Info",
      path: "/info",
      type: "link",
      className: "info-item"
    }
  ];

  const handleMenuClick = useCallback((item) => {
    if (item.type === "submenu") {
      toggleSubmenu(item.key);
    } else {
      navigate(item.path);
      // Cerrar menú en móvil al navegar
      if (isMobile) {
        setIsMobileMenuOpen(false);
      }
    }
  }, [navigate, isMobile, toggleSubmenu]);

  const handleSubmenuClick = useCallback((path) => {
    navigate(path);
    // Cerrar menú en móvil al navegar
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [navigate, isMobile]);

  const handleOverlayClick = useCallback(() => {
    if (isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  const renderMenuItem = (item, collapsed = false) => {
    const isActive = location.pathname === item.path;
    const isSubmenuActive = item.type === "submenu" &&
      item.children?.some(child => location.pathname === child.path);

    if (item.type === "submenu") {
      // En modo colapsado, no mostrar submenús
      if (collapsed) {
        // Mostrar solo el icono principal y navegar al primer hijo
        return (
          <div
            key={item.key}
            className={`menu-item collapsed-item ${isSubmenuActive ? 'active' : ''} ${item.className || ''}`}
            onClick={() => handleSubmenuClick(item.children[0].path)}
            title={item.label}
          >
            <div className="menu-item-content">
              <div className="menu-item-icon">
                {item.icon}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div key={item.key} className="menu-item-container">
          <div
            className={`menu-item menu-item-submenu ${isSubmenuActive ? 'active' : ''} ${item.className || ''}`}
            onClick={() => handleMenuClick(item)}
          >
            <div className="menu-item-content">
              <div className="menu-item-icon">
                {item.icon}
              </div>
              <span className="menu-item-label">{item.label}</span>
            </div>
            <div className={`menu-item-arrow ${activeSubmenu === item.key ? 'open' : ''}`}>
              <FiChevronDown />
            </div>
          </div>
          <div className={`submenu ${activeSubmenu === item.key ? 'open' : ''}`}>
            {item.children?.map(child => (
              <div
                key={child.key}
                className={`submenu-item ${location.pathname === child.path ? 'active' : ''}`}
                onClick={() => handleSubmenuClick(child.path)}
              >
                <div className="submenu-item-icon">
                  {child.icon}
                </div>
                <span className="submenu-item-label">{child.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Items normales
    if (collapsed) {
      return (
        <div
          key={item.key}
          className={`menu-item collapsed-item ${isActive ? 'active' : ''} ${item.className || ''}`}
          onClick={() => handleMenuClick(item)}
          title={item.label}
        >
          <div className="menu-item-content">
            <div className="menu-item-icon">
              {item.icon}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.key}
        className={`menu-item ${isActive ? 'active' : ''} ${item.className || ''}`}
        onClick={() => handleMenuClick(item)}
      >
        <div className="menu-item-content">
          <div className="menu-item-icon">
            {item.icon}
          </div>
          <span className="menu-item-label">{item.label}</span>
        </div>
        <div className="menu-item-indicator">
          <FiChevronRight />
        </div>
      </div>
    );
  };

  // Calcular clases del sidebar
  const getSidebarClasses = () => {
    const classes = ['sidebar'];

    if (isMobile) {
      classes.push(isMobileMenuOpen ? 'mobile-visible' : 'mobile-hidden');
    } else if (isCollapsed) {
      classes.push('collapsed');
    }

    return classes.join(' ');
  };

  // Calcular clases del contenido principal
  const getMainContentClasses = () => {
    const classes = ['main-content'];

    if (isMobile) {
      classes.push('mobile-layout');
    } else if (isCollapsed) {
      classes.push('sidebar-collapsed');
    }

    return classes.join(' ');
  };

  return (
    <div className="staff-layout">
      {/* Mobile Header */}
      {isMobile && (
        <div className="mobile-header">
          <div className="mobile-header-content">
            <div className="mobile-logo">
              <Logo />
            </div>
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={getSidebarClasses()}>
        {/* Botón colapsar solo en desktop */}
        {!isMobile && (
          <button
            className="sidebar-collapse-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <FiChevronRight /> : <AiOutlineClose />}
          </button>
        )}

        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Logo />
          </div>
          {(!isCollapsed || isMobile) && (
            <h3 className="sidebar-title">Panel Administrativo</h3>
          )}
        </div>

        <nav className="sidebar-nav" role="navigation">
          <div className="menu-section">
            {(!isCollapsed || isMobile) && (
              <h4 className="menu-section-title">Navegación Principal</h4>
            )}
            <div className="menu-items" role="menubar">
              {menuItems.slice(0, -2).map(item => renderMenuItem(item, isCollapsed && !isMobile))}
            </div>
          </div>

          <div className="menu-section">
            {(!isCollapsed || isMobile) && (
              <h4 className="menu-section-title">Sistema</h4>
            )}
            <div className="menu-items" role="menubar">
              {menuItems.slice(-2).map(item => renderMenuItem(item, isCollapsed && !isMobile))}
            </div>
          </div>
        </nav>

        {(!isCollapsed || isMobile) && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-content">
              <p className="sidebar-footer-text">
                OSSACRA - Sistema de Gestión
              </p>
              <p className="sidebar-footer-version">v2.0.0</p>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className={getMainContentClasses()} role="main">
        <div className="main-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}