import React from 'react';
import { BookOpen, BarChart3, Target, Settings, Moon, Sun, Contrast } from 'lucide-react';
import { Theme } from '../../types/Theme';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  theme, 
  onThemeChange 
}) => {
  const navItems = [
    { id: 'library', label: 'My Library', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Reading Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const themeIcons = {
    light: Sun,
    dark: Moon,
    'high-contrast': Contrast
  };

  const getThemeIcon = () => {
    const IconComponent = themeIcons[theme];
    return <IconComponent size={18} />;
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'high-contrast'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };

  return (
    <nav className="bg-surface border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                <BookOpen size={24} />
              </div>
              <h1 className="text-xl font-bold text-foreground">Reading List</h1>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'high contrast' : 'light'} theme`}
            >
              {getThemeIcon()}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;