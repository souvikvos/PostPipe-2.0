'use client';

import { useState, useEffect } from 'react';

export default function UploadDemo() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setUploadedUrl(data.url);
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-center">File Upload Demo</h1>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Choose an Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </button>

                    {uploadedUrl && (
                        <button
                            onClick={() => {
                                setFile(null);
                                setUploadedUrl(null);
                            }}
                            className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {uploadedUrl && (
                    <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-green-800 font-medium mb-2">Upload Successful!</p>
                        <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline break-all">
                            {uploadedUrl}
                        </a>
                        <img src={uploadedUrl} alt="Uploaded" className="mt-4 rounded-lg shadow-sm max-h-64 object-contain bg-white" />
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <h3 className="text-sm font-bold text-yellow-800 mb-2">Configuration Required</h3>
                <p className="text-sm text-yellow-700">
                    To make this work, ensure you have set these variables in your <code>.env</code> file:
                </p>
                <ul className="list-disc list-inside text-xs mt-2 text-yellow-600 font-mono">
                    <li>CLOUDINARY_CLOUD_NAME</li>
                    <li>CLOUDINARY_API_KEY</li>
                    <li>CLOUDINARY_API_SECRET</li>
                </ul>
            </div>
        </div>
    );
}
