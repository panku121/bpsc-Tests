export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const part = (value: number) => String(value).padStart(2, "0");
  if (hours > 0) return `${part(hours)}:${part(minutes)}:${part(seconds)}`;
  return `${part(minutes)}:${part(seconds)}`;
}

export function formatWhen(stamp: number): string {
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(stamp);
}
