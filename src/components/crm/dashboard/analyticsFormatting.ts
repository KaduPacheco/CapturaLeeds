const integerFormatter = new Intl.NumberFormat("pt-BR");

export function formatDashboardCount(value: number) {
  return integerFormatter.format(value);
}

export function formatDashboardPercent(value: number | null, digits = 1) {
  if (value === null) {
    return "n/d";
  }

  return `${value.toFixed(digits)}%`;
}

export function formatDashboardSignedPercent(value: number | null, digits = 1) {
  if (value === null) {
    return "n/d";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatDashboardSignedPoints(value: number | null, digits = 1) {
  if (value === null) {
    return "n/d";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(digits)} p.p.`;
}
