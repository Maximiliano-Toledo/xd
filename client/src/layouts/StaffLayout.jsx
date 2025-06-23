import Sidebar from "./Sidebar";
import { Route, Routes, useLocation } from "react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { FormCartilla } from "../components/FormCartilla";
import RoleBasedRoute from "../components/RoleBasedRoute";
import "../styles/staff-layout.css";

// Lazy loading de componentes para mejor performance
const RegisterForm = lazy(() => import("../containers/pages/RegisterForm"));
const DashboardPage = lazy(() => import("../containers/pages/DashboardPage"));
const CargaMasivaPage = lazy(() =>
  import("../containers/pages/CargaMasivaPage")
);
const CargaIndividualPage = lazy(() =>
  import("../containers/pages/CargaIndividualPage")
);
const CargaPortadaPDFPage = lazy(() =>
  import("../containers/pages/CargaPortadaPDFPage")
);
const InfoPage = lazy(() => import("../containers/pages/InfoPage"));
const ManualUsuario = lazy(() => import("../components/info/ManualUsuario"));
const AnexoCargaMasiva = lazy(() => import("../components/info/AnexoCargaMasiva"));
const EspecialidadPage = lazy(() =>
  import("../containers/pages/EspecialidadPage")
);
const GestionPlanPage = lazy(() =>
  import("../containers/pages/GestionPlanPage")
);
const EditarPlan = lazy(() => import("../components/plan/EditarPlan"));
const PlanOrderManager = lazy(() =>
  import("../components/plan/PlanOrderManager")
);
const CrearPlan = lazy(() => import("../components/plan/CrearPlan"));
const EditarEspecialidad = lazy(() =>
  import("../components/especialidades/EditarEspecialidad")
);
const CrearEspecialidad = lazy(() =>
  import("../components/especialidades/CrearEspecialidad")
);
const PanelUsuarioPage = lazy(() =>
  import("../containers/pages/PanelUsuarioPage")
);
const Historial = lazy(() => import("../components/panel/Historial"));
const ChangePass = lazy(() => import("../components/panel/ChangePass"));
const EditarPrestadorPage = lazy(() =>
  import("../containers/pages/EditarCartillaPage")
);
const EditarPrestadorPorNombrePage = lazy(() =>
  import("../containers/pages/EditarPrestadorPorNombrePage")
);
const DescargarCartillaPDFPage = lazy(() =>
  import("../containers/pages/DescargarCartillaPDFPage")
);
const DescargarCartillaCSVPage = lazy(() =>
  import("../containers/pages/DescargarCartillaCSVPage")
);
const AltaUsuarioPage = lazy(() =>
  import("../containers/pages/AltaUsuarioPage")
);
const ListarUsuariosPage = lazy(() =>
  import("../containers/pages/ListarUsuariosPage")
);

// Componente de loading
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p className="loading-text">Cargando...</p>
    </div>
  </div>
);

// Componente de error 404
const NotFound = () => (
  <div className="not-found-container">
    <div className="not-found-content">
      <h1 className="not-found-title">404</h1>
      <h2 className="not-found-subtitle">Página no encontrada</h2>
      <p className="not-found-text">
        La página que buscas no existe o ha sido movida.
      </p>
      <button
        className="not-found-button"
        onClick={() => window.history.back()}
      >
        Volver atrás
      </button>
    </div>
  </div>
);

