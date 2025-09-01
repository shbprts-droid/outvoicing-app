import { GoogleGenAI, Type } from "@google/genai";
import type { Invoice, Client, Quote, Product, Task } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Utility function to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            resolve('');
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractCompanyInfoFromDoc = async (file: File) => {
    try {
        const imagePart = await fileToGenerativePart(file);
        const prompt = `Analyze this document, which is a South African company registration document (CIPC). Extract the following details: Company Name, Registration Number, VAT Number (if present), and the main Physical Address. Provide the result as a JSON object.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING },
                        registrationNumber: { type: Type.STRING },
                        vatNumber: { type: Type.STRING, description: "Should be a 10-digit number starting with 4. If not found, return empty string." },
                        address: { type: Type.STRING }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error extracting company info:", error);
        throw new Error("Failed to analyze document. Please ensure it's a clear image or PDF of your company registration document.");
    }
};

export const generateInvoiceSummary = async (lineItems: string) => {
    if (!lineItems.trim()) return "";
    try {
        const prompt = `Based on the following line items for an invoice, generate a single, concise, professional summary sentence to be used as the overall invoice description. Line items: ${lineItems}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Failed to generate summary.";
    }
};

export const askTollieB = async (question: string, invoices: Invoice[], clients: Client[]) => {
    if (!question.trim()) return "Please ask a question.";
    try {
        const context = `
            Here is the current data for the business.
            Invoices: ${JSON.stringify(invoices, null, 2)}
            Clients: ${JSON.stringify(clients, null, 2)}
        `;

        const systemInstruction = `You are TollieB AI, an expert financial assistant for South African small businesses using the Outvoicing app. Your tone is helpful, professional, and encouraging. Based on the provided JSON data of invoices and clients, answer the user's question accurately. Format your answers clearly using markdown for lists, bolding, etc. if it improves readability. All monetary values are in South African Rand (ZAR). Do not mention that you are an AI or that you were given JSON data. Just answer the question as a helpful assistant with access to the user's business data.`;

        const fullPrompt = `${context}\n\nUser's question: "${question}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error with TollieB AI:", error);
        return "I'm sorry, I encountered a problem while trying to answer your question. Please try again later.";
    }
};

export const createDraftInvoiceFromText = async (text: string, clients: Client[]) => {
    if (!text.trim()) {
        throw new Error("Input text cannot be empty.");
    }

    try {
        const prompt = `
        You are an intelligent assistant for an invoicing app. Analyze the following text, which could be from an email or a WhatsApp message, and extract details to create a draft invoice.

        Here is the list of existing clients you can match against:
        ${JSON.stringify(clients.map(c => ({ id: c.id, name: c.name })))}

        Analyze this text:
        ---
        ${text}
        ---

        Extract the client's name and match it to one from the provided list. Also, extract all line items with their description, quantity, and rate if possible. If quantity or rate is not mentioned, make a reasonable assumption (e.g., quantity 1). Return a JSON object. The client object must contain the ID of the matched client.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        client: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "ID of the matched client from the list." },
                                name: { type: Type.STRING, description: "Name of the matched client." },
                            }
                        },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING },
                                    quantity: { type: Type.NUMBER },
                                    rate: { type: Type.NUMBER },
                                }
                            }
                        },
                        notes: {
                            type: Type.STRING,
                            description: "A brief summary of the request."
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error creating draft invoice from text:", error);
        throw new Error("Failed to understand the provided text. Please ensure it contains clear details about the client and services.");
    }
};

export const extractExpenseFromReceipt = async (file: File) => {
    try {
        const imagePart = await fileToGenerativePart(file);
        const prompt = `Analyze this image of a receipt. Extract the vendor or store name, the transaction date, and the final total amount. The date should be in YYYY-MM-DD format. The amount should be a number. Provide the result as a JSON object.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vendor: { type: Type.STRING },
                        date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                        amount: { type: Type.NUMBER }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as { vendor: string; date: string; amount: number };

    } catch (error) {
        console.error("Error extracting expense from receipt:", error);
        throw new Error("Failed to analyze the receipt. Please try a clearer image.");
    }
};


// AI Admin Tools

export const generateEmailOrMessage = async (context: {
    type: 'reminder' | 'quote_follow_up' | 'thank_you';
    invoice?: Invoice;
    quote?: Quote;
    client: Client;
    companyName: string;
}) => {
    let prompt = `You are an admin assistant for a South African small business called "${context.companyName}". Your tone is polite, professional, and friendly. Draft an email body based on the following request. Keep it concise.\n\n`;

    switch (context.type) {
        case 'reminder':
            prompt += `Request: Draft a payment reminder for invoice ${context.invoice?.invoiceNumber} which was due on ${context.invoice?.dueDate}. The total amount is ${context.invoice?.currency} ${context.invoice?.total}. The client's name is ${context.client.name}.`;
            break;
        case 'quote_follow_up':
            prompt += `Request: Draft a follow-up message regarding quote ${context.quote?.quoteNumber} sent to ${context.client.name}. The quote total is ${context.quote?.currency} ${context.quote?.total} and it expires on ${context.quote?.expiryDate}. Ask if they have any questions.`;
            break;
        case 'thank_you':
            prompt += `Request: Draft a thank you message to ${context.client.name} for their payment of invoice ${context.invoice?.invoiceNumber}.`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating email:", error);
        throw new Error("Failed to generate the message.");
    }
};

