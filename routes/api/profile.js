const express =require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json({
  greet: 'Bonjour profile'
}));

module.exports = router;