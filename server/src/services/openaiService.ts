import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is not set.');
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getEmbedding = async (text: string) => {
    const embeddings = await getEmbeddings([text]);
    return embeddings[0];
};

export const getEmbeddings = async (texts: string[]) => {
    // OpenAI allows strict separate of inputs in an array for batching
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
    });
    // Ensure the order matches the input by sorting by index just in case, though usually guaranteed
    return response.data.map(item => item.embedding);
};

export const getChatCompletion = async (messages: any[]) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
    });
    return response.choices[0].message.content;
};

export const generateCourseOutline = async (textContext: string): Promise<{ title: string; chapters: { title: string; start_context: string }[] }> => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set");
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert educational content organizer. 
                    Analyze the provided text (which is the beginning of a document/book) and extract the Table of Contents.
                    
                    **IMPORTANT RULES**:
                    1. **INCLUDE** all logical sections, including "Introduction", "Preface", etc., if they contain valuable content.
                    2. **SKIP** only completely non-structural items like "Title Page", "Copyright", "Dedication".
                    3. Try to organize into a clean hierarchy.
                    
                    Return a JSON object with:
                    - "title": The likely title of the book/document.
                    - "chapters": An array of objects, each having:
                        - "title": Chapter name.
                        - "start_context": A unique 5-10 word phrase from the text that likely marks the start of this chapter (if found in the excerpt), or simply a description of what it covers.
                    
                    If specific chapters aren't clear, organize the content into logical "Lessons" based on topic.`
                },
                {
                    role: "user",
                    content: `Here is the beginning of the document (approx 15k chars):\n\n${textContext}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content generated");

        return JSON.parse(content);
    } catch (error) {
        console.error("Error generating outline:", error);
        // Fallback
        return { title: "Uploaded Document", chapters: [] };
    }
};
