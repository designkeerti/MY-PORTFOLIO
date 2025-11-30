import { motion } from 'framer-motion';
import { useState } from 'react';

interface Folder {
  name: string;
  icon: string;
  x: number;
  y: number;
  color: string;
}

const folders: Folder[] = [
  { name: 'Resume', icon: '📄', x: 10, y: 10, color: '#FFD700' },
  { name: 'Animations', icon: '🎬', x: 10, y: 120, color: '#FF6B6B' },
  { name: 'Projects', icon: '💼', x: 10, y: 230, color: '#4ECDC4' },
  { name: 'Designs', icon: '🎨', x: 10, y: 340, color: '#95E1D3' },
  { name: 'Assets', icon: '📦', x: 10, y: 450, color: '#F38181' },
];

export const MacOSDesktop = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* macOS Window */}
      <motion.div
        className="bg-gray-100 rounded-lg shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Menu Bar */}
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center text-xs text-gray-400">
            Finder
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-200 px-4 py-2 flex items-center gap-3 border-b border-gray-300">
          <button className="px-3 py-1 text-xs bg-white rounded border border-gray-300 hover:bg-gray-50">
            ← Back
          </button>
          <button className="px-3 py-1 text-xs bg-white rounded border border-gray-300 hover:bg-gray-50">
            Forward →
          </button>
          <div className="flex-1"></div>
          <div className="text-xs text-gray-600">Desktop</div>
        </div>

        {/* Desktop Area */}
        <div 
          className="bg-gradient-to-br from-blue-50 to-purple-50 relative"
          style={{ 
            minHeight: '500px',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)'
          }}
        >
          {/* Folders */}
          {folders.map((folder, index) => (
            <motion.div
              key={folder.name}
              className="absolute cursor-pointer"
              style={{
                left: `${folder.x}px`,
                top: `${folder.y}px`,
                width: '100px',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: hoveredFolder === folder.name ? 1.1 : selectedFolder === folder.name ? 1.05 : 1,
              }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.3,
                ease: "easeOut"
              }}
              onMouseEnter={() => setHoveredFolder(folder.name)}
              onMouseLeave={() => setHoveredFolder(null)}
              onClick={() => setSelectedFolder(selectedFolder === folder.name ? null : folder.name)}
            >
              {/* Folder Icon */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="w-16 h-16 flex items-center justify-center text-4xl rounded-lg shadow-lg"
                  style={{
                    backgroundColor: folder.color,
                  }}
                  whileHover={{ 
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.3 }
                  }}
                >
                  {folder.icon}
                </motion.div>
                <motion.span
                  className="text-xs text-center px-1 py-0.5 rounded"
                  style={{
                    backgroundColor: selectedFolder === folder.name ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: selectedFolder === folder.name ? '#3B82F6' : '#1F2937',
                  }}
                  animate={{
                    color: selectedFolder === folder.name ? '#3B82F6' : hoveredFolder === folder.name ? '#6366F1' : '#1F2937',
                  }}
                >
                  {folder.name}
                </motion.span>
              </div>
            </motion.div>
          ))}

          {/* Empty space indicator */}
          <div className="absolute bottom-4 right-4 text-xs text-gray-400">
            Desktop
          </div>
        </div>

        {/* Dock (optional) */}
        <div className="bg-gray-900/80 backdrop-blur-md px-4 py-2 flex items-center justify-center gap-2 border-t border-gray-700">
          {['📱', '🌐', '💬', '📧', '📷', '🎵'].map((icon, i) => (
            <motion.div
              key={i}
              className="w-10 h-10 flex items-center justify-center text-2xl rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer"
              whileHover={{ scale: 1.2, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {icon}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

