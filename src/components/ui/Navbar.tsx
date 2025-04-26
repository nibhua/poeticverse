// Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 bg-white border-b z-50 flex items-center px-4 py-2 shadow">
            <Link to="/">
                <img src="/logo1.png" alt="Poeticverse Logo" className="h-10" />
            </Link>
            <h1 className="ml-4 text-xl font-bold">Poeticverse</h1>
            {/* You can add more navigation items here */}
        </header>
    );
}
