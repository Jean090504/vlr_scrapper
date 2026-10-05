// src/app.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use((err, req, res, next) => {
  console.error('[Error]:', err.message);
  res.status(500).json({ success: false, error: err.message });
});

module.exports = app;