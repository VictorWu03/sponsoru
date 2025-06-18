'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Item {
  id: number;
  name: string;
  description: string;
}

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        // Method 1: Direct Supabase query from frontend
        const { data, error } = await supabase
          .from('items')
          .select('*');

        if (error) throw new Error(error.message);
        setItems(data || []);

        // Method 2: Using backend API
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/items`);
        // if (!response.ok) throw new Error('Failed to fetch items from API');
        // const data = await response.json();
        // setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) return <div className="p-4">Loading items...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Items List</h2>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 