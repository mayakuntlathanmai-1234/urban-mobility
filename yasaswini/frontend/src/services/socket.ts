import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Ride } from '../types';

type RideEventListener = (event: { type: string; ride: Ride }) => void;

class RealtimeService {
  private client: Client | null = null;
  private listeners: Set<RideEventListener> = new Set();
  private isConnected: boolean = false;

  constructor() {
    this.initStompClient();
  }

  private initStompClient() {
    try {
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:5000/ws-rides'),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('[STOMP] Connected to /ws-rides');
          this.isConnected = true;

          this.client?.subscribe('/topic/rides', (message) => {
            try {
              const body = JSON.parse(message.body);
              this.notifyListeners(body);
            } catch (err) {
              console.error('[STOMP] Parse error', err);
            }
          });
        },
        onDisconnect: () => {
          console.log('[STOMP] Disconnected');
          this.isConnected = false;
        },
        onStompError: (frame) => {
          console.warn('[STOMP Error]', frame.headers['message']);
          this.isConnected = false;
        },
      });

      this.client.activate();
    } catch (e) {
      console.warn('[STOMP] Initialization fallback', e);
    }
  }

  public subscribe(listener: RideEventListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('[STOMP] Listener error', err);
      }
    });
  }

  public getIsConnected() {
    return this.isConnected;
  }
}

export const realtimeService = new RealtimeService();
export const socket = realtimeService;
