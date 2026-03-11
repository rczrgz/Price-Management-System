import { useState, useEffect } from 'react';
import { 
  Search, 
  ReceiptText, 
  Plus, 
  Calendar, 
  User, 
  Package, 
  DollarSign, 
  TrendingUp,
  X,
  Save,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import type { Transaction, Customer, Product, CustomerPrice } from '../types';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

    Promise.all([transactionPromise, updatePricePromise]).then(() => {
      fetchTransactions();
      setIsModalOpen(false);
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
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
    </div>
  );
}
