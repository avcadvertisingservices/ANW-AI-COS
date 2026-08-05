type EvidenceSummaryCardProps = {
  className?: string;
};

export default function EvidenceSummaryCard({
  className = "",
}: EvidenceSummaryCardProps) {
  return (
    <section
      className={[
        "rounded-3xl",
        "border",
        "border-emerald-950/10",
        "bg-white",
        "p-6",
        "shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
        ANW AI-COS
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-900">
        EvidenceSummaryCard
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Replace this placeholder with the component content.
      </p>
    </section>
  );
}
