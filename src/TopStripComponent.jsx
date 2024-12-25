import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import './styles/TopStripComponent.css'; // Import the CSS file

const root = document.documentElement;

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
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
            <h4 className='group-name'>TON</h4>
            <Link to="/ton/dns">
              <Button label={isCollapsed ? 'DNS' : "TON: DNS"} className="button" />
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
            className='themecheckbox'
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

