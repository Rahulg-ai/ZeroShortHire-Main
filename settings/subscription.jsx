import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Shield, 
  Sparkles, 
  Users, 
  Download, 
  Target, 
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Lock,
  CreditCard,
  Phone,
  Mail,
  ArrowRight,
  Moon,
  Sun,
  ArrowUp,
  TrendingUp,
  FileText,
  MessageSquare,
  Clock,
  Globe,
  X
} from 'lucide-react';

const ZeroShotHirePricing = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const handleContactSupport = () => {
    window.open('mailto:info.zeroshothire@gmail.com?subject=Pricing%20Inquiry&body=Hi%20ZeroShotHire%20Team,%0D%0A%0D%0AI%20have%20questions%20about%20your%20pricing%20plans:%0D%0A%0D%0A[Your%20question%20here]%0D%0A%0D%0AThank%20you!', '_blank');
  };

  const plans = [
    {
      name: 'FREE',
      price: '₹0',
      period: '',
      badge: '',
      description: 'Perfect for trying out our AI analysis',
      features: [
        { icon: Target, text: '1 resume analysis per month' },
        { icon: CheckCircle, text: 'Basic insights and scoring' },
        { icon: Shield, text: 'Secure processing' },
        { icon: Mail, text: 'Email support' }
      ],
      limitations: ['Limited analysis depth', 'Basic recommendations'],
      buttonText: 'Get Started Free',
      buttonStyle: `transition-all duration-200 ${
        darkMode 
          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      }`,
      popular: false,
      bestValue: false
    },
    {
      name: 'BASIC',
      price: '₹99',
      period: '/month',
      badge: '',
      description: 'Great for active job seekers',
      features: [
        { icon: Target, text: '5 analyses per month' },
        { icon: Download, text: 'PDF reports with insights' },
        { icon: Sparkles, text: 'Skill gap analysis' },
        { icon: TrendingUp, text: 'ATS compatibility score' },
        { icon: Mail, text: 'Priority email support' }
      ],
      limitations: [],
      buttonText: 'Choose Basic',
      buttonStyle: `transition-all duration-200 ${
        darkMode 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`,
      popular: false,
      bestValue: false
    },
    {
      name: 'PRO',
      price: '₹249',
      period: '/month',
      badge: 'Most Popular',
      description: 'Best for serious career advancement',
      features: [
        { icon: Target, text: '25 analyses per month' },
        { icon: Sparkles, text: 'Advanced skill roadmap' },
        { icon: Users, text: 'Industry benchmarking' },
        { icon: Download, text: 'Premium PDF reports' },
        { icon: Award, text: 'Interview preparation tips' },
        { icon: MessageSquare, text: 'Live chat support' }
      ],
      limitations: [],
      buttonText: 'Choose Pro',
      buttonStyle: `transition-all duration-200 ${
        darkMode 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`,
      popular: true,
      bestValue: false
    },
    {
      name: 'ENTERPRISE',
      price: '₹499',
      period: '/month',
      badge: 'Best Value',
      description: 'For recruiters and career professionals',
      features: [
        { icon: Zap, text: '100 analyses per month' },
        { icon: Download, text: 'Advanced analytics dashboard' },
        { icon: Award, text: 'Custom skill frameworks' },
        { icon: Star, text: 'White-label reports' },
        { icon: Users, text: 'Team collaboration tools' },
        { icon: Phone, text: 'Dedicated phone support' },
        { icon: Clock, text: 'Priority processing' }
      ],
      limitations: [],
      buttonText: 'Choose Enterprise',
      buttonStyle: `transition-all duration-200 ${
        darkMode 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-green-600 text-white hover:bg-green-700'
      }`,
      popular: false,
      bestValue: true
    }
  ];

  const testimonials = [
    {
      name: 'Rahul Kumar',
      role: 'Software Developer',
      content: 'The AI analysis helped me identify exactly what recruiters were looking for. Got 3 interview calls in my first week!',
      rating: 5,
      company: 'TCS'
    },
    {
      name: 'Priya Sharma',
      role: 'Data Analyst',
      content: 'ZeroShotHire\'s insights improved my resume score from 65% to 92%. The skill recommendations were spot-on.',
      rating: 5,
      company: 'Infosys'
    },
    {
      name: 'Amit Patel',
      role: 'Product Manager',
      content: 'The industry benchmarking feature showed me exactly where I stood. Upgraded to Pro and landed my dream job!',
      rating: 5,
      company: 'Flipkart'
    }
  ];

  const faqs = [
    {
      question: 'How does the AI resume analysis work?',
      answer: 'Our advanced AI analyzes your resume against successful profiles in your industry, checking for keyword optimization, ATS compatibility, skill gaps, and formatting issues. You receive a detailed report with actionable recommendations.'
    },
    {
      question: 'Can I upgrade or downgrade my plan anytime?',
      answer: 'Yes, you can change your subscription plan anytime. Upgrades take effect immediately with prorated billing, while downgrades apply at your next billing cycle.'
    },
    {
      question: 'Is my resume data secure and private?',
      answer: 'Absolutely. We use enterprise-grade encryption and never share your personal data. Resume files are automatically deleted after analysis for maximum privacy protection.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including UPI, Credit/Debit cards, Net Banking, and popular wallets like PhonePe, Google Pay, and Paytm.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Due to the instant nature of our AI analysis service, we follow a no-refund policy once analysis is processed. However, if you experience technical issues, contact support within 48 hours.'
    },
    {
      question: 'How accurate is the AI analysis?',
      answer: 'Our AI has been trained on thousands of successful resumes across industries with 95%+ accuracy. While highly reliable, it provides guidance and suggestions rather than guarantees.'
    }
  ];

  const handlePlanSelection = (plan) => {
    if (plan.name === 'FREE') {
      showNotification('Redirecting to free signup!');
    } else {
      showNotification(`Starting checkout process for ${plan.name} plan`);
    }
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
              <Sparkles className="w-12 h-12" />
              <h1 className="text-4xl md:text-6xl font-bold">Choose Your Plan</h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              AI-powered resume analysis that gets you hired faster. Choose the perfect plan for your career goals.
            </p>

            {/* Trust indicators */}
            <div className="flex justify-center items-center gap-6 flex-wrap mb-8">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">10,000+ Users</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">85% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 shadow-xl transition-all duration-300 hover:scale-105 ${
                  plan.bestValue 
                    ? (darkMode ? 'bg-gradient-to-br from-green-600 to-green-700 text-white' : 'bg-gradient-to-br from-green-500 to-green-600 text-white')
                    : (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')
                } ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900' 
                    : 'border'
                }`}
              >
                {/* Badge */}
                {(plan.popular || plan.bestValue) && (
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold ${
                    plan.popular 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-yellow-500 text-yellow-900'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-xl font-bold mb-2 ${
                    plan.bestValue 
                      ? 'text-white' 
                      : (darkMode ? 'text-white' : 'text-gray-900')
                  }`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${
                    plan.bestValue 
                      ? 'text-green-100' 
                      : (darkMode ? 'text-gray-400' : 'text-gray-600')
                  }`}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${
                      plan.bestValue 
                        ? 'text-white' 
                        : (darkMode ? 'text-white' : 'text-gray-900')
                    }`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm ${
                        plan.bestValue 
                          ? 'text-green-100' 
                          : (darkMode ? 'text-gray-400' : 'text-gray-500')
                      }`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <feature.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.bestValue 
                          ? 'text-green-200' 
                          : (darkMode ? 'text-green-400' : 'text-green-600')
                      }`} />
                      <span className={`text-sm ${
                        plan.bestValue 
                          ? 'text-white' 
                          : (darkMode ? 'text-gray-300' : 'text-gray-600')
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="mb-6">
                    <p className={`text-xs font-medium mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Limitations:
                    </p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, idx) => (
                        <li key={idx} className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className={`py-16 ${
        darkMode ? 'bg-gray-800/50' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ZeroShotHire?
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Advanced AI technology meets career expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border shadow-lg`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                darkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <Sparkles className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Analysis</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Our advanced AI analyzes millions of job postings to give you precise, industry-specific recommendations.
              </p>
            </div>

            <div className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border shadow-lg`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                darkMode ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">ATS Optimization</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Ensure your resume passes Applicant Tracking Systems with our specialized formatting and keyword analysis.
              </p>
            </div>

            <div className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border shadow-lg`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                darkMode ? 'bg-purple-900' : 'bg-purple-100'
              }`}>
                <Users className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">Industry Insights</h3>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Get benchmarked against industry standards and learn what top performers in your field are highlighting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Job Seekers Nationwide
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              See how ZeroShotHire has helped thousands land their dream jobs
            </p>
          </div>

          <div className={`rounded-2xl p-8 shadow-lg ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50'
          }`}>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className={`text-lg mb-6 italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                "{testimonials[activeTestimonial].content}"
              </p>
              <div>
                <p className="font-semibold text-lg">
                  {testimonials[activeTestimonial].name}
                </p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === activeTestimonial
                      ? 'bg-blue-600'
                      : (darkMode ? 'bg-gray-600' : 'bg-gray-300')
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-lg border overflow-hidden ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`w-full px-8 py-6 text-left flex items-center justify-between transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className={`w-5 h-5 flex-shrink-0 ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className={`py-16 ${
        darkMode 
          ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <MessageSquare className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-3xl md:text-4xl font-bold">
              Need Help Choosing?
            </h2>
          </div>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Our team is here to help you find the perfect plan for your career goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl p-8 max-w-md w-full ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Contact Support</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Have questions about our plans? We're here to help you choose the right option.
            </p>
            <button
              onClick={handleContactSupport}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Send Email
            </button>
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

export default ZeroShotHirePricing;