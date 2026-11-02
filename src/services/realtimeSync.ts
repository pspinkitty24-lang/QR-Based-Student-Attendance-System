/**
 * Real-Time Multi-Device Synchronization Service
 * 
 * Synchronizes attendance sessions and student check-ins across multiple devices
 * (Faculty laptop, Student mobile phones, Admin dashboard) using:
 * 1. Paho MQTT over Secure WebSockets (wss://broker.emqx.io:8084/mqtt)
 * 2. BroadcastChannel (instant multi-tab synchronization on the same browser)
 * 3. LocalStorage cross-tab event listeners
 */

import Paho from 'paho-mqtt';

export type SyncAction =
  | 'SESSION_START'
  | 'SESSION_END'
  | 'STUDENT_CHECKIN'
  | 'ATTENDANCE_OVERRIDE'
  | 'REQUEST_ACTIVE_SESSION'
  | 'STUDENT_EXCUSE_REQUEST'
  | 'EXCUSE_DECISION';

export interface SyncMessage {
  type: 'ATTENDLY_SYNC';
  action: SyncAction;
  senderId: string;
  timestamp: number;
  payload: any;
}

const TOPIC = 'attendly/campus_v2/sync';
const SENDER_ID = 'client_' + Math.random().toString(36).substring(2, 9);

type MessageCallback = (msg: SyncMessage) => void;

class RealtimeSyncManager {
  private client: Paho.Client | null = null;
  private isConnected = false;
  private listeners: Set<MessageCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private reconnectTimer: any = null;

  constructor() {
    this.initBroadcastChannel();
    this.initMqtt();
  }

  // 1. Same-device multi-tab BroadcastChannel
  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('attendly_campus_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'ATTENDLY_SYNC' && event.data.senderId !== SENDER_ID) {
            this.dispatch(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or restricted:', err);
      }
    }
  }

  // 2. Multi-device Secure WebSockets MQTT Broker
  private initMqtt() {
    if (typeof window === 'undefined') return;

    try {
      const clientId = SENDER_ID;
      // Connect to free public broker with Secure WebSockets (WSS on port 8084)
      const client = new Paho.Client('broker.emqx.io', 8084, '/mqtt', clientId);
      this.client = client;

      client.onConnectionLost = (responseObject) => {
        this.isConnected = false;
        if (responseObject.errorCode !== 0) {
          console.log('[RealtimeSync] MQTT Connection lost:', responseObject.errorMessage);
        }
        // Attempt reconnect after 4 seconds
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 4000);
      };

      client.onMessageArrived = (message) => {
        try {
          const data: SyncMessage = JSON.parse(message.payloadString);
          if (data && data.type === 'ATTENDLY_SYNC' && data.senderId !== SENDER_ID) {
            this.dispatch(data);
          }
        } catch {
          // Ignore invalid payloads
        }
      };

      this.connect();
    } catch (err) {
      console.warn('[RealtimeSync] MQTT initialization warning:', err);
    }
  }

  private connect() {
    if (!this.client || this.isConnected) return;

    try {
      this.client.connect({
        useSSL: true,
        timeout: 5,
        keepAliveInterval: 30,
        cleanSession: true,
        onSuccess: () => {
          this.isConnected = true;
          // Subscribe to attendance campus topic
          this.client?.subscribe(TOPIC, { qos: 0 });
          // If we are a student opening the page, request any active session from faculty
          this.send('REQUEST_ACTIVE_SESSION', {});
        },
        onFailure: (err) => {
          this.isConnected = false;
          console.warn('[RealtimeSync] MQTT connect failed (will retry):', err.errorMessage);
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, 6000);
        },
      });
    } catch (e) {
      console.warn('[RealtimeSync] Connect call error:', e);
    }
  }

  // Dispatch message to all local subscriber callbacks
  private dispatch(msg: SyncMessage) {
    this.listeners.forEach((callback) => {
      try {
        callback(msg);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  // Publish to both MQTT network and local BroadcastChannel
  public send(action: SyncAction, payload: any) {
    const message: SyncMessage = {
      type: 'ATTENDLY_SYNC',
      action,
      senderId: SENDER_ID,
      timestamp: Date.now(),
      payload,
    };

    // 1. Broadcast locally (cross-tab)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (err) {
        // Ignore
      }
    }

    // 2. Broadcast via MQTT across devices
    if (this.client && this.isConnected) {
      try {
        const pahoMsg = new Paho.Message(JSON.stringify(message));
        pahoMsg.destinationName = TOPIC;
        pahoMsg.qos = 0;
        this.client.send(pahoMsg);
      } catch (err) {
        console.warn('[RealtimeSync] Failed to publish MQTT message:', err);
      }
    }
  }

  // Subscribe to sync messages
  public subscribe(callback: MessageCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public isOnline(): boolean {
    return this.isConnected;
  }
}

export const realtimeSync = new RealtimeSyncManager();
