const files = JSON.parse(open("../helpers/files.txt"))

function getRandomFile() {
  return files[Math.floor(Math.random() * files.length)];
}

function getRandomURL(serverUrl = "http://localhost:3000") {
  return `${serverUrl}/${getRandomFile()}`;
}

module.exports = {getRandomFile, getRandomURL, files}