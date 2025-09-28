import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Mail, Key, CreditCard, Settings, Lightbulb, ArrowUp, ChevronDown,
  ChevronUp, MessageCircle, Clock, Shield, CheckCircle, AlertCircle, User,
  Lock, RefreshCw, Globe, FileText, Search, Zap, Star, Users, Database,
  ExternalLink, Trash2, AlertTriangle, BookOpen, Video, MessageSquare,
  Headphones, Smartphone, Monitor, Bug, DollarSign, UserX, Eye, EyeOff,
  Camera, Plus, X, Edit, Save, Cancel, Moon, Sun, CreditCard as CardIcon,
  Calendar, Download, Check, Trash
} from 'lucide-react';

const HelpSupportPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('general');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Notification system
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmailContact = () => {
    window.open('mailto:info.zeroshothire@gmail.com?subject=ZeroShotHire Support Request&body=Hi ZeroShotHire Team,%0D%0A%0D%0APlease describe your issue or question:%0D%0A%0D%0A[Your message here]%0D%0A%0D%0AAccount Email (if applicable):%0D%0A%0D%0AThank you!', '_blank');
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) {
      showNotification('Please enter your feedback!', 'error');
      return;
    }
    showNotification('Thank you for your feedback! We appreciate your input.');
    setShowFeedbackModal(false);
    setFeedbackText('');
    setFeedbackRating(0);
  };

  const commonTopics = [
    {
      icon: Key,
      title: "Account & Login",
      description: "Password reset, email update, subscription details",
      color: "blue",
      topics: ["Reset Password", "Update Email", "Account Security", "Login Issues"],
      action: () => scrollToSection('account-section')
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Payment methods, receipts, refunds, and plan changes",
      color: "purple",
      topics: ["Payment Methods", "Receipts", "Plan Changes", "Refund Policy"],
      action: () => scrollToSection('billing-section')
    },
    {
      icon: Settings,
      title: "Technical Issues",
      description: "Bugs, loading problems, or error messages",
      color: "red",
      topics: ["Bug Reports", "Loading Issues", "Error Messages", "Performance"],
      action: () => scrollToSection('technical-section')
    },
    {
      icon: Lightbulb,
      title: "Feature Requests & Feedback",
      description: "Suggest improvements or new tools",
      color: "green",
      topics: ["New Features", "Improvements", "User Feedback", "Product Ideas"],
      action: () => setShowFeedbackModal(true)
    }
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox. If you don't see the email, check your spam folder. The reset link expires in 24 hours for security.",
      category: "account"
    },
    {
      question: "What file formats are supported for resume upload?",
      answer: "We support PDF, DOC, DOCX files up to 10MB. For best results, use PDF format as it preserves formatting and ensures accurate analysis. Avoid password-protected files or scanned images.",
      category: "technical"
    },
    {
      question: "How accurate is the AI resume analysis?",
      answer: "Our AI analyzes resumes using advanced machine learning models trained on thousands of successful resumes across industries. While highly accurate, it's designed to provide guidance and suggestions rather than definitive hiring decisions.",
      category: "general"
    },
    {
      question: "Can I upgrade or downgrade my subscription plan?",
      answer: "Yes! You can change your plan anytime from your account settings. Upgrades take effect immediately with prorated billing, while downgrades apply at your next billing cycle.",
      category: "billing"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Google Pay, Apple Pay, and UPI payments for Indian users. All payments are processed securely.",
      category: "billing"
    },
    {
      question: "Is my resume data secure and private?",
      answer: "Absolutely. We use enterprise-grade AES-256 encryption, secure cloud storage, and never share your personal data with third parties. Resume files are automatically deleted 30 days after analysis for privacy protection.",
      category: "security"
    },
    {
      question: "Do you offer refunds?",
      answer: "Due to the instant nature of our AI analysis service, we follow a no-refund policy once a resume has been processed. However, if you experience technical issues preventing analysis, contact support within 48 hours for assistance.",
      category: "billing"
    },
    {
      question: "How long does resume analysis take?",
      answer: "Most analyses complete within 2-5 minutes. Complex resumes or high traffic periods may take up to 10 minutes. You'll receive an email notification when your report is ready.",
      category: "technical"
    },
    {
      question: "Can I analyze multiple resumes with one account?",
      answer: "Yes! Plan limits vary by subscription tier. You can track your usage and remaining analyses in your dashboard. Each analysis counts toward your monthly quota.",
      category: "general"
    },
    {
      question: "How do I cancel my subscription?",
      answer: "Go to Account Settings → Subscription → Cancel Plan. Your subscription remains active until the current billing period ends. You can reactivate anytime before the period expires.",
      category: "billing"
    },
    {
      question: "How do I delete my account permanently?",
      answer: "Account deletion is permanent and cannot be undone. Contact support at info.zeroshothire@gmail.com with your deletion request. All data, reports, and subscription will be permanently removed within 30 days.",
      category: "account"
    },
    {
      question: "What browsers are supported?",
      answer: "ZeroShotHire works best on Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Ensure JavaScript and cookies are enabled for full functionality.",
      category: "technical"
    },
    {
      question: "Can I get help with resume writing?",
      answer: "Our AI provides detailed suggestions for improving your resume content, format, and keywords. For personalized resume writing assistance, consider our premium consultation services.",
      category: "general"
    },
    {
      question: "How does the hiring dashboard work?",
      answer: "The hiring dashboard allows recruiters to upload and analyze multiple candidate resumes, compare scores, and generate hiring insights. Contact sales for enterprise features.",
      category: "general"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const troubleshooting = [
    {
      icon: Bug,
      title: "Common Issues",
      items: [
        "Resume upload fails → Check file size (<10MB) and format (PDF/DOC)",
        "Analysis stuck at 'Processing' → Clear browser cache and retry",
        "Login problems → Check email/password and try password reset",
        "Payment declined → Contact your bank or try different payment method"
      ]
    },
    {
      icon: Monitor,
      title: "Browser Requirements",
      items: [
        "Chrome 90+, Firefox 88+, Safari 14+, Edge 90+",
        "JavaScript enabled",
        "Cookies enabled",
        "Pop-up blocker disabled for zeroshothire.com"
      ]
    }
  ];

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
              <HelpCircle className="w-12 h-12" />
              <h1 className="text-4xl md:text-6xl font-bold">Help & Support</h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Need assistance with your account, resume analysis, or hiring dashboard? We're here to help.
            </p>

            <div className="flex justify-center items-center gap-6 flex-wrap mb-8">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">24h Response</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Email Support</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Expert Help</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleEmailContact}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </button>
              <button
                onClick={() => scrollToSection('faqs')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Browse FAQs
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Quick Search */}
        <section className="mb-16">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search FAQs and help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none text-lg transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </section>

        <main>
          {/* Email Support Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Help Now</h2>
              <p className="text-xl max-w-3xl mx-auto opacity-80">
                Contact our support team via email
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className={`rounded-2xl p-8 shadow-lg transition-all duration-300 border text-center ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                  darkMode ? 'bg-blue-900' : 'bg-blue-100'
                }`}>
                  <Mail className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Support</h3>
                <p className="opacity-80 mb-4">Get detailed help via email</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Response time:</span>
                    <span className="font-medium">24 hours</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-60">Available:</span>
                    <span className="font-medium">24/7</span>
                  </div>
                </div>
                <button
                  onClick={handleEmailContact}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  info.zeroshothire@gmail.com
                </button>
              </div>
            </div>
          </section>
          
          {/* Common Topics */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Topics</h2>
              <p className="text-xl max-w-3xl mx-auto opacity-80">
                Find quick answers to the most common questions and issues
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {commonTopics.map((topic, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border cursor-pointer transform hover:scale-105 hover:-translate-y-1 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-100'
                  }`}
                  onClick={topic.action}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      topic.color === 'blue' ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') :
                      topic.color === 'purple' ? (darkMode ? 'bg-purple-900' : 'bg-purple-100') :
                      topic.color === 'red' ? (darkMode ? 'bg-red-900' : 'bg-red-100') :
                      (darkMode ? 'bg-green-900' : 'bg-green-100')
                    }`}>
                      <topic.icon className={`w-6 h-6 ${
                        topic.color === 'blue' ? (darkMode ? 'text-blue-400' : 'text-blue-600') :
                        topic.color === 'purple' ? (darkMode ? 'text-purple-400' : 'text-purple-600') :
                        topic.color === 'red' ? (darkMode ? 'text-red-400' : 'text-red-600') :
                        (darkMode ? 'text-green-400' : 'text-green-600')
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                      <p className="opacity-80 mb-4">{topic.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {topic.topics.map((subtopic, subIndex) => (
                          <span
                            key={subIndex}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {subtopic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section id="technical-section" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Troubleshooting</h2>
              <p className="text-xl opacity-80">Common solutions to get you back on track</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {troubleshooting.map((section, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 shadow-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                    <h3 className="text-lg font-bold">{section.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm opacity-80 flex items-start gap-2">
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          darkMode ? 'text-green-400' : 'text-green-500'
                        }`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs Section */}
          <section id="faqs" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl max-w-3xl mx-auto opacity-80">
                Quick answers to help you get the most out of ZeroShotHire
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl shadow-lg border overflow-hidden ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className={`w-full px-8 py-6 text-left flex items-center justify-between transition-colors ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                        {expandedFaq === index ? (
                          <ChevronUp className={`w-5 h-5 flex-shrink-0 ${
                            darkMode ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 flex-shrink-0 ${
                            darkMode ? 'text-gray-400' : 'text-gray-400'
                          }`} />
                        )}
                      </button>
                      
                      {expandedFaq === index && (
                        <div className="px-8 pb-6">
                          <p className="opacity-80 leading-relaxed">{faq.answer}</p>
                          <div className="mt-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              faq.category === 'account' ? (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700') :
                              faq.category === 'billing' ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700') :
                              faq.category === 'technical' ? (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700') :
                              faq.category === 'security' ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700') :
                              (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')
                            }`}>
                              {faq.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className={`w-12 h-12 mx-auto mb-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="opacity-80">
                    Try searching with different keywords or browse our common topics above.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Account Management Section */}
          <section id="account-section" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Account Management</h2>
              <p className="text-xl opacity-80">Need help with your account? Contact us directly</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className={`rounded-xl p-6 shadow-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <User className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-xl font-bold">Account Settings</h3>
                </div>
                <ul className="space-y-3 opacity-80">
                  <li className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    Update personal information and contact details
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    Change password and enable two-factor authentication
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    Manage email notification preferences
                  </li>
                </ul>
                <button
                  className={`mt-4 px-6 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={handleEmailContact}
                >
                  Contact Support
                </button>
              </div>

              <div className={`rounded-xl p-6 shadow-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className="text-xl font-bold">Privacy & Security</h3>
                </div>
                <ul className="space-y-3 opacity-80 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    Enterprise-grade security and encryption
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`} />
                    Automatic data deletion after 30 days
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                    Account deletion requests handled via email
                  </li>
                </ul>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                    darkMode 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  onClick={handleEmailContact}
                >
                  Security Support
                </button>
              </div>
            </div>
          </section>

          {/* Billing Section */}
          <section id="billing-section" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Billing & Payments</h2>
              <p className="text-xl opacity-80">Need help with billing? Contact our support team</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className={`rounded-xl p-6 shadow-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className="text-lg font-bold">Payment Methods</h3>
                </div>
                <ul className="space-y-2 text-sm opacity-80 mb-4">
                  <li>• Credit/Debit Cards</li>
                  <li>• PayPal</li>
                  <li>• Google Pay</li>
                  <li>• Apple Pay</li>
                  <li>• UPI (Indian users)</li>
                </ul>
                <button
                  className={`w-full py-2 rounded-lg transition-colors text-sm ${
                    darkMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  onClick={handleEmailContact}
                >
                  Payment Help
                </button>
              </div>

              <div className={`rounded-xl p-6 shadow-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-lg font-bold">Invoices & Receipts</h3>
                </div>
                <p className="text-sm opacity-80 mb-4">
                  Need copies of your receipts or have billing questions? We can help you access your transaction history.
                </p>
                <button
                  className={`w-full py-2 rounded-lg transition-colors text-sm ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={handleEmailContact}
                >
                  Request Receipts
                </button>
              </div>

              <div className={`rounded-xl p-6 shadow-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h3 className="text-lg font-bold">Subscription</h3>
                </div>
                <p className="text-sm opacity-80 mb-4">
                  Questions about upgrading, downgrading, or canceling your subscription? Get personalized assistance.
                </p>
                <button
                  className={`w-full py-2 rounded-lg transition-colors text-sm ${
                    darkMode 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  onClick={handleEmailContact}
                >
                  Subscription Help
                </button>
              </div>
            </div>

            {/* Refund Policy */}
            <div className={`mt-8 rounded-xl p-6 border ${
              darkMode 
                ? 'bg-yellow-900/20 border-yellow-600' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <div>
                  <h4 className={`text-lg font-semibold mb-2 ${
                    darkMode ? 'text-yellow-300' : 'text-yellow-900'
                  }`}>Refund Policy</h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-yellow-200' : 'text-yellow-800'
                  }`}>
                    Due to the instant nature of our AI analysis service, we follow a no-refund policy once a resume has been processed. 
                    However, if you experience technical issues preventing analysis, please contact support within 48 hours for assistance.
                  </p>
                </div>
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
                <h3 className="text-2xl font-bold">Still Need Help?</h3>
              </div>
              <p className="opacity-80 mb-8 max-w-2xl mx-auto">
                Your career journey matters to us—reach out anytime and we'll get back within 24 hours.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={handleEmailContact}
                  className={`px-8 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-3 text-lg ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  info.zeroshothire@gmail.com
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className={`px-8 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-3 text-lg ${
                    darkMode 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Feedback
                </button>
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4">
                  <Clock className={`w-6 h-6 mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h4 className="font-medium mb-1">Response Time</h4>
                  <p className="text-sm opacity-80">Within 24 hours</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <Globe className={`w-6 h-6 mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <h4 className="font-medium mb-1">Support Hours</h4>
                  <p className="text-sm opacity-80">24/7 Email Support</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <Star className={`w-6 h-6 mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <h4 className="font-medium mb-1">Expert Help</h4>
                  <p className="text-sm opacity-80">Dedicated Team</p>
                </div>
                <div className="flex flex-col items-center p-4">
                  <Headphones className={`w-6 h-6 mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h4 className="font-medium mb-1">Email Only</h4>
                  <p className="text-sm opacity-80">Professional Support</p>
                </div>
              </div>
            </div>
          </section>

          {/* Status & Updates */}
          <div className="text-center text-sm opacity-60">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span>All systems operational</span>
            </div>
            <p>Last updated: September 2025 | Help Center v2.1</p>
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
        </main>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl p-8 max-w-2xl w-full ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Share Your Feedback</h2>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium mb-3">What type of feedback do you have?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'general', label: 'General Feedback', icon: MessageCircle },
                    { value: 'feature', label: 'Feature Request', icon: Lightbulb },
                    { value: 'bug', label: 'Bug Report', icon: Bug },
                    { value: 'improvement', label: 'Improvement', icon: Zap }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFeedbackType(type.value)}
                      className={`p-3 rounded-lg border transition-colors flex items-center gap-3 ${
                        feedbackType === type.value
                          ? (darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
                          : (darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300')
                      }`}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-3">Rate your experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1 transition-colors ${
                        star <= feedbackRating 
                          ? 'text-yellow-400' 
                          : (darkMode ? 'text-gray-600' : 'text-gray-300')
                      }`}
                    >
                      <Star className="w-8 h-8" fill={star <= feedbackRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-sm font-medium mb-2">Tell us more</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={6}
                  placeholder={
                    feedbackType === 'feature' ? 'Describe the feature you\'d like to see...' :
                    feedbackType === 'bug' ? 'Describe the bug you encountered...' :
                    feedbackType === 'improvement' ? 'What would you like us to improve?' :
                    'Share your thoughts about ZeroShotHire...'
                  }
                  className={`w-full p-4 rounded-lg border outline-none transition-colors resize-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default HelpSupportPage;