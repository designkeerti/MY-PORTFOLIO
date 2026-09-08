import type { Project } from './types';
import { dmrcScenes } from '../previews/DmrcPreview';
const A = '/work/dmrc/';

export const dmrc: Project = {
  meta: { slug: 'dmrc', title: 'Redesigning the Delhi Metro experience', oneLiner: 'One of the busiest metro systems on earth, 5.5 million riders a day, and a crowd-management problem at its interchanges. Research, global benchmarks, structured ideation and three proposals.', role: 'UX Researcher', year: '2024', company: 'DMRC', accent: '#E53935', accent2: '#0A1424', tag: 'Public transport' },
  cover: '/work/dmrc/poster.jpg',
  externalLink: 'https://keerthivardhan.framer.website/Work/AppProject1',
  timeline: 'Explorations to low-fidelity designs in 4 weeks, alongside other projects',
  expertise: 'UX research · System design',
  facts: ['UX researcher', '5.5M riders a day', '72% cite overcrowding', 'Three proposals'],
  summary: 'The Delhi Metro provides maps, signage and announcements in English and Hindi, plus a handful of apps. Yet tourists, first-time travellers and daily commuters all struggle to navigate a well-structured but complex system of colour-coded lines and multi-level stations. This project set out to understand the system’s shortcomings and its strengths, research travellers’ needs and grievances, and propose a mobile-first solution for navigating within it.',
  preview: dmrcScenes,
  chapters: [
    { id: 'why', title: 'Why the Delhi Metro?', blocks: [
      { type: 'lead', text: 'The Delhi Metro serves over 5.5 million passengers a day across 288 stations and 393 km of track. It is the backbone of the city’s transit. And as ridership grows, peak-hour overcrowding at interchanges like Rajiv Chowk and Kashmere Gate has become a pressing, daily problem.' },
      { type: 'img', src: A + 'yLGSxN7kYnpboWYE5Dvz9HNf4jg.png', alt: 'Delhi Metro at a glance: 5.5 million daily passengers, 393 km of track, 288 stations', size: 'text', bg: '#0A1424', pad: true },
      { type: 'p', text: 'The network evolved in phases; some sections are over a decade old, creating disparities in infrastructure, technology and passenger-flow management. The goal: redesign and improve crowd management to make the metro experience smoother and safer.' },
    ]},
    { id: 'world', title: 'Learning from metros around the world', blocks: [
      { type: 'grid', cols: 3, images: [
        { src: A + '26ueH5rNumxl3TWRnuijwkKIGE.webp', alt: 'Tokyo Metro carriage map', caption: '🇯🇵 Tokyo. Station jingles, carriage maps that tell you which car to board for your exit, signage every 20 metres.' },
        { src: A + '0PI4IszNcA1gFqyM6o5m2WmlLA.webp', alt: 'Contactless tap at a gate', caption: '🇬🇧 London. Contactless payment at the gate, real-time disruption alerts, step-free access.' },
        { src: A + 'q0VpX6FtaR2etTq3ORrmX7PP3w.webp', alt: 'Hong Kong Octopus card', caption: '🇭🇰 Hong Kong. One Octopus card for metro, buses, ferries and shops. Live arrivals, Wi-Fi, charging.' },
      ]},
      { type: 'img', src: A + '2CO9fw4RvUZIZc0U2XSwS4afhQ.png', alt: 'Tokyo in-train display showing minutes to destination and carriage position', caption: 'Inside a Tokyo train: minutes to your stop, and which carriage you are in relative to the platform exits.', size: 'text' },
    ]},
    { id: 'stakeholders', title: 'Stakeholders and research', blocks: [
      { type: 'grid', cols: 4, images: [
        { src: A + 'R7VThUOCHC1E4r9ByggM2OqZsw.png', alt: 'Commuters' },
        { src: A + 'FeWWHo3ihaBHoWQojNjrnhWYd0o.webp', alt: 'Delhi Metro Security' },
        { src: A + 'YutNVc4xKuY5Vwl9kgOTs5vjxg.webp', alt: 'Train operators' },
        { src: A + 'enFk5pCaG9udZ1H35ZE060HsOg.png', alt: 'Operating authority' },
      ], caption: 'Commuters, security, operators and the authority. Each has a different definition of a good day.' },
      { type: 'img', src: A + 'lpxA6yZviGy2JSn039NoIlBkA.png', alt: 'Survey: 32 participants, 12-15 questions, ages 17-43, 20% had no metro usage', caption: '32 participants, 12 to 15 questions each, ages 17 to 43. One in five had never used the metro.', size: 'text', bg: '#0A1424', pad: true },
      { type: 'stats', items: [{ n: '72%', l: 'cite peak-hour overcrowding as the biggest frustration' }, { n: '65%', l: 'face delays; women and elderly cite comfort' }, { n: '42%', l: 'say the DMRC app lacks real-time crowd data' }, { n: '95%', l: 'of women feel unsafe; want safety features and monitoring' }] },
      { type: 'grid', cols: 2, images: [
        { src: A + 'w7LLs8ryWUSmq6eKft1604BNwOg.webp', alt: 'Persona and empathy map: Rahul Mehta' },
        { src: A + 'NmHTI5TwZHNjiTeWL0m0xiIfKQg.webp', alt: 'Persona and empathy map: Priya Reddy' },
      ], caption: 'Rahul and Priya. Two commuters, two very different mornings.' },
    ]},
    { id: 'problem', title: 'Problem statement', blocks: [
      { type: 'quote', text: 'Passengers face severe overcrowding at key interchange stations during peak hours: long waits, unsafe boarding, delays. The existing infrastructure and crowd-management systems cannot handle the demand.' },
    ]},
    { id: 'ideation', title: 'Ideation: Six Thinking Hats', kicker: 'Every idea judged from six directions', blocks: [
      { type: 'img', src: A + 'JqtGUxeaq7ZbGxdpAgFmmdbvJB8.jpg', alt: 'Six Thinking Hats', size: 'text' },
      { type: 'cards', cols: 3, items: [
        { kicker: 'White · facts', title: 'Bottlenecks are measurable', text: '5.5M daily riders; Rajiv Chowk and Kashmere Gate jam at peak; 65% report delays at ticketing and security.' },
        { kicker: 'Yellow · benefits', title: 'Guide, reconfigure, inform', text: 'In-station navigation, better layouts and escalators, real-time crowd levels in the app.' },
        { kicker: 'Black · risks', title: 'Cost and space', text: 'Older stations have little room for expansion; advanced systems are expensive.' },
        { kicker: 'Red · feelings', title: 'Frustration, fear, discomfort', text: 'Women and the elderly feel unsafe; disabled passengers feel neglected.' },
        { kicker: 'Green · ideas', title: 'Smart crowd management', text: 'AI redirection to emptier gates and coaches, separated entry/exit, off-peak rewards.' },
        { kicker: 'Blue · process', title: 'Pilot, then scale', text: 'Test at a few major stations, run feedback loops, assess cost before rollout.' },
      ]},
    ]},
    { id: 'proposals', title: 'Final ideas', kicker: 'Feasibility, impact, fit', blocks: [
      { type: 'cards', cols: 3, items: [
        { kicker: '01', title: 'Hybrid carriage system', text: 'The first four carriages pre-booked through the app; the last two open-access (tatkal). Predictable boarding for planners, flexibility for the spontaneous.' },
        { kicker: '02', title: 'AR navigation in the station', text: '“Find Your Way”: point the camera at a poster, follow the path to the right platform, and get the best exit gate for your destination.' },
        { kicker: '03', title: 'Smartcard top-up at the gate', text: 'Recharge while entering or exiting, no separate queue at the add-value machine.' },
      ]},
      { type: 'grid', cols: 4, phone: true, images: [
        { src: A + '8x8SH8q53bezsb99C4aKe9nDbFo.png', alt: 'Onboarding: live metro updates' },
        { src: A + '2NsF7AOucBOMqUpFcleW5g9nPU.webp', alt: 'Point your camera at the poster to begin navigation' },
        { src: A + 'YijBlctGzn0Mk4J6rFwf6TL43P0.png', alt: 'Plan your journey' },
        { src: A + 'Q2EbMIFM5Pvi5w33Cy9OZJt0h7U.png', alt: 'Exit recommendation: Gate No. 3' },
      ], bg: '#0A1424', caption: 'Informative onboarding → navigation guidance → exit gate recommendation.' },
      { type: 'grid', cols: 2, images: [
        { src: A + 'RN2r3DBw4Fvr4fT8Ek9HKSrPvU.webp', alt: 'AR: keep following the path' },
        { src: A + 'bsIB2rlEr8B6s20GLK15DYoGhcQ.webp', alt: 'AR: take the escalator down to the subway' },
      ], caption: 'AR guidance, with a language translator for signboards and routes to lifts and wheelchair-accessible paths.' },
      { type: 'img', src: A + 'fkEECPTXCEVTVMrlwe0geoxTiyg.png', alt: 'Smart card auto top-up feature', caption: 'Top-up at the gate: convenience, time saved at peak, fewer interruptions.', size: 'text' },
    ]},
    { id: 'conclusion', title: 'Conclusion', blocks: [
      { type: 'p', text: 'The Delhi Metro is a testament to urban innovation, and its growing ridership demands thoughtful, practical change. The Hybrid Carriage System, gate-side top-up and the enhanced app are actionable strategies to improve flow and elevate the experience. The project underscored something simpler too: listening to commuters and learning from other cities showed that small, thoughtful changes can have a large impact.' },
    ]},
  ],
};
