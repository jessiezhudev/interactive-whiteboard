import React, { useEffect, useRef } from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import { CanvasManager } from '../services/canvasManager';
import { SocketService } from '../services/socketService';
import type { ToolType, WhiteboardElement, User } from '../types';

interface CanvasProps {
  userName: string;
}

const Canvas: React.FC<CanvasProps> = ({ userName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    currentTool, 
    penColor, 
    penWidth, 
    shapeColor, 
    shapeWidth,
    currentLayerId,
    elements, 
    currentUserId,
    setIsCollaborating,
    addUser,
    removeUser,
    addElement,
    updateElement,
    deleteElement
  } = useWhiteboardStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize canvas manager
    canvasManager.init(canvasRef.current, currentUserId);
    canvasManager.setTool(currentTool);
    canvasManager.setPenSettings(penColor, penWidth);
    canvasManager.setShapeSettings(shapeColor, shapeWidth);
    canvasManager.setCurrentLayerId(currentLayerId);

    // Connect to WebSocket server
    socketService.connect(currentUserId, userName);

    // Socket event listeners
    const handleConnect = () => {
      setIsCollaborating(true);
    };

    const handleDisconnect = () => {
      setIsCollaborating(false);
    };

    const handleElementAdded = (event: any) => {
      const { element } = event;
      if (element.userId !== currentUserId) {
        addElement(element);
        canvasManager.addElement(element);
      }
    };

    const handleElementUpdated = (event: any) => {
      const { elementId, updates } = event;
      if (updates.userId !== currentUserId) {
        updateElement(elementId, updates);
        canvasManager.updateElement(elementId, updates);
      }
    };

    const handleElementDeleted = (event: any) => {
      const { elementId } = event;
      // We don't check userId here because deletions should be propagated to all
      deleteElement(elementId);
      canvasManager.deleteElement(elementId);
    };

    const handleUserJoined = (event: any) => {
      const { user } = event;
      addUser(user);
    };

    const handleUserLeft = (event: any) => {
      const { userId } = event;
      removeUser(userId);
    };

    const handleSyncElements = (syncElements: WhiteboardElement[]) => {
      // Clear current elements and sync with server
      canvasManager.clear();
      syncElements.forEach(element => {
        addElement(element);
        canvasManager.addElement(element);
      });
    };

    const handleSyncUsers = (syncUsers: any[]) => {
      // Clear current users and sync with server
      // (excluding current user)
      syncUsers.forEach(user => {
        if (user.id !== currentUserId) {
          addUser(user);
        }
      });
    };

    // Register listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('elementAdded', handleElementAdded);
    socketService.on('elementUpdated', handleElementUpdated);
    socketService.on('elementDeleted', handleElementDeleted);
    socketService.on('userJoined', handleUserJoined);
    socketService.on('userLeft', handleUserLeft);
    socketService.on('syncElements', handleSyncElements);
    socketService.on('syncUsers', handleSyncUsers);

    // Cleanup
    return () => {
      socketService.disconnect();
      canvasManager.dispose();
    };
  }, []);

  // Update canvas when tool changes
  useEffect(() => {
    canvasManager.setTool(currentTool);
  }, [currentTool]);

  // Update canvas when pen settings change
  useEffect(() => {
    canvasManager.setPenSettings(penColor, penWidth);
  }, [penColor, penWidth]);

  // Update canvas when shape settings change
  useEffect(() => {
    canvasManager.setShapeSettings(shapeColor, shapeWidth);
  }, [shapeColor, shapeWidth]);

  // Update canvas when current layer changes
  useEffect(() => {
    canvasManager.setCurrentLayerId(currentLayerId);
  }, [currentLayerId]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="border border-gray-300 touch-none"
        />
      </div>
    </div>
  );
};

export default Canvas;
