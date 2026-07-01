type SearchBarProps = {
    searchText: string;
    setSearchText: (value: string) => void;
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <input
            autoFocus
            title="Search recipes by title, ingredient, or time category"
            className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
            type="search"
            placeholder="Search recipes, ingredients, or categories"
            value={props.searchText}
            onChange={(event) => props.setSearchText(event.target.value)}
        />
    )
}