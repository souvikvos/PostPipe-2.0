'use client';

import { useState, useEffect } from 'react';

export default function SearchDemo() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                sort,
                limit: limit.toString(),
                page: page.toString()
            });
            const res = await fetch(`/api/search-demo?${params.toString()}`);
            const json = await res.json();
            if (json.success) setProducts(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search slightly
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, sort, limit, page]);

    return (
        <div className="max-w-6xl mx-auto p-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Search & Pagination Demo</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-center">

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">SEARCH</label>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                <div className="w-40">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">SORT BY</label>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="-createdAt">Newest First</option>
                        <option value="createdAt">Oldest First</option>
                        <option value="price">Price (Low to High)</option>
                        <option value="-price">Price (High to Low)</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </div>

                <div className="w-24">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">LIMIT</label>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-400">No products found matching your search.</div>
                    ) : (
                        products.map((product: any) => (
                            <div key={product._id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                {(product.images?.[0]) && (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4 bg-gray-50" />
                                )}
                                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-green-600 font-bold">${product.price}</span>
                                    <span className="text-xs text-gray-400">Stock: {product.stock || 0}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="flex justify-center gap-4 mt-8">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-4 py-2 border rounded bg-gray-50">Page {page}</span>
                <button
                    disabled={products.length < limit}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
