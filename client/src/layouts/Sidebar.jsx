import MenuList from "../components/utils/MenuList"
import ToggleThemeButton from "../components/utils/ToggleThemeButton"
import "../styles/sidebar.css"
import { Layout } from "antd"
import { useState } from 'react'

const { Sider, Content } = Layout

const Sidebar = ({ children}) => {

  const [darkTheme, setDarkTheme] = useState(true) 
  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  }

  return (
    <Layout className={darkTheme ? 'dark-theme' : 'light-theme'} style={{ minHeight: "100vh" }}>
      <Sider 
        collapsed={true}
        collapsible={false}
        trigger={null}
        className="sidebar"
        theme={darkTheme ? 'dark' : 'light'}>
        <MenuList darkTheme={darkTheme}/>
        <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme}/>
      </Sider>

      <Layout>
        <Content>
          <div className="main-content">{children}</div>
        </Content>
      </Layout>
</Layout>

  )
}

export default Sidebar



