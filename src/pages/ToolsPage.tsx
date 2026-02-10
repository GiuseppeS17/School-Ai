export function ToolsPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">AI Tools Repository</h2>
            <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-surface rounded-lg border border-gray-700">
                    <h3 className="font-bold text-lg">Tool #1 Name</h3>
                    <p className="text-gray-400">Description of the tool goes here.</p>
                </div>
                <div className="p-4 bg-surface rounded-lg border border-gray-700">
                    <h3 className="font-bold text-lg">Tool #2 Name</h3>
                    <p className="text-gray-400">Description of the tool goes here.</p>
                </div>
            </div>
        </div>
    );
}
