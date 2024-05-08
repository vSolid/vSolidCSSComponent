const fs = require("fs");
const path = require("path");

function getAllFilesInFolder(folderPath, serverRootPath) {
  const files = [];
  function traverseFolder(folderPath) {
    const items = fs.readdirSync(folderPath);
    items.forEach(item => {
      const itemPath = path.join(folderPath, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        traverseFolder(itemPath);
      } else {
        if (itemPath.endsWith('$.ttl')) {
          files.push(path.relative(serverRootPath, itemPath).replace(/\\/g, '/').replace('$.ttl', ''));
        }
      }
    });
  }

  traverseFolder(folderPath);
  return files;
}

module.exports = {getAllFilesInFolder}