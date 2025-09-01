import React, { useState } from 'react';
import type { CustomForm, FormField, FormFieldType } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';

interface FormBuilderProps {
    forms: CustomForm[];
    setForms: React.Dispatch<React.SetStateAction<CustomForm[]>>;
}

const emptyForm: Omit<CustomForm, 'id'> = {
    title: '',
    description: '',
    fields: [],
};

export const FormBuilder: React.FC<FormBuilderProps> = ({ forms, setForms }) => {
    const [editingForm, setEditingForm] = useState<Omit<CustomForm, 'id'> | CustomForm | null>(null);

    const handleSaveForm = () => {
        if (!editingForm || !editingForm.title) return;

        if ('id' in editingForm) { // Editing
             setForms(forms.map(f => f.id === editingForm.id ? editingForm : f));
        } else { // Creating
            setForms([...forms, { ...editingForm, id: `form-${Date.now()}` }]);
        }
        setEditingForm(null);
    };

    const handleEditForm = (form: CustomForm) => {
        setEditingForm(JSON.parse(JSON.stringify(form))); // Deep copy to avoid mutation
    };

    const handleAddField = (type: FormFieldType) => {
        if (!editingForm) return;
        const newField: FormField = {
            id: `field-${Date.now()}`,
            label: 'New Field',
            type: type,
            required: false,
        };
        setEditingForm(prev => prev ? ({ ...prev, fields: [...prev.fields, newField] }) : null);
    };

    const handleFieldChange = (fieldId: string, value: string) => {
        if (!editingForm) return;
        setEditingForm(prev => prev ? ({
            ...prev,
            fields: prev.fields.map(f => f.id === fieldId ? { ...f, label: value } : f)
        }) : null);
    };

    const removeField = (fieldId: string) => {
        if (!editingForm) return;
        setEditingForm(prev => prev ? ({
            ...prev,
            fields: prev.fields.filter(f => f.id !== fieldId)
        }) : null);
    };


    if (editingForm) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">{'id' in editingForm ? 'Edit Form' : 'Create New Form'}</h1>
                <Card>
                    <div className="space-y-4">
                        <Input label="Form Title" value={editingForm.title} onChange={e => setEditingForm({...editingForm, title: e.target.value})} />
                        <Input label="Description" value={editingForm.description} onChange={e => setEditingForm({...editingForm, description: e.target.value})} />
                    </div>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Form Fields</CardTitle></CardHeader>
                    <div className="space-y-4">
                        {editingForm.fields.map((field) => (
                            <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                                <span className="text-gray-500 capitalize">{field.type}</span>
                                <Input className="flex-1" value={field.label} onChange={e => handleFieldChange(field.id, e.target.value)} />
                                <Button variant="danger" size="sm" onClick={() => removeField(field.id)}>{ICONS.trash}</Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="secondary" onClick={() => handleAddField('text')}>Add Text Field</Button>
                        <Button variant="secondary" onClick={() => handleAddField('textarea')}>Add Text Area</Button>
                    </div>
                </Card>
                 <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setEditingForm(null)}>Cancel</Button>
                    <Button onClick={handleSaveForm}>Save Form</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Custom Form Builder</h1>
                <Button onClick={() => setEditingForm(emptyForm)}>
                    {ICONS.plus}
                    New Form
                </Button>
            </div>
            <Card>
                <CardHeader><CardTitle>Your Forms</CardTitle></CardHeader>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Title</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Fields</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forms.map(form => (
                                <tr key={form.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{form.title}</td>
                                    <td className="px-6 py-4">{form.description}</td>
                                    <td className="px-6 py-4">{form.fields.length}</td>
                                    <td className="px-6 py-4">
                                        <Button size="sm" onClick={() => handleEditForm(form)}>Edit</Button>
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