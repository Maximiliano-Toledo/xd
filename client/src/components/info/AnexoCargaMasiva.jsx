import anexoPDF from '../../assets/pdf/AnexoManualDeUsuarioCargaMasiva2025.pdf';

const AnexoCargaMasiva = () => {
    return (
        <div className='w-100 min-vh-100'>
            <object
            data={anexoPDF}
            type="application/pdf"
            width="100%"
            height="100%">

            </object>
        </div>
    );
}

export default AnexoCargaMasiva;
