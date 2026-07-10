import type { FormEvent } from 'react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  mode: 'name' | 'barcode'
  onModeChange: (mode: 'name' | 'barcode') => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  loading: boolean
}

export function SearchBar({ value, onChange, mode, onModeChange, onSubmit, loading }: SearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[32px] border border-[#dceef1] bg-[#fffef9] p-3 shadow-[0_20px_60px_rgba(122,171,132,0.12)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-full bg-[#f7f1de] p-1">
          <button
            type="button"
            onClick={() => onModeChange('name')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'name' ? 'bg-[linear-gradient(135deg,_#7fc8a9_0%,_#6ab4e7_100%)] text-white' : 'text-[#7a6a56]'}`}
          >
            Food name
          </button>
          <button
            type="button"
            onClick={() => onModeChange('barcode')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'barcode' ? 'bg-[linear-gradient(135deg,_#7fc8a9_0%,_#6ab4e7_100%)] text-white' : 'text-[#7a6a56]'}`}
          >
            Barcode
          </button>
        </div>

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={mode === 'barcode' ? 'Enter a barcode number' : 'Try yogurt, hummus, apples'}
          className="h-12 flex-1 rounded-full border border-[#dceef1] bg-[#fcfeff] px-4 text-sm text-[#5f544a] outline-none ring-0 focus:border-[#6ab4e7]"
        />

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="h-12 rounded-full bg-[linear-gradient(135deg,_#7fc8a9_0%,_#6ab4e7_100%)] px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[#e6d9c9]"
        >
          {loading ? 'Decoding…' : 'Decode'}
        </button>
      </div>
    </form>
  )
}
