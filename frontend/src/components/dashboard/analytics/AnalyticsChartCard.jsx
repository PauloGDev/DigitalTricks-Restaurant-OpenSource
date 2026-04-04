export default function AnalyticsChartCard({
  title,
  subtitle,
  children,
  loading,
  isDark = true,
}) {
  return (
    <div
      className={[
        "rounded-3xl border p-5 backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-[#121212]/95"
          : "border-zinc-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="mb-4">
        <h3
          className={`text-base font-extrabold ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          {title}
        </h3>

        {subtitle ? (
          <p className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-zinc-500"}`}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div
          className={`h-[300px] animate-pulse rounded-2xl ${
            isDark ? "bg-white/5" : "bg-zinc-100"
          }`}
        />
      ) : (
        children
      )}
    </div>
  );
}