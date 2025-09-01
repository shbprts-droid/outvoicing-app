
import React, { useState } from 'react';
import type { Product } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';

interface ProductListProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const ProductList: React.FC<ProductListProps> = ({ products, setProducts }) => {
    const [editingProduct, setEditingProduct] = useState<Product | Partial<Product> | null>(null);
    const emptyProduct: Partial<Product> = { name: '', sku: '', currentStock: 0, price: 0, cost: 0, reorderPoint: 0 };
    
    const handleSave = () => {
        if (!editingProduct || !editingProduct.name) return;

        if ('id' in editingProduct && editingProduct.id) { // Editing existing
            setProducts(products.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
        } else { // Adding new
            setProducts([...products, { ...editingProduct, id: `prod-${Date.now()}` } as Product]);
        }
        setEditingProduct(null);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
    };
    
    const handleAddNew = () => {
        setEditingProduct(emptyProduct);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditingProduct(prev => prev ? ({ ...prev, [name]: name === 'name' || name === 'sku' ? value : parseFloat(value) || 0 }) : null);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Products & Inventory</h1>
                {!editingProduct && <Button onClick={handleAddNew}>{ICONS.plus}New Product</Button>}
            </div>

            {editingProduct && (
                <Card>
                    <CardHeader>
                        <CardTitle>{'id' in editingProduct && editingProduct.id ? 'Edit Product' : 'Add New Product'}</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Input label="Product Name" name="name" value={editingProduct.name || ''} onChange={handleChange} />
                           <Input label="SKU" name="sku" value={editingProduct.sku || ''} onChange={handleChange} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <Input label="Current Stock" name="currentStock" type="number" value={editingProduct.currentStock || ''} onChange={handleChange} />
                           <Input label="Price (ZAR)" name="price" type="number" value={editingProduct.price || ''} onChange={handleChange} />
                           <Input label="Cost (ZAR)" name="cost" type="number" value={editingProduct.cost || ''} onChange={handleChange} />
                        </div>
                        <Input label="Reorder Point" name="reorderPoint" type="number" placeholder="e.g. 10" value={editingProduct.reorderPoint || ''} onChange={handleChange} />

                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setEditingProduct(null)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Product</Button>
                        </div>
                    </div>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Stock</th>
                                <th scope="col" className="px-6 py-3">Reorder Pt.</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4">{product.sku}</td>
                                    <td className={`px-6 py-4 font-bold ${product.currentStock <= (product.reorderPoint || 0) ? 'text-status-overdue' : ''}`}>{product.currentStock}</td>
                                    <td className="px-6 py-4">{product.reorderPoint || 'N/A'}</td>
                                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleEdit(product)} className="font-medium text-brand-secondary hover:underline">
                                            Edit
                                        </button>
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