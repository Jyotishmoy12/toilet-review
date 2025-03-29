import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../../firebase";
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom"; // <-- Import useLocation
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

const AuthForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // <-- Get location
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Validate form
  const validateForm = () => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPassword = password.length >= 6;
    
    setFormValid(validEmail && validPassword);
    return validEmail && validPassword;
  };

  // Update validation when inputs change
  useState(() => {
    validateForm();
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Please enter a valid email and password (min 6 characters)");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await login(email, password);
      }
      // Redirect to the originally requested page, or home if not available
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email to reset password.");
      return;
    }
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Use the redirect path from state if available
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center  py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded-md flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder={isSignup ? "Create a password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={16} className="text-gray-400" />
                ) : (
                  <Eye size={16} className="text-gray-400" />
                )}
              </div>
            </div>
            {isSignup && (
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white p-2 rounded-md font-medium transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>
        
        <div className="mt-4 flex items-center justify-between">
          <hr className="w-full border-gray-300" />
          <p className="px-2 text-gray-500 text-xs">OR</p>
          <hr className="w-full border-gray-300" />
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full mt-3 flex items-center justify-center gap-2 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors"
        >
          {/* Google SVG here */}
          <span className="font-medium text-sm text-gray-700">Continue with Google</span>
        </button>
        
        {!isSignup && (
          <button
            onClick={handleForgotPassword}
            disabled={loading}
            className="text-blue-600 text-xs mt-3 hover:underline w-full text-center block"
          >
            Forgot Password?
          </button>
        )}
        
        <div className="mt-4 border-t border-gray-200 pt-3">
          <p className="text-center text-gray-600 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <span
              className="text-blue-600 ml-1 font-medium cursor-pointer hover:underline"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
