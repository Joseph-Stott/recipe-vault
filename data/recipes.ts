import { Recipe } from "@/types/recipe";

export const recipes: Recipe[] = [
  {
    slug: "chicken-alfredo",
    title: "Chicken Alfredo",
    timeCategory: "medium",
    ingredientsList: ["chicken", "alfredo"],
    cookInstructions: [
      "Get ingredients",
      "Cook ingredients"
    ],
    cookBook: "Test Book",
    pageNumber: 43
  },
  {
    slug: "spaghetti",
    title: "Spaghetti",
    timeCategory: "slow",
    ingredientsList: ["sauce"],
    cookInstructions: [
      "get stuff",
      "cook stuff"
    ]
  },
  {
    slug: "chicken-quesadillas",
    title: "Chicken Quesadillas",
    timeCategory: "fast",
    ingredientsList: ["tortillas", "chicken", "cheese"],
    cookInstructions: [
      "Cook chicken",
      "Fill tortillas with chicken and cheese",
      "Cook until crispy"
    ]
  },
  {
    slug: "beef-stew",
    title: "Beef Stew",
    timeCategory: "slow",
    ingredientsList: ["beef", "potatoes", "carrots", "broth"],
    cookInstructions: [
      "Brown beef",
      "Add vegetables and broth",
      "Simmer for 2 hours"
    ]
  },
  {
    slug: "grilled-cheese",
    title: "Grilled Cheese",
    timeCategory: "fast",
    ingredientsList: ["bread", "cheese", "butter"],
    cookInstructions: [
      "Butter bread",
      "Add cheese",
      "Cook until golden brown"
    ]
  },
  {
    slug: "fried-rice",
    title: "Fried Rice",
    timeCategory: "medium",
    ingredientsList: ["rice", "eggs", "soy sauce", "vegetables"],
    cookInstructions: [
      "Cook eggs",
      "Add vegetables and rice",
      "Mix in soy sauce"
    ]
  },
  {
    slug: "chili",
    title: "Chili",
    timeCategory: "slow",
    ingredientsList: ["ground beef", "beans", "tomatoes", "onion"],
    cookInstructions: [
      "Cook beef and onion",
      "Add beans and tomatoes",
      "Simmer for 1 hour"
    ]
  },
  {
    slug: "caesar-salad",
    title: "Caesar Salad",
    timeCategory: "fast",
    ingredientsList: ["lettuce", "croutons", "parmesan", "caesar dressing"],
    cookInstructions: [
      "Chop lettuce",
      "Add toppings",
      "Mix with dressing"
    ]
  },
  {
    slug: "pancakes",
    title: "Pancakes",
    timeCategory: "medium",
    ingredientsList: ["flour", "milk", "eggs", "syrup"],
    cookInstructions: [
      "Mix batter",
      "Pour onto pan",
      "Flip when bubbles appear"
    ]
  },
  {
    slug: "baked-salmon",
    title: "Baked Salmon",
    timeCategory: "medium",
    ingredientsList: ["salmon", "lemon", "garlic"],
    cookInstructions: [
      "Season salmon",
      "Bake in oven",
      "Serve with lemon"
    ]
  },
  {
    slug: "mac-and-cheese",
    title: "Mac and Cheese",
    timeCategory: "medium",
    ingredientsList: ["macaroni", "cheese", "milk", "butter"],
    cookInstructions: [
      "Cook macaroni",
      "Make cheese sauce",
      "Mix together"
    ]
  },
  {
    slug: "tacos",
    title: "Tacos",
    timeCategory: "fast",
    ingredientsList: ["tortillas", "ground beef", "lettuce", "cheese"],
    cookInstructions: [
      "Cook beef",
      "Prepare toppings",
      "Assemble tacos"
    ]
  },
];