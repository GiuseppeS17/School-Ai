import { FileUploader } from '../components/FileUploader';
import { Database, BookOpen } from 'lucide-react';

export function KnowledgePage() {
    return (
        <div className="max-w-5xl mx-auto pt-4 px-4 pb-12">
            <header className="mb-12">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-xl bg-accent-tools/10 text-accent-tools">
                        <Database size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-text-main">Knowledge Base</h1>
                </div>
                <p className="text-lg text-text-muted max-w-2xl">
                    Qui puoi caricare i materiali di studio. L'Avatar imparerà automaticamente da questi documenti e userà queste informazioni per rispondere alle domande degli studenti.
                </p>
            </header>

            <section className="mb-16">
                <FileUploader />
            </section>

            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <BookOpen className="text-text-muted" size={20} />
                    <h2 className="text-xl font-semibold text-text-main">Documenti Attivi</h2>
                </div>

                {/* Placeholder for list of documents */}
                <div className="bg-surface rounded-xl border border-gray-200 p-8 text-center">
                    <p className="text-text-muted italic">I documenti caricati appariranno qui (Funzionalità in arrivo)</p>
                </div>
            </section>
        </div>
    );
}
