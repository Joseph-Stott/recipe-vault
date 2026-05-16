import RecipeCard from "@/components/RecipeCard";

const recipes = [
  {
    title: "Chicken Alfredo",
    cuisine: "Italian",
    cookTime: "30 mins",
    description: "Chicken Alfredo is a rich and comforting pasta dish featuring tender, pan-seared chicken slices served over fettuccine. It is tossed in a velvety, indulgent sauce made from butter, heavy cream, garlic, and freshly grated Parmesan cheese. "
  },
  {
    title: "Tacos",
    cuisine: "Mexican",
    cookTime: "20 mins",
    description: "Tacos are a versatile Mexican dish featuring a folded or rolled tortilla (corn or flour) filled with seasoned meats (like beef, pork, or chicken), seafood, or vegetables. They are typically topped with fresh cilantro, onions, salsa, and lime. "
  },
  {
    title: "Spaghetti",
    cuisine: "Italian",
    cookTime: "90 mins",
    description: "Spaghetti is a long, thin, solid, cylindrical pasta made from durum wheat semolina and water. The name translates from Italian as \"little strings\". It is highly versatile and traditionally paired with tomato-based sauces, meat ragùs, or simple olive oil and garlic. "
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start py-16 bg-zinc-50 px-6 font-sans dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Recipe Vault
      </h1>
      <p className="mt-4 max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Store, organize, and search your favorite recipes
      </p>
      <div className="flex flex-col gap-4">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.title}
            title={recipe.title}
            cuisine={recipe.cuisine}
            cookTime={recipe.cookTime}
            description={recipe.description}
          />
        ))}
      </div>
    </main>
  );
}
