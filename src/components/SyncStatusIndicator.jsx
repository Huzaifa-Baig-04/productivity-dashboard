import React, { useState, useEffect } from 'react';
import syncService from '../services/syncService';

// ═══════════════════════════════════════════════════════════════════════════
// Sync Status Indicator Component
// Display real-time sync status in your app
// ═══════════════════════════════════════════════════════════════════════════

export function SyncStatusIndicator() {
  const [status, setStatus] = useState({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update status every 2 seconds
    const interval = setInterval(() => {
      setStatus(syncService.getSyncStatus());
    }, 2000);

    // Initial status
    setStatus(syncService.getSyncStatus());

    return () => clearInterval(interval);
  }, []);

  const statusStyles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '12px'
    },
    indicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: status.isSyncing ? '#F59E0B' : '#10B981',
      animation: status.isSyncing ? 'pulse 1.5s infinite' : 'none'
    },
    details: {
      marginTop: '12px',
      padding: '12px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '6px',
      fontSize: '11px',
      lineHeight: '1.6'
    }
  };

  return (
    <div style={statusStyles.container} onClick={() => setShowDetails(!showDetails)}>
      <div style={statusStyles.indicator}></div>
      <span>{status.isSyncing ? 'Syncing...' : 'Synced'}</span>
      
      {showDetails && (
        <div style={statusStyles.details}>
          <div>🔧 Device: {status.deviceId?.substring(0, 12)}...</div>
          <div>📱 Platform: {status.platform}</div>
          <div>👂 Listeners: {status.activeListeners || 0}</div>
          <div>📦 Queued: {status.queuedItems || 0}</div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default SyncStatusIndicator;
