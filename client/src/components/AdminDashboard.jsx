
import { Footer } from '../layouts/Footer'
import HeaderStaff from '../layouts/HeaderStaff'
import '../styles/dashboard.css'
import CardWithTab from './utils/CardWithTab';

export default function AdminDashboard() {


  const cardDataCargar = {
      title: "CARGAR CARTILLA",
        options: [
          { text: "Carga individual", link: "/carga-individual" },
          { text: "Carga masiva", link: "/carga-masiva" },
        ],
      description:
        "Seleccioná si querés ingresar una cartilla completa con una carga masiva o con una carga individual por prestador.",
  }

  const cardDataEditar = {
    title: "MODIFICAR REGISTRO",
      options: [
        { text: "Modificar registro", link: "/editar-prestador" },
      ],
    description:
      "Modificá registros de manera individual.",
  }

 


  return (
    <div>
        <HeaderStaff title="Gestión de cartilla"/>
        <p className="fs-3 font-p fw-bold w-75">Desde aquí podés agregar un nuevo archivo, editar registros existentes o eliminar lo que ya no necesitás. </p>
        
        
        <div className="d-flex justify-content-center align-items-start min-vh-75">
            <div className="w-100 d-flex flex-column border  shadow-input p-3 rounded-3 shadow m-4">
              
                <h6 className='subtitulo-dashboard fs-4 fw-bold ps-4 pb-5'>
                  Accedé a todas las herramientas disponibles
                </h6>
                
                  <div className='shadow-sm p-2 d-flex flex-wrap gap-4 justify-content-center'>

                    <div className="dashboard-container">
                      <CardWithTab {...cardDataCargar} />
                    </div>

                    
                    <div className="dashboard-container">
                      <CardWithTab {...cardDataEditar} />
                    </div>

                    

                  </div>
            </div>
        </div>

        <Footer/>
    </div>
  )
}
