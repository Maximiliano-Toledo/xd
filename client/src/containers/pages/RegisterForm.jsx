export const RegisterForm = () => {
   /**NOTA: No sé si este componente lo usaran para dar de alta usuarios, preguntar */
  return (
        <div className='container d-flex flex-column justify-content-center align-items-center vh-100'>

            <form className='w-50 border p-4 rounded shadow mb-4' >

                    
                <fieldset className="p-2" >
                    <label className='w-100'>Usuario
                    <input //cambiar el username por firstname (leer react hook form - apply validation)
                        type="text" 
                        className="form-control w-100 mt-2" 
                        id="exampleFormControlInput2"
                        placeholder="Ingresa el nombre" 
                         />
                    </label>
                      
                </fieldset>

                <fieldset className="p-2">
                    <label className='w-100'>Email
                    <input
                        type="email" 
                        className='form-control w-100 mt-2'
                        id="exampleFormControlInput2"
                        placeholder="nombreapellido@gmail.com" 
                     />
                    </label>
                        
                </fieldset>

                <fieldset className="p-2">
                    <label className='w-100'>Contraseña
                    <input 
                        type="password" 
                        className="form-control w-100 mt-2" 
                        id="exampleFormControlInput3"
                        placeholder="Password" 
                       />
                    </label>
                        
                </fieldset>

                <button className='m-3 btn btn-success' type='submit'>Aceptar</button>

        </form>

        <p className='d-flex'> <Link to="" className='ms-3'> Iniciar sesión</Link> </p>
    </div>
  )
}
export default RegisterForm;