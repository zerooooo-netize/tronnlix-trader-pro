import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/info-page';

export const Route = createFileRoute('/legal')({
  head: () => ({
    meta: [
      { title: 'Legal and risk, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Risk disclosure, illustrative content notice and legal information for Tronnlix Trade.',
      },
      { property: 'og:title', content: 'Legal and risk, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Risk disclosure, illustrative content notice and legal information for Tronnlix Trade.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Legal / Risk"
      title="Know the risk. Own the decision."
      body="Forex and copy trading are high-risk activities. You can lose some or all of your capital. Nothing on this site is financial advice or a solicitation to trade."
      closingTitle="Contact support before you fund anything."
      closingBody="If anything on this page is unclear, ask us first. It is faster than fixing a mistake."
      items={[
        {
          title: 'Illustrative content',
          body: 'Market prices, trader profiles and performance shown here are examples. They are not connected to live execution and do not represent verified returns.',
        },
        {
          title: 'No guaranteed returns',
          body: 'Past or hypothetical performance cannot predict future outcomes. Consider your financial situation and risk tolerance before you allocate.',
        },
        {
          title: 'Operational readiness',
          body: 'Live trading and crypto funding require verified providers, jurisdiction-specific terms and compliance approval. Full terms, privacy and cookie policies will be published before launch.',
        },
      ]}
    />
  ),
});
