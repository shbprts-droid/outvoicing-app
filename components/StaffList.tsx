import React, { useState } from 'react';
import type { StaffMember } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';

interface StaffListProps {
    staff: StaffMember[];
    setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

export const StaffList: React.FC<StaffListProps> = ({ staff, setStaff }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newStaffMember, setNewStaffMember] = useState<Omit<StaffMember, 'id'>>({ name: '', email: '', role: '' });
    
    const handleSave = () => {
        if (newStaffMember.name && newStaffMember.email && newStaffMember.role) {
            setStaff(prev => [...prev, { ...newStaffMember, id: `staff-${Date.now()}` }]);
            setNewStaffMember({ name: '', email: '', role: '' });
            setIsAdding(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <Button onClick={() => setIsAdding(true)}>
                    {ICONS.plus}
                    New Staff Member
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Staff Member</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <Input label="Full Name" placeholder="e.g. Jane Doe" value={newStaffMember.name} onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })} />
                        <Input label="Email" type="email" placeholder="jane@yourcompany.com" value={newStaffMember.email} onChange={(e) => setNewStaffMember({ ...newStaffMember, email: e.target.value })} />
                        <Input label="Role" placeholder="e.g. Developer" value={newStaffMember.role} onChange={(e) => setNewStaffMember({ ...newStaffMember, role: e.target.value })} />
                        
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    </div>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Staff</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                                    <td className="px-6 py-4">{member.email}</td>
                                    <td className="px-6 py-4">{member.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};