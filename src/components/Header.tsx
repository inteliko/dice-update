
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="w-full px-4 py-4 border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span role="img" aria-label="dice" className="text-2xl">🎲</span>
          <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-dice-primary to-dice-secondary bg-clip-text text-transparent">
            Dices by Ceez
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6">
            <li>
              <Link 
                to="/" 
                className={`transition-colors hover:text-dice-primary ${isActive('/') ? 'text-dice-primary font-medium' : 'text-gray-600'}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/calculate" 
                className={`transition-colors hover:text-dice-primary ${isActive('/calculate') ? 'text-dice-primary font-medium' : 'text-gray-600'}`}
              >
                Calculate
              </Link>
            </li>
            
           
          </ul>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu} aria-label="Menu">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg animate-fade-in">
          <nav className="container mx-auto py-4">
            <ul className="flex flex-col space-y-4">
              <li>
                <Link 
                  to="/" 
                  className={`block px-4 py-2 transition-colors hover:bg-gray-100 rounded-md ${isActive('/') ? 'text-dice-primary font-medium' : 'text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/calculate" 
                  className={`block px-4 py-2 transition-colors hover:bg-gray-100 rounded-md ${isActive('/calculate') ? 'text-dice-primary font-medium' : 'text-gray-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calculate
                </Link>
              </li>
              
              <li className="px-4 pt-2">
                <Button className="w-full bg-dice-primary hover:bg-dice-secondary">
                  Get Started
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
