import React, { useState, useCallback, useEffect } from 'react';
import type { View, CompanyProfile, Invoice, Client, Quote, TimeEntry, ManagedFile, LineItem, Product, Task, Expense, PurchaseOrder, StaffMember, Appointment, CustomForm } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/InvoiceList';
import { ClientList } from './components/ClientList';
import { Settings } from './components/Settings';
import { InvoiceForm } from './components/InvoiceForm';
import { TollieB_AI } from './components/TollieB_AI';
import { QuoteList } from './components/QuoteList';
import { QuoteForm } from './components/QuoteForm';
import { TimeTracking } from './components/TimeTracking';
import { FileManager } from './components/FileManager';
import { Automation } from './components/Automation';
import { AdminTools } from './components/AdminTools';
import { ProductList } from './components/ProductList';
import { InvoiceViewModal } from './components/InvoiceViewModal';
import { ExpenseList } from './components/ExpenseList';
import { PurchaseOrderList } from './components/PurchaseOrderList';
import { ClientPortal } from './components/ClientPortal';
import { StaffList } from './components/StaffList';
import { TaskBoard } from './components/TaskBoard';
import { BookingList } from './components/BookingList';
import { Reports } from './components/Reports';
import { FormBuilder } from './components/FormBuilder';


const getTodayDate = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
        name: 'Your Company',
        address: '123 Business Lane, Johannesburg, 2000',
        logo: null,
        registrationNumber: '',
        vatNumber: '',
        invoicePrefix: 'INV-',
        invoiceCounter: 5,
        defaultTerms: 'Payment due within 30 days.',
        bankDetails: 'Bank: FNB, Acc No: 1234567890, Branch: 250655',
        taxRate: 15.00,
        preferredGateway: 'payfast',
        payfastMerchantId: '10000100',
        payfastMerchantKey: '46f0cd694581a',
        yocoPublicKey: 'pk_test_123456',
        yocoSecretKey: 'sk_test_abcdef',
    });
    
    // Mock Data
    const initialClients: Client[] = [
        { id: 'cli-1', name: 'Innovate Solutions Pty Ltd', email: 'contact@innovatesol.co.za', address: '45 Tech Park, Cape Town', hourlyRate: 750, password: 'password123', kycStatus: 'Approved', requiredDocs: [] },
        { id: 'cli-2', name: 'Gauteng Logistics', email: 'accounts@gautenglogistics.com', address: '101 Highway Business, Pretoria', hourlyRate: 850, password: 'password123', kycStatus: 'Pending', requiredDocs: ['ID', 'Proof of Address'] }
    ];

    const initialProducts: Product[] = [
        { id: 'prod-1', name: 'Standard Widget', sku: 'WID-001', currentStock: 15, price: 250, cost: 120, reorderPoint: 20 },
        { id: 'prod-2', name: 'Premium Gadget', sku: 'GAD-001', currentStock: 25, price: 800, cost: 450, reorderPoint: 10 }
    ];

    const initialStaff: StaffMember[] = [
        { id: 'staff-1', name: 'Alice Johnson', email: 'alice@yourcompany.com', role: 'Project Manager' },
        { id: 'staff-2', name: 'Bob Williams', email: 'bob@yourcompany.com', role: 'Developer' }
    ];
    
    const initialInvoices: Invoice[] = [
        { id: 'INV-0001', client: initialClients[0], invoiceNumber: 'INV-0001', issueDate: '2024-07-15', dueDate: '2024-08-14', status: 'Paid', items: [{ description: 'Website Development', quantity: 1, rate: 25000, total: 25000, cost: 12000 }], subtotal: 25000, taxAmount: 0, total: 25000, currency: 'ZAR', amountPaid: 25000, notes: 'Full stack development services.', paymentMethod: 'EFT' },
        { id: 'INV-0002', client: initialClients[1], invoiceNumber: 'INV-0002', issueDate: '2024-07-20', dueDate: '2024-08-19', status: 'Pending', items: [{ description: 'Logistics Consulting', quantity: 10, rate: 850, total: 8500, cost: 300 }], subtotal: 8500, taxAmount: 1275, total: 9775, currency: 'ZAR', amountPaid: 0, notes: 'Consulting hours for Q3.' },
        { id: 'INV-0003', client: initialClients[0], invoiceNumber: 'INV-0003', issueDate: '2024-06-01', dueDate: '2024-07-01', status: 'Overdue', items: [{ description: 'Server Maintenance', quantity: 1, rate: 5000, total: 5000, cost: 1500 }], subtotal: 5000, taxAmount: 750, total: 5750, currency: 'ZAR', amountPaid: 0, notes: 'Monthly maintenance contract.' },
        { id: 'INV-0004', client: initialClients[1], invoiceNumber: 'INV-0004', issueDate: '2024-07-25', dueDate: '2024-08-24', status: 'Paid', items: [{ productId: 'prod-1', description: 'Standard Widget', quantity: 20, rate: 250, total: 5000, cost: 120 }], subtotal: 5000, taxAmount: 750, total: 5750, currency: 'ZAR', amountPaid: 5750, notes: 'Order #5821', paymentMethod: 'PayFast' },
    ];

    const initialQuotes: Quote[] = [
        { id: 'Q-001', quoteNumber: 'Q-001', client: initialClients[1], issueDate: '2024-08-01', expiryDate: '2024-08-31', items: [{ description: 'Fleet Management System', quantity: 1, rate: 45000, total: 45000, cost: 28000 }], subtotal: 45000, taxAmount: 6750, total: 51750, currency: 'ZAR', status: 'Sent', notes: 'Proposal for new system implementation.'}
    ];

    const initialTimeEntries: TimeEntry[] = [
        { id: 'time-1', clientId: 'cli-1', date: '2024-08-02', hours: 3, description: 'API integration meeting and planning.' },
        { id: 'time-2', clientId: 'cli-1', date: '2024-08-03', hours: 5, description: 'Development of user authentication module.' }
    ];
    
    const initialExpenses: Expense[] = [
        { id: 'exp-1', date: '2024-07-28', vendor: 'DigitalOcean', description: 'Server Hosting - July', amount: 350.50, receiptImage: null, clientId: 'cli-1' }
    ];

    const initialPurchaseOrders: PurchaseOrder[] = [];

    const initialFiles: ManagedFile[] = [
        { id: 'file-1', name: 'Innovate-Contract.pdf', type: 'application/pdf', size: 120485, clientId: 'cli-1', uploadDate: '2024-07-10', tag: 'Contract' },
        { id: 'file-2', name: 'Innovate-ID.pdf', type: 'application/pdf', size: 80123, clientId: 'cli-1', uploadDate: '2024-07-11', tag: 'KYC' }
    ];

    const initialTasks: Task[] = [
        { id: 'task-1', title: 'Follow up on INV-0003', dueDate: '2024-08-10', relatedInvoiceId: 'INV-0003', status: 'To Do', assigneeId: 'staff-1' },
        { id: 'task-2', title: 'Develop user auth', dueDate: getTodayDate(), relatedInvoiceId: 'INV-0001', status: 'In Progress', assigneeId: 'staff-2' },
        { id: 'task-3', title: 'Deploy to production', dueDate: '2024-08-20', relatedInvoiceId: 'INV-0001', status: 'Done' }
    ];

    const initialAppointments: Appointment[] = [
        { id: 'appt-1', clientId: 'cli-2', clientName: 'Gauteng Logistics', requestedDate: '2024-08-25', requestedTime: '10:00', notes: 'Discuss Q4 logistics strategy.', status: 'Pending'}
    ];
    
    const initialForms: CustomForm[] = [
        { id: 'form-1', title: 'New Client Intake', description: 'Onboarding form for new clients.', fields: [
            { id: 'f-1', label: 'Company Name', type: 'text', required: true },
            { id: 'f-2', label: 'Primary Contact', type: 'text', required: true },
            { id: 'f-3', label: 'Project Brief', type: 'textarea', required: false },
        ]}
    ];

    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
    const [files, setFiles] = useState<ManagedFile[]>(initialFiles);
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
    const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [customForms, setCustomForms] = useState<CustomForm[]>(initialForms);
    
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const [draftInvoiceFromAutomation, setDraftInvoiceFromAutomation] = useState<Partial<Invoice> | null>(null);
    const [loggedInClient, setLoggedInClient] = useState<Client | null>(null);

    const handleNavigate = (view: View) => {
        setEditingInvoice(null);
        setEditingQuote(null);
        setDraftInvoiceFromAutomation(null);
        if (view !== 'client-portal') {
            setLoggedInClient(null); // Log out client if navigating away from portal
        }
        setCurrentView(view);
    };
    
    const handleSaveInvoice = (invoiceToSave: Invoice) => {
        if (invoiceToSave.id) {
            setInvoices(invoices.map(inv => inv.id === invoiceToSave.id ? invoiceToSave : inv));
        } else {
            let nextCounter = companyProfile.invoiceCounter;
            let newInvoiceNumber: string;
            let isUnique = false;
            while (!isUnique) {
                newInvoiceNumber = `${companyProfile.invoicePrefix}${nextCounter.toString().padStart(4, '0')}`;
                if (!invoices.some(inv => inv.invoiceNumber === newInvoiceNumber)) {
                    isUnique = true;
                } else {
                    nextCounter++;
                }
            }
            const newInvoice = { ...invoiceToSave, id: newInvoiceNumber!, invoiceNumber: newInvoiceNumber! };
            setInvoices([...invoices, newInvoice]);
            setCompanyProfile(prev => ({ ...prev, invoiceCounter: nextCounter + 1 }));
        }
        handleNavigate('invoices');
    };
    
    const handleEditInvoice = (invoice: Invoice) => {
        setViewingInvoice(null);
        setEditingInvoice(invoice);
        setCurrentView('invoice-form');
    };

    const handleCreateNewInvoice = (draft?: Partial<Invoice>) => {
        setEditingInvoice(null);
        if (draft) {
             setDraftInvoiceFromAutomation(draft);
        }
        setCurrentView('invoice-form');
    };

    const handleSaveQuote = (quoteToSave: Quote) => {
        if (quoteToSave.id) {
            setQuotes(quotes.map(q => q.id === quoteToSave.id ? quoteToSave : q));
        } else {
            const newQuoteNumber = `Q-${(quotes.length + 1).toString().padStart(3, '0')}`;
            const newQuote = { ...quoteToSave, id: newQuoteNumber, quoteNumber: newQuoteNumber };
            setQuotes([...quotes, newQuote]);
        }
        handleNavigate('quotes');
    }

    const handleEditQuote = (quote: Quote) => {
        setEditingQuote(quote);
        setCurrentView('quote-form');
    };

    const handleCreateNewQuote = () => {
        setEditingQuote(null);
        setCurrentView('quote-form');
    };

    const handleConvertToInvoice = (quote: Quote) => {
        const draft: Partial<Invoice> = {
            client: quote.client,
            items: quote.items,
            notes: quote.notes,
            status: 'Draft',
            currency: quote.currency,
            subtotal: quote.subtotal,
            taxAmount: quote.taxAmount,
            total: quote.total,
        };
        handleCreateNewInvoice(draft);
    };

    const handleMarkAsPaid = (invoiceId: string) => {
        setInvoices(invoices.map(inv => 
            inv.id === invoiceId 
            ? { ...inv, status: 'Paid', amountPaid: inv.total, paymentMethod: companyProfile.preferredGateway } 
            : inv
        ));
        setViewingInvoice(null);
    };

    const handleGeneratePO = (invoice: Invoice) => {
        const itemsToOrder = invoice.items
            .filter(item => item.productId)
            .map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                const needed = item.quantity;
                const shortFall = needed - product.currentStock;
                return shortFall > 0 ? { productId: product.id, productName: product.name, quantity: shortFall } : null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
        
        if (itemsToOrder.length > 0) {
            const newPO: PurchaseOrder = {
                id: `PO-${Date.now()}`,
                poNumber: `PO-${(purchaseOrders.length + 1).toString().padStart(4, '0')}`,
                supplier: 'Default Supplier', // Could be made more complex
                items: itemsToOrder,
                date: getTodayDate(),
                status: 'Draft',
            };
            setPurchaseOrders(prev => [...prev, newPO]);
            alert(`Purchase Order ${newPO.poNumber} generated for ${itemsToOrder.length} item(s).`);
            setViewingInvoice(null);
            handleNavigate('purchase-orders');
        } else {
            alert('All required products are currently in stock. No Purchase Order needed.');
        }
    };

    // Client Portal Logic
    const handleClientPortalAccess = (client: Client) => {
        // In a real app, this would be a proper login flow.
        // For simulation, we just set the logged-in client.
        setLoggedInClient(client);
        setCurrentView('client-portal');
    };
    
    if (loggedInClient && currentView === 'client-portal') {
        return <ClientPortal 
            client={loggedInClient}
            invoices={invoices.filter(i => i.client.id === loggedInClient.id)}
            quotes={quotes.filter(q => q.client.id === loggedInClient.id)}
            files={files.filter(f => f.clientId === loggedInClient.id)}
            setFiles={setFiles}
            setAppointments={setAppointments}
            onLogout={() => handleNavigate('dashboard')}
            setQuotes={setQuotes}
        />;
    }


    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard invoices={invoices} clients={clients} quotes={quotes} tasks={tasks} />;
            case 'invoices':
                return <InvoiceList invoices={invoices} onView={setViewingInvoice} onCreateNew={handleCreateNewInvoice} />;
            case 'quotes':
                return <QuoteList quotes={quotes} onEdit={handleEditQuote} onCreateNew={handleCreateNewQuote} onConvertToInvoice={handleConvertToInvoice} />;
            case 'clients':
                return <ClientList clients={clients} setClients={setClients} onViewPortal={handleClientPortalAccess} files={files} />;
            case 'staff':
                return <StaffList staff={staff} setStaff={setStaff} />;
            case 'task-board':
                return <TaskBoard tasks={tasks} setTasks={setTasks} staff={staff} />;
            case 'bookings':
                return <BookingList appointments={appointments} setAppointments={setAppointments} />;
            case 'products':
                return <ProductList products={products} setProducts={setProducts} />;
            case 'expenses':
                return <ExpenseList expenses={expenses} setExpenses={setExpenses} clients={clients} />;
            case 'purchase-orders':
                return <PurchaseOrderList purchaseOrders={purchaseOrders} />;
            case 'time-tracking':
                return <TimeTracking timeEntries={timeEntries} setTimeEntries={setTimeEntries} clients={clients} onCreateInvoice={handleCreateNewInvoice}/>;
            case 'files':
                return <FileManager files={files} setFiles={setFiles} clients={clients} />;
            case 'reports':
                return <Reports invoices={invoices} clients={clients} />;
            case 'forms':
                return <FormBuilder forms={customForms} setForms={setCustomForms} />;
            case 'automation':
                return <Automation clients={clients} onCreateDraft={handleCreateNewInvoice} />;
            case 'admin-tools':
                return <AdminTools 
                    invoices={invoices}
                    quotes={quotes}
                    clients={clients}
                    products={products}
                    tasks={tasks}
                    setTasks={setTasks}
                    companyProfile={companyProfile}
                />;
            case 'settings':
                return <Settings profile={companyProfile} setProfile={setCompanyProfile} />;
            case 'invoice-form':
                return <InvoiceForm
                    invoice={editingInvoice}
                    draft={draftInvoiceFromAutomation}
                    clients={clients}
                    onSave={handleSaveInvoice}
                    onCancel={() => handleNavigate('invoices')}
                    companyProfile={companyProfile}
                />;
             case 'quote-form':
                return <QuoteForm 
                    quote={editingQuote} 
                    clients={clients} 
                    onSave={handleSaveQuote} 
                    onCancel={() => handleNavigate('quotes')} 
                    companyProfile={companyProfile}
                />;
            default:
                return <Dashboard invoices={invoices} clients={clients} quotes={quotes} tasks={tasks} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentView={currentView} onNavigate={handleNavigate} />
            <main className="flex-1 overflow-y-auto p-8">
                {renderContent()}
            </main>
            {viewingInvoice && (
                <InvoiceViewModal 
                    invoice={viewingInvoice} 
                    companyProfile={companyProfile}
                    products={products}
                    onClose={() => setViewingInvoice(null)}
                    onEdit={handleEditInvoice}
                    onMarkAsPaid={handleMarkAsPaid}
                    onGeneratePO={handleGeneratePO}
                />
            )}
            <TollieB_AI invoices={invoices} clients={clients} />
        </div>
    );
};

export default App;