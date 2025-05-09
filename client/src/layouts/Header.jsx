import "../styles/index.css";

export const Header = () => {
  return (
    <header className="p-0 mb-4">
    {/* Sección superior - fondo blanco */}
    <section className="container py-3">
      <div className="row align-items-center">
        <div className="col-lg-4 col-md-6 col-sm-12 mb-3 mb-md-0 text-center text-md-start">
          <a href="https://ossacra.org.ar/">
            <img
              src="/ossacra-amasalud.png"
              alt="OSSACRA Amasalud"
              className="img-fluid"
              style={{ height: 60, width: "auto" }}
            />
          </a>
        </div>
        <div className="col-lg-8 col-md-6 col-sm-12 d-flex align-items-center justify-content-center justify-content-md-end">
          <div className="d-flex flex-column flex-sm-row align-items-center">
            <div className="me-sm-2 mb-1 mb-sm-0 text-center text-sm-start">
              <h6 className="mb-0 text-secondary">Para urgencias y emergencias</h6>
            </div>
            <div>
              <a href="tel:08104444364" className="text-dark fw-bold fs-5 fs-md-4 text-decoration-none">
                0810 - 444 - 4364
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Sección inferior - fondo verde */}
    <section
      className="w-100"
      style={{
        background: "linear-gradient(to right, #8DC63F, #006400)",
      }}
    >
      <div className="container py-4">
        <div className="row align-items-center">
          <div className="col-lg-9 col-md-8 col-sm-12 mb-3 mb-md-0">
            <h4 className="text-white fw-normal text-center text-md-start" style={{ maxWidth: "600px" }}>
              Consultá profesionales, centros de salud, farmacias, guardias, y más servicios en un solo lugar.
            </h4>
          </div>
          <div className="col-lg-3 col-md-4 col-sm-12 text-center text-md-end">
            <img src="/amasalud.png" alt="amasalud" className="img-fluid" style={{ maxHeight: "100px" }} />
          </div>
        </div>
      </div>
    </section>
  </header>
  );
};
