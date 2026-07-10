type ErrorStateProps = {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-[32px] border border-[#dceef1] bg-[linear-gradient(135deg,_#fffaf6_0%,_#fef8e8_100%)] p-8 text-center shadow-[0_20px_60px_rgba(122,171,132,0.12)]">
      <h2 className="text-2xl font-semibold text-[#3f3a33]">We could not decode that item</h2>
      <p className="mt-3 text-[#7a6a56]">{message}</p>
    </div>
  )
}
