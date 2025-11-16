"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      const snap = await getDocs(collection(db, "vocab"));
      setCategories(snap.docs.map((doc) => doc.id));
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) return <p className="text-center mt-20 text-lg">Loading categories...</p>;

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-purple-600">📚 Vocab Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat}
            className="bg-white shadow-lg rounded-2xl p-6 text-center cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => router.push(`/category/${cat}`)}
          >
            <p className="text-xl font-semibold text-gray-800 capitalize">{cat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
