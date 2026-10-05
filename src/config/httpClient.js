// src/config/httpClient.js
const axios = require('axios');

const httpClient = axios.create({
  baseURL: 'https://www.vlr.gg',
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  },
});

module.exports = httpClient;