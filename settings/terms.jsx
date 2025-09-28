import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Lock, 
  Users, 
  CreditCard, 
  Database, 
  Eye, 
  ArrowUp, 
  Menu, 
  X, 
  Download,
  CheckCircle,
  Phone,
  Globe,
  AlertTriangle,
  Settings,
  UserCheck,
  Ban,
  RefreshCw,
  Mail,
  Trash2,
  Share2,
  Moon,
  Sun,
  ExternalLink
} from 'lucide-react';

const TermsPrivacyPage = () => {
  const [activeSection, setActiveSection] = useState('terms');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      
      // Update active section based on scroll position
      const sections = ['terms', 'privacy'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const downloadPDF = () => {
    showNotification('PDF download feature will be available soon!');
  };

  const handleContactSupport = () => {
    window.open('mailto:info.zeroshothire@gmail.com?subject=Terms%20and%20Privacy%20Inquiry&body=Hi%20ZeroShotHire%20Team,%0D%0A%0D%0AI%20have%20a%20question%20about:%0D%0A%0D%0A[Your%20question%20here]%0D%0A%0D%0AThank%20you!', '_blank');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900'
    }`}>
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-6 py-3 rounded-lg shadow-lg animate-slide-in ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className={`relative overflow-hidden py-20 ${
        darkMode 
          ? 'bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800' 
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
      } text-white`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <Shield className="w-12 h-12" />
              <h1 className="text-4xl md:text-6xl font-bold">Terms & Privacy</h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your trust is our priority – here's how we protect it.
            </p>

            {/* Trust badges */}
            <div className="flex justify-center items-center gap-6 flex-wrap mb-8">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">Data Protected</span>
              </div>
            </div>

            {/* Navigation and Download */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => scrollToSection('terms')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeSection === 'terms' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                Terms of Service
              </button>
              <button
                onClick={() => scrollToSection('privacy')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeSection === 'privacy' 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <Lock className="w-5 h-5" />
                Privacy Policy
              </button>
              <button
                onClick={downloadPDF}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full">
          
          {/* Terms & Conditions Section */}
          <section id="terms" className="mb-16">
            <div className={`rounded-2xl p-8 shadow-lg transition-all duration-300 border mb-8 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-3 mb-8">
                <FileText className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className="text-3xl md:text-4xl font-bold">Terms & Conditions</h2>
              </div>

              <p className={`mb-8 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Last Updated: September 2025
              </p>

              {/* Who Can Use ZeroShotHire */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <UserCheck className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className="text-2xl font-bold">1. Who Can Use ZeroShotHire</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      You must be 18 years or older, or have permission from your guardian.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      You agree to use ZeroShotHire only for personal, educational, and career-related purposes.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Accounts are personal — don't share your login details.
                    </span>
                  </li>
                </ul>
              </div>

              {/* What You Can Do */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-2xl font-bold">2. What You Can Do</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Upload your resume for AI-powered analysis and insights.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Receive detailed reports, recommendations, and career guidance.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Use our services according to your chosen plan limits.
                    </span>
                  </li>
                </ul>
              </div>

              {/* What You Cannot Do */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Ban className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <h3 className="text-2xl font-bold">3. What You Cannot Do</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-red-400' : 'text-red-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Upload harmful, fake, or plagiarized content.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-red-400' : 'text-red-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Misuse the platform for spamming, bulk testing, or commercial resale.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-red-400' : 'text-red-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Reverse-engineer, copy, or redistribute our services without permission.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Plans & Payments */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className="text-2xl font-bold">4. Plans & Payments</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We offer various subscription plans to meet your needs.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Paid plans are billed monthly and may auto-renew with prior notice.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Due to the instant nature of AI analysis, processed resumes cannot be refunded.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Data & Ownership */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Database className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <h3 className="text-2xl font-bold">5. Your Data & Ownership</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      You retain ownership of your resumes and personal information.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      ZeroShotHire owns the platform technology, algorithms, and generated analysis reports.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Reports are for guidance only — we do not guarantee job placement or interview success.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Termination */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Trash2 className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <h3 className="text-2xl font-bold">6. Account Termination</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      You can delete your account anytime by contacting support.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We may suspend accounts that violate these terms or misuse our platform.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Changes to Terms */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <RefreshCw className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-2xl font-bold">7. Changes to Terms</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We may update these Terms to improve our services or comply with legal requirements.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Major changes will be communicated via email or in-app notifications.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Privacy Policy Section */}
          <section id="privacy" className="mb-16">
            <div className={`rounded-2xl p-8 shadow-lg transition-all duration-300 border mb-8 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-3 mb-8">
                <Lock className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h2 className="text-3xl md:text-4xl font-bold">Privacy Policy</h2>
              </div>

              {/* What We Collect */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-2xl font-bold">1. Information We Collect</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Eye className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Personal information: Name, email, phone number (when provided).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Eye className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Resume content: Education, experience, skills, and career information.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Eye className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Usage data: How you interact with our platform, analytics, and cookies.
                    </span>
                  </li>
                </ul>
              </div>

              {/* How We Use Your Data */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className="text-2xl font-bold">2. How We Use Your Information</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      To analyze your resume and provide AI-powered insights and recommendations.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      To improve our AI models and platform functionality.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      To send service updates, security alerts, and support communications.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      To provide customer support and respond to your inquiries.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Data Sharing */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Share2 className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <h3 className="text-2xl font-bold">3. Information Sharing</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We never sell your personal data to third parties.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We may share anonymized insights for industry research (no personal identification).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Service providers process data only as needed to operate ZeroShotHire.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Data Security */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className="text-2xl font-bold">4. Data Security</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We use enterprise-grade encryption and secure cloud storage to protect your data.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Resume files are automatically deleted after analysis to protect your privacy.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      All data transmission is secured with SSL/TLS encryption.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Users className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <h3 className="text-2xl font-bold">5. Your Privacy Rights</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      You can access, update, or delete your account information at any time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Contact us at info.zeroshothire@gmail.com to request data deletion or exercise your rights.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      You can opt-out of promotional emails while still receiving essential service communications.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Cookies & Tracking */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <h3 className="text-2xl font-bold">6. Cookies & Analytics</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Globe className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We use cookies and analytics to improve platform performance and user experience.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      You can disable cookies in your browser, but some features may not function properly.
                    </span>
                  </li>
                </ul>
              </div>

              {/* International Data Transfers */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-2xl font-bold">7. International Data Transfers</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Globe className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Your data may be processed in countries where our service providers operate.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We ensure adequate protection measures are in place for international transfers.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Updates to Policy */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <RefreshCw className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-2xl font-bold">8. Policy Updates</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      We may update this Privacy Policy to reflect changes in our practices or legal requirements.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Significant changes will be communicated via email or prominent notices on our platform.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className={`rounded-2xl p-8 mb-16 ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50'
          }`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Mail className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className="text-2xl font-bold">Questions About Our Policies?</h3>
              </div>
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Have questions about our Terms or Privacy Policy? We're here to help clarify any concerns.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={handleContactSupport}
                  className={`px-8 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-3 text-lg ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  info.zeroshothire@gmail.com
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4">
                  <Shield className={`w-6 h-6 mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h4 className="font-medium mb-1">Data Protected</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enterprise Security</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <CheckCircle className={`w-6 h-6 mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h4 className="font-medium mb-1">GDPR Compliant</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Privacy First</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <RefreshCw className={`w-6 h-6 mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h4 className="font-medium mb-1">Always Updated</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Latest Standards</p>
                </div>
              </div>
            </div>
          </section>

          {/* Last Updated Notice */}
          <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span>Policies are actively maintained and updated</span>
            </div>
            <p>Last updated: September 2025</p>
            <p className="mt-2">These policies are effective immediately upon posting.</p>
            <p className="mt-2">
              <button 
                onClick={() => scrollToTop()}
                className={`underline transition-colors ${
                  darkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Back to Top
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-colors ${
            darkMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default TermsPrivacyPage;