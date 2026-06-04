"use client";
import { clearGroceryList, getGroceryList, clearGroceryRecipeSlugs, toggleGroceryItemsChecked, clearCheckedGroceryItems, type GroceryListItem } from "@/lib/groceryList";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

type DisplayGroceryItem = GroceryListItem & {
    ids: string[];
};

// Used so "cup" and "cups" can combine
function normalizeUnit(unit: string) {
    return unit.toLowerCase().trim().replace(/s$/, "");
}

// Used so "Milk" and "milk" can combine
function normalizeName(name: string) {
    return name.toLowerCase().trim();
}

function formatUnit(amount: number | "", unit: string) {
    if (amount === 1 || amount === "") {
        return normalizeUnit(unit);
    }

    return `${normalizeUnit(unit)}s`;
}

export default function GroceryListPage() {
    const [groceryList, setGroceryList] = useState<GroceryListItem[]>([]);

    const router = useRouter();

    useEffect(() => {
        setGroceryList(getGroceryList());
    }, []);

    const sortedGroceryList = [...groceryList].sort((a, b) => {
        if (a.checked === b.checked) {
            return 0;
        }

        return a.checked ? 1 : -1;
    });

    const hasCheckedItems = groceryList.some((ingredient) => ingredient.checked);
    
    const combinedGroceryList = sortedGroceryList.reduce<DisplayGroceryItem[]>(
        (combinedItems, ingredient) => {
            const matchingItem = combinedItems.find(
                (item) =>
                    normalizeName(item.name) === normalizeName(ingredient.name) &&
                    normalizeUnit(item.unit) === normalizeUnit(ingredient.unit) &&
                    item.checked === ingredient.checked &&
                    !Number.isNaN(Number(item.amount)) &&
                    !Number.isNaN(Number(ingredient.amount))
            );

            if (!matchingItem) {
                combinedItems.push({
                    ...ingredient,
                    ids: [ingredient.id],
                });

                return combinedItems;
            }

            matchingItem.amount = Number(matchingItem.amount) + Number(ingredient.amount);
            matchingItem.ids.push(ingredient.id);

            return combinedItems;
        },
        []
    );

    return (
        <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
            <div className=" relative w-full max-w-sm rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-4 space-y-4">
                <h1 className="text-2xl">
                    Grocery List
                </h1>
                <button
                    className={`
                        absolute right-4 top-4 cursor-pointer text-base
                        transition-all duration-300
                        hover:scale-125
                    `}
                    onClick={() => {
                        const confirmed = confirm("Delete Grocery List?");
                        if (!confirmed) {
                            return;
                        }
                        clearGroceryList();
                        setGroceryList([]);
                        clearGroceryRecipeSlugs();
                        router.push("/");
                    }}
                    >
                    🗑️
                </button>
                <section>
                    <ul>
                        {combinedGroceryList.map((ingredient) => (
                            <li key={ingredient.id}>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={ingredient.checked}
                                        onChange={() => {
                                            const updatedGroceryList = toggleGroceryItemsChecked(ingredient.ids);
                                            setGroceryList(updatedGroceryList);
                                        }}
                                    />
                                    <span className={ingredient.checked ? "line-through text-zinc-500" : ""}>
                                        {ingredient.amount} {formatUnit(ingredient.amount, ingredient.unit)} {ingredient.name}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="flex justify-center gap-2">
                    {hasCheckedItems && (
                        <button
                            className="rounded-lg border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800"
                            onClick={() => {
                                const confirmed = confirm("Remove the selected items?");
                                if (!confirmed) {
                                    return;
                                }

                                const updatedGroceryList = clearCheckedGroceryItems();
                                setGroceryList(updatedGroceryList);
                            }}
                        >
                            Clear Purchased Items
                        </button>
                    )}
                    <BackButton />
                </section>
            </div>
        </main>
    )
}