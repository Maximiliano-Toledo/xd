import { Link } from "react-router-dom";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import '../../styles/dashboard.css';

export default function Card({ title, description, link, icon: Icon }) {
  return (
    <div className="w-100 mx-auto border rounded p-3 shadow mb-4">
      <h6 className="fw-bold fs-5 text-center subtitle-dashboard">{title}</h6>
      
      <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start mt-3">
        <div className="bg-color-icon p-2 rounded mb-3 mb-md-0 me-md-3"
          style={{
            position: "relative",
            marginLeft: "10px",
            top: "-15px",
          }}
        >
          <Icon className="icon-size subtitle-dashboard" />
        </div>
        
        <div className="d-flex flex-column w-75">
          <p className="text-center text-md-center p-color mb-3">
            {description}
          </p>
          
          <div className="d-flex justify-content-center justify-content-md-center">
            <Link
              to={link}
              className="text-uppercase text-decoration-none border fw-bold  link-card-2"
            >
              Ir <FaRegArrowAltCircleRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}