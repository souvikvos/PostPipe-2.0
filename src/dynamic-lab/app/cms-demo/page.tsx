'use client';

import { useState, useEffect } from 'react';

// --- UI Components ---

const Input = ({ label, ...props }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
        <input
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-100"
            {...props}
        />
    </div>
);

const TextArea = ({ label, ...props }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
        <textarea
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-100"
            rows={3}
            {...props}
        />
    </div>
);

const Button = ({ children, isLoading, variant = 'primary', ...props }: any) => {
    const base = "font-bold py-2 px-4 rounded-md transition-all disabled:opacity-50 flex items-center justify-center";
    const variants: any = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        danger: "bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3"
    };
    return (
        <button className={`${base} ${variants[variant]}`} disabled={isLoading} {...props}>
            {isLoading ? '...' : children}
        </button>
    );
};

// --- Main Page Component ---

export default function CMSDemo() {
    const tabs = [
        { id: 'products', label: 'Store: Products', api: '/api/products' },
        { id: 'categories', label: 'Store: Categories', api: '/api/categories' },
        { id: 'posts', label: 'Blog: Posts', api: '/api/posts' },
        { id: 'comments', label: 'Blog: Comments', api: '/api/comments' },
        { id: 'reviews', label: 'Reviews', api: '/api/reviews' },
    ];

    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        setEditingId(null);
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(activeTab.api);
            const json = await res.json();
            if (json.success) setItems(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {};
        formData.forEach((value, key) => data[key] = value);

        // Auto-generate slugs/booleans for demo
        if (activeTab.id === 'products' || activeTab.id === 'categories') {
            data.slug = data.name.toLowerCase().replace(/ /g, '-');
            if (activeTab.id === 'products') data.images = ['https://via.placeholder.com/150'];
        }
        if (activeTab.id === 'posts') {
            data.slug = data.title.toLowerCase().replace(/ /g, '-');
            data.published = true;
        }
        if (activeTab.id === 'reviews') data.rating = Number(data.rating);
        if (activeTab.id === 'comments' && !data.post) {
            // Link to a dummy ID if user doesn't provide one (for demo purposes)
            // In real app, you'd select from dropdown
            data.post = "6578a9b1cde2f3a4b5c6d7e8";
        }

        try {
            const url = editingId ? `${activeTab.api}/${editingId}` : activeTab.api;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();

            if (result.success) {
                (e.target as HTMLFormElement).reset();
                setEditingId(null);
                fetchData();
                alert(editingId ? 'Updated successfully!' : 'Created successfully!');
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err) {
            alert('Failed to submit');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const res = await fetch(`${activeTab.api}/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                fetchData();
            } else {
                alert(json.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        // In a real app we would populate form fields. 
        // Here we just scroll to form and let user re-type for simplicity (or we can populate via DOM manually if simple)
        // For this demo, simply setting the ID switches the form to "Update Mode"
        alert(`Editing ${item.name || item.title || 'Item'}. Please fill the form with new values.`);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">PostPipe CMS Dashboard</h1>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab.id === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* CREATE / UPDATE FORM */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            {editingId ? 'Update Item' : 'Create New Item'}
                        </h2>
                        <form onSubmit={handleSubmit}>

                            {/* Dynamic Fields based on Active Tab */}

                            {(activeTab.id === 'products' || activeTab.id === 'categories') && (
                                <Input name="name" label="Name" placeholder="Item Name" required />
                            )}

                            {activeTab.id === 'products' && (
                                <Input name="price" type="number" label="Price" placeholder="0.00" required />
                            )}

                            {(activeTab.id === 'posts') && (
                                <>
                                    <Input name="title" label="Title" placeholder="Post Title" required />
                                    <Input name="author" label="Author" placeholder="Author Name" />
                                </>
                            )}

                            {(activeTab.id === 'comments' || activeTab.id === 'reviews') && (
                                <Input name="author" label="Author" placeholder="Your Name" required />
                            )}

                            {activeTab.id === 'comments' && (
                                <Input name="post" label="Post ID (Optional)" placeholder="Leave empty for demo default" />
                            )}

                            {activeTab.id === 'reviews' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Rating</label>
                                    <select name="rating" className="w-full p-2 border rounded-md">
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                    </select>
                                </div>
                            )}

                            <TextArea
                                name={activeTab.id === 'products' ? 'description' : 'content'}
                                label={activeTab.id === 'products' ? 'Description' : 'Content'}
                                placeholder="Content..."
                                required
                            />

                            <div className="flex gap-2 mt-4">
                                <Button type="submit" isLoading={loading}>
                                    {editingId ? 'Update' : 'Create'}
                                </Button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* LIST VIEW */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">
                            {items.length} {activeTab.label.split(': ')[1] || 'Items'}
                        </h2>
                        <button onClick={fetchData} className="text-blue-600 text-sm hover:underline">Refresh List</button>
                    </div>

                    {loading && <p className="text-gray-500">Loading...</p>}
                    {!loading && items.length === 0 && (
                        <div className="p-8 text-center bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
                            No items found. Create one!
                        </div>
                    )}

                    {items.map((item: any) => (
                        <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-gray-800">
                                        {item.name || item.title || (item.content ? item.content.substring(0, 20) + '...' : 'Item')}
                                    </h3>
                                    {item.price && <span className="text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded text-xs">${item.price}</span>}
                                    {item.rating && <span className="text-yellow-500 text-sm">{'⭐'.repeat(item.rating)}</span>}
                                </div>

                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                    {item.description || item.content || item.excerpt}
                                </p>

                                <div className="text-xs text-gray-400 mt-2 flex gap-3">
                                    <span>ID: {item._id}</span>
                                    {item.author && <span>By: {item.author}</span>}
                                    {item.category && <span>Cat: {item.category}</span>}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex gap-2 self-end sm:self-center">
                                <Button variant="secondary" onClick={() => handleEdit(item)}>Edit</Button>
                                <Button variant="danger" onClick={() => handleDelete(item._id)}>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
