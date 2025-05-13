import { MdMedicalServices, MdHealthAndSafety } from "react-icons/md";
import { BsHospital, BsGlobe } from "react-icons/bs";

const CartillaSidebar = () => {
    const sidebarLinks = [
        {
            href: "#",
            icon: <MdMedicalServices />,
            text: "Médico en línea"
        },
        {
            href: "#",
            icon: <BsHospital />,
            text: "Centros médicos propios"
        },
        {
            href: "#",
            icon: <BsGlobe />,
            text: "Quiero afiliarme"
        },
        {
            href: "#",
            icon: <MdHealthAndSafety />,
            text: "Beneficios"
        }
    ];

    return (
        <aside className="cartilla-sidebar">
            <div className="sidebar-header">
                <h4 className="sidebar-title">Servicios</h4>
            </div>

            <div className="sidebar-links">
                {sidebarLinks.map((link, index) => (
                    <a key={index} href={link.href} className="sidebar-link">
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