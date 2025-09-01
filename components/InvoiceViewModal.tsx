import React from 'react';
import type { Invoice, CompanyProfile, Product } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { handlePaymentRedirect } from '../services/paymentService';
import { ICONS } from '../constants';

interface InvoiceViewModalProps {
    invoice: Invoice;
    companyProfile: CompanyProfile;
    products: Product[];
    onClose: () => void;
    onEdit: (invoice: Invoice) => void;
    onMarkAsPaid: (invoiceId: string) => void;
    onGeneratePO: (invoice: Invoice) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({ invoice, companyProfile, products, onClose, onEdit, onMarkAsPaid, onGeneratePO }) => {

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);
    };

    const handlePayNow = () => {
        handlePaymentRedirect(invoice, companyProfile);
    };
    
    const handleNavigate = () => {
        const address = invoice.client.address;
        if (address) {
            const query = encodeURIComponent(address);
            const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
            window.open(url, '_blank');
        }
    }

    const hasStockShortage = invoice.items.some(item => {
        if (!item.productId) return false;
        const product = products.find(p => p.id === item.productId);
        return product ? product.currentStock < item.quantity : false;
    });

    const gatewayName = companyProfile.preferredGateway === 'payfast' ? 'PayFast' : 'Yoco';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">Invoice {invoice.invoiceNumber}</h2>
                    <div className="flex items-center gap-2">
                        {hasStockShortage && <Button variant="secondary" onClick={() => onGeneratePO(invoice)}>Generate Purchase Order</Button>}
                        <Button variant="secondary" onClick={() => onEdit(invoice)}>Edit</Button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold leading-none" aria-label="Close">&times;</button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 print:p-0" id="invoice-to-print">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            {companyProfile.logo ? (
                                <img src={companyProfile.logo} alt="Company Logo" className="h-16 mb-4" />
                            ) : (
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyProfile.name}</h1>
                            )}
                            <p className="text-gray-600 whitespace-pre-line">{companyProfile.address}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-gray-500 uppercase">Invoice</h2>
                            <p className="text-gray-700"># {invoice.invoiceNumber}</p>
                            <p className="text-gray-700 mt-2">Date Issued: {invoice.issueDate}</p>
                        </div>
                    </div>

                    {/* Client Info & Due Date */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                            <p className="font-bold text-gray-800">{invoice.client.name}</p>
                            <div className="flex items-center text-gray-600">
                                <p className="whitespace-pre-line">{invoice.client.address}</p>
                                <button onClick={handleNavigate} title="Navigate with Google Maps" className="ml-2 text-brand-secondary hover:text-brand-primary print:hidden">
                                    {ICONS.map}
                                </button>
                            </div>
                            <p className="text-gray-600">{invoice.client.email}</p>
                        </div>
                        <div className="text-right bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase">Due Date</h3>
                            <p className="text-xl font-bold text-gray-800">{invoice.dueDate}</p>
                            <div className="mt-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase">Status</h3>
                                <Badge status={invoice.status} />
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <table className="w-full text-left mb-8">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-right">Quantity</th>
                                <th className="p-3 text-right">Rate</th>
                                <th className="p-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-3">{item.description}</td>
                                    <td className="p-3 text-right">{item.quantity}</td>
                                    <td className="p-3 text-right">{formatCurrency(item.rate, invoice.currency)}</td>
                                    <td className="p-3 text-right">{formatCurrency(item.total, invoice.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total Section */}
                    <div className="flex justify-end mb-8">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium text-gray-800">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax ({companyProfile.taxRate}%):</span>
                                <span className="font-medium text-gray-800">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount Paid:</span>
                                <span className="font-medium text-gray-800">{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
                                <span className="text-gray-800">Amount Due:</span>
                                <span className="text-brand-primary">{formatCurrency(invoice.total - invoice.amountPaid, invoice.currency)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Notes */}
                    {invoice.notes && (
                         <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                            <p className="text-sm text-gray-600">{invoice.notes}</p>
                        </div>
                    )}
                </main>
                
                {(invoice.status === 'Pending' || invoice.status === 'Overdue' || invoice.status === 'Draft') && (
                    <footer className="p-4 bg-gray-50 rounded-b-lg border-t flex justify-end items-center gap-4 print:hidden">
                        <Button variant="secondary" onClick={() => onMarkAsPaid(invoice.id)}>Simulate Successful Payment</Button>
                        <Button onClick={handlePayNow}>Pay Now with {gatewayName}</Button>
                    </footer>
                )}
            </div>
        </div>
    );
};