import fs from 'fs/promises';
import path from 'path';

interface DocumentChunk {
    id: string;
    text: string;
    source: string;
    embedding: number[];
}

const STORAGE_FILE = 'vector_store.json';
const STORAGE_PATH = path.join(__dirname, '../../data', STORAGE_FILE);

// Ensure data directory exists
const ensureDataDir = async () => {
    const dir = path.dirname(STORAGE_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
};

let memoryStore: DocumentChunk[] = [];

// Cosine similarity function
const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
};

export const VectorStore = {
    async addDocuments(chunks: DocumentChunk[]) {
        await ensureDataDir();
        // Load existing if empty (on start)
        if (memoryStore.length === 0) {
            try {
                const data = await fs.readFile(STORAGE_PATH, 'utf-8');
                memoryStore = JSON.parse(data);
            } catch (e) {
                // File doesn't exist yet, ignore
            }
        }

        memoryStore.push(...chunks);
        await fs.writeFile(STORAGE_PATH, JSON.stringify(memoryStore, null, 2));
        console.log(`Saved ${chunks.length} chunks to vector store.`);
    },

    async search(queryEmbedding: number[], limit: number = 3): Promise<DocumentChunk[]> {
        // Ensure store is loaded
        if (memoryStore.length === 0) {
            try {
                const data = await fs.readFile(STORAGE_PATH, 'utf-8');
                memoryStore = JSON.parse(data);
            } catch (e) {
                return []; // Store empty
            }
        }

        const scored = memoryStore.map(doc => ({
            doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        // Sort descending by score
        scored.sort((a, b) => b.score - a.score);

        return scored.slice(0, limit).map(s => s.doc);
    },

    async loadStore() {
        try {
            await ensureDataDir();
            const data = await fs.readFile(STORAGE_PATH, 'utf-8');
            memoryStore = JSON.parse(data);
            console.log(`Loaded ${memoryStore.length} chunks from disk.`);
        } catch (e) {
            console.log("No vector store found, starting fresh.");
            memoryStore = [];
        }
    }
};
