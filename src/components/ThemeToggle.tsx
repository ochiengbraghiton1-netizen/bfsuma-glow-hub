import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-glow transition-all"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-accent" />
      ) : (
        <Moon className="h-5 w-5 text-primary" />
      )}
    </Button>
  );
};

export default ThemeToggle;
