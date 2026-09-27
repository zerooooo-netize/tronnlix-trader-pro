<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep financial state transitions in database functions with owner/staff checks because client-side balances and approvals are forgeable.
- Keep public information pages separate from protected customer and staff workspaces because shareable content and private account data require different access rules.
- Treat seeded trader performance as illustrative, not live returns, until a verified performance feed is connected.

- Admin-configured crypto destinations are inactive until staff verifies and activates them; deposit requests snapshot the address and require independent confirmation before credit, because a client-side payment claim is not proof of receipt.
- No live trade execution is offered without a vetted provider; illustrative copy allocations never claim realized returns, because simulated gains must not masquerade as performance.
