"use client";
import { addIngredientsToGroceryList } from "@/lib/groceryList";

type AddToGroceryListButtonProps = {
    ingredients?: string[];
}

export default function AddToGroceryListButton(props: AddToGroceryListButtonProps) {
    return (
        <button
            className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
            onClick={() => {
                addIngredientsToGroceryList(props.ingredients ?? []);
                alert("Added to grocery list");
            }}
        >
            Add to Grocery List
        </button>
    )
}