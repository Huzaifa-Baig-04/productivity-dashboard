// ═══════════════════════════════════════════════════════════════════════════
// SYNC INTEGRATION EXAMPLE FOR App.jsx
// Add these imports and hook calls to your existing App.jsx
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// 1. ADD THESE IMPORTS AT THE TOP OF App.jsx
// ─────────────────────────────────────────────────────────────────────────

/*
import { initializeSync } from './services/dataSync';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import { useMetricsSync, useSettingsSync, useCollectionSync } from './services/useSync';
import { pushDashboardMetrics, syncUserSettings, syncDatabaseRecord, updateSharedRecord } from './services/dataSync';
*/

// ─────────────────────────────────────────────────────────────────────────
// 2. ADD THIS IN THE MAIN APP FUNCTION (Inside useEffect)
// ─────────────────────────────────────────────────────────────────────────

/*
useEffect(() => {
  // Initialize sync service - runs once on app load
  const cleanup = initializeSync();
  
  // Example: Set a demo user ID (replace with actual auth)
  const userId = 'user_demo_123';
  
  // Optional: Push initial metrics
  const initialMetrics = {
    salahDone: Object.values(state.todaySalah).filter(Boolean).length,
    tasksDone: state.todos.filter(t => t.done).length,
    studyHours: state.study.reduce((a, s) => a + s.hours, 0).toFixed(1),
    workoutsDone: state.workouts.filter(w => w.done).length
  };
  
  pushDashboardMetrics(userId, initialMetrics).catch(err => 
    console.error('Initial metrics sync failed:', err)
  );
  
  // Cleanup on unmount
  return cleanup;
}, []);
*/

// ─────────────────────────────────────────────────────────────────────────
// 3. AFTER STATE CHANGES, SYNC TO FIREBASE
// Example: When toggling Salah completion
// ─────────────────────────────────────────────────────────────────────────

/*
// Inside existing Salah toggle handler:
const handleSalahToggle = async (prayer) => {
  const newState = {
    ...state.todaySalah,
    [prayer]: !state.todaySalah[prayer]
  };
  
  // Update local state
  setState(s => ({...s, todaySalah: newState}));
  
  // Sync to Firebase (non-blocking)
  const userId = 'user_demo_123';
  try {
    const newMetrics = {
      salahDone: Object.values(newState).filter(Boolean).length,
      tasksDone: state.todos.filter(t => t.done).length,
      studyHours: state.study.reduce((a, s) => a + s.hours, 0).toFixed(1),
      workoutsDone: state.workouts.filter(w => w.done).length
    };
    
    await pushDashboardMetrics(userId, newMetrics);
  } catch (error) {
    console.log('Sync queued:', error);
  }
};
*/

// ─────────────────────────────────────────────────────────────────────────
// 4. ADD SYNC STATUS INDICATOR TO TOP BAR
// Replace this section in your topbar JSX:
// ─────────────────────────────────────────────────────────────────────────

/*
<div className="topbar">
  <div>
    <div className="tb-title">{/* Your page title */}</div>
    <div className="tb-date">{TODAY_STR}</div>
  </div>
  
  {/* ADD THIS LINE */}
  <SyncStatusIndicator />
  
  {/* Rest of topbar content */}
</div>
*/

// ─────────────────────────────────────────────────────────────────────────
// 5. EXAMPLE: SYNC TODOS COLLECTION
// ─────────────────────────────────────────────────────────────────────────

/*
function TodosSection({state, setState}) {
  const userId = 'user_demo_123';
  const { records: syncedTodos, addRecord, updateRecord } = 
    useCollectionSync(userId, 'todos');

  // When todo is completed
  const handleTodoDone = async (todoId) => {
    // Update local state
    setState(s => ({
      ...s,
      todos: s.todos.map(t => 
        t.id === todoId ? {...t, done: !t.done} : t
      )
    }));

    // Sync to Firebase
    try {
      await updateRecord(todoId, {
        done: true,
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      console.log('Todo sync queued:', error);
    }
  };

  return (
    <div>
      {state.todos.map(todo => (
        <div key={todo.id} className="todo-item">
          <span>{todo.task}</span>
          <button onClick={() => handleTodoDone(todo.id)}>
            {todo.done ? '✓' : 'Mark Done'}
          </button>
        </div>
      ))}
    </div>
  );
}
*/

// ─────────────────────────────────────────────────────────────────────────
// 6. EXAMPLE: LISTEN TO AGGREGATED METRICS FROM ALL DEVICES
// ─────────────────────────────────────────────────────────────────────────

/*
function AggregatedMetrics() {
  const userId = 'user_demo_123';
  const { metrics, loading } = useMetricsSync(userId);

  if (loading) return <div>Loading metrics from all devices...</div>;

  return (
    <div className="metrics-panel">
      <h3>Synced Across All Devices:</h3>
      <div>Prayers Done: {metrics?.salahDone || 0}</div>
      <div>Tasks Done: {metrics?.tasksDone || 0}</div>
      <div>Study Hours: {metrics?.studyHours || 0}h</div>
      <div>Workouts: {metrics?.workoutsDone || 0}</div>
    </div>
  );
}
*/

// ─────────────────────────────────────────────────────────────────────────
// 7. EXAMPLE: SETTINGS SYNC
// ─────────────────────────────────────────────────────────────────────────

/*
function SettingsPanel() {
  const userId = 'user_demo_123';
  const { settings, updateSettings } = useSettingsSync(userId);

  const handleThemeChange = async (theme) => {
    await updateSettings({ theme });
  };

  return (
    <div>
      <p>Current Theme: {settings?.theme}</p>
      <button onClick={() => handleThemeChange('dark')}>Dark</button>
      <button onClick={() => handleThemeChange('light')}>Light</button>
    </div>
  );
}
*/

// ─────────────────────────────────────────────────────────────────────────
// COMPLETE INTEGRATION CHECKLIST
// ─────────────────────────────────────────────────────────────────────────

/*
SETUP:
☐ Create .env with Firebase credentials
☐ Set Firebase Realtime Database rules
☐ Import sync modules in App.jsx
☐ Call initializeSync() in useEffect

DASHBOARD:
☐ Add SyncStatusIndicator component
☐ Push metrics on relevant state changes
☐ Listen to aggregated metrics

TODOS:
☐ Sync todo changes to Firebase
☐ Listen for collection updates
☐ Use useCollectionSync hook

SETTINGS:
☐ Sync user preferences
☐ Listen for settings updates
☐ Use useSettingsSync hook

TESTING:
☐ Test on PC web version
☐ Test on Android app
☐ Test offline behavior
☐ Test real-time updates
☐ Check sync queue handling

DEPLOYMENT:
☐ Add .env to .gitignore
☐ Update README with sync docs
☐ Build and deploy React app
☐ Configure Android app with same Firebase
*/

// ═══════════════════════════════════════════════════════════════════════════
// USAGE PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

// Pattern 1: Update + Sync
// ─────────────────────
// setState(newState)
// await pushUpdate(newState) // Fire and forget or await
// Try-catch only if you need error handling

// Pattern 2: Listen + Update UI
// ─────────────────────────────
// const { data, loading } = useSync(...)
// Real-time updates trigger re-renders

// Pattern 3: Bidirectional Sync
// ─────────────────────────────
// PC: User changes setting
// → syncSettings(userId, newSettings)
// → Firebase updates
// → Android receives update
// → Android UI updates in real-time

// ═══════════════════════════════════════════════════════════════════════════
