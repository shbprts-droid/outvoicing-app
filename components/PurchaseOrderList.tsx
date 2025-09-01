import React from 'react';
import type { PurchaseOrder } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface PurchaseOrderListProps {
    purchaseOrders: PurchaseOrder[];
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({ purchaseOrders }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Purchase Orders</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    {purchaseOrders.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">PO #</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Supplier</th>
                                    <th scope="col" className="px-6 py-3">Items</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.map(po => (
                                    <tr key={po.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{po.poNumber}</td>
                                        <td className="px-6 py-4">{po.date}</td>
                                        <td className="px-6 py-4">{po.supplier}</td>
                                        <td className="px-6 py-4">
                                            <ul className="list-disc list-inside">
                                                {po.items.map(item => (
                                                    <li key={item.productId}>{item.quantity} x {item.productName}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800`}>
                                                {po.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No purchase orders have been generated yet.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};
