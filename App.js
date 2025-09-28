// App.js - Updated with PrivateRoute Protection
import React from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./Dashboard";
import Profile from "./profile";
import HackathonsSection from './Competition_Challenge/Hackathons';
import StudentBrainGames from './Competition_Challenge/Brain_games';
import DSAPracticeSection from './Skill_development/DSA';
import QuizzesTestsSection from './Skill_development/Quiz_Test';
import ResumeAnalyzer from './Resume_ATS';
import JobApplicationsDashboard from './my_application';
import JobPostingWorkspace from './post_job';
import EnhancedHRDashboard from './HR_Dashboard/HR_dashboard';
import AdvancedJobManagement from './HR_Dashboard/job_manage';
import CandidatesPage from './HR_Dashboard/Candidates';
import HiringAnalytics from './HR_Dashboard/Hiring';
import InterviewDashboard from './HR_Dashboard/Interview';
import ATSIntegration from './HR_Dashboard/ATS';
import AssessmentConfig from './HR_Dashboard/Assessment';
import AssessmentApp from './Cheating/assessment_system';

function App() {
  return (
    <Router>
      <div className="App">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Root Route - Dashboard */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Protected User Profile */}
            <Route 
              path="/dashboard/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            
            {/* Protected Competition & Challenge Routes */}
            <Route 
              path="/dashboard/hackathons" 
              element={
                <PrivateRoute>
                  <HackathonsSection />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/brain-games" 
              element={
                <PrivateRoute>
                  <StudentBrainGames />
                </PrivateRoute>
              } 
            />
            
            {/* Protected Skill Development Routes */}
            <Route 
              path="/dashboard/dsa-practice" 
              element={
                <PrivateRoute>
                  <DSAPracticeSection />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/quizzes" 
              element={
                <PrivateRoute>
                  <QuizzesTestsSection />
                </PrivateRoute>
              } 
            />
            
            {/* Protected Job Application Routes */}
            <Route 
              path="/dashboard/resume-analyzer" 
              element={
                <PrivateRoute>
                  <ResumeAnalyzer />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/my-applications" 
              element={
                <PrivateRoute>
                  <JobApplicationsDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/post-job" 
              element={
                <PrivateRoute>
                  <JobPostingWorkspace />
                </PrivateRoute>
              } 
            />
            
            {/* Protected HR Dashboard Routes */}
            <Route 
              path="/dashboard/hr-dashboard" 
              element={
                <PrivateRoute>
                  <EnhancedHRDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/job-management" 
              element={
                <PrivateRoute>
                  <AdvancedJobManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/candidates" 
              element={
                <PrivateRoute>
                  <CandidatesPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/analytics" 
              element={
                <PrivateRoute>
                  <HiringAnalytics />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/interviews" 
              element={
                <PrivateRoute>
                  <InterviewDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/ats" 
              element={
                <PrivateRoute>
                  <ATSIntegration />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/assessments" 
              element={
                <PrivateRoute>
                  <AssessmentConfig />
                </PrivateRoute>
              } 
            />
            
            {/* Protected Assessment System */}
            <Route 
              path="/dashboard/assessment_system" 
              element={
                <PrivateRoute>
                  <AssessmentApp />
                </PrivateRoute>
              } 
            />
            
            {/* Protected Catch-all route - redirect to dashboard */}
            <Route 
              path="*" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;