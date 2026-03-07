import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context
const GenderContext = createContext();

export function GenderProvider({ children }) {
    // Check localStorage first, fallback to 'Men'
    const [gender, setGender] = useState(() => {
        const saved = localStorage.getItem('impact_gender');
        return saved === 'Women' ? 'Women' : 'Men';
    });

    // Update localStorage whenever gender changes
    useEffect(() => {
        localStorage.setItem('impact_gender', gender);
    }, [gender]);

    const toggleGender = (newGender) => {
        if (newGender === 'Men' || newGender === 'Women') {
            setGender(newGender);
        }
    };

    return (
        <GenderContext.Provider value={{ gender, toggleGender }}>
            {children}
        </GenderContext.Provider>
    );
}

// Custom hook to use the context
export function useGender() {
    const context = useContext(GenderContext);
    if (!context) {
        throw new Error('useGender must be used within a GenderProvider');
    }
    return context;
}
