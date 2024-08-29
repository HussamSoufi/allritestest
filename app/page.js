'use client'; // This is important if you're using client-side navigation

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard'); // Use 'push' to add to history, or 'replace' to replace current entry
  }, [router]);

  return null; // You can optionally render a loading indicator or message here
}