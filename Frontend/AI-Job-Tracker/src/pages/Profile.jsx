import React, { useEffect, useState, useRef } from 'react';
import { userService } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [smartAutomation, setSmartAutomation] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef();
  const [aiProfile, setAiProfile] = useState(null);
  const [refreshingAI, setRefreshingAI] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setForm({
          fullname: data.fullname || '',
          email: data.email || '',
          bio: data.profile?.bio || '',
          skills: data.profile?.skills?.join(', ') || '',
          linkedin: data.profile?.linkedin || '',
          github: data.profile?.github || '',
        });
        setAiProfile(data.aiProfile || null);
        // Fetch avatar as blob from backend
        try {
          const avatarRes = await fetch('/api/users/profile/avatar', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (avatarRes.ok) {
            const avatarBlob = await avatarRes.blob();
            setAvatarPreview(URL.createObjectURL(avatarBlob));
          } else {
            setAvatarPreview(null);
          }
        } catch {
          setAvatarPreview(null);
        }
        setSmartAutomation(!!data.smartAutomationEnabled);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile({
        fullname: form.fullname,
        email: form.email,
        'profile.bio': form.bio || '',
        'profile.skills': form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        'profile.linkedin': form.linkedin || '',
        'profile.github': form.github || '',
      });
      toast.success('Profile updated successfully!');
      // Automatically refresh AI profile after profile update
      setRefreshingAI(true);
      try {
        const res = await fetch('/api/users/profile/ai-profile/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (res.ok) {
          setAiProfile(data.aiProfile);
          toast.success('AI profile refreshed!');
        } else {
          toast.error(data.message || 'Failed to refresh AI profile');
        }
      } catch (err) {
        toast.error('Failed to refresh AI profile');
      } finally {
        setRefreshingAI(false);
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAutomationToggle = async (val) => {
    setSmartAutomation(val);
    setSaving(true);
    try {
      await userService.updateProfile({ smartAutomationEnabled: val });
      toast.success(`Smart AI Automation ${val ? 'enabled' : 'disabled'}!`);
    } catch (err) {
      toast.error('Failed to update automation setting');
      setSmartAutomation(!val);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const res = await fetch('/api/users/profile/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        // Fetch the new avatar as blob
        const avatarRes = await fetch('/api/users/profile/avatar', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (avatarRes.ok) {
          const avatarBlob = await avatarRes.blob();
          setAvatarPreview(URL.createObjectURL(avatarBlob));
        }
        setAvatarFile(null);
        toast.success('Profile picture updated!');
      } else {
        toast.error(data.error || 'Failed to upload profile picture');
      }
    } catch (err) {
      toast.error('Failed to upload profile picture');
    }
  };

  const handleAvatarReset = () => {
    setAvatarFile(null);
    // Re-fetch avatar from backend
    (async () => {
      try {
        const avatarRes = await fetch('/api/users/profile/avatar', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (avatarRes.ok) {
          const avatarBlob = await avatarRes.blob();
          setAvatarPreview(URL.createObjectURL(avatarBlob));
        } else {
          setAvatarPreview(null);
        }
      } catch {
        setAvatarPreview(null);
      }
    })();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRefreshAiProfile = async () => {
    setRefreshingAI(true);
    try {
      const res = await fetch('/api/users/profile/ai-profile/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAiProfile(data.aiProfile);
        toast.success('AI profile refreshed!');
      } else {
        toast.error(data.message || 'Failed to refresh AI profile');
      }
    } catch (err) {
      toast.error('Failed to refresh AI profile');
    } finally {
      setRefreshingAI(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading profile...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl mt-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Avatar Section */}
          <section className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-2 group">
              <img
                src={avatarPreview || '/covers/user1.jpg'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg transition duration-200 group-hover:opacity-80"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 focus:outline-none"
                title="Change profile picture"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4 2.828 2.828 0 014 4z" />
                </svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            {avatarFile && (
              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={handleAvatarUpload} loading={saving} className="w-auto px-6 py-2">Save Photo</Button>
                <Button type="button" onClick={handleAvatarReset} className="w-auto px-6 py-2 bg-gray-500 hover:bg-gray-600">Cancel</Button>
              </div>
            )}
          </section>

          {/* Personal Info Section */}
          <section className="bg-white/5 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className="mt-4">
              <label className="block text-white mb-2" htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition min-h-[80px]"
                placeholder="Tell us about yourself..."
              />
            </div>
          </section>

          {/* Skills Section */}
          <section className="bg-white/5 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
            <Input
              label="Skills (comma separated)"
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g. JavaScript, React, Node.js"
            />
          </section>

          {/* Social Links Section */}
          <section className="bg-white/5 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="LinkedIn"
                type="text"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn profile URL"
              />
              <Input
                label="GitHub"
                type="text"
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="GitHub profile URL"
              />
            </div>
          </section>

          {/* Automation Section */}
          <section className="bg-white/5 rounded-xl p-6 flex items-center justify-between">
            <span className="text-white font-medium">Enable Smart AI Automation</span>
            <input
              type="checkbox"
              checked={smartAutomation}
              onChange={e => handleAutomationToggle(e.target.checked)}
              className="form-checkbox h-6 w-6 text-blue-500 rounded focus:ring-blue-400 border-white/20 bg-white/10"
              disabled={saving}
            />
          </section>

          {/* AI Career Roadmap/Insights Section */}
          {aiProfile && (
            <section className="bg-gradient-to-br from-blue-800 via-purple-800 to-blue-900 rounded-2xl p-8 mt-6 shadow-2xl border border-blue-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span role="img" aria-label="rocket">🚀</span> AI Career Roadmap & Insights
                </h3>
                <Button type="button" onClick={handleRefreshAiProfile} loading={refreshingAI} className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition">
                  {refreshingAI ? 'Refreshing...' : 'Refresh AI Profile'}
                </Button>
              </div>
              {/* Skill Match Score with Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <strong className="text-white text-lg">Skill Match Score:</strong>
                  <span className="ml-2 font-bold text-blue-300 text-xl">{aiProfile.skillMatchScore ?? 'N/A'}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${aiProfile.skillMatchScore || 0}%` }}
                  ></div>
                </div>
              </div>
              {/* Recommended Skills */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                  <strong className="text-white text-lg">Recommended Skills to Learn:</strong>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {aiProfile.recommendedSkills && aiProfile.recommendedSkills.map((skill, idx) => (
                    <span key={idx} className="bg-green-700/80 text-white px-4 py-1 rounded-full shadow text-sm font-semibold hover:bg-green-600/90 transition cursor-pointer" title="Add this skill to your learning plan">{skill}</span>
                  ))}
                </div>
              </div>
              {/* Missing Skills (Skill Gap Analysis) */}
              {aiProfile.missingSkills && aiProfile.missingSkills.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
                    <strong className="text-yellow-200 text-lg">Skill Gaps (Missing for Next Steps):</strong>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {aiProfile.missingSkills.map((skill, idx) => (
                      <span key={idx} className="bg-yellow-700/80 text-white px-4 py-1 rounded-full shadow text-sm font-semibold hover:bg-yellow-600/90 transition cursor-help" title="This skill is recommended for your next career step">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Career Path Suggestions */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <strong className="text-white text-lg">Career Path Suggestions:</strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {aiProfile.careerPath && aiProfile.careerPath.map((step, idx) => (
                    <div key={idx} className="bg-white/10 border border-purple-700 rounded-xl p-4 shadow flex flex-col gap-2">
                      <span className="font-semibold text-purple-200 text-lg">{step.role}</span>
                      <span className="text-gray-200 text-sm">Est. <span className="font-bold text-purple-300">{step.estimatedTime}</span> months</span>
                      <span className="text-gray-300 text-xs">Skills: {step.requiredSkills?.join(', ')}</span>
                      {/* Expanded fields: Certifications, Side Projects, Networking Actions */}
                      {step.certifications && step.certifications.length > 0 && (
                        <div className="text-xs text-blue-200 mt-1"><strong>Certifications:</strong> {step.certifications.join(', ')}</div>
                      )}
                      {step.sideProjects && step.sideProjects.length > 0 && (
                        <div className="text-xs text-green-200 mt-1"><strong>Side Projects:</strong> {step.sideProjects.join(', ')}</div>
                      )}
                      {step.networkingActions && step.networkingActions.length > 0 && (
                        <div className="text-xs text-yellow-200 mt-1"><strong>Networking Actions:</strong> {step.networkingActions.join(', ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Learning Resources */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /></svg>
                  <strong className="text-white text-lg">Learning Resources:</strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {aiProfile.learningResources && aiProfile.learningResources.map((res, idx) => (
                    <div key={idx} className="bg-white/10 border border-blue-700 rounded-xl p-4 shadow flex flex-col gap-1">
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline font-semibold text-lg hover:text-blue-400 transition">{res.title}</a>
                      <span className="text-xs text-gray-300">[{res.type}]</span>
                      <div className="text-gray-200 text-sm">{res.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" loading={saving} className="px-8 py-3 text-lg font-semibold">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 