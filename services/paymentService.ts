import type { Invoice, CompanyProfile } from '../types';

const PAYFAST_URL = 'https://sandbox.payfast.co.za/eng/process';
const YOCO_POPUP_URL = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'; // Example

const redirectToPayFast = (invoice: Invoice, profile: CompanyProfile) => {
    if (!profile.payfastMerchantId || !profile.payfastMerchantKey) {
        alert("PayFast settings are not configured. Please add your Merchant ID and Key in Settings.");
        return;
    }
    
    const formData = {
        merchant_id: profile.payfastMerchantId,
        merchant_key: profile.payfastMerchantKey,
        return_url: `${window.location.origin}?payment_status=success`,
        cancel_url: `${window.location.origin}?payment_status=cancelled`,
        notify_url: `${window.location.origin}/api/payfast-notify`,
        name_first: invoice.client.name.split(' ')[0],
        name_last: invoice.client.name.split(' ').slice(1).join(' '),
        email_address: invoice.client.email,
        m_payment_id: invoice.invoiceNumber,
        amount: invoice.total.toFixed(2),
        item_name: `Invoice ${invoice.invoiceNumber} - ${profile.name}`,
        item_description: invoice.items.map(i => i.description).join(', '),
    };

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYFAST_URL;
    form.style.display = 'none';

    for (const key in formData) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = (formData as any)[key];
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

// Placeholder for Yoco integration. A real implementation would use their SDK.
const redirectToYoco = (invoice: Invoice, profile: CompanyProfile) => {
     if (!profile.yocoPublicKey) {
        alert("Yoco settings are not configured. Please add your Public Key in Settings.");
        return;
    }
    alert(`
        Simulating Yoco Payment Gateway...
        -----------------------------------
        Public Key: ${profile.yocoPublicKey}
        Amount: ${invoice.currency} ${invoice.total.toFixed(2)}
        For Invoice: ${invoice.invoiceNumber}
        
        In a real app, the Yoco SDK would open a payment popup here.
    `);
};

/**
 * Redirects to the appropriate payment gateway based on company settings.
 * @param invoice - The invoice to be paid.
 * @param profile - The company profile containing merchant details.
 */
export const handlePaymentRedirect = (invoice: Invoice, profile: CompanyProfile) => {
    switch (profile.preferredGateway) {
        case 'payfast':
            redirectToPayFast(invoice, profile);
            break;
        case 'yoco':
            redirectToYoco(invoice, profile);
            break;
        default:
            alert('No payment gateway selected or supported.');
    }
};
