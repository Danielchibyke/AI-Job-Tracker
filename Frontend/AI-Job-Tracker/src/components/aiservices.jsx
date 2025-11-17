import React, { useState } from 'react';
import './compStyles.css';
import axios from 'axios';

function AiService() {
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setLoading(true);
    try {
      const response = await axios.post(`https://ai-job-tracker-6ekq.onrender.com/api/ai/${service.toLowerCase().replace(/\s+/g, '-')}`);
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Failed to process request' });
    }
    setLoading(false);
  };

  return (
    <div id='aicomponent'>
      <div id='aicomponentwrapper'>
        <div 
          className='ai-service-card'
          onClick={() => handleServiceClick('Smart Recommendation')}
        >
          <h3>Smart Job Recommendations</h3>
          <p>Get AI-powered job matches based on your profile and preferences</p>
          {selectedService === 'Smart Recommendation' && (
            <div className="service-details">
              {loading ? (
                <p>Analyzing your profile...</p>
              ) : result ? (
                <div className="recommendations">
                  {result.recommendations?.map((job, index) => (
                    <div key={index} className="job-recommendation">
                      <h4>{job.title}</h4>
                      <p>Match Score: {job.matchScore}%</p>
                      <p>{job.reason}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div 
          className='ai-service-card'
          onClick={() => handleServiceClick('Automate job application')}
        >
          <h3>Automated Applications</h3>
          <p>One-click job applications with AI-generated cover letters</p>
          {selectedService === 'Automate job application' && (
            <div className="service-details">
              {loading ? (
                <p>Preparing your application...</p>
              ) : result ? (
                <div className="application-status">
                  <p>{result.message}</p>
                  {result.coverLetter && (
                    <div className="cover-letter-preview">
                      <h4>Generated Cover Letter</h4>
                      <p>{result.coverLetter}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div 
          className='ai-service-card'
          onClick={() => handleServiceClick('CV Optimization')}
        >
          <h3>CV Optimization</h3>
          <p>Get AI-powered suggestions to improve your resume</p>
          {selectedService === 'CV Optimization' && (
            <div className="service-details">
              {loading ? (
                <p>Analyzing your CV...</p>
              ) : result ? (
                <div className="cv-feedback">
                  <h4>Optimization Suggestions</h4>
                  <ul>
                    {result.suggestions?.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                  <p>Overall Score: {result.score}/100</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div 
          className='ai-service-card'
          onClick={() => handleServiceClick('Application Tracking')}
        >
          <h3>Application Tracking</h3>
          <p>Track and manage your job applications</p>
          {selectedService === 'Application Tracking' && (
            <div className="service-details">
              {loading ? (
                <p>Loading your applications...</p>
              ) : result ? (
                <div className="tracking-stats">
                  <div className="stat">
                    <h4>Applied</h4>
                    <p>{result.stats.applied}</p>
                  </div>
                  <div className="stat">
                    <h4>Interviews</h4>
                    <p>{result.stats.interviews}</p>
                  </div>
                  <div className="stat">
                    <h4>Offers</h4>
                    <p>{result.stats.offers}</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiService;