import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { runQuickTest } from '../utils/comprehensiveTest';
import { 
  navigationRunner, 
  navigationTestSuite, 
  runAllNavigationTests 
} from '../utils/navigationTester';

interface TestingPanelProps {
  visible: boolean;
  onClose: () => void;
  currentScreen: string;
}

export const TestingPanel: React.FC<TestingPanelProps> = ({ 
  visible, 
  onClose, 
  currentScreen 
}) => {
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const runStorageTests = async () => {
    console.log('🧪 Running Storage Tests from Testing Panel...');
    await runQuickTest();
  };

  const runNavigationTests = () => {
    console.log('🧭 Running Navigation Tests from Testing Panel...');
    runAllNavigationTests();
  };

  const startNavigationTest = (testId: string) => {
    const test = navigationRunner.startTest(testId);
    if (test) {
      setActiveTest(testId);
    }
  };

  const completeNavigationTest = (testId: string, success: boolean) => {
    navigationRunner.completeTest(testId, success);
    setActiveTest(null);
  };

  const getRelevantTests = () => {
    return navigationTestSuite.filter(test => 
      test.fromTab === currentScreen || 
      test.toTab === currentScreen ||
      test.fromTab === 'Multiple' ||
      test.toTab === 'Multiple'
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 ChillChat Testing Panel</Text>
          <Text style={styles.subtitle}>Current Screen: {currentScreen}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Automated Tests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 Automated Tests</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={runStorageTests}
            >
              <Text style={styles.testButtonText}>Run Storage & Data Tests</Text>
              <Text style={styles.testButtonSubtext}>
                Tests storage, sessions, and data persistence
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={runNavigationTests}
            >
              <Text style={styles.testButtonText}>Load Navigation Tests</Text>
              <Text style={styles.testButtonSubtext}>
                Displays all navigation test scenarios
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Navigation Tests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧭 Navigation Tests ({currentScreen})</Text>
            
            {getRelevantTests().map((test) => (
              <View key={test.id} style={styles.testItem}>
                <View style={styles.testHeader}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testRoute}>{test.fromTab} → {test.toTab}</Text>
                </View>
                
                <Text style={styles.testDescription}>{test.description}</Text>
                
                <View style={styles.testOperations}>
                  <Text style={styles.operationsTitle}>Operations:</Text>
                  {test.operations.map((op, index) => (
                    <Text key={index} style={styles.operation}>
                      {index + 1}. {op}
                    </Text>
                  ))}
                </View>
                
                <Text style={styles.expectedResult}>
                  Expected: {test.expectedResult}
                </Text>
                
                <View style={styles.testActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.startButton]}
                    onPress={() => startNavigationTest(test.id)}
                    disabled={activeTest === test.id}
                  >
                    <Text style={styles.actionButtonText}>
                      {activeTest === test.id ? 'Testing...' : 'Start Test'}
                    </Text>
                  </TouchableOpacity>
                  
                  {activeTest === test.id && (
                    <View style={styles.resultButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.passButton]}
                        onPress={() => completeNavigationTest(test.id, true)}
                      >
                        <Text style={styles.actionButtonText}>✅ Pass</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, styles.failButton]}
                        onPress={() => completeNavigationTest(test.id, false)}
                      >
                        <Text style={styles.actionButtonText}>❌ Fail</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Test Results Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Test Results</Text>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                const report = navigationRunner.generateNavigationReport();
                console.log(report);
              }}
            >
              <Text style={styles.testButtonText}>Generate Test Report</Text>
              <Text style={styles.testButtonSubtext}>
                View navigation test results in console
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  testButtonSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  testItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  testRoute: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  testOperations: {
    marginBottom: 12,
  },
  operationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  operation: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 8,
    marginBottom: 2,
  },
  expectedResult: {
    fontSize: 13,
    color: '#4CAF50',
    backgroundColor: '#F8FFF8',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  testActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  passButton: {
    backgroundColor: '#4CAF50',
  },
  failButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TestingPanel;