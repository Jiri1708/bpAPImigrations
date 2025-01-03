const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestLogger = require('./src/middleware/requestLogger');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/eshopapi_v1.yml'); // načtení OpenAPI specifikace
const addLinks = require('express-hateoas-links'); // Přidání balíčku express-hateoas-links
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);
app.use(addLinks); // Použití middleware

const router = express.Router();
// MW pro generování HATEOAS odkazů
const generateLinks = (entity, entityId, paths) => {
    const links = {};
    Object.keys(paths).forEach(path => {
      // Zde se kontroluje, zda cesta odpovídá vzoru definovanému ve swaggeru (např. /orders/{orderId}/cancel)
      if (path.includes(`{${entityId}}`)) {
        const cleanPath = path.replace(`{${entityId}}`, entity.id);
        // Pojmenujeme klíč podle segmentu cesty (např. "cancel", "orders" atd.)
        const key = cleanPath.split('/')[2] || cleanPath.split('/')[1];
        links[key] = cleanPath;
      }
    });
    return links;
  };
  router.get("/orders", (req, res) => {
    try {
      const orders = [
        { id: 101, totalPrice: 999, status: 'PROCESSING' },
        { id: 102, totalPrice: 1499, status: 'SHIPPED' }
      ];
      // Předáváme 'orderId', protože ve swaggeru je definováno {orderId}
      const response = orders.map(order => ({
        ...order,
        _links: generateLinks(order, 'orderId', swaggerDocument.paths)
      }));
      res.json(response).links({
        self: { href: '/orders' },
        create: { href: '/orders', method: 'POST' },
        cancel: { href: `/orders/${orders.id}/cancel`, method: 'POST' }
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
app.use('/api', router);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});