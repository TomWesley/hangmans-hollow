import React, { useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';

const NavigationMenu = ({ onMainMenu, onRules, onPrizes }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleOptionClick = (handler) => {
    setIsOpen(false);
    handler();
  };
  
  return (
    <div className="navigation-menu-container">
      <button 
        className="menuButton nav-menu-button" 
        onClick={toggleMenu}
        aria-label="Navigation Menu"
      >
        <GiHamburgerMenu />
      </button>
      
      {isOpen && (
        <div className="nav-menu-dropdown">
          <button 
            className="nav-menu-option"
            onClick={() => handleOptionClick(onMainMenu)}
          >
            Main Menu
          </button>
          
          <button 
            className="nav-menu-option"
            onClick={() => handleOptionClick(onRules)}
          >
            Game Rules
          </button>
          
          <button 
            className="nav-menu-option"
            onClick={() => handleOptionClick(onPrizes)}
          >
            Prizes
          </button>
        </div>
      )}
    </div>
  );
};

export default NavigationMenu;