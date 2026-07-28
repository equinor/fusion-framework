# Header Test Harness Design

The Fusion dev portal owns the global Header and outer page inset. This cookbook therefore renders
only main content and does not duplicate the top bar, add root padding, or create a competing
scroll container.

The test harness uses EDS `Typography`, color tokens, and spacing tokens to stay aligned with the
portal theme and remain usable at narrow widths.

A vertical test canvas renders normal-flow content layers at z-index values from 0 through 999999,
including representative intermediate values. Their combined height creates portal main-area
scrolling so z-index and sticky behavior can be observed without introducing a nested scroll
container.

The portal shell isolates its Header and main-content grid zones into sibling stacking contexts.
The main zone is the base layer and contains every application z-index value; the Header is the
next layer. An application cannot escape its main-zone boundary by choosing a larger z-index.

The cookbook applies the same boundary between sticky content and ordinary content. Even a very
large z-index inside ordinary content stays below the sticky row. The sticky row uses `top: 0`
relative to the portal main scroll area, which starts below the 48-pixel portal row.

The sticky row also provides an EDS button that opens `@equinor/fusion-react-side-sheet`. The side
sheet is rendered through a React portal into `document.body`, outside the isolated app-content
boundary, so its scrim and panel remain above the Header and application content.
