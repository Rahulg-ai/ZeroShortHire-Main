import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileComponent from './profile';
import JobApplicationsDashboard from './my_application'
import HackathonsSection from './Competition_Challenge/Hackathons';
import StudentBrainGames from './Competition_Challenge/Brain_games';
import DSAPracticeSection from './Skill_development/DSA';
import QuizzesTestsSection from './Skill_development/Quiz_Test';
import ResumeAnalyzer from './Resume_ATS';
import JobPostingWorkspace from './post_job';
import EnhancedHRDashboard from './HR_Dashboard/HR_dashboard';
import AdvancedJobManagement from './HR_Dashboard/job_manage';
import CandidatesPage from './HR_Dashboard/Candidates';
import HiringAnalytics from './HR_Dashboard/Hiring';
import InterviewDashboard from './HR_Dashboard/Interview';
import ATSIntegration from './HR_Dashboard/ATS';
import AssessmentConfig from './HR_Dashboard/Assessment';
import AssessmentApp from './Cheating/assessment_system';
import ZeroShotHirePricing from './settings/subscription';
import TermsPrivacyPage from './settings/terms';
import HelpSupportPage from './settings/help';

import { 
  Home, User, Briefcase, FileText, BookOpen, Users, 
  Code, Moon, Sun, Bell, Menu, MessageSquare,
  TrendingUp, Award, Calendar, MessageCircle, Star,
  BarChart3, Target, Zap, Activity,
  ChevronDown, ChevronUp, Upload,
  Edit, Share2, Send, Settings,
  ThumbsUp, MoreHorizontal, Camera,
  Plus, Eye, Bookmark, UserPlus, GitBranch,
  Mail, Video, Brain, Network, Trophy, Globe, HelpCircle, Shield,
  CreditCard, Flame, X, LogOut, Palette, ToggleLeft, ToggleRight, Database,
  CheckCircle, Clock, MapPin, Filter, Search, ArrowRight, Bot, Languages, Minimize2, Maximize2, Mic, MicOff, Volume2
} from 'lucide-react';


const UnifiedDashboard = () => {
  const isDarkMode = true;
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userRole, setUserRole] = useState('student'); 
  const [userName] = useState('Sujal');
  const [showFullJobs, setShowFullJobs] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedJobFilters, setSelectedJobFilters] = useState({
    type: 'all',
    experience: 'all',
    location: 'all'
  });
  const handleViewAllJobs = () => {
    console.log('View All Jobs clicked - navigating to applications');
    setActiveSection('applications');
  };
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showJobSavedPopup, setShowJobSavedPopup] = useState(false);
    // Language Tool States
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Chatbot States
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! I'm your ZeroShotHire assistant. How can I help you today?", sender: 'bot', timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) {
      setExpandedSections({});
    }
  }, [sidebarOpen]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

