import type { Project } from './types';
import { infinityScenes } from '../previews/InfinityPreview';
const A = '/work/realestate/';

export const infinity: Project = {
  meta: { slug: 'infinity', title: 'Infinity Lifespaces: making a home build feel transparent', oneLiner: 'A website and a client app for a design-and-build firm, where every feature answers a question clients were afraid to ask: what will it cost, what is happening on site, where is my money going.', role: 'UX Designer', year: '2024', company: 'Infinity Lifespaces', accent: '#C9A96E', accent2: '#0E1418', tag: 'Real estate · CRM' },
  cover: A + 'Sk5TswNLO6gk2IJhTVRELrLDT08.webp',
  timeline: 'Research to final designs in 8 weeks',
  expertise: 'UX/UI design · CRM application · Website',
  facts: ['UX designer', 'Website + client app', 'Quotation calculator', '8 weeks to final designs'],
  summary: 'Infinity Lifespaces is a design-and-build firm in Gurugram: interiors, exteriors and residential projects. Their clients hand over a home and a large share of their savings, and the firm’s reputation rests on openness. Their website and their client communication were not showing that openness. I designed both.',
  glance: {
    problem: 'Building a home is a leap of faith: clients do not know what it will cost, what is happening on site, or where their money is going. Infinity’s website gave them little to go on, and client updates had no central home.',
    role: 'UX designer for the website and the client app (CRM). Stakeholder discussions, flows, wireframes and high-fidelity designs in eight weeks, then working with the cross-functional team on implementation.',
    did: ['Put a quotation calculator on the website, so a price comes first, not last', 'Gave clients a moodboard to bring their own taste into the process', 'Designed a client app with live site video, payment milestones and documents', 'Carried the calculator and moodboard into the app, so a prospect never starts over'],
    outcome: 'A redesigned website and a client app, taken from first conversations to final designs in eight weeks and into implementation with the build team.',
  },
  preview: infinityScenes,
  chapters: [
    { id: 'problem', title: 'Trust, before anything else', kicker: 'The problem', blocks: [
      { type: 'lead', text: 'When someone hires a firm to build their home, three questions sit underneath every conversation: what will this cost, what is actually happening on site, and where is my money going. Infinity answered them well in person. Their website and their tools did not answer them at all.' },
      { type: 'img', src: A + 'Sk5TswNLO6gk2IJhTVRELrLDT08.webp', alt: 'Infinity Lifespaces website and CRM app', size: 'wide' },
      { type: 'p', text: 'The old site was static and said little about how working with them would feel. And once a project started, updates, documents and payments were spread across people and messages, with no single place a client could check.' },
    ]},
    { id: 'research', title: 'Both sides of the table', kicker: 'Research', blocks: [
      { type: 'p', text: 'I started with stakeholder discussions inside the firm, about where clients got anxious and what the team kept re-explaining, and then with the clients’ side: their pain points before signing and during the build. Underneath everything were the same three questions.' },
      { type: 'cards', cols: 3, items: [
        { kicker: 'Before signing', title: '“What will it cost?”', text: 'Price was the first question, and the last thing a visitor could find out on their own.' },
        { kicker: 'During the build', title: '“What is happening?”', text: 'Clients could not see progress without asking, and asking repeatedly feels like distrust.' },
        { kicker: 'All the way through', title: '“Where is my money?”', text: 'Payments and materials were tracked by the firm, not visible to the person paying.' },
      ]},
    ]},
    { id: 'decisions', title: 'Transparency, turned into features', kicker: 'Design decisions', blocks: [
      { type: 'list', items: [
        '**Price first.** A Quotation Calculator on the website gives an estimate in a few steps: commercial, renovation or residential, then the details. It puts the most anxious question at the top of the funnel instead of behind a sales call.',
        '**Let clients bring their taste.** A Moodboard where clients collect and share inspiration turns the design process into a collaboration from day one, and gives the designers a better brief.',
        '**Show the site, not a status.** In the client app, live video from the site replaces “it’s on track”. Clients can raise a query or message the build team from the same screen.',
        '**Make the money visible.** Payments are laid out as milestones tied to the work, with documents and material usage next to them, so a client can see what each payment paid for.',
        '**One continuous thread.** The calculator and the moodboard live inside the app too. Someone who started as a website visitor becomes a client without re-entering anything.',
      ]},
    ]},
    { id: 'website', title: 'The website', kicker: 'For people deciding', blocks: [
      { type: 'p', text: 'A cleaner, more scannable layout with one clear call to action, and interactive moments that invite exploration rather than decorate it.' },
      { type: 'grid', cols: 2, images: [
        { src: A + '0rOejDMdIS2JXmUu7tkHyN19o74.webp', alt: 'Minimalistic hero page with a call to action', caption: 'A minimal hero with one call to action.' },
        { src: A + 'jlpwQrRBs9GjmV3lttfdvBD2e4.png', alt: 'Quotation calculator: steps to your dream space', caption: 'The Quotation Calculator: pick the kind of project, then get an estimate.' },
      ]},
    ]},
    { id: 'app', title: 'The client app', kicker: 'For people building', blocks: [
      { type: 'grid', cols: 3, phone: true, images: [
        { src: A + '2oIQ5vxAoAawlGTcs38j8m8ejYA.png', alt: 'Informative dashboard with quick actions', caption: 'A dashboard with the next thing to do.' },
        { src: A + 'Wph8fnmXv9WM4agA4LiMhm1Cc8.png', alt: 'Stay connected with your build and design team', caption: 'The build and design team, one tap away.' },
        { src: A + 'z83VUveSouF2uuCiEumjf7RQxYQ.png', alt: 'Track payment milestones with transparency', caption: 'Payment milestones, tied to the work.' },
      ], bg: '#0E1418' },
    ]},
    { id: 'reflection', title: 'What I would do differently', blocks: [
      { type: 'p', text: '**Measure the calculator from day one.** It was designed to turn anxious visitors into conversations. I would track how many estimates lead to a call and where people drop out of the steps, and tune it from that, rather than from opinion.' },
      { type: 'p', text: '**Design for the person on site, too.** Live video and progress updates only work if someone on site can post them in a minute between tasks. I focused on the client’s side of the app; next time I would design the site team’s side with the same care.' },
    ]},
  ],
};
