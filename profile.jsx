import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Upload, Code, Brain, 
  CheckCircle, X, Plus, Edit3, Camera, FileText,
  Target, Users, BookOpen, ChevronDown, Trophy,
  GraduationCap, Zap, Award, MapPin, Briefcase,
  Rocket, Building, ClipboardList, BarChart3, Star,
  ArrowLeft, ArrowRight, Save, Eye, Menu, Loader, Search
} from 'lucide-react';

// Firebase auth + service API
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApi from './services/firebaseApi';

// College Service
const collegeService = {
  fallbackColleges: [
    "Other",
    "Institute of Engineering & Management (IEM)",
    "Heritage Institute of Technology",
    "Haldia Institute of Technology (HIT)",
    "JIS College of Engineering",
    "Narula Institute of Technology",
    "Netaji Subhash Engineering College (NSEC)",
    "BP Poddar Institute of Management & Technology (BPPIMT)",
    "Supreme Knowledge Foundation Group of Institutions (SKF)",
    "St. Thomas’ College of Engineering & Technology (STCET)",
    "Techno India University"
  ],

  searchColleges(colleges, searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
      return colleges;
    }

    const term = searchTerm.toLowerCase().trim();
    
    return colleges.filter(college => {
      const collegeLower = college.toLowerCase();
      return collegeLower.includes(term);
    }).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      if (aLower.startsWith(term) && !bLower.startsWith(term)) return -1;
      if (!aLower.startsWith(term) && bLower.startsWith(term)) return 1;
      
      return a.localeCompare(b);
    });
  }
};

