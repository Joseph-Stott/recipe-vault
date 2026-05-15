import RecipeCard from "@/components/RecipeCard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Recipe Vault
      </h1>
      <p className="mt-4 max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Store, organize, and search your favorite recipes
      </p>
      <div className="flex flex-col gap-4">
        <RecipeCard 
        title="Chicken Alfredo"
        cuisine="Italian"
        cookTime="30 mins"
      />
      <RecipeCard
        title="Tacos"
        cuisine="Mexican"
        cookTime="20 mins"
      />
      </div>
    </main>
  );
}
