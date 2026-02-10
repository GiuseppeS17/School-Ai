export function SecurityPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Cyber Security Modules</h2>
            <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-surface rounded-lg border border-gray-700 border-l-4 border-l-red-500">
                    <h3 className="font-bold text-lg">Phishing Awareness</h3>
                    <p className="text-gray-400">Learn how to spot fake emails.</p>
                </div>
                <div className="p-4 bg-surface rounded-lg border border-gray-700 border-l-4 border-l-green-500">
                    <h3 className="font-bold text-lg">Password Security</h3>
                    <p className="text-gray-400">Best practices for strong passwords.</p>
                </div>
            </div>
        </div>
    );
}
