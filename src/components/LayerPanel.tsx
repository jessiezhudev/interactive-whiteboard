import React from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import type { Layer } from '../types';

const LayerPanel: React.FC = () => {
  const { 
    layers, 
    currentLayerId, 
    setCurrentLayer, 
    addLayer, 
    removeLayer, 
    toggleLayerVisibility, 
    toggleLayerLock,
    reorderLayer
  } = useWhiteboardStore();

  // Sort layers by order (ascending = bottom to top)
  const sortedLayers = [...layers].sort((a, b) => a.order - b.order);

  const handleLayerClick = (layerId: string) => {
    setCurrentLayer(layerId);
  };

  const handleAddLayer = () => {
    addLayer();
  };

  const handleRemoveLayer = (layerId: string) => {
    if (window.confirm('Are you sure you want to delete this layer? All elements on this layer will be removed.')) {
      removeLayer(layerId);
    }
  };

  const handleToggleVisibility = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLayerVisibility(layerId);
  };

  const handleToggleLock = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLayerLock(layerId);
  };

  const handleMoveUp = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    if (layer.order < layers.length - 1) {
      reorderLayer(layer.id, layer.order + 1);
    }
  };

  const handleMoveDown = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    if (layer.order > 0) {
      reorderLayer(layer.id, layer.order - 1);
    }
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Layers</h3>
        <button
          onClick={handleAddLayer}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          title="Add Layer"
        >
          +
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedLayers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => handleLayerClick(layer.id)}
            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
              currentLayerId === layer.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              {/* Layer controls */}
              <div className="flex items-center gap-2 flex-1">
                {/* Visibility toggle */}
                <button
                  onClick={(e) => handleToggleVisibility(layer.id, e)}
                  className={`p-1 rounded ${
                    layer.visible
                      ? 'text-gray-800 hover:bg-gray-200'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? '👁️' : '👁️‍🗨️'}
                </button>

                {/* Lock toggle */}
                <button
                  onClick={(e) => handleToggleLock(layer.id, e)}
                  className={`p-1 rounded ${
                    layer.locked
                      ? 'text-gray-800 hover:bg-gray-200'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>

                {/* Layer name */}
                <span
                  className={`flex-1 truncate ${
                    !layer.visible ? 'line-through text-gray-400' : ''
                  }`}
                >
                  {layer.name}
                </span>
              </div>

              {/* Layer order controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleMoveUp(layer, e)}
                  disabled={layer.order >= layers.length - 1}
                  className={`p-1 rounded transition-all ${
                    layer.order >= layers.length - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={(e) => handleMoveDown(layer, e)}
                  disabled={layer.order === 0}
                  className={`p-1 rounded transition-all ${
                    layer.order === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLayer(layer.id);
                  }}
                  disabled={layers.length <= 1}
                  className={`p-1 rounded transition-all ${
                    layers.length <= 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-red-600 hover:bg-red-100'
                  }`}
                  title="Delete layer"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500">
        <p>• Click layer to select</p>
        <p>• Use controls to manage layers</p>
      </div>
    </div>
  );
};

export default LayerPanel;
