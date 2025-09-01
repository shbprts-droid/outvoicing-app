
import React, { useState, useRef, useEffect } from 'react';
import type { View } from '../types';
import { NAV_LINKS } from '../constants';

interface SidebarProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
    const navRef = useRef<HTMLElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    const checkScrollability = React.useCallback(() => {
        const navElement = navRef.current;
        if (navElement) {
            const isScrollable = navElement.scrollHeight > navElement.clientHeight;
            setCanScrollUp(isScrollable && navElement.scrollTop > 0);
            // Use a small buffer to handle fractional pixel values
            setCanScrollDown(isScrollable && navElement.scrollTop < navElement.scrollHeight - navElement.clientHeight - 1);
        }
    }, []);

    useEffect(() => {
        const navElement = navRef.current;
        checkScrollability();

        // Use ResizeObserver for more reliable updates on size changes
        const resizeObserver = new ResizeObserver(checkScrollability);
        if (navElement) {
            resizeObserver.observe(navElement);
            navElement.addEventListener('scroll', checkScrollability);
        }

        return () => {
            if (navElement) {
                resizeObserver.unobserve(navElement);
                navElement.removeEventListener('scroll', checkScrollability);
            }
        };
    }, [checkScrollability, NAV_LINKS]);


    const handleScroll = (direction: 'up' | 'down') => {
        const navElement = navRef.current;
        if (navElement) {
            const scrollAmount = navElement.clientHeight * 0.8; // Scroll by 80% of visible height
            navElement.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <aside className="w-64 bg-brand-primary text-white flex flex-col">
            <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-blue-800 shrink-0">
                Outvoicing
            </div>
            <div className="flex-1 relative overflow-hidden">
                {canScrollUp && (
                     <button
                        onClick={() => handleScroll('up')}
                        className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-brand-primary to-transparent z-10 flex items-center justify-center text-white hover:text-brand-accent transition-opacity duration-300 opacity-70 hover:opacity-100"
                        aria-label="Scroll up"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                )}
                <nav ref={navRef} className="h-full overflow-y-auto px-4 py-6">
                    <ul>
                        {NAV_LINKS.map(({ view, label, icon }) => (
                            <li key={view} className="mb-2">
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onNavigate(view); }}
                                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                                        currentView === view
                                            ? 'bg-brand-secondary'
                                            : 'hover:bg-blue-800'
                                    }`}
                                >
                                    <span className="mr-3">{icon}</span>
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                 {canScrollDown && (
                    <button
                        onClick={() => handleScroll('down')}
                        className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-brand-primary to-transparent z-10 flex items-center justify-center text-white hover:text-brand-accent transition-opacity duration-300 opacity-70 hover:opacity-100"
                        aria-label="Scroll down"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>
            <div className="p-4 border-t border-blue-800 shrink-0">
                <p className="text-sm text-blue-200">&copy; 2024 Outvoicing</p>
            </div>
        </aside>
    );
};
