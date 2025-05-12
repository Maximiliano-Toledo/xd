import { Link } from "react-router-dom"
import { FaRegArrowAltCircleRight } from "react-icons/fa"
import '../../styles/dashboard.css'

export default function CardWithTab({ title, options, description }) {
  return (
    <div className="custom-card">
      <div className="card-top-section">
        {options.map((option, index) => (
          <div key={index} className="option-row">
            <p className="option-text">{option.text}</p>
            <Link to={option.link} className="option-link ">
              IR <FaRegArrowAltCircleRight />
            </Link>
          </div>
        ))}
      </div>

      <div className="card-bottom-section">
        <h5 className="card-title-dashboard">{title}</h5>
         <p className="card-description">{description}</p>
      </div>
    </div>
  )
}
