"use client";
import { clearGroceryList, getGroceryList } from "@/lib/groceryList";
import Link from "next/link";
import { useState } from "react";

export default function GroceryListPage() {
    const [groceryList, setGroceryList] = useState(getGroceryList());
    return (
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className="w-full max-w-sm rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4 space-y-4">
                <h1>Grocery List</h1>
                <section>
                    <ul>
                        {groceryList.map((ingredient, index) => (
                            <li key={`${ingredient}-${index}`}>{ingredient}</li>
                        ))}
                    </ul>
                </section>
                <section>
                    <Link 
                        href="/"
                        className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                    >
                        Back to Recipes
                    </Link>
                </section>
                <section>
                    <button
                        className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
                        onClick={() => {
                            clearGroceryList();
                            setGroceryList([]);
                        }}
                    >
                        Clear Grocery List
                    </button>
                </section>
            </div>
        </main>
    )
}