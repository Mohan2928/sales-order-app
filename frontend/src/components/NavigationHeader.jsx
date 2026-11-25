import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, logout } from '../auth.js';
import { api } from '../api.js';
import './NavigationHeader.css';

const NavigationHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(null);

  const handleForgot = () => {
    api.logout().catch(() => {});
    clearSession();
    navigate('/login', { state: { forgot: true } });
  };

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
            <div className="brand">TexOrders</div>
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
              <button type="button" className="nav-forgot" onClick={handleForgot}>Forgot Password</button>
              <button type="button" className="nav-logout" onClick={() => { api.logout().catch(() => {}); logout(); }}>
                <svg className="nav-logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavigationHeader;
