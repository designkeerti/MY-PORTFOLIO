import type { Project } from './types';
import { cbsScenes } from '../previews/CbsPreview';
const S = '/cbs/shots/';

export const cbs: Project = {
  meta: { slug: 'cbs', title: 'Cross Border Supps: a storefront that has to prove the box is real', oneLiner: 'An importer of genuine sports supplements into India, moved off Shopify onto a storefront I designed from scratch. Boarding passes, postage stamps and a vault door: one idea, turned into a system. Live and selling.', role: 'Design lead', year: '2026', company: 'Cross Border Supps', accent: '#6cbde0', accent2: '#06080b', tag: 'E-commerce · WooCommerce' },
  cover: S + 'home-hero.jpg',
  timeline: 'May to September 2026, on a live store the whole time',
  expertise: 'Art direction · Design system · Interaction design',
  summary: 'Cross Border Supps sells genuine imported supplements and apparel into India, a market where the customer’s first question is not “do I want this” but “is this real”. I designed the entire storefront: the design language, every surface, the interactions, and three dedicated mobile passes. Built with an AI assistant doing the implementation, directly on a live store taking daily orders. Everything on this page is the store itself, embedded.',
  link: { href: 'https://crossbordersupps.com', label: 'Visit crossbordersupps.com' },
  preview: cbsScenes,
  chapters: [
    { id: 'problem', title: 'The brief was trust', kicker: 'The design problem', blocks: [
      { type: 'lead', text: 'Imported supplements in India sit in a market where counterfeits and grey-market stock are the default assumption. Trust badges are what every fake store also has. I needed the trust to be structural: something the layout itself asserts, and a copycat would have to rebuild rather than paste.' },
      { type: 'img', src: S + 'home-hero.jpg', alt: 'The live home page at desktop: the brick-wall hero with a product breaking through, the stats bar, the brand conveyor and the floating nav pill', caption: 'crossbordersupps.com, as it is today. The floating glass pill at the bottom is the whole navigation.', size: 'full', ratio: '16/10' },
      { type: 'note', text: 'Attribution, plainly: I did not write the code. The CSS, PHP and JavaScript were produced by an AI assistant working to my direction across a long series of sessions. What is mine is the art direction, the design language, the composition of every page, the interaction decisions, what got rejected, and the client relationship. Every component on this page is served from this site with the store’s own markup, stylesheet and scripts. Hover, tap, scroll them.' },
    ]},
    { id: 'language', title: 'One sentence, then a system', kicker: 'Design language', blocks: [
      { type: 'p', text: 'I settled the whole language on one decision: **every container in the store is a document of transit.** A product is a ticket with a route printed on it. A brand is a stamp with a country on it. A curated bundle is a full boarding pass with a barcode you tear off. The first visit of a session opens with a vault door. Once that sentence existed, every component was a consequence of it rather than a choice.' },
      { type: 'live', id: 'cbs-tokens' },
      { type: 'p', text: 'Pure black ground, three near-black panels, one cyan. Anton for anything that shouts, Inter for anything you read, JetBrains Mono for anything that looks stamped on. The palette is deliberately starved so the product photography, most of it shot on black, is the only colour on the page until a flag appears.' },
    ]},
    { id: 'hero', title: 'A product breaking through a wall', kicker: 'The home hero', blocks: [
      { type: 'p', text: 'The hero is a brick wall with a hole punched through it, and the featured product sits inside the hole, behind the broken rim, with debris hanging in front of it. The cracks glow in the brand’s colour; when the conveyor slides the next product in, the old colour is frozen on one crack layer while the new one bleeds outward from the centre, stop by stop, so the wall appears to catch the new brand rather than switch to it. The stamps under the wall are the brand conveyor: click one, or wait.' },
      { type: 'live', id: 'cbs-wall' },
      { type: 'p', text: 'The first visit of a session does not start here. It starts behind a steel door: brushed grain, a bevelled face, rivet columns, a machined seam, all CSS gradients, with the logo engraved across the seam so opening the doors tears it in half. It plays once, on the home page only, because a curtain in front of a cart is furniture, not a brand moment. It also taught me something uncomfortable: a loading screen is concealer. The moment I cut it to one play, the ugly first paint it had been hiding came straight back, and I had to fix that properly.' },
      { type: 'live', id: 'cbs-vault' },
    ]},
    { id: 'system', title: 'Four surfaces from one idea', kicker: 'Components', blocks: [
      { type: 'p', text: 'The test of a design language is whether it generates components instead of decorating them. These came out of the same sentence, and they are the store’s actual components running here, not mockups.' },
      { type: 'live', id: 'cbs-cards' },
      { type: 'p', text: 'The card is a ticket. A stub carries the reference and **the route the product actually travelled**, a dashed perforation splits image from detail, and the outline is bitten by two tear notches. The notch is one SVG path that draws the outline *and* clips the card, because `overflow: hidden` clips at the padding box while the border paints at the border box, so no child can ever cut its parent’s stroke. I had the cheap version on the product page for weeks before a consistency audit caught it. Sold out is a state of the same ticket, not a different card: the price stays, the category cell becomes a status, and the button becomes a request.' },
      { type: 'live', id: 'cbs-stacks' },
      { type: 'p', text: 'A pre-built stack is a whole boarding pass: flight number, mission and goal in the body, a barcode stub on a tear line. Cyan carries the card because a stack is the one thing in the store that is an editorial recommendation rather than a product.' },
      { type: 'live', id: 'cbs-stamps' },
      { type: 'p', text: 'Eleven brands as a sheet of perforated postage stamps, each in its own near-black colour, each hiding its country’s flag. The perforation is a CSS mask, so the flag is genuinely underneath the stamp rather than layered on top. On phones there is no hover, so the flag reveals as the stamp crosses the centre of the screen. My first version toggled a class at the centre line with a transition and it flickered: a binary state driven by a continuous input. The fix was a smoothstep falloff from the viewport centre computed every frame, with the radius slightly larger than a stamp so rows hand off to each other.' },
    ]},
    { id: 'parts', title: 'The small parts', kicker: 'Details', blocks: [
      { type: 'p', text: 'A language proves itself in the pieces nobody is asked to notice. The ticker, the logo pill and the floating navigation share one glass: the same blur, the same hairline, the same 999px radius, so the chrome reads as one instrument panel rather than three widgets. The search field lives inside the pill with its shortcut printed on it, and Shop opens a sheet, not a dropdown.' },
      { type: 'live', id: 'cbs-nav' },
      { type: 'p', text: 'The buy column on a product page is the densest thing in the store and the only place a customer has to make a decision, so it is the only place with two buttons. The quantity stepper, the outlined Buy Now and the solid Add to Cart sit on one raised plate; the trust row under it is mono, iconed, and never a badge. The short description arrives as a bulleted list and renders as chips, which collapsed a tall grey column into one scannable row.' },
      { type: 'live', id: 'cbs-buy' },
      { type: 'p', text: 'A category page states its inventory before you filter: the count, how many are in stock, how many are sold out, in that order. Facets that would return nothing are not rendered at all. The title carries a single cyan full stop, which is the whole brand mark in one character.' },
      { type: 'live', id: 'cbs-cathead' },
      { type: 'p', text: 'And the pieces that only exist to be consistent: the two hero buttons, the stats bar, the toast that confirms a cart add, the section heading with its cyan second line, the barcode stub, a boarding pass with its benefits open and one that is sold out. Same radius, same mono, same hairline, every time.' },
      { type: 'live', id: 'cbs-parts' },
    ]},
    { id: 'composition', title: 'I shipped the product page, then tore it up the same day', kicker: 'Composition over components', blocks: [
      { type: 'lead', text: 'V5 went live in the morning. Every component on it was, individually, correct. And the page was wrong, because I had been designing it one component at a time. “You’re looking at one component at a time. Composition is key.”' },
      { type: 'p', text: 'I rebuilt it that afternoon around a shopper’s actual sequence, **understand → judge fit → trust → act → go deeper on demand**, as one viewport in two columns. The gallery is capped at `minmax(260px, 440px)` so it stops dominating: a tub on a black background does not reward being large. Share and wishlist stack top-right, prev and next sit bottom-right, thumbnails run under a second perforation, so the gallery reads as one object. The tool buttons are frosted glass because many of these photos are shot on pure black and a flat button vanishes into them.' },
      { type: 'img', src: S + 'pdp.jpg', alt: 'The live product page: the boarding-pass gallery on the left, the buy column on the right, the product dossier below', caption: 'The product page as it is live. One viewport, two columns, and a “product dossier” panel below that is itself a second boarding pass.', size: 'full', ratio: '16/10' },
      { type: 'p', text: 'Two smaller things I want on the record: removing the breadcrumb revealed it had been silently providing the page’s top clearance under the floating nav, and I learned to calibrate spacing logged out, because an admin toolbar was adding thirty-two pixels of breathing room a customer never gets.' },
      { type: 'img', src: S + 'category.jpg', alt: 'The live category page: the honest inventory count, the filters toolbar and the first row of boarding-pass cards', caption: 'The category archive, live.', size: 'full', ratio: '16/10' },
    ]},
    { id: 'mobile', title: 'Mobile as its own design problem', kicker: 'Not responsive. Three separate redesigns.', blocks: [
      { type: 'live', id: 'cbs-mobile' },
      { type: 'list', items: ['**Pass one** made the cards fill their space and stopped the navigation from hiding itself.', '**Pass two** collapsed the whole navigation into one top pill and threw away the separate floating search. Search opens as a dropdown docked under the pill, not an overlay covering the header you just tapped. The hero was rebuilt to match desktop and fit one viewport.', '**Pass three** was craft: the illustration absorbs every spare pixel of height so the stats bar lands on a deliberate 26px baseline; CTA type is fluid-clamped against the longest label so a no-wrap pill can never clip (measured 164 of 164); a backdrop blur under the flag button, invisible beneath its own scrim, was removed because it cost a blur surface every frame.'] },
      { type: 'grid', cols: 3, phone: true, bg: '#0b0b0b', images: [
        { src: S + 'm-home.jpg', ratio: '390/844', alt: 'The mobile home page: one top pill, the wall composition, pill CTAs, the three-cell stats bar', caption: 'Home' },
        { src: S + 'm-pdp.jpg', ratio: '390/844', alt: 'The mobile product page: the boarding-pass gallery with glass tool buttons and thumbnails', caption: 'Product' },
        { src: S + 'm-category.jpg', ratio: '390/844', alt: 'The mobile category page: inventory count, filters, one boarding pass per row', caption: 'Category' },
      ], caption: 'Pass three, as shipped, at 390 points.' },
      { type: 'p', text: 'The most useful thing in pass three was a deletion. A blanket rule from an earlier session forced text to full opacity and was blocking the load-in fade, so on phones the headline snapped into existence while desktop faded. The pill originally hid on scroll like every pill does; it now never hides, it dims to 52% and wakes on touch, because the cart and wishlist counts live in it. Each pass ran as a three-lens design panel (rhythm, components, atmosphere), a synthesis where I rejected a product drop-shadow that reintroduced a known Safari regression, and an adversarial review that caught four real issues before shipping.' },
    ]},
    { id: 'killed', title: 'Three things I built, then threw away', blocks: [
      { type: 'cards', cols: 3, items: [
        { kicker: 'Deleted', title: 'A GSAP 3D coverflow carousel', text: 'Built for the two product rails. Stuttered on the client’s phone. Reverted the same day, then a gentler additive version was rejected too. Replaced by CSS scroll-snap with arrows and an auto-advance that stops permanently the first time you touch it. I was verifying in Chrome; Blink will not reproduce a WebKit compositor bug.' },
        { kicker: 'Rebuilt', title: 'The pinned promo scroller', text: 'Scroll-driven transforms lag in iOS Safari because scroll updates arrive late during momentum. Ripped out for a native scroll-snap swipe: about 7,000 inline style writes per pass became zero, and the library stopped loading on mobile at all.' },
        { kicker: 'Wrong', title: 'Counting compositing layers', text: 'The site died on pinch-zoom. My first diagnosis counted layers. The real cost was decoded image memory, width × height × 4 bytes regardless of file size: 144 MB, with eleven brand logos at 1057×750 rendered into 105-pixel chips. Fixed to 76 MB, and blur surfaces cut from 579 to 14.' },
      ]},
    ]},
    { id: 'numbers', title: 'Craft under constraint', kicker: 'Every performance gain had to be invisible', blocks: [
      { type: 'stats', items: [{ n: '81 ms', l: 'blocking long tasks on the home page, from 1,249' }, { n: '14', l: 'stylesheets, from 26' }, { n: '12', l: 'scripts, from 35' }, { n: '0.000', l: 'CLS, before and after' }] },
      { type: 'p', text: 'No version control, no build, no local environment: every change was made through the WordPress admin on the live store while it took orders, with weekly backups and staging locked. A seven-day cache made correct work look broken for a week. And the obvious verification, a pixel diff, does not work here because product lists are randomised per request, so I diffed the set of product IDs instead. The last full sweep captured 599 screenshots across 321 URLs with zero failures. It launched with a sitewide `noindex` caught the night before, 2,656 customers migrated without a single email sent, and 99 reviews carried across intact.' },
    ]},
    { id: 'reflection', title: 'What I would do differently', blocks: [
      { type: 'p', text: '**I would pin far less of the page.** Roughly 7,700 of the 16,000 pixels of the mobile home page are sticky-pinned. Each section is good in isolation; I never added them up. The right question was never “is this section good”, it was “how much of this page is allowed to hold the reader still”. That is the page-level version of the mistake I caught on the product page and missed on the home page.' },
      { type: 'p', text: '**I would test on the client’s phone far earlier.** Two of the three things I killed were killed by it, after they were built. **I shipped a footer four times without looking at it**, verifying with computed styles that cannot see clipping or a void; the client saw a broken footer four times. Now nothing is done until it has been looked at, at desktop and at mobile. And I would have argued harder for staging on day one; caution on a live store is not free, it shows up as fewer experiments.' },
      { type: 'quote', text: 'The thing I am proudest of is not a screen. It is that a stranger can open a product page, see a reference number and a route printed on the frame, and understand without being told that this shop knows where its stock came from.' },
    ]},
  ],
};
