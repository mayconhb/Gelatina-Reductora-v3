const API_BASE = '';

interface AnalyticsEvent {
  event_name: string;
  user_email?: string | null;
  product_id?: string | null;
  properties?: Record<string, any>;
  session_id?: string | null;
  device_type?: string | null;
}

let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL = 10000;
const MAX_QUEUE_SIZE = 20;

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getUserEmail(): string | null {
  return localStorage.getItem('userEmail');
}

async function flushEvents() {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  try {
    const response = await fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsToSend })
    });

    if (!response.ok) {
      console.warn('Failed to send analytics events');
      eventQueue = [...eventsToSend, ...eventQueue];
    }
  } catch (error) {
    console.warn('Analytics error:', error);
    eventQueue = [...eventsToSend, ...eventQueue];
  }
}

function scheduleFlush() {
  if (flushTimeout) return;
  
  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushEvents();
  }, FLUSH_INTERVAL);
}

export function track(eventName: string, properties?: Record<string, any>, productId?: string) {
  const event: AnalyticsEvent = {
    event_name: eventName,
    user_email: getUserEmail(),
    product_id: productId || null,
    properties: properties || {},
    session_id: getSessionId(),
    device_type: getDeviceType()
  };

  eventQueue.push(event);

  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushEvents();
  } else {
    scheduleFlush();
  }
}

export function trackAppOpen() {
  track('app_open', { 
    referrer: document.referrer,
    url: window.location.href
  });
}

export function trackLogin(email: string) {
  track('login', { email });
}

export function trackLogout() {
  track('logout');
}

export function trackProductView(productId: string, productTitle: string) {
  track('product_view', { title: productTitle }, productId);
}

export function trackCheckoutClick(productId: string, productTitle: string) {
  track('checkout_click', { title: productTitle }, productId);
}

export function trackProtocolDayComplete(productId: string, day: number) {
  track('protocol_day_complete', { day }, productId);
}

export function trackWeightAdd(weight: number) {
  track('weight_add', { weight });
}

export function trackWeightDelete() {
  track('weight_delete');
}

export function trackTabChange(tab: string) {
  track('tab_change', { tab });
}

export function trackInstallPrompt(action: 'shown' | 'accepted' | 'dismissed') {
  track('install_prompt', { action });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushEvents);
  window.addEventListener('pagehide', flushEvents);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}
