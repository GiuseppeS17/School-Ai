import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PINECONE_API_KEY) {
    console.warn('Warning: PINECONE_API_KEY is not set.');
}

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

export const indexName = process.env.PINECONE_INDEX_NAME || 'school-ai-index';

export const getIndex = () => {
    return pinecone.index(indexName);
};
