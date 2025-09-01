
import React, { useState } from 'react';
import type { Client, Invoice } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { createDraftInvoiceFromText } from '../services/geminiService';
import { ICONS } from '../constants';

interface AutomationProps {
    clients: Client[];
    onCreateDraft: (draft: Partial<Invoice>) => void;
}

export const Automation: React.FC<AutomationProps> = ({ clients, onCreateDraft }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateDraft = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await createDraftInvoiceFromText(text, clients);
            const matchedClient = clients.find(c => c.id === result.client.id);
            
            if (!matchedClient) {
                throw new Error(`Could not find a client named "${result.client.name}" in your client list.`);
            }

            const draftInvoice: Partial<Invoice> = {
                client: matchedClient,
                items: result.items.map(item => ({...item, total: item.quantity * item.rate})),
                notes: result.notes,
                status: 'Draft'
            };
            onCreateDraft(draftInvoice);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Automation Hub</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Auto-Capture from Text</CardTitle>
                </CardHeader>
                <p className="text-sm text-gray-600 mb-4">
                    Copy and paste the text from an email or WhatsApp message containing a client request or order. TollieB AI will read it and create a draft invoice for you.
                </p>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                    rows={10}
                    placeholder="Paste text here... e.g., 'Hi, please send me a quote for 5 hours of consulting for Gauteng Logistics. Thanks!'"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isLoading}
                />
                <Button onClick={handleCreateDraft} disabled={isLoading || !text.trim()} className="mt-4">
                    {isLoading ? 'Analyzing...' : <>{ICONS.sparkles} Create Draft Invoice</>}
                </Button>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </Card>
        </div>
    );
};
