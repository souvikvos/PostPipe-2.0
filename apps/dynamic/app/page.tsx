"use client";

import { Button } from "@postpipe/ui";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <h1 className="text-4xl font-bold">PostPipe Hub</h1>
                <p>The Dynamic Component Marketplace</p>
                <Button onClick={() => alert('Dynamic')}>Explore</Button>
            </div>
        </main>
    );
}
