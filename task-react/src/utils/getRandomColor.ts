const usedColors = new Set<string>();
const COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6A4C93', '#FF9F1C', '#00B8D9'];

export function getRandomColor(): string {
  const available = COLORS.filter(c => !usedColors.has(c));
  if (available.length === 0) usedColors.clear();
  const color = available[Math.floor(Math.random() * available.length)];
  usedColors.add(color);
  return color;
}
