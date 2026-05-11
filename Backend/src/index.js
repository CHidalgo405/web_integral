require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Tiendita Maday API running' });
});

app.use('/api/products', productsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
