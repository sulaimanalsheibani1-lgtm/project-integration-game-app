import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                🎯 Project Game
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="btn-outline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Project Management
            <span className="text-primary-600 block">Through Interactive Gaming</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            An educational simulation platform that transforms complex project management scenarios 
            into engaging, interactive experiences. Learn by doing in our immersive wedding planning simulation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Start Playing Now
            </Link>
            <Link
              to="/demo"
              className="btn-outline text-lg px-8 py-3"
            >
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card text-center">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-3">Interactive Scenarios</h3>
            <p className="text-gray-600">
              Real-world project management challenges in engaging game formats
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
            <p className="text-gray-600">
              Multi-player decision making and role assignment with real-time updates
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
            <p className="text-gray-600">
              Visual dashboards showing project health, KPIs, and performance metrics
            </p>
          </div>
        </div>

        {/* Current Scenario Highlight */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Current Scenario: Wedding Planner Challenge
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Plan and execute the perfect wedding while managing budget constraints, 
              timeline pressures, vendor coordination, and unexpected disruptions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">$15K-$50K</div>
              <div className="text-sm text-gray-500">Budget Range</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-600">3-12 Months</div>
              <div className="text-sm text-gray-500">Planning Period</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">50-300</div>
              <div className="text-sm text-gray-500">Guests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-600">25+</div>
              <div className="text-sm text-gray-500">Disruption Cards</div>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">What You'll Learn</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Project Planning & Resource Allocation',
              'Team Collaboration & Communication',
              'Decision Making Under Pressure',
              'Crisis Management & Adaptability',
              'Budget Management & Cost Control',
              'Timeline Management & Risk Assessment'
            ].map((objective, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-gray-700">{objective}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Project Integration Game App. Built for educational excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;