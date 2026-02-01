// db.js - simple JSON file read/write helper for mock persistence
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

async function readData(){
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeData(data){
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readData, writeData };
