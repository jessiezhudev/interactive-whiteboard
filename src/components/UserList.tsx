import React from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import type { User } from '../types';

const UserList: React.FC = () => {
  const { users, currentUserId, isCollaborating } = useWhiteboardStore();

  if (!isCollaborating) {
    return (
      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Users</h3>
        <p className="text-sm text-gray-500">Not connected to collaboration</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg space-y-3">
      <h3 className="text-lg font-semibold">Online Users ({users.length})</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className={`p-2 rounded-lg flex items-center gap-2 transition-all ${
              user.id === currentUserId
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* User color indicator */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: user.color }}
              title={`User color: ${user.color}`}
            />
            
            {/* User name */}
            <span className="flex-1 truncate">
              {user.name}
              {user.id === currentUserId && ' (You)'}
            </span>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          No other users online
        </p>
      )}
    </div>
  );
};

export default UserList;
