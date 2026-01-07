'use client';

import React, { useState, useEffect } from "react";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // Close menu when screen resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [menuOpen]);

    return (
        <React.Fragment>
            <div className="home">
                <header>
                    <a href="/" className="logo" style={{fontWeight: '600', letterSpacing: '1.2px'}}>
                        PFD <span style={{fontWeight: '400'}}>DESIGNER</span>
                    </a>

                    {/* Hamburger Menu Toggle (visible on mobile only) */}
                    <div 
                        className={`menu-toggle ${menuOpen ? 'active' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className={menuOpen ? 'active' : ''}>
                        <a href="#canvas" onClick={closeMenu}>Canvas</a>
                        <a href="#symbols" onClick={closeMenu}>Symbols</a>
                        <a href="#guide" onClick={closeMenu}>Guide</a>
                        <a href="#resources" onClick={closeMenu}>Resources</a>
                        <a href="#pricing" onClick={closeMenu}>Pricing</a>
                        
                        {/* Buttons inside nav (only visible on mobile) */}
                        <div className="buttons">
                            <a href="#contact" className="btn btn-outline" onClick={closeMenu}>
                                Contact sales
                            </a>
                            <a href="/signup" className="btn btn-outline" onClick={closeMenu}>
                                Log in
                            </a>
                            <a href="#trial" className="btn btn-dark" onClick={closeMenu}>
                                Start trial
                            </a>
                        </div>
                    </nav>

                    {/* Desktop Buttons (hidden on mobile) */}
                    <div className="buttons">
                        <a href="#contact" className="btn btn-outline">Contact sales</a>
                        <a href="/signup" className="btn btn-outline">Log in</a>
                        <a href="#trial" className="btn btn-dark">Start trial</a>
                    </div>

                    {/* Overlay background (only on mobile when menu open) */}
                    <div 
                        className={`nav-overlay ${menuOpen ? 'active' : ''}`}
                        onClick={closeMenu}
                    ></div>
                </header>
            </div>
        </React.Fragment>
    );
};

export default Header;