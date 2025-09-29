import React from "react";
import Head from "next/head";

export default function Layout({ children, title = "CRM" }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* HEADER */}
        <header className="bg-white border-b shadow-sm px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">🚀 CRM</h1>
        </header>

        {/* CONTENU */}
        <main className="flex-1 p-6">{children}</main>

        {/* FOOTER */}
        <footer className="bg-gray-100 text-center py-3 text-sm text-gray-500">
          © {new Date().getFullYear()} - Mon CRM
        </footer>
      </div>
    </>
  );
}
