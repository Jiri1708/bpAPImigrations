// mockData.js
const generateRandomPrice = () => (Math.random() * 1000 + 10).toFixed(2);
const generateRandomStock = () => Math.floor(Math.random() * 100) + 1;
const generateRandomDate = () => {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
};

const initializeMockData = (db) => {
  // Categories
  const categories = [
    {
      id: "1",
      name: "Electronics",
      description: "Electronic devices and accessories",
    },
    { id: "2", name: "Books", description: "Physical and digital books" },
    { id: "3", name: "Clothing", description: "Apparel and accessories" },
    {
      id: "4",
      name: "Home & Garden",
      description: "Home improvement and garden supplies",
    },
    {
      id: "5",
      name: "Sports",
      description: "Sports equipment and accessories",
    },
  ];

  // Products (30+)
  const products = [
    // Electronics
    {
      id: "1",
      name: "Smartphone Pro",
      description: "Latest flagship model",
      price: 999.99,
      categoryId: "1",
      stock: 50,
    },
    {
      id: "2",
      name: "Gaming Laptop",
      description: "High-performance laptop",
      price: 1499.99,
      categoryId: "1",
      stock: 30,
    },
    {
      id: "3",
      name: "Wireless Earbuds",
      description: "Premium audio",
      price: 199.99,
      categoryId: "1",
      stock: 100,
    },
    {
      id: "4",
      name: "4K Monitor",
      description: "32-inch display",
      price: 399.99,
      categoryId: "1",
      stock: 25,
    },
    {
      id: "5",
      name: "Smart Watch",
      description: "Fitness tracking",
      price: 299.99,
      categoryId: "1",
      stock: 75,
    },
    {
      id: "6",
      name: "Tablet Pro",
      description: "12-inch screen",
      price: 799.99,
      categoryId: "1",
      stock: 40,
    },

    // Books
    {
      id: "7",
      name: "JavaScript Guide",
      description: "Programming",
      price: 39.99,
      categoryId: "2",
      stock: 150,
    },
    {
      id: "8",
      name: "Node.js Basics",
      description: "Backend development",
      price: 44.99,
      categoryId: "2",
      stock: 120,
    },
    {
      id: "9",
      name: "React Mastery",
      description: "Frontend development",
      price: 49.99,
      categoryId: "2",
      stock: 100,
    },
    {
      id: "10",
      name: "TypeScript handbook",
      description: "Types in JS",
      price: 34.99,
      categoryId: "2",
      stock: 80,
    },
    {
      id: "11",
      name: "REST API Design",
      description: "API development",
      price: 54.99,
      categoryId: "2",
      stock: 90,
    },
    {
      id: "12",
      name: "DevOps Guide",
      description: "Operations",
      price: 59.99,
      categoryId: "2",
      stock: 70,
    },

    // Clothing
    {
      id: "13",
      name: "Developer T-Shirt",
      description: "Cotton blend",
      price: 24.99,
      categoryId: "3",
      stock: 200,
    },
    {
      id: "14",
      name: "Code Hoodie",
      description: "Warm and comfy",
      price: 49.99,
      categoryId: "3",
      stock: 150,
    },
    {
      id: "15",
      name: "Debug Socks",
      description: "Comfortable socks",
      price: 12.99,
      categoryId: "3",
      stock: 300,
    },

    // Home & Garden
    {
      id: "16",
      name: "Desk Lamp",
      description: "LED lamp",
      price: 39.99,
      categoryId: "4",
      stock: 100,
    },
    {
      id: "17",
      name: "Ergonomic Chair",
      description: "Office chair",
      price: 299.99,
      categoryId: "4",
      stock: 50,
    },
    {
      id: "18",
      name: "Standing Desk",
      description: "Adjustable height",
      price: 499.99,
      categoryId: "4",
      stock: 30,
    },

    // Sports
    {
      id: "19",
      name: "Yoga Mat",
      description: "Non-slip surface",
      price: 29.99,
      categoryId: "5",
      stock: 150,
    },
    {
      id: "20",
      name: "Resistance Bands",
      description: "Set of 5",
      price: 19.99,
      categoryId: "5",
      stock: 200,
    },
  ];

  // Clients (30+)
  const clients = Array.from({ length: 30 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `Client ${i + 1}`,
    email: `client${i + 1}@example.com`,
    address: `${100 + i} Main Street`,
  }));

  // Orders (30+)
  const orders = Array.from({ length: 30 }, (_, i) => ({
    id: (i + 1).toString(),
    clientId: Math.floor(Math.random() * 30 + 1).toString(),
    items: [
      {
        productId: Math.floor(Math.random() * 20 + 1).toString(),
        quantity: Math.floor(Math.random() * 5 + 1),
      },
    ],
    status: ["pending", "completed", "cancelled"][
      Math.floor(Math.random() * 3)
    ],
    totalPrice: generateRandomPrice(),
    createdAt: generateRandomDate(),
  }));

  // Deliveries (30+)
  const deliveries = orders.map((order, i) => ({
    id: (i + 1).toString(),
    orderId: order.id,
    status: ["pending", "in_transit", "delivered"][
      Math.floor(Math.random() * 3)
    ],
    address: clients.find((c) => c.id === order.clientId).address,
    scheduledDate: generateRandomDate(),
  }));

  // Payments (30+)
  const payments = orders.map((order, i) => ({
    id: (i + 1).toString(),
    orderId: order.id,
    amount: order.totalPrice,
    status: ["pending", "completed", "failed"][Math.floor(Math.random() * 3)],
    method: ["credit_card", "paypal", "bank_transfer"][
      Math.floor(Math.random() * 3)
    ],
    createdAt: generateRandomDate(),
  }));

  // Clear existing data
  db.categories.clear();
  db.products.clear();
  db.clients.clear();
  db.orders.clear();
  db.deliveries.clear();
  db.payments.clear();

  // Load mock data
  categories.forEach((category) => db.categories.set(category.id, category));
  products.forEach((product) => db.products.set(product.id, product));
  clients.forEach((client) => db.clients.set(client.id, client));
  orders.forEach((order) => db.orders.set(order.id, order));
  deliveries.forEach((delivery) => db.deliveries.set(delivery.id, delivery));
  payments.forEach((payment) => db.payments.set(payment.id, payment));
};

module.exports = initializeMockData;
