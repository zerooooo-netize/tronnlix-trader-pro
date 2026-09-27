import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/info-page';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Tronnlix Trade is built around clarity, transparency and control. Here is how we approach markets and copy trading.',
      },
      { property: 'og:title', content: 'About, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Tronnlix Trade is built around clarity, transparency and control. Here is how we approach markets and copy trading.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Our philosophy"
      title="Trading deserves a clearer point of view."
      body="Tronnlix Trade is built around clarity, transparency and control. We want the path from discovery to decision to feel deliberate, and for every number on screen to earn its place."
      closingTitle="See the platform for yourself."
      closingBody="Open an account, browse strategies and explore the market board. No card required to look around."
      items={[
        {
          title: 'Clarity first',
          body: 'Account activity, deposit and withdrawal status, and strategy performance are shown in one place with plain language. No hidden steps, no unexplained states.',
        },
        {
          title: 'Intentional access',
          body: 'A focused workspace for exploring markets and managing allocations. Every control does exactly what its label says, and nothing happens without your confirmation.',
        },
        {
          title: 'Decisions stay yours',
          body: 'Review risk before you allocate. Pause, resume or stop any copy relationship whenever your view changes. Your capital remains under your control.',
        },
      ]}
    />
  ),
});
