type Props = {
  count: number;
  city: string;
  speciality: string;
  sort: string;
  onSortChange: (v: string) => void;
};

export function DoctorsSortBar({ count, city, speciality, sort, onSortChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-border rounded-xl p-3 md:p-4">
      <p className="text-sm text-[var(--color-darknavy)]">
        Showing <span className="font-semibold">{count}</span> doctors for{" "}
        <span className="capitalize font-medium">{speciality.replace(/-/g, " ")}</span> in{" "}
        <span className="capitalize font-medium">{city.replace(/-/g, " ")}</span>
      </p>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Sort by:</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-border bg-white px-2 py-1.5 text-sm font-medium text-[var(--color-darknavy)] outline-none focus:ring-2 focus:ring-[var(--color-maingreen)]/40"
        >
          <option value="relevance">Most Relevant</option>
          <option value="experience">Most Experienced</option>
          <option value="reviews">Most Reviewed</option>
          <option value="fee-low">Lowest Fee</option>
          <option value="fee-high">Highest Fee</option>
        </select>
      </label>
    </div>
  );
}
