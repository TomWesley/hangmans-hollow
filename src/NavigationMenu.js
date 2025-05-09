// Updated NavigationMenu.js with debug and fix
import React, { useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';

const NavigationMenu = ({ onMainMenu, onRules, onPrizes }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleOptionClick = (handler) => {
    console.log("Navigation option clicked");
    setIsOpen(false);
    
    // Ensure the handler exists before calling it
    if (typeof handler === 'function') {
      console.log("Calling handler function:", handler.name || "anonymous");
      handler();
    } else {
      console.error("Handler is not a function:", handler);
    }
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
            onClick={() => {
              console.log("Main Menu button clicked");
              handleOptionClick(onMainMenu);
            }}
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