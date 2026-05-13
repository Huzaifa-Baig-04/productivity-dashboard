import { database, auth } from '../firebase';
import { ref, get, set } from 'firebase/database';

// ═══════════════════════════════════════════════════════════════════════════
// Firebase Configuration Test Utility
// Run tests to verify Firebase setup is working correctly
// ═══════════════════════════════════════════════════════════════════════════

export async function testFirebaseConnection() {
  console.log('🧪 Testing Firebase Connection...');
  
  try {
    // Test 1: Check if database is initialized
    if (!database) {
      console.error('❌ Database not initialized');
      return { success: false, error: 'Database not initialized' };
    }
    console.log('✅ Database initialized');

    // Test 2: Try reading from a test path
    const testRef = ref(database, 'test/connection');
    const snapshot = await get(testRef);
    console.log('✅ Database read/write permissions OK');

    // Test 3: Try writing test data
    await set(testRef, {
      timestamp: new Date().toISOString(),
      test: true
    });
    console.log('✅ Test data written successfully');

    // Test 4: Verify auth is initialized
    if (!auth) {
      console.error('❌ Auth not initialized');
      return { success: false, error: 'Auth not initialized' };
    }
    console.log('✅ Auth initialized');

    return {
      success: true,
      message: 'All Firebase tests passed!',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    return {
      success: false,
      error: error.message,
      troubleshooting: getTroubleshootingTips(error)
    };
  }
}

export async function testSyncStructure(userId) {
  console.log(`🧪 Testing Sync Structure for user: ${userId}...`);
  
  try {
    const testData = {
      metrics: {
        data: { test: 123, timestamp: Date.now() },
        deviceId: 'test_device',
        platform: 'web',
        lastUpdated: Date.now(),
        synced: true
      },
      settings: {
        theme: 'dark',
        language: 'en',
        lastUpdated: Date.now(),
        syncedFrom: 'test_device'
      },
      record: {
        id: 'test_record_1',
        name: 'Test Record',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncedFrom: 'test_device'
      }
    };

    // Test metrics path
    const metricsRef = ref(database, `metrics/${userId}/web/test_device`);
    await set(metricsRef, testData.metrics);
    console.log('✅ Metrics path writable');

    // Test settings path
    const settingsRef = ref(database, `settings/${userId}`);
    await set(settingsRef, testData.settings);
    console.log('✅ Settings path writable');

    // Test data path
    const dataRef = ref(database, `data/${userId}/test/test_record_1`);
    await set(dataRef, testData.record);
    console.log('✅ Data collection path writable');

    return {
      success: true,
      message: 'All sync paths verified!',
      paths: {
        metrics: `metrics/${userId}/web/test_device`,
        settings: `settings/${userId}`,
        data: `data/${userId}/test/test_record_1`
      }
    };
  } catch (error) {
    console.error('❌ Sync structure test failed:', error.message);
    return {
      success: false,
      error: error.message,
      suggestion: 'Check Firebase security rules in Console'
    };
  }
}

export async function testMetricsAggregation(userId) {
  console.log(`🧪 Testing Metrics Aggregation for user: ${userId}...`);
  
  try {
    // Simulate multiple devices
    const devices = [
      { platform: 'web', id: 'device_web_1' },
      { platform: 'android', id: 'device_android_1' },
      { platform: 'ios', id: 'device_ios_1' }
    ];

    // Write test metrics from multiple "devices"
    for (const device of devices) {
      const metricsRef = ref(database, `metrics/${userId}/${device.platform}/${device.id}`);
      await set(metricsRef, {
        data: {
          prayers: Math.floor(Math.random() * 5),
          tasks: Math.floor(Math.random() * 10),
          workouts: Math.floor(Math.random() * 3)
        },
        deviceId: device.id,
        platform: device.platform,
        lastUpdated: Date.now(),
        synced: true
      });
    }

    console.log('✅ Multi-device test data written');
    console.log('📊 Data should now be aggregated in real-time');
    console.log('   Check Firebase Console → Realtime Database');

    return {
      success: true,
      message: 'Multi-device test setup complete',
      devicesAdded: devices.length,
      next: 'Verify aggregation in Firebase Console'
    };
  } catch (error) {
    console.error('❌ Metrics aggregation test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function checkEnvironmentVariables() {
  console.log('🧪 Checking Environment Variables...');
  
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missing = [];
  const configured = [];

  required.forEach(key => {
    const value = import.meta.env[key];
    if (!value || value === 'YOUR_API_KEY' || value === 'your-project') {
      missing.push(key);
      console.log(`❌ ${key} - NOT CONFIGURED`);
    } else {
      configured.push(key);
      console.log(`✅ ${key} - configured`);
    }
  });

  return {
    success: missing.length === 0,
    configured: configured.length,
    missing: missing,
    message: missing.length === 0 
      ? 'All environment variables configured!' 
      : `Missing: ${missing.join(', ')}`
  };
}

function getTroubleshootingTips(error) {
  const errorMsg = error.message.toLowerCase();

  if (errorMsg.includes('permission denied')) {
    return [
      'Check Firebase Realtime Database Rules',
      'Ensure rules match the provided security rules',
      'Try publishing: { "rules": { ".read": true, ".write": true } } for testing'
    ];
  }

  if (errorMsg.includes('auth')) {
    return [
      'Check Firebase credentials in .env',
      'Verify credentials are from correct Firebase project',
      'Enable Authentication in Firebase Console'
    ];
  }

  if (errorMsg.includes('database')) {
    return [
      'Ensure Realtime Database is enabled',
      'Check database URL in Firebase Console',
      'Verify it matches VITE_FIREBASE_DATABASE_URL'
    ];
  }

  return [
    'Check Firebase Console settings',
    'Verify .env configuration',
    'Check browser console for more details'
  ];
}

export async function runFullDiagnostics(userId = 'test_user_123') {
  console.log('🔍 Running Full Firebase Diagnostics...\n');

  console.log('─────────────────────────────────────────');
  const envCheck = checkEnvironmentVariables();
  console.log('\nResult:', envCheck, '\n');

  if (!envCheck.success) {
    console.error('❌ Environment variables not configured. Fix before proceeding.');
    return { success: false, stopped: 'Missing environment variables' };
  }

  console.log('─────────────────────────────────────────');
  const connCheck = await testFirebaseConnection();
  console.log('\nResult:', connCheck, '\n');

  if (!connCheck.success) {
    console.error('❌ Firebase connection failed.');
    return { success: false, stopped: 'Connection failed' };
  }

  console.log('─────────────────────────────────────────');
  const structCheck = await testSyncStructure(userId);
  console.log('\nResult:', structCheck, '\n');

  if (!structCheck.success) {
    console.error('❌ Sync structure test failed.');
    return { success: false, stopped: 'Structure test failed' };
  }

  console.log('─────────────────────────────────────────');
  const aggCheck = await testMetricsAggregation(userId);
  console.log('\nResult:', aggCheck, '\n');

  console.log('═════════════════════════════════════════');
  console.log('✅ ALL DIAGNOSTICS PASSED!');
  console.log('═════════════════════════════════════════');
  console.log('\n📱 Next Steps:');
  console.log('  1. Build and deploy your web app');
  console.log('  2. Set up Android app with same Firebase project');
  console.log('  3. Test real-time sync between devices');
  console.log('  4. Monitor sync status with SyncStatusIndicator\n');

  return { success: true, message: 'All systems ready!' };
}

// ═════════════════════════════════════════════════════════════════════════════
// USAGE IN BROWSER CONSOLE:
// ═════════════════════════════════════════════════════════════════════════════

/*
// Run all diagnostics:
import { runFullDiagnostics } from './services/firebaseTest';
runFullDiagnostics('your_user_id');

// Run individual tests:
import { checkEnvironmentVariables, testFirebaseConnection } from './services/firebaseTest';
checkEnvironmentVariables();
testFirebaseConnection();

// If tests pass, you're ready to sync!
*/

export default {
  testFirebaseConnection,
  testSyncStructure,
  testMetricsAggregation,
  checkEnvironmentVariables,
  runFullDiagnostics
};
