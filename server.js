"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var vite_1 = require("vite");
var better_sqlite3_1 = require("better-sqlite3");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = path_1.default.dirname(__filename);
var db = new better_sqlite3_1.default('database.db');
db.pragma('foreign_keys = ON');
// Initialize Database
db.exec("\n  CREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    username TEXT UNIQUE,\n    password TEXT\n  );\n\n  CREATE TABLE IF NOT EXISTS customers (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    contact_person TEXT,\n    phone TEXT,\n    email TEXT,\n    address TEXT,\n    notes TEXT\n  );\n\n  CREATE TABLE IF NOT EXISTS products (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    sku TEXT UNIQUE,\n    cost_price REAL NOT NULL,\n    default_selling_price REAL NOT NULL,\n    category TEXT,\n    notes TEXT\n  );\n\n  DROP TABLE IF EXISTS transactions;\n  DROP TABLE IF EXISTS customer_prices;\n  \n  CREATE TABLE IF NOT EXISTS customer_prices (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    customer_id INTEGER NOT NULL,\n    product_id INTEGER NOT NULL,\n    custom_price REAL NOT NULL,\n    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,\n    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,\n    UNIQUE(customer_id, product_id)\n  );\n\n  CREATE TABLE IF NOT EXISTS transactions (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    customer_id INTEGER NOT NULL,\n    product_id INTEGER NOT NULL,\n    quantity INTEGER NOT NULL,\n    selling_price REAL NOT NULL,\n    cost_price_at_time REAL NOT NULL,\n    profit REAL NOT NULL,\n    date TEXT DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,\n    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE\n  );\n\n  -- Seed Data\n  INSERT OR IGNORE INTO customers (id, name, contact_person, phone, email, address, notes) VALUES \n  (1, 'Global Retailers', 'John Doe', '555-0101', 'john@global.com', '123 Commerce St, NY', 'VIP Customer'),\n  (2, 'Local Mart', 'Jane Smith', '555-0202', 'jane@localmart.com', '456 Market Ave, CA', 'Regular buyer');\n\n  INSERT OR IGNORE INTO products (id, name, sku, cost_price, default_selling_price, category, notes) VALUES \n  (1, 'Premium Coffee Beans', 'COF-001', 12.50, 25.00, 'Beverages', 'Organic Arabica'),\n  (2, 'Organic Green Tea', 'TEA-002', 8.00, 18.00, 'Beverages', 'High grade');\n\n  INSERT OR IGNORE INTO customer_prices (customer_id, product_id, custom_price) VALUES \n  (1, 1, 22.00),\n  (2, 2, 16.50);\n\n  INSERT OR IGNORE INTO transactions (customer_id, product_id, quantity, selling_price, cost_price_at_time, profit, date) VALUES \n  (1, 1, 10, 22.00, 12.50, 95.00, datetime('now', '-1 day')),\n  (2, 2, 5, 16.50, 8.00, 42.50, datetime('now', '-2 days')),\n  (1, 2, 20, 18.00, 8.00, 200.00, datetime('now', '-3 days'));\n");
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var app, PORT, vite;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    app = (0, express_1.default)();
                    PORT = 3000;
                    app.use(express_1.default.json());
                    // --- API Routes ---
                    // Customers
                    app.get('/api/customers', function (req, res) {
                        var customers = db.prepare('SELECT * FROM customers ORDER BY name ASC').all();
                        res.json(customers);
                    });
                    app.post('/api/customers', function (req, res) {
                        var _a = req.body, name = _a.name, contact_person = _a.contact_person, phone = _a.phone, email = _a.email, address = _a.address, notes = _a.notes;
                        var info = db.prepare('INSERT INTO customers (name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?)').run(name, contact_person, phone, email, address, notes);
                        res.json({ id: info.lastInsertRowid });
                    });
                    app.put('/api/customers/:id', function (req, res) {
                        var _a = req.body, name = _a.name, contact_person = _a.contact_person, phone = _a.phone, email = _a.email, address = _a.address, notes = _a.notes;
                        db.prepare('UPDATE customers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ? WHERE id = ?').run(name, contact_person, phone, email, address, notes, req.params.id);
                        res.json({ success: true });
                    });
                    app.delete('/api/customers/:id', function (req, res) {
                        try {
                            db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
                            res.json({ success: true });
                        }
                        catch (error) {
                            res.status(500).json({ error: error.message });
                        }
                    });
                    // Products
                    app.get('/api/products', function (req, res) {
                        var products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
                        res.json(products);
                    });
                    app.post('/api/products', function (req, res) {
                        var _a = req.body, name = _a.name, sku = _a.sku, cost_price = _a.cost_price, default_selling_price = _a.default_selling_price, category = _a.category, notes = _a.notes;
                        var info = db.prepare('INSERT INTO products (name, sku, cost_price, default_selling_price, category, notes) VALUES (?, ?, ?, ?, ?, ?)').run(name, sku, cost_price, default_selling_price, category, notes);
                        res.json({ id: info.lastInsertRowid });
                    });
                    app.put('/api/products/:id', function (req, res) {
                        var _a = req.body, name = _a.name, sku = _a.sku, cost_price = _a.cost_price, default_selling_price = _a.default_selling_price, category = _a.category, notes = _a.notes;
                        db.prepare('UPDATE products SET name = ?, sku = ?, cost_price = ?, default_selling_price = ?, category = ?, notes = ? WHERE id = ?').run(name, sku, cost_price, default_selling_price, category, notes, req.params.id);
                        res.json({ success: true });
                    });
                    app.delete('/api/products/:id', function (req, res) {
                        try {
                            db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
                            res.json({ success: true });
                        }
                        catch (error) {
                            res.status(500).json({ error: error.message });
                        }
                    });
                    // Customer Prices
                    app.get('/api/customer-prices/:customerId', function (req, res) {
                        var prices = db.prepare("\n      SELECT cp.*, p.name as product_name, p.sku as product_sku, p.default_selling_price\n      FROM customer_prices cp\n      JOIN products p ON cp.product_id = p.id\n      WHERE cp.customer_id = ?\n    ").all(req.params.customerId);
                        res.json(prices);
                    });
                    app.post('/api/customer-prices', function (req, res) {
                        var _a = req.body, customer_id = _a.customer_id, product_id = _a.product_id, custom_price = _a.custom_price;
                        db.prepare("\n      INSERT INTO customer_prices (customer_id, product_id, custom_price)\n      VALUES (?, ?, ?)\n      ON CONFLICT(customer_id, product_id) DO UPDATE SET custom_price = excluded.custom_price\n    ").run(customer_id, product_id, custom_price);
                        res.json({ success: true });
                    });
                    app.delete('/api/customer-prices/:customerId/:productId', function (req, res) {
                        try {
                            db.prepare('DELETE FROM customer_prices WHERE customer_id = ? AND product_id = ?').run(req.params.customerId, req.params.productId);
                            res.json({ success: true });
                        }
                        catch (error) {
                            res.status(500).json({ error: error.message });
                        }
                    });
                    // Transactions
                    app.get('/api/transactions', function (req, res) {
                        var transactions = db.prepare("\n      SELECT t.*, c.name as customer_name, p.name as product_name\n      FROM transactions t\n      JOIN customers c ON t.customer_id = c.id\n      JOIN products p ON t.product_id = p.id\n      ORDER BY t.date DESC\n      LIMIT 100\n    ").all();
                        res.json(transactions);
                    });
                    app.post('/api/transactions', function (req, res) {
                        var _a = req.body, customer_id = _a.customer_id, product_id = _a.product_id, quantity = _a.quantity, selling_price = _a.selling_price;
                        var product = db.prepare('SELECT cost_price FROM products WHERE id = ?').get(product_id);
                        var cost_price_at_time = product.cost_price;
                        var profit = (selling_price - cost_price_at_time) * quantity;
                        db.prepare("\n      INSERT INTO transactions (customer_id, product_id, quantity, selling_price, cost_price_at_time, profit)\n      VALUES (?, ?, ?, ?, ?, ?)\n    ").run(customer_id, product_id, quantity, selling_price, cost_price_at_time, profit);
                        res.json({ success: true });
                    });
                    // Dashboard Stats
                    // app.get('/api/dashboard/stats', (req, res) => {
                    //   const totalSales = db.prepare('SELECT SUM(selling_price * quantity) as total FROM transactions').get().total || 0;
                    //   const totalProfit = db.prepare('SELECT SUM(profit) as total FROM transactions').get().total || 0;
                    //   const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
                    //   const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
                    // Dashboard Stats
                    app.get('/api/dashboard/stats', function (req, res) {
                        var _a, _b, _c, _d;
                        var totalSales = ((_a = db.prepare('SELECT SUM(selling_price * quantity) as total FROM transactions').get()) === null || _a === void 0 ? void 0 : _a.total) || 0;
                        var totalProfit = ((_b = db.prepare('SELECT SUM(profit) as total FROM transactions').get()) === null || _b === void 0 ? void 0 : _b.total) || 0;
                        var customerCount = ((_c = db.prepare('SELECT COUNT(*) as count FROM customers').get()) === null || _c === void 0 ? void 0 : _c.count) || 0;
                        var productCount = ((_d = db.prepare('SELECT COUNT(*) as count FROM products').get()) === null || _d === void 0 ? void 0 : _d.count) || 0;
                        var topCustomers = db.prepare("\n      SELECT c.name, SUM(t.profit) as profit\n      FROM transactions t\n      JOIN customers c ON t.customer_id = c.id\n      GROUP BY t.customer_id\n      ORDER BY profit DESC\n      LIMIT 5\n    ").all();
                        var topProducts = db.prepare("\n      SELECT p.name, SUM(t.profit) as profit\n      FROM transactions t\n      JOIN products p ON t.product_id = p.id\n      GROUP BY t.product_id\n      ORDER BY profit DESC\n      LIMIT 5\n    ").all();
                        var profitOverTime = db.prepare("\n      SELECT date(date) as day, SUM(profit) as profit\n      FROM transactions\n      GROUP BY day\n      ORDER BY day ASC\n      LIMIT 30\n    ").all();
                        res.json({
                            totalSales: totalSales,
                            totalProfit: totalProfit,
                            customerCount: customerCount,
                            productCount: productCount,
                            topCustomers: topCustomers,
                            topProducts: topProducts,
                            profitOverTime: profitOverTime
                        });
                    });
                    if (!(process.env.NODE_ENV !== 'production')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, vite_1.createServer)({
                            server: { middlewareMode: true },
                            appType: 'spa',
                        })];
                case 1:
                    vite = _a.sent();
                    app.use(vite.middlewares);
                    return [3 /*break*/, 3];
                case 2:
                    app.use(express_1.default.static(path_1.default.join(__dirname, 'dist')));
                    app.get('*', function (req, res) {
                        res.sendFile(path_1.default.join(__dirname, 'dist', 'index.html'));
                    });
                    _a.label = 3;
                case 3:
                    app.listen(PORT, '0.0.0.0', function () {
                        console.log("Server running on http://localhost:".concat(PORT));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startServer();
