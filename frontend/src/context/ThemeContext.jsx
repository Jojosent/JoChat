// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useState, useEffect } from 'react';

// const ThemeContext = createContext();

// export const useTheme = () => {
//     const context = useContext(ThemeContext);
//     if (!context) {
//         throw new Error('useTheme must be used within a ThemeProvider');
//     }
//     return context;
// };

// export function ThemeProvider({ children }) {
//     const [darkMode, setDarkMode] = useState(() => {
//         const saved = localStorage.getItem('theme');
//         return saved ? saved === 'dark' : true;
//     });

//     useEffect(() => {
//         const root = document.documentElement;
//         if (darkMode) {
//             root.classList.add('dark');
//             root.setAttribute('data-theme', 'dark');
//         } else {
//             root.classList.remove('dark');
//             root.setAttribute('data-theme', 'light');
//         }
//         localStorage.setItem('theme', darkMode ? 'dark' : 'light');
//     }, [darkMode]);

//     const toggleTheme = () => setDarkMode(prev => !prev);

//     return (
//         <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
//             {children}
//         </ThemeContext.Provider>
//     );
// }