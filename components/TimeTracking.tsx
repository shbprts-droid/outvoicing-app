
import React, { useState } from 'react';
import type { TimeEntry, Client, Invoice, LineItem } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';

interface TimeTrackingProps {
    timeEntries: TimeEntry[];
    setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
    clients: Client[];
    onCreateInvoice: (draft: Partial<Invoice>) => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const TimeTracking: React.FC<TimeTrackingProps> = ({ timeEntries, setTimeEntries, clients, onCreateInvoice }) => {
    const [newEntry, setNewEntry] = useState({ clientId: clients[0]?.id || '', date: getTodayDate(), hours: 0, description: '' });
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
    
    const handleSaveEntry = () => {
        if (newEntry.clientId && newEntry.hours > 0 && newEntry.description) {
            setTimeEntries(prev => [...prev, { ...newEntry, id: `time-${Date.now()}` }]);
            setNewEntry({ clientId: clients[0]?.id || '', date: getTodayDate(), hours: 0, description: '' });
        }
    };

    const handleSelectionChange = (entryId: string) => {
        setSelectedEntries(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(entryId)) {
                newSelection.delete(entryId);
            } else {
                newSelection.add(entryId);
            }
            return newSelection;
        });
    }

    const handleGenerateInvoice = () => {
        if (selectedEntries.size === 0) return;

        const entriesToInvoice = timeEntries.filter(e => selectedEntries.has(e.id));
        const client = clients.find(c => c.id === entriesToInvoice[0].clientId);
        if (!client) {
            alert('Client not found for selected entries.');
            return;
        }

        const lineItems: LineItem[] = entriesToInvoice.map(entry => ({
            description: `${entry.description} (${entry.date})`,
            quantity: entry.hours,
            rate: client.hourlyRate || 0,
            total: entry.hours * (client.hourlyRate || 0),
            cost: 0,
        }));
        
        const draft: Partial<Invoice> = {
            client,
            items: lineItems,
            notes: `Invoice generated from time entries on ${getTodayDate()}.`,
            status: 'Draft',
        };
        
        onCreateInvoice(draft);
        // Clear selected entries after creating invoice
        const remainingEntries = timeEntries.filter(e => !selectedEntries.has(e.id));
        setTimeEntries(remainingEntries);
        setSelectedEntries(new Set());
    };
    
    const entriesByClient = timeEntries.reduce((acc, entry) => {
        (acc[entry.clientId] = acc[entry.clientId] || []).push(entry);
        return acc;
    }, {} as Record<string, TimeEntry[]>);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>

            <Card>
                <CardHeader><CardTitle>Log Time</CardTitle></CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <select id="client-select" value={newEntry.clientId} onChange={e => setNewEntry({...newEntry, clientId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm">
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <Input label="Date" type="date" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} />
                    <Input label="Hours" type="number" value={newEntry.hours} onChange={e => setNewEntry({...newEntry, hours: parseFloat(e.target.value) || 0})} />
                    <Input label="Description" value={newEntry.description} onChange={e => setNewEntry({...newEntry, description: e.target.value})} />
                </div>
                <Button onClick={handleSaveEntry} className="mt-4">Log Entry</Button>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Logged Entries</CardTitle>
                        <Button onClick={handleGenerateInvoice} disabled={selectedEntries.size === 0}>Generate Invoice for Selected</Button>
                    </div>
                </CardHeader>
                <div className="space-y-4">
                    {Object.keys(entriesByClient).length > 0 ? Object.entries(entriesByClient).map(([clientId, entries]) => (
                        <div key={clientId}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{clients.find(c=>c.id === clientId)?.name}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 w-12"><input type="checkbox" disabled /></th>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3">Hours</th>
                                            <th scope="col" className="px-6 py-3">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(entry => (
                                            <tr key={entry.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4"><input type="checkbox" checked={selectedEntries.has(entry.id)} onChange={() => handleSelectionChange(entry.id)} /></td>
                                                <td className="px-6 py-4">{entry.date}</td>
                                                <td className="px-6 py-4">{entry.hours}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{entry.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 text-center py-4">No time entries logged yet.</p>}
                </div>
            </Card>
        </div>
    );
};