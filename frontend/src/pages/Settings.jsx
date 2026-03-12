// frontend/src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Clock,
  Mail,
  Lock,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  MessageSquare,
  BookMarked,
  Fingerprint,
  Shield as ShieldIcon,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Plus,
  X,
  Link as LinkIcon,
  AlertCircle
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const settingsNavItems = [
  { icon: User, label: "Profile", color: "#00BEA5", description: "Personal info" },
  { icon: Bell, label: "Notifications", color: "#6366f1", description: "Preferences & alerts" },
  { icon: Shield, label: "Security", color: "#ef4444", description: "Password & 2FA" },
  { icon: Palette, label: "Appearance", color: "#8b5cf6", description: "Theme & display" },
  { icon: Globe, label: "Language", color: "#f59e0b", description: "Region & format" },
];

const activityData = [
  { action: "Profile updated", time: "2 hours ago", icon: User },
  { action: "Password changed", time: "3 days ago", icon: Lock },
  { action: "2FA enabled", time: "1 week ago", icon: Fingerprint },
  { action: "Login from new device", time: "2 weeks ago", icon: Smartphone },
];

// URL validation patterns
const urlPatterns = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/,
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
  github: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9\-]+\/?$/,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
};

export default function Settings() {
  const [originalNotifications, setOriginalNotifications] = useState(null);
  const { theme, setTheme } = useTheme();
  const [avatarFile, setAvatarFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSetting, setActiveSetting] = useState("Profile");
  const { user, updateUser, fetchUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [showSocialPopup, setShowSocialPopup] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: "", url: "" });
  const [urlError, setUrlError] = useState("");
  const [settingsData, setSettingsData] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      courseUpdates: true,
      discussionReplies: true,
      marketingEmails: false,
      securityAlerts: true,
      weeklyDigest: true,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      deviceManagement: true,
      sessionTimeout: 30,
    },
    appearance: {
      theme: "light",
      fontSize: "medium",
      reduceMotion: false,
      highContrast: false,
    },
    language: "en",
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [profilepopup, setProfilePopup] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    if (password.match(/[$@#&!]+/)) strength += 25;
    return Math.min(strength, 100);
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(passwordData.newPassword));
  }, [passwordData.newPassword]);

  const getStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

  const validateSocialUrl = (platform, url) => {
    if (!url) return true;
    const pattern = urlPatterns[platform];
    return pattern ? pattern.test(url) : true;
  };

  const handleAddSocial = () => {
    if (!newSocial.platform || !newSocial.url) {
      setUrlError("Please select a platform and enter a URL");
      return;
    }

    if (!validateSocialUrl(newSocial.platform, newSocial.url)) {
      setUrlError(`Invalid ${newSocial.platform} URL format`);
      return;
    }

    setSocialLinks([...socialLinks, newSocial]);
    setNewSocial({ platform: "", url: "" });
    setShowSocialPopup(false);
    setUrlError("");
  };

  const handleRemoveSocial = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "linkedin": return <Linkedin className="w-4 h-4" />;
      case "twitter": return <Twitter className="w-4 h-4" />;
      case "github": return <Github className="w-4 h-4" />;
      case "instagram": return <Instagram className="w-4 h-4" />;
      default: return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "linkedin": return "text-blue-600";
      case "twitter": return "text-sky-500";
      case "github": return "text-gray-800 dark:text-gray-200";
      case "instagram": return "text-pink-600";
      default: return "text-primary";
    }
  };

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log("Loading user data:", user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
      });
      setSocialLinks(user.socialLinks || []);
    }
  }, [user]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/users/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettingsData(data);
        setOriginalNotifications(data.notifications);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Create payload with ALL form data
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        socialLinks: socialLinks
      };

      console.log("Saving profile data:", payload);

      const response = await axios.put("/api/users/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Profile update response:", response.data);

      // Update context with new data
      updateUser(response.data);
      
      // Update local state with response data
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        email: response.data.email || "",
        bio: response.data.bio || "",
        phone: response.data.phone || "",
        location: response.data.location || "",
      });
      setSocialLinks(response.data.socialLinks || []);
      
      // Fetch fresh data from server
      const refreshedUser = await fetchUserProfile();
      if (refreshedUser) {
        setFormData({
          firstName: refreshedUser.firstName || "",
          lastName: refreshedUser.lastName || "",
          email: refreshedUser.email || "",
          bio: refreshedUser.bio || "",
          phone: refreshedUser.phone || "",
          location: refreshedUser.location || "",
        });
        setSocialLinks(refreshedUser.socialLinks || []);
      }
      
      setAvatarFile(null);
      setProfilePopup(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="relative">
              <img
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : user?.avatar_url
                      ? user.avatar_url
                      : `https://api.dicebear.com/8.x/initials/svg?seed=${formData.firstName || 'User'}%20${formData.lastName || ''}&backgroundColor=00BEA5`
                }
                alt="Profile"
                className="w-28 h-28 rounded-2xl object-cover border-4 border-primary/30 group-hover:border-primary transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300">
              <Camera className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" hidden onChange={(e) => setAvatarFile(e.target.files[0])} />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-main">{formData.firstName || 'Your Name'} {formData.lastName || ''}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1">
                <User className="w-4 h-4" />
                Member
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Joined {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {formData.email || 'email@example.com'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="input-group-modern">
            <label className="input-label-modern">First Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="input-field-modern"
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="input-group-modern">
            <label className="input-label-modern">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="input-field-modern"
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="input-group-modern">
            <label className="input-label-modern">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="input-field-modern"
              placeholder="Enter your location"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="input-group-modern">
            <label className="input-label-modern">Last Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="input-field-modern"
              placeholder="Enter last name"
              required
            />
          </div>
          <div className="input-group-modern">
            <label className="input-label-modern">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="input-field-modern"
              placeholder="+91 xxxxx xxxxx"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="input-group-modern">
        <label className="input-label-modern">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          className="input-field-modern"
          rows="4"
          placeholder="Add description about yourself..."
        />
      </div>

      {/* Social Profiles */}
      <div className="bg-card/50 rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-main flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Social Profiles
          </h3>
          <button
            onClick={() => setShowSocialPopup(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Profile
          </button>
        </div>

        {/* Social Links List */}
        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-card ${getPlatformColor(link.platform)}/10`}>
                  {getPlatformIcon(link.platform)}
                </div>
                <div>
                  <p className="font-medium text-main capitalize">{link.platform}</p>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {link.url}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleRemoveSocial(index)}
                className="p-2 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {socialLinks.length === 0 && (
            <p className="text-center text-muted py-8 bg-card/30 rounded-xl border border-dashed border-border">
              No social profiles added yet. Click "Add Profile" to get started.
            </p>
          )}
        </div>
      </div>

      {/* Social Profile Popup */}
      {showSocialPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-96 border border-border shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-main">Add Social Profile</h3>
              <button
                onClick={() => {
                  setShowSocialPopup(false);
                  setNewSocial({ platform: "", url: "" });
                  setUrlError("");
                }}
                className="p-2 hover:bg-card rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-2 block">Platform</label>
                <select
                  value={newSocial.platform}
                  onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-main"
                >
                  <option value="">Select platform</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="github">GitHub</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted mb-2 block">Profile URL</label>
                <input
                  type="url"
                  value={newSocial.url}
                  onChange={(e) => {
                    setNewSocial({ ...newSocial, url: e.target.value });
                    setUrlError("");
                  }}
                  className="input-field-modern"
                  placeholder="https://..."
                />
                {urlError && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {urlError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSocialPopup(false);
                    setNewSocial({ platform: "", url: "" });
                    setUrlError("");
                  }}
                  className="flex-1 px-4 py-3 border-2 border-border rounded-xl text-muted font-medium hover:bg-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSocial}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <div className="bg-card/50 rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <h3 className="text-lg font-semibold text-main">Notification Preferences</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { icon: Mail, label: "Email Notifications", desc: "Receive updates via email", key: "emailNotifications" },
            { icon: Bell, label: "Push Notifications", desc: "Browser push notifications", key: "pushNotifications" },
            { icon: BookMarked, label: "Course Updates", desc: "New lessons and course updates", key: "courseUpdates" },
            { icon: MessageSquare, label: "Discussion Replies", desc: "Replies to your discussions", key: "discussionReplies" },
            { icon: Mail, label: "Marketing Emails", desc: "Promotions and newsletters", key: "marketingEmails" },
            { icon: ShieldIcon, label: "Security Alerts", desc: "Important security notifications", key: "securityAlerts" },
            { icon: Clock, label: "Weekly Digest", desc: "Weekly summary of activity", key: "weeklyDigest" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-6 hover:bg-card/80 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-main">{item.label}</h4>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
              <label className="toggle-switch-modern">
                <input
                  type="checkbox"
                  checked={settingsData.notifications?.[item.key]}
                  onChange={(e) =>
                    setSettingsData((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, [item.key]: e.target.checked },
                    }))
                  }
                />
                <span className="toggle-slider-modern" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Security Settings */}
      <div className="bg-card/50 rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border bg-gradient-to-r from-red-500/5 to-transparent">
          <h3 className="text-lg font-semibold text-main">Security Settings</h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between p-6 hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Fingerprint className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-main">Two-Factor Authentication</h4>
                <p className="text-sm text-muted">Add an extra layer of security to your account</p>
              </div>
            </div>
            <label className="toggle-switch-modern">
              <input
                type="checkbox"
                checked={settingsData.security?.twoFactorAuth}
                onChange={(e) =>
                  setSettingsData((prev) => ({
                    ...prev,
                    security: { ...prev.security, twoFactorAuth: e.target.checked },
                  }))
                }
              />
              <span className="toggle-slider-modern" />
            </label>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Smartphone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-main">Login Alerts</h4>
                <p className="text-sm text-muted">Get notified about new device logins</p>
              </div>
            </div>
            <label className="toggle-switch-modern">
              <input
                type="checkbox"
                checked={settingsData.security?.loginAlerts}
                onChange={(e) =>
                  setSettingsData((prev) => ({
                    ...prev,
                    security: { ...prev.security, loginAlerts: e.target.checked },
                  }))
                }
              />
              <span className="toggle-slider-modern" />
            </label>
          </div>

          <div className="flex items-center justify-between p-6 hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-main">Session Timeout</h4>
                <p className="text-sm text-muted">Automatically log out after inactivity</p>
              </div>
            </div>
            <select
              value={settingsData.security?.sessionTimeout}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) },
                }))
              }
              className="px-4 py-2 bg-input border border-border rounded-lg text-main focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-card/50 rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-main mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-500" />
          Change Password
        </h3>
        
        <div className="space-y-5">
          <div className="input-group-modern">
            <label className="input-label-modern">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field-modern pr-12"
                placeholder="Enter current password"
              />
              <button
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="input-group-modern">
            <label className="input-label-modern">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="input-field-modern pr-12"
                placeholder="Enter new password"
              />
              <button
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordData.newPassword && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Password Strength</span>
                  <span className={`text-sm font-medium ${
                    passwordStrength < 25 ? "text-red-500" :
                    passwordStrength < 50 ? "text-orange-500" :
                    passwordStrength < 75 ? "text-yellow-500" :
                    "text-green-500"
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`} 
                    style={{ width: `${passwordStrength}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="input-group-modern">
            <label className="input-label-modern">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`input-field-modern ${
                passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : ""
              }`}
              placeholder="Confirm new password"
            />
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                Passwords do not match
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card/50 rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activityData.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-main">{item.action}</p>
                  <p className="text-xs text-muted">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-card/50 rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-main mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "light", icon: Sun, label: "Light", color: "#f59e0b" },
            { value: "dark", icon: Moon, label: "Dark", color: "#8b5cf6" },
            { value: "auto", icon: Monitor, label: "Auto", color: "#3b82f6" },
          ].map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <div
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={`theme-card p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  theme === themeOption.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    theme === themeOption.value ? "bg-primary text-white" : "bg-card text-muted"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`font-medium ${
                    theme === themeOption.value ? "text-primary" : "text-muted"
                  }`}>
                    {themeOption.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-card/50 rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-main mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div>
              <p className="font-medium text-main">Font Size</p>
              <p className="text-sm text-muted">Adjust text size for better readability</p>
            </div>
            <select
              value={settingsData.appearance?.fontSize}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  appearance: { ...prev.appearance, fontSize: e.target.value },
                }))
              }
              className="px-4 py-2 bg-input border border-border rounded-lg text-main focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div>
              <p className="font-medium text-main">Reduce Motion</p>
              <p className="text-sm text-muted">Minimize animations throughout the interface</p>
            </div>
            <label className="toggle-switch-modern">
              <input
                type="checkbox"
                checked={settingsData.appearance?.reduceMotion}
                onChange={(e) =>
                  setSettingsData((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, reduceMotion: e.target.checked },
                  }))
                }
              />
              <span className="toggle-slider-modern" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div>
              <p className="font-medium text-main">High Contrast</p>
              <p className="text-sm text-muted">Increase contrast for better visibility</p>
            </div>
            <label className="toggle-switch-modern">
              <input
                type="checkbox"
                checked={settingsData.appearance?.highContrast}
                onChange={(e) =>
                  setSettingsData((prev) => ({
                    ...prev,
                    appearance: { ...prev.appearance, highContrast: e.target.checked },
                  }))
                }
              />
              <span className="toggle-slider-modern" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-6">
      <div className="bg-card/50 rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Language Preferences
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm text-muted mb-2 block">Interface Language</label>
            <select
              value={settingsData.language}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  language: e.target.value,
                }))
              }
              className="w-full md:w-96 px-4 py-3 bg-input border border-border rounded-xl text-main focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="en">English (US)</option>
              <option value="en-gb">English (UK)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="ar">العربية</option>
              <option value="hi">हिन्दी</option>
              <option value="bn">বাংলা</option>
              <option value="ur">اردو</option>
            </select>
            <p className="text-sm text-muted mt-2">Choose your preferred language for the interface</p>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-main mb-3">Date & Time Format</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted mb-2 block">Date Format</label>
                <select className="w-full px-4 py-3 bg-input border border-border rounded-xl text-main">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted mb-2 block">Time Format</label>
                <select className="w-full px-4 py-3 bg-input border border-border rounded-xl text-main">
                  <option>12-hour (AM/PM)</option>
                  <option>24-hour</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-main mb-3">Regional Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted mb-2 block">Timezone</label>
                <select className="w-full px-4 py-3 bg-input border border-border rounded-xl text-main">
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">Eastern Time (EST/EDT)</option>
                  <option value="CST">Central Time (CST/CDT)</option>
                  <option value="MST">Mountain Time (MST/MDT)</option>
                  <option value="PST">Pacific Time (PST/PDT)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                  <option value="IST">Indian Standard Time (IST)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted mb-2 block">Currency</label>
                <select className="w-full px-4 py-3 bg-input border border-border rounded-xl text-main">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas-alt">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activePage="settings"
        />

        {/* Main Content Area */}
        <main 
          className={`flex-1 transition-all duration-300 pt-24 px-6 ${
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-80"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-muted mt-2 text-lg">Manage your account settings and preferences</p>
            </div>

            {/* Settings Layout */}
            <div className="flex gap-6">
              {/* Settings Navigation */}
              <aside className="w-80">
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-4 sticky top-24">
                  <nav className="space-y-1">
                    {settingsNavItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          onClick={() => setActiveSetting(item.label)}
                          key={item.label}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            activeSetting === item.label 
                              ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-l-4 border-primary" 
                              : "text-muted hover:bg-card hover:text-main"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" style={{ color: activeSetting === item.label ? item.color : 'currentColor' }} />
                          <div className="flex-1 text-left">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-muted">{item.description}</div>
                          </div>
                          {activeSetting === item.label && (
                            <ChevronRight className="w-4 h-4" style={{ color: item.color }} />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </aside>

              {/* Settings Content */}
              <div className="flex-1">
                {activeSetting === "Profile" && renderProfile()}
                {activeSetting === "Notifications" && renderNotifications()}
                {activeSetting === "Security" && renderSecurity()}
                {activeSetting === "Appearance" && renderAppearance()}
                {activeSetting === "Language" && renderLanguage()}
                
                {/* Save/Cancel Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                  <button className="px-6 py-3 border-2 border-border rounded-xl text-muted font-medium hover:bg-card hover:text-main transition-all duration-300">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success Popup */}
      {profilepopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-card to-card/90 rounded-3xl p-8 w-96 text-center border border-primary/30 shadow-2xl animate-scaleIn">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">
              Profile Updated!
            </h2>
            <p className="text-muted mb-8">Your changes have been saved successfully.</p>
            <button
              onClick={() => setProfilePopup(false)}
              className="px-8 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}