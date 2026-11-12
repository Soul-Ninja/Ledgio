/**
 * Ledgio — Supabase Cloud Database Configuration
 * 
 * Instructions:
 * Replace 'PASTE_YOUR_ANON_KEY_HERE' below with your actual anon public key from Supabase.
 */

// Canonical Ledgio Application Version (Single source of truth)
window.LEDGIO_VERSION = '1.12.8';

window.SUPABASE_CONFIG = {
  url: 'https://kbfppganpaiybqfleiuo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZnBwZ2FucGFpeWJxZmxlaXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0ODg3MjksImV4cCI6MjEwMzA2NDcyOX0.SC-pFXG4G2QVnYIFULAiCVnzuTAi-Ig06uM-KcUiQW8'
};

// Admin user IDs authorized for administrative views, telemetry access, and announcements
window.LEDGIO_ADMIN_USER_IDS = ['583ea03b-2246-482f-8a92-670c5c0b7c4f'];

// Storage Quota Safety: Detect QuotaExceededError across browser engines
function isQuotaExceededError(error) {
  if (!error) return false;
  return Boolean(
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22 ||
    error.code === 1014 ||
    String(error.message || '').toLowerCase().includes('quota')
  );
}
window.isQuotaExceededError = isQuotaExceededError;

let lastQuotaWarningTime = 0;
function notifyStorageQuotaExceeded() {
  const now = Date.now();
  if (now - lastQuotaWarningTime > 60000) {
    lastQuotaWarningTime = now;
    const msg = 'Device storage is nearly full — your data is safe in the cloud if Cloud Synced';
    if (typeof window.showToast === 'function') {
      window.showToast(msg, 'warning');
    } else {
      console.warn('[Ledgio Storage Quota]', msg);
    }
  }
}
window.notifyStorageQuotaExceeded = notifyStorageQuotaExceeded;

let originalSetItem = null;
if (typeof window !== 'undefined' && window.Storage) {
  originalSetItem = window.Storage.prototype.setItem;
}

// Shared safe localStorage writer: catches QuotaExceededError, notifies user, preserves write in memory fallback
function safeLocalStorageSet(key, value) {
  if (!key) return false;
  try {
    if (typeof window.__ledgio_storage_override_set === 'function') {
      window.__ledgio_storage_override_set(key, String(value));
    } else if (originalSetItem) {
      originalSetItem.call(window.localStorage, key, String(value));
    } else {
      window.localStorage.setItem(key, String(value));
    }
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      notifyStorageQuotaExceeded();
      window.__ledgio_memoryStorage = window.__ledgio_memoryStorage || {};
      window.__ledgio_memoryStorage[key] = String(value);
      return false;
    }
    console.error(`[Storage Error] Failed to write key '${key}':`, err);
    return false;
  }
}
window.safeLocalStorageSet = safeLocalStorageSet;
window.safeStorageSet = safeLocalStorageSet;

// Defensive runtime wrapper on Storage.prototype.setItem so all writes are protected from QuotaExceededError
if (typeof window !== 'undefined' && window.Storage && !window.__ledgio_storage_wrapped__) {
  window.__ledgio_storage_wrapped__ = true;
  const originalSetItem = window.Storage.prototype.setItem;
  const originalGetItem = window.Storage.prototype.getItem;
  window.Storage.prototype.setItem = function(key, value) {
    try {
      return originalSetItem.call(this, key, String(value));
    } catch (err) {
      if (this === window.localStorage && isQuotaExceededError(err)) {
        notifyStorageQuotaExceeded();
        window.__ledgio_memoryStorage = window.__ledgio_memoryStorage || {};
        window.__ledgio_memoryStorage[key] = String(value);
        return;
      }
      throw err;
    }
  };
  window.Storage.prototype.getItem = function(key) {
    const val = originalGetItem.call(this, key);
    if (val !== null && val !== undefined) return val;
    if (this === window.localStorage && window.__ledgio_memoryStorage && Object.prototype.hasOwnProperty.call(window.__ledgio_memoryStorage, key)) {
      return window.__ledgio_memoryStorage[key];
    }
    return val;
  };
}

// Supabase Client Singleton Factory & Instance Cache (Sole createClient origin in Ledgio)
window.getSupabaseClient = function() {
  if (window.supabaseClient) {
    return window.supabaseClient;
  }
  const url = window.SUPABASE_CONFIG?.url;
  const anonKey = window.SUPABASE_CONFIG?.anonKey;
  const isConfigured = url && anonKey && anonKey !== 'PASTE_YOUR_ANON_KEY_HERE';
  if (isConfigured && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      // Supabase JS v2 natively coordinates cross-tab session locks via navigator.locks
      window.supabaseClient = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        }
      });
      return window.supabaseClient;
    } catch (e) {
      console.warn('Supabase singleton initialization error:', e);
      return null;
    }
  }
  return null;
};

// Attempt eager initialization if Supabase library is loaded
if (typeof window !== 'undefined' && window.supabase) {
  window.getSupabaseClient();
}
