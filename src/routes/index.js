const express = require('express');
const router = express.Router();
const path = require('path');

// For SPA: serve index.html for any unknown route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = router;
