import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getUser, logout } from '../auth.js';
import './NavigationHeader.css';

const NavigationHeader = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(null);

  const menuItems = [
    {
      label: 'DOMESTIC ORDERS',
      path: '/domestic-orders/list',
      hasDropdown: true,
      dropdownItems: [
        { label: 'NEW DOMESTIC ORDER', path: '/domestic-orders/new' },
      ],
    },
    {
      label: 'PURCHASE',
      path: '/purchase/orders',
      hasDropdown: true,
      dropdownItems: [
        { label: 'NEW PURCHASE ORDER', path: '/purchase/new' },
      ],
    },
    {
      label: 'REPORTS',
      path: '',
      hasDropdown: true,
      dropdownItems: [
        { label: 'DOMESTIC ORDER LIST', path: '/reports/domestic' },
        { label: 'PURCHASE ORDER LIST', path: '/reports/purchase' },
      ],
    },
    {
      label: 'MASTER',
      path: '',
      hasDropdown: true,
      dropdownItems: [
        { label: 'SUB DIVISION', path: '' },
      ],
    },
    
    {
      label: 'STOCK',
      path: '',
      hasDropdown: true,
      dropdownItems: [],
    },
    {
      label: 'YARN MASTER MAIN',
      path: '',
       hasDropdown: true,
       dropdownItems: [],
    },
  ];

  const isActive = (path) => {
    if (path === '/domestic-orders/list') {
      return location.pathname.startsWith('/domestic-orders');
    }
    if (path === '/purchase/orders') {
      return location.pathname.startsWith('/purchase');
    }
    if (path === '') {
      return location.pathname.startsWith('/reports');
    }
    return location.pathname === path;
  };

  const handleMobileToggle = (index) => {
    setMobileOpen(mobileOpen === index ? null : index);
  };

  const handleResize = () => {
    if (window.innerWidth > 768) {
      setMobileOpen(null);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header className="top-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <div className="nav-header">
            <div className="brand">TexOrders ERP Pro v3 (yarn) - 2.0 LIVE</div>
            <nav>
              <ul className="nav-menu">
                {menuItems.map((item, index) => (
                  <li
                    key={item.label}
                    className="nav-item"
                    onMouseEnter={() => window.innerWidth > 768 && handleMobileToggle(index)}
                    onMouseLeave={() => window.innerWidth > 768 && setMobileOpen(null)}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                      onClick={(e) => {
                        if (item.path === '') {
                          // Menu-only item (e.g. REPORTS): never navigate, just toggle the submenu.
                          e.preventDefault();
                          handleMobileToggle(index);
                        } else if (item.hasDropdown && window.innerWidth <= 768) {
                          e.preventDefault();
                          handleMobileToggle(index);
                        }
                      }}
                      aria-haspopup={item.hasDropdown}
                      aria-expanded={mobileOpen === index}
                    >
                      {item.label}
                      {item.hasDropdown && (
                        <span className={`dropdown-arrow ${mobileOpen === index ? 'open' : ''}`} aria-hidden="true">
                          ▼
                        </span>
                      )}
                    </NavLink>

                    {item.hasDropdown && item.dropdownItems?.length > 0 && (
                      <ul
                        className={`dropdown-menu ${mobileOpen === index ? 'open' : ''}`}
                        role="menu"
                      >
                        {item.dropdownItems.map((subItem) => (
                          <li key={subItem.label} className="dropdown-item" role="none">
                            <NavLink
                              to={subItem.path}
                              className="dropdown-link"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!subItem.path) {
                                  // Menu-only placeholder: no page yet, do nothing.
                                  e.preventDefault();
                                  return;
                                }
                                setMobileOpen(null);
                              }}
                            >
                              {subItem.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="nav-user">
              <span className="nav-user-name">{getUser()}</span>
              <button type="button" className="nav-logout" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavigationHeader;
