import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "PostPipe Dynamic Hub",
    description: "Component Marketplace",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
