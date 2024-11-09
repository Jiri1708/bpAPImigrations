// mockServer.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./api/eshopapi_v1.yml"); // Load your OpenAPI spec
const initializeMockData = require("./src/utils/mockData");
const { logger, requestLogger } = require("./src/middleware/logger");
const { v4: uuidv4 } = require("uuid");
const { authMiddleware, authRouter } = require("./src/middleware/auth");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(requestLogger);

// Serve Swagger UI
app.use(
  "/api-docs",
  (req, res, next) => {
    const protocol = req.protocol;
    const host = req.get("host");

    const dynamicSwaggerDoc = JSON.parse(JSON.stringify(swaggerDocument));

    // Update server URL and auth endpoints
    dynamicSwaggerDoc.servers = [
      {
        url: `${protocol}://${host}`,
        variables: {
          protocol: {
            enum: ["http", "https"],
            default: protocol,
          },
          host: {
            default: host,
          },
        },
      },
    ];

    // Update OAuth2 endpoints
    if (
      dynamicSwaggerDoc.components &&
      dynamicSwaggerDoc.components.securitySchemes &&
      dynamicSwaggerDoc.components.securitySchemes.OIDC &&
      dynamicSwaggerDoc.components.securitySchemes.OIDC.flows &&
      dynamicSwaggerDoc.components.securitySchemes.OIDC.flows.authorizationCode
    ) {
      dynamicSwaggerDoc.components.securitySchemes.OIDC.flows.authorizationCode.authorizationUrl = `${protocol}://${host}/auth/oauth2/authorize`;
      dynamicSwaggerDoc.components.securitySchemes.OIDC.flows.authorizationCode.tokenUrl = `${protocol}://${host}/auth/oauth2/token`;
    }

    req.swaggerDoc = dynamicSwaggerDoc;
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: {
      displayRequestDuration: true,
    },
    explorer: true,
  })
);

// In-memory storage
const db = {
  products: new Map(),
  categories: new Map(),
  orders: new Map(),
  deliveries: new Map(),
  clients: new Map(),
  payments: new Map(),
};

// Enhanced error handling
app.use((err, req, res, next) => {
  logger.error("Error occurred", {
    requestId: req.requestId,
    error: err,
  });

  // Format error response according to OpenAPI spec
  const errorResponse = {
    error: err.message || "Internal Server Error",
  };

  // Set appropriate status code
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json(errorResponse);
});

// Initialize data and start server
initializeMockData(db);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const products = Array.from(db.products.values());
    logger.debug("Fetching all products", { count: products.length });

    const response = products.map((product) => ({
      ...product,
      _links: {
        self: `/products/${product.id}`,
        category: `/categories/${product.categoryId}`,
      },
    }));
    res.json(response);
  } catch (error) {
    logger.error("Error fetching products", { error });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add other product routes...

module.exports = router;
