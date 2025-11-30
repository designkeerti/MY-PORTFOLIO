const fs = require('fs');
const path = require('path');

// Read the Lottie JSON file
const filePath = path.join(__dirname, 'public/lottie/Cat is sleeping and rolling.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Original frame size:', data.w, 'x', data.h);

// Find the bounds of all elements
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

function findBounds(layer) {
  if (!layer) return;
  
  // Check position
  if (layer.ks?.p?.k) {
    const pos = Array.isArray(layer.ks.p.k[0]) ? layer.ks.p.k[0] : layer.ks.p.k;
    if (Array.isArray(pos) && pos.length >= 2) {
      const x = pos[0];
      const y = pos[1];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  
  // Check anchor point
  if (layer.ks?.a?.k) {
    const anchor = Array.isArray(layer.ks.a.k[0]) ? layer.ks.a.k[0] : layer.ks.a.k;
    if (Array.isArray(anchor) && anchor.length >= 2) {
      const x = anchor[0];
      const y = anchor[1];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  
  // Check shapes for bounds
  if (layer.shapes) {
    layer.shapes.forEach(shape => {
      if (shape.ty === 'gr' && shape.it) {
        shape.it.forEach(item => findBounds(item));
      }
      if (shape.ks) {
        // Check shape position
        if (shape.ks.p?.k) {
          const pos = Array.isArray(shape.ks.p.k[0]) ? shape.ks.p.k[0] : shape.ks.p.k;
          if (Array.isArray(pos) && pos.length >= 2) {
            minX = Math.min(minX, pos[0]);
            minY = Math.min(minY, pos[1]);
            maxX = Math.max(maxX, pos[0]);
            maxY = Math.max(maxY, pos[1]);
          }
        }
      }
    });
  }
  
  // Recursively check nested layers
  if (layer.layers) {
    layer.layers.forEach(findBounds);
  }
}

// Analyze all layers
data.layers.forEach(findBounds);

// Add padding around the content
const padding = 20;
const contentWidth = maxX - minX + (padding * 2);
const contentHeight = maxY - minY + (padding * 2);
const offsetX = minX - padding;
const offsetY = minY - padding;

console.log('Content bounds:', { minX, minY, maxX, maxY });
console.log('Suggested frame size:', contentWidth, 'x', contentHeight);
console.log('Offset needed:', offsetX, offsetY);

// Adjust frame size to be more compact (centered around the cat)
// Let's use a reasonable size that fits the cat better
// Based on typical cat animations, let's try 300x300 centered
const newWidth = 300;
const newHeight = 300;
const centerX = data.w / 2;
const centerY = data.h / 2;

// Update frame size
data.w = newWidth;
data.h = newHeight;

// Adjust all positions to center the content
function adjustPositions(layer) {
  if (!layer) return;
  
  // Adjust position
  if (layer.ks?.p?.k) {
    if (Array.isArray(layer.ks.p.k[0])) {
      // Animated position
      layer.ks.p.k = layer.ks.p.k.map(keyframe => {
        if (keyframe.s) {
          return {
            ...keyframe,
            s: keyframe.s.map((val, i) => {
              if (i === 0) return val - centerX + newWidth / 2;
              if (i === 1) return val - centerY + newHeight / 2;
              return val;
            })
          };
        }
        return keyframe;
      });
    } else {
      // Static position
      layer.ks.p.k = [
        layer.ks.p.k[0] - centerX + newWidth / 2,
        layer.ks.p.k[1] - centerY + newHeight / 2,
        layer.ks.p.k[2] || 0
      ];
    }
  }
  
  // Adjust anchor point
  if (layer.ks?.a?.k) {
    if (Array.isArray(layer.ks.a.k[0])) {
      layer.ks.a.k = layer.ks.a.k.map(keyframe => {
        if (keyframe.s) {
          return {
            ...keyframe,
            s: keyframe.s.map((val, i) => {
              if (i === 0) return val - centerX + newWidth / 2;
              if (i === 1) return val - centerY + newHeight / 2;
              return val;
            })
          };
        }
        return keyframe;
      });
    } else {
      layer.ks.a.k = [
        layer.ks.a.k[0] - centerX + newWidth / 2,
        layer.ks.a.k[1] - centerY + newHeight / 2,
        layer.ks.a.k[2] || 0
      ];
    }
  }
  
  // Adjust shapes
  if (layer.shapes) {
    layer.shapes.forEach(shape => {
      if (shape.ty === 'gr' && shape.it) {
        shape.it.forEach(item => adjustPositions(item));
      }
      if (shape.ks?.p?.k) {
        if (Array.isArray(shape.ks.p.k[0])) {
          shape.ks.p.k = shape.ks.p.k.map(keyframe => {
            if (keyframe.s) {
              return {
                ...keyframe,
                s: keyframe.s.map((val, i) => {
                  if (i === 0) return val - centerX + newWidth / 2;
                  if (i === 1) return val - centerY + newHeight / 2;
                  return val;
                })
              };
            }
            return keyframe;
          });
        } else {
          shape.ks.p.k = [
            shape.ks.p.k[0] - centerX + newWidth / 2,
            shape.ks.p.k[1] - centerY + newHeight / 2,
            shape.ks.p.k[2] || 0
          ];
        }
      }
    });
  }
  
  // Recursively adjust nested layers
  if (layer.layers) {
    layer.layers.forEach(adjustPositions);
  }
}

// Adjust all positions
data.layers.forEach(adjustPositions);

// Save the modified file
const backupPath = filePath + '.backup';
fs.copyFileSync(filePath, backupPath);
console.log('Backup saved to:', backupPath);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Updated frame size to:', newWidth, 'x', newHeight);
console.log('File updated successfully!');

