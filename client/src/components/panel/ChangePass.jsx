import React, { useState } from 'react'
import HeaderStaff from '../../layouts/HeaderStaff'
import { MdOutlineKeyboardDoubleArrowRight, MdSubdirectoryArrowLeft } from 'react-icons/md'
import { useNavigate } from 'react-router';
import { LuCircleUser } from 'react-icons/lu';


export default function ChangePass() {

  const navigate = useNavigate();
  const handleVolver = () => {
      navigate(-1);
  };

  const [showPassword, setShowPassword] = useState(false);
  
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (
    <div>
        <HeaderStaff />
            <h6 className="w-25 fs-3 text-center pb-2 pt-2 rounded-top rounded-bottom fw-bold text-white p-container mt-0 mb-0 m-4 ">
                Panel usuario
            </h6>
            <div className="d-flex justify-content-center align-items-start min-vh-25 mt-0">
                <div className="w-100 d-flex flex-column border shadow-input p-3 rounded-3 shadow ps-5 ms-4 me-4 ">
                    <h1 className="fs-2 h1-titulo fw-bold border p-2 d-flex align-items-center"> 
                        <div className='rounded-color d-flex justify-content-center align-items-center me-4'>
                          <MdOutlineKeyboardDoubleArrowRight className="fs-1 text-white  " /> 
                        </div>
                        Editar contraseña
                    </h1>
                    <h2 className="fs-2 h1-titulo p-2 fw-normal">     
                    Modificá tu contraseña actual por una nueva de forma segura.
                    </h2>
                </div>
            </div>


            <div className="d-flex justify-content-center align-items-start min-vh-75">
                <div className="w-100 d-flex flex-column border shadow-input rounded-3 shadow m-4">  
                    <div className="d-flex flex-column flex-md-row gap-5 justify-content-center m-4">

                      {/**Sección de usuario */} 
                        <div className="border m-3 p-3 rounded-3 shadow" style={{ width: '25rem', height: '11rem' }} >
                            <div className="card-body">
                                <h6 className="subtitle-style fs-5 mb-3">Mi perfil</h6>
                                    <div className="d-flex align-items-start mb-2">
                                        <LuCircleUser className="me-2 user-style" />
                                        <div className="ms-1">
                                            <h5 className="title-style fs-4 mb-0 mt-1">Usuario:</h5>
                                            <p className="mb-0 fs-5">Acá va el nombre de usuario</p>
                                        </div>
                                    </div>
                            </div>
                        </div>


                        {/**Sección de cambiar contraseña */} 
                        <div className="border m-4 p-3 rounded-3 shadow" style={{ width: '29rem' }}>
                            <form className="card-body">
                                <h5 className="title-style fs-3">Cambiar contraseña</h5>
                                    
                                <div className="mb-4">
                                  <label htmlFor="password" className="form-label">
                                    Contraseña actual
                                  </label>
                                    <div className="position-relative">
                                        <input
                                          type={showPassword ? "text" : "password"}
                                          className="form-control custom-input border shadow"
                                          id="password"
                                          name="password"
                                          placeholder="Ingresá tu contraseña actual"
                                          autoComplete="current-password"/>
                                        
                                        <button
                                          type="button"
                                          className="btn position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                                          onClick={togglePasswordVisibility}
                                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} `}></i>
                                        </button>
                                    </div>
                                </div> 


                                <div className="mb-4">
                                  <label htmlFor="password" className="form-label">
                                   Nueva contraseña
                                  </label>
                                    <div className="position-relative">
                                        <input
                                          type={showPassword ? "text" : "password"}
                                          className="form-control custom-input border shadow"
                                          id="password"
                                          name="password"
                                          placeholder="Nueva contraseña"
                                          autoComplete="current-password"/>
                                        
                                        <button
                                          type="button"
                                          className="btn position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                                          onClick={togglePasswordVisibility}
                                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} `}></i>
                                        </button>
                                    </div>
                                </div> 


                                <div className="mb-4">
                                  <label htmlFor="password" className="form-label">
                                    Confirmar nueva contraseña
                                  </label>
                                    <div className="position-relative">
                                        <input
                                          type={showPassword ? "text" : "password"}
                                          className="form-control custom-input border shadow"
                                          id="password"
                                          name="password"
                                          placeholder="Confirmar contraseña"
                                          autoComplete="current-password"/>
                                        
                                        <button
                                          type="button"
                                          className="btn position-absolute end-0 top-50 translate-middle-y border-0 password-toggle"
                                          onClick={togglePasswordVisibility}
                                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} `}></i>
                                        </button>
                                    </div>
                                </div>


                                <div className="text-center">
                                  <button className="btn btn-volver rounded-pill text-white text-uppercase"
                                    type="submit">
                                    Cambiar
                                  </button>
                                </div>

                            </form>
                            

                             
                        </div>
                    </div>

                </div>
            </div>

             <button className='btn btn-volver rounded-pill text-white text-center text-uppercase' 
                     type='submit' onClick={handleVolver}>            
                   <MdSubdirectoryArrowLeft className='text-white'/> Volver
             </button>


    </div>
  )
}
