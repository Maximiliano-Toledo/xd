import { useState } from "react"
import { Menu, Dropdown } from "antd"
import { IoMdHome } from "react-icons/io"
import { IoIosCreate } from "react-icons/io"
import { AiOutlineFileAdd } from "react-icons/ai"
import { IoIosSettings } from "react-icons/io"
import { IoIosInformationCircleOutline } from "react-icons/io"
import { FaPowerOff } from "react-icons/fa6"
import { TiDocumentDelete } from "react-icons/ti"
import { RiFileList3Line } from "react-icons/ri"
import { FiUser } from "react-icons/fi"
import { useLocation } from "react-router"
import "../../styles/sidebar.css"
import Logo from "./Logo"
import { useNavigate } from "react-router"
import React from "react"
import { CiFolderOn } from "react-icons/ci";
import { FaStethoscope } from "react-icons/fa6";
import { PiNumberSquareOneLight } from "react-icons/pi";
import { PiNumberSquareTwoLight } from "react-icons/pi";

export default function MenuList({darkTheme }) {
  
  const location = useLocation()
  const navigate = useNavigate()
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  // Función para manejar el clic en elementos con submenú
  const handleSubmenuClick = (key, event) => {
    event.stopPropagation()
    if (activeSubmenu === key) {
      setActiveSubmenu(null)
    } else {
      setActiveSubmenu(key)
    }
  }

  // Submenú para "Cargar"
  const cargarSubmenu = {
    items: [
      {
        key: "Individual",
        icon: <PiNumberSquareOneLight className="icon-menu" />,
        label: "Carga Individual",
        onClick: () => navigate("/carga-individual"),
      },
      {
        key: "Masiva",
        icon: <PiNumberSquareTwoLight className="icon-menu" />,
        label: "Carga Masiva",
        onClick: () => navigate("/carga-masiva"),
      },
    ],
  };

  

  const items = [
    {
      key: "home",
      icon: <IoMdHome className="icon-menu" />,
      label: "Gestión de cartilla",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "vistas",
      icon: <RiFileList3Line className="icon-menu" />,
      label: "Vista",
      onClick: () => navigate("/"),
    },
    {
      key: "cargar",
      icon: (
        <Dropdown
            menu={cargarSubmenu}
            trigger={["click"]}
            open={activeSubmenu === "cargar"}
            onOpenChange={(open) => !open && setActiveSubmenu(null)}
            placement="rightTop"
            overlayClassName="submenu-dropdown"
            overlayStyle={{ minWidth: "120px" }}
           
        >
            <div onClick={(e) => handleSubmenuClick("cargar", e)}>
              <AiOutlineFileAdd className="icon-menu" />
            </div>
        </Dropdown>

      ),
      label: "Carga",
     
    },
    {
      key: "editar",
      icon: <IoIosCreate className="icon-menu" />,
      label: "Editar prestador",
      onClick: () => navigate("/editar-prestador"),
    },
    {
      key: "plan",
      icon: <CiFolderOn className="icon-menu" />,
      label: "Gestión de planes",
      onClick: () => navigate("/gestion-plan"),
    },
    {
      key: "especialidad",
      icon: <FaStethoscope className="icon-menu" />,
      label: "Gestión especialidades",
      onClick: () => navigate("/gestion-especialidad"),
    },
    {
      key: "usuario",
      icon: <FiUser className="icon-menu" />,
      label: "Panel de usuario",
      onClick: () => navigate("/panel-usuario"),
    },
    {
      key: "salir",
      icon: <FaPowerOff className="icon-menu" />,
      label: "Salir",
      onClick: () => navigate("/logout"),
    },
    {
      key: "info",
      icon: <IoIosInformationCircleOutline className="icon-menu mb-1" />,
      label: "Info",
      onClick: () => navigate("/info"),
    },
  ]

  return (
    <>
      <div className="logo">
        <Logo />
      </div>


      <Menu
        mode="inline"
        className="menu-bar"
        selectedKeys={[location.pathname === "/" ? "home" : location.pathname.slice(1)]}
        items={items}
        theme={darkTheme ? 'dark' : 'ligth'}
      />
    </>
  )
}


