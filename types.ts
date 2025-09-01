export type View = 'dashboard' | 'invoices' | 'clients' | 'settings' | 'reports' | 'invoice-form' | 'quotes' | 'time-tracking' | 'files' | 'automation' | 'quote-form' | 'admin-tools' | 'products' | 'expenses' | 'purchase-orders' | 'client-portal' | 'staff' | 'task-board' | 'bookings' | 'reports' | 'forms';

export type Currency = 'ZAR' | 'USD' | 'EUR' | 'GBP';
export type PaymentGateway = 'payfast' | 'yoco';

export interface CompanyProfile {
    name: string;
    address: string;
    logo: string | null;
    registrationNumber: string;
    vatNumber: string;
    invoicePrefix: string;
    invoiceCounter: number;
    defaultTerms: string;
    bankDetails: string;
    taxRate: number; // e.g., 15 for 15%
    preferredGateway: PaymentGateway;
    payfastMerchantId?: string;
    payfastMerchantKey?: string;
    yocoPublicKey?: string;
    yocoSecretKey?: string;
}

export type KycStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected';

export interface Client {
    id: string;
    name: string;
    email: string;
    address: string;
    hourlyRate?: number;
    // For client portal login (in a real app, this would be hashed)
    password?: string; 
    kycStatus: KycStatus;
    requiredDocs: ('ID' | 'Proof of Address')[];
}

export interface LineItem {
    description: string;
    quantity: number;
    rate: number;
    total: number;
    cost?: number;
    productId?: string;
}

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Partial';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    client: Client;
    issueDate: string;
    dueDate: string;
    items: LineItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: Currency;
    amountPaid: number;
    status: InvoiceStatus;
    notes: string;
    paymentMethod?: string;
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined';

export interface Quote {
    id: string;
    quoteNumber: string;
    client: Client;
    issueDate: string;
    expiryDate: string;
    items: LineItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: Currency;
    status: QuoteStatus;
    notes: string;
}

export interface TimeEntry {
    id: string;
    clientId: string;
    date: string;
    hours: number;
    description: string;
}

export interface ManagedFile {
    id: string;
    name: string;
    type: string;
    size: number; // in bytes
    clientId: string;
    uploadDate: string;
    tag: 'General' | 'KYC' | 'Contract';
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
    id: string;
    title: string;
    dueDate: string;
    relatedInvoiceId?: string;
    status: TaskStatus;
    assigneeId?: string; // Links to StaffMember
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    price: number;
    cost: number;
    reorderPoint?: number;
}

export interface Expense {
    id: string;
    date: string;
    vendor: string;
    description: string;
    amount: number;
    receiptImage: string | null; // base64 string
    clientId?: string;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplier: string; // For simplicity, just a name. Could be a full object.
    items: {
        productId: string;
        productName: string;
        quantity: number;
    }[];
    date: string;
    status: 'Draft' | 'Sent';
}

// Client & Staff Management
export interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    requestedDate: string;
    requestedTime: string;
    notes: string;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
}

// Bonus Features
export interface ToDoItem {
  id: string;
  type: 'invoice' | 'quote' | 'task';
  text: string;
  relatedId: string;
}

export type FormFieldType = 'text' | 'textarea';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
}

export interface CustomForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  data: Record<string, any>;
}