const sidebarItems = userRole === 'student' ? [
  { 
    id: 'dashboard', 
    icon: Home, 
    label: 'Dashboard',
    type: 'single'
  },
  { 
    id: 'profile', 
    icon: User, 
    label: 'My Profile',
    type: 'single'
  },
  {
    id: 'resume-analyzer',
    icon: FileText,
    label: 'Resume Analyzer',
    type: 'single',
    highlighted: true
  },
  {
    id: 'applications',
    icon: FileText,
    label: 'Applications',
    type: 'single',
  },
  {
    id: 'assessment_system',
    icon: FileText,
    label: 'Assessment System',
    type: 'single',
    highlighted: true
  },
  {
    id: 'competitions',
    icon: Trophy,
    label: 'Competitions & Challenges',
    type: 'expandable',
    subItems: [
      { id: 'hackathons', label: 'Hackathons', icon: Flame },
      { id: 'brain-games', label: 'Brain Games', icon: Brain }
    ]
  },
  {
    id: 'skill-development',
    icon: BookOpen,
    label: 'Skill Development',
    type: 'expandable',
    subItems: [
      { id: 'dsa-practice', label: 'DSA Practice', icon: Code },
      { id: 'quizzes', label: 'Quizzes & Tests', icon: Target }
    ]
    
  },
] : [
    { id: 'hr-dashboard', icon: Home, label: 'HR Dashboard', type: 'single' },
    { id: 'candidates', icon: Users, label: 'Candidates', type: 'single' },
    { id: 'job-postings', icon: Briefcase, label: 'Job Management', type: 'single' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', type: 'single' },
    { id: 'interviews', icon: Calendar, label: 'Interviews', type: 'single' },
    { id: 'ats', icon: Database, label: 'Applicant Tracking System (ATS)', type: 'single' },
    { id: 'assessments', icon: Target, label: 'Assessment Section', type: 'single' },
];

  // Dashboard data with focus on jobs and career development
  const dashboardData = {
    profileStrength: 75,
    badges: [
      { id: 1, name: 'Resume Expert', icon: '📄', description: 'Completed resume analysis' },
      { id: 2, name: 'Quick Learner', icon: '⚡', description: 'Completed 5 skill assessments' },
      { id: 3, name: 'Code Warrior', icon: '⚔️', description: 'Solved 50+ DSA problems' }
    ],
    recommendedJobs: [
  {
    id: 25034,
    company: 'Ministry of Corporate Affairs',
    logo: 'https://imgs.search.brave.com/JpTn2dTW-BPgl1lCAPIlGRO7giqYkwbbAwxJdMIMG5U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vbGF3Ymhv/b21pLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNS8wNC9N/aW5pc3RyeS1vZi1D/b3Jwb3JhdGUtQWZm/YWlycy5qcGc_Zml0/PTEyMDAsODAwJnNz/bD0x',
    position: 'AI Research Intern',
    location: 'Remote / Delhi',
    type: 'Internship',
    stipend: '₹10,000/month',
    posted: '2 days ago',
    matchScore: 94,
    badges: ['Government', 'New'],
    requirements: ['Python', 'Machine Learning Basics', 'Problem Solving']
  },
  {
    id: 25035,
    company: 'PM Internship Scheme',
    logo: 'https://imgs.search.brave.com/JpTn2dTW-BPgl1lCAPIlGRO7giqYkwbbAwxJdMIMG5U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vbGF3Ymhv/b21pLmNvbS93cC1j/b250ZW50L3VwbG9h/ZHMvMjAyNS8wNC9N/aW5pc3RyeS1vZi1D/b3Jwb3JhdGUtQWZm/YWlycy5qcGc_Zml0/PTEyMDAsODAwJnNz/bD0x',
    position: 'Policy Research Intern',
    location: 'Remote / Pan India',
    type: 'Internship',
    stipend: '₹8,000/month',
    posted: '1 day ago',
    matchScore: 89,
    badges: ['Trending', 'Government'],
    requirements: ['Research', 'Data Analysis', 'Report Writing']
  },
  {
    id: 25036,
    company: 'Digital India Initiative',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/300px-Digital_India_logo.svg.png',
    position: 'Full Stack Developer Intern',
    location: 'Hybrid (Delhi + Remote)',
    type: 'Internship',
    stipend: '₹12,000/month',
    posted: '3 hours ago',
    matchScore: 85,
    badges: ['Tech', 'New'],
    requirements: ['Node.js', 'React', 'SQL']
  }
  ],
    nextAction: {
      title: 'Take JavaScript Assessment',
      description: 'Boost your profile strength by 15%',
      action: 'Start Test',
      icon: Target,
      color: 'from-green-500 to-green-600'
    },
    skillProgress: {
      development: 70,
      learningPath: 45
    },
    notifications: [
      { id: 1, type: 'success', message: 'Job application submitted to Google', time: '5m ago', unread: true },
      { id: 2, type: 'info', message: 'Resume analysis completed', time: '1h ago', unread: true },
      { id: 3, type: 'achievement', message: 'Badge earned: Code Warrior', time: '2h ago', unread: false },
      { id: 4, type: 'reminder', message: 'JavaScript test available', time: '1d ago', unread: false }
    ]
  };

  const allJobs = [
    ...dashboardData.recommendedJobs,
    {
      id: 4,
      company: 'Amazon',
      logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=150',
      position: 'Backend Developer',
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$95k - $130k',
      posted: '1 week ago',
      matchScore: 78,
      badges: ['Remote'],
      requirements: ['Java', 'AWS', 'Microservices']
    },
    {
      id: 5,
      company: 'Meta',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150',
      position: 'Data Scientist',
      location: 'Menlo Park, CA',
      type: 'Full-time',
      salary: '$120k - $160k',
      posted: '4 days ago',
      matchScore: 71,
      badges: ['High Salary'],
      requirements: ['Python', 'Machine Learning', 'SQL']
    }
  ];

      // Handle job save with popup
      const handleJobSave = () => {
        // Auto-save job logic here
        setShowJobSavedPopup(true);
        
        // Auto-hide popup after 3 seconds
        setTimeout(() => {
          setShowJobSavedPopup(false);
        }, 3000);

      // Handle view all jobs navigation
      const handleViewAllJobs = () => {
          console.log('View All Jobs clicked - navigating to applications');
          setActiveSection('applications');
        };
      };

      // Language configurations
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' }
    ];

    // Chatbot helper functions
    const handleSendMessage = async () => {
      if (!chatInput.trim()) return;
      
      const userMessage = {
        id: Date.now(),
        text: chatInput,
        sender: 'user',
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsTyping(true);
      
      // Simulate bot response
      setTimeout(() => {
        const botResponses = [
          "I can help you with job applications, resume tips, and career guidance!",
          "Would you like me to help you find relevant jobs based on your skills?",
          "I can assist with interview preparation and skill assessments.",
          "Let me know if you need help with your profile or applications!",
          "I'm here to support your career journey. What specific area would you like help with?"
        ];
        
        const botMessage = {
          id: Date.now() + 1,
          text: botResponses[Math.floor(Math.random() * botResponses.length)],
          sender: 'bot',
          timestamp: Date.now()
        };
        
        setChatMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    };

    const handleLanguageChange = (languageCode) => {
      setSelectedLanguage(languageCode);
      setShowLanguageSelector(false);
      // Here you would typically call your translation service
      console.log('Language changed to:', languageCode);
    };

  const renderTopBar = () => (
    <motion.div 
       initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-16'}`}
        style={{ 
          borderLeft: 'none',
          marginLeft: '-1px'
        }}
      >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <Menu size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection(userRole === 'student' ? 'dashboard' : 'hr-dashboard')}
            className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent cursor-pointer transition-all duration-200"
          >
            ZeroShotHire
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:block"
          >
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Welcome, {userName}!
            </span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUserRole(userRole === 'student' ? 'Admin' : 'student')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          >
            {userRole === 'student' ? <Users size={16} /> : <User size={16} />}
            Switch to {userRole === 'student' ? 'Admin' : 'Student'}
          </motion.button>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection('post-job')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            POST A JOB
          </motion.button>

          {/* Language Selector */}
  <div className="relative dropdown-container">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        setShowLanguageSelector(!showLanguageSelector);
        setShowNotifications(false);
        setShowSettings(false);
      }}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
    >
      <Languages size={20} />
      <span className="text-2xl">{languages.find(lang => lang.code === selectedLanguage)?.flag}</span>
    </motion.button>

  <AnimatePresence>
    {showLanguageSelector && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="p-2">
          <div className="flex items-center justify-between p-2 mb-2">
            <h3 className="font-semibold">Language</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowLanguageSelector(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X size={16} />
            </motion.button>
          </div>
          
          <div className="space-y-1">
            {languages.map((language) => (
              <motion.button
                key={language.code}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left ${
                  selectedLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm">{language.name}</span>
                {selectedLanguage === language.code && <CheckCircle size={14} className="ml-auto" />}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

{/* Chatbot */}
<AnimatePresence>
  {showChatbot && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 100 }}
      className="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="font-semibold">ZeroShot Assistant</h3>
            <p className="text-xs text-white text-opacity-80">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setChatMinimized(!chatMinimized)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            {chatMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChatbot(false)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      {/* Chat Body */}
      <AnimatePresence>
        {!chatMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 400 }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 rounded-bl-sm'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )}
</AnimatePresence>

{/* Chatbot Toggle Button */}
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  onClick={() => setShowChatbot(true)}
  className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 ${showChatbot ? 'hidden' : ''}`}
>
  <MessageSquare size={24} />
</motion.button>

          {/* Notifications Dropdown */}
          <div className="relative dropdown-container">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 relative"
            >
              <Bell size={20} />
              {dashboardData.notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {dashboardData.notifications.filter(n => n.unread).length}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Notifications</h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {dashboardData.notifications.map((notification) => (
                        <motion.div 
                          key={notification.id}
                          whileHover={{ x: 4 }}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            notification.unread 
                              ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notification.type === 'success' && <CheckCircle size={16} className="text-green-500 mt-0.5" />}
                            {notification.type === 'info' && <FileText size={16} className="text-blue-500 mt-0.5" />}
                            {notification.type === 'achievement' && <Award size={16} className="text-yellow-500 mt-0.5" />}
                            {notification.type === 'reminder' && <Clock size={16} className="text-orange-500 mt-0.5" />}
                            <div className="flex-1">
                              <p className="text-sm font-medium leading-5">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1 leading-4">{notification.time}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
            />
            <div className="hidden md:block">
              <p className="font-medium text-sm leading-4">{userName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-4">Software Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSidebar = () => (
    <motion.div 
      animate={{ width: sidebarOpen ? 256 : 64 }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300"
    >
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <motion.div 
          className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}
          animate={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection(userRole === 'student' ? 'dashboard' : 'hr-dashboard')}
            className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer"
          >
            <img src="Main_Logo.jpg" alt="ZeroShotHire Logo" className="w-full h-full object-cover" />
          </motion.button>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(userRole === 'student' ? 'dashboard' : 'hr-dashboard')}
                className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent cursor-pointer transition-all duration-200"
              >
                ZeroShotHire
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.type === 'single') {
                    setActiveSection(item.id);
                  } else {
                    toggleSection(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                } ${!sidebarOpen && 'justify-center'}`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between flex-1"
                    >
                      <span className="font-medium text-left leading-5">{item.label}</span>
                      {item.type === 'expandable' && (
                        <motion.div
                          animate={{ rotate: expandedSections[item.id] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <AnimatePresence>
                {sidebarOpen && item.type === 'expandable' && expandedSections[item.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-2 space-y-1 overflow-hidden"
                  >
                    {item.subItems.map((subItem, subIndex) => (
                      <motion.button
                        key={subItem.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: subIndex * 0.05 }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSection(subItem.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200 ${
                          activeSection === subItem.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <subItem.icon size={16} className="flex-shrink-0" />
                        <span className="font-medium text-left leading-4">{subItem.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Settings Section at Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="relative dropdown-container">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSettings(!showSettings)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${!sidebarOpen && 'justify-center'}`}
          >
            <Settings size={20} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium text-left leading-5"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-0 mb-2 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              >
            <div className="p-2">
              <div className="flex items-center justify-between p-2 mb-2">
                <h3 className="font-semibold leading-5">Settings</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <div className="space-y-1">
                {[
                  { icon: Bell, label: 'Subscription' },
                  { icon: Shield, label: 'Privacy & Security' },
                  { icon: HelpCircle, label: 'Help & Support' },
                  { icon: LogOut, label: 'Sign Out', color: 'text-red-500' }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        if (item.label === 'Sign Out') {
                          /* ---------- TEMPORARY SIGN-OUT LOGIC ---------- */
                          try {
                            // existing sign-out logic stays exactly the same
                            localStorage.removeItem("token");
                            window.location.href = "/login";
                          } catch (err) {
                            console.error("Sign-out failed:", err);
                          }
                          /* --------------------------------------------- */
                        } else if (item.label === 'Subscription') {
                          setActiveSection('subscription');
                          setShowSettings(false);
                        } else if (item.label === 'Privacy & Security') {
                          setActiveSection('Privacy & Security');
                          setShowSettings(false);
                        } else if (item.label === 'Help & Support') {
                          setActiveSection('Help & Support');
                          setShowSettings(false);
                        } else {
                          // handle other settings clicks here if needed
                          console.log(`${item.label} clicked`);
                        }
                      }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left ${item.color || ''}`}
                  >
                    <item.icon size={16} />
                    <span className="text-sm leading-4">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

const renderProfileStrength = () => {
  
  // Mock data for demonstration
  const dashboardData = {
    profileStrength: 65,
    level: { number: 2, name: "Rising Talent" },
    badges: [
      { id: 1, icon: '🏆', name: 'First Upload', description: 'Uploaded your first resume' },
      { id: 2, icon: '⚡', name: 'Quick Starter', description: 'Completed profile in under 10 mins' },
      { id: 3, icon: '🎯', name: 'Skill Explorer', description: 'Added 3+ skills to profile' }
    ],
    progressItems: [
      { id: 1, label: 'Resume uploaded', completed: true },
      { id: 2, label: '3 skills added', completed: true },
      { id: 3, label: 'Add portfolio link', completed: false },
      { id: 4, label: 'Complete skill assessment', completed: false }
    ]
  };

  // Calculate gradient color based on percentage
  const getGradientColors = (percentage) => {
    if (percentage >= 80) return 'from-green-400 to-emerald-500';
    if (percentage >= 60) return 'from-yellow-400 to-orange-500';
    if (percentage >= 40) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-6 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-6 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent leading-8">
              Profile Strength
            </h2>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-medium rounded-full shadow-lg leading-4">
              <Trophy size={14} />
              Level {dashboardData.level.number}: {dashboardData.level.name}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSection('profile')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600/30"
          >
            <FileText size={14} />
            View Profile
          </motion.button>
        </div>
        
        <div className="flex items-start justify-between gap-8">
          {/* Progress Circle and Info */}
          <div className="flex items-center gap-6">
            {/* Enhanced Progress Circle */}
            <div className="relative">
              <div className="relative w-28 h-28">
                {/* Background circle */}
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-slate-600"
                  />
                </svg>
                
                {/* Animated gradient progress */}
                <svg className="absolute inset-0 w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" className={`${getGradientColors(dashboardData.profileStrength).split(' ')[0].replace('from-', 'text-')}`} />
                      <stop offset="100%" className={`${getGradientColors(dashboardData.profileStrength).split(' ')[1].replace('to-', 'text-')}`} />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${dashboardData.profileStrength}, 100` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="drop-shadow-sm"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-3xl font-bold text-white leading-8"
                    >
                      {dashboardData.profileStrength}%
                    </motion.span>
                  </div>
                </div>
              </div>
              
              {/* Glow effect */}
              <motion.div 
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${getGradientColors(dashboardData.profileStrength)} opacity-20 blur-xl`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: 0,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            {/* Progress Info */}
            <div className="flex-1">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl font-semibold text-white mb-1 leading-6"
              >
                Upload resume to increase score
              </motion.p>
              <p className="text-base text-slate-400 mb-6 leading-5">
                Complete your profile to unlock better job matches
              </p>
            </div>
          </div>
          
          {/* Badges - moved to right side */}
          <div className="flex items-center gap-4">
            {dashboardData.badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 1.5 + index * 0.15,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ scale: 1.1, y: -4 }}
                className="group relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-200 to-orange-600 rounded-2xl flex items-center justify-center text-xl cursor-pointer shadow-lg hover:shadow-2xl transition-all transform hover:rotate-6 border-2 border-yellow-300">
                  <span className="filter drop-shadow-sm">{badge.icon}</span>
                </div>
                
                {/* Enhanced tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-black/90 text-white rounded-xl p-3 text-center shadow-xl min-w-max">
                    <div className="font-semibold text-yellow-300 leading-4">{badge.name}</div>
                    <div className="text-gray-300 mt-1 text-sm leading-4">{badge.description}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const renderJobCard = (job, index, isCompact = true) => (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg leading-6">{job.position}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-5">{job.company}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium leading-4">
                <Target size={14} />
                {job.matchScore}% match
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3 leading-4">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {job.location}
            </div>
            <span className="capitalize">{job.type.replace('-', ' ')}</span>
            <span>{job.salary}</span>
            <span>{job.posted}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {job.badges.map((badge, badgeIndex) => (
              <span
                key={badgeIndex}
                className={`px-2 py-1 rounded-full text-xs font-medium leading-4 ${
                  badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  badge === 'Trending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  badge === 'Remote' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  badge === 'Internship' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  badge === 'Startup' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                  badge === 'High Salary' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  badge === 'Creative' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {badge}
              </span>
            ))}
          </div>

          {!isCompact && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-4">Required Skills:</p>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium leading-4"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium leading-5"
            >
              Apply Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowJobSavedPopup(true);
                setTimeout(() => setShowJobSavedPopup(false), 3000);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <Bookmark size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Fixed filter logic
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = jobSearchQuery === '' || 
      job.position.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(jobSearchQuery.toLowerCase()));
    
    const matchesType = selectedJobFilters.type === 'all' || 
      job.type === selectedJobFilters.type;
    
    const matchesExperience = selectedJobFilters.experience === 'all' ||
      job.experience === selectedJobFilters.experience;
    
    const matchesLocation = selectedJobFilters.location === 'all' ||
      (selectedJobFilters.location === 'remote' && job.location.toLowerCase().includes('remote')) ||
      (selectedJobFilters.location === 'onsite' && !job.location.toLowerCase().includes('remote')) ||
      (selectedJobFilters.location === 'hybrid' && job.location.toLowerCase().includes('hybrid'));
    
    return matchesSearch && matchesType && matchesExperience && matchesLocation;
  });

  // Job Saved Popup Component
  const JobSavedPopup = () => (
    <AnimatePresence>
      {showJobSavedPopup && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-4 min-w-80">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white leading-5">
                Job saved successfully in Applications!
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowJobSavedPopup(false);
                setActiveSection('applications');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm leading-4"
            >
              View Saved
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderJobsSection = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 leading-6">
          <Briefcase className="text-blue-500" size={24} />
          Jobs & Internships
        </h2>
        <motion.button
          whileHover={{ 
            scale: 1.08, 
            x: 8,
            boxShadow: "0 15px 35px rgba(59, 130, 246, 0.4)"
          }}
          whileTap={{ scale: 0.92 }}
          onClick={handleViewAllJobs}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 group relative overflow-hidden"
        >
          <motion.span
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="leading-5 relative z-10"
          >
            View All Jobs
          </motion.span>
          
          <motion.div
            whileHover={{ 
              x: 6,
              rotate: -15
            }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="relative z-10"
          >
            <ArrowRight size={16} />
          </motion.div>
        </motion.button>
      </div>

      {/* Quick Search */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={jobSearchQuery}
              onChange={(e) => setJobSearchQuery(e.target.value)}
              placeholder="Search jobs by keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-5"
            />
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {(jobSearchQuery ? filteredJobs : dashboardData.recommendedJobs).slice(0, 3).map((job, index) => renderJobCard(job, index, true))}
      </div>

      {jobSearchQuery && filteredJobs.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 leading-5">
          No jobs found matching your search criteria
        </div>
      )}
    </motion.div>
  );

const renderNextAction = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
  >
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 leading-6">
      <Target className="text-orange-500" size={24} />
      Recommended Action
    </h2>
    
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-r ${dashboardData.nextAction.color} rounded-lg p-6 text-white cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <dashboardData.nextAction.icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-6">{dashboardData.nextAction.title}</h3>
            <p className="text-white text-opacity-90 leading-5">{dashboardData.nextAction.description}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveSection('quizzes')}
          className="bg-white text-gray-800 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 leading-5"
        >
          {dashboardData.nextAction.action}
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

  const renderSkillProgress = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
    >
      <h2 className="text-xl font-bold mb-6 leading-6">Skill & Learning Highlights</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium leading-5">Skill Development</span>
            <span className="text-sm text-gray-500 leading-4">{dashboardData.skillProgress.development}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dashboardData.skillProgress.development}%` }}
              transition={{ delay: 0.5, duration: 1 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
            >
              <span className="text-white text-xs font-medium leading-3">Keep going! You're 70% done</span>
            </motion.div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium leading-5">Learning Path Completion</span>
            <span className="text-sm text-gray-500 leading-4">{dashboardData.skillProgress.learningPath}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dashboardData.skillProgress.learningPath}%` }}
              transition={{ delay: 0.7, duration: 1 }}
              className="bg-gradient-to-r from-green-500 to-teal-500 h-6 rounded-full flex items-center justify-end pr-2"
            >
              <span className="text-white text-xs font-medium leading-3">Almost halfway there!</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // HR Dashboard Functions
  const renderHRDashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent leading-9">
          Admin Dashboard
        </h2>
        <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium leading-4">
          Admin Mode Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Candidates', value: '247', change: '+23 this week', icon: Users, color: 'from-blue-500 to-blue-600' },
          { title: 'Active Jobs', value: '12', change: '3 new postings', icon: Briefcase, color: 'from-green-500 to-green-600' },
          { title: 'Interviews Today', value: '5', change: '2 scheduled', icon: Calendar, color: 'from-purple-500 to-purple-600' },
          { title: 'Hired This Month', value: '8', change: '+2 from last month', icon: Award, color: 'from-orange-500 to-orange-600' }
        ].map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden cursor-pointer"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-full -mr-10 -mt-10 opacity-20`}></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-4">{stat.title}</p>
                <p className="text-3xl font-bold mt-1 leading-8">{stat.value}</p>
                <p className="text-green-500 text-sm mt-1 leading-4">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Profile Strength Section */}
      {renderProfileStrength()}

      {/* Jobs & Internships Section */}
      {renderJobsSection()}

      {/* Next Recommended Action */}
      {renderNextAction()}

      {/* Skill & Learning Progress */}
      {renderSkillProgress()}

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-bold mb-4 leading-6">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { action: 'Applied to Frontend Developer at Google', time: '2 hours ago', icon: Send, color: 'text-blue-500' },
            { action: 'Completed JavaScript Assessment', time: '1 day ago', icon: CheckCircle, color: 'text-green-500' },
            { action: 'Updated resume', time: '2 days ago', icon: FileText, color: 'text-purple-500' },
            { action: 'Earned Code Warrior badge', time: '3 days ago', icon: Award, color: 'text-yellow-500' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <activity.icon size={16} className={activity.color} />
              <span className="flex-1 text-sm leading-4">{activity.action}</span>
              <span className="text-xs text-gray-500 leading-3">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

const renderMainContent = () => {
  const getPageTitle = () => {
    const mainItem = sidebarItems.find(item => item.id === activeSection);
    if (mainItem) return mainItem.label;
    
    for (const item of sidebarItems) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.id === activeSection);
        if (subItem) return subItem.label;
      }
    }
    return 'Section';
  };

  switch (activeSection) {
    // Student sections
    case 'dashboard':
      return userRole === 'student' ? renderDashboard() : renderHRDashboard();
    case 'profile':
      return <ProfileComponent />;
    case 'resume-analyzer':
      return <ResumeAnalyzer />;
    case 'applications':
      return <JobApplicationsDashboard />;
    case 'hackathons':
      return <HackathonsSection />;
    case 'brain-games':
      return <StudentBrainGames />;
    case 'dsa-practice':
      return <DSAPracticeSection />;
    case 'quizzes':
      return <QuizzesTestsSection />;
    case 'post-job':
      return <JobPostingWorkspace />;
    case 'assessment_system':
      return <AssessmentApp />;
    case 'subscription':
      return <ZeroShotHirePricing />;
    case 'Privacy & Security':
      return <TermsPrivacyPage />;
    case 'Help & Support':    
      return <HelpSupportPage />;
    
    // HR sections
    case 'hr-dashboard':
      return <EnhancedHRDashboard />;
    case 'job-postings':
      return <AdvancedJobManagement />;
    case 'candidates':
      return <CandidatesPage />;
    case 'analytics':
      return <HiringAnalytics />;
    case 'interviews':
      return <InterviewDashboard />;
    case 'ats':
      return <ATSIntegration />;
    case 'assessments':
      return <AssessmentConfig />;
      
    default:
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-4 leading-7">{getPageTitle()}</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-5">This section is under development...</p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <p className="text-blue-700 dark:text-blue-300 text-sm leading-4">
              Coming soon! This feature will be available in the next update.
            </p>
          </motion.div>
        </motion.div>
      );
  }
};

useEffect(() => {
  // Reset to appropriate dashboard when switching roles
  if (userRole === 'student') {
    setActiveSection('dashboard');
  } else {
    setActiveSection('hr-dashboard');
  }
}, [userRole]);

// Existing useEffect stays here
useEffect(() => {
  if (!sidebarOpen) {
    setExpandedSections({});
  }
}, [sidebarOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when full jobs page is open
  useEffect(() => {
    if (showFullJobs) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFullJobs]);

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={isDarkMode ? 'dark' : ''}>
        {renderTopBar()}
        {renderSidebar()}
        
        <motion.main 
          animate={{ marginLeft: sidebarOpen ? 256 : 64 }}
          className="transition-all duration-300 pt-20 p-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </motion.main>

        {/* Job Saved Popup */}
        <JobSavedPopup />

      </div>
    </div>
  );
};

export default UnifiedDashboard;