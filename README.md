# Interactive Whiteboard

A real-time collaborative whiteboard application built with React, TypeScript, Fabric.js, and Socket.io.

## Features

### 🎨 Drawing Tools
- **Pen**: Freehand drawing with customizable color and thickness
- **Shapes**: Rectangle, Circle, Arrow, and Line tools
- **Text**: Add text with multiple font options and sizes
- **Select**: Move, scale, and rotate elements

### 🔄 Real-time Collaboration
- WebSocket-based communication using Socket.io
- Multiple users can draw simultaneously
- User presence indicators
- Conflict resolution for concurrent edits

### ⏮️ Undo/Redo
- Support for up to 50 levels of undo/redo
- Tracks all user operations
- Works seamlessly with collaborative editing

### 📋 Layer Management
- Create multiple layers
- Show/hide layers
- Lock/unlock layers
- Reorder layers (change stacking order)
- Delete layers (with confirmation)

### 💾 Export Options
- Export as PNG image
- Export as SVG vector graphic
- Export as PDF document

### 📱 Responsive Design
- Optimized for desktop and mobile devices
- Touch-friendly interface for mobile
- Adaptive layout for different screen sizes

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Drawing Engine**: Fabric.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.io
- **Export**: jsPDF (for PDF export)
- **Backend**: Node.js + Express

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd interactive-whiteboard
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

### Running the Application

#### Development Mode

1. **Start the WebSocket server**
```bash
cd server
npm run dev
```
The server will run on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

#### Production Build

1. **Build the frontend**
```bash
npm run build
```

2. **Start the backend server**
```bash
cd server
npm start
```

### Usage

1. **Open the application** in your browser
2. **Enter your name** to join the whiteboard
3. **Select a tool** from the left sidebar
4. **Start drawing** on the canvas
5. **Invite others** to join by sharing the URL
6. **Manage layers** from the right sidebar
7. **Export your work** using the export buttons in the toolbar

## Project Structure

```
interactive-whiteboard/
├── src/
│   ├── components/          # React components
│   │   ├── Canvas.tsx      # Main canvas component
│   │   ├── Toolbar.tsx     # Toolbar with drawing tools
│   │   ├── LayerPanel.tsx  # Layer management panel
│   │   └── UserList.tsx    # Online users list
│   ├── store/
│   │   └── whiteboardStore.ts  # Zustand state management
│   ├── services/
│   │   ├── canvasManager.ts    # Fabric.js canvas operations
│   │   └── socketService.ts    # WebSocket communication
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── server/
│   ├── index.js            # WebSocket server
│   └── package.json        # Server dependencies
├── public/                 # Static assets
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## Key Features Implementation

### Real-time Collaboration
- Uses Socket.io for bidirectional communication
- Elements are synced across all connected clients
- User presence is tracked and displayed

### Conflict Resolution
- Timestamp-based conflict resolution
- Last write wins strategy for concurrent edits
- Operations are queued and processed in order

### Undo/Redo System
- Maintains a history of all operations
- Each operation is stored with complete state
- Supports undoing and redoing up to 50 steps

### Layer System
- Each element belongs to a specific layer
- Layers can be shown/hidden independently
- Locked layers prevent modifications
- Layer order determines rendering stacking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Support

- iOS Safari (latest)
- Chrome Mobile (latest)
- Firefox Mobile (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