const StudentApp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentView, setCurrentView] = useState('builder');
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const [showFileSizeError, setShowFileSizeError] = useState(false);
  const [tempSkill, setTempSkill] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef(null);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // College related state
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: 'student@example.com',
    college: '',
    customCollege: '',
    yearOfStudy: '',
    course: '',
    customCourse: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    resume: null,
    resumeFileName: '',
    technicalSkills: [],
    softSkills: [],
    customSkills: [],
    avatarType: 'dicebear',
    avatarSeed: 'Jude',
    uploadedAvatar: null,
    aboutMe: ''
  });

  const courses = [
    'B.Tech Computer Science', 'B.Tech AI/ML', 'B.Tech IT', 'B.Tech Electronics',
    'MCA', 'BCA', 'B.Sc Computer Science', 'M.Tech', 'MBA Tech', 'Other'
  ];

  const technicalSkillsList = [
    'C Programming', 'C++', 'Java', 'Python', 'JavaScript', 'React',
    'Node.js', 'Data Structures & Algorithms', 'Web Development',
    'Machine Learning', 'AI', 'Cybersecurity', 'Mobile Development',
    'Database Management', 'Cloud Computing', 'DevOps'
  ];

  const softSkillsList = [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
    'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity',
    'Public Speaking', 'Project Management', 'Analytical Thinking',
    'Emotional Intelligence', 'Decision Making', 'Conflict Resolution'
  ];

  const avatarOptions = [
    { seed: 'Jude', label: 'Jude' },
    { seed: 'Midnight', label: 'Midnight' },
    { seed: 'Avery', label: 'Avery' },
    { seed: 'Aneka', label: 'Aneka' },
    { seed: 'Maria', label: 'Maria' },
    { seed: 'Princess', label: 'Princess' },
    { seed: 'Trouble', label: 'Trouble' },
    { seed: 'Sarah', label: 'Sarah' },
    { seed: 'Mason', label: 'Mason' },
    { seed: 'Luna', label: 'Luna' }
  ];

  // Coming Soon Features
  const comingSoonFeatures = [
    {
      icon: Users,
      title: "HR Dashboard",
      description: "Connect with HRs directly and get Jobs/Internship opportunities with personalized matching.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Briefcase,
      title: "Job/Internship Opportunities",
      description: "Access curated internship and job listings based on your skills and academic background.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: ClipboardList,
      title: "Apply to Offer Letters",
      description: "Submit applications and track your progress from application to offer letter seamlessly.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "ATS Resume Scoring",
      description: "Get your resume scored and optimized for Applicant Tracking Systems and recruiters.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Star,
      title: "Projects & Achievements",
      description: "Showcase your work, certifications, and achievements to stand out to potential employers.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Target,
      title: "Skill Assessment Tests",
      description: "Take industry-standard assessments to validate your skills and improve your profile score.",
      color: "from-red-500 to-pink-500"
    }
  ];

  // Load colleges on component mount
  useEffect(() => {
    setLoadingColleges(true);
    setTimeout(() => {
      setColleges(collegeService.fallbackColleges);
      setLoadingColleges(false);
    }, 500);
  }, []);

  // Check for mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Filter colleges based on search
  useEffect(() => {
    if (colleges.length > 0) {
      const filtered = collegeService.searchColleges(colleges, collegeSearchTerm);
      setFilteredColleges(filtered);
      
      if (collegeSearchTerm.length >= 2 && filtered.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  }, [colleges, collegeSearchTerm]);

  // Handle click outside for college dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-college-autocomplete]')) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load user profile from backend (firebaseApi)
  const loadUserProfile = async () => {
    try {
      const result = await firebaseApi.getProfile();
      if (result && result.success && result.profile) {
        setProfileData(prev => ({
          ...prev,
          ...result.profile
        }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // optionally show toast / notification
    }
  };

  // Authentication effect
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && currentView === 'profile') {
        loadUserProfile();
      }
    });

    return () => unsubscribe();
  }, [currentView]);

  // Helper functions
  const generateDiceBearAvatar = (seed) => {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  const calculateProgress = () => {
    let progress = 0;
    if (profileData.fullName) progress += 25;
    if (profileData.college) progress += 20;
    if (profileData.yearOfStudy) progress += 15;
    if (profileData.course) progress += 15;
    if (profileData.technicalSkills.length > 0 || profileData.softSkills.length > 0 || profileData.customSkills.length > 0) progress += 20;
    if (profileData.aboutMe) progress += 5;
    return Math.min(progress, 100);
  };

  // Event handlers
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const openSkillsEditor = () => {
    setCurrentView('builder');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openResumeUploader = () => {
    setCurrentView('builder');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 500);
  };

  const openAboutMeEditor = () => {
    setCurrentView('builder');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // REPLACED: handleAvatarUpload now uses firebaseApi.uploadAvatar
  const handleAvatarUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG)');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setShowFileSizeError(true);
      setTimeout(() => setShowFileSizeError(false), 3000);
      return;
    }
    
    try {
      const result = await firebaseApi.uploadAvatar(file);
      if (result && result.success) {
        setProfileData(prev => ({ 
          ...prev, 
          avatarType: 'upload',
          uploadedAvatar: result.fileUrl 
        }));
      } else {
        throw new Error(result?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar: ' + (error.message || error));
    }
  };

  // REPLACED: handleResumeUpload to use firebaseApi.uploadResume
  const handleResumeUpload = async (file) => {
    if (!file) return;
    
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    
    setUploadingResume(true);
    
    try {
      const result = await firebaseApi.uploadResume(file);
      if (result && result.success) {
        setProfileData(prev => ({ 
          ...prev, 
          resume: result.fileUrl,
          resumeFileName: result.fileName
        }));
      } else {
        throw new Error(result?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Resume upload failed:', error);
      alert('Failed to upload resume: ' + (error.message || error));
    } finally {
      setUploadingResume(false);
    }
  };

  const toggleTechnicalSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.includes(skill)
        ? prev.technicalSkills.filter(s => s !== skill)
        : [...prev.technicalSkills, skill]
    }));
  };

  const toggleSoftSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      softSkills: prev.softSkills.includes(skill)
        ? prev.softSkills.filter(s => s !== skill)
        : [...prev.softSkills, skill]
    }));
  };

  const addCustomSkill = () => {
    if (tempSkill.trim() && !profileData.customSkills.includes(tempSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        customSkills: [...prev.customSkills, tempSkill.trim()]
      }));
      setTempSkill('');
    }
  };

  const removeCustomSkill = (skill) => {
    setProfileData(prev => ({
      ...prev,
      customSkills: prev.customSkills.filter(s => s !== skill)
    }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return profileData.fullName && profileData.college && profileData.yearOfStudy && profileData.course;
    }
    if (currentStep === 2) {
      return profileData.technicalSkills.length > 0 || profileData.softSkills.length > 0 || profileData.customSkills.length > 0;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // REPLACED: submitProfile now saves via firebaseApi.saveProfile
  const submitProfile = async () => {
    try {
      const result = await firebaseApi.saveProfile(profileData);
      if (result && result.success) {
        setCurrentView('profile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result?.message || 'Save failed');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile: ' + (error.message || error));
    }
  };

  const goToBuilder = () => {
    setCurrentView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Component renders
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 md:mb-12 space-x-4 md:space-x-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-sm md:text-lg transition-all duration-300 ${
            currentStep >= step 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
              : 'bg-gray-700 text-gray-400'
          }`}>
            {currentStep > step ? <CheckCircle size={isMobile ? 18 : 24} /> : step}
          </div>
          {step < 2 && (
            <div className={`w-12 md:w-24 h-2 mx-3 md:mx-6 transition-colors duration-300 ${
              currentStep > step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4 md:mb-6">
          Build Your Student Profile
        </h2>
        <p className="text-lg md:text-xl text-gray-400">Tell us about yourself and your academic journey</p>
      </div>

      <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
        {/* File Size Error Modal */}
        {showFileSizeError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-red-600 text-white p-6 md:p-8 rounded-xl max-w-md mx-4 text-center">
              <h3 className="text-lg md:text-xl font-bold mb-4">File Size Too Large!</h3>
              <p className="mb-6">Please upload an image file smaller than 2MB.</p>
              <button 
                onClick={() => setShowFileSizeError(false)}
                className="bg-white text-red-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Avatar Section */}
          <div className="order-2 lg:order-1">
            <h3 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 flex items-center justify-center gap-3">
              <User className="text-blue-400" size={isMobile ? 24 : 28} />
              Choose Your Avatar
            </h3>
            
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative">
                {profileData.avatarType === 'upload' && profileData.uploadedAvatar ? (
                  <img 
                    src={profileData.uploadedAvatar} 
                    alt="Avatar" 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                  />
                ) : (
                  <img 
                    src={generateDiceBearAvatar(profileData.avatarSeed)} 
                    alt="Avatar" 
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-500 shadow-xl"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 md:gap-6 mb-8 md:mb-12 relative">
              <div className="relative">
                <button
                  onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
                  className="px-6 md:px-8 py-3 md:py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 md:gap-3 text-base md:text-lg shadow-lg"
                >
                  Choose Avatar
                  <ChevronDown size={isMobile ? 18 : 20} className={`transition-transform duration-300 ${showAvatarDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showAvatarDropdown && (
                  <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-20 w-72 md:w-80">
                    <div className="p-4 md:p-6">
                      <div className="grid grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                        {avatarOptions.map(option => (
                          <button
                            key={option.seed}
                            onClick={() => {
                              setProfileData(prev => ({ ...prev, avatarType: 'dicebear', avatarSeed: option.seed }));
                              setShowAvatarDropdown(false);
                            }}
                            className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 transition-all duration-300 ${
                              profileData.avatarSeed === option.seed 
                                ? 'border-blue-500 shadow-lg' 
                                : 'border-gray-600 hover:border-blue-400'
                            }`}
                            title={option.label}
                          >
                            <img 
                              src={generateDiceBearAvatar(option.seed)} 
                              alt={option.label}
                              className="w-full h-full rounded-full"
                            />
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-600 pt-4">
                        <label className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 md:py-3 px-4 md:px-6 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg">
                          <Camera size={isMobile ? 18 : 20} />
                          Upload Photo (Max 2MB)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleAvatarUpload(e.target.files[0]);
                              setShowAvatarDropdown(false);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Basic Info */}
          <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
            <div>
              <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">Full Name *</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all duration-300 text-base md:text-lg"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                className="w-full p-3 md:p-4 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed text-base md:text-lg"
                disabled
              />
              <p className="text-xs md:text-sm text-gray-500 mt-2">Pre-filled from your account</p>
            </div>

            <div>
              <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">
                College/University *
              </label>
              
              <div className="relative" data-college-autocomplete>
                <div className="relative">
                  <input
                    type="text"
                    value={collegeSearchTerm}
                    onChange={(e) => {
                      setCollegeSearchTerm(e.target.value);
                      if (e.target.value === '') {
                        setProfileData(prev => ({ ...prev, college: '' }));
                      }
                      // Check if the typed value matches any college exactly
                      const exactMatch = colleges.find(college => 
                        college.toLowerCase() === e.target.value.toLowerCase()
                      );
                      if (exactMatch) {
                        setProfileData(prev => ({ ...prev, college: exactMatch }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!showSuggestions) {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setShowSuggestions(true);
                          setHighlightedIndex(0);
                        }
                        return;
                      }
                      
                      switch (e.key) {
                        case 'ArrowDown':
                          e.preventDefault();
                          setHighlightedIndex(prev => 
                            prev < Math.min(filteredColleges.length - 1, 9) ? prev + 1 : 0
                          );
                          break;
                        case 'ArrowUp':
                          e.preventDefault();
                          setHighlightedIndex(prev => 
                            prev > 0 ? prev - 1 : Math.min(filteredColleges.length - 1, 9)
                          );
                          break;
                        case 'Enter':
                          e.preventDefault();
                          if (highlightedIndex >= 0 && filteredColleges[highlightedIndex]) {
                            handleInputChange('college', filteredColleges[highlightedIndex]);
                            setCollegeSearchTerm(filteredColleges[highlightedIndex]);
                            setShowSuggestions(false);
                            setHighlightedIndex(-1);
                          }
                          break;
                        case 'Escape':
                          setShowSuggestions(false);
                          setHighlightedIndex(-1);
                          break;
                      }
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                      if (collegeSearchTerm === '') {
                        setHighlightedIndex(-1);
                      }
                    }}
                    onClick={() => {
                      setShowSuggestions(true);
                    }}
                    placeholder="Type to search or click to browse colleges..."
                    className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all duration-300 text-base md:text-lg pr-12"
                  />
                  
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {collegeSearchTerm ? (
                      <button
                        onClick={() => {
                          setCollegeSearchTerm('');
                          setProfileData(prev => ({ ...prev, college: '' }));
                          setShowSuggestions(false);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    ) : (
                      <ChevronDown className="text-gray-400" size={20} />
                    )}
                  </div>
                </div>

                {showSuggestions && colleges.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl mt-1 max-h-64 overflow-y-auto z-50 shadow-2xl">
                    {(collegeSearchTerm.length === 0 ? colleges : filteredColleges).slice(0, 10).map((college, index) => (
                      <button
                        key={college}
                        onClick={() => {
                          handleInputChange('college', college);
                          setCollegeSearchTerm(college);
                          setShowSuggestions(false);
                          setHighlightedIndex(-1);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-white border-b border-gray-700 last:border-b-0 ${
                          index === highlightedIndex ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm md:text-base">{college}</span>
                          {college === 'Other' && (
                            <span className="text-xs text-gray-400 ml-2">Custom</span>
                          )}
                        </div>
                      </button>
                    ))}
                    
                    {collegeSearchTerm.length > 0 && filteredColleges.length === 0 && (
                      <div className="px-4 py-3 text-gray-400 text-center">
                        No colleges found. Select "Other" to add your college.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {profileData.college === 'Other' && (
                <input
                  type="text"
                  value={profileData.customCollege}
                  onChange={(e) => handleInputChange('customCollege', e.target.value)}
                  placeholder="Enter your college name"
                  className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white mt-4 transition-all duration-300 text-base md:text-lg"
                />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">Year of Study *</label>
                <select
                  value={profileData.yearOfStudy}
                  onChange={(e) => handleInputChange('yearOfStudy', e.target.value)}
                  className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all duration-300 text-base md:text-lg"
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Passout">Passout</option>
                </select>
              </div>

              <div>
                <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">Course *</label>
                <select
                  value={profileData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all duration-300 text-base md:text-lg"
                >
                  <option value="">Select course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                {profileData.course === 'Other' && (
                  <input
                    type="text"
                    value={profileData.customCourse}
                    onChange={(e) => handleInputChange('customCourse', e.target.value)}
                    className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white mt-4 transition-all duration-300 text-base md:text-lg"
                    placeholder="Enter your course name"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="mt-8 md:mt-12 bg-gray-700 rounded-xl md:rounded-2xl p-6 md:p-8">
          <h4 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6 flex items-center gap-3">
            <MapPin className="text-green-400" size={isMobile ? 20 : 24} />
            Address Information (Optional)
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div>
              <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">Pincode</label>
              <input
                type="text"
                value={profileData.pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    handleInputChange('pincode', value);
                  }
                }}
                className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition-all duration-300 text-base md:text-lg"
                placeholder="Enter pincode"
                maxLength={6}
              />
            </div>
            
            <div>
              <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">City</label>
              <input
                type="text"
                value={profileData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition-all duration-300 text-base md:text-lg"
                placeholder="Enter city"
              />
            </div>
            
            <div>
              <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">State</label>
              <input
                type="text"
                value={profileData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition-all duration-300 text-base md:text-lg"
                placeholder="Enter state"
              />
            </div>
            
            <div>
              <label className="block text-base md:text-lg font-medium text-gray-300 mb-2 md:mb-3">Area/Locality</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white transition-all duration-300 text-base md:text-lg"
                placeholder="Enter area"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 md:mb-6">
          Skills & Resume
        </h2>
        <p className="text-lg md:text-xl text-gray-400">Show off your skills and optionally upload your resume</p>
      </div>

      <div className="space-y-8 md:space-y-12">
        {/* Technical Skills */}
        <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 md:mb-8 flex items-center gap-3">
            <Code className="text-blue-400" size={isMobile ? 28 : 32} />
            Technical Skills *
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {technicalSkillsList.map(skill => (
              <button
                key={skill}
                onClick={() => toggleTechnicalSkill(skill)}
                className={`p-3 md:p-4 rounded-xl text-sm md:text-base font-medium transition-all duration-300 text-center break-words ${
                  profileData.technicalSkills.includes(skill)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {profileData.technicalSkills.includes(skill) && (
                  <CheckCircle size={isMobile ? 16 : 18} className="inline mr-2" />
                )}
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 md:mb-8 flex items-center gap-3">
            <Users className="text-green-400" size={isMobile ? 28 : 32} />
            Soft Skills
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {softSkillsList.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSoftSkill(skill)}
                className={`p-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 text-center break-words ${
                  profileData.softSkills.includes(skill)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {profileData.softSkills.includes(skill) && (
                  <CheckCircle size={12} className="inline mr-1" />
                )}
                <span className="text-xs md:text-sm">{skill}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Skills */}
        <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 md:mb-8 flex items-center gap-3">
            <Plus className="text-purple-400" size={isMobile ? 28 : 32} />
            Add Custom Skills
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              placeholder="Enter custom skill"
              className="flex-1 p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white transition-all duration-300 text-base md:text-lg"
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
            />
            <button
              onClick={addCustomSkill}
              disabled={!tempSkill.trim()}
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg shadow-lg"
            >
              Add
            </button>
          </div>

          {profileData.customSkills.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {profileData.customSkills.map(skill => (
                <span
                  key={skill}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 md:px-4 py-2 rounded-full text-sm md:text-base flex items-center gap-2 shadow-lg"
                >
                  {skill}
                  <button
                    onClick={() => removeCustomSkill(skill)}
                    className="hover:text-red-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resume Upload and About Me in Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Resume Upload */}
          <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 md:mb-8 flex items-center gap-3">
              <FileText className="text-blue-400" size={isMobile ? 28 : 32} />
              Resume Upload (Optional)
            </h3>
            
            {!profileData.resume ? (
              <div 
                className="border-2 border-dashed border-gray-600 rounded-xl p-8 md:p-12 text-center hover:border-blue-500 transition-all duration-300 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="mb-4 md:mb-6">
                  {uploadingResume ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-all duration-300">
                      <Upload className="text-blue-400" size={isMobile ? 24 : 32} />
                    </div>
                  )}
                </div>
                
                <h4 className="text-xl md:text-2xl font-semibold text-white mb-2 md:mb-4">
                  {uploadingResume ? 'Uploading Resume...' : 'Upload Your Resume'}
                </h4>
                <p className="text-gray-400 text-base md:text-lg">
                  PDF, DOC, DOCX • Max 5MB
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleResumeUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <FileText className="text-green-400 flex-shrink-0" size={isMobile ? 24 : 32} />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-green-300 text-lg md:text-xl truncate">{profileData.resumeFileName}</h4>
                      <p className="text-gray-400 text-sm md:text-base">Resume uploaded successfully!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileData(prev => ({ ...prev, resume: null, resumeFileName: '' }))}
                    className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 ml-4"
                    title="Remove resume"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* About Me */}
          <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 md:mb-8 flex items-center gap-3">
              <Edit3 className="text-green-400" size={isMobile ? 28 : 32} />
              About Me (Optional)
            </h3>
            
            <textarea
              value={profileData.aboutMe}
              onChange={(e) => handleInputChange('aboutMe', e.target.value)}
              placeholder="Tell us about yourself, your interests, career goals, or any projects you're working on..."
              className="w-full p-3 md:p-4 bg-gray-900 border border-gray-600 rounded-xl focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white resize-none transition-all duration-300 text-base md:text-lg"
              rows={isMobile ? 6 : 8}
              maxLength={500}
            />
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-gray-500 text-sm md:text-base">
                This helps recruiters understand you better
              </p>
              <span className="text-gray-500 text-sm md:text-base">
                {profileData.aboutMe.length}/500
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComingSoonSection = () => (
    <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl mb-8 md:mb-12">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 md:mb-6 flex items-center justify-center gap-4">
          <Rocket className="text-orange-500" size={isMobile ? 36 : 48} />
          Exciting Features Coming Soon!
        </h2>
        <p className="text-lg md:text-xl text-gray-400">Stay tuned! Your profile will unlock new opportunities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {comingSoonFeatures.map((feature, index) => (
          <div 
            key={index}
            className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
            title="Coming Soon"
          >
            <div className="bg-gray-700 rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-600 group-hover:border-gray-500 transition-all duration-300 h-full shadow-xl">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-r ${feature.color} p-2 md:p-3 mb-4 md:mb-6 group-hover:shadow-lg transition-all duration-300`}>
                <feature.icon className="text-white w-full h-full" />
              </div>
              
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 group-hover:text-gray-200 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 text-sm md:text-base leading-relaxed group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
            
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full shadow-lg">
              Soon
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8 md:mt-12">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 md:p-6 max-w-2xl mx-auto">
          <p className="text-blue-300 font-medium text-base md:text-lg">
            Complete your profile now to be first in line for these amazing features!
          </p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              ZeroShotHire Student Dashboard
            </h1>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <button 
                onClick={openSkillsEditor}
                className="bg-green-500 hover:bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm md:text-lg shadow-lg">
                <Plus size={16} />
                Add Skills
              </button>
              <button 
                onClick={openResumeUploader}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm md:text-lg shadow-lg">
                <FileText size={16} />
                Update Resume
              </button>
              <button
                onClick={goToBuilder}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-sm md:text-lg shadow-lg"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 mb-8 md:mb-12 border border-gray-700 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 md:gap-8">
            <div className="flex-shrink-0">
              {profileData.avatarType === 'upload' && profileData.uploadedAvatar ? (
                <img 
                  src={profileData.uploadedAvatar} 
                  alt="Profile" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                />
              ) : (
                <img 
                  src={generateDiceBearAvatar(profileData.avatarSeed)} 
                  alt="Profile" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-500 shadow-xl"
                />
              )}
            </div>
            
            <div className="flex-grow text-center lg:text-left">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3">{profileData.fullName || 'Student Name'}</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-1 md:mb-2">{profileData.course === 'Other' ? profileData.customCourse : profileData.course}</p>
              <p className="text-base md:text-lg text-gray-400 mb-2 md:mb-3">{profileData.college === 'Other' ? profileData.customCollege : profileData.college}</p>
              {profileData.city && profileData.state && (
                <p className="text-gray-500 mb-4 md:mb-6">{profileData.city}, {profileData.state}</p>
              )}
              
              <div className="max-w-lg mx-auto lg:mx-0">
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <span className="text-base md:text-lg text-gray-400">Profile Completion</span>
                  <span className="text-base md:text-lg font-bold text-white">{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 md:h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 md:h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 md:space-y-12">
          <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-10 flex items-center gap-3">
              <Code className="text-blue-400" size={isMobile ? 28 : 32} />
              Skills Portfolio
            </h2>
            
            {profileData.technicalSkills.length > 0 && (
              <div className="mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Technical Skills</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {profileData.technicalSkills.map(skill => (
                    <span key={skill} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl px-3 md:px-4 py-2 md:py-3 text-blue-300 font-medium text-sm md:text-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileData.softSkills.length > 0 && (
              <div className="mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Soft Skills</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {profileData.softSkills.map(skill => (
                    <span key={skill} className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl px-3 md:px-4 py-2 md:py-3 text-green-300 font-medium text-sm md:text-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileData.customSkills.length > 0 && (
              <div className="mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Custom Skills</h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {profileData.customSkills.map(skill => (
                    <span key={skill} className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl px-3 md:px-4 py-2 md:py-3 text-orange-300 font-medium text-sm md:text-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileData.technicalSkills.length === 0 && profileData.softSkills.length === 0 && profileData.customSkills.length === 0 && (
              <div className="text-center py-12 md:py-16 text-gray-500">
                <Code className="mx-auto mb-4 md:mb-6 text-gray-600" size={isMobile ? 48 : 64} />
                <p className="text-lg md:text-xl">No skills added yet. Click "Add Skills" to get started!</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
                <FileText className="text-green-400" size={isMobile ? 28 : 32} />
                Resume
              </h2>
              
              {profileData.resume ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 md:p-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <FileText className="text-green-400 flex-shrink-0" size={20} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-green-300 text-lg md:text-xl truncate">{profileData.resumeFileName}</h3>
                      <p className="text-gray-400 text-sm md:text-base">Resume uploaded and ready to go!</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 md:py-16 text-gray-500">
                  <FileText className="mx-auto mb-4 md:mb-6 text-gray-600" size={isMobile ? 48 : 64} />
                  <p className="text-lg md:text-xl mb-4 md:mb-6">No resume uploaded yet</p>
                  <button 
                    onClick={openResumeUploader}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl transition-all duration-300 text-base md:text-lg shadow-lg">
                    Upload Resume
                  </button>
                </div>
              )}
            </div>

            {profileData.aboutMe ? (
              <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
                  <User className="text-green-400" size={isMobile ? 28 : 32} />
                  About Me
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4 md:mb-6 text-base md:text-lg">{profileData.aboutMe}</p>
                <button 
                  onClick={openAboutMeEditor}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 text-base md:text-lg">
                  <Edit3 size={16} />
                  Edit About Me
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center gap-3">
                  <User className="text-green-400" size={isMobile ? 28 : 32} />
                  About Me
                </h2>
                <div className="text-center py-12 md:py-16 text-gray-500">
                  <p className="text-lg md:text-xl mb-4 md:mb-6">Tell recruiters about yourself, your interests, and career goals</p>
                  <button 
                    onClick={openAboutMeEditor}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl transition-all duration-300 text-base md:text-lg shadow-lg">
                    Add About Me
                  </button>
                </div>
              </div>
            )}
          </div>

          {renderComingSoonSection()}
        </div>
      </div>
    </div>
  );

  if (currentView === 'profile') {
    return renderProfile();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 md:mb-4">
            ZeroShotHire Student
          </h1>
          <p className="text-lg md:text-xl text-gray-400">Build your profile in under 3 minutes and unlock amazing opportunities</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <span className="text-base md:text-lg text-gray-400">Profile Progress</span>
            <span className="text-base md:text-lg font-bold text-white">{Math.round((currentStep / 2) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 md:h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 md:h-4 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            />
          </div>
        </div>

        {renderStepIndicator()}

        <div className="max-w-7xl mx-auto">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <div className="flex flex-col sm:flex-row justify-between items-center mt-12 md:mt-16 gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all text-base md:text-lg flex items-center justify-center gap-2 ${
                currentStep === 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-500 shadow-lg'
              }`}
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            <div className="text-center order-first sm:order-none">
              <p className="text-base md:text-lg text-gray-400">
                Step {currentStep} of 2
              </p>
            </div>

            {currentStep < 2 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 rounded-xl font-semibold transition-all text-base md:text-lg flex items-center justify-center gap-2 ${
                  canProceed()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next Step
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={submitProfile}
                className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg text-base md:text-lg flex items-center justify-center gap-2"
              >
                Complete Profile
                <Eye size={18} />
              </button>
            )}
          </div>
        </div>

        {currentStep === 2 && (
          <div className="text-center mt-8 md:mt-12">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl md:rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <CheckCircle className="text-green-400" size={isMobile ? 32 : 40} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Almost There!</h3>
              <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-10">
                Your profile is {calculateProgress()}% complete. Click "Complete Profile" to view your dashboard!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gray-800 rounded-xl p-4 md:p-6">
                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full mx-auto mb-2 md:mb-3 ${profileData.fullName ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <div className="text-gray-400 text-sm md:text-lg">Basic Info</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 md:p-6">
                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full mx-auto mb-2 md:mb-3 ${(profileData.technicalSkills.length + profileData.softSkills.length + profileData.customSkills.length) > 0 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <div className="text-gray-400 text-sm md:text-lg">Skills</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 md:p-6">
                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full mx-auto mb-2 md:mb-3 ${profileData.resume ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="text-gray-400 text-sm md:text-lg">Resume</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 md:p-6">
                  <div className={`w-4 h-4 md:w-6 md:h-6 rounded-full mx-auto mb-2 md:mb-3 ${profileData.aboutMe ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="text-gray-400 text-sm md:text-lg">About Me</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentApp;
