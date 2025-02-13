import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateContent from './pages/CreateContent';
import SEOTools from './pages/SEOTools';
import Scheduler from './pages/Scheduler';
import GrammarChecker from './pages/GrammarChecker';
import Pricing from './pages/Pricing';

function App() {
  return (
      <AuthProvider>
    <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } 
            />
            <Route 
              path="/create" 
              element={
                <AuthGuard>
                  <CreateContent />
                </AuthGuard>
              } 
            />
            <Route 
              path="/seo" 
              element={
                <AuthGuard>
                  <SEOTools />
                </AuthGuard>
              } 
            />
            <Route 
              path="/schedule" 
              element={
                <AuthGuard>
                  <Scheduler />
                </AuthGuard>
              } 
            />
            <Route 
              path="/grammar"
              element={
                <AuthGuard>
                  <GrammarChecker />
                </AuthGuard>
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <AuthGuard>
                  <Pricing />
                </AuthGuard>
              } 
            />
          </Routes>
        </Layout>
    </Router>
      </AuthProvider>
  );
}

export default App;