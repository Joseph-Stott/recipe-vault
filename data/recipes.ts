import { Recipe } from "@/types/recipe";

export const recipes: Recipe[] = [
  {
    slug: "chicken-alfredo",
    title: "Chicken Alfredo",
    timeCategory: "medium",
    ingredientsList: ["chicken", "alfredo"],
    cookInstructions: ["Get ingredients","Cook ingredients"],
    cookBook: "Test Book",
    pageNumber: 43
  },
  {
    slug: "tacos",
    title: "Tacos",
    timeCategory: "fast",
    ingredientsList: ["shell", "meat"],
    cookInstructions: [""]
  },
  {
    slug: "spaghetti",
    title: "Spaghetti",
    timeCategory: "slow",
    ingredientsList: ["sauce"],
    cookInstructions: [""]
  },
];