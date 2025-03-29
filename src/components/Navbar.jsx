import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Home, User, LayoutDashboard, LogOut, LogIn, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.email === "subedi@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Navigation items for reuse in both desktop and mobile views
  const navItems = [
    {
      to: "/",
      label: "Home",
      icon: <Home size={20} />,
      className: "text-black"
    },
    {
      to: "/account",
      label: "Account",
      icon: <User size={20} />,
      className: "text-black"
    },
    ...(isAdmin ? [
      {
        to: "/admin",
        label: "Admin Dashboard",
        icon: <LayoutDashboard size={20} />,
        className: "text-yellow-400 hover:text-yellow-300"
      }
    ] : [])
  ];

  return (
    <nav className="p-4 bg-white shadow-sm">
      <div className="container mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center items-center space-x-6">
          {navItems.map((item, index) => (
            <Link 
              key={index}
              to={item.to} 
              className={`${item.className} text-lg font-semibold flex items-center gap-2 hover:opacity-80 transition-colors`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          {user ? (
            <button
              onClick={handleLogout}
              className="text-red-500 text-lg font-semibold border border-red-500 px-3 py-1 rounded flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/account" className="text-green-400 text-lg font-semibold flex items-center gap-2 hover:text-green-300 transition-colors">
              <LogIn size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <Link to="/" className="text-black text-xl font-bold">
            FindToilets
          </Link>
          
          <button 
            onClick={toggleMobileMenu}
            className="text-black p-2 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            <div className="p-4 flex justify-between items-center border-b">
              <span className="text-black text-xl font-bold">Menu</span>
              <button onClick={closeMobileMenu} className="text-black p-2">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col p-4 space-y-4">
              {navItems.map((item, index) => (
                <Link 
                  key={index}
                  to={item.to} 
                  className={`${item.className} text-lg font-semibold flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md transition-colors`}
                  onClick={closeMobileMenu}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-red-500 text-lg font-semibold flex items-center gap-3 p-2 border border-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors w-full"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link 
                  to="/account" 
                  className="text-green-400 text-lg font-semibold flex items-center gap-3 p-2 border border-green-400 rounded-md hover:bg-green-400 hover:text-white transition-colors"
                  onClick={closeMobileMenu}
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;