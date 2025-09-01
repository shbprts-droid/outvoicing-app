import React, { useState, useCallback } from 'react';
import type { Expense, Client } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';
import { extractExpenseFromReceipt } from '../services/geminiService';

interface ExpenseListProps {
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    clients: Client[];
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, setExpenses, clients }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newExpense, setNewExpense] = useState<Partial<Omit<Expense, 'id'>>>({
        date: getTodayDate(),
        vendor: '',
        description: '',
        amount: 0,
        receiptImage: null,
        clientId: undefined
    });

    const handleReceiptUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setNewExpense(prev => ({...prev, receiptImage: reader.result as string}));
        };

        try {
            const info = await extractExpenseFromReceipt(file);
            setNewExpense(prev => ({
                ...prev,
                vendor: info.vendor || '',
                date: info.date || getTodayDate(),
                amount: info.amount || 0,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSaveExpense = () => {
        if (!newExpense.vendor || !newExpense.amount) {
            alert("Please fill in at least the vendor and amount.");
            return;
        }
        const expenseToAdd: Expense = {
            id: `exp-${Date.now()}`,
            date: newExpense.date || getTodayDate(),
            vendor: newExpense.vendor,
            description: newExpense.description || 'N/A',
            amount: newExpense.amount,
            receiptImage: newExpense.receiptImage || null,
            clientId: newExpense.clientId || undefined
        };
        setExpenses(prev => [...prev, expenseToAdd]);
        // Reset form
        setNewExpense({
            date: getTodayDate(), vendor: '', description: '', amount: 0, receiptImage: null, clientId: undefined
        });
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Log New Expense</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Upload a receipt and let AI extract the details, or fill them in manually.</p>
                        <input type="file" id="receipt-upload" className="hidden" accept="image/*" onChange={handleReceiptUpload} />
                        <Button onClick={() => document.getElementById('receipt-upload')?.click()} disabled={isLoading}>
                            {isLoading ? 'Analyzing Receipt...' : <>{ICONS.upload} Upload Receipt</>}
                        </Button>
                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                        <Input label="Vendor" name="vendor" value={newExpense.vendor || ''} onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})} />
                        <Input label="Date" name="date" type="date" value={newExpense.date || ''} onChange={(e) => setNewExpense({...newExpense, date: e.target.value})} />
                        <Input label="Amount (ZAR)" name="amount" type="number" value={newExpense.amount || ''} onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})} />
                    </div>
                     <Input label="Description" name="description" value={newExpense.description || ''} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Client (Optional)</label>
                         <select value={newExpense.clientId || ''} onChange={e => setNewExpense({...newExpense, clientId: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">-- No Client --</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveExpense}>Save Expense</Button>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Logged Expenses</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Vendor</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(exp => (
                                <tr key={exp.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{exp.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{exp.vendor}</td>
                                    <td className="px-6 py-4">{exp.description}</td>
                                    <td className="px-6 py-4">{clients.find(c => c.id === exp.clientId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(exp.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
