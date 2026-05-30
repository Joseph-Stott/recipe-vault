import { Recipe } from "@/types/recipe";

export const recipes: Recipe[] = [
  {
    slug: "chicken-alfredo",
    title: "Chicken Alfredo",
    timeCategory: "medium",
    ingredientsList: ["chicken", "alfredo sauce", "fettuccine", "parmesan"],
    structuredIngredients: [
      { amount: 2, unit: "pieces", name: "chicken breast" },
      { amount: 12, unit: "oz", name: "fettuccine" },
      { amount: 1, unit: "cup", name: "alfredo sauce" },
      { amount: 1, unit: "cup", name: "parmesan" }
    ],
    cookInstructions: [
      "Cook chicken",
      "Boil pasta",
      "Mix pasta with alfredo sauce",
      "Top with chicken and parmesan"
    ],
    cookBook: "Test Book",
    pageNumber: 43
  },
  {
    slug: "spaghetti",
    title: "Spaghetti",
    timeCategory: "slow",
    ingredientsList: ["spaghetti noodles", "tomato sauce", "ground beef"],
    structuredIngredients: [
      { amount: 12, unit: "oz", name: "spaghetti noodles" },
      { amount: 1, unit: "jar", name: "tomato sauce" },
      { amount: 1, unit: "lb", name: "ground beef" }
    ],
    cookInstructions: [
      "Brown the ground beef",
      "Boil spaghetti noodles",
      "Combine noodles with sauce and beef"
    ]
  },
  {
    slug: "chicken-quesadillas",
    title: "Chicken Quesadillas",
    timeCategory: "fast",
    ingredientsList: ["tortillas", "chicken", "cheese"],
    structuredIngredients: [
      { amount: 4, unit: "pieces", name: "tortillas" },
      { amount: 2, unit: "cups", name: "chicken" },
      { amount: 1, unit: "cup", name: "cheese" }
    ],
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
    structuredIngredients: [
      { amount: 2, unit: "lb", name: "beef" },
      { amount: 3, unit: "pieces", name: "potatoes" },
      { amount: 4, unit: "pieces", name: "carrots" },
      { amount: 4, unit: "cups", name: "broth" }
    ],
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
    structuredIngredients: [
      { amount: 2, unit: "slices", name: "bread" },
      { amount: 2, unit: "slices", name: "cheese" },
      { amount: 1, unit: "tbsp", name: "butter" }
    ],
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
    structuredIngredients: [
      { amount: 2, unit: "cups", name: "rice" },
      { amount: 2, unit: "pieces", name: "eggs" },
      { amount: 2, unit: "tbsp", name: "soy sauce" },
      { amount: 1, unit: "cup", name: "vegetables" }
    ],
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
    structuredIngredients: [
      { amount: 1, unit: "lb", name: "ground beef" },
      { amount: 2, unit: "cans", name: "beans" },
      { amount: 1, unit: "can", name: "tomatoes" },
      { amount: 1, unit: "piece", name: "onion" }
    ],
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
    structuredIngredients: [
      { amount: 1, unit: "head", name: "lettuce" },
      { amount: 1, unit: "cup", name: "croutons" },
      { amount: 1, unit: "cup", name: "parmesan" },
      { amount: 4, unit: "tbsp", name: "caesar dressing" }
    ],
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
    structuredIngredients: [
      { amount: 1, unit: "cup", name: "flour" },
      { amount: 1, unit: "cup", name: "milk" },
      { amount: 2, unit: "pieces", name: "eggs" },
      { amount: 2, unit: "tbsp", name: "syrup" }
    ],
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
    structuredIngredients: [
      { amount: 2, unit: "fillets", name: "salmon" },
      { amount: 1, unit: "piece", name: "lemon" },
      { amount: 2, unit: "cloves", name: "garlic" }
    ],
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
    structuredIngredients: [
      { amount: 2, unit: "cups", name: "macaroni" },
      { amount: 2, unit: "cups", name: "cheese" },
      { amount: 1, unit: "cup", name: "milk" },
      { amount: 2, unit: "tbsp", name: "butter" }
    ],
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
    structuredIngredients: [
      { amount: 6, unit: "pieces", name: "tortillas" },
      { amount: 1, unit: "lb", name: "ground beef" },
      { amount: 1, unit: "cup", name: "lettuce" },
      { amount: 1, unit: "cup", name: "cheese" }
    ],
    cookInstructions: [
      "Cook beef",
      "Prepare toppings",
      "Assemble tacos"
    ]
  },
  {
    slug: "vegetable-stir-fry",
    title: "Vegetable Stir Fry",
    timeCategory: "fast",
    ingredientsList: ["broccoli", "bell pepper", "carrots", "soy sauce"],
    structuredIngredients: [
      { amount: 2, unit: "cups", name: "broccoli" },
      { amount: 1, unit: "piece", name: "bell pepper" },
      { amount: 2, unit: "pieces", name: "carrots" },
      { amount: 2, unit: "tbsp", name: "soy sauce" }
    ],
    cookInstructions: [
      "Chop vegetables",
      "Cook vegetables in a hot pan",
      "Add soy sauce and stir"
    ]
  },
  {
    slug: "breakfast-burrito",
    title: "Breakfast Burrito",
    timeCategory: "fast",
    ingredientsList: ["tortilla", "eggs", "potatoes", "cheese"],
    structuredIngredients: [
      { amount: 1, unit: "piece", name: "tortilla" },
      { amount: 2, unit: "pieces", name: "eggs" },
      { amount: 1, unit: "cup", name: "potatoes" },
      { amount: 0.5, unit: "cup", name: "cheese" }
    ],
    cookInstructions: [
      "Cook eggs and potatoes",
      "Add filling to tortilla",
      "Roll into a burrito"
    ]
  }
];