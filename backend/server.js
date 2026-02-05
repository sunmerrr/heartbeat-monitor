import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 50001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const adapter = new JSONFile('db.json');
const defaultData = { targets: [], history: [] };
const db = new Low(adapter, defaultData);

await db.read();
if (!db.data) {
  db.data = defaultData;
  await db.write();
}

// Routes
// 1. Get all targets
app.get('/api/targets', (req, res) => {
  res.json(db.data.targets);
});

// 2. Add target
app.post('/api/targets', async (req, res) => {
  const { url, name } = req.body;
  if (!url || !name) return res.status(400).json({ error: 'URL and Name required' });

  const newTarget = {
    id: Date.now().toString(),
    name,
    url,
    status: 'pending', // pending, up, down
    lastChecked: null,
    createdAt: new Date().toISOString()
  };

  db.data.targets.push(newTarget);
  await db.write();
  res.status(201).json(newTarget);
});

// 3. Get history (Limit to last 100 for now)
app.get('/api/history', (req, res) => {
  res.json(db.data.history.slice(-100));
});

// 4. Delete target
app.delete('/api/targets/:id', async (req, res) => {
  const { id } = req.params;
  db.data.targets = db.data.targets.filter(t => t.id !== id);
  await db.write();
  res.status(200).json({ success: true });
});

// Monitoring Loop (The Heartbeat)
const CHECK_INTERVAL = 60000; // 1 minute

async function checkTargets() {
  console.log('💓 Running heartbeat check...');
  const targets = db.data.targets;
  
  for (const target of targets) {
    const startTime = Date.now();
    let status = 'down';
    let responseTime = 0;

    try {
      const response = await fetch(target.url, { timeout: 5000 });
      if (response.ok) {
        status = 'up';
      }
      responseTime = Date.now() - startTime;
    } catch (error) {
      status = 'down';
      console.error(`Check failed for ${target.url}:`, error.message);
    }

    // Update Target State
    const previousStatus = target.status;
    target.status = status;
    target.lastChecked = new Date().toISOString();

    // Log History
    db.data.history.push({
      targetId: target.id,
      status,
      responseTime,
      timestamp: new Date().toISOString()
    });
    
    // Trim History (Keep last 1000 entries per run to prevent bloating)
    if (db.data.history.length > 5000) {
      db.data.history = db.data.history.slice(-5000);
    }

    // Alert Logic (Only on state change: UP -> DOWN)
    if (previousStatus === 'up' && status === 'down') {
      console.log(`🚨 ALERT: ${target.name} is DOWN!`);
      // TODO: Discord Webhook integration here
    } else if (previousStatus === 'down' && status === 'up') {
        console.log(`✅ RECOVERY: ${target.name} is back UP!`);
    }
  }

  await db.write();
}

// Start Monitoring
setInterval(checkTargets, CHECK_INTERVAL);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
