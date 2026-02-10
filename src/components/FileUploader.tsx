import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocument } from '../services/api';

export function FileUploader() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await handleUpload(files[0]);
        }
    }, []);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        setUploadStatus('uploading');
        setMessage(`Sto caricando ${file.name}...`);

        try {
            const result = await uploadDocument(file);
            setUploadStatus('success');
            setMessage(`Fantastico! ${file.name} è stato elaborato in ${result.chunks} frammenti di conoscenza.`);

            // Reset after 3 seconds
            setTimeout(() => {
                setUploadStatus('idle');
                setMessage('');
            }, 5000);
        } catch (error: any) {
            setUploadStatus('error');
            setMessage(error.message || 'Ops, qualcosa è andato storto durante il caricamento.');
            console.error(error);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`
                    relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ease-in-out
                    ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}
                    ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
                    ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                    accept=".txt,.pdf"
                    disabled={uploadStatus === 'uploading'}
                />

                <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                    {uploadStatus === 'idle' && (
                        <>
                            <div className="p-4 rounded-full bg-primary/10 text-primary">
                                <Upload size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-text-main">Carica le tue lezioni</h3>
                                <p className="text-sm text-text-muted">Trascina qui i tuoi PDF o file di testo, oppure clicca per selezionare.</p>
                            </div>
                        </>
                    )}

                    {uploadStatus === 'uploading' && (
                        <>
                            <Loader2 size={48} className="text-primary animate-spin" />
                            <p className="font-medium text-primary">{message}</p>
                        </>
                    )}

                    {uploadStatus === 'success' && (
                        <>
                            <div className="p-4 rounded-full bg-green-100 text-green-600">
                                <CheckCircle size={40} />
                            </div>
                            <p className="font-medium text-green-700">{message}</p>
                        </>
                    )}

                    {uploadStatus === 'error' && (
                        <>
                            <div className="p-4 rounded-full bg-red-100 text-red-600">
                                <AlertCircle size={40} />
                            </div>
                            <p className="font-medium text-red-700">{message}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-xl border border-gray-100 flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-text-main">Supporto PDF</h4>
                        <p className="text-xs text-text-muted mt-1">Carica interi libri o dispense in formato PDF. L'IA leggerà tutto.</p>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-gray-100 flex items-start space-x-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-text-main">Appunti Veloci</h4>
                        <p className="text-xs text-text-muted mt-1">Carica file .txt con i tuoi appunti grezzi. L'IA li organizzerà.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
