export type ParsedEventDescription = {
  intro: string;
  items: string[];
};

export function parseProgramDescription(text: string): ParsedEventDescription | null {
  const marker = 'Programa:';
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) return null;

  const intro = text.slice(0, markerIndex).trim();
  const rawItems = text.slice(markerIndex + marker.length).trim();
  if (!rawItems) return null;

  const items = rawItems
    .split(';')
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);

  // Evita falso positivo cuando no es realmente un listado.
  if (items.length < 2) return null;

  return { intro, items };
}

