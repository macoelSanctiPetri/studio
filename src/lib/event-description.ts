export type ParsedEventDescription = {
  intro: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

export function parseProgramDescription(text: string): ParsedEventDescription | null {
  const marker = 'Programa:';
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) return null;

  const intro = text.slice(0, markerIndex).trim();
  const rawItems = text.slice(markerIndex + marker.length).trim();
  if (!rawItems) return null;

  if (rawItems.includes('||')) {
    const sections = rawItems
      .split('||')
      .map((section) => section.trim())
      .filter(Boolean)
      .map((section) => {
        const [rawTitle, ...rest] = section.split(':');
        const title = (rawTitle || '').trim();
        const content = rest.join(':').trim();
        const items = content
          .split(';')
          .map((item) => item.trim().replace(/\.$/, ''))
          .filter(Boolean);
        return { title, items };
      })
      .filter((section) => section.title && section.items.length > 0);

    if (sections.length > 0) {
      return { intro, sections };
    }
  }

  const items = rawItems
    .split(';')
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);

  if (items.length < 2) return null;

  return {
    intro,
    sections: [{ title: 'Programa', items }],
  };
}
