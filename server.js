// server.js - Express API for Landify demo
const express = require('express');
const cors = require('cors');
const { readData, writeData } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, env: 'demo' }));

// Search / List plots
// Supports query params: location, venture, minArea, maxArea, minPrice, maxPrice
app.get('/api/plots', async (req, res) => {
  try{
    const data = await readData();
    let plots = data.plots || [];
    const { location, venture, minArea, maxArea, minPrice, maxPrice } = req.query;
    if(location){
      const q = location.toLowerCase();
      plots = plots.filter(p => p.location.toLowerCase().includes(q) || p.venture.toLowerCase().includes(q));
    }
    if(venture){
      plots = plots.filter(p => p.venture === venture);
    }
    if(minArea){
      plots = plots.filter(p => p.area_sq_yards >= Number(minArea));
    }
    if(maxArea){
      plots = plots.filter(p => p.area_sq_yards <= Number(maxArea));
    }
    if(minPrice){
      plots = plots.filter(p => p.price >= Number(minPrice));
    }
    if(maxPrice){
      plots = plots.filter(p => p.price <= Number(maxPrice));
    }
    res.json({ count: plots.length, plots });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to load plots' });
  }
});

// Add a new plot (simple mock persistence)
app.post('/api/plots', async (req, res) => {
  try{
    const payload = req.body;
    if(!payload || !payload.location || !payload.price) return res.status(400).json({ error: 'location and price required' });
    const data = await readData();
    const plots = data.plots || [];
    const nextId = plots.reduce((m,p) => Math.max(m, p.id || 0), 0) + 1;
    const newPlot = Object.assign({ id: nextId }, payload);
    plots.push(newPlot);
    data.plots = plots;
    await writeData(data);
    res.status(201).json(newPlot);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to add plot' });
  }
});

// List ventures
app.get('/api/ventures', async (req, res) => {
  try{
    const data = await readData();
    res.json({ ventures: data.ventures || [] });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to load ventures' });
  }
});

// Venture details by name (case-sensitive match)
app.get('/api/ventures/:name', async (req, res) => {
  try{
    const name = req.params.name;
    const data = await readData();
    const venture = (data.ventures || []).find(v => v.name === name);
    if(!venture) return res.status(404).json({ error: 'Venture not found' });
    // include related plots
    const related = (data.plots || []).filter(p => p.venture === venture.name);
    res.json({ venture, plots: related });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to load venture' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`API server running on http://localhost:${PORT}`));
