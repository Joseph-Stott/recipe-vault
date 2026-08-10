"use client";
import { 
    addIngredientsToGroceryList,
    addRecipeSlugToGroceryList,
    isRecipeInGroceryList,
    removeIngredientsFromGroceryList,
    removeRecipeSlugFromGroceryList,
    subscribeToGroceryRecipeSlugs,
 } from "@/lib/groceryList";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Ingredient } from "@/types/recipe";

type GroceryListButtonProps = {
    slug: string;
    ingredients: Ingredient[];
}

export default function GroceryListButton(props: GroceryListButtonProps) {
    const router  = useRouter();

    const isInGroceryList = useSyncExternalStore(
        subscribeToGroceryRecipeSlugs,
        () => isRecipeInGroceryList(props.slug),
        () => false
    );

    return (
        <button
            className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium hover:bg-zinc-800"
            onClick={() => {
                if(isInGroceryList) {
                    const confirmed = confirm("Remove from Grocery List?");

                    if (!confirmed) {
                        return;
                    } 

                    removeIngredientsFromGroceryList(props.ingredients);
                    removeRecipeSlugFromGroceryList(props.slug);
                    router.push("/");
                    return;
                }

                const confirmed = confirm("Add to Grocery List?");
                if (!confirmed) {
                    return;
                } 
                
                addIngredientsToGroceryList(props.ingredients);
                addRecipeSlugToGroceryList(props.slug);
                router.push("/");
            }}
        >
            {isInGroceryList ? "Remove from Grocery List" : "Add to Grocery List"}
        </button>
    );
}