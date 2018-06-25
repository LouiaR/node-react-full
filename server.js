const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello Bonjour');
})

const port = process.env.Port || 5000;

app.listen(port, () => console.log(`Server running at ${port}`))