import React, { useState, useCallback } from 'react';
import type { CompanyProfile, PaymentGateway } from '../types';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ICONS } from '../constants';
import { extractCompanyInfoFromDoc } from '../services/geminiService';

interface SettingsProps {
    profile: CompanyProfile;
    setProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
}

export const Settings: React.FC<SettingsProps> = ({ profile, setProfile }) => {
    const [localProfile, setLocalProfile] = useState<CompanyProfile>(profile);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDocUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        try {
            const info = await extractCompanyInfoFromDoc(file);
            setLocalProfile(prev => ({
                ...prev,
                name: info.companyName || prev.name,
                registrationNumber: info.registrationNumber || prev.registrationNumber,
                vatNumber: info.vatNumber || prev.vatNumber,
                address: info.address || prev.address,
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalProfile(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        setProfile(localProfile);
        alert("Settings saved!");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Auto-fill Company Info</CardTitle>
                </CardHeader>
                <p className="text-sm text-gray-600 mb-4">Upload your company registration document (e.g., CIPC document) and we'll use AI to fill in your details.</p>
                <input type="file" id="doc-upload" className="hidden" accept="image/*,.pdf" onChange={handleDocUpload} />
                <Button onClick={() => document.getElementById('doc-upload')?.click()} disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : <> {ICONS.upload} Upload Document</>}
                </Button>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Company Name" name="name" value={localProfile.name} onChange={handleChange} />
                        <Input label="Registration Number" name="registrationNumber" value={localProfile.registrationNumber} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="VAT Number" name="vatNumber" value={localProfile.vatNumber} onChange={handleChange} />
                        <Input label="Invoice Prefix" name="invoicePrefix" value={localProfile.invoicePrefix} onChange={handleChange} />
                    </div>
                    <Input label="Address" name="address" value={localProfile.address} onChange={handleChange} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                        <div className="flex items-center gap-4">
                            {localProfile.logo && <img src={localProfile.logo} alt="Company Logo" className="h-16 w-16 object-contain rounded-md border" />}
                            <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            <Button variant="secondary" onClick={() => document.getElementById('logo-upload')?.click()}>Upload Logo</Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Financial Settings</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                     <Input 
                        label="Default Tax Rate (%)" 
                        name="taxRate" 
                        type="number"
                        value={localProfile.taxRate} 
                        onChange={e => setLocalProfile(prev => ({...prev, taxRate: parseFloat(e.target.value) || 0}))} 
                        />
                    <Input label="Default Terms & Conditions" name="defaultTerms" value={localProfile.defaultTerms} onChange={handleChange} />
                    <Input label="Bank Details" name="bankDetails" value={localProfile.bankDetails} onChange={handleChange} />
                </div>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Payment Gateway</CardTitle>
                </CardHeader>
                 <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Gateway</label>
                         <select name="preferredGateway" value={localProfile.preferredGateway} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                            <option value="payfast">PayFast</option>
                            <option value="yoco">Yoco</option>
                        </select>
                    </div>
                    {localProfile.preferredGateway === 'payfast' && (
                        <>
                         <p className="text-sm text-gray-600">Enter your PayFast details. Use sandbox credentials for testing.</p>
                         <Input label="PayFast Merchant ID" name="payfastMerchantId" value={localProfile.payfastMerchantId || ''} onChange={handleChange} />
                         <Input label="PayFast Merchant Key" name="payfastMerchantKey" value={localProfile.payfastMerchantKey || ''} onChange={handleChange} />
                        </>
                    )}
                     {localProfile.preferredGateway === 'yoco' && (
                        <>
                         <p className="text-sm text-gray-600">Enter your Yoco API keys. Use test keys for development.</p>
                         <Input label="Yoco Public Key" name="yocoPublicKey" value={localProfile.yocoPublicKey || ''} onChange={handleChange} />
                         <Input label="Yoco Secret Key" name="yocoSecretKey" value={localProfile.yocoSecretKey || ''} onChange={handleChange} />
                        </>
                    )}
                </div>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Save Settings</Button>
            </div>
        </div>
    );
};
