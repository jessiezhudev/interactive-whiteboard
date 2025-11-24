import { io, Socket } from 'socket.io-client';
import type { WhiteboardElement, AddElementEvent, UpdateElementEvent, DeleteElementEvent, UserJoinEvent, UserLeaveEvent } from '../types';

const SOCKET_URL = 'http://localhost:3001'; // This should be configurable

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  connect(userId: string, userName: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      query: {
        userId,
        userName
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.notifyListeners('connect', null);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.notifyListeners('disconnect', null);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', error);
    });

    // Element events
    this.socket.on('elementAdded', (event: AddElementEvent) => {
      this.notifyListeners('elementAdded', event);
    });

    this.socket.on('elementUpdated', (event: UpdateElementEvent) => {
      this.notifyListeners('elementUpdated', event);
    });

    this.socket.on('elementDeleted', (event: DeleteElementEvent) => {
      this.notifyListeners('elementDeleted', event);
    });

    // User events
    this.socket.on('userJoined', (event: UserJoinEvent) => {
      this.notifyListeners('userJoined', event);
    });

    this.socket.on('userLeft', (event: UserLeaveEvent) => {
      this.notifyListeners('userLeft', event);
    });

    // Sync events
    this.socket.on('syncElements', (elements: WhiteboardElement[]) => {
      this.notifyListeners('syncElements', elements);
    });

    this.socket.on('syncUsers', (users: any[]) => {
      this.notifyListeners('syncUsers', users);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (payload: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (payload: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, payload: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, payload);
    }
  }

  private notifyListeners(event: string, payload: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(payload));
    }
  }

  // Element operations
  sendElementAdded(element: WhiteboardElement): void {
    this.emit('addElement', { element });
  }

  sendElementUpdated(elementId: string, updates: Partial<WhiteboardElement>): void {
    this.emit('updateElement', { elementId, updates });
  }

  sendElementDeleted(elementId: string): void {
    this.emit('deleteElement', { elementId });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
