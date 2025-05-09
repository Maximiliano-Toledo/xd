import React from 'react';
import { Button } from 'antd';
import {HiOutlineSun, HiOutlineMoon } from 'react-icons/hi'
import '../../styles/darkmode.css'
import { FaToggleOn } from 'react-icons/fa';
import { CgToggleOn } from "react-icons/cg";

const ToggleThemeButton = ({darkTheme, toggleTheme}) => {
    return (
        <div className='toggle-theme-btn'>
           <Button onClick={toggleTheme}
           className="green-button border-3 rounded-3">
            {darkTheme ? <CgToggleOn className='fs-3'/> : <FaToggleOn className='fs-3'/>}
            </Button> 
        </div>
    );
}

export default ToggleThemeButton;
