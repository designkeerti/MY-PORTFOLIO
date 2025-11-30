#!/usr/bin/env node

/**
 * GIF to MP4 Converter using FFmpeg
 * 
 * Requirements:
 * - ffmpeg must be installed
 *   Mac: brew install ffmpeg
 *   Windows: Download from https://ffmpeg.org/download.html
 *   Linux: sudo apt install ffmpeg
 * 
 * Usage:
 * node convert-gifs.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gifUrls = [
  "https://framerusercontent.com/images/APEe8vAHJA8qvtT1UXxvKE2CA.gif",
  "https://framerusercontent.com/images/yXdMcYJicU7xfxsBmQJEYCf9H1c.gif",
  "https://framerusercontent.com/images/yvCOXE3FsehpZbAYAz4FgDbfhUc.gif",
  "https://framerusercontent.com/images/4ZbxNsQP7oZnAAYRONbYDwKJTc.gif",
  "https://framerusercontent.com/images/WoEzU6rPsJpT06fwcGi3b2IWWSE.gif",
  "https://framerusercontent.com/images/l7qUhfDxVpjSSGzjvXC3v2pMTIo.gif"
];

const outputDir = path.join(__dirname, 'public', 'videos');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

function convertGifToMp4(gifPath, mp4Path) {
  // FFmpeg command optimized for web: preserves original aspect ratio
  // Scales to max 260 width or 250 height while maintaining aspect ratio
  const command = `ffmpeg -i "${gifPath}" -vf "scale='min(260,iw)':'min(250,ih)':force_original_aspect_ratio=decrease" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart -an "${mp4Path}"`;
  
  return execAsync(command);
}

async function convertAll() {
  console.log('Starting GIF to MP4 conversion...\n');
  
  // Check if ffmpeg is installed
  try {
    await execAsync('ffmpeg -version');
  } catch (error) {
    console.error('❌ Error: ffmpeg is not installed!');
    console.error('\nInstall it:');
    console.error('  Mac:     brew install ffmpeg');
    console.error('  Windows: Download from https://ffmpeg.org/download.html');
    console.error('  Linux:   sudo apt install ffmpeg');
    process.exit(1);
  }
  
  for (let i = 0; i < gifUrls.length; i++) {
    const url = gifUrls[i];
    const filename = path.basename(url);
    const gifPath = path.join(outputDir, filename);
    const mp4Path = path.join(outputDir, filename.replace('.gif', '.mp4'));
    
    try {
      console.log(`[${i + 1}/${gifUrls.length}] Downloading ${filename}...`);
      await downloadFile(url, gifPath);
      
      console.log(`[${i + 1}/${gifUrls.length}] Converting to MP4...`);
      await convertGifToMp4(gifPath, mp4Path);
      
      // Delete the GIF after conversion to save space
      fs.unlinkSync(gifPath);
      
      console.log(`[${i + 1}/${gifUrls.length}] ✓ Converted: ${path.basename(mp4Path)}\n`);
    } catch (error) {
      console.error(`[${i + 1}/${gifUrls.length}] ✗ Error: ${error.message}\n`);
    }
  }
  
  console.log('✅ Conversion complete!');
  console.log(`📁 Videos saved to: ${outputDir}`);
  console.log('\n📝 Next steps:');
  console.log('1. Update video URLs in src/components/Ticker.tsx');
  console.log('2. Or upload MP4s to your CDN and update URLs');
}

convertAll();

