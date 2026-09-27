import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/info-page';

export const Route = createFileRoute('/announcements')({
  head: () => ({
    meta: [
      { title: 'Announcements, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Product updates, market access changes and service notices from Tronnlix Trade.',
      },
      { property: 'og:title', content: 'Announcements, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Product updates, market access changes and service notices from Tronnlix Trade.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Announcements"
      title="Updates, with the details that matter."
      body="Product changes, market access updates and service notices will appear here. Account specific notices are delivered in your inbox as well, so you never miss something that affects you."
      closingTitle="Nothing else to see here yet."
      closingBody="Open an account or contact support if you need something specific right now."
      items={[
        {
          title: 'Product updates',
          body: 'Interface improvements and new account capabilities will be listed here when they ship.',
        },
        {
          title: 'Market access',
          body: 'Any change to supported assets, networks or regional availability will be posted here first.',
        },
        {
          title: 'Service notices',
          body: 'Scheduled maintenance and incident reports appear here, and are mirrored to your account inbox.',
        },
      ]}
    />
  ),
});
