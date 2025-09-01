import React, { useState } from 'react';
import type { Client, ManagedFile, KycStatus } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';
import { generateKycRequestEmail } from '../services/geminiService';

interface ClientListProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    onViewPortal: (client: Client) => void;
    files: ManagedFile[];
}

const KycBadge: React.FC<{ status: KycStatus }> = ({ status }) => {
    const statusClasses: Record<KycStatus, string> = {
        Pending: 'bg-status-pending/20 text-status-pending',
        Submitted: 'bg-blue-100 text-blue-800',
        Approved: 'bg-status-paid/20 text-status-paid',
        Rejected: 'bg-status-overdue/20 text-status-overdue',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>{status}</span>;
}

const KycManager: React.FC<{client: Client, clientFiles: ManagedFile[]}> = ({ client, clientFiles }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [emailBody, setEmailBody] = useState('');

    const kycFiles = clientFiles.filter(f => f.tag === 'KYC');
    const hasId = kycFiles.some(f => f.name.toLowerCase().includes('id'));
    const hasAddress = kycFiles.some(f => f.name.toLowerCase().includes('address'));
    
    const missingDocs: string[] = [];
    if (client.requiredDocs.includes('ID') && !hasId) missingDocs.push('ID Document');
    if (client.requiredDocs.includes('Proof of Address') && !hasAddress) missingDocs.push('Proof of Address');

    const handleGenerateRequest = async () => {
        if (missingDocs.length === 0) return;
        setIsLoading(true);
        try {
            const body = await generateKycRequestEmail(client.name, missingDocs);
            setEmailBody(body);
        } catch (e) {
            console.error(e);
            alert("Failed to generate email.");
        }
        setIsLoading(false);
    }
    
    return (
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h4 className="font-semibold text-gray-800">KYC Compliance</h4>
            <div className="text-sm mt-2">
                <p>Required: {client.requiredDocs.join(', ')}</p>
                <p>Status: {hasId ? '✅ ID Submitted' : '❌ ID Missing'} | {hasAddress ? '✅ Address Proof Submitted' : '❌ Address Proof Missing'}</p>
            </div>
            {missingDocs.length > 0 && (
                <div className="mt-2">
                    {/* Fix: Use the new 'size' prop which is now supported by the Button component. */}
                    <Button onClick={handleGenerateRequest} disabled={isLoading} size="sm" variant="secondary">
                        {isLoading ? "Generating..." : "AI Generate Request Email"}
                    </Button>
                </div>
            )}
            {emailBody && (
                <textarea
                    readOnly
                    value={emailBody}
                    className="w-full h-32 p-2 mt-2 border border-gray-200 rounded-md bg-white font-mono text-xs"
                />
            )}
        </div>
    )
}


export const ClientList: React.FC<ClientListProps> = ({ clients, setClients, onViewPortal, files }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'kycStatus' | 'requiredDocs'>>({ name: '', email: '', address: '', hourlyRate: 0 });
    const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
    
    const handleSaveClient = () => {
        if (newClient.name && newClient.email) {
            const clientToAdd: Client = {
                 ...newClient, 
                 id: `cli-${Date.now()}`,
                 kycStatus: 'Pending',
                 requiredDocs: ['ID', 'Proof of Address']
            };
            setClients([...clients, clientToAdd]);
            setNewClient({ name: '', email: '', address: '', hourlyRate: 0 });
            setIsAdding(false);
        }
    };

    const toggleExpand = (clientId: string) => {
        setExpandedClientId(prev => (prev === clientId ? null : clientId));
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                <Button onClick={() => setIsAdding(true)}>
                    {ICONS.plus}
                    New Client
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Client</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <Input label="Client Name" placeholder="e.g. Acme Inc." value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
                        <Input label="Email" type="email" placeholder="contact@acme.com" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                        <Input label="Address" placeholder="123 Main St, Anytown" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} />
                        <Input label="Hourly Rate (ZAR)" type="number" placeholder="e.g. 750" value={newClient.hourlyRate || ''} onChange={(e) => setNewClient({ ...newClient, hourlyRate: parseFloat(e.target.value) || 0 })} />

                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleSaveClient}>Save Client</Button>
                        </div>
                    </div>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Clients</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">KYC Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <React.Fragment key={client.id}>
                                    <tr className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                                        <td className="px-6 py-4">{client.email}</td>
                                        <td className="px-6 py-4"><KycBadge status={client.kycStatus} /></td>
                                        <td className="px-6 py-4 space-x-4">
                                            {/* Fix: Removed redundant className as the new 'size' prop handles styling. */}
                                            <Button onClick={() => onViewPortal(client)} variant="primary" size="sm">View Portal</Button>
                                            {/* Fix: Removed redundant className as the new 'size' prop handles styling. */}
                                            <Button onClick={() => toggleExpand(client.id)} variant="secondary" size="sm">
                                                {expandedClientId === client.id ? 'Hide KYC' : 'Manage KYC'}
                                            </Button>
                                        </td>
                                    </tr>
                                    {expandedClientId === client.id && (
                                        <tr className="bg-white">
                                            <td colSpan={4} className="p-0">
                                                <KycManager client={client} clientFiles={files.filter(f => f.clientId === client.id)} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};