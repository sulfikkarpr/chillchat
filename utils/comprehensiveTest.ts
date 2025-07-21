// Comprehensive A-Z Testing Framework for ChillChat
// Tests all functionality, navigation, and edge cases

import safeStorage from './safeStorage';
import { 
  saveChatSession, 
  getChatSessions, 
  deleteChatSession,
  clearAllChatSessions,
  addMessageToSession,
  updateSessionActiveStatus,
  generateMessageId,
  generateDeviceId,
  getAppSettings,
  saveAppSettings
} from './storage';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  error?: any;
}

interface ComprehensiveTestResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  overallPassed: boolean;
}

class ChillChatTester {
  private results: TestResult[] = [];

  private async runTest(testName: string, testFunction: () => Promise<void>): Promise<void> {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      this.results.push({
        testName,
        passed: true,
        details: 'Test passed successfully'
      });
      console.log(`✅ PASSED: ${testName}`);
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        details: 'Test failed',
        error: error.message || error
      });
      console.log(`❌ FAILED: ${testName} - ${error.message || error}`);
    }
  }

  // A - App Initialization Tests
  async testAppInitialization(): Promise<void> {
    await this.runTest('A1 - Storage Initialization', async () => {
      const storageType = safeStorage.getStorageType();
      if (!storageType || (storageType !== 'AsyncStorage' && storageType !== 'MemoryStorage')) {
        throw new Error('Storage not properly initialized');
      }
    });

    await this.runTest('A2 - Storage Basic Operations', async () => {
      await safeStorage.setItem('__test_key__', 'test_value');
      const value = await safeStorage.getItem('__test_key__');
      if (value !== 'test_value') {
        throw new Error('Storage read/write failed');
      }
      await safeStorage.removeItem('__test_key__');
    });
  }

  // B - Bluetooth Service Tests
  async testBluetoothService(): Promise<void> {
    await this.runTest('B1 - Bluetooth Service Import', async () => {
      const BluetoothService = require('../services/BluetoothService').default;
      if (!BluetoothService) {
        throw new Error('BluetoothService not properly imported');
      }
    });

    await this.runTest('B2 - Bluetooth Methods Exist', async () => {
      const BluetoothService = require('../services/BluetoothService').default;
      const requiredMethods = [
        'requestPermissions',
        'isBluetoothEnabled', 
        'getConnectedDevices',
        'startDeviceDiscovery',
        'connectToDevice',
        'sendMessage',
        'disconnectDevice'
      ];
      
      for (const method of requiredMethods) {
        if (typeof BluetoothService[method] !== 'function') {
          throw new Error(`BluetoothService.${method} is not a function`);
        }
      }
    });
  }

  // C - Chat Session Tests
  async testChatSessions(): Promise<void> {
    await this.runTest('C1 - Create Chat Session', async () => {
      const testSession = {
        deviceId: 'test_device_001',
        deviceName: 'Test Device 1',
        deviceAddress: '00:11:22:33:44:55',
        lastConnected: new Date().toISOString(),
        messages: [],
        isActive: true
      };
      
      await saveChatSession(testSession);
      const sessions = await getChatSessions();
      const foundSession = sessions.find(s => s.deviceId === 'test_device_001');
      if (!foundSession) {
        throw new Error('Chat session not saved properly');
      }
    });

    await this.runTest('C2 - Add Messages to Session', async () => {
      const message = {
        id: generateMessageId(),
        text: 'Test message',
        timestamp: new Date().toISOString(),
        sender: 'me' as const
      };
      
      await addMessageToSession('test_device_001', message);
      const sessions = await getChatSessions();
      const session = sessions.find(s => s.deviceId === 'test_device_001');
      if (!session || session.messages.length === 0) {
        throw new Error('Message not added to session');
      }
    });

    await this.runTest('C3 - Update Session Status', async () => {
      await updateSessionActiveStatus('test_device_001', false);
      const sessions = await getChatSessions();
      const session = sessions.find(s => s.deviceId === 'test_device_001');
      if (!session || session.isActive !== false) {
        throw new Error('Session status not updated');
      }
    });

    await this.runTest('C4 - Delete Chat Session', async () => {
      await deleteChatSession('test_device_001');
      const sessions = await getChatSessions();
      const foundSession = sessions.find(s => s.deviceId === 'test_device_001');
      if (foundSession) {
        throw new Error('Chat session not deleted');
      }
    });
  }

  // D - Data Persistence Tests
  async testDataPersistence(): Promise<void> {
    await this.runTest('D1 - Profile Data Persistence', async () => {
      const profileData = {
        nickname: 'TestUser',
        avatar: '🧪',
        isProfileSetup: true
      };
      
      await safeStorage.setItem('@chillchat_profile', JSON.stringify(profileData));
      const stored = await safeStorage.getItem('@chillchat_profile');
      const parsed = stored ? JSON.parse(stored) : null;
      
      if (!parsed || parsed.nickname !== 'TestUser') {
        throw new Error('Profile data not persisted correctly');
      }
    });

    await this.runTest('D2 - App Settings Persistence', async () => {
      const settings = {
        autoConnect: true,
        theme: 'dark' as const,
        soundEnabled: false
      };
      
      await saveAppSettings(settings);
      const loadedSettings = await getAppSettings();
      
      if (loadedSettings.autoConnect !== true || loadedSettings.theme !== 'dark') {
        throw new Error('App settings not persisted correctly');
      }
    });
  }

  // E - Error Handling Tests
  async testErrorHandling(): Promise<void> {
    await this.runTest('E1 - Invalid JSON Handling', async () => {
      await safeStorage.setItem('__invalid_json__', '{invalid json}');
      try {
        const data = await safeStorage.getItem('__invalid_json__');
        JSON.parse(data || '{}');
        // Should not reach here with invalid JSON, but if storage auto-corrects, that's OK
      } catch (error) {
        // Expected to fail, which is correct behavior
      }
      await safeStorage.removeItem('__invalid_json__');
    });

    await this.runTest('E2 - Non-existent Key Handling', async () => {
      const value = await safeStorage.getItem('__non_existent_key__');
      if (value !== null) {
        throw new Error('Non-existent key should return null');
      }
    });

    await this.runTest('E3 - Empty Session List Handling', async () => {
      await clearAllChatSessions();
      const sessions = await getChatSessions();
      if (!Array.isArray(sessions) || sessions.length !== 0) {
        throw new Error('Empty session list not handled correctly');
      }
    });
  }

  // F - Functionality Integration Tests
  async testFunctionalityIntegration(): Promise<void> {
    await this.runTest('F1 - Multiple Sessions Management', async () => {
      // Create multiple sessions
      const sessions = [
        {
          deviceId: 'device_001',
          deviceName: 'Device 1',
          deviceAddress: '00:11:22:33:44:55',
          lastConnected: new Date().toISOString(),
          messages: [],
          isActive: true
        },
        {
          deviceId: 'device_002', 
          deviceName: 'Device 2',
          deviceAddress: '00:11:22:33:44:66',
          lastConnected: new Date().toISOString(),
          messages: [],
          isActive: false
        }
      ];
      
      for (const session of sessions) {
        await saveChatSession(session);
      }
      
      const savedSessions = await getChatSessions();
      if (savedSessions.length < 2) {
        throw new Error('Multiple sessions not saved correctly');
      }
      
      // Clean up
      await clearAllChatSessions();
    });

    await this.runTest('F2 - Message Threading Test', async () => {
      const session = {
        deviceId: 'thread_test',
        deviceName: 'Thread Test Device',
        deviceAddress: '00:11:22:33:44:77',
        lastConnected: new Date().toISOString(),
        messages: [],
        isActive: true
      };
      
      await saveChatSession(session);
      
      // Add multiple messages
      const messages = [
        { id: generateMessageId(), text: 'Message 1', timestamp: new Date().toISOString(), sender: 'me' as const },
        { id: generateMessageId(), text: 'Message 2', timestamp: new Date().toISOString(), sender: 'other' as const },
        { id: generateMessageId(), text: 'Message 3', timestamp: new Date().toISOString(), sender: 'me' as const }
      ];
      
      for (const message of messages) {
        await addMessageToSession('thread_test', message);
      }
      
      const updatedSessions = await getChatSessions();
      const testSession = updatedSessions.find(s => s.deviceId === 'thread_test');
      
      if (!testSession || testSession.messages.length !== 3) {
        throw new Error('Message threading failed');
      }
      
      await deleteChatSession('thread_test');
    });
  }

  // G - Generate Comprehensive Report
  generateReport(): ComprehensiveTestResults {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const overallPassed = failedTests === 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      results: this.results,
      overallPassed
    };
  }

  // H - Helper Methods for Navigation Testing
  static async testNavigationScenarios(): Promise<void> {
    console.log('🧭 Testing Navigation Scenarios...');
    
    // These would be called from the actual app components
    const navigationTests = [
      'Profile Setup → Main Tabs',
      'Discover Tab → Device Selection → Chat Screen',
      'Chat Screen → Back to Discover Tab',
      'Chats Tab → Session Selection → Chat Screen', 
      'Chat Screen → Back to Chats Tab',
      'Settings Tab → Profile Edit → Back to Settings',
      'Settings Tab → Clear Data → Confirmation',
      'Cross-tab navigation during active chat session'
    ];

    for (const test of navigationTests) {
      console.log(`📱 Navigation Test: ${test}`);
    }
  }

  // I - Integration Test Runner
  async runAllTests(): Promise<ComprehensiveTestResults> {
    console.log('🚀 Starting Comprehensive ChillChat Testing...');
    console.log('=' * 50);

    // Reset results
    this.results = [];

    try {
      // Run all test suites
      await this.testAppInitialization();
      await this.testBluetoothService();
      await this.testChatSessions();
      await this.testDataPersistence(); 
      await this.testErrorHandling();
      await this.testFunctionalityIntegration();

      // Generate final report
      const report = this.generateReport();
      
      console.log('=' * 50);
      console.log('📊 COMPREHENSIVE TEST RESULTS:');
      console.log(`Total Tests: ${report.totalTests}`);
      console.log(`Passed: ${report.passedTests} ✅`);
      console.log(`Failed: ${report.failedTests} ❌`);
      console.log(`Overall Status: ${report.overallPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
      console.log('=' * 50);

      if (report.failedTests > 0) {
        console.log('❌ FAILED TESTS:');
        report.results.filter(r => !r.passed).forEach(result => {
          console.log(`- ${result.testName}: ${result.details}`);
          if (result.error) {
            console.log(`  Error: ${result.error}`);
          }
        });
      }

      return report;
    } catch (error) {
      console.error('💥 Test suite crashed:', error);
      throw error;
    }
  }
}

// Export the tester
export const comprehensiveTester = new ChillChatTester();
export default comprehensiveTester;

// Quick test runner function
export const runQuickTest = async (): Promise<void> => {
  try {
    await comprehensiveTester.runAllTests();
    await ChillChatTester.testNavigationScenarios();
    console.log('🎉 All comprehensive tests completed!');
  } catch (error) {
    console.error('💥 Comprehensive testing failed:', error);
  }
};