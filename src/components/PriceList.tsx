import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Tag, 
  Package, 
  Users, 
  ChevronRight,
  Save,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import type { Customer, Product, CustomerPrice } from '../types';

export default function PriceList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPrices, setCustomerPrices] = useState<CustomerPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/customers').then(res => res.json()).then(setCustomers);
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetch(`/api/customer-prices/${selectedCustomer.id}`)
        .then(res => res.json())
        .then(setCustomerPrices);
    }
  }, [selectedCustomer]);

  const handlePriceChange = (productId: number, price: number) => {
    if (!selectedCustomer) return;

    setSaving(productId);
    fetch('/api/customer-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: selectedCustomer.id,
        product_id: productId,
        custom_price: price
      }),
    }).then(() => {
      // Refresh prices
      fetch(`/api/customer-prices/${selectedCustomer.id}`)
        .then(res => res.json())
        .then(data => {
          setCustomerPrices(data);
          setTimeout(() => setSaving(null), 500);
        });
    });
  };

  const handleResetPrice = (productId: number) => {
    if (!selectedCustomer) return;
    
    fetch(`/api/customer-prices/${selectedCustomer.id}/${productId}`, {
      method: 'DELETE',
    }).then(async res => {
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset price');
      }
      fetch(`/api/customer-prices/${selectedCustomer.id}`)
        .then(res => res.json())
        .then(setCustomerPrices);
    }).catch(err => alert(err.message));
  };

  const getCustomPrice = (productId: number) => {
    return customerPrices.find(cp => cp.product_id === productId)?.custom_price;
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Customer Price List</h3>
          <p className="text-slate-500">Assign custom pricing for specific customers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Select Customer</h4>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group",
                    selectedCustomer?.id === customer.id 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                      selectedCustomer?.id === customer.id ? "bg-white/20" : "bg-indigo-100 text-indigo-700"
                    )}>
                      {customer.name.charAt(0)}
                    </div>
                    <span className="font-medium truncate">{customer.name}</span>
                  </div>
                  <ChevronRight size={16} className={cn(
                    "transition-transform",
                    selectedCustomer?.id === customer.id ? "translate-x-1" : "text-slate-300 group-hover:text-slate-400"
                  )} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price Management */}
        <div className="lg:col-span-2">
          {!selectedCustomer ? (
            <div className="glass-card h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Users size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">No Customer Selected</h4>
                <p className="text-slate-500 max-w-xs mx-auto">Please select a customer from the list to manage their custom product prices.</p>
              </div>
            </div>
          ) : (
            <div className="glass-card overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <Tag size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h4>
                      <p className="text-sm text-slate-500">Pricing Configuration</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center bg-white rounded-xl px-4 py-2 gap-2 border border-slate-200 focus-within:border-indigo-300 transition-all shadow-sm">
                  <Search size={18} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search products to set prices..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 sticky top-0 z-10">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Default Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => {
                      const customPrice = getCustomPrice(product.id);
                      const isCustom = customPrice !== undefined;
                      
                      return (
                        <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <Package size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{product.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm text-slate-500">${product.default_selling_price.toFixed(2)}</p>
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Standard</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-1 max-w-[140px]">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  className={cn(
                                    "w-full pl-6 pr-3 py-2 bg-white border rounded-xl text-sm outline-none transition-all",
                                    isCustom 
                                      ? "border-indigo-300 bg-indigo-50/50 font-bold text-indigo-700 ring-2 ring-indigo-500/10" 
                                      : "border-slate-200 text-slate-600 focus:border-indigo-300"
                                  )}
                                  placeholder={product.default_selling_price.toFixed(2)}
                                  value={customPrice !== undefined ? customPrice : ''}
                                  onChange={(e) => {
                                    // Local update for UI responsiveness
                                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                    const newPrices = [...customerPrices];
                                    const idx = newPrices.findIndex(cp => cp.product_id === product.id);
                                    if (idx > -1) {
                                      if (val === undefined) newPrices.splice(idx, 1);
                                      else newPrices[idx].custom_price = val;
                                    } else if (val !== undefined) {
                                      newPrices.push({ product_id: product.id, custom_price: val, customer_id: selectedCustomer.id, id: 0 });
                                    }
                                    setCustomerPrices(newPrices);
                                  }}
                                  onBlur={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                      handlePriceChange(product.id, val);
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                {saving === product.id ? (
                                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                ) : isCustom ? (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <button 
                                      onClick={() => handleResetPrice(product.id)}
                                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      title="Reset to default"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-300 font-bold uppercase">Default</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
