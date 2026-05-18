"use client";

import { getGroceryList } from "@/lib/groceryList";
import Link from "next/link";

export default function GroceryListPage() {
    const groceryList = getGroceryList();
    return (
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className="w-full max-w-sm rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4">
                <h1>Grocery List</h1>
                <ul>
                    {groceryList.map((ingredient, index) => (
                        <li key={`${ingredient}-${index}`}>{ingredient}</li>
                    ))}
                </ul>
                <Link href="/">Back to Recipes</Link>
            </div>
        </main>
    )
}