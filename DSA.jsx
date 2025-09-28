import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import {
  Code, Trophy, Clock, Star, Target, CheckCircle, XCircle,
  Play, Filter, Search, Plus, Eye, Share2, Bookmark,
  ChevronRight, Zap, Timer, Globe, Medal, Crown,
  BarChart3, Activity, Lightbulb, X,
  Sparkles, Rocket, Brain, Hexagon, TrendingUp, Flame,
  Users, Award, Calendar, Hash, AlignLeft, Database,
  GitBranch, Shuffle, Grid3X3, TreePine, Network,
  Layers, Box, Map, Compass, ArrowLeft, Send,
  RotateCcw, Download, Upload, Settings, ChevronDown,
  Terminal, FileText, Maximize2, Minimize2, Copy,
  ChevronUp, SkipForward, SkipBack, Cpu, Binary,
  Workflow, Repeat
} from 'lucide-react';

// Simple code editor component
const SimpleCodeEditor = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-full resize-none font-mono text-sm leading-relaxed p-4 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-900 text-gray-100 placeholder-gray-500 border-gray-600 focus:outline-none"
      style={{ minHeight: '400px', height: '100%' }}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  );
};

const DSAPracticeSection = () => {
  const [currentView, setCurrentView] = useState('topicSelection');
  const [selectedTopic, setSelectedTopic] = useState('Array');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentProblemId, setCurrentProblemId] = useState(null);
  
  const [userCode, setUserCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiHint, setAiHint] = useState('');
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [problems, setProblems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  
  const [userStats, setUserStats] = useState({
    solved: 142,
    attempted: 267,
    streak: 15,
    rating: 1847
  });

  // Simple code change handler
  const handleCodeChange = (e) => {
    setUserCode(e.target.value);
  };

  const languages = [
    { id: 'javascript', name: 'JavaScript', extension: 'js' },
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'cpp', name: 'C++', extension: 'cpp' },
    { id: 'c', name: 'C', extension: 'c' }
  ];

  const codeTemplates = {
    javascript: `// Solution
function solve() {
    // Your code here
    
}`,
    python: `# Solution
def solve():
    # Your code here
    pass`,
    java: `// Solution
public class Solution {
    public void solve() {
        // Your code here
    }
}`,
    cpp: `// Solution
class Solution {
public:
    void solve() {
        // Your code here
    }
};`,
    c: `// Solution
void solve() {
    // Your code here
}`
  };

  const topicConfigs = {
    'Array': { icon: Grid3X3, color: 'from-green-500 to-emerald-500' },
    'LinkedList': { icon: GitBranch, color: 'from-purple-500 to-pink-500' },
    'Tree Problems': { icon: TreePine, color: 'from-orange-500 to-red-500' },
    'Dynamic Programming': { icon: Database, color: 'from-indigo-500 to-purple-500' },
    'Stack and Queue Problems': { icon: Layers, color: 'from-teal-500 to-cyan-500' },
    'Graph': { icon: Network, color: 'from-blue-500 to-cyan-500' },
    'Greedy': { icon: Target, color: 'from-yellow-500 to-orange-500' },
    'Heap and Priority Queue': { icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
    'Recursion and Backtracking Problems': { icon: Repeat, color: 'from-violet-500 to-purple-500' },
    'Divide and Conquer': { icon: Cpu, color: 'from-slate-500 to-gray-500' }
  };

  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];

  const statusCategories = [
    { key: 'all', name: 'All', count: 0, color: 'blue-500' },
    { key: 'solved', name: 'Solved', count: 0, color: 'green-500' },
    { key: 'attempted', name: 'Attempted', count: 0, color: 'orange-500' },
    { key: 'todo', name: 'Todo', count: 0, color: 'gray-500' }
  ];

  useEffect(() => {
    const loadProblems = async () => {
      setIsLoading(true);
      setLoadingError(null);
      
      const csvFiles = [
        { filename: '/Array.csv', topicName: 'Array' },
        { filename: '/LinkedList.csv', topicName: 'LinkedList' },
        { filename: '/Tree_Problems.csv', topicName: 'Tree Problems' },
        { filename: '/Dynamic_Programming.csv', topicName: 'Dynamic Programming' },
        { filename: '/Stack_and_Queue_Problems.csv', topicName: 'Stack and Queue Problems' },
        { filename: '/Graph.csv', topicName: 'Graph' },
        { filename: '/Greedy.csv', topicName: 'Greedy' },
        { filename: '/Heap_and_Priority Queue.csv', topicName: 'Heap and Priority Queue' },
        { filename: '/Recursion_and_Backtracking Problems.csv', topicName: 'Recursion and Backtracking Problems' },
        { filename: '/Divide_and_Conquer.csv', topicName: 'Divide and Conquer' }
      ];

      const loadedProblems = {};
      let totalProblemsLoaded = 0;

      try {
        for (const { filename, topicName } of csvFiles) {
          try {
            console.log(`Attempting to load: ${filename}`);
            const response = await fetch(filename);
            
            if (!response.ok) {
              console.warn(`Failed to fetch ${filename}: ${response.status}`);
              loadedProblems[topicName] = [];
              continue;
            }
            
            const fileData = await response.text();
            console.log(`Successfully fetched ${filename}, parsing...`);
            
            const parsed = Papa.parse(fileData, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: false,
              delimitersToGuess: [',', ';', '\t'],
              transformHeader: (header) => header.trim()
            });

            if (parsed.errors.length > 0) {
              console.warn(`Parsing errors in ${filename}:`, parsed.errors);
            }

            const processedProblems = parsed.data
              .filter(row => row.title && row.title.trim())
              .map((row, index) => {
                return {
                  id: `${topicName.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`,
                  title: (row.title || '').trim(),
                  description: (row.description || '').trim(),
                  difficulty: (row.difficulty || 'Medium').trim(),
                  category: topicName,
                  topics: row.topics ? row.topics.split(',').map(t => t.trim()) : [topicName],
                  companies: row.companies ? row.companies.split(',').map(c => c.trim()) : ['Various'],
                  timeComplexity: (row.timeComplexity || 'O(n)').trim(),
                  spaceComplexity: (row.spaceComplexity || 'O(1)').trim(),
                  acceptanceRate: parseFloat(row.acceptanceRate) || Math.floor(Math.random() * 60) + 20,
                  submissions: Math.floor(Math.random() * 3000000) + 500000,
                  likes: Math.floor(Math.random() * 20000) + 5000,
                  dislikes: Math.floor(Math.random() * 1000) + 100,
                  status: Math.random() > 0.7 ? 'solved' : (Math.random() > 0.5 ? 'attempted' : 'unsolved'),
                  lastAttempted: Math.random() > 0.5 ? '2024-08-10' : null,
                  bestTime: Math.random() > 0.6 ? `${Math.floor(Math.random() * 25) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : null,
                  attempts: Math.floor(Math.random() * 5),
                  tags: row.topics ? row.topics.split(',').map(t => t.trim()) : [topicName],
                  premium: false,
                  difficulty_color: getDifficultyColor(row.difficulty || 'Medium'),
                  icon: topicConfigs[topicName]?.icon || Code,
                  url: `/problems/${(row.title || 'problem').toLowerCase().replace(/\s+/g, '-')}`,
                  problemStatement: (row.problemStatement || '').trim() || `Solve this ${topicName} problem:\n\n${(row.description || '').trim()}`,
                  hints: row.hints ? row.hints.split('|').map(h => h.trim()).filter(h => h) : [
                    `Think about the optimal approach for ${topicName} problems.`,
                    'Consider the time and space complexity.',
                    'Try to solve it step by step.'
                  ],
                  testCases: [
                    {
                      input: (row.sampleInput || '').trim() || 'Sample input',
                      output: (row.sampleOutput || '').trim() || 'Sample output',
                      explanation: (row.sampleExplanation || '').trim() || 'Sample explanation'
                    }
                  ]
                };
              });

            loadedProblems[topicName] = processedProblems;
            totalProblemsLoaded += processedProblems.length;
            console.log(`✅ Loaded ${processedProblems.length} problems from ${topicName}`);

          } catch (fileError) {
            console.error(`❌ Error loading ${filename}:`, fileError);
            loadedProblems[topicName] = [];
          }
        }

        console.log(`🎉 Total problems loaded: ${totalProblemsLoaded}`);
        console.log('Loaded topics:', Object.keys(loadedProblems));

        setProblems(loadedProblems);
        
        const availableTopics = Object.keys(loadedProblems).filter(topic => 
          loadedProblems[topic] && loadedProblems[topic].length > 0
        );
        
        if (availableTopics.length > 0) {
          setSelectedTopic(availableTopics[0]);
          console.log(`📌 Set initial topic to: ${availableTopics[0]}`);
        } else {
          console.warn('⚠️ No topics with problems found');
          setLoadingError('No problems could be loaded from CSV files. Please check your file format.');
        }
        
      } catch (error) {
        console.error('💥 Error in loadProblems:', error);
        setLoadingError(`Failed to load problem data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadProblems();
  }, []);

  function getDifficultyColor(difficulty) {
    switch(difficulty?.toLowerCase()) {
      case 'easy':
        return 'from-emerald-400 to-green-500';
      case 'medium':
        return 'from-amber-400 to-orange-500';
      case 'hard':
        return 'from-red-400 to-rose-500';
      default:
        return 'from-amber-400 to-orange-500';
    }
  }

  const getAvailableTopics = () => {
    return Object.keys(problems)
      .filter(topic => problems[topic] && problems[topic].length > 0)
      .map(topic => ({
        name: topic,
        key: topic,
        icon: topicConfigs[topic]?.icon || Code,
        color: topicConfigs[topic]?.color || 'from-blue-500 to-cyan-500'
      }));
  };

  const getFilteredProblems = () => {
    let problemList = problems[selectedTopic] || [];
    
    if (selectedDifficulty !== 'all') {
      problemList = problemList.filter(p => p.difficulty === selectedDifficulty);
    }

    if (searchQuery.trim()) {
      problemList = problemList.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return problemList;
  };

  const getAIHint = async () => {
    setIsLoadingHint(true);
    const allProblems = Object.values(problems).flat();
    const problem = allProblems.find(p => p.id === currentProblemId);
    
    setTimeout(() => {
      setAiHint(`For "${problem?.title}": This is a ${problem?.difficulty.toLowerCase()} level problem in ${problem?.category}. Focus on the core data structure concepts and think about optimal time/space complexity. Check the built-in hints for more specific guidance.`);
      setIsLoadingHint(false);
    }, 1500);
  };

  const navigateProblems = (direction) => {
    const filteredProblems = getFilteredProblems();
    const currentIndex = filteredProblems.findIndex(p => p.id === currentProblemId);
    
    if (direction === 'next' && currentIndex < filteredProblems.length - 1) {
      const nextProblem = filteredProblems[currentIndex + 1];
      setCurrentProblemId(nextProblem.id);
      if (!userCode.trim() || Object.values(codeTemplates).some(template => userCode.trim() === template.trim())) {
        setUserCode(codeTemplates[selectedLanguage] || '');
      }
      setTestResults(null);
      setAiHint('');
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevProblem = filteredProblems[currentIndex - 1];
      setCurrentProblemId(prevProblem.id);
      if (!userCode.trim() || Object.values(codeTemplates).some(template => userCode.trim() === template.trim())) {
        setUserCode(codeTemplates[selectedLanguage] || '');
      }
      setTestResults(null);
      setAiHint('');
    }
  };

  const startSolving = (problemId) => {
    setCurrentProblemId(problemId);
    setCurrentView('problem');
    setUserCode(codeTemplates[selectedLanguage] || '');
    setTestResults(null);
    setAiHint('');
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const mockResults = {
        success: Math.random() > 0.3,
        testsPassed: Math.floor(Math.random() * 10) + 1,
        totalTests: 10,
        runtime: Math.floor(Math.random() * 100) + 50 + 'ms',
        memory: Math.floor(Math.random() * 20) + 10 + 'MB',
        message: Math.random() > 0.3 ? 'All test cases passed!' : 'Some test cases failed. Check your logic.',
        failedCases: Math.random() > 0.3 ? [] : [
          { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', actual: '[1,0]' }
        ]
      };
      
      setTestResults(mockResults);
      setIsSubmitting(false);
    }, 2000);
  };

  const resetCode = () => {
    if (userCode.trim() && !Object.values(codeTemplates).some(template => userCode.trim() === template.trim())) {
      if (confirm('Are you sure you want to reset your code? This will delete all your current work.')) {
        setUserCode(codeTemplates[selectedLanguage] || '');
        setTestResults(null);
      }
    } else {
      setUserCode(codeTemplates[selectedLanguage] || '');
      setTestResults(null);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getDifficultyConfig = (difficulty) => {
    switch(difficulty) {
      case 'Easy':
        return { bg: 'from-emerald-400 to-green-500', text: 'text-white', icon: Target };
      case 'Medium':
        return { bg: 'from-amber-400 to-orange-500', text: 'text-white', icon: Zap };
      case 'Hard':
        return { bg: 'from-red-400 to-rose-500', text: 'text-white', icon: Flame };
      default:
        return { bg: 'from-amber-400 to-orange-500', text: 'text-white', icon: Target };
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'solved':
        return { bg: 'from-green-400 to-emerald-500', text: 'text-white', icon: CheckCircle };
      case 'attempted':
        return { bg: 'from-orange-400 to-red-500', text: 'text-white', icon: Clock };
      case 'unsolved':
        return { bg: 'from-gray-400 to-slate-500', text: 'text-white', icon: XCircle };
      default:
        return { bg: 'from-gray-400 to-slate-500', text: 'text-white', icon: Target };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Loading DSA Problems</h2>
            <p className="text-gray-400">Reading data from your CSV files...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Loading Error</h2>
            <p className="text-gray-400">{loadingError}</p>
            <p className="text-sm text-gray-500">
              Make sure your CSV files are in the public folder and follow the correct format:
              title,description,difficulty,topics,companies,timeComplexity,spaceComplexity,acceptanceRate,problemStatement,hints,sampleInput,sampleOutput,sampleExplanation
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold"
          >
            Reload Page
          </motion.button>
        </div>
      </div>
    );
  }

  const TopicSelectionPage = () => {
    const availableTopics = getAvailableTopics();

    return (
      <div className="min-h-screen transition-colors duration-300 bg-gray-900">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-12"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <Code className="w-12 h-12 text-blue-500" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                DSA Practice
              </h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Choose Your Focus Area
              </h2>
              <p className="text-xl max-w-3xl mx-auto text-gray-300">
                Select a topic to start practicing data structures and algorithms
              </p>
            </div>


          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white text-center">Choose Your Topic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTopics.map((topic, index) => {
                const IconComponent = topic.icon;
                
                return (
                  <motion.div
                    key={topic.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    onClick={() => {
                      setSelectedTopic(topic.key);
                      setCurrentView('problemsList');
                    }}
                    className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 border bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-xl p-8"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-10`}></div>
                    
                    <div className="relative z-10 text-center space-y-6">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${topic.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent size={32} className="text-white" />
                      </div>
                      
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">
                          {topic.name}
                        </h4>
                        <p className="text-gray-400">
                          Practice problems available
                        </p>
                      </div>
                      
                      <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${topic.color} text-white font-bold text-lg transition-all duration-300 group-hover:shadow-lg group-hover:scale-105`}>
                        Start Practicing
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {availableTopics.length === 0 && (
              <div className="text-center py-20">
                <Code className="mx-auto mb-6 text-gray-600" size={80} />
                <h3 className="text-2xl font-bold mb-4 text-gray-400">
                  No topics loaded
                </h3>
                <p className="text-lg text-gray-500">
                  Please check if your CSV files are properly placed in the public folder.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  };

  const ProblemCard = ({ problem, index }) => {
    const difficultyConfig = getDifficultyConfig(problem.difficulty);
    const statusConfig = getStatusConfig(problem.status);
    const StatusIcon = statusConfig.icon;
    const ProblemIcon = problem.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -2 }}
        className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 border bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg"
      >
        <div className="absolute top-4 right-4 z-10">
          <div className={`p-2 rounded-full bg-gradient-to-r ${statusConfig.bg}`}>
            <StatusIcon size={16} className="text-white" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <ProblemIcon size={20} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${difficultyConfig.bg} ${difficultyConfig.text}`}>
                  {problem.difficulty}
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">
              {problem.title}
            </h3>
            <p className="text-sm leading-relaxed line-clamp-2 text-gray-300">
              {problem.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-green-400 text-lg font-bold">
                {problem.acceptanceRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                Accepted
              </div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 text-lg font-bold">
                {(problem.submissions / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-400">
                Submissions
              </div>
            </div>
          </div>

          {problem.attempts > 0 && (
            <div className="p-3 rounded-xl border bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
              <div className="flex justify-between text-sm">
                <span className="text-blue-400">Attempts: {problem.attempts}</span>
                {problem.bestTime && (
                  <span className="text-green-400 font-bold">Best: {problem.bestTime}</span>
                )}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startSolving(problem.id)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Play size={16} />
            Solve
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const ProblemsListPage = () => {
    const filteredProblems = getFilteredProblems();
    const availableTopics = getAvailableTopics();
    const currentTopic = availableTopics.find(t => t.key === selectedTopic);

    return (
      <div className="min-h-screen transition-colors duration-300 bg-gray-900">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView('topicSelection')}
                  className="p-2 rounded-xl transition-colors duration-200 shadow-md bg-gray-800 text-gray-200 hover:bg-gray-700"
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${currentTopic?.color}`}>
                    <currentTopic.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {currentTopic?.name} Problems
                    </h1>
                    <p className="text-gray-400">
                      {selectedDifficulty === 'all' ? 'All difficulties' : selectedDifficulty} • {filteredProblems.length} problems
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-64">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {availableTopics.map((topic) => (
                    <option key={topic.key} value={topic.key}>
                      {topic.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'all' ? 'All Difficulties' : difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProblems.map((problem, index) => (
              <ProblemCard key={problem.id} problem={problem} index={index} />
            ))}
          </motion.div>

          {filteredProblems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Code className="mx-auto mb-6 text-gray-600" size={80} />
              <h3 className="text-2xl font-bold mb-4 text-gray-400">
                No problems found
              </h3>
              <p className="text-lg text-gray-500 mb-6">
                No {selectedDifficulty === 'all' ? '' : selectedDifficulty.toLowerCase()} problems available for {currentTopic?.name}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const ProblemSolvingInterface = () => {
    const allProblems = Object.values(problems).flat();
    const problem = allProblems.find(p => p.id === currentProblemId);
    const filteredProblems = getFilteredProblems();
    const currentIndex = filteredProblems.findIndex(p => p.id === currentProblemId);
    
    if (!problem) return null;

    const difficultyConfig = getDifficultyConfig(problem.difficulty);

    return (
      <div className="min-h-screen transition-colors duration-300 bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('problemsList')}
                className="p-2 rounded-xl transition-colors duration-200 shadow-md bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                <ArrowLeft size={20} />
              </motion.button>
              <div>
                <div className="flex items-center gap-3">
                  <problem.icon size={24} className="text-blue-400" />
                  <h1 className="text-2xl font-bold text-white">
                    {problem.title}
                  </h1>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${difficultyConfig.bg} text-white`}>
                    {problem.difficulty}
                  </div>
                </div>
                <p className="text-sm mt-1 text-gray-400">
                  {problem.category} • {problem.acceptanceRate.toFixed(1)}% Acceptance Rate
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateProblems('prev')}
                disabled={currentIndex <= 0}
                className={`p-2 rounded-lg transition-colors duration-200 shadow-md ${
                  currentIndex <= 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <SkipBack size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateProblems('next')}
                disabled={currentIndex >= filteredProblems.length - 1}
                className={`p-2 rounded-lg transition-colors duration-200 shadow-md ${
                  currentIndex >= filteredProblems.length - 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
              >
                <SkipForward size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg transition-colors duration-200 shadow-md bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </motion.button>
            </div>
          </motion.div>

          <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
            {!isFullscreen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border p-6 h-[calc(100vh-200px)] overflow-y-auto bg-gray-800 border-gray-700"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">
                      Problem Statement
                    </h2>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        {problem.problemStatement}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3 text-white">
                      Test Cases
                    </h3>
                    <div className="space-y-3">
                      {problem.testCases?.map((testCase, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-gray-700 border-gray-600">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-semibold text-gray-200">Input: </span>
                              <code className="text-sm font-mono text-blue-400">{testCase.input}</code>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-200">Output: </span>
                              <code className="text-sm font-mono text-green-400">{testCase.output}</code>
                            </div>
                            {testCase.explanation && (
                              <div>
                                <span className="text-sm font-semibold text-gray-200">Explanation: </span>
                                <span className="text-sm text-gray-300">{testCase.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Brain size={20} className="text-purple-500" />
                        AI Hint
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={getAIHint}
                        disabled={isLoadingHint}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium disabled:opacity-50"
                      >
                        {isLoadingHint ? 'Getting Hint...' : 'Get AI Hint'}
                      </motion.button>
                    </div>
                    
                    {isLoadingHint && (
                      <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-900/20">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                          <span className="text-purple-300">AI is analyzing the problem...</span>
                        </div>
                      </div>
                    )}

                    {aiHint && !isLoadingHint && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border border-purple-500/30 bg-purple-900/20"
                      >
                        <div className="text-sm text-purple-100 leading-relaxed">
                          <span className="font-semibold text-purple-300">AI Solution:</span>
                          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs bg-gray-800/50 p-3 rounded border border-purple-500/20 overflow-x-auto">
                            {aiHint}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-lg font-bold mb-3 text-white"
                    >
                      <Lightbulb size={20} className="text-yellow-500" />
                      Built-in Hints
                      <ChevronDown size={16} className={`transform transition-transform ${showHints ? 'rotate-180' : ''}`} />
                    </motion.button>
                    
                    <AnimatePresence>
                      {showHints && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          {problem.hints?.map((hint, index) => (
                            <div key={index} className="p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-900/20">
                              <p className="text-sm text-gray-200">
                                <span className="font-semibold">Hint {index + 1}:</span> {hint}
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3 text-white">
                      Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.topics.map((topic, index) => (
                        <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3 text-white">
                      Companies
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {problem.companies.map((company, index) => (
                        <div key={index} className="p-2 rounded-lg text-center font-medium text-sm bg-gray-700 text-gray-200">
                          {company}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border h-[calc(100vh-200px)] flex flex-col bg-gray-800 border-gray-700"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Terminal size={20} className="text-blue-400" />
                    <span className="font-bold text-white">Code Editor</span>
                  </div>
                  
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setSelectedLanguage(newLang);
                      if (!userCode.trim() || Object.values(codeTemplates).some(template => userCode.trim() === template.trim())) {
                        setUserCode(codeTemplates[newLang] || '');
                      }
                    }}
                    className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 border bg-gray-700 border-gray-600 text-gray-200"
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetCode}
                    className="p-2 rounded-lg transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-gray-300"
                    title="Reset code"
                  >
                    <RotateCcw size={16} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyCode}
                    className="p-2 rounded-lg transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-gray-300"
                    title="Copy code"
                  >
                    <Copy size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 p-4 h-full">
                <SimpleCodeEditor
                  value={userCode}
                  onChange={handleCodeChange}
                  placeholder="Write your solution here..."
                />
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitCode}
                    disabled={isSubmitting || !userCode.trim()}
                    className={`flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-bold text-base hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      (isSubmitting || !userCode.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Solution
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-xl font-bold text-base transition-colors duration-200 border-2 border-gray-600 hover:bg-gray-700 text-gray-200"
                  >
                    Run Tests
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {testResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-6 rounded-xl border p-6 ${
                  testResults.success
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-red-900/20 border-red-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {testResults.success ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <XCircle size={24} className="text-red-500" />
                    )}
                    <div>
                      <h3 className={`text-lg font-bold ${
                        testResults.success
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {testResults.success ? 'Accepted!' : 'Wrong Answer'}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {testResults.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-white">
                        {testResults.testsPassed}/{testResults.totalTests}
                      </div>
                      <div className="text-xs text-gray-400">
                        Test Cases
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-400">
                        {testResults.runtime}
                      </div>
                      <div className="text-xs text-gray-400">
                        Runtime
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-400">
                        {testResults.memory}
                      </div>
                      <div className="text-xs text-gray-400">
                        Memory
                      </div>
                    </div>
                  </div>
                </div>

                {testResults.failedCases && testResults.failedCases.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold mb-2 text-white">
                      Failed Test Cases:
                    </h4>
                    <div className="space-y-2">
                      {testResults.failedCases.map((failedCase, index) => (
                        <div key={index} className="p-3 rounded-lg border bg-gray-800 border-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="font-semibold">Input: </span>
                              <code className="text-blue-400">{failedCase.input}</code>
                            </div>
                            <div>
                              <span className="font-semibold">Expected: </span>
                              <code className="text-green-400">{failedCase.expected}</code>
                            </div>
                            <div>
                              <span className="font-semibold">Your Output: </span>
                              <code className="text-red-400">{failedCase.actual}</code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentView === 'topicSelection' && <TopicSelectionPage />}
      {currentView === 'problemsList' && <ProblemsListPage />}
      {currentView === 'problem' && <ProblemSolvingInterface />}
    </div>
  );
};

export default DSAPracticeSection;