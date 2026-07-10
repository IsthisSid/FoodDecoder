import { useState, type FormEvent } from 'react'
import { decodeFood, type DecodedFood, type SearchMode } from './api/foodApi'
import { DietaryFlags } from './components/DietaryFlags'
import { ErrorState } from './components/ErrorState'
import { FoodCard } from './components/FoodCard'
import { FoodDetails } from './components/FoodDetails'
import { IngredientsOfInterest } from './components/IngredientsOfInterest'
import { LoadingState } from './components/LoadingState'
import { NutritionSummary } from './components/NutritionSummary'
import { SearchBar } from './components/SearchBar'

function App() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('name')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [food, setFood] = useState<DecodedFood | null>(null)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(null); setFood(null); setLoading(true); try { setFood(await decodeFood(query, mode)) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to decode that food right now.') } finally { setLoading(false) } }
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-6"><section className="rounded-[40px] bg-slate-950 p-6 text-white shadow-xl sm:p-8 lg:p-10"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-400">Food Decoder</p><h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Know what’s in your food.</h1><p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Search a food or scan a barcode for clear dietary facts.</p></div></section><section id="decoder" className="rounded-[40px] border border-slate-200 bg-white/70 p-5 shadow-sm sm:p-7"><SearchBar value={query} onChange={setQuery} mode={mode} onModeChange={setMode} onSubmit={handleSubmit} loading={loading} /><div className="mt-6 space-y-6">{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{food ? <><FoodCard food={food} /><DietaryFlags dietary={food.dietary} /><IngredientsOfInterest ingredients={food.dietary.ingredientsOfInterest} /><NutritionSummary nutrition={food.nutrition} /><FoodDetails food={food} /></> : null}</div></section></div></main>
}
export default App
