require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Tiendita Maday API running' }));
app.use('/api', routes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
