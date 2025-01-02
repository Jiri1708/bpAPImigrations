const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const requestLogger = require('./src/middleware/requestLogger');
const app = express();
const hateoasMiddleware = require('./src/middleware/hateoasMiddleware'); // Import middleware

app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);
app.use(hateoasMiddleware); // Použití middleware

const router = express.Router();

router.get('/orders', (req, res) => {
  try {
    const orders = [
      { id: 101, totalPrice: 999, status: 'PROCESSING' },
      { id: 102, totalPrice: 1499, status: 'SHIPPED' }
    ];
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use('/api', router);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});