import React, { useState } from 'react';
import type { Client, Invoice, Quote, ManagedFile, Appointment } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { ICONS } from '../constants';
import { Input } from './ui/Input';

interface ClientPortalProps {
    client: Client;
    invoices: Invoice[];
    quotes: Quote[];
    files: ManagedFile[];
    setFiles: React.Dispatch<React.SetStateAction<ManagedFile[]>>;
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    onLogout: () => void;
    setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
}

type PortalView = 'dashboard' | 'invoices' | 'quotes' | 'documents' | 'bookings';

export const ClientPortal: React.FC<ClientPortalProps> = ({ client, invoices, quotes, files, setFiles, setAppointments, onLogout, setQuotes }) => {
    const [view, setView] = useState<PortalView>('dashboard');
    
    const handleApproveQuote = (quoteId: string) => {
        if (confirm("Are you sure you want to approve this quote?")) {
            setQuotes(prev => prev.map(q => q.id === quoteId ? {...q, status: 'Accepted'} : q));
            alert("Quote approved successfully!");
        }
    };

    const renderView = () => {
        switch(view) {
            case 'invoices':
                return <InvoiceView invoices={invoices} />;
            case 'quotes':
                return <QuoteView quotes={quotes} onApprove={handleApproveQuote} />;
            case 'documents':
                return <DocumentView client={client} files={files} setFiles={setFiles} />;
            case 'bookings':
                return <BookingView client={client} setAppointments={setAppointments} setView={setView} />;
            case 'dashboard':
            default:
                const pendingInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue');
                const pendingQuotes = quotes.filter(q => q.status === 'Sent');
                return (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Account Summary</CardTitle></CardHeader>
                            <p>You have {pendingInvoices.length} invoice(s) awaiting payment.</p>
                            <p>You have {pendingQuotes.length} quote(s) to review.</p>
                        </Card>
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-brand-primary text-white p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Client Portal</h1>
                <div>
                    <span className="mr-4">Welcome, {client.name}</span>
                    <Button variant="secondary" onClick={onLogout}>Logout</Button>
                </div>
            </header>
            <div className="flex">
                <nav className="w-64 bg-white p-4">
                    <ul>
                        {(['dashboard', 'invoices', 'quotes', 'documents', 'bookings'] as PortalView[]).map(v => (
                            <li key={v} className="mb-2">
                                <a href="#" onClick={e => { e.preventDefault(); setView(v);}} 
                                   className={`block px-4 py-2 rounded-md capitalize ${view === v ? 'bg-blue-100 text-brand-primary font-semibold' : 'hover:bg-gray-100'}`}>
                                    {v}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <main className="flex-1 p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 capitalize">{view}</h2>
                    {renderView()}
                </main>
            </div>
        </div>
    );
};


// Sub-components for the portal views

const InvoiceView: React.FC<{invoices: Invoice[]}> = ({ invoices }) => (
    <Card>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Invoice #</th>
                        <th className="px-6 py-3">Due Date</th>
                        <th className="px-6 py-3">Total</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id} className="bg-white border-b">
                            <td className="px-6 py-4">{inv.invoiceNumber}</td>
                            <td className="px-6 py-4">{inv.dueDate}</td>
                            <td className="px-6 py-4">{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: inv.currency }).format(inv.total)}</td>
                            <td className="px-6 py-4">{inv.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

const QuoteView: React.FC<{quotes: Quote[], onApprove: (quoteId: string) => void}> = ({ quotes, onApprove }) => (
     <Card>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Quote #</th>
                        <th className="px-6 py-3">Expiry Date</th>
                        <th className="px-6 py-3">Total</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.map(q => (
                        <tr key={q.id} className="bg-white border-b">
                            <td className="px-6 py-4">{q.quoteNumber}</td>
                            <td className="px-6 py-4">{q.expiryDate}</td>
                            <td className="px-6 py-4">{new Intl.NumberFormat('en-ZA', { style: 'currency', currency: q.currency }).format(q.total)}</td>
                            <td className="px-6 py-4">{q.status}</td>
                            <td className="px-6 py-4">
                                {/* Fix: Removed redundant className as the new 'size' prop handles styling. */}
                                {q.status === 'Sent' && <Button size="sm" onClick={() => onApprove(q.id)}>Approve</Button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

const DocumentView: React.FC<{client: Client; files: ManagedFile[]; setFiles: React.Dispatch<React.SetStateAction<ManagedFile[]>>}> = ({ client, files, setFiles }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (!uploadedFile) return;

        const newFile: ManagedFile = {
            id: `file-${Date.now()}`,
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            clientId: client.id,
            uploadDate: new Date().toISOString().split('T')[0],
            tag: 'KYC', // Client uploads are tagged as KYC
        };

        setFiles(prev => [...prev, newFile]);
        alert("File uploaded successfully for review.");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Your Documents</CardTitle>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <Button onClick={() => fileInputRef.current?.click()}>{ICONS.upload} Upload KYC Document</Button>
                </div>
            </CardHeader>
            <p className="text-sm text-gray-600 mb-4">Upload required documents like your ID or Proof of Address here.</p>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">File Name</th>
                            <th className="px-6 py-3">Tag</th>
                            <th className="px-6 py-3">Upload Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map(file => (
                            <tr key={file.id} className="bg-white border-b">
                                <td className="px-6 py-4">{file.name}</td>
                                <td className="px-6 py-4">{file.tag}</td>
                                <td className="px-6 py-4">{file.uploadDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const BookingView: React.FC<{client: Client; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; setView: (v: PortalView) => void}> = ({ client, setAppointments, setView }) => {
    const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', notes: '' });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingDetails.date || !bookingDetails.time) {
            alert("Please select a date and time.");
            return;
        }
        const newAppointment: Appointment = {
            id: `appt-${Date.now()}`,
            clientId: client.id,
            clientName: client.name,
            requestedDate: bookingDetails.date,
            requestedTime: bookingDetails.time,
            notes: bookingDetails.notes,
            status: 'Pending',
        };
        setAppointments(prev => [...prev, newAppointment]);
        alert("Your booking request has been sent!");
        setView('dashboard');
    }

    return (
        <Card>
            <CardHeader><CardTitle>Request an Appointment</CardTitle></CardHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Preferred Date" type="date" value={bookingDetails.date} onChange={e => setBookingDetails({...bookingDetails, date: e.target.value})} />
                    <Input label="Preferred Time" type="time" value={bookingDetails.time} onChange={e => setBookingDetails({...bookingDetails, time: e.target.value})} />
                </div>
                 <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                    rows={4} 
                    placeholder="Any notes about your request? (e.g., 'Project discussion')"
                    value={bookingDetails.notes} 
                    onChange={e => setBookingDetails({...bookingDetails, notes: e.target.value})}
                />
                <Button type="submit">Submit Request</Button>
            </form>
        </Card>
    );
};