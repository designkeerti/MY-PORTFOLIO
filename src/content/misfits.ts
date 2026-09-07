import type { Project } from './types';
import { misfitsScenes } from '../previews/MisfitsPreview';
const A = '/work/misfits/';

export const misfits: Project = {
  meta: { slug: 'misfits', title: 'Misfits: connecting through communities', oneLiner: 'A platform for finding like-minded people through interest-based clubs, and then actually meeting them. Research, personas, flows and a full high-fidelity app.', role: 'UX/UI Designer', year: '2023', company: 'Misfits', accent: '#8B5CF6', accent2: '#0E0A1C', tag: 'Mobile app' },
  cover: A + 'ohaffIRt0xglZU0U2rKGdrcYD5o.webp',
  externalLink: 'https://keerthivardhan.framer.website/Work/AppProject2',
  timeline: 'Explorations to final designs in 5 weeks, alongside other projects',
  expertise: 'UX/UI design',
  facts: ['UX/UI designer', '200+ people surveyed', 'Personas, flows, hi-fi app', '5 weeks'],
  summary: 'Misfits connects individuals with like-minded people by joining communities and clubs built around shared interests. The app bridges the gap between online and offline interaction, creating real connections through tailored events, chats and group activities.',
  preview: misfitsScenes,
  chapters: [
    { id: 'background', title: 'Background', kicker: 'Authentic connection is hard to find online', blocks: [
      { type: 'lead', text: 'In a world dominated by digital interaction, finding authentic, community-driven connection is hard. Misfits offers a space to explore interests, connect with peers, and move from virtual to real-world experiences. It also lets people create events and lead activities, which is where belonging actually comes from.' },
      { type: 'grid', cols: 3, phone: true, images: [
        { src: A + 'LlJ5OvpyCvxaPCT39k3u9kVFocU.png', alt: 'Onboarding: discover hobbies you love' },
        { src: A + 'ohaffIRt0xglZU0U2rKGdrcYD5o.webp', alt: 'Explore Misfits: Sporty, Brainiac, Cultural' },
        { src: A + 'YyM87pl8zqWCd4Bs2uGCujP0srA.webp', alt: 'Welcome screen with avatar picker' },
      ], bg: '#0E0A1C' },
    ]},
    { id: 'process', title: 'Process', blocks: [
      { type: 'cards', cols: 2, items: [
        { kicker: 'Research', title: 'Surveys with 200+ people', text: 'To find the pain points in current social platforms. Interviews revealed a lack of authenticity and a hard transition from online to real life.' },
        { kicker: 'Define', title: 'Personas and empathy maps', text: 'Key needs: meaningful connection, diverse communities, easy event organisation.' },
        { kicker: 'Ideate', title: 'Club joining, event hosting, in-app chat', text: 'Designs that prioritise friendly navigation and engaging visuals.' },
        { kicker: 'Prototype', title: 'Wireframes to high fidelity', text: 'Core functionality first, then onboarding flows and the interactive bits.' },
        { kicker: 'Test', title: 'Usability sessions', text: 'Feedback on layout and features, then iterations on what people actually tripped over.' },
      ]},
    ]},
    { id: 'solution', title: 'The solution', kicker: 'Discover, join, talk, show up', blocks: [
      { type: 'p', text: 'Misfits is a robust, friendly platform where you discover and join interest-based communities, have real conversations, and organise or attend real-world events. The tools emphasise authenticity, collaboration and exploration.' },
      { type: 'grid', cols: 3, phone: true, images: [
        { src: A + 'Yqrk26djw5tgPKy7Ix365qrk3s.webp', alt: 'Club detail page', caption: 'Before you commit to a club, check its vibe. Timings, council, the other misfits.' },
        { src: A + 'YFMAoHq6S23Hc3M6YhFtRK0th5M.webp', alt: 'Explore the boardgaming club, with a photo from a meetup', caption: 'Access everything about the club, from timings to the people in it.' },
        { src: A + 'XpJNlpQXMaQtWyVGkRLhMl174.png', alt: 'Club chat', caption: 'Connect with members, online and offline, to get the most out of Misfits.' },
      ], bg: '#0E0A1C' },
      { type: 'cards', cols: 3, items: [
        { title: 'Interest-based communities', text: 'Explore and join clubs tailored to your hobbies and passions.' },
        { title: 'Interactive chat', text: 'Real-time group chat to keep conversations, and plans, alive.' },
        { title: 'A bridge to real life', text: 'Features that push online interaction toward offline meetups.' },
      ]},
    ]},
    { id: 'results', title: 'Results', blocks: [
      { type: 'p', text: 'Misfits addressed the two hard problems, fostering meaningful connection and moving online interaction into real-world experience, through user-centred features and an interface people found intuitive.' },
      { type: 'cards', cols: 3, items: [
        { title: 'Enhanced engagement', text: 'A diverse user base actively participating in clubs and events, and moving between digital and offline without friction.' },
        { title: 'Stronger communities', text: 'The interest-based club model produced lasting friendships and networks beyond the app.' },
        { title: 'Events that people attend', text: 'From cultural exchanges to fitness meetups, with high participation and satisfaction.' },
      ]},
    ]},
  ],
};
