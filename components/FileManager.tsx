import React, { useState } from 'react';
import type { ManagedFile, Client } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { ICONS } from '../constants';

interface FileManagerProps {
    files: ManagedFile[];
    setFiles: React.Dispatch<React.SetStateAction<ManagedFile[]>>;
    clients: Client[];
}

export const FileManager: React.FC<FileManagerProps> = ({ files, setFiles, clients }) => {
    const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (!uploadedFile || !selectedClientId) return;

        const newFile: ManagedFile = {
            id: `file-${Date.now()}`,
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            clientId: selectedClientId,
            uploadDate: new Date().toISOString().split('T')[0],
            // Fix: Added the required 'tag' property to match the ManagedFile type.
            tag: 'General',
        };

        setFiles(prev => [...prev, newFile]);
    };
    
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Smart File Manager</h1>

            <Card>
                <CardHeader><CardTitle>Upload New File</CardTitle></CardHeader>
                <div className="flex items-center gap-4">
                     <div>
                        <label htmlFor="client-file-select" className="block text-sm font-medium text-gray-700 mb-1">Tag to Client</label>
                        <select id="client-file-select" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm">
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <Button onClick={() => fileInputRef.current?.click()} className="self-end">{ICONS.upload}Upload</Button>
                </div>
            </Card>

            <Card>
                <CardHeader><CardTitle>All Files</CardTitle></CardHeader>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">File Name</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Upload Date</th>
                                <th scope="col" className="px-6 py-3">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => (
                                <tr key={file.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{file.name}</td>
                                    <td className="px-6 py-4">{clients.find(c => c.id === file.clientId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{file.uploadDate}</td>
                                    <td className="px-6 py-4">{formatBytes(file.size)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};