const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors({ origin: 'http://localhost:3000' }));

// Alternatively, you can configure it more specifically like this:
// app.use(cors({ origin: 'http://localhost:3000' }));

// Your routes
