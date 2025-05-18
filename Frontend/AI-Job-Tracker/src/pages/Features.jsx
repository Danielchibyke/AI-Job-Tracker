import { Link } from 'react-router-dom';

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex flex-col items-center py-16 px-4">
      {/* Intro Section */}
      <div className="max-w-3xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Why Choose AI Job Tracker?</h1>
        <p className="text-lg text-blue-100 mb-6">Smarter job search. Less stress. More offers. Discover how our platform transforms your job hunt with automation and AI.</p>
        <img src="/covers/demo-dashboard.png" alt="AI Job Tracker Demo" className="mx-auto rounded-xl shadow-lg w-full max-w-md border border-white/20" />
      </div>
      {/* Features Grid */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center shadow-lg border-t-4 border-blue-500">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Smart Application Tracking</h3>
          <p className="text-gray-300 text-center">Keep all your job applications organized and never miss a follow-up or deadline.</p>
        </div>
        <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center shadow-lg border-t-4 border-purple-500">
          <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mb-4 shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Recommendations</h3>
          <p className="text-gray-300 text-center">Get personalized job matches and insights powered by advanced AI.</p>
        </div>
        <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center shadow-lg border-t-4 border-green-500">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Success Analytics</h3>
          <p className="text-gray-300 text-center">Track your progress and get actionable insights to improve your job search strategy.</p>
        </div>
        <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center shadow-lg border-t-4 border-yellow-400">
          <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Automated Applications</h3>
          <p className="text-gray-300 text-center">Let AI help you apply to jobs with one click and generate tailored cover letters.</p>
        </div>
      </div>
      {/* Testimonial Section */}
      <div className="max-w-2xl w-full bg-white/10 rounded-2xl p-8 shadow-xl mb-16 flex flex-col md:flex-row items-center gap-6">
        <img src="/covers/user1.jpg" alt="User" className="w-16 h-16 rounded-full border-2 border-blue-500" />
        <div>
          <h4 className="text-white font-semibold mb-1">Jane Doe</h4>
          <div className="text-blue-200 text-sm mb-2">Software Engineer, Hired at TechCorp</div>
          <p className="text-blue-100 italic">“AI Job Tracker helped me land my dream job in just 3 weeks! The automation and recommendations are a game changer.”</p>
        </div>
      </div>
      {/* CTA Banner */}
      <div className="w-full max-w-3xl bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to get hired faster?</h2>
          <p className="text-blue-100">Join thousands of job seekers using AI Job Tracker to land their dream jobs.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/signup" className="bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-blue-100 transition-colors">Get Started</Link>
          <Link to="/login" className="bg-white/10 border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors">Login</Link>
        </div>
      </div>
    </div>
  );
} 