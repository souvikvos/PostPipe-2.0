
"use client";

import React from 'react';
import { Terminal, Package, ShoppingCart, User, Database, Mail, BarChart3, Upload, Search, FileText, Bell, CreditCard, Box, LayoutPanelLeft, Wrench } from 'lucide-react';

const tools = [
    {
        category: "Core",
        command: "npx create-postpipe-connector",
        description: "The Essential Tool. Scaffolds the self-hosted database connector.",
        icon: <Database className="w-5 h-5 text-blue-400" />
    },
    {
        category: "Auth",
        command: "npx create-postpipe-auth",
        description: "Master Tool. Scaffolds a complete Authentication system (Login, Signup, DB, Email).",
        icon: <User className="w-5 h-5 text-emerald-400" />
    },
    {
        category: "E-commerce",
        command: "npx create-postpipe-ecommerce",
        description: "Full-stack shop backend & frontend logic.",
        icon: <ShoppingCart className="w-5 h-5 text-purple-400" />
    },
    {
        category: "E-commerce",
        command: "npx create-postpipe-shop",
        description: "Scaffolds specific Shop features like Cart and Wishlist.",
        icon: <ShoppingCart className="w-5 h-5 text-purple-300" />
    },
    {
        category: "E-commerce",
        command: "npx create-postpipe-delivery",
        description: "Delivery tracking and management components.",
        icon: <Box className="w-5 h-5 text-amber-400" />
    },
    {
        category: "E-commerce",
        command: "npx create-postpipe-payment",
        description: "Components for payment processing integration.",
        icon: <CreditCard className="w-5 h-5 text-indigo-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-appointment",
        description: "Appointment Booking System (Models, APIs).",
        icon: <Package className="w-5 h-5 text-orange-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-form",
        description: "Interactive Form APIs (Contact, Feedback, Newsletter).",
        icon: <FileText className="w-5 h-5 text-pink-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-profile",
        description: "User Profile management (Update Name, Change Password).",
        icon: <User className="w-5 h-5 text-cyan-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-cms",
        description: "Scaffolds simple Content Management System capabilities.",
        icon: <LayoutPanelLeft className="w-5 h-5 text-rose-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-search",
        description: "Scaffolds search functionality.",
        icon: <Search className="w-5 h-5 text-teal-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-notify",
        description: "Notification system (Emails, Alerts).",
        icon: <Bell className="w-5 h-5 text-yellow-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-analytics",
        description: "Analytics tracking components.",
        icon: <BarChart3 className="w-5 h-5 text-red-400" />
    },
    {
        category: "Features",
        command: "npx create-postpipe-upload",
        description: "File upload utilities.",
        icon: <Upload className="w-5 h-5 text-sky-400" />
    },
    {
        category: "Admin",
        command: "npx create-postpipe-admin",
        description: "Scaffolds an Admin Dashboard.",
        icon: <LayoutPanelLeft className="w-5 h-5 text-zinc-400" />
    },
    {
        category: "Utilities",
        command: "npx create-postpipe-crud",
        description: "Basic CRUD template.",
        icon: <Terminal className="w-5 h-5 text-gray-400" />
    },
    {
        category: "Utilities",
        command: "npx create-postpipe-email",
        description: "Sets up Resend email utility.",
        icon: <Mail className="w-5 h-5 text-lime-400" />
    },
];

// Helper to get ID from category name
const getCatId = (cat: string) => cat.toLowerCase().replace(" ", "-");

export default function DocsPage() {
    // Group tools per categories defined in Sidebar
    const categoriesOrder = ["Core", "Auth", "E-commerce", "Features", "Admin", "Utilities"];

    return (
        <div className="space-y-20 pb-20">

            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white tracking-tight">PostPipe Tools</h1>
                <p className="text-lg text-slate-400 max-w-2xl">
                    Browse the complete list of generative modules available in the PostPipe CLI.
                </p>
            </div>

            <div className="space-y-24">
                {categoriesOrder.map((catName) => {
                    const catTools = tools.filter(t => t.category === catName || (catName === "Utilities" && (t.category === "Dev" || t.category === "Utils")));

                    if (catTools.length === 0) return null;

                    return (
                        <section key={catName} id={getCatId(catName)} className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                                <h2 className="text-2xl font-semibold text-white">{catName}</h2>
                                <span className="text-xs font-mono text-slate-600 bg-white/5 px-2 py-1 rounded">
                                    {catTools.length} Modules
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {catTools.map((tool, idx) => (
                                    <div key={idx} className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all duration-200">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-black rounded-lg border border-white/10 group-hover:border-blue-500/30 transition-colors">
                                                    {tool.icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <code className="text-sm font-mono text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10">
                                                            {tool.command}
                                                        </code>
                                                    </div>
                                                    <p className="text-slate-400 text-sm leading-relaxed">
                                                        {tool.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-slate-200"
                                                onClick={() => navigator.clipboard.writeText(tool.command)}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                })}
            </div>

        </div>
    );
}
