import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useProfile } from '../contexts/ProfileContext';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { updateProfile } = useProfile();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const avatarOptions = ['😀', '😎', '🤖', '👾', '🚀', '💎', '🎯', '⚡'];
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);

  const handleContinue = async () => {
    if (!nickname.trim()) {
      Alert.alert('Nickname Required', 'Please enter a nickname to continue.');
      return;
    }

    if (nickname.trim().length < 2) {
      Alert.alert('Invalid Nickname', 'Nickname must be at least 2 characters long.');
      return;
    }

    if (nickname.trim().length > 20) {
      Alert.alert('Invalid Nickname', 'Nickname must be less than 20 characters long.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        nickname: nickname.trim(),
        avatar: selectedAvatar,
        isProfileSetup: true,
      });
      
      // Navigate to Home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to ChillChat! 👋</Text>
          <Text style={styles.subtitle}>
            Set up your profile to start chatting with nearby devices
          </Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarSection}>
            <Text style={styles.sectionLabel}>Choose Your Avatar</Text>
            <View style={styles.avatarGrid}>
              {avatarOptions.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar && styles.selectedAvatar
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarEmoji}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.nicknameSection}>
            <Text style={styles.sectionLabel}>Your Nickname</Text>
            <TextInput
              style={styles.nicknameInput}
              placeholder="Enter your nickname..."
              placeholderTextColor="#999999"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <Text style={styles.helperText}>
              This is how others will see you in chat ({nickname.length}/20)
            </Text>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewAvatar}>{selectedAvatar}</Text>
              <Text style={styles.previewNickname}>
                {nickname.trim() || 'Your Nickname'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, loading && styles.disabledButton]}
          onPress={handleContinue}
          disabled={loading || !nickname.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Setting up...' : 'Continue to ChillChat'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Your profile is stored locally on your device
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  profileSection: {
    flex: 1,
  },
  avatarSection: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedAvatar: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  nicknameSection: {
    marginBottom: 30,
  },
  nicknameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#333333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  helperText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  previewSection: {
    marginBottom: 30,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  previewAvatar: {
    fontSize: 40,
    marginBottom: 12,
  },
  previewNickname: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ProfileScreen;