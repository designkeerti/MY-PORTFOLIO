import type { Project } from './types';
import { ekaiScenes } from '../previews/EkaiPreview';
const A = '/work/ekai/';

export const ekai: Project = {
  meta: { slug: 'ekai', title: 'Website design and product experience for ekai', oneLiner: 'An AI twin that answers your team’s questions inside Slack. The product worked; the website didn’t say so. I rebuilt the first touchpoint from research to final motion.', role: 'Product Designer', year: '2025', company: 'ekai', accent: '#FF6A2A', accent2: '#27403F', tag: 'B2B SaaS' },
  cover: A + 'b4LEGCUCaclrfhX51x9RUiUasM.png',
  externalLink: 'https://keerthivardhan.framer.website/Work/appproject11',
  timeline: 'Explorations to high-fidelity in 4 weeks, alongside other projects',
  expertise: 'Interaction design · Product design',
  facts: ['Product designer', '63% mobile bounce, before', 'Research to final motion', 'Live at yourekai.com'],
  summary: 'Ekai builds an AI twin inside Slack that answers your team’s questions using your existing context, so work keeps moving even when you are not online. The team had a strong product and an early website. As the product grew, the site needed a clearer story and a more trustworthy presence. I partnered with the founders to redesign the full experience and shaped the UX and UI from research to final visuals.',
  link: { href: 'https://yourekai.com', label: 'Visit yourekai.com' },
  preview: ekaiScenes,
  chapters: [
    { id: 'problem', title: 'The problem', kicker: 'In AI SaaS, the website is the first sales call', blocks: [
      { type: 'lead', text: 'People came to the site curious about what ekai could do for them, and the website did not answer. It left them confused, unsure, and a little skeptical of trusting an AI with their work.' },
      { type: 'img', src: A + 'QIE99MB6U1lzmaF1TB1S6bQ4iHs.png', alt: 'The legacy site, annotated: a vague headline and an unclickable video thumbnail', caption: 'The old site. The main line talked about saving time on repetitive work and never said what the product actually was.', size: 'wide' },
      { type: 'stats', items: [{ n: '63%', l: 'mobile bounce rate' }, { n: '12s', l: 'average time on site' }, { n: '<2%', l: 'interaction with the CTA' }, { n: '<0.5%', l: 'reached the features' }] },
      { type: 'list', items: ['The structure hid the things buyers look for first: security and real use cases.', 'Analytics showed a heavy mobile bounce and weak demo click-through on small screens.', 'The mobile site was a scaled-down desktop, not a phone experience.'] },
      { type: 'img', src: A + '2ncF8JGKp09Zmij2yIlasK821w.png', alt: 'Mobile was a scaled-down version of desktop', size: 'text', bg: '#FBF3EA', pad: true },
    ]},
    { id: 'goals', title: 'What we needed to fix', kicker: 'Three objectives, agreed with the founders', blocks: [
      { type: 'cards', cols: 3, items: [
        { kicker: '01', title: 'Explain ekai in one glance', text: 'And use better methods than paragraphs to convey its impact.' },
        { kicker: '02', title: 'Earn security-minded trust', text: 'Without drowning anyone in buzzwords.' },
        { kicker: '03', title: 'Fix mobile', text: 'So people can understand the product and act from any device.' },
      ]},
    ]},
    { id: 'research', title: 'Understanding the real story', kicker: 'Conversations first, then numbers', blocks: [
      { type: 'p', text: 'To understand the gap between the product and the website, I started with simple conversations. They revealed more than data could: people were not just unclear about what ekai did, they were unsure whether they could trust an AI to step into their daily workflow.' },
      { type: 'grid', cols: 2, images: [
        { src: A + '8a4iZa5eFbEIAn5WfbUsQT4UqE.png', alt: 'Persona: team leads and members', caption: 'Team leads and members. Run standups, track progress, answer the same questions daily. Frustration, mixed with hope.' },
        { src: A + 'JGvE2ADw71ieNZsGZZpiQp1qEw.png', alt: 'Persona: tech and security owners', caption: 'Tech and security owners. The cautious voice in the room. Concern, and skepticism.' },
      ], bg: '#FBF3EA' },
      { type: 'img', src: A + '5sQAKO5Ode1GH4XSJTsnVVOk1w.webp', alt: 'Four things we heard in interviews', caption: 'What we heard, verbatim.', size: 'wide' },
      { type: 'p', text: 'I reviewed the live product, the old site and the analytics to see where people dropped off. Mobile visitors left the quickest, and most people never stayed long enough to understand what ekai did. Alongside this, the team and I audited leading AI tools to see how they explained value and trust. Competitors were clearer, more direct, and surfaced security much earlier.' },
      { type: 'h', text: 'Buyer fears' },
      { type: 'p', text: 'Reports on AI SaaS adoption kept listing the same blockers for deals that never closed. They became the spine of every later decision.' },
      { type: 'cards', cols: 3, items: [{ title: 'Value is unclear', text: 'What does it actually do for my team?' }, { title: 'Effort is unknown', text: 'How long does setup take? Who has to be involved?' }, { title: 'Data safety feels vague', text: 'Where does our Slack go? Who can see it?' }] },
      { type: 'grid', cols: 2, images: [
        { src: A + 'tE2l77fiEiIPFK0dyXyLmROsGg.png', alt: 'Need: clear headlines; security shown early' },
        { src: A + 'ACw7E8hnpQVkOu7UQtasU9Jslw.png', alt: 'Need: social proof; simple mobile layouts with a visible call to action' },
      ], bg: '#FBF3EA', caption: 'Needs, written down so the whole team could argue with them.' },
    ]},
    { id: 'structure', title: 'A page that follows how people evaluate an AI tool', kicker: 'Buyer journey, top to bottom', blocks: [
      { type: 'list', items: ['Clear explanation', 'Real examples', 'Integrations', 'Proof', 'Security', 'Call to action'] },
      { type: 'p', text: 'Every section of the page answers the next question a skeptical buyer asks, in the order they ask it.' },
    ]},
    { id: 'directions', title: 'Exploring directions', kicker: 'Three concepts, one hybrid', blocks: [
      { type: 'grid', cols: 3, images: [
        { src: A + 'vy77NpmDiVnpU2ADI5CXSs59I0.png', alt: 'Concept A', caption: 'A. Narrative hero, emotional opener.' },
        { src: A + 'iAwUppv898zbQLkutd3qpf7Cdo.png', alt: 'Concept B', caption: 'B. Modular backbone. Scored highest.' },
        { src: A + 'DP3DEoZ5bpzZdh0ul8K1wtFjopQ.png', alt: 'Concept C', caption: 'C.' },
      ], bg: '#FBF3EA' },
      { type: 'img', src: A + 'BeCiaUcBexnUZLZ2L7vEjn2nRGY.png', alt: 'Evaluation matrix for the three concepts', caption: 'Concept B scored highest overall but lacked an emotional opener, so we built a hybrid: B’s modular backbone with A’s narrative hero.', size: 'text' },
    ]},
    { id: 'visual', title: 'The visual language', kicker: 'The legacy look was strong. We needed trust, security and compassion.', blocks: [
      { type: 'img', src: A + 'k0HDmapQpXfIcEYwuWD4WUGdQ.png', alt: 'Colour system: orange for energy and innovation, teal for trust', caption: 'Orange conveys energy, innovation and warmth. Teal grounds it in trust and calm. Neutrals do the rest.', size: 'wide' },
    ]},
    { id: 'alive', title: 'Alive sections', kicker: 'Micro-interactions that remove hesitation', blocks: [
      { type: 'p', text: 'The product has many moments where users need clarity. I added motion that removes hesitation and helps people feel in control: hover states make targets obvious, smooth transitions make movement feel natural, light pulses draw attention to the key action. Short feature animations explain how each part of ekai works day to day, so users understand the value without reading long explanations. Reduced-motion settings are respected throughout.' },
      { type: 'img', src: A + 'b4LEGCUCaclrfhX51x9RUiUasM.mp4', alt: 'The hero: a Slack-like conversation shows what the AI twin actually does', caption: 'A hero that feels alive. A simple Slack-like conversation shows what the twin does, and replaces confusion with instant understanding.', size: 'wide' },
      { type: 'grid', cols: 3, images: [
        { src: A + 'yvCOXE3FsehpZbAYAz4FgDbfhUc.mp4', alt: 'Feature animation: your AI twin, trained by you' },
        { src: A + 'qJlWawcCzXTwNSh3ZDbm19udE.mp4', alt: 'Feature animation: the platform' },
        { src: A + 'WoEzU6rPsJpT06fwcGi3b2IWWSE.mp4', alt: 'Feature animation: streamline your decisions' },
      ], caption: 'Three demo clips, so people understand the product before they read a word.' },
      { type: 'p', text: '**Honest, clear security.** I designed a security section that explains data flow in plain language. No jargon, no overclaiming.' },
    ]},
    { id: 'final', title: 'Final screens', blocks: [
      { type: 'img', src: A + 'h67k8Am6rvHpo62aF0F8jg5PYY.webp', alt: 'The final ekai website, full page', size: 'wide' },
      { type: 'note', text: 'A large part of my work for ekai is the product experience itself: platform flows and the full Chrome extension. Those screens are under NDA, but I am happy to walk through the thinking in a conversation.' },
    ]},
    { id: 'conclusion', title: 'What it taught me', blocks: [
      { type: 'p', text: 'This project taught me how much clarity, honesty and simplicity matter in AI products. ekai already had strong technology; my job was to translate that strength into an experience that feels understandable, trustworthy and easy to act on. Working closely with the founders shaped how I think about product storytelling, trust building and the role of design in early-stage AI companies.' },
    ]},
  ],
};
