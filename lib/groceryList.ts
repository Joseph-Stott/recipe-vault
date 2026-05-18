export function getGroceryList(): string[] {
    const storedGroceryList = localStorage.getItem("grocery-list");
    if (!storedGroceryList) {
        return [];
    }
    const parsedGroceryList = JSON.parse(storedGroceryList);
    return parsedGroceryList
};

export function addIngredientsToGroceryList(ingredients: string[]) {
    const currentGroceryList = getGroceryList();
    const updatedGroceryList = [...currentGroceryList, ...ingredients];
    localStorage.setItem("grocery-list", JSON.stringify(updatedGroceryList))
}

// export function clearGroceryList (ingredients: string[]) {
//     const currentGroceryList = getGroceryList();
//     localStorage.setItem("grocery-list", "")
// }