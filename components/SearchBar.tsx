type SearchBarProps = {
    searchText: string;
    setSearchText: (value: string) => void;
}

export default function SearchBar(props: SearchBarProps) {
    return (
        <input className="w-full max-w-sm p-2 bg-zinc-900 border border-zinc-400 rounded-lg placeholder:text-center"
          type="search"
          placeholder="Search recipes"
          value={props.searchText}
          onChange={(event) => props.setSearchText(event.target.value)}
        />
    )
}