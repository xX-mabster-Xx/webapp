import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './TopStripComponent.css'; // Import the CSS file

const root = document.documentElement;

function setTheme(theme) {
  if (theme === 'dark') {
    root.style.setProperty('--main-bg-color', '#5e5e5e');
    root.style.setProperty('--strip-bg-color', '#1a1a1a');
    root.style.setProperty('--strip-text-color', '#ffffff');
    root.style.setProperty('--button-bg-color', '#333333');
    root.style.setProperty('--button-hover-color', '#555555');
    root.style.setProperty('--group-hover-color', '#2d2d2d');
  } else {
    root.style.setProperty('--main-bg-color', '#f0f0f0');
    root.style.setProperty('--strip-bg-color', '#f8f8f8');
    root.style.setProperty('--strip-text-color', '#333333');
    root.style.setProperty('--button-bg-color', '#dcdcdc');
    root.style.setProperty('--button-hover-color', '#b0b0b0');
    root.style.setProperty('--group-hover-color', '#ececec');
  }
}

const TopStripComponent = ({ onButtonClick }) => {
  const [isCollapsed, setCollapsed] = useState(true);
  const [isDarkTheme, setDarkTheme] = useState(false);

  const handleCollapseToggle = () => {
    setCollapsed(!isCollapsed);
  };


  const toggleTheme = () => {
    setDarkTheme((prevTheme) => {
      const newTheme = !prevTheme;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };
  
  

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkTheme(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    setTheme(isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  return (
    <div className={`top-strip-container ${isCollapsed ? 'collapsed' : ''} ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="collapse-button-container">
        <Button label={isCollapsed ? '>' : '<'} onClick={handleCollapseToggle} className="collapse-button" />
      </div>
      <div className="button-container">
        <div className='group group-bebra'>
            <Link to="/component1">
              <Button label={isCollapsed ? '1' : "Component 1"} className="button" />
            </Link>
            <Link to="/circles">
              <Button label={isCollapsed ? '2' : "Component 2"} className="button" />
            </Link>
        </div>
        <div className='group group-debri'>
            <Link to="/ton/dns">
              <Button label={isCollapsed ? '1' : "TON: DNS"} className="button" />
            </Link>
            <Link to="/circles">
              <Button label={isCollapsed ? '2' : "Page 2"} className="button" />
            </Link>
        </div>
      </div>
      <div className='switch-container'>
        <label>
          <input
            type="checkbox"
            checked={!isDarkTheme}
            onChange={toggleTheme}
          />
          <span className = 'slider'></span>
        </label>
      </div>
    </div>
  );
};

export default TopStripComponent;

