type MacroCardProps = {
  label: string
  value: string
  detail: string
}

export function MacroCard({ label, value, detail }: MacroCardProps) {
  return (
    <div className="rounded-[24px] border border-[#e8f2e8] bg-[linear-gradient(135deg,_#ffffff_0%,_#fef8e8_100%)] p-4 shadow-sm">
      <p className="text-sm font-semibold text-[#8d745c]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[#3f3a33]">{value}</p>
      <p className="mt-2 text-sm text-[#7a6a56]">{detail}</p>
    </div>
  )
}
