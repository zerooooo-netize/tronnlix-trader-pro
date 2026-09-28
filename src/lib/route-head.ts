/** Consistent metadata for each private Tronnlix Trade view. */
export function routeHead(title: string, description: string) {
  const pageTitle = `${title} — Tronnlix Trade`;
  return { meta: [
    { title: pageTitle },
    { name: 'description', content: description },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] };
}
