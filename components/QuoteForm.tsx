import React, { useState, useEffect } from 'react';
import type { Quote, Client, LineItem, CompanyProfile, Currency } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';

interface QuoteFormProps {
    quote: Quote | null;
    clients: Client[];
    onSave: (quote: Quote) => void;
    onCancel: () => void;
    companyProfile: CompanyProfile;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const QuoteForm: React.FC<QuoteFormProps> = ({ quote, clients, onSave, onCancel, companyProfile }) => {
    const createInitialState = (): Omit<Quote, 'id' | 'quoteNumber' | 'total' | 'subtotal' | 'taxAmount'> => ({
        client: clients[0],
        issueDate: getTodayDate(),
        expiryDate: getTodayDate(),
        items: [{ description: '', quantity: 1, rate: 0, total: 0, cost: 0 }],
        status: 'Draft',
        notes: '',
        currency: 'ZAR',
    });

    const [formData, setFormData] = useState(createInitialState);

    useEffect(() => {
        if (quote) {
            const clientInList = clients.find(c => c.id === quote.client.id) || clients[0];
            setFormData({ ...quote, client: clientInList });
        } else {
            setFormData(createInitialState());
        }
    }, [quote, clients]);

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedClient = clients.find(c => c.id === e.target.value);
        if (selectedClient) {
            setFormData({ ...formData, client: selectedClient });
        }
    };
    
    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...formData.items];
        const item = { ...newItems[index] };
        (item[field] as any) = value;

        if (field === 'quantity' || field === 'rate') {
            item.total = (typeof item.quantity === 'number' ? item.quantity : 0) * (typeof item.rate === 'number' ? item.rate : 0);
        }
        newItems[index] = item;
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, rate: 0, total: 0, cost: 0 }] });
    };

    const removeItem = (index: number) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    };

     const calculateTotals = () => {
        const subtotal = formData.items.reduce((acc, item) => acc + item.total, 0);
        const taxAmount = subtotal * (companyProfile.taxRate / 100);
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { subtotal, taxAmount, total } = calculateTotals();
        const quoteToSave: Quote = {
            ...formData,
            id: quote?.id || '',
            quoteNumber: quote?.quoteNumber || '',
            subtotal,
            taxAmount,
            total,
        };
        onSave(quoteToSave);
    };

    const totals = calculateTotals();
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: formData.currency }).format(amount);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">{quote ? 'Edit Quote' : 'Create Quote'}</h1>
                <div>
                    <Button type="button" variant="secondary" onClick={onCancel} className="mr-2">Cancel</Button>
                    <Button type="submit">Save Quote</Button>
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <select id="client" value={formData.client.id} onChange={handleClientChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm">
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <Input label="Issue Date" type="date" value={formData.issueDate} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                    <Input label="Expiry Date" type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                     <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select id="currency" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value as Currency })} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="ZAR">ZAR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                 </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center text-xs text-gray-500 font-medium px-1">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-1">Qty</div>
                        <div className="col-span-2">Rate</div>
                        <div className="col-span-2">Cost</div>
                        <div className="col-span-1 text-right">Total</div>
                        <div className="col-span-1"></div>
                    </div>
                    {formData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                                <Input placeholder="Service or Product" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                            </div>
                            <div className="col-span-1">
                                <Input type="number" placeholder="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))} />
                            </div>
                            <div className="col-span-2">
                                <Input type="number" placeholder="100.00" value={item.rate} onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value))} />
                            </div>
                            <div className="col-span-2">
                                <Input type="number" placeholder="50.00" value={item.cost || ''} onChange={e => handleItemChange(index, 'cost', parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="col-span-1 text-right font-medium">{formatCurrency(item.total)}</div>
                            <div className="col-span-1">
                                <Button type="button" variant="danger" onClick={() => removeItem(index)} className="!p-2">
                                    {ICONS.trash}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="secondary" onClick={addItem} className="mt-4">{ICONS.plus}Add Item</Button>
                
                 <div className="flex justify-end mt-6">
                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-800">{formatCurrency(totals.subtotal)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">Tax ({companyProfile.taxRate}%):</span>
                            <span className="font-medium text-gray-800">{formatCurrency(totals.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                            <span className="text-gray-800">Total:</span>
                            <span className="text-brand-primary">{formatCurrency(totals.total)}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </form>
    );
};
