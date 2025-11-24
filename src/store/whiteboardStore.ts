import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { WhiteboardState, ToolType, Color, FontFamily, FontSize, Layer, WhiteboardElement, Operation } from '../types';

const MAX_HISTORY = 50;

const initialState: WhiteboardState = {
  currentTool: 'pen',
  penColor: '#000000',
  penWidth: 2,
  shapeColor: '#000000',
  shapeWidth: 2,
  textColor: '#000000',
  fontFamily: 'Arial',
  fontSize: 16,
  layers: [
    { id: uuidv4(), name: 'Layer 1', visible: true, locked: false, order: 0 }
  ],
  currentLayerId: '',
  elements: [],
  users: [],
  currentUserId: uuidv4(),
  isCollaborating: false,
  operationHistory: [],
  historyIndex: -1,
  isDrawing: false
};

// Initialize currentLayerId with the first layer's id
initialState.currentLayerId = initialState.layers[0].id;

export const useWhiteboardStore = create<WhiteboardState & {
  setCurrentTool: (tool: ToolType) => void;
  setPenColor: (color: Color) => void;
  setPenWidth: (width: number) => void;
  setShapeColor: (color: Color) => void;
  setShapeWidth: (width: number) => void;
  setTextColor: (color: Color) => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  addLayer: (name?: string) => void;
  removeLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  reorderLayer: (layerId: string, newOrder: number) => void;
  setCurrentLayer: (layerId: string) => void;
  addElement: (element: WhiteboardElement) => void;
  updateElement: (elementId: string, updates: Partial<WhiteboardElement>) => void;
  deleteElement: (elementId: string) => void;
  addOperationToHistory: (operation: Operation) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  addUser: (user: any) => void;
  removeUser: (userId: string) => void;
  setIsCollaborating: (status: boolean) => void;
  setIsDrawing: (drawing: boolean) => void;
}>((set, get) => ({
  ...initialState,

  setCurrentTool: (tool) => set({ currentTool: tool }),
  setPenColor: (color) => set({ penColor: color }),
  setPenWidth: (width) => set({ penWidth: width }),
  setShapeColor: (color) => set({ shapeColor: color }),
  setShapeWidth: (width) => set({ shapeWidth: width }),
  setTextColor: (color) => set({ textColor: color }),
  setFontFamily: (font) => set({ fontFamily: font }),
  setFontSize: (size) => set({ fontSize: size }),

  addLayer: (name) => {
    const newLayer: Layer = {
      id: uuidv4(),
      name: name || `Layer ${get().layers.length + 1}`,
      visible: true,
      locked: false,
      order: get().layers.length
    };
    set({ layers: [...get().layers, newLayer] });
  },

  removeLayer: (layerId) => {
    if (get().layers.length <= 1) return;
    set({ 
      layers: get().layers.filter(layer => layer.id !== layerId),
      elements: get().elements.filter(element => element.layerId !== layerId),
      currentLayerId: get().currentLayerId === layerId ? get().layers[0].id : get().currentLayerId
    });
  },

  toggleLayerVisibility: (layerId) => {
    set({ 
      layers: get().layers.map(layer => 
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    });
  },

  toggleLayerLock: (layerId) => {
    set({ 
      layers: get().layers.map(layer => 
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    });
  },

  reorderLayer: (layerId, newOrder) => {
    const layers = [...get().layers];
    const layerIndex = layers.findIndex(layer => layer.id === layerId);
    if (layerIndex === -1) return;

    const [movedLayer] = layers.splice(layerIndex, 1);
    layers.splice(newOrder, 0, movedLayer);

    // Update order properties
    const reorderedLayers = layers.map((layer, index) => ({
      ...layer,
      order: index
    }));

    set({ layers: reorderedLayers });
  },

  setCurrentLayer: (layerId) => set({ currentLayerId: layerId }),

  addElement: (element) => {
    set({ elements: [...get().elements, element] });
  },

  updateElement: (elementId, updates) => {
    set({ 
      elements: get().elements.map(element => 
        element.id === elementId ? { ...element, ...updates } : element
      )
    });
  },

  deleteElement: (elementId) => {
    set({ 
      elements: get().elements.filter(element => element.id !== elementId)
    });
  },

  addOperationToHistory: (operation) => {
    const { operationHistory, historyIndex } = get();
    
    // Remove any operations after the current history index
    const newHistory = operationHistory.slice(0, historyIndex + 1);
    newHistory.push(operation);
    
    // Limit history to MAX_HISTORY
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    set({ 
      operationHistory: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  undo: () => {
    const { operationHistory, historyIndex } = get();
    if (historyIndex < 0) return;

    const operation = operationHistory[historyIndex];
    
    switch (operation.type) {
      case 'add':
        get().deleteElement(operation.element.id);
        break;
      case 'update':
        // For update, we need to store the previous state
        // This implementation assumes we have full element state in history
        get().addElement(operation.element);
        break;
      case 'delete':
        get().addElement(operation.element);
        break;
    }
    
    set({ historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { operationHistory, historyIndex } = get();
    if (historyIndex >= operationHistory.length - 1) return;

    const nextIndex = historyIndex + 1;
    const operation = operationHistory[nextIndex];
    
    switch (operation.type) {
      case 'add':
        get().addElement(operation.element);
        break;
      case 'update':
        get().updateElement(operation.element.id, operation.element);
        break;
      case 'delete':
        get().deleteElement(operation.element.id);
        break;
    }
    
    set({ historyIndex: nextIndex });
  },

  clearHistory: () => {
    set({ operationHistory: [], historyIndex: -1 });
  },

  addUser: (user) => {
    set({ users: [...get().users, user] });
  },

  removeUser: (userId) => {
    set({ users: get().users.filter(user => user.id !== userId) });
  },

  setIsCollaborating: (status) => set({ isCollaborating: status }),
  setIsDrawing: (drawing) => set({ isDrawing: drawing })
}));
