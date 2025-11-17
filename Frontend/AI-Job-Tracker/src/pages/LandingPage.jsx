import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 mb-10 md:mb-0"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Your AI-Powered Job Search Companion
              </h1>
              <p className="text-lg text-blue-100 mb-2 font-medium">Find jobs, track applications, and get hired faster with smart automation.</p>
              <p className="text-xl text-gray-300 mb-8">
                Track applications, get AI-powered insights, and land your dream job faster.
              </p>
              <div className="space-x-4 mb-4">
                {!user ? (
                  <>
                    <Link
                      to="/signup"
                      className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors inline-block"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="bg-white/10 border-2 border-blue-500 text-blue-200 px-8 py-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors inline-block"
                    >
                      Login
                    </Link>
                    <Link
                      to="/features"
                      className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white/10 transition-colors inline-block"
                    >
                      Learn More
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors inline-block"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="bg-white/10 border-2 border-blue-500 text-blue-200 px-8 py-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors inline-block"
                    >
                      Profile
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-6">
                <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">⭐ Trusted by 1,000+ job seekers</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Smart Application Tracking</h3>
                      <p className="text-gray-300">Never miss a follow-up or deadline</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
                      <p className="text-gray-300">Get personalized job recommendations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Success Analytics</h3>
                      <p className="text-gray-300">Track your job search progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose AI Job Tracker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Tracking</h3>
              <p className="text-gray-300">
                Keep track of all your job applications in one place with our intuitive dashboard.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Insights</h3>
              <p className="text-gray-300">
                Get personalized job recommendations and insights powered by advanced AI.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Success Analytics</h3>
              <p className="text-gray-300">
                Track your progress and get insights to improve your job search strategy.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Testimonial/Demo Section */}
        <div className="container mx-auto px-6 py-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">What Our Users Say</h3>
              <p className="text-lg text-blue-100 mb-4">“AI Job Tracker helped me land my dream job in just 3 weeks! The automation and recommendations are a game changer.”</p>
              <div className="flex items-center gap-3">
                <img src="/covers/user1.jpg" alt="User" className="w-12 h-12 rounded-full border-2 border-blue-500" />
                <div>
                  <div className="text-white font-semibold">Jane Doe</div>
                  <div className="text-blue-200 text-sm">Software Engineer, Hired at TechCorp</div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <img src="/covers/demo-dashboard.png" alt="Demo Dashboard" className="rounded-xl shadow-lg w-full max-w-xs border border-white/20" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8">
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-white mb-4 md:mb-0">
                © 2024 AI Job Tracker. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-white hover:text-blue-200 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-white hover:text-blue-200 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-white hover:text-blue-200 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 