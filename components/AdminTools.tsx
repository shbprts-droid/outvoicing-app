import React, { useState, useCallback } from 'react';
import type { Invoice, Client, Quote, Product, Task, CompanyProfile } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';
import { generateEmailOrMessage, generateDocument, generateTaskSchedule, forecastStock } from '../services/geminiService';

interface AdminToolsProps {
    invoices: Invoice[];
    quotes: Quote[];
    clients: Client[];
    products: Product[];
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    companyProfile: CompanyProfile;
}

type AdminTool = 'email' | 'docs' | 'tasks' | 'stock';

const ToolCard: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="space-y-4">{children}</div>
    </Card>
);

export const AdminTools: React.FC<AdminToolsProps> = ({ invoices, quotes, clients, products, tasks, setTasks, companyProfile }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    // State for Email Writer
    const [emailType, setEmailType] = useState<'reminder' | 'quote_follow_up' | 'thank_you'>('reminder');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices.find(i => i.status === "Overdue")?.id || invoices[0]?.id || '');
    const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotes[0]?.id || '');

    // State for Doc Gen
    const [docType, setDocType] = useState<'contract' | 'terms_and_conditions' | 'delivery_note' | 'public_officer_letter'>('contract');
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
    const [docInvoiceId, setDocInvoiceId] = useState<string>(invoices[0]?.id || '');

    // State for Task Scheduler
    const [scheduleInvoiceId, setScheduleInvoiceId] = useState<string>(invoices[0]?.id || '');
    const [editableTasks, setEditableTasks] = useState<Partial<Task>[]>([]);

    const handleTaskChange = (index: number, field: 'title' | 'dueDate', value: string) => {
        const updatedTasks = [...editableTasks];
        updatedTasks[index] = { ...updatedTasks[index], [field]: value };
        setEditableTasks(updatedTasks);
    };

    const addCustomTask = () => {
        setEditableTasks([...editableTasks, { title: '', dueDate: new Date().toISOString().split('T')[0] }]);
    };

    const deleteTask = (index: number) => {
        setEditableTasks(editableTasks.filter((_, i) => i !== index));
    };

    const saveTasks = () => {
        const tasksToSave: Task[] = editableTasks
            .filter(t => t.title && t.dueDate)
            .map(t => ({
                id: t.id || `task-${Date.now()}-${Math.random()}`,
                title: t.title!,
                dueDate: t.dueDate!,
                relatedInvoiceId: scheduleInvoiceId,
                // Fix: Replaced incorrect 'completed' property with required 'status' property.
                status: 'To Do',
            }));
        
        setTasks(prev => [
            ...prev.filter(t => t.relatedInvoiceId !== scheduleInvoiceId),
            ...tasksToSave
        ]);
        setEditableTasks([]);
        setGeneratedContent(`Saved ${tasksToSave.length} tasks for invoice ${invoices.find(i => i.id === scheduleInvoiceId)?.invoiceNumber}.`);
    };


    const handleGenerate = async (tool: AdminTool) => {
        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        if (tool !== 'tasks') setEditableTasks([]);

        try {
            let content = '';
            switch (tool) {
                case 'email':
                    const invoice = invoices.find(i => i.id === selectedInvoiceId);
                    const quote = quotes.find(q => q.id === selectedQuoteId);
                    const client = emailType === 'quote_follow_up' ? quote?.client : invoice?.client;
                    if (client) {
                        content = await generateEmailOrMessage({
                            type: emailType,
                            invoice,
                            quote,
                            client,
                            companyName: companyProfile.name
                        });
                    }
                    break;
                case 'docs':
                    const docClient = clients.find(c => c.id === selectedClientId);
                    const clientInvoice = invoices.find(i => i.id === docInvoiceId);
                    if (docClient) {
                       content = await generateDocument({
                           type: docType,
                           client: docClient,
                           company: { name: companyProfile.name, address: companyProfile.address },
                           invoice: clientInvoice
                       });
                    }
                    break;
                case 'tasks':
                    const taskInvoice = invoices.find(i => i.id === scheduleInvoiceId);
                    if (taskInvoice) {
                        const newTasks = await generateTaskSchedule(taskInvoice);
                        setEditableTasks(newTasks);
                        content = `AI suggestions loaded. You can now edit them below.`;
                    }
                    break;
                case 'stock':
                    content = await forecastStock(invoices, products);
                    break;
            }
            setGeneratedContent(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">AI Admin Tools</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Email Writer */}
                <ToolCard title="Auto Email & Message Writer" description="Drafts polite payment reminders, quote replies, and client updates in seconds.">
                    <div className="flex gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Message Type</label>
                            <select value={emailType} onChange={e => setEmailType(e.target.value as any)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option value="reminder">Payment Reminder</option>
                                <option value="quote_follow_up">Quote Follow-up</option>
                                <option value="thank_you">Payment Thank You</option>
                            </select>
                        </div>
                        {emailType !== 'quote_follow_up' ? (
                            <div>
                                <label className="text-sm font-medium text-gray-700">For Invoice</label>
                                <select value={selectedInvoiceId} onChange={e => setSelectedInvoiceId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                    {invoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.client.name}</option>)}
                                </select>
                            </div>
                        ) : (
                             <div>
                                <label className="text-sm font-medium text-gray-700">For Quote</label>
                                <select value={selectedQuoteId} onChange={e => setSelectedQuoteId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                    {quotes.map(q => <option key={q.id} value={q.id}>{q.quoteNumber} - {q.client.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                     <Button onClick={() => handleGenerate('email')} disabled={isLoading}>{isLoading ? 'Generating...' : <>{ICONS.sparkles} Generate Email</>}</Button>
                </ToolCard>

                {/* Document Generator */}
                <ToolCard title="Document Generator" description="Creates contracts, T&Cs, and more from templates.">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Document Type</label>
                            <select value={docType} onChange={e => setDocType(e.target.value as any)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option value="contract">Simple Service Contract</option>
                                <option value="terms_and_conditions">General T&Cs</option>
                                <option value="delivery_note">Delivery Note</option>
                                <option value="public_officer_letter">Public Officer Letter</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-700">For Client</label>
                            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                         {docType === 'delivery_note' && <div>
                            <label className="text-sm font-medium text-gray-700">Based on Invoice</label>
                            <select value={docInvoiceId} onChange={e => setDocInvoiceId(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                {invoices.filter(i => i.client.id === selectedClientId).map(i => <option key={i.id} value={i.id}>{i.invoiceNumber}</option>)}
                            </select>
                        </div>}
                    </div>
                    <Button onClick={() => handleGenerate('docs')} disabled={isLoading}>{isLoading ? 'Generating...' : <>{ICONS.sparkles} Generate Document</>}</Button>
                </ToolCard>

                 {/* Task Scheduler */}
                <ToolCard title="Auto Task Scheduler" description="Generates a project timeline based on an invoice or order.">
                     <div className="flex gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Based on Invoice</label>
                             <select value={scheduleInvoiceId} onChange={e => { setScheduleInvoiceId(e.target.value); setEditableTasks([]) }} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                {invoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.client.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <Button onClick={() => handleGenerate('tasks')} disabled={isLoading || !scheduleInvoiceId}>{isLoading ? 'Generating...' : <>{ICONS.sparkles} Generate Suggested Tasks</>}</Button>
                    
                    {editableTasks.length > 0 && (
                        <div className="space-y-2 mt-4 border-t pt-4">
                            <h4 className="font-semibold">Edit & Save Tasks</h4>
                            {editableTasks.map((task, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input className="flex-1" value={task.title || ''} onChange={(e) => handleTaskChange(index, 'title', e.target.value)} placeholder="Task title" />
                                    <Input type="date" value={task.dueDate || ''} onChange={(e) => handleTaskChange(index, 'dueDate', e.target.value)} />
                                    <Button type="button" variant="danger" onClick={() => deleteTask(index)} size="sm" className="!p-2">
                                        {ICONS.trash}
                                    </Button>
                                </div>
                            ))}
                            <div className="flex justify-between items-center mt-4">
                               <Button type="button" variant="secondary" onClick={addCustomTask}>
                                    {ICONS.plus}Add Custom Task
                                </Button>
                                <Button onClick={saveTasks}>Save All Tasks</Button>
                            </div>
                        </div>
                    )}
                </ToolCard>

                {/* Stock Forecasting */}
                <ToolCard title="Predictive Stock Forecasting" description="Based on sales trends and reorder points, predicts when and what you need to reorder.">
                     <Button onClick={() => handleGenerate('stock')} disabled={isLoading}>{isLoading ? 'Analyzing...' : <>{ICONS.sparkles} Generate Forecast</>}</Button>
                </ToolCard>

            </div>

             {(generatedContent || error) && (
                <Card>
                    <CardHeader>
                        <CardTitle>AI Generated Content</CardTitle>
                    </CardHeader>
                    {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                    <textarea
                        readOnly
                        value={generatedContent}
                        className="w-full h-64 p-2 border border-gray-200 rounded-md bg-gray-50 font-mono text-sm"
                        placeholder="AI output will appear here..."
                    />
                </Card>
            )}
        </div>
    );
};