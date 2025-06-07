const fs = require('fs');
const path = require('path');

/**
 * Recursively scan a folder for image files and return their web-accessible paths.
 * @param {string} folderPath - Absolute path to the folder to scan (e.g., path.join(__dirname, '../public/images/screenshots'))
 * @returns {string[]} Array of image paths relative to 'public' (e.g., '/images/screenshots/xxx.png')
 */
function scanImages(folderPath) {
  let results = [];
   // Return empty if directory does not exist
  if (!fs.existsSync(folderPath)) {
    return results;
  }

  const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
  const publicDir = path.resolve(__dirname, '../public');
  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
        // Convert absolute path to web path
        const rel = path.relative(publicDir, fullPath).replace(/\\/g, '/');
        results.push('/' + rel);
      }
    });
  }

  walk(folderPath);
  return results;
}

module.exports = scanImages;
