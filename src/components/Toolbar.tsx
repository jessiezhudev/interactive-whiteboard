import React from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import type { ToolType, FontFamily, FontSize } from '../types';

interface ToolbarProps {
  onExport: (format: 'png' | 'svg' | 'pdf') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onExport }) => {
  const { 
    currentTool, 
    setCurrentTool, 
    penColor, 
    setPenColor, 
    penWidth, 
    setPenWidth, 
    shapeColor, 
    setShapeColor, 
    shapeWidth, 
    setShapeWidth,
    textColor, 
    setTextColor,
    fontFamily, 
    setFontFamily,
    fontSize, 
    setFontSize,
    undo, 
    redo
  } = useWhiteboardStore();

  const tools: { type: ToolType; icon: string; label: string }[] = [
    { type: 'select', icon: '🖱️', label: 'Select' },
    { type: 'pen', icon: '✏️', label: 'Pen' },
    { type: 'rectangle', icon: '⬜', label: 'Rectangle' },
    { type: 'circle', icon: '⭕', label: 'Circle' },
    { type: 'arrow', icon: '➡️', label: 'Arrow' },
    { type: 'line', icon: '📏', label: 'Line' },
    { type: 'text', icon: '📝', label: 'Text' },
  ];

  const fontFamilies: FontFamily[] = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New'];
  const fontSizes: FontSize[] = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

  const handleToolClick = (tool: ToolType) => {
    setCurrentTool(tool);
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg space-y-4">
      {/* Tools */}
      <div className="grid grid-cols-4 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            onClick={() => handleToolClick(tool.type)}
            className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              currentTool === tool.type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title={tool.label}
          >
            <span className="text-xl">{tool.icon}</span>
            <span className="text-xs">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-2">
        <button
          onClick={undo}
          className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center gap-2"
          title="Undo"
        >
          <span>↶</span>
          <span>Undo</span>
        </button>
        <button
          onClick={redo}
          className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center gap-2"
          title="Redo"
        >
          <span>↷</span>
          <span>Redo</span>
        </button>
      </div>

      {/* Pen Settings */}
      {currentTool === 'pen' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Pen Color</label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Pen Width: {penWidth}</label>
            <input
              type="range"
              min="1"
              max="20"
              value={penWidth}
              onChange={(e) => setPenWidth(parseInt(e.target.value))}
              className="flex-1 ml-2"
            />
          </div>
        </div>
      )}

      {/* Shape Settings */}
      {['rectangle', 'circle', 'arrow', 'line'].includes(currentTool) && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Shape Color</label>
            <input
              type="color"
              value={shapeColor}
              onChange={(e) => setShapeColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Line Width: {shapeWidth}</label>
            <input
              type="range"
              min="1"
              max="20"
              value={shapeWidth}
              onChange={(e) => setShapeWidth(parseInt(e.target.value))}
              className="flex-1 ml-2"
            />
          </div>
        </div>
      )}

      {/* Text Settings */}
      {currentTool === 'text' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as FontFamily)}
              className="ml-2 p-1 border rounded text-sm"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) as FontSize)}
              className="ml-2 p-1 border rounded text-sm"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Export</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onExport('png')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm"
          >
            PNG
          </button>
          <button
            onClick={() => onExport('svg')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm"
          >
            SVG
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm"
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
