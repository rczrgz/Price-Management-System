import { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  TrendingUp,
  X,
  Save,
  Printer,
  Download,
  CheckCircle,
  ReceiptText
} from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction, Customer, Product, CustomerPrice } from '../types';

interface ReceiptData {
  receiptNumber: string;
  date: string;
  customerName: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  profit: number;
}

// ── Receipt component (also used for print) ──────────────────────────────────
function Receipt({ data, onClose, isNew = false }: { data: ReceiptData; onClose: () => void; isNew?: boolean }) {


  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=420,height=700');
    if (!win) return;
    // Use absolute URL so the popup window can resolve the image correctly
    const sigUrl = `${window.location.origin}/assets/signature.png`;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${data.receiptNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'IBM Plex Sans', sans-serif; background: #fff; padding: 24px; }
            .receipt-inner { max-width: 360px; margin: 0 auto; }
            .brand { text-align: center; margin-bottom: 20px; }
            .brand-name { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #111; }
            .brand-tag { font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
            hr.dashed { border: none; border-top: 1px dashed #ccc; margin: 14px 0; }
            hr.solid { border: none; border-top: 2px solid #111; margin: 14px 0; }
            .meta { font-size: 11px; color: #666; display: flex; justify-content: space-between; margin-bottom: 4px; font-family: 'IBM Plex Mono', monospace; }
            .section-label { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 8px; font-family: 'IBM Plex Mono', monospace; }
            .customer-name { font-size: 15px; font-weight: 600; color: #111; margin-bottom: 16px; }
            .line-item { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
            .item-name { font-size: 13px; color: #222; font-weight: 500; }
            .item-sku { font-size: 10px; color: #aaa; font-family: 'IBM Plex Mono', monospace; }
            .item-price { font-size: 13px; color: #111; font-weight: 600; font-family: 'IBM Plex Mono', monospace; text-align: right; }
            .qty-row { font-size: 11px; color: #888; font-family: 'IBM Plex Mono', monospace; margin-bottom: 12px; }
            .total-row { display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #555; }
            .total-value { font-size: 22px; font-weight: 700; color: #111; font-family: 'IBM Plex Mono', monospace; }
            .sig-block { margin-top: 20px; display: flex; flex-direction: column; align-items: flex-end; }
            .sig-img { height: 56px; max-width: 180px; object-fit: contain; display: block; }
            .sig-line { border-bottom: 1px solid #333; width: 180px; margin-top: 2px; }
            .sig-label { font-size: 10px; color: #aaa; font-family: 'IBM Plex Mono', monospace; letter-spacing: 1px; margin-top: 4px; }
            .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #bbb; font-family: 'IBM Plex Mono', monospace; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="receipt-inner">
            <div class="brand">
              <div class="brand-name">MY STORE</div>
              <div class="brand-tag">Official Receipt</div>
            </div>
            <hr class="solid"/>
            <div class="meta"><span>RECEIPT</span><span>#${data.receiptNumber}</span></div>
            <div class="meta"><span>DATE</span><span>${data.date}</span></div>
            <hr class="dashed"/>
            <div class="section-label">Bill To</div>
            <div class="customer-name">${data.customerName}</div>
            <div class="section-label">Items</div>
            <div class="line-item">
              <div>
                <div class="item-name">${data.productName}</div>
                ${data.sku ? `<div class="item-sku">SKU: ${data.sku}</div>` : ''}
              </div>
              <div class="item-price">$${data.unitPrice.toFixed(2)}</div>
            </div>
            <div class="qty-row">Qty: ${data.quantity} &times; $${data.unitPrice.toFixed(2)}</div>
            <hr class="dashed"/>
            <div class="total-row">
              <span class="total-label">Total</span>
              <span class="total-value">$${data.total.toFixed(2)}</span>
            </div>
            <hr class="solid"/>
            <div class="sig-block">
              <img class="sig-img" src="${sigUrl}" alt="Signature" />
              <div class="sig-line"></div>
              <div class="sig-label">AUTHORIZED SIGNATURE</div>
            </div>
            <div class="footer">Thank you for your business!</div>
          </div>
          <script>
            // Print only after signature image has loaded
            const img = document.querySelector('.sig-img');
            if (img.complete) { window.print(); window.close(); }
            else { img.onload = () => { window.print(); window.close(); }; }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleDownload = () => {
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <title>Receipt #${data.receiptNumber}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'IBM Plex Sans',sans-serif; background:#fff; padding:32px; }
      .receipt-inner { max-width:360px; margin:0 auto; }
      .brand { text-align:center; margin-bottom:20px; }
      .brand-name { font-family:'IBM Plex Mono',monospace; font-size:22px; font-weight:700; color:#111; }
      .brand-tag { font-size:11px; color:#888; letter-spacing:2px; text-transform:uppercase; margin-top:2px; }
      hr.dashed { border:none; border-top:1px dashed #ccc; margin:14px 0; }
      hr.solid { border:none; border-top:2px solid #111; margin:14px 0; }
      .meta { font-size:11px; color:#666; display:flex; justify-content:space-between; margin-bottom:4px; font-family:'IBM Plex Mono',monospace; }
      .section-label { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#aaa; margin-bottom:8px; }
      .customer-name { font-size:15px; font-weight:600; color:#111; margin-bottom:16px; }
      .line-item { display:flex; justify-content:space-between; margin-bottom:6px; }
      .item-name { font-size:13px; font-weight:500; color:#222; }
      .item-sku { font-size:10px; color:#aaa; font-family:'IBM Plex Mono',monospace; }
      .item-price { font-size:13px; font-weight:600; font-family:'IBM Plex Mono',monospace; }
      .qty-row { font-size:11px; color:#888; font-family:'IBM Plex Mono',monospace; margin-bottom:12px; }
      .total-row { display:flex; justify-content:space-between; align-items:center; }
      .total-label { font-size:12px; font-weight:600; text-transform:uppercase; color:#555; }
      .total-value { font-size:22px; font-weight:700; font-family:'IBM Plex Mono',monospace; }
      .sig-block { margin-top:20px; display:flex; flex-direction:column; align-items:flex-end; }
      .sig-img { height:56px; max-width:180px; object-fit:contain; display:block; }
      .sig-line { border-bottom:1px solid #333; width:180px; margin-top:2px; }
      .sig-label { font-size:10px; color:#aaa; font-family:'IBM Plex Mono',monospace; margin-top:4px; }
      .footer { text-align:center; margin-top:24px; font-size:10px; color:#bbb; font-family:'IBM Plex Mono',monospace; }
    </style>
  </head>
  <body>
    <div class="receipt-inner">
      <div class="brand">
        <div class="brand-name">MY STORE</div>
        <div class="brand-tag">Official Receipt</div>
      </div>
      <hr class="solid"/>
      <div class="meta"><span>RECEIPT</span><span>#${data.receiptNumber}</span></div>
      <div class="meta"><span>DATE</span><span>${data.date}</span></div>
      <hr class="dashed"/>
      <div class="section-label">Bill To</div>
      <div class="customer-name">${data.customerName}</div>
      <div class="section-label">Items</div>
      <div class="line-item">
        <div><div class="item-name">${data.productName}</div>${data.sku ? `<div class="item-sku">SKU: ${data.sku}</div>` : ''}</div>
        <div class="item-price">$${data.unitPrice.toFixed(2)}</div>
      </div>
      <div class="qty-row">Qty: ${data.quantity} × $${data.unitPrice.toFixed(2)}</div>
      <hr class="dashed"/>
      <div class="total-row">
        <span class="total-label">Total</span>
        <span class="total-value">$${data.total.toFixed(2)}</span>
      </div>
      <hr class="solid"/>
      <div class="sig-block">
        <img class="sig-img" src="/assets/signature.png" alt="Signature" />
        <div class="sig-line"></div>
        <div class="sig-label">AUTHORIZED SIGNATURE</div>
      </div>
      <div class="footer">Thank you for your business!</div>
    </div>
  </body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${data.receiptNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${isNew ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          <div className={`flex items-center gap-2 ${isNew ? 'text-emerald-700' : 'text-slate-700'}`}>
            {isNew ? <CheckCircle size={20} /> : <ReceiptText size={20} />}
            <span className="font-bold text-sm">{isNew ? 'Sale Recorded!' : `Receipt #${data.receiptNumber}`}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="font-mono text-sm">
            {/* Brand */}
            <div className="text-center mb-5">
              <div className="text-xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>MY STORE</div>
              <div className="text-[10px] tracking-[3px] text-slate-400 uppercase mt-0.5">Official Receipt</div>
            </div>

            {/* Solid line */}
            <div className="border-t-2 border-slate-800 mb-3" />

            {/* Meta */}
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>RECEIPT</span><span className="font-bold text-slate-700">#{data.receiptNumber}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-3">
              <span>DATE</span><span>{data.date}</span>
            </div>

            {/* Dashed */}
            <div className="border-t border-dashed border-slate-300 mb-3" />

            {/* Customer */}
            <div className="text-[10px] font-bold tracking-[2px] uppercase text-slate-400 mb-1">Bill To</div>
            <div className="text-[15px] font-semibold text-slate-900 mb-4">{data.customerName}</div>

            {/* Items */}
            <div className="text-[10px] font-bold tracking-[2px] uppercase text-slate-400 mb-2">Items</div>
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="text-[13px] font-medium text-slate-800">{data.productName}</div>
                {data.sku && <div className="text-[10px] text-slate-400">SKU: {data.sku}</div>}
              </div>
              <div className="text-[13px] font-bold text-slate-800">${data.unitPrice.toFixed(2)}</div>
            </div>
            <div className="text-[11px] text-slate-400 mb-3">
              Qty: {data.quantity} × ${data.unitPrice.toFixed(2)}
            </div>

            {/* Dashed */}
            <div className="border-t border-dashed border-slate-300 mb-3" />

            {/* Total */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-[12px] font-bold uppercase tracking-wide text-slate-500">Total</span>
              <span className="text-[22px] font-black text-slate-900">${data.total.toFixed(2)}</span>
            </div>

            {/* Solid */}
            <div className="border-t-2 border-slate-800 mt-1 mb-4" />

            {/* Signature - bottom right */}
            <div className="mt-2 flex flex-col items-end">
              <img
                src="/assets/signature.png"
                alt="Authorized Signature"
                className="h-14 max-w-[180px] object-contain"
              />
              <div className="border-b border-slate-400 w-44 mt-1" />
              <div className="text-[10px] tracking-[1px] uppercase text-slate-400 mt-1">Authorized Signature</div>
            </div>

            {/* Footer */}
            <div className="text-center mt-5 text-[10px] tracking-[1px] text-slate-300 uppercase">
              Thank you for your business!
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 transition-all"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Transactions component ───────────────────────────────────────────────
export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isNewSale, setIsNewSale] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    quantity: 1,
    selling_price: 0,
    update_price_list: false
  });
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);

  useEffect(() => {
    fetchTransactions();
    fetch('/api/customers').then(res => res.json()).then(setCustomers);
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  useEffect(() => {
    if (formData.customer_id) {
      fetch(`/api/customer-prices/${formData.customer_id}`)
        .then(res => res.json())
        .then(setCustomerPrices);
    }
  }, [formData.customer_id]);

  useEffect(() => {
    if (formData.product_id) {
      const customPrice = customerPrices.find(cp => cp.product_id === parseInt(formData.product_id))?.custom_price;
      const defaultPrice = products.find(p => p.id === parseInt(formData.product_id))?.default_selling_price;
      setFormData(prev => ({
        ...prev,
        selling_price: customPrice || defaultPrice || 0
      }));
    }
  }, [formData.product_id, customerPrices]);

  const fetchTransactions = () => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(setTransactions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transactionPromise = fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: parseInt(formData.customer_id),
        product_id: parseInt(formData.product_id),
        quantity: formData.quantity,
        selling_price: formData.selling_price
      }),
    });

    const updatePricePromise = formData.update_price_list
      ? fetch('/api/customer-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: parseInt(formData.customer_id),
            product_id: parseInt(formData.product_id),
            custom_price: formData.selling_price
          }),
        })
      : Promise.resolve();

    Promise.all([transactionPromise, updatePricePromise]).then(([txRes]) => {
      fetchTransactions();
      setIsModalOpen(false);

      // Build receipt data
      const customer = customers.find(c => c.id === parseInt(formData.customer_id));
      const product = products.find(p => p.id === parseInt(formData.product_id));
      const receiptNumber = String(Date.now()).slice(-6);

      setIsNewSale(true);
      setReceipt({
        receiptNumber,
        date: format(new Date(), 'MMM dd, yyyy HH:mm'),
        customerName: customer?.name ?? 'Customer',
        productName: product?.name ?? 'Product',
        sku: (product as any)?.sku,
        quantity: formData.quantity,
        unitPrice: formData.selling_price,
        total: formData.quantity * formData.selling_price,
        profit: 0, // populate if your API returns profit
      });

      setFormData({ customer_id: '', product_id: '', quantity: 1, selling_price: 0, update_price_list: false });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Sales Transactions</h3>
          <p className="text-slate-500">Record and monitor your sales and profitability.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={20} />
          New Transaction
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sale</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-slate-400" />
                      {format(new Date(t.date), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{t.customer_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{t.product_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{t.quantity}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">${(t.selling_price * t.quantity).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">@ ${t.selling_price.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                      <TrendingUp size={14} />
                      ${t.profit.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setReceipt({
                        receiptNumber: String(t.id).padStart(6, '0'),
                        date: format(new Date(t.date), 'MMM dd, yyyy HH:mm'),
                        customerName: t.customer_name ?? 'Unknown Customer',
                        productName: t.product_name ?? 'Unknown Product',
                        sku: (t as any).sku,
                        quantity: t.quantity,
                        unitPrice: t.selling_price,
                        total: t.selling_price * t.quantity,
                        profit: t.profit,
                      })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <ReceiptText size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-lg font-bold text-slate-800">Record New Sale</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Customer</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  >
                    <option value="">Choose a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Product</label>
                  <select
                    required
                    disabled={!formData.customer_id}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:opacity-50"
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Selling Price ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="update_price"
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    checked={formData.update_price_list}
                    onChange={(e) => setFormData({...formData, update_price_list: e.target.checked})}
                  />
                  <label htmlFor="update_price" className="text-xs font-medium text-slate-600 cursor-pointer">
                    Update customer price list with this price
                  </label>
                </div>

                {formData.product_id && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-600 font-medium">Total Sale:</span>
                      <span className="text-indigo-900 font-bold">${(formData.quantity * formData.selling_price).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <Receipt
          data={receipt}
          isNew={isNewSale}
          onClose={() => { setReceipt(null); setIsNewSale(false); }}
        />
      )}
    </div>
  );
}