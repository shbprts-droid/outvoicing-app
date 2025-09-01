import React from 'react';
import type { Appointment } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

interface BookingListProps {
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

export const BookingList: React.FC<BookingListProps> = ({ appointments, setAppointments }) => {

    const handleStatusChange = (appointmentId: string, status: 'Confirmed' | 'Cancelled') => {
        setAppointments(prev => 
            prev.map(appt => 
                appt.id === appointmentId ? { ...appt, status } : appt
            )
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Bookings & Appointments</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Incoming Requests</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    {appointments.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Client</th>
                                    <th scope="col" className="px-6 py-3">Date & Time</th>
                                    <th scope="col" className="px-6 py-3">Notes</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map(appt => (
                                    <tr key={appt.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{appt.clientName}</td>
                                        <td className="px-6 py-4">{appt.requestedDate} @ {appt.requestedTime}</td>
                                        <td className="px-6 py-4">{appt.notes}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                appt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            {appt.status === 'Pending' && (
                                                <>
                                                    {/* Fix: Removed redundant className as the new 'size' prop handles styling. */}
                                                    <Button size="sm" onClick={() => handleStatusChange(appt.id, 'Confirmed')}>Confirm</Button>
                                                    {/* Fix: Removed redundant className as the new 'size' prop handles styling. */}
                                                    <Button size="sm" variant="danger" onClick={() => handleStatusChange(appt.id, 'Cancelled')}>Cancel</Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No booking requests yet.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};