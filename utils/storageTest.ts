// Storage testing utility to debug storage issues

import safeStorage from './safeStorage';

export const testStorage = async () => {
  console.log('🧪 Testing Storage Functionality...');
  
  try {
    console.log(`📱 Storage Type: ${safeStorage.getStorageType()}`);
    console.log(`✅ AsyncStorage Available: ${safeStorage.isAsyncStorageAvailable()}`);

    // Test basic operations
    const testKey = '__chillchat_test__';
    const testValue = JSON.stringify({ 
      test: true, 
      timestamp: new Date().toISOString() 
    });

    console.log('🔧 Testing setItem...');
    await safeStorage.setItem(testKey, testValue);
    console.log('✅ setItem successful');

    console.log('🔧 Testing getItem...');
    const retrievedValue = await safeStorage.getItem(testKey);
    console.log('✅ getItem successful:', retrievedValue);

    console.log('🔧 Testing removeItem...');
    await safeStorage.removeItem(testKey);
    console.log('✅ removeItem successful');

    console.log('🔧 Testing getItem after removal...');
    const removedValue = await safeStorage.getItem(testKey);
    console.log('✅ getItem after removal:', removedValue);

    console.log('🎉 All storage tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
};

export const testProfileStorage = async () => {
  console.log('👤 Testing Profile Storage...');
  
  try {
    const profileKey = '@chillchat_profile';
    const testProfile = {
      nickname: 'TestUser',
      avatar: '🧪',
      isProfileSetup: true
    };

    await safeStorage.setItem(profileKey, JSON.stringify(testProfile));
    const stored = await safeStorage.getItem(profileKey);
    const parsed = stored ? JSON.parse(stored) : null;
    
    console.log('👤 Profile Storage Test Result:', parsed);
    return parsed && parsed.nickname === 'TestUser';
  } catch (error) {
    console.error('❌ Profile storage test failed:', error);
    return false;
  }
};

export const testChatStorage = async () => {
  console.log('💬 Testing Chat Storage...');
  
  try {
    const sessionsKey = '@chillchat_sessions';
    const testSession = {
      deviceId: 'test_device',
      deviceName: 'Test Device',
      deviceAddress: '00:00:00:00:00:00',
      lastConnected: new Date().toISOString(),
      messages: [
        {
          id: 'msg_1',
          text: 'Test message',
          timestamp: new Date().toISOString(),
          sender: 'me'
        }
      ],
      isActive: false
    };

    await safeStorage.setItem(sessionsKey, JSON.stringify([testSession]));
    const stored = await safeStorage.getItem(sessionsKey);
    const parsed = stored ? JSON.parse(stored) : [];
    
    console.log('💬 Chat Storage Test Result:', parsed);
    return parsed.length > 0 && parsed[0].deviceName === 'Test Device';
  } catch (error) {
    console.error('❌ Chat storage test failed:', error);
    return false;
  }
};

export const runAllTests = async () => {
  console.log('🚀 Running All Storage Tests...');
  
  const results = {
    basic: await testStorage(),
    profile: await testProfileStorage(),
    chat: await testChatStorage()
  };

  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 All tests passed! Storage is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check console for details.');
  }

  return results;
};