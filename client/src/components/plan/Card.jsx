import { Link } from "react-router-dom";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import '../../styles/dashboard.css'

export default function Card({ title, description, link, icon: Icon }) {
  return (
    <div className="w-75 mx-auto border rounded p-3 shadow mb-5">
      <h6 className="fw-bold fs-5 text-center subtitle-dashboard">{title}</h6>

      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center ms-md-5 mt-3 mt-md-0">
        <div
          className="bg-color-icon p-2 rounded me-md-2 mb-2 mb-md-0"
          style={{
            position: "relative",
            top: "-18px",
            marginLeft: "-14px",
          }}
        >
          <Icon className="icon-size subtitle-dashboard ms-1" />
        </div>

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
          <p className="text-center text-md-start p-color mb-2 mb-md-0 ps-4">
            {description}
          </p>

          <Link
            to={link}
            className="ms-md-4 mt-2 mt-md-0 text-uppercase text-decoration-none border fw-bold link-card-2"
          >
            Ir <FaRegArrowAltCircleRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
