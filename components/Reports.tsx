import React, { useState, useMemo } from 'react';
import type { Invoice, Client } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ReportsProps {
    invoices: Invoice[];
    clients: Client[];
}

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

export const Reports: React.FC<ReportsProps> = ({ invoices, clients }) => {
    const [startDate, setStartDate] = useState(getFirstDayOfMonth());
    const [endDate, setEndDate] = useState(getTodayDate());

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const issueDate = new Date(invoice.issueDate);
            return issueDate >= new Date(startDate) && issueDate <= new Date(endDate);
        });
    }, [invoices, startDate, endDate]);

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);
    };
    
    const handleExportCSV = () => {
        const headers = ['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Status', 'Subtotal', 'Tax', 'Total', 'Currency'];
        const rows = filteredInvoices.map(inv => [
            inv.invoiceNumber,
            inv.client.name.replace(/,/g, ''), // remove commas to avoid CSV issues
            inv.issueDate,
            inv.dueDate,
            inv.status,
            inv.subtotal,
            inv.taxAmount,
            inv.total,
            inv.currency
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    const totals = useMemo(() => {
        return filteredInvoices.reduce((acc, inv) => {
            acc.subtotal += inv.subtotal;
            acc.taxAmount += inv.taxAmount;
            acc.total += inv.total;
            return acc;
        }, { subtotal: 0, taxAmount: 0, total: 0 });
    }, [filteredInvoices]);

    return (
        <div className="space-y-6">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>

            <div className="flex justify-between items-center no-print">
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            </div>

            <Card className="no-print">
                <CardHeader><CardTitle>Sales Report</CardTitle></CardHeader>
                <div className="flex items-end gap-4">
                    <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <Button onClick={handleExportCSV} variant="secondary" disabled={filteredInvoices.length === 0}>Export CSV</Button>
                    <Button onClick={handlePrint} variant="secondary" disabled={filteredInvoices.length === 0}>Print PDF</Button>
                </div>
            </Card>

            <div id="print-area">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Summary ({startDate} to {endDate})</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Invoice #</th>
                                    <th scope="col" className="px-6 py-3">Client</th>
                                    <th scope="col" className="px-6 py-3">Issue Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(invoice => (
                                    <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4">{invoice.client.name}</td>
                                        <td className="px-6 py-4">{invoice.issueDate}</td>
                                        <td className="px-6 py-4">{invoice.status}</td>
                                        <td className="px-6 py-4 text-right font-semibold">{formatCurrency(invoice.total, invoice.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                             <tfoot>
                                <tr className="font-bold text-gray-800 bg-gray-50 border-t-2">
                                    <td colSpan={4} className="px-6 py-3 text-right">Total:</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(totals.total, 'ZAR')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};