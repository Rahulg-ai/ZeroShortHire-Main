import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Target, Zap, Brain, Rocket, Star, Lock, CheckCircle,
  Play, Clock, Trophy, TrendingUp, Users, Award, Calendar,
  ChevronRight, ChevronDown, Filter, Search, BarChart3, Activity,
  GitBranch, Network, TreePine, Database, Layers, Map, Compass,
  Flame, Crown, Diamond, Sparkles, Eye, User, ArrowRight,
  Code, Hash, AlignLeft, Grid3X3, Box, Shuffle, Timer
} from 'lucide-react';

const LearningPaths = () => {
  const [selectedPath, setSelectedPath] = useState(null);
  const [activeView, setActiveView] = useState('paths'); // paths, roadmap, progress
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [darkMode, setDarkMode] = useState(true);
  const [userLevel, setUserLevel] = useState('intermediate');
  const [completedTopics, setCompletedTopics] = useState(new Set([1, 2, 5, 8, 12]));

  const learningPaths = [
    {
      id: 1,
      title: "Data Structures Mastery",
      subtitle: "Foundation to Advanced",
      description: "Master all fundamental and advanced data structures with hands-on practice",
      difficulty: "Beginner to Advanced",
      duration: "8-12 weeks",
      students: 45000,
      rating: 4.8,
      progress: 35,
      totalTopics: 24,
      completedTopics: 8,
      icon: Database,
      gradient: "from-blue-500 to-cyan-500",
      category: "Data Structures",
      tags: ["Arrays", "Trees", "Graphs", "Hash Tables"],
      instructor: "Dr. Sarah Chen",
      lastUpdated: "2024-08-10",
      modules: [
        {
          id: 1,
          title: "Arrays & Strings",
          topics: 6,
          completed: 6,
          difficulty: "Beginner",
          estimatedTime: "1-2 weeks",
          description: "Master array operations, string manipulation, and basic algorithms"
        },
        {
          id: 2,
          title: "Linked Lists",
          topics: 4,
          completed: 2,
          difficulty: "Beginner",
          estimatedTime: "1 week",
          description: "Single, double, and circular linked lists with advanced operations"
        },
        {
          id: 3,
          title: "Stacks & Queues",
          topics: 5,
          completed: 0,
          difficulty: "Intermediate",
          estimatedTime: "1-2 weeks",
          description: "LIFO/FIFO principles with real-world applications"
        },
        {
          id: 4,
          title: "Trees & Binary Search Trees",
          topics: 9,
          completed: 0,
          difficulty: "Intermediate",
          estimatedTime: "2-3 weeks",
          description: "Tree traversals, BST operations, and balanced trees"
        }
      ]
    },
    {
      id: 2,
      title: "Algorithm Design Patterns",
      subtitle: "Think Like a Pro",
      description: "Learn algorithmic thinking patterns and problem-solving strategies",
      difficulty: "Intermediate to Advanced",
      duration: "10-14 weeks",
      students: 32000,
      rating: 4.9,
      progress: 15,
      totalTopics: 32,
      completedTopics: 5,
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
      category: "Algorithms",
      tags: ["Dynamic Programming", "Greedy", "Backtracking", "Divide & Conquer"],
      instructor: "Prof. Alex Morgan",
      lastUpdated: "2024-08-12",
      modules: [
        {
          id: 1,
          title: "Two Pointers & Sliding Window",
          topics: 8,
          completed: 5,
          difficulty: "Intermediate",
          estimatedTime: "2 weeks",
          description: "Efficient array and string processing techniques"
        },
        {
          id: 2,
          title: "Dynamic Programming Fundamentals",
          topics: 12,
          completed: 0,
          difficulty: "Advanced",
          estimatedTime: "3-4 weeks",
          description: "Memoization, tabulation, and optimization problems"
        },
        {
          id: 3,
          title: "Graph Algorithms",
          topics: 12,
          completed: 0,
          difficulty: "Advanced",
          estimatedTime: "3-4 weeks",
          description: "DFS, BFS, shortest paths, and topological sorting"
        }
      ]
    },
    {
      id: 3,
      title: "System Design Fundamentals",
      subtitle: "Scale Like Big Tech",
      description: "Design scalable systems using proper data structures and algorithms",
      difficulty: "Advanced",
      duration: "6-8 weeks",
      students: 28000,
      rating: 4.7,
      progress: 0,
      totalTopics: 18,
      completedTopics: 0,
      icon: Network,
      gradient: "from-green-500 to-emerald-500",
      category: "System Design",
      tags: ["Scalability", "Load Balancing", "Caching", "Databases"],
      instructor: "Engineering Team",
      lastUpdated: "2024-08-08",
      modules: [
        {
          id: 1,
          title: "System Design Basics",
          topics: 6,
          completed: 0,
          difficulty: "Intermediate",
          estimatedTime: "2 weeks",
          description: "Scalability, reliability, and availability concepts"
        },
        {
          id: 2,
          title: "Database Design",
          topics: 6,
          completed: 0,
          difficulty: "Advanced",
          estimatedTime: "2-3 weeks",
          description: "SQL vs NoSQL, indexing, and query optimization"
        },
        {
          id: 3,
          title: "Distributed Systems",
          topics: 6,
          completed: 0,
          difficulty: "Expert",
          estimatedTime: "2-3 weeks",
          description: "Consistency, partitioning, and fault tolerance"
        }
      ]
    },
    {
      id: 4,
      title: "Interview Preparation Bootcamp",
      subtitle: "Land Your Dream Job",
      description: "Intensive preparation for technical interviews at top companies",
      difficulty: "All Levels",
      duration: "4-6 weeks",
      students: 67000,
      rating: 4.9,
      progress: 60,
      totalTopics: 20,
      completedTopics: 12,
      icon: Target,
      gradient: "from-red-500 to-pink-500",
      category: "Interview Prep",
      tags: ["FAANG", "Coding Interviews", "Behavioral", "Mock Interviews"],
      instructor: "Industry Experts",
      lastUpdated: "2024-08-13",
      modules: [
        {
          id: 1,
          title: "Common Interview Patterns",
          topics: 8,
          completed: 8,
          difficulty: "Intermediate",
          estimatedTime: "2 weeks",
          description: "Most frequent problem patterns in interviews"
        },
        {
          id: 2,
          title: "Company-Specific Preparation",
          topics: 6,
          completed: 4,
          difficulty: "Advanced",
          estimatedTime: "1-2 weeks",
          description: "Google, Amazon, Microsoft, Facebook interview styles"
        },
        {
          id: 3,
          title: "Mock Interviews & Feedback",
          topics: 6,
          completed: 0,
          difficulty: "All Levels",
          estimatedTime: "1-2 weeks",
          description: "Practice with real interview scenarios"
        }
      ]
    }
  ];

  const skillTree = {
    beginner: [
      { id: 1, name: "Basic Arrays", completed: true, prerequisite: null },
      { id: 2, name: "String Manipulation", completed: true, prerequisite: 1 },
      { id: 3, name: "Basic Loops", completed: true, prerequisite: null },
      { id: 4, name: "Functions", completed: false, prerequisite: 3 },
      { id: 5, name: "Recursion Basics", completed: true, prerequisite: 4 }
    ],
    intermediate: [
      { id: 6, name: "Linked Lists", completed: false, prerequisite: 2 },
      { id: 7, name: "Stacks & Queues", completed: false, prerequisite: 5 },
      { id: 8, name: "Binary Trees", completed: true, prerequisite: 5 },
      { id: 9, name: "Hash Tables", completed: false, prerequisite: 2 },
      { id: 10, name: "Sorting Algorithms", completed: false, prerequisite: 1 }
    ],
    advanced: [
      { id: 11, name: "Dynamic Programming", completed: false, prerequisite: 8 },
      { id: 12, name: "Graph Algorithms", completed: true, prerequisite: 8 },
      { id: 13, name: "Advanced Trees", completed: false, prerequisite: 8 },
      { id: 14, name: "System Design", completed: false, prerequisite: 12 },
      { id: 15, name: "Optimization", completed: false, prerequisite: 11 }
    ]
  };

  const personalizedRecommendations = [
    {
      id: 1,
      title: "Dynamic Programming Deep Dive",
      reason: "Based on your progress in recursion and tree problems",
      difficulty: "Advanced",
      estimatedTime: "3-4 weeks",
      problems: 25,
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      id: 2,
      title: "Graph Theory Mastery",
      reason: "Perfect follow-up to your completed tree algorithms",
      difficulty: "Advanced",
      estimatedTime: "2-3 weeks",
      problems: 18,
      icon: Network,
      gradient: "from-green-500 to-teal-500"
    },
    {
      id: 3,
      title: "String Algorithms Advanced",
      reason: "Strengthen your string manipulation skills",
      difficulty: "Intermediate",
      estimatedTime: "1-2 weeks",
      problems: 12,
      icon: AlignLeft,
      gradient: "from-blue-500 to-indigo-500"
    }
  ];

  const PathCard = ({ path, index }) => {
    const Icon = path.icon;
    
    return (
      <div 
        className={`group relative overflow-hidden rounded-3xl cursor-pointer ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50' 
            : 'bg-white border border-gray-200'
        } shadow-xl hover:shadow-2xl`}
        onClick={() => setSelectedPath(path)}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${path.gradient} opacity-0 group-hover:opacity-10`} />
        
        {/* Header */}
        <div className="p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${path.gradient} shadow-lg`}>
              <Icon size={32} className="text-white" />
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500" size={16} />
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {path.rating}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  {(path.students / 1000).toFixed(0)}k students
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {path.title}
              </h3>
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {path.subtitle}
              </p>
            </div>
            
            <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {path.description}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {path.completedTopics}/{path.totalTopics} topics
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${path.gradient}`}
                style={{ width: `${path.progress}%` }}
              />
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold bg-gradient-to-r ${path.gradient} bg-clip-text text-transparent`}>
                {path.progress}% Complete
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Difficulty
              </div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {path.difficulty}
              </div>
            </div>
            <div>
              <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Duration
              </div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {path.duration}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {path.tags.map((tag, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode 
                    ? 'bg-slate-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <button className={`w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r ${path.gradient} text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}>
            <Play size={20} />
            {path.progress > 0 ? 'Continue Learning' : 'Start Path'}
          </button>
        </div>
      </div>
    );
  };

  const SkillNode = ({ skill, level, isConnected }) => {
    const isUnlocked = skill.prerequisite === null || completedTopics.has(skill.prerequisite);
    const isCompleted = completedTopics.has(skill.id);
    
    return (
      <div className="relative">
        {/* Connection Line */}
        {isConnected && (
          <div className={`absolute -top-8 left-1/2 w-0.5 h-8 ${
            isCompleted ? 'bg-green-400' : isUnlocked ? 'bg-blue-400' : 'bg-gray-400'
          }`} />
        )}
        
        <div 
          className={`w-24 h-24 rounded-2xl flex items-center justify-center cursor-pointer ${
            isCompleted 
              ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-400/25 shadow-xl' 
              : isUnlocked 
                ? 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-blue-400/25 shadow-lg hover:shadow-xl' 
                : 'bg-gradient-to-br from-gray-400 to-slate-500 grayscale'
          }`}
          onClick={() => isUnlocked && !isCompleted && setCompletedTopics(prev => new Set([...prev, skill.id]))}
        >
          {isCompleted ? (
            <CheckCircle size={32} className="text-white" />
          ) : isUnlocked ? (
            <Play size={32} className="text-white" />
          ) : (
            <Lock size={32} className="text-white" />
          )}
        </div>
        
        <div className="mt-3 text-center">
          <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {skill.name}
          </div>
          <div className={`text-xs mt-1 ${
            isCompleted 
              ? 'text-green-400' 
              : isUnlocked 
                ? 'text-blue-400' 
                : darkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6 py-12">
          <div className="flex items-center justify-center gap-4">
            <BookOpen className="w-12 h-12 text-blue-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Learning Paths
            </h1>
          </div>
          
          <p className={`text-xl max-w-3xl mx-auto ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Structured learning journeys to master Data Structures & Algorithms
          </p>

          {/* View Toggle */}
          <div className="flex justify-center gap-2">
            {[
              { id: 'paths', label: 'Learning Paths', icon: BookOpen },
              { id: 'roadmap', label: 'Skill Tree', icon: TreePine },
              { id: 'progress', label: 'My Progress', icon: BarChart3 }
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold ${
                    activeView === view.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl'
                      : darkMode
                        ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Learning Paths View */}
        {activeView === 'paths' && (
          <div className="space-y-12">
            {/* Personalized Recommendations */}
            <div className={`rounded-3xl backdrop-blur-md border p-8 ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-yellow-500" size={28} />
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recommended for You
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personalizedRecommendations.map((rec) => {
                  const Icon = rec.icon;
                  return (
                    <div 
                      key={rec.id}
                      className={`p-6 rounded-2xl border cursor-pointer ${
                        darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${rec.gradient} flex items-center justify-center mb-4`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      
                      <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rec.title}
                      </h3>
                      
                      <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {rec.reason}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Difficulty:</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {rec.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Time:</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {rec.estimatedTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Problems:</span>
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {rec.problems}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All Learning Paths */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {learningPaths.map((path, index) => (
                <PathCard key={path.id} path={path} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Skill Tree View */}
        {activeView === 'roadmap' && (
          <div className={`rounded-3xl backdrop-blur-md border p-8 ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-8 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              DSA Skill Tree
            </h2>
            
            <div className="space-y-16">
              {Object.entries(skillTree).map(([level, skills]) => (
                <div key={level} className="space-y-8">
                  <h3 className={`text-xl font-bold text-center capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {level} Level
                  </h3>
                  
                  <div className="flex justify-center">
                    <div className="grid grid-cols-5 gap-8">
                      {skills.map((skill, index) => (
                        <SkillNode 
                          key={skill.id} 
                          skill={skill} 
                          level={level}
                          isConnected={index > 0}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg" />
                <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Completed
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg" />
                <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Available
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg grayscale" />
                <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Locked
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress View */}
        {activeView === 'progress' && (
          <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Topics Completed', value: completedTopics.size, total: 15, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
                { label: 'Current Streak', value: '12 days', icon: Flame, color: 'from-orange-500 to-red-500' },
                { label: 'Total Study Time', value: '47 hours', icon: Clock, color: 'from-blue-500 to-cyan-500' },
                { label: 'Skill Level', value: 'Intermediate', icon: Trophy, color: 'from-yellow-500 to-orange-500' }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={`p-6 rounded-2xl backdrop-blur-md border ${
                    darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'
                  }`}>
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {typeof stat.value === 'number' && stat.total ? `${stat.value}/${stat.total}` : stat.value}
                    </div>
                    <div className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </div>
                    {stat.total && (
                      <div className={`mt-3 w-full rounded-full h-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                          style={{ width: `${(stat.value / stat.total) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Learning Path Progress */}
            <div className={`rounded-3xl backdrop-blur-md border p-8 ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Learning Path Progress
              </h2>
              
              <div className="space-y-6">
                {learningPaths.filter(path => path.progress > 0).map((path) => {
                  const Icon = path.icon;
                  return (
                    <div key={path.id} className={`p-6 rounded-2xl border ${
                      darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${path.gradient}`}>
                          <Icon size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {path.title}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {path.completedTopics} of {path.totalTopics} topics completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold bg-gradient-to-r ${path.gradient} bg-clip-text text-transparent`}>
                            {path.progress}%
                          </div>
                        </div>
                      </div>
                      
                      <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-3 rounded-full bg-gradient-to-r ${path.gradient}`}
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                      
                      <div className="mt-4 flex justify-between text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Last activity: {path.lastUpdated}
                        </span>
                        <button className={`font-semibold hover:underline bg-gradient-to-r ${path.gradient} bg-clip-text text-transparent`}>
                          Continue Learning →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-3xl backdrop-blur-md border p-8 ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {[
                  { type: 'completed', topic: 'Binary Tree Traversal', time: '2 hours ago', icon: CheckCircle, color: 'text-green-400' },
                  { type: 'started', topic: 'Graph BFS Implementation', time: '5 hours ago', icon: Play, color: 'text-blue-400' },
                  { type: 'completed', topic: 'Hash Table Collision Handling', time: '1 day ago', icon: CheckCircle, color: 'text-green-400' },
                  { type: 'practice', topic: 'Dynamic Programming Problems', time: '2 days ago', icon: Target, color: 'text-purple-400' }
                ].map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    }`}>
                      <Icon size={20} className={activity.color} />
                      <div className="flex-1">
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.type === 'completed' ? 'Completed' : activity.type === 'started' ? 'Started' : 'Practiced'} {activity.topic}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Path Detail Modal */}
        {selectedPath && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className={`rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'
            } shadow-2xl`}>
              {/* Header */}
              <div className={`p-8 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${selectedPath.gradient}`}>
                      <selectedPath.icon size={40} className="text-white" />
                    </div>
                    <div>
                      <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedPath.title}
                      </h2>
                      <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedPath.subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPath(null)}
                    className={`p-3 rounded-xl hover:bg-slate-800 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPath.duration}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(selectedPath.students / 1000).toFixed(0)}k
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Students</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPath.rating}★
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPath.totalTopics}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Topics</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                <div>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Course Modules
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedPath.modules.map((module, index) => (
                      <div 
                        key={module.id}
                        className={`border rounded-2xl overflow-hidden ${
                          darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div 
                          className={`p-6 cursor-pointer hover:bg-opacity-50 ${
                            expandedModules.has(module.id) ? (darkMode ? 'bg-slate-700/50' : 'bg-gray-100') : ''
                          }`}
                          onClick={() => {
                            const newExpanded = new Set(expandedModules);
                            if (newExpanded.has(module.id)) {
                              newExpanded.delete(module.id);
                            } else {
                              newExpanded.add(module.id);
                            }
                            setExpandedModules(newExpanded);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                                module.completed === module.topics 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                  : module.completed > 0
                                    ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                                    : 'bg-gradient-to-r from-gray-400 to-slate-500'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {module.title}
                                </h4>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    {module.completed}/{module.topics} topics
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    module.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                    module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                    module.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {module.difficulty}
                                  </span>
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    {module.estimatedTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {Math.round((module.completed / module.topics) * 100)}%
                                </div>
                                <div className={`w-16 rounded-full h-2 ${darkMode ? 'bg-slate-600' : 'bg-gray-200'}`}>
                                  <div 
                                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                                    style={{ width: `${(module.completed / module.topics) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <ChevronDown 
                                size={24} 
                                className={`${
                                  expandedModules.has(module.id) ? 'rotate-180' : ''
                                } ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {expandedModules.has(module.id) && (
                          <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {module.description}
                            </p>
                            
                            <div className="flex gap-4">
                              <button className={`flex-1 py-3 px-6 rounded-xl font-semibold ${
                                module.completed === module.topics
                                  ? 'bg-green-500 text-white'
                                  : module.completed > 0
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                    : darkMode
                                      ? 'border-2 border-slate-600 text-gray-300 hover:bg-slate-800'
                                      : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}>
                                {module.completed === module.topics ? 'Completed' : module.completed > 0 ? 'Continue' : 'Start Module'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <button className={`flex-1 py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-r ${selectedPath.gradient} text-white shadow-xl hover:shadow-2xl`}>
                    <div className="flex items-center justify-center gap-2">
                      <Play size={20} />
                      {selectedPath.progress > 0 ? 'Continue Learning' : 'Start Path'}
                    </div>
                  </button>
                  <button className={`px-8 py-4 rounded-2xl font-bold text-lg border-2 ${
                    darkMode 
                      ? 'border-slate-600 hover:bg-slate-800 text-gray-300' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}>
                    Save for Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPaths;