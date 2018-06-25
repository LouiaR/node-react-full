const express =require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json({
  greet: 'Bonjour users'
}));

module.exports = router;