export const generateDocument = async (context: {
    type: 'contract' | 'terms_and_conditions' | 'delivery_note' | 'public_officer_letter';
    client: Client;
    company: { name: string, address: string };
    invoice?: Invoice;
}) => {
    let prompt = `You are a legal assistant for a South African small business. Generate a simple business document based on the following details. This is for illustrative purposes and not legally binding legal advice.\n\n`;
    prompt += `Business Name: ${context.company.name}\nClient Name: ${context.client.name}\n\n`;

    switch (context.type) {
        case 'contract':
            const services = context.invoice?.items.map(i => i.description).join(', ') || '[List of Services]';
            prompt += `Generate a simple one-page Service Level Agreement (SLA) for the following services: ${services}. The total value is ${context.invoice?.currency} ${context.invoice?.total}. Include standard clauses for services, payment, and confidentiality.`;
            break;
        case 'terms_and_conditions':
            prompt += `Generate a standard set of Terms and Conditions for a service-based business in South Africa. Include clauses on payment terms (e.g., 30 days), scope of work, liability, and termination.`;
            break;
        case 'delivery_note':
            const deliveryItems = context.invoice?.items.map(i => `- ${i.quantity} x ${i.description}`).join('\n') || '[List of Items]';
            prompt += `Generate a simple Delivery Note for invoice ${context.invoice?.invoiceNumber}.\n\nDelivery Address: ${context.client.address}\n\nItems:\n${deliveryItems}\n\nInclude fields for "Received by (Name & Signature)" and "Date".`;
            break;
        case 'public_officer_letter':
            prompt += `Generate a formal letter for a bank or official body, confirming that the Public Officer of ${context.company.name} is [Public Officer Name]. The company's registration number is [Registration Number] and its registered address is ${context.company.address}. The letter should be on a company letterhead (indicate where the logo goes). Include a signature line for a director.`;
            break;
    }
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating document:", error);
        throw new Error("Failed to generate the document.");
    }
};

export const generateTaskSchedule = async (invoice: Invoice): Promise<Omit<Task, 'id' | 'status'>[]> => {
     try {
        const prompt = `
        Based on the line items of this invoice for "${invoice.client.name}", generate a simple project schedule with key tasks and estimated due dates. The invoice was issued on ${invoice.issueDate}.
        Line Items: ${invoice.items.map(i => `${i.quantity} x ${i.description}`).join(', ')}.
        Return a JSON array of tasks. Each task object should have a "title" and a "dueDate".
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            dueDate: { type: Type.STRING, description: "YYYY-MM-DD format" }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating task schedule:", error);
        throw new Error("Failed to generate the schedule.");
    }
};


export const forecastStock = async (invoices: Invoice[], products: Product[]) => {
    try {
        const prompt = `
        You are a stock management AI. Analyze the sales data from the provided paid invoices and the current stock levels for the products.
        - A product needs reordering if its "currentStock" is at or below its "reorderPoint".
        - Calculate the average monthly sales for each product over the last 3 months.
        - Based on current stock, reorder points, and sales velocity, predict which products need reordering soon.
        - Provide a brief summary and a list of products with high reorder urgency, explicitly stating why (e.g., "below reorder point", "high sales velocity").
        
        Today's date is ${new Date().toISOString().split('T')[0]}.

        Products Data (with reorder points): ${JSON.stringify(products)}
        Paid Invoices Data: ${JSON.stringify(invoices.filter(i => i.status === 'Paid'))}

        Return a single text string with your analysis. Use markdown for formatting.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error forecasting stock:", error);
        throw new Error("Failed to generate stock forecast.");
    }
};

export const generateKycRequestEmail = async (clientName: string, missingDocs: string[]) => {
    try {
        const prompt = `
        You are an admin assistant for a South African small business. Your tone is polite, professional, and friendly. 
        Draft a concise email to a client named "${clientName}" requesting them to upload their FICA/KYC documents for compliance purposes.
        The following documents are required: ${missingDocs.join(', ')}.
        Explain that they can upload these securely through their client portal.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating KYC request email:", error);
        throw new Error("Failed to generate the KYC request email.");
    }
};