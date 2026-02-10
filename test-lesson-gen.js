
async function test() {
    try {
        console.log("Testing POST /api/lessons/generate...");
        const response = await fetch('http://localhost:3001/api/lessons/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseId: '6a6b533c-3aa2-4223-805b-f63ddb4bd3d1',
                chapterTitle: 'Introduction'
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);

    } catch (e) {
        console.error('Fetch error:', e);
    }
}

test();
