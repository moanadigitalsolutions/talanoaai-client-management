'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  BellIcon, 
  CalendarIcon, 
  ClockIcon,
  MailIcon,
  ShieldIcon,
  CogIcon,
  SaveIcon
} from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  const updateSetting = (key: string, value: string, category: string) => {
    setSettings(prev => {
      const existing = prev.find(s => s.key === key);
      if (existing) {
        return prev.map(s => s.key === key ? { ...s, value } : s);
      } else {
        return [...prev, { id: `SETTING_${key.toUpperCase()}`, key, value, category, updatedAt: new Date().toISOString() }];
      }
    });
  };

  const saveSettings = async (category: string) => {
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      const categorySettings = settings.filter(s => s.category === category);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: categorySettings }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'calendar', label: 'Calendar Integration', icon: CalendarIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldIcon },
    { id: 'general', label: 'General', icon: CogIcon },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600">Manage your account and application preferences</p>
      </div>

      <div className="flex space-x-8">
        <div className="w-64 slds-card">
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-salesforce-50 text-salesforce-700 border border-salesforce-200' 
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }
                `}
              >
                <tab.icon className={`mr-3 h-4 w-4 ${activeTab === tab.id ? 'text-salesforce-600' : 'text-neutral-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 slds-card">
          <div className="p-6">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'calendar' && <CalendarSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'general' && <GeneralSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">Profile Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            First Name
          </label>
          <input
            type="text"
            defaultValue="Mathew"
            className="slds-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            Last Name
          </label>
          <input
            type="text"
            defaultValue="F"
            className="slds-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            Email
          </label>
          <input
            type="email"
            defaultValue="mathew.f@talanoaai.com"
            className="slds-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            Phone
          </label>
          <input
            type="tel"
            defaultValue="+1 (555) 123-4567"
            className="slds-input"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">
          Business Address
        </label>
        <textarea
          rows={3}
          defaultValue="123 Business St, City, State 12345"
          className="slds-input"
        />
      </div>
      
      <button className="slds-button slds-button-brand flex items-center space-x-2">
        <SaveIcon className="h-4 w-4" />
        <span>Save Changes</span>
      </button>
    </div>
  );
}

function CalendarSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">Calendar Integration</h2>
      <p className="text-neutral-600">Connect your calendar for seamless scheduling and organization.</p>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>
      <p className="text-neutral-600">Manage how you receive notifications.</p>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">Security Settings</h2>
      <p className="text-neutral-600">Manage your account security settings.</p>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">General Settings</h2>
      <p className="text-neutral-600">Configure general application preferences.</p>
    </div>
  );
}
