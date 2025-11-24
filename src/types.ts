// Types for the whiteboard application
export type ToolType = 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'select';

export type Color = string;

export type FontFamily = 'Arial' | 'Helvetica' | 'Times New Roman' | 'Courier New';

export type FontSize = 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 48 | 60 | 72;

export interface User {
  id: string;
  name: string;
  color: Color;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

export interface WhiteboardElement {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'line' | 'text';
  layerId: string;
  userId: string;
  timestamp: number;
  fabricObject: any; // Will be replaced with proper Fabric.js types
}

export interface Operation {
  id: string;
  type: 'add' | 'update' | 'delete';
  element: WhiteboardElement;
  timestamp: number;
  userId: string;
}

export interface WhiteboardState {
  currentTool: ToolType;
  penColor: Color;
  penWidth: number;
  shapeColor: Color;
  shapeWidth: number;
  textColor: Color;
  fontFamily: FontFamily;
  fontSize: FontSize;
  layers: Layer[];
  currentLayerId: string;
  elements: WhiteboardElement[];
  users: User[];
  currentUserId: string;
  isCollaborating: boolean;
  operationHistory: Operation[];
  historyIndex: number;
  isDrawing: boolean;
}

export interface SocketEvent {
  type: string;
  payload: any;
}

export interface AddElementEvent {
  element: WhiteboardElement;
}

export interface UpdateElementEvent {
  elementId: string;
  updates: Partial<WhiteboardElement>;
}

export interface DeleteElementEvent {
  elementId: string;
}

export interface UserJoinEvent {
  user: User;
}

export interface UserLeaveEvent {
  userId: string;
}
