
import React from 'react';
import type { InvoiceStatus } from '../../types';

interface BadgeProps {
    status: InvoiceStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
    const statusClasses: Record<InvoiceStatus, string> = {
        Paid: 'bg-status-paid/20 text-status-paid',
        Pending: 'bg-status-pending/20 text-status-pending',
        Overdue: 'bg-status-overdue/20 text-status-overdue',
        Draft: 'bg-status-draft/20 text-status-draft',
        Partial: 'bg-blue-100 text-blue-800'
    };
    
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
            {status}
        </span>
    );
};
