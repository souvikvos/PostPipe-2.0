import Link from "next/link";

const categories = [
    { name: "Core", href: "#core" },
    { name: "Auth", href: "#auth" },
    { name: "E-commerce", href: "#ecommerce" },
    { name: "Features", href: "#features" },
    { name: "Admin", href: "#admin" },
    { name: "Utilities", href: "#utils" },
];

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-black text-slate-200 selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 w-72 h-screen border-r border-white/10 bg-black/50 backdrop-blur-xl p-8 overflow-y-auto z-10 hidden md:block">
                <div className="mb-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                        P
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">PostPipe Docs</span>
                </div>

                <nav className="space-y-8">
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            CLI Ecosystem
                        </h4>
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat.name}>
                                    <Link
                                        href={cat.href}
                                        className="block text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium"
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            Resources
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="https://github.com/Sourodip-1/PostPipe-2.0" target="_blank" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                    GitHub Repo
                                </a>
                            </li>
                            <li>
                                <a href="/" className="block text-sm text-slate-400 hover:text-white transition-colors">
                                    Back to Lab
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 min-h-screen relative">
                <div className="max-w-4xl mx-auto p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
