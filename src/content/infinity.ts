import type { Project } from './types';
import { infinityScenes } from '../previews/InfinityPreview';
const A = '/work/realestate/';

export const infinity: Project = {
  meta: { slug: 'infinity', title: 'Empowering real estate through digital', oneLiner: 'A website and a CRM app for a design-and-build firm, with a quotation calculator, moodboards, live site video and payment milestones. Transparency, turned into features.', role: 'UX Designer', year: '2024', company: 'Infinity Lifespaces', accent: '#C9A96E', accent2: '#0E1418', tag: 'Real estate · CRM' },
  cover: '/work/realestate/poster.jpg',
  externalLink: 'https://keerthivardhan.framer.website/Work/DesktopProject1',
  timeline: 'Explorations to final designs in 8 weeks',
  expertise: 'UX/UI design · CRM application · Website',
  facts: ['UX designer', 'Website + CRM app', 'Quotation calculator', '8 weeks to final designs'],
  summary: 'Infinity Lifespaces is a Gurugram design-and-build company focused on real estate: interior and exterior design for housing, and several residential projects. Their reputation is built on comprehensive solutions, client contentment and openness. Their digital experience was not keeping up.',
  preview: infinityScenes,
  chapters: [
    { id: 'background', title: 'Background', blocks: [
      { type: 'lead', text: 'The offering was robust, but the existing website lacked interactivity, transparency and engagement, all of which matter enormously when someone is trusting you with their home. Managing client relationships and project updates had also become cumbersome without a central system.' },
      { type: 'img', src: A + 'Sk5TswNLO6gk2IJhTVRELrLDT08.webp', alt: 'Infinity Lifespaces website and CRM app', size: 'wide' },
    ]},
    { id: 'process', title: 'Process', blocks: [
      { type: 'cards', cols: 3, items: [
        { kicker: 'Research & planning', title: 'Both sides of the table', text: 'Stakeholder discussions, user pain points, and the opportunities to enhance engagement and transparency.' },
        { kicker: 'Design & prototyping', title: 'Wireframes to high fidelity', text: 'Every detail focused on usability and visual appeal. The Quotation Calculator and Moodboard were placed deliberately to drive interaction.' },
        { kicker: 'Implementation', title: 'With cross-functional teams', text: 'Interactive animations, real-time features and a seamless interface across the website and the CRM.' },
      ]},
    ]},
    { id: 'solution', title: 'The solution', blocks: [
      { type: 'h', text: 'Website redesign' },
      { type: 'p', text: 'The website was rebuilt to be scannable and engaging: a clean layout, interactive animations that guide exploration, a **Quotation Calculator** for quick and transparent investment estimates, and a **Moodboard** where clients curate and share their style inspiration.' },
      { type: 'grid', cols: 2, images: [
        { src: A + '0rOejDMdIS2JXmUu7tkHyN19o74.webp', alt: 'Minimalistic hero page with a call to action', caption: 'A minimal hero with one call to action.' },
        { src: A + 'jlpwQrRBs9GjmV3lttfdvBD2e4.png', alt: 'Quotation calculator: steps to your dream space', caption: 'The Quotation Calculator: commercial, renovation or residential, then an estimate.' },
      ]},
      { type: 'h', text: 'CRM application' },
      { type: 'p', text: 'The CRM centralises client interaction and project management. Live video streaming for project updates keeps clients involved; they can raise queries, message the team and track progress. Documents, payment tracking and detailed material usage build trust. The calculator and moodboard live inside the CRM too, so the experience is one continuous thread.' },
      { type: 'grid', cols: 3, phone: true, images: [
        { src: A + '2oIQ5vxAoAawlGTcs38j8m8ejYA.png', alt: 'Informative dashboard with quick actions', caption: 'A dashboard with quick actions.' },
        { src: A + 'Wph8fnmXv9WM4agA4LiMhm1Cc8.png', alt: 'Stay connected with your build and design team', caption: 'Stay connected with the build and design team.' },
        { src: A + 'z83VUveSouF2uuCiEumjf7RQxYQ.png', alt: 'Track payment milestones with transparency', caption: 'Payment milestones, transparently.' },
      ], bg: '#0E1418' },
    ]},
    { id: 'results', title: 'Results', blocks: [
      { type: 'cards', cols: 2, items: [
        { title: 'Increased transparency', text: 'The Quotation Calculator gave clients clear, quick investment estimates.' },
        { title: 'Enhanced engagement', text: 'The Moodboard made the design process collaborative and personal.' },
        { title: 'Streamlined processes', text: 'The CRM centralised communication, updates and documents.' },
        { title: 'Happier clients', text: 'Live video and real-time tracking provided convenience, and trust.' },
      ]},
    ]},
  ],
};
