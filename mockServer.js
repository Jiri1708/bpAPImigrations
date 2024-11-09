// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./eshopapi_v1.yml"); // Load your OpenAPI spec
const initializeMockData = require("./mockData");
const { logger, requestLogger } = require("./logger");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger); // Add request logger middleware

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// In-memory storage
const db = {
  products: new Map(),
  categories: new Map(),
  orders: new Map(),
  deliveries: new Map(),
  clients: new Map(),
  payments: new Map(),
};

// Routes
const productsRouter = express.Router();

// GET /products
productsRouter.get("/", (req, res) => {
  try {
    const products = Array.from(db.products.values());
    logger.debug({
      requestId: req.requestId,
      message: "Fetching all products",
      count: products.length,
    });

    const response = products.map((product) => ({
      ...product,
      _links: {
        self: `/products/${product.id}`,
        category: `/categories/${product.categoryId}`,
      },
    }));
    res.json(response);
  } catch (error) {
    logger.error({
      requestId: req.requestId,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /products/:id
productsRouter.get("/:id", (req, res) => {
  const product = db.products.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  const response = {
    ...product,
    _links: {
      self: `/products/${product.id}`,
      category: `/categories/${product.categoryId}`,
    },
  };
  res.json(response);
});

// POST /products
productsRouter.post("/", (req, res) => {
  const id = Date.now().toString();
  const product = {
    id,
    ...req.body,
  };
  db.products.set(id, product);
  const response = {
    ...product,
    _links: {
      self: `/products/${id}`,
      category: `/categories/${product.categoryId}`,
    },
  };
  res.status(201).json(response);
});

// Orders router
const ordersRouter = express.Router();

// GET /orders
ordersRouter.get("/", (req, res) => {
  const orders = Array.from(db.orders.values());
  const response = orders.map((order) => ({
    ...order,
    _links: {
      self: `/orders/${order.id}`,
      cancel: `/orders/${order.id}/cancel`,
    },
  }));
  res.json(response);
});

// POST /orders
ordersRouter.post("/", (req, res) => {
  const id = Date.now().toString();
  const order = {
    id,
    status: "created",
    ...req.body,
  };
  db.orders.set(id, order);
  const response = {
    ...order,
    _links: {
      self: `/orders/${id}`,
      cancel: `/orders/${id}/cancel`,
    },
  };
  res.status(201).json(response);
});

// POST /orders/:id/cancel
ordersRouter.post("/:id/cancel", (req, res) => {
  const order = db.orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  order.status = "cancelled";
  db.orders.set(req.params.id, order);
  res.json({ message: "Order cancelled" });
});

// Deliveries router
const deliveriesRouter = express.Router();

// POST /deliveries
deliveriesRouter.post("/", (req, res) => {
  const id = Date.now().toString();
  const delivery = {
    id,
    status: "scheduled",
    ...req.body,
  };
  db.deliveries.set(id, delivery);
  const response = {
    ...delivery,
    _links: {
      self: `/deliveries/${id}`,
      cancel: `/deliveries/${id}/cancel`,
    },
  };
  res.status(201).json(response);
});

// Register routes
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/deliveries", deliveriesRouter);

// Enhanced error handling
app.use((err, req, res, next) => {
  logger.error("Error occurred", {
    requestId: req.requestId,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    request: {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
    },
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.requestId,
  });
});

// Initialize data and start server
initializeMockData(db);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
