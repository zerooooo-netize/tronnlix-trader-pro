# Tronnlix Trade redesign and copy-trading journey

## Direction
Evolve the existing green identity into a sharper emerald, ink, and cool-neutral system with the current sans-serif typography. The copy-trading marketplace becomes an editorial research surface, not a grid of identical cards. Public pages, account screens, and staff screens retain a shared visual language but use distinct page compositions. Remove em dashes from visible copy and improve small-screen density, navigation, focus states, and touch targets.

## What will change
1. Audit every existing screen for repeated layouts, misleading claims, cramped mobile controls, missing states, and inaccessible interactions. Refine the shared header, workspace shell, forms, status language, empty/loading states, and public page compositions.
2. Build a searchable, sortable copy-trading marketplace with compact filters, grid/list modes, comparison, bookmarks, meaningful portrait-led profiles, and a dedicated profile page for each trader. Show only data actually maintained by staff. Clearly mark seeded returns and generated portraits as illustrative; do not invent verified performance, investor reviews, live positions, or biographies.
3. Add staff-owned trader management: create/edit, activate/suspend, feature, duplicate, archive/restore, ordering, and performance-entry management. Store the new fields and history with explicit grants, RLS, safe status rules, and audit records. Marketplace settings control the supported layout, sorting, and pagination options.
4. Replace the post-deposit dead end with a confirmation-to-discovery path. Only a deposit independently marked confirmed by staff shows the confirmed amount, asset/network, reference, and refreshed balance, followed by a prominent “Choose Your Trading Expert” action. A customer’s “I’ve paid” report remains pending and never appears as confirmed.
5. Verify public pages and protected flows at desktop and phone widths, check compilation and visible copy, then update the roadmap with what is complete and what still needs external providers.

## Technical boundaries
Financial balance and allocation transitions remain in checked database functions. Staff management uses server-validated roles and RLS, not client-side role claims. Live execution, blockchain confirmation, KYC evidence, verified track records, and real returns stay unavailable until vetted services and operational review exist. New fields must not fabricate facts about traders. Existing public URLs stay intact.
