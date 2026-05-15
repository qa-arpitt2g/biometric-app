'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * TabGuard enforces a single-tab policy.
 * It prevents a second tab from opening if an active tab already exists.
 */
export default function TabGuard() {
  const [isBlocked, setIsBlocked] = useState(false);
  const tabIdRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!tabIdRef.current) {
      tabIdRef.current = Math.random().toString(36).substring(2, 15);
    }
    
    if (!channelRef.current) {
      channelRef.current = new BroadcastChannel('app_single_tab_lock');
    }

    const HEARTBEAT_INTERVAL = 2000;
    const STALE_THRESHOLD = 5000;

    const checkTabStatus = () => {
      const activeTabId = localStorage.getItem('active_tab_id');
      const lastHeartbeat = parseInt(localStorage.getItem('active_tab_heartbeat') || '0', 10);
      const now = Date.now();

      // If there is an active tab and it's not us, and the heartbeat is fresh
      if (activeTabId && activeTabId !== tabIdRef.current && (now - lastHeartbeat < STALE_THRESHOLD)) {
        setIsBlocked(true);
        return false;
      }

      // If no active tab or it's stale, claim it
      localStorage.setItem('active_tab_id', tabIdRef.current);
      localStorage.setItem('active_tab_heartbeat', now.toString());
      setIsBlocked(false);
      return true;
    };

    const heartbeat = setInterval(() => {
      const activeTabId = localStorage.getItem('active_tab_id');
      
      if (activeTabId === tabIdRef.current) {
        localStorage.setItem('active_tab_heartbeat', Date.now().toString());
      } else {
        // We are either blocked or trying to recover
        checkTabStatus();
      }
    }, HEARTBEAT_INTERVAL);

    // Initial check
    checkTabStatus();

    // Listen for visibility changes to re-check status
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTabStatus();
      }
    };

    // Cleanup on close
    const handleUnload = () => {
      if (localStorage.getItem('active_tab_id') === tabIdRef.current) {
        localStorage.removeItem('active_tab_id');
        localStorage.removeItem('active_tab_heartbeat');
        channelRef.current.postMessage({ type: 'TAB_CLOSED', tabId: tabIdRef.current });
      }
    };

    // Listen for other tabs closing to quickly take over
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'TAB_CLOSED') {
        checkTabStatus();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload(); // Ensure we clear if the component unmounts
    };
  }, []);

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen bg-primary/95 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-[460px] bg-white rounded-[32px] shadow-2xl p-8 sm:p-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-24 h-24 rounded-full bg-secondary-container/30 flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-secondary text-5xl">tab</span>
        </div>
        
        <h2 className="font-headline-sm text-headline-sm text-primary mb-4 leading-tight">
          Application Already Open
        </h2>
        
        <p className="font-body-md text-body-md text-on-surface-variant mb-10 leading-relaxed">
          This application is already open in another tab. To ensure your security and data integrity, only one active tab is allowed at a time.
        </p>
        
        <div className="w-full p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 mb-8">
          <div className="flex items-center gap-3 text-left">
            <span className="material-symbols-outlined text-secondary">info</span>
            <p className="text-sm text-on-surface-variant leading-tight">
              Please close the other tab or use that one to continue your work.
            </p>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Refresh This Tab
        </button>
      </div>
    </div>
  );
}
