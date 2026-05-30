"use client";
import { 
    addIngredientsToGroceryList,
    addRecipeSlugToGroceryList,
    getGroceryRecipeSlugs,
    removeIngredientsFromGroceryList,
    removeRecipeSlugFromGroceryList
 } from "@/lib/groceryList";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Ingredient } from "@/types/recipe";

type GroceryListButtonProps = {
    slug: string;
    ingredients: Ingredient[];
}

export default function GroceryListButton(props: GroceryListButtonProps) {
    const router  = useRouter();

    const [isInGroceryList, setIsInGroceryList] = useState(false);

    useEffect(() => {
        const groceryRecipeSlugs = getGroceryRecipeSlugs();

        setIsInGroceryList(groceryRecipeSlugs.includes(props.slug));
    }, [props.slug]);

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