export const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export const formatBRL = (value: number): string => brlFormatter.format(value);

/** Interpreta data ISO YYYY-MM-DD em UTC (evita drift de fuso). */
export const parseISODateUTC = (iso: string): Date =>
  new Date(`${iso}T00:00:00Z`);

export const formatDateBR = (iso: string): string =>
  parseISODateUTC(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
