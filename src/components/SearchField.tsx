import { SearchIcon } from './icons'
import './SearchField.css'

type SearchFieldProps = {
  query: string
  placeholder: string
  onQueryChange: (query: string) => void
}

export function SearchField({ query, placeholder, onQueryChange }: SearchFieldProps) {
  return (
    <label className="search-field">
      <SearchIcon />
      <input
        type="search"
        dir="auto"
        enterKeyHint="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
    </label>
  )
}
