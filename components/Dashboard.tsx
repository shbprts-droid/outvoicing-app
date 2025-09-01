import React from 'react';
import type { Invoice, Client, LineItem, ToDoItem, Quote, Task } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

interface DashboardProps {
    invoices: Invoice[];
    clients: Client[];
    quotes: Quote[];
    tasks: Task[];
}

const StatCard: React.FC<{ title: string; value: string; subtext: string; }> = ({ title, value, subtext }) => (
    <Card>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtext}</p>
    </Card>
);

const RevenueChart: React.FC<{invoices: Invoice[]}> = ({ invoices }) => {
    const monthlyData: {[key: string]: number} = {};

    invoices.forEach(invoice => {
        if (invoice.status === 'Paid') {
            const month = new Date(invoice.issueDate).toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyData[month] = (monthlyData[month] || 0) + invoice.total;
        }
    });

    const chartData = Object.entries(monthlyData).slice(-6); // Last 6 months
    const maxRevenue = Math.max(...chartData.map(([, total]) => total), 1);
    
    return (
        <div className="h-64 flex items-end justify-around space-x-4 p-4 bg-gray-50 rounded-lg">
            {chartData.map(([month, total]) => (
                <div key={month} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-blue-200 rounded-t-md" style={{ height: `${(total / maxRevenue) * 100}%` }}></div>
                    <span className="text-xs font-medium text-gray-600 mt-2">{month}</span>
                </div>
            ))}
        </div>
    )
}

const TopServices: React.FC<{invoices: Invoice[]}> = ({invoices}) => {
    const serviceCounts: {[key: string]: number} = {};

    invoices.flatMap(i => i.items).forEach(item => {
        const desc = item.description.trim();
        if (desc) {
            serviceCounts[desc] = (serviceCounts[desc] || 0) + item.quantity;
        }
    });

    const topServices = Object.entries(serviceCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);
        
    return (
         <ul className="space-y-2">
            {topServices.map(([desc, count]) => (
                <li key={desc} className="flex justify-between text-sm">
                    <span className="text-gray-700">{desc}</span>
                    <span className="font-semibold text-gray-900">{count} units</span>
                </li>
            ))}
        </ul>
    )
}

const ProfitabilityCard: React.FC<{invoices: Invoice[]}> = ({ invoices }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
    };

    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');

    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.total, 0);
    
    const totalCost = paidInvoices.reduce((acc, inv) => {
        const invoiceCost = inv.items.reduce((itemAcc, item) => {
            return itemAcc + ((item.cost || 0) * item.quantity);
        }, 0);
        return acc + invoiceCost;
    }, 0);

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return (
        <Card>
            <CardHeader><CardTitle>Profitability Insights</CardTitle></CardHeader>
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Profit (All Time)</h4>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCurrency(totalProfit)}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Overall Profit Margin</h4>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{profitMargin.toFixed(2)}%</p>
                </div>
                 <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-status-paid h-2.5 rounded-full" style={{ width: `${profitMargin}%` }}></div>
                </div>
            </div>
        </Card>
    );
};

const DailyToDo: React.FC<{invoices: Invoice[], quotes: Quote[], tasks: Task[]}> = ({ invoices, quotes, tasks }) => {
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    const todoItems: ToDoItem[] = [];

    // Overdue Invoices
    invoices.forEach(inv => {
        if (inv.status === 'Overdue') {
            todoItems.push({
                id: `todo-inv-${inv.id}`,
                type: 'invoice',
                text: `Follow up on overdue invoice ${inv.invoiceNumber} for ${inv.client.name}.`,
                relatedId: inv.id,
            });
        }
    });

    // Expiring Quotes
    quotes.forEach(q => {
        const expiryDate = new Date(q.expiryDate);
        if (q.status === 'Sent' && expiryDate <= oneWeekFromNow) {
            todoItems.push({
                id: `todo-quote-${q.id}`,
                type: 'quote',
                text: `Follow up on quote ${q.quoteNumber} for ${q.client.name} (expires ${q.expiryDate}).`,
                relatedId: q.id,
            });
        }
    });

    // Tasks Due Today
    tasks.forEach(t => {
        if (t.status !== 'Done' && new Date(t.dueDate).toDateString() === today.toDateString()) {
             todoItems.push({
                id: `todo-task-${t.id}`,
                type: 'task',
                text: `Task due today: "${t.title}".`,
                relatedId: t.id,
            });
        }
    });

    return (
        <Card>
            <CardHeader><CardTitle>Daily To-Do Feed</CardTitle></CardHeader>
            {todoItems.length > 0 ? (
                <ul className="space-y-3">
                    {todoItems.map(item => (
                        <li key={item.id} className="flex items-start">
                             <span className="text-brand-secondary mr-3 mt-1">&#8227;</span>
                             <p className="text-sm text-gray-700">{item.text}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">Nothing urgent on your plate. Well done!</p>
            )}
        </Card>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ invoices, clients, quotes, tasks }) => {
    const totalOutstanding = invoices
        .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue' || inv.status === 'Partial')
        .reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0);

    const totalOverdue = invoices
        .filter(inv => inv.status === 'Overdue')
        .reduce((acc, inv) => acc + (inv.total - inv.amountPaid), 0);
        
    const paidLast30Days = invoices
        .filter(inv => inv.status === 'Paid' && new Date(inv.issueDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((acc, inv) => acc + inv.total, 0);

    const recentInvoices = [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Smart Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Outstanding" value={formatCurrency(totalOutstanding)} subtext={`${invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length} open invoices`} />
                <StatCard title="Overdue" value={formatCurrency(totalOverdue)} subtext={`${invoices.filter(i => i.status === 'Overdue').length} overdue invoices`} />
                <StatCard title="Paid (Last 30 days)" value={formatCurrency(paidLast30Days)} subtext="Revenue collected" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                     <DailyToDo invoices={invoices} quotes={quotes} tasks={tasks} />
                </div>
                <ProfitabilityCard invoices={invoices} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Monthly Revenue (Paid)</CardTitle></CardHeader>
                    <RevenueChart invoices={invoices} />
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Top Services / Products</CardTitle></CardHeader>
                    <TopServices invoices={invoices} />
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Invoice #</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Due Date</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInvoices.map(invoice => (
                                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4">{invoice.client.name}</td>
                                    <td className="px-6 py-4">{invoice.dueDate}</td>
                                    <td className="px-6 py-4">{formatCurrency(invoice.total)}</td>
                                    <td className="px-6 py-4">
                                        <Badge status={invoice.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};