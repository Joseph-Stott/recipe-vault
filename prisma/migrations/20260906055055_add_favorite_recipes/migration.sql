-- CreateTable
CREATE TABLE "FavoriteRecipe" (
    "id" SERIAL NOT NULL,
    "recipeSlug" TEXT NOT NULL,

    CONSTRAINT "FavoriteRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteRecipe_recipeSlug_key" ON "FavoriteRecipe"("recipeSlug");

-- AddForeignKey
ALTER TABLE "FavoriteRecipe" ADD CONSTRAINT "FavoriteRecipe_recipeSlug_fkey" FOREIGN KEY ("recipeSlug") REFERENCES "Recipe"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
