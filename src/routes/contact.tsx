import { createFileRoute } from '@tanstack/react-router';
import { InfoPage } from '@/components/info-page';

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: 'Contact, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Reach the Tronnlix Trade team through secure account support, or read the FAQ for common answers.',
      },
      { property: 'og:title', content: 'Contact, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Reach the Tronnlix Trade team through secure account support, or read the FAQ for common answers.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Contact"
      title="A direct line when you need it."
      body="For account-specific requests, sign in and open a support ticket. This keeps sensitive details tied to your account rather than a public message."
      closingTitle="Ready to reach the team?"
      closingBody="Sign in to open a ticket from your account, or check the FAQ for answers to common questions."
      items={[
        {
          title: 'Account support',
          body: 'Open a support ticket from your client portal. We reply in your inbox, not by email link, so your details stay secure.',
        },
        {
          title: 'Funding requests',
          body: 'Track deposit and withdrawal status from your wallet. If a review is taking longer than expected, reply to the same ticket rather than opening a new one.',
        },
        {
          title: 'Security concerns',
          body: 'If you suspect unauthorized activity, change your password first, then open a support ticket and mention the ticket is urgent.',
        },
      ]}
    />
  ),
});
