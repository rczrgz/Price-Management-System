import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');
db.pragma('foreign_keys = ON');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    cost_price REAL NOT NULL,
    default_selling_price REAL NOT NULL,
    category TEXT,
    notes TEXT
  );

  DROP TABLE IF EXISTS transactions;
  DROP TABLE IF EXISTS customer_prices;
  
  CREATE TABLE IF NOT EXISTS customer_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    custom_price REAL NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(customer_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    selling_price REAL NOT NULL,
    cost_price_at_time REAL NOT NULL,
    profit REAL NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  -- Seed Data
  INSERT OR IGNORE INTO customers (id, name, contact_person, phone, email, address, notes) VALUES 
  (1, 'Global Retailers', 'John Doe', '555-0101', 'john@global.com', '123 Commerce St, NY', 'VIP Customer'),
  (2, 'Local Mart', 'Jane Smith', '555-0202', 'jane@localmart.com', '456 Market Ave, CA', 'Regular buyer');

  INSERT OR IGNORE INTO products (id, name, sku, cost_price, default_selling_price, category, notes) VALUES 
  (1, 'Premium Coffee Beans', 'COF-001', 12.50, 25.00, 'Beverages', 'Organic Arabica'),
  (2, 'Organic Green Tea', 'TEA-002', 8.00, 18.00, 'Beverages', 'High grade');

  INSERT OR IGNORE INTO customer_prices (customer_id, product_id, custom_price) VALUES 
  (1, 1, 22.00),
  (2, 2, 16.50);

  INSERT OR IGNORE INTO transactions (customer_id, product_id, quantity, selling_price, cost_price_at_time, profit, date) VALUES 
  (1, 1, 10, 22.00, 12.50, 95.00, datetime('now', '-1 day')),
  (2, 2, 5, 16.50, 8.00, 42.50, datetime('now', '-2 days')),
  (1, 2, 20, 18.00, 8.00, 200.00, datetime('now', '-3 days'));
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Customers
  app.get('/api/customers', (req, res) => {
    const customers = db.prepare('SELECT * FROM customers ORDER BY name ASC').all();
    res.json(customers);
  });

  app.post('/api/customers', (req, res) => {
    const { name, contact_person, phone, email, address, notes } = req.body;
    const info = db.prepare('INSERT INTO customers (name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?)').run(name, contact_person, phone, email, address, notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/customers/:id', (req, res) => {
    const { name, contact_person, phone, email, address, notes } = req.body;
    db.prepare('UPDATE customers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ? WHERE id = ?').run(name, contact_person, phone, email, address, notes, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/customers/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Products
  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const { name, sku, cost_price, default_selling_price, category, notes } = req.body;
    const info = db.prepare('INSERT INTO products (name, sku, cost_price, default_selling_price, category, notes) VALUES (?, ?, ?, ?, ?, ?)').run(name, sku, cost_price, default_selling_price, category, notes);
    res.json({ id: info.lastInsertRowid });
  });

  app.put('/api/products/:id', (req, res) => {
    const { name, sku, cost_price, default_selling_price, category, notes } = req.body;
    db.prepare('UPDATE products SET name = ?, sku = ?, cost_price = ?, default_selling_price = ?, category = ?, notes = ? WHERE id = ?').run(name, sku, cost_price, default_selling_price, category, notes, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer Prices
  app.get('/api/customer-prices/:customerId', (req, res) => {
    const prices = db.prepare(`
      SELECT cp.*, p.name as product_name, p.sku as product_sku, p.default_selling_price
      FROM customer_prices cp
      JOIN products p ON cp.product_id = p.id
      WHERE cp.customer_id = ?
    `).all(req.params.customerId);
    res.json(prices);
  });

  app.post('/api/customer-prices', (req, res) => {
    const { customer_id, product_id, custom_price } = req.body;
    db.prepare(`
      INSERT INTO customer_prices (customer_id, product_id, custom_price)
      VALUES (?, ?, ?)
      ON CONFLICT(customer_id, product_id) DO UPDATE SET custom_price = excluded.custom_price
    `).run(customer_id, product_id, custom_price);
    res.json({ success: true });
  });

  app.delete('/api/customer-prices/:customerId/:productId', (req, res) => {
    try {
      db.prepare('DELETE FROM customer_prices WHERE customer_id = ? AND product_id = ?').run(req.params.customerId, req.params.productId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Transactions
  app.get('/api/transactions', (req, res) => {
    const transactions = db.prepare(`
      SELECT t.*, c.name as customer_name, p.name as product_name
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      JOIN products p ON t.product_id = p.id
      ORDER BY t.date DESC
      LIMIT 100
    `).all();
    res.json(transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const { customer_id, product_id, quantity, selling_price } = req.body;
    const product = db.prepare('SELECT cost_price FROM products WHERE id = ?').get(product_id) as {cost_price: number};
    const cost_price_at_time = product.cost_price;
    const profit = (selling_price - cost_price_at_time) * quantity;

    db.prepare(`
      INSERT INTO transactions (customer_id, product_id, quantity, selling_price, cost_price_at_time, profit)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(customer_id, product_id, quantity, selling_price, cost_price_at_time, profit);
    res.json({ success: true });
  });

  // Dashboard Stats
  // app.get('/api/dashboard/stats', (req, res) => {
  //   const totalSales = db.prepare('SELECT SUM(selling_price * quantity) as total FROM transactions').get().total || 0;
  //   const totalProfit = db.prepare('SELECT SUM(profit) as total FROM transactions').get().total || 0;
  //   const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  //   const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
// Dashboard Stats
    app.get('/api/dashboard/stats', (req, res) => {
      const totalSales = (db.prepare('SELECT SUM(selling_price * quantity) as total FROM transactions').get() as any)?.total || 0;
      const totalProfit = (db.prepare('SELECT SUM(profit) as total FROM transactions').get() as any)?.total || 0;
      const customerCount = (db.prepare('SELECT COUNT(*) as count FROM customers').get() as any)?.count || 0;
      const productCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any)?.count || 0;

    const topCustomers = db.prepare(`
      SELECT c.name, SUM(t.profit) as profit
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      GROUP BY t.customer_id
      ORDER BY profit DESC
      LIMIT 5
    `).all();

    const topProducts = db.prepare(`
      SELECT p.name, SUM(t.profit) as profit
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      GROUP BY t.product_id
      ORDER BY profit DESC
      LIMIT 5
    `).all();

    const profitOverTime = db.prepare(`
      SELECT date(date) as day, SUM(profit) as profit
      FROM transactions
      GROUP BY day
      ORDER BY day ASC
      LIMIT 30
    `).all();

    res.json({
      totalSales,
      totalProfit,
      customerCount,
      productCount,
      topCustomers,
      topProducts,
      profitOverTime
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
