
import React from 'react';
import type { Quote } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

interface QuoteListProps {
    quotes: Quote[];
    onEdit: (quote: Quote) => void;
    onCreateNew: () => void;
    onConvertToInvoice: (quote: Quote) => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({ quotes, onEdit, onCreateNew, onConvertToInvoice }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
    };
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
                <Button onClick={onCreateNew}>
                    {ICONS.plus}
                    New Quote
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Quotes</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Quote #</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Expiry Date</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(quote => (
                                <tr key={quote.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>{quote.status}</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{quote.quoteNumber}</td>
                                    <td className="px-6 py-4">{quote.client.name}</td>
                                    <td className="px-6 py-4">{quote.expiryDate}</td>
                                    <td className="px-6 py-4">{formatCurrency(quote.total)}</td>
                                    <td className="px-6 py-4 space-x-2 flex items-center">
                                        <Button variant="primary" onClick={() => onConvertToInvoice(quote)} className="!text-xs !py-1 !px-2">Convert to Invoice</Button>
                                        <button onClick={() => onEdit(quote)} className="font-medium text-brand-secondary hover:underline">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
};
