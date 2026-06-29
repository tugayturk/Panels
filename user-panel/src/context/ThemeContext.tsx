import {
    createContext,
    useContext,
    useState,
    useEffect,
} from 'react';

type Theme = "light" | "dark";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

// İlk tema: localStorage → sistem tercihi → light varsayılan
const getInitialTheme = (): "light" | "dark" => {
    const savedTheme = localStorage.getItem("theme");
  
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  
    // sistem temasını kontrol et
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  
    return "light";
  };

export function ThemeProvider({ children }: { children: React.ReactNode }) {

    const [theme, setTheme] = useState<Theme>(
        getInitialTheme()
    );

    useEffect(() => {
        // data-theme attribute SCSS temalarını tetikler; tercih localStorage'a yazılır
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);


    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
};