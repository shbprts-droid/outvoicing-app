
import React from 'react';
import type { Invoice } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

interface InvoiceListProps {
    invoices: Invoice[];
    onView: (invoice: Invoice) => void;
    onCreateNew: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onView, onCreateNew }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
    };
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                <Button onClick={onCreateNew}>
                    {ICONS.plus}
                    New Invoice
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Invoice #</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Due Date</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Badge status={invoice.status} />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4">{invoice.client.name}</td>
                                    <td className="px-6 py-4">{invoice.dueDate}</td>
                                    <td className="px-6 py-4">{formatCurrency(invoice.total)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onView(invoice)} className="font-medium text-brand-secondary hover:underline">
                                            View Details
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