'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TemplateFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function TemplateForm({ initialData = {}, isEdit = false }: TemplateFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        slug: initialData.slug || '',
        category: initialData.category || '',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
        authorName: initialData.author?.name || '',
        authorProfileUrl: initialData.author?.profileUrl || '',
        thumbnailUrl: initialData.thumbnailUrl || '',
        demoGifUrl: initialData.demoGifUrl || '',
        cli: initialData.cli || '',
        aiPrompt: initialData.aiPrompt || '',
        npmPackageUrl: initialData.npmPackageUrl || '',
        version: initialData.version || '',
        isPublished: initialData.isPublished || false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            ...formData,
            tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
            author: {
                name: formData.authorName,
                profileUrl: formData.authorProfileUrl,
            },
            // Remove flattened fields
            authorName: undefined,
            authorProfileUrl: undefined,
        };

        try {
            const url = isEdit ? `/api/admin/templates/${initialData.slug}` : '/api/admin/templates';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            router.push('/admin');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {isEdit ? 'Edit Template' : 'New Template'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Fill in the details for the PostPipe template.
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                                Slug * (Unique)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="slug"
                                    id="slug"
                                    required
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="category"
                                    id="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                                Version
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="version"
                                    id="version"
                                    placeholder="e.g. 1.0.0"
                                    value={formData.version}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                Tags (comma separated)
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="tags"
                                    id="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="cli" className="block text-sm font-medium text-gray-700">
                                CLI Command *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="cli"
                                    id="cli"
                                    required
                                    placeholder="npx create-postpipe-app my-app"
                                    value={formData.cli}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="npmPackageUrl" className="block text-sm font-medium text-gray-700">
                                NPM Package URL *
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="npmPackageUrl"
                                    id="npmPackageUrl"
                                    required
                                    value={formData.npmPackageUrl}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-700">
                                AI Prompt (Tailored instructions)
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="aiPrompt"
                                    name="aiPrompt"
                                    rows={4}
                                    value={formData.aiPrompt}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">
                                Author Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="authorName"
                                    id="authorName"
                                    value={formData.authorName}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="authorProfileUrl" className="block text-sm font-medium text-gray-700">
                                Author Profile URL
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="authorProfileUrl"
                                    id="authorProfileUrl"
                                    value={formData.authorProfileUrl}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">
                                Thumbnail URL
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="thumbnailUrl"
                                    id="thumbnailUrl"
                                    value={formData.thumbnailUrl}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="demoGifUrl" className="block text-sm font-medium text-gray-700">
                                Demo GIF URL
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="demoGifUrl"
                                    id="demoGifUrl"
                                    value={formData.demoGifUrl}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <div className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input
                                        id="isPublished"
                                        name="isPublished"
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isPublished" className="font-medium text-gray-700">
                                        Published
                                    </label>
                                    <p className="text-gray-500">Visible to the public API</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
            {error && <div className="mt-4 text-red-600">{error}</div>}
        </form>
    );
}
