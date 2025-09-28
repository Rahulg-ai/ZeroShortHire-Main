import React, { useState, useContext, createContext, useEffect } from 'react';
import { Eye, EyeOff, Github, Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

// API Configuration
const API_BASE_URL = "https://api-6gfg57527a-uc.a.run.app";

// API Service Functions
const apiService = {
  register: async (email, password, displayName) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        displayName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  verifyEmail: async (email, verificationCode) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        verificationCode
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  resendVerification: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  login: async (email, password, rememberMe = false) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        rememberMe
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  githubLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  verifyToken: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return await response.json();
  },

  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return response.ok;
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
};

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Check for token in memory (no localStorage in artifacts)
    return null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const register = async (email, password, displayName) => {
    try {
      const response = await apiService.register(email, password, displayName);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (email, verificationCode) => {
    try {
      const response = await apiService.verifyEmail(email, verificationCode);
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password, rememberMe) => {
    try {
      const response = await apiService.login(email, password, rememberMe);
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await apiService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      register,
      verifyEmail,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-sm max-w-md ${
        type === 'error' 
          ? 'bg-white border-red-200 text-red-700 shadow-red-100' 
          : type === 'success'
          ? 'bg-white border-green-200 text-green-700 shadow-green-100'
          : 'bg-white border-blue-200 text-blue-700 shadow-blue-100'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-1 rounded-full mt-0.5 ${
            type === 'error' ? 'bg-red-50' : type === 'success' ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            {type === 'success' ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <AlertCircle size={16} className={
                type === 'error' ? 'text-red-500' : 'text-blue-500'
              } />
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm leading-tight">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay Component
const LoadingOverlay = ({ message = "Processing..." }) => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-100">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={24} />
          <div className="absolute inset-0 animate-ping">
            <div className="w-6 h-6 border-2 border-blue-200 rounded-full"></div>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {message}
        </span>
      </div>
    </div>
  );
};

// Floating Elements Background
const FloatingElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-blue-100 to-purple-100 opacity-20 animate-float"
          style={{
            width: Math.random() * 80 + 40 + 'px',
            height: Math.random() * 80 + 40 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's',
            animationDuration: (Math.random() * 8 + 8) + 's'
          }}
        />
      ))}
    </div>
  );
};

// Email Verification Component
const EmailVerification = ({ email, onBack, onSuccess }) => {
  const { verifyEmail } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      showToast('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyEmail(email, verificationCode);
      showToast('Email verified successfully! Welcome to ZeroShotHire! 🎉', 'success');
      setTimeout(() => onSuccess(response), 2000);
    } catch (error) {
      console.error('Verification error:', error);
      showToast(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      await apiService.resendVerification(email);
      showToast('Verification code sent successfully!', 'success');
      setResendCooldown(60);
    } catch (error) {
      console.error('Resend error:', error);
      showToast(error.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8 rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl border border-gray-100 relative">
        {isLoading && <LoadingOverlay message="Verifying email..." />}
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit verification code to<br />
            <span className="font-medium text-gray-800">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerification} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-center text-2xl font-mono tracking-widest bg-gray-50/50 hover:bg-white transition-all duration-300"
              maxLength={6}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 transform hover:scale-105 active:scale-95 relative overflow-hidden ${
              isLoading || verificationCode.length !== 6
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
            }`}
          >
            <span className="relative z-10">Verify Email</span>
            {!isLoading && verificationCode.length === 6 && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className={`text-sm font-medium transition-colors duration-200 ${
              resendCooldown > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-800 hover:underline'
            }`}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 mx-auto"
          >
            <ArrowLeft size={16} />
            Back to registration
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Registration Component
const Registration = ({ onBackToLogin, onVerificationNeeded }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 6) strength += 25;
      if (value.length >= 8) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      showToast('Please enter your full name');
      return false;
    }

    if (!formData.email) {
      showToast('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      showToast('Please enter a password');
      return false;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await register(
        formData.email,
        formData.password,
        formData.displayName.trim()
      );

      showToast('Registration successful! Please check your email for verification.', 'success');
      
      setTimeout(() => {
        onVerificationNeeded(formData.email);
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      showToast(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8 rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl border border-gray-100 relative">
        {isLoading && <LoadingOverlay message="Creating your account..." />}
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600 text-sm">
            Join ZeroShotHire and start your career journey
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-gray-50/50 hover:bg-white transition-all duration-300"
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-gray-50/50 hover:bg-white transition-all duration-300"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                className="w-full px-6 py-4 pr-14 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-gray-50/50 hover:bg-white transition-all duration-300"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Password strength:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength < 25 ? 'text-red-600' :
                    passwordStrength < 50 ? 'text-orange-600' :
                    passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full px-6 py-4 pr-14 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-gray-50/50 hover:bg-white transition-all duration-300"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 transform hover:scale-105 active:scale-95 relative overflow-hidden ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100' 
                : 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40'
            }`}
          >
            <span className="relative z-10">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </span>
            {!isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Or register with
              </span>
            </div>
          </div>

          {/* Social Register Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => apiService.googleLogin()}
              disabled={isLoading}
              className={`flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transform hover:scale-105 active:scale-95 ${
                isLoading 
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed hover:scale-100' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg'
              }`}
            >
              <Mail size={18} />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => apiService.githubLogin()}
              disabled={isLoading}
              className={`flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transform hover:scale-105 active:scale-95 ${
                isLoading 
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed hover:scale-100' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg'
              }`}
            >
              <Github size={18} />
              <span>GitHub</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 mx-auto"
          >
            <ArrowLeft size={16} />
            Already have an account? Sign in
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Main Login Component
const Login = () => {
  const { login: authLogin, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [formFocused, setFormFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting...');
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showToast('Please fill in all fields');
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authLogin(
        formData.email, 
        formData.password, 
        formData.rememberMe
      );

      showToast('Login successful! Welcome back! 🎉', 'success');
      
      setTimeout(() => {
        console.log('Login response:', response);
        // Here you would typically redirect to dashboard
      }, 2000);

    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Too many')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.message.includes('verify your email')) {
        errorMessage = 'Please verify your email before logging in';
      } else if (error.message.includes('associated with')) {
        errorMessage = error.message;
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      showToast('Please enter your email address first');
      return;
    }

    if (!validateEmail(formData.email)) {
      showToast('Please enter a valid email address');
      return;
    }

    try {
      await apiService.forgotPassword(formData.email);
      showToast('Password reset instructions sent to your email', 'success');
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast(error.message || 'Failed to send reset email');
    }
  };

  return (
    <div className={`w-full transition-all duration-1000 ${
      fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className={`relative transition-all duration-500 ${
        formFocused 
          ? 'scale-[1.02]' 
          : 'hover:scale-[1.01]'
      }`}>
        <div className={`p-8 rounded-3xl backdrop-blur-sm transition-all duration-500 ${
          formFocused 
            ? 'bg-white/95 shadow-2xl shadow-blue-200/50 border border-blue-100' 
            : 'bg-white/80 shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-gray-300/50'
        }`}
        onFocus={() => setFormFocused(true)}
        onBlur={() => setFormFocused(false)}>
          {isLoading && <LoadingOverlay message="Signing you in..." />}
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="group">
              <label className="block text-sm font-semibold mb-3 text-gray-700 transition-colors duration-200 group-focus-within:text-blue-600">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-blue-500 focus:scale-[1.02] bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 hover:border-gray-300 hover:bg-white"
                  disabled={isLoading}
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-semibold mb-3 text-gray-700 transition-colors duration-200 group-focus-within:text-blue-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-6 py-4 pr-14 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-blue-500 focus:scale-[1.02] bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-500 hover:border-gray-300 hover:bg-white"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/10 transition-all duration-500 pointer-events-none"></div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                    formData.rememberMe 
                      ? 'bg-blue-600 border-blue-600 scale-110' 
                      : 'border-gray-300 group-hover:border-gray-400 group-hover:scale-105'
                  }`}>
                    {formData.rememberMe && (
                      <svg className="w-3 h-3 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200 font-medium">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:text-blue-800 transition-all duration-200 font-medium hover:underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 transform hover:scale-105 active:scale-95 relative overflow-hidden ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
              }`}
            >
              <span className="relative z-10">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </span>
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => apiService.googleLogin()}
                disabled={isLoading}
                className={`flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transform hover:scale-105 active:scale-95 ${
                  isLoading 
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed hover:scale-100' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg'
                }`}
              >
                <Mail size={18} />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => apiService.githubLogin()}
                disabled={isLoading}
                className={`flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border-2 font-medium transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transform hover:scale-105 active:scale-95 ${
                  isLoading 
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed hover:scale-100' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg'
                }`}
              >
                <Github size={18} />
                <span>GitHub</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'verify'
  const [verificationEmail, setVerificationEmail] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleShowRegistration = () => {
    setCurrentView('register');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleVerificationNeeded = (email) => {
    setVerificationEmail(email);
    setCurrentView('verify');
  };

  const handleVerificationSuccess = (response) => {
    console.log('Verification successful:', response);
    setCurrentView('login');
    // Here you would typically redirect to dashboard
  };

  const handleBackToRegistration = () => {
    setCurrentView('register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      <FloatingElements />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-pink-100 to-blue-100 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className={`relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center transition-all duration-1000 ${
        fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className={`text-center mb-10 transition-all duration-1000 delay-300 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white font-bold text-lg">Z</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                ZeroShotHire
              </h1>
            </div>
            <p className="text-gray-600 text-base">
              {currentView === 'login' && 'Welcome back! Sign in to continue'}
              {currentView === 'register' && 'Join thousands of professionals'}
              {currentView === 'verify' && 'Almost there! Verify your email'}
            </p>
          </div>

          {/* Main Content */}
          <div className={`transition-all duration-500 delay-500 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {currentView === 'login' && <Login />}
            {currentView === 'register' && (
              <Registration 
                onBackToLogin={handleBackToLogin}
                onVerificationNeeded={handleVerificationNeeded}
              />
            )}
            {currentView === 'verify' && (
              <EmailVerification
                email={verificationEmail}
                onBack={handleBackToRegistration}
                onSuccess={handleVerificationSuccess}
              />
            )}
          </div>

          {/* Create Account Section - Only show on login */}
          {currentView === 'login' && (
            <div className={`mt-8 text-center transition-all duration-1000 delay-600 ${
              fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <p className="text-gray-600 mb-4">
                  Don't have an account yet?
                </p>
                <button
                  onClick={handleShowRegistration}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-blue-200 text-blue-600 font-semibold transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <span>Create Account</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className={`mt-8 text-center space-y-4 transition-all duration-1000 delay-700 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex justify-center gap-8 text-sm">
              <button
                onClick={() => window.open(`${API_BASE_URL}/legal/privacy-policy`, '_blank')}
                className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:underline font-medium"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => window.open(`${API_BASE_URL}/legal/terms-conditions`, '_blank')}
                className="text-gray-500 hover:text-gray-700 transition-all duration-200 hover:underline font-medium"
              >
                Terms & Conditions
              </button>
            </div>
            <p className="text-xs text-gray-400">
              © 2025 ZeroShotHire. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

// Main App Component with Auth Provider
const LoginPage = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default LoginPage;