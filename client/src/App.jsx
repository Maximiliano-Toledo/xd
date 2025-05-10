import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboardPage from "./containers/pages/AdminDashboardPage";
import './styles/index.css'
import './styles/cartilla.css'
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import { FormCartillaPage } from './containers/pages/FormCartillaPage';
import { LoginPage } from './containers/pages/LoginPage';
import { LogoutPage } from './containers/pages/LogoutPage';
import StaffLayout from "./layouts/StaffLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas publicas */}
        <Route path="/" element={<FormCartillaPage />} />
        <Route path="/login" element={<LoginPage />} />


        {/* Rutas privadas */}
        <Route element={<ProtectedRoute />}>

          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            {/* Rutas con Layout (Sidebar) */}


          </Route>

          <Route path="/user/dashboard" element={<div>User</div>} />

          <Route path="/logout" element={<LogoutPage />} />
        </Route>

        <Route path="*" element={<StaffLayout />} />





        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}


export default App
