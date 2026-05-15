type RecipeCardProps = {
    title: string,
    cuisine: string,
    cookTime: string
};

export default function RecipeCard(props: RecipeCardProps) {
    return (
        <div className="w-full max-w-sm rounded-2xl text-center border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">
                {props.title}
            </h2>

            <div className="mt-4 flex justify-between">
                <span>{props.cuisine}</span>
                <span>{props.cookTime}</span>
            </div>
        </div>
    )
}