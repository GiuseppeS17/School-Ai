import pdf from 'pdf-parse';

export const processDocument = async (fileBuffer: Buffer, mimeType: string): Promise<string> => {
    if (mimeType === 'application/pdf') {
        const data = await pdf(fileBuffer);
        // Normalize:
        // 1. Unify newlines
        // 2. Remove multiple spaces
        // 3. Try to clean up headers/footers in a basic way (lines with just numbers?) - maybe later
        let cleanText = data.text.replace(/\r\n/g, '\n');
        return cleanText;
    } else if (mimeType === 'text/plain') {
        return fileBuffer.toString('utf-8');
    } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
};

export const splitTextIntoChunks = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.length > 50) { // Filter out tiny useless chunks
            chunks.push(chunk);
        }
    }
    return chunks;
};
