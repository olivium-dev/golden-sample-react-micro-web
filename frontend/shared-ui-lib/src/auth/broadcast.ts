/**
 * Broadcast utility for auth and app events with fallback to window events
 */

export type AuthEventType = 'TOKEN_REFRESHED' | 'LOGOUT' | 'LOGIN';

export function createAuthBroadcast() {
  const channelSupported = typeof BroadcastChannel !== 'undefined';
  const channel = channelSupported ? new BroadcastChannel('auth') : null;

  const post = (type: AuthEventType, payload?: any) => {
    try {
      channel?.postMessage({ type, payload });
    } catch {}

    const eventName = `auth:${type.toLowerCase().replace('_', '-')}`;
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  };

  const on = (type: AuthEventType, handler: (payload?: any) => void) => {
    if (channel) {
      channel.addEventListener('message', (e: MessageEvent) => {
        if (e.data?.type === type) handler(e.data?.payload);
      });
    }
    const eventName = `auth:${type.toLowerCase().replace('_', '-')}`;
    const listener = (e: Event) => handler((e as CustomEvent).detail);
    window.addEventListener(eventName, listener as any);
    return () => window.removeEventListener(eventName, listener as any);
  };

  const close = () => channel?.close();

  return { post, on, close };
}

export const authBroadcast = createAuthBroadcast();


