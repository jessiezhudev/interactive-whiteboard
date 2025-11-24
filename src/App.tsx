import React, { useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import UserList from './components/UserList';
import { useWhiteboardStore } from './store/whiteboardStore';
import { jsPDF } from 'jspdf';

function App() {
  const [userName, setUserName] = useState<string>('');
  const [isNameSet, setIsNameSet] = useState<boolean>(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsNameSet(true);
    }
  };

  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    switch (format) {
      case 'png':
        exportAsPNG();
        break;
      case 'svg':
        exportAsSVG();
        break;
      case 'pdf':
        exportAsPDF();
        break;
    }
  };

  const exportAsPNG = () => {
    const dataURL = canvasManager.exportAsPNG();
    if (dataURL) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const exportAsSVG = () => {
    const svgData = canvasManager.exportAsSVG();
    if (svgData) {
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportAsPDF = () => {
    const pdf = new jsPDF({ unit: 'px', format: 'a4' });
    const canvas = document.querySelector('canvas');
    
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scaling to fit PDF page
      const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      pdf.save(`whiteboard-${Date.now()}.pdf`);
    }
  };

  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Welcome to Interactive Whiteboard
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your name to start collaborating
          </p>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              disabled={!userName.trim()}
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Join Whiteboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Interactive Whiteboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Logged in as: <span className="font-semibold">{userName}</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        {/* Left Sidebar - Toolbar */}
        <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
          <Toolbar onExport={handleExport} />
        </div>

        {/* Center - Canvas */}
        <Canvas userName={userName} />

        {/* Right Sidebar - Layers and Users */}
        <div className="w-64 border-l border-gray-200 p-4 overflow-y-auto space-y-4">
          <LayerPanel />
          <UserList />
        </div>
      </div>
    </div>
  );
}

export default App;
