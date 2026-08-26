type SearchBarProps = {
    searchText: string;
    setSearchText: (value: string) => void;
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <input
            autoFocus
            title="Search recipes by title, ingredient, or time category"
            type="search"
            spellCheck={false}
            autoComplete="off"
            className="w-full max-w-sm rounded-lg border border-zinc-400 bg-zinc-900 p-2 text-zinc-100 placeholder:text-center placeholder:text-zinc-500"
            placeholder="Search recipes, ingredients, or categories"
            value={props.searchText}
            onChange={(event) => props.setSearchText(event.target.value)}
        />
    )
}
