# Signed-in copy trading refresh

## Build
- Replace the basic signed-in trader cards with a photo-led marketplace using the same real trader portraits as the public marketplace.
- Add search, risk and style filters, sorting, grid/list views, comparison, profile links, and an in-place copy amount flow.
- Keep current allocation controls visible below the marketplace and make all layouts adapt cleanly for phone, tablet, and desktop.
- Rename the trader metric from “Example 12M ROI” to “ROI” while retaining accurate platform disclosures elsewhere.

## Technical details
- Add one focused signed-in marketplace component and reuse the existing trader data and portrait fallback helper.
- Extend semantic workspace styles for stable image dimensions, responsive controls, and mobile action layouts.
- Verify the build log and render the signed-in page if an authenticated test session is available.
