require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const openapi = require('./openapi');

const app = express();
const PORT = process.env.PORT || 3000;

// Si se define FRONTEND_URL solo se permite ese origen; si no, queda abierto (útil en desarrollo).
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API de Tiendita Maday en funcionamiento' }));
app.get("/swagger.json", (req, res) => res.json(openapi));
app.get("/api-docs", (req, res) => {
  res.type("html").send([
    "<!doctype html>",
    "<html lang=\"en\">",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "  <title>Tiendita Maday API Docs</title>",
    "  <link rel=\"stylesheet\" href=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css\">",
    "</head>",
    "<body>",
    "  <div id=\"swagger-ui\"></div>",
    "  <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js\"></script>",
    "  <script>",
    "    window.ui = SwaggerUIBundle({ url: \"/swagger.json\", dom_id: \"#swagger-ui\" });",
    "  </script>",
    "</body>",
    "</html>",
  ].join("\n"));
});
app.use('/api', routes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
