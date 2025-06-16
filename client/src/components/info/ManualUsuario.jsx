import manualPdf from '../../assets/pdf/ManualUsuarioOssacra2025.pdf';

const ManualUsuario = () => {
    return (
        <div className='w-100 min-vh-100'>
            <object
            data={manualPdf}
            type="application/pdf"
            width="100%"
            height="100%">

            </object>
        </div>
    );
}

export default ManualUsuario;
