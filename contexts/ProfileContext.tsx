import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import safeStorage from '../utils/safeStorage';

interface ProfileData {
  nickname: string;
  avatar?: string;
  isProfileSetup: boolean;
}

interface ProfileContextType {
  profile: ProfileData;
  updateProfile: (updates: Partial<ProfileData>) => Promise<void>;
  clearProfile: () => Promise<void>;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

const PROFILE_STORAGE_KEY = '@chillchat_profile';

const defaultProfile: ProfileData = {
  nickname: '',
  avatar: undefined,
  isProfileSetup: false,
};

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);

  // Load profile from AsyncStorage on app start
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await safeStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile({ ...defaultProfile, ...parsedProfile });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    try {
      const newProfile = { ...profile, ...updates };
      console.log('🔄 ProfileContext - Updating profile:', { 
        oldProfile: profile, 
        updates, 
        newProfile 
      });
      setProfile(newProfile);
      await safeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      console.log('✅ ProfileContext - Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const clearProfile = async () => {
    try {
      setProfile(defaultProfile);
      await safeStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing profile:', error);
      throw error;
    }
  };

  const contextValue: ProfileContextType = {
    profile,
    updateProfile,
    clearProfile,
    loading,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};