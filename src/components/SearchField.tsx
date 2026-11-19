import type { KeyboardEvent } from 'react'
import { SearchIcon } from './icons'
import './SearchField.css'

type SearchFieldProps = {
  query: string
  placeholder: string
  onQueryChange: (query: string) => void
  onSubmit?: () => void
}

const COMPOSITION_KEY_CODE = 229

const isComposing = ({ nativeEvent }: KeyboardEvent<HTMLInputElement>) =>
  nativeEvent.isComposing || nativeEvent.keyCode === COMPOSITION_KEY_CODE

export function SearchField({ query, placeholder, onQueryChange, onSubmit }: SearchFieldProps) {
  function submitOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (!onSubmit || event.key !== 'Enter' || isComposing(event)) {
      return
    }

    event.preventDefault()
    onSubmit()
  }

  return (
    <label className="search-field">
      <SearchIcon />
      <input
        type="search"
        dir="auto"
        enterKeyHint={onSubmit ? 'go' : 'search'}
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={submitOnEnter}
      />
    </label>
  )
}
