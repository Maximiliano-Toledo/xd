
import Sidebar from './Sidebar'
import { Route, Routes } from 'react-router'
import { FormCartilla } from '../components/FormCartilla'
import RegisterForm from '../containers/pages/RegisterForm'
import AdminDashboardPage from '../containers/pages/AdminDashboardPage'
import CargaMasivaPage from '../containers/pages/CargaMasivaPage'
import CargaIndividualPage from '../containers/pages/CargaIndividualPage'
import InfoPage from '../containers/pages/InfoPage'
import BajaIndividualPage from '../containers/pages/BajaIndividualPage'
import EspecialidadPage from '../containers/pages/EspecialidadPage'
import BajaMasiva from '../components/BajaMasiva'
import GestionPlanPage from '../containers/pages/GestionPlanPage'
import EditarPlan from '../components/plan/EditarPlan'
import CrearPlan from '../components/plan/CrearPlan'
import EditarEspecialidad from '../components/especialidades/EditarEspecialidad'
import CrearEspecialidad from '../components/especialidades/CrearEspecialidad'
import PanelUsuarioPage from '../containers/pages/PanelUsuarioPage'
import Historial from '../components/panel/Historial'
import ChangePass from '../components/panel/ChangePass'
import EditarPrestadorPage from '../containers/pages/EditarCartillaPage'

export default function StaffLayout() {
  
  return (
    <Sidebar>
      <Routes>
        <Route path='/' element={<FormCartilla />} />
        <Route path='/register' element={<RegisterForm />} />
        <Route path='/admin/dashboard' element={<AdminDashboardPage />} />


        <Route path='/carga-masiva' element={<CargaMasivaPage />} />
        <Route path='/carga-individual' element={<CargaIndividualPage />} />
        <Route path='/editar-prestador' element={<EditarPrestadorPage />} />

        {/*Planes*/}
        <Route path='/gestion-plan' element={<GestionPlanPage />} />
        <Route path='/editar-plan' element={<EditarPlan />} />
        <Route path='/crear-plan' element={<CrearPlan/> } />

        {/*Especialidades*/}
        <Route path='/gestion-especialidad' element={<EspecialidadPage />} />
        <Route path ='/editar-especialidad' element={<EditarEspecialidad/>} />
        <Route path= '/crear-especialidad' element={<CrearEspecialidad/> } />


        <Route path='/info' element={<InfoPage />} />
        <Route path='/baja-masiva' element={<BajaMasiva />} />
        <Route path='/baja-individual' element={<BajaIndividualPage />} />

        {/* Usuario */}
        <Route path='/panel-usuario' element={<PanelUsuarioPage />} />
        <Route path='/cambiar-contraseña' element={<ChangePass />} />
        <Route path='/historial-actividad' element={<Historial />} />
        
      </Routes>
    </Sidebar>
  )
}
