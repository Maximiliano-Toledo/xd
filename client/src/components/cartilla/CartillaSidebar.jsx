import { MdMedicalServices, MdHealthAndSafety } from "react-icons/md";
import { FaHospitalUser } from "react-icons/fa6";
import { BsHospital, BsGlobe } from "react-icons/bs";

const CartillaSidebar = () => {
    const sidebarLinks = [
        {
            href: "http://132.226.241.113:8080/ords/ossacra/f?p=230:LOGIN_DESKTOP:2903865550092:::::",
            target: "_blank",
            icon: <FaHospitalUser />,
            text: "Mi Autogestión"
        },
        {
            href: "https://ossacra.org.ar/telemedicina/",
            target: "_blank",
            icon: <MdMedicalServices />,
            text: "Telemedicina"
        },
        {
            href: "https://ossacra.org.ar/centros-medicos-propios/",
            target: "_blank",
            icon: <BsHospital />,
            text: "Centros médicos propios"
        },
        {
            href: "https://ossacra.org.ar/quiero-asociarme/",
            target: "_blank",
            icon: <BsGlobe />,
            text: "Quiero asociarme"
        },
        {
            href: "https://ossacra.org.ar/la-farmacita/",
            target: "_blank",
            icon: <MdHealthAndSafety />,
            text: "La Farmacita"
        }
    ];

    return (
        <aside className="cartilla-sidebar">
            <div className="sidebar-header">
                <h4 className="sidebar-title">Servicios</h4>
            </div>

            <div className="sidebar-links">
                {sidebarLinks.map((link, index) => (
                    <a key={index} href={link.href} target={link.target} className="sidebar-link">
                        <div className="sidebar-icon">
                            {link.icon}
                        </div>
                        <span>{link.text}</span>
                    </a>
                ))}
            </div>
        </aside>
    );
};

export default CartillaSidebar;