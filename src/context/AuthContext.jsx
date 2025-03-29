import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout function
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
