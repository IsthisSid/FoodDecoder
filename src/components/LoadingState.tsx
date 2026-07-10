export function LoadingState() {
  return (
    <div className="rounded-[32px] border border-[#dceef1] bg-[linear-gradient(135deg,_#ffffff_0%,_#fef8e8_100%)] p-8 text-center shadow-[0_20px_60px_rgba(122,171,132,0.12)]">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#e9f2e8] border-t-[#7fc8a9]" />
      <h2 className="mt-5 text-2xl font-semibold text-[#3f3a33]">Decoding your food…</h2>
      <p className="mt-2 text-[#7a6a56]">We’re checking the latest nutrition details for you.</p>
    </div>
  )
}
