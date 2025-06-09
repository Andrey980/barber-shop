'use client';
import React from 'react';
import Link from 'next/link';

<header className="bg-gray-900 text-white p-4 flex justify-between">
          <h1 className="text-xl font-bold">Barbearia</h1>
          <nav className="flex gap-4">
            <Link href="/" className="hover:underline">
              Início
            </Link>
            <Link href="/services" className="hover:underline">
              Serviços
            </Link>
          </nav>
</header>