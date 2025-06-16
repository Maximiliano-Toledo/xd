import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/index.css'
import './styles/cartilla.css'
import ProtectedRoute from './components/ProtectedRoute';
import { FormCartillaPage } from './containers/pages/FormCartillaPage';
import { LoginPage } from './containers/pages/LoginPage';
import { ForgotPassPage } from './containers/pages/ForgotPassPage';
import { ResetPassPage } from './containers/pages/ResetPassPage';
import { LogoutPage } from './containers/pages/LogoutPage';
import StaffLayout from "./layouts/StaffLayout";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas publicas */}
        <Route path="/" element={<FormCartillaPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/olvide-contrasena" element={<ForgotPassPage />} />
        <Route path="/restablecer-contrasena" element={<ResetPassPage />} />

        {/* Rutas privadas */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="*" element={<StaffLayout />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>

        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
