import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import type { WhiteboardElement, ToolType } from '../types';
import { useWhiteboardStore } from '../store/whiteboardStore';

class CanvasManager {
  private canvas: fabric.Canvas | null = null;
  private isDrawing: boolean = false;
  private currentObject: fabric.Object | null = null;
  private currentTool: ToolType = 'pen';
  private userId: string = '';
  private currentLayerId: string = '';

  init(canvasElement: HTMLCanvasElement, userId: string): void {
    this.canvas = new fabric.Canvas(canvasElement, {
      isDrawingMode: false,
      enableRetinaScaling: true,
      preserveObjectStacking: true
    });

    this.userId = userId;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.canvas) return;

    // Mouse events
    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
    this.canvas.on('mouse:out', this.handleMouseUp.bind(this));

    // Touch events for mobile
    this.canvas.on('touch:start', this.handleTouchStart.bind(this));
    this.canvas.on('touch:move', this.handleTouchMove.bind(this));
    this.canvas.on('touch:end', this.handleTouchEnd.bind(this));

    // Object events
    this.canvas.on('object:added', this.handleObjectAdded.bind(this));
    this.canvas.on('object:modified', this.handleObjectModified.bind(this));
    this.canvas.on('object:removed', this.handleObjectRemoved.bind(this));
  }

  setTool(tool: ToolType): void {
    this.currentTool = tool;
    if (!this.canvas) return;

    switch (tool) {
      case 'pen':
        this.canvas.isDrawingMode = true;
        this.canvas.selection = false;
        break;
      case 'select':
        this.canvas.isDrawingMode = false;
        this.canvas.selection = true;
        break;
      default:
        this.canvas.isDrawingMode = false;
        this.canvas.selection = false;
    }
  }

  setCurrentLayerId(layerId: string): void {
    this.currentLayerId = layerId;
  }

  setPenSettings(color: string, width: number): void {
    if (!this.canvas) return;
    this.canvas.freeDrawingBrush.color = color;
    this.canvas.freeDrawingBrush.width = width;
  }

  setShapeSettings(color: string, width: number): void {
    // Shape settings will be applied when creating shapes
    this.shapeColor = color;
    this.shapeWidth = width;
  }

  private handleMouseDown(event: fabric.IEvent): void {
    if (!this.canvas || !event.pointer) return;

    const pointer = this.canvas.getPointer(event.e);
    
    switch (this.currentTool) {
      case 'pen':
        this.startDrawing(pointer);
        break;
      case 'rectangle':
        this.startRectangle(pointer);
        break;
      case 'circle':
        this.startCircle(pointer);
        break;
      case 'arrow':
        this.startArrow(pointer);
        break;
      case 'line':
        this.startLine(pointer);
        break;
      case 'text':
        this.addText(pointer);
        break;
    }
  }

  private handleMouseMove(event: fabric.IEvent): void {
    if (!this.canvas || !event.pointer || !this.isDrawing) return;

    const pointer = this.canvas.getPointer(event.e);
    
    switch (this.currentTool) {
      case 'pen':
        // Handled by Fabric.js free drawing mode
        break;
      case 'rectangle':
      case 'circle':
      case 'arrow':
      case 'line':
        this.updateShape(pointer);
        break;
    }
  }

  private handleMouseUp(): void {
    this.isDrawing = false;
    this.currentObject = null;
  }

  // Touch event handlers for mobile
  private handleTouchStart(event: fabric.IEvent): void {
    if (!event.e) return;
    event.e.preventDefault(); // Prevent scrolling
    this.handleMouseDown(event);
  }

  private handleTouchMove(event: fabric.IEvent): void {
    if (!event.e) return;
    event.e.preventDefault(); // Prevent scrolling
    this.handleMouseMove(event);
  }

  private handleTouchEnd(event: fabric.IEvent): void {
    if (!event.e) return;
    event.e.preventDefault(); // Prevent scrolling
    this.handleMouseUp();
  }

  private startDrawing(pointer: fabric.Point): void {
    if (!this.canvas) return;
    this.isDrawing = true;
  }

  private startRectangle(pointer: fabric.Point): void {
    if (!this.canvas) return;

    this.currentObject = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: 'transparent',
      stroke: this.shapeColor || '#000000',
      strokeWidth: this.shapeWidth || 2,
      objectCaching: false
    });

    this.canvas.add(this.currentObject);
    this.isDrawing = true;
  }

  private startCircle(pointer: fabric.Point): void {
    if (!this.canvas) return;

    this.currentObject = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 0,
      fill: 'transparent',
      stroke: this.shapeColor || '#000000',
      strokeWidth: this.shapeWidth || 2,
      objectCaching: false
    });

    this.canvas.add(this.currentObject);
    this.isDrawing = true;
  }

  private startLine(pointer: fabric.Point): void {
    if (!this.canvas) return;

    this.currentObject = new fabric.Line(
      [pointer.x, pointer.y, pointer.x, pointer.y],
      {
        stroke: this.shapeColor || '#000000',
        strokeWidth: this.shapeWidth || 2,
        objectCaching: false
      }
    );

    this.canvas.add(this.currentObject);
    this.isDrawing = true;
  }

  private startArrow(pointer: fabric.Point): void {
    if (!this.canvas) return;

    // Create arrow as a line with arrowheads
    this.currentObject = new fabric.Line(
      [pointer.x, pointer.y, pointer.x, pointer.y],
      {
        stroke: this.shapeColor || '#000000',
        strokeWidth: this.shapeWidth || 2,
        objectCaching: false,
        arrowHeadWidth: 10,
        arrowHeadLength: 15,
        arrowTailWidth: 8
      }
    );

    this.canvas.add(this.currentObject);
    this.isDrawing = true;
  }

  private updateShape(pointer: fabric.Point): void {
    if (!this.canvas || !this.currentObject) return;

    switch (this.currentTool) {
      case 'rectangle':
        const rect = this.currentObject as fabric.Rect;
        rect.set({
          width: Math.abs(pointer.x - rect.left!),
          height: Math.abs(pointer.y - rect.top!)
        });
        break;
      
      case 'circle':
        const circle = this.currentObject as fabric.Circle;
        const radius = Math.sqrt(
          Math.pow(pointer.x - circle.left!, 2) + 
          Math.pow(pointer.y - circle.top!, 2)
        );
        circle.set({ radius });
        break;
      
      case 'line':
      case 'arrow':
        const line = this.currentObject as fabric.Line;
        line.set({
          x2: pointer.x,
          y2: pointer.y
        });
        break;
    }

    this.canvas.renderAll();
  }

  private addText(pointer: fabric.Point): void {
    if (!this.canvas) return;

    const text = new fabric.IText('Type here...', {
      left: pointer.x,
      top: pointer.y,
      fontSize: useWhiteboardStore.getState().fontSize,
      fontFamily: useWhiteboardStore.getState().fontFamily,
      fill: useWhiteboardStore.getState().textColor,
      editable: true
    });

    this.canvas.add(text);
    this.canvas.setActiveObject(text);
  }

  private handleObjectAdded(event: fabric.IEvent): void {
    if (!event.target) return;

    const object = event.target;
    const elementId = uuidv4();
    
    // Store element ID on the object
    object.set('elementId', elementId);
    object.set('userId', this.userId);
    object.set('layerId', this.currentLayerId);

    // Convert Fabric object to JSON for storage
    const fabricObjectJSON = object.toJSON();
    
    const element: WhiteboardElement = {
      id: elementId,
      type: this.getObjectType(object),
      layerId: this.currentLayerId,
      userId: this.userId,
      timestamp: Date.now(),
      fabricObject: fabricObjectJSON
    };

    // Notify store
    useWhiteboardStore.getState().addElement(element);
    useWhiteboardStore.getState().addOperationToHistory({
      id: uuidv4(),
      type: 'add',
      element,
      timestamp: Date.now(),
      userId: this.userId
    });
  }

  private handleObjectModified(event: fabric.IEvent): void {
    if (!event.target) return;

    const object = event.target;
    const elementId = object.get('elementId');
    
    if (!elementId) return;

    // Update element in store
    const element: Partial<WhiteboardElement> = {
      fabricObject: object.toJSON(),
      timestamp: Date.now()
    };

    useWhiteboardStore.getState().updateElement(elementId, element);
  }

  private handleObjectRemoved(event: fabric.IEvent): void {
    if (!event.target) return;

    const object = event.target;
    const elementId = object.get('elementId');
    
    if (!elementId) return;

    // Find the element to add to history
    const element = useWhiteboardStore.getState().elements.find(e => e.id === elementId);
    if (element) {
      useWhiteboardStore.getState().addOperationToHistory({
        id: uuidv4(),
        type: 'delete',
        element,
        timestamp: Date.now(),
        userId: this.userId
      });
    }

    // Remove element from store
    useWhiteboardStore.getState().deleteElement(elementId);
  }

  private getObjectType(object: fabric.Object): 'path' | 'rect' | 'circle' | 'line' | 'text' {
    if (object.type === 'path') return 'path';
    if (object.type === 'rect') return 'rect';
    if (object.type === 'circle') return 'circle';
    if (object.type === 'line') return 'line';
    if (object.type === 'i-text' || object.type === 'text') return 'text';
    return 'path'; // Default
  }

  // Public methods for external use
  addElement(element: WhiteboardElement): void {
    if (!this.canvas) return;

    // Check if element already exists
    const existingObject = this.canvas.getObjects().find(obj => obj.get('elementId') === element.id);
    if (existingObject) return;

    // Load Fabric object from JSON
    fabric.util.enlivenObjects([element.fabricObject], (objects) => {
      objects.forEach((obj) => {
        obj.set('elementId', element.id);
        obj.set('userId', element.userId);
        obj.set('layerId', element.layerId);
        this.canvas?.add(obj);
      });
      this.canvas?.renderAll();
    });
  }

  updateElement(elementId: string, updates: Partial<WhiteboardElement>): void {
    if (!this.canvas || !updates.fabricObject) return;

    const object = this.canvas.getObjects().find(obj => obj.get('elementId') === elementId);
    if (!object) return;

    // Update object properties
    object.set(updates.fabricObject);
    this.canvas.renderAll();
  }

  deleteElement(elementId: string): void {
    if (!this.canvas) return;

    const object = this.canvas.getObjects().find(obj => obj.get('elementId') === elementId);
    if (object) {
      this.canvas.remove(object);
      this.canvas.renderAll();
    }
  }

  clear(): void {
    if (!this.canvas) return;
    this.canvas.clear();
  }

  // Export methods
  exportAsPNG(): string | null {
    if (!this.canvas) return null;
    return this.canvas.toDataURL({ format: 'png', quality: 1 });
  }

  exportAsSVG(): string | null {
    if (!this.canvas) return null;
    return this.canvas.toSVG();
  }

  exportAsPDF(): Blob | null {
    // This would require additional PDF library integration
    // For now, we'll return null and implement it later
    return null;
  }

  dispose(): void {
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  }
}

export const canvasManager = new CanvasManager();