// Definición de rutas con metadatos
const routesConfig = [
  { path: "/", component: FormCartilla, title: "Vista de Cartilla" },
  { path: "/register", component: RegisterForm, title: "Registro" },
  {
    path: "/dashboard",
    component: DashboardPage,
    title: "Panel Administrativo",
  },

  // Rutas de users
  {
    path: "/alta-usuario",
    component: AltaUsuarioPage,
    title: "Alta de Usuario",
    allowedRoles: ["admin"],
  },
  {
    path: "/listar-usuarios",
    component: ListarUsuariosPage,
    title: "Listar Usuarios",
    allowedRoles: ["admin"],
  },

  // Rutas de carga
  { path: "/carga-masiva", component: CargaMasivaPage, title: "Carga Masiva" },
  {
    path: "/carga-individual",
    component: CargaIndividualPage,
    title: "Carga Individual",
  },
  {
    path: "/subir-portada-pdf",
    component: CargaPortadaPDFPage,
    title: "Carga Portada PDF",
  },
  {
    path: "/editar-prestador",
    component: EditarPrestadorPage,
    title: "Editar Prestador",
  },
  {
    path: "/editar-prestador-por-nombre",
    component: EditarPrestadorPorNombrePage,
    title: "Editar Prestador Por Nombre",
  },

  // Rutas de planes
  {
    path: "/gestion-plan",
    component: GestionPlanPage,
    title: "Gestión de Planes",
  },
  { path: "/editar-plan", component: EditarPlan, title: "Editar Plan" },
  { path: "/crear-plan", component: CrearPlan, title: "Crear Plan" },
  {
    path: "/ordenar-planes",
    component: PlanOrderManager,
    title: "Ordenar Planes",
  },

  // Rutas de especialidades
  {
    path: "/gestion-especialidad",
    component: EspecialidadPage,
    title: "Gestión de Especialidades",
  },
  {
    path: "/editar-especialidad",
    component: EditarEspecialidad,
    title: "Editar Especialidad",
  },
  {
    path: "/crear-especialidad",
    component: CrearEspecialidad,
    title: "Crear Especialidad",
  },

  // Rutas de usuario
  {
    path: "/panel-usuario",
    component: PanelUsuarioPage,
    title: "Panel de Usuario",
  },
  {
    path: "/cambiar-contraseña",
    component: ChangePass,
    title: "Cambiar Contraseña",
  },
  {
    path: "/historial-actividad",
    component: Historial,
    title: "Historial de Actividad",
  },

  // Rutas de descarga
  {
    path: "/descargar-cartilla-pdf",
    component: DescargarCartillaPDFPage,
    title: "Descargar PDF",
  },
  {
    path: "/descargar-cartilla-csv",
    component: DescargarCartillaCSVPage,
    title: "Descargar CSV",
  },

  // Información
  { path: "/info", component: InfoPage, title: "Información" },
  {
    path: "/manual-de-usuario",
    component: ManualUsuario,
    title: "Manual de Usuario",
  },
  {
    path: "/anexo-carga-masiva",
    component: AnexoCargaMasiva,
    title: "Anexo manual de usuario - Carga Masiva",
  },
];

// Componente envolvente que detecta el estado del sidebar
const SidebarWrapper = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Observar el sidebar para detectar cuando cambia su estado
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    const observer = new MutationObserver(() => {
      setIsCollapsed(sidebar.classList.contains("collapsed"));
    });

    observer.observe(sidebar, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Determinar las clases del main content
  const getMainContentClasses = () => {
    const classes = ["staff-main-content"];

    if (isMobile) {
      classes.push("mobile-layout");
    } else if (isCollapsed) {
      classes.push("sidebar-collapsed");
    }

    return classes.join(" ");
  };

  return (
    <Sidebar>
      <div className={getMainContentClasses()}>{children}</div>
    </Sidebar>
  );
};

export default function StaffLayout() {
  const location = useLocation();

  // Hook para actualizar el título de la página
  useEffect(() => {
    const currentRoute = routesConfig.find(
      (route) => route.path === location.pathname
    );
    if (currentRoute) {
      document.title = `${currentRoute.title} - OSSACRA`;
    }
  }, [location.pathname]);

  return (
    <div className="staff-layout-container">
      <SidebarWrapper>
        <div className="content-inner">
          <div className="main-content-wrapper">
            <div className="main-content-wrapper-flex">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {routesConfig.map(
                    ({ path, component: Component, allowedRoles }) => (
                      <Route
                        key={path}
                        path={path}
                        element={
                          allowedRoles ? (
                            <RoleBasedRoute allowedRoles={allowedRoles}>
                              <Component />
                            </RoleBasedRoute>
                          ) : (
                            <Component />
                          )
                        }
                      />
                    )
                  )}

                  {/* Ruta 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </div>
      </SidebarWrapper>
    </div>
  );
}
