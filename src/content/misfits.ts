import type { Project } from './types';
import { misfitsScenes } from '../previews/MisfitsPreview';
const A = '/work/misfits/';

export const misfits: Project = {
  meta: { slug: 'misfits', title: 'Misfits: from followers to friends', oneLiner: 'A community app built around clubs, not profiles, so that meeting people online leads to meeting them in real life. Research with 200+ people, then flows and a full high-fidelity app.', role: 'UX/UI Designer', year: '2023', company: 'Misfits', accent: '#8B5CF6', accent2: '#0E0A1C', tag: 'Mobile app' },
  cover: A + 'ohaffIRt0xglZU0U2rKGdrcYD5o.webp',
  timeline: 'Research to high-fidelity designs in 5 weeks, alongside other projects',
  expertise: 'UX research · Interaction design · UI',
  facts: ['UX/UI designer', '200+ people surveyed', 'Clubs, chat and events', '5 weeks'],
  summary: 'Misfits helps people find others who share their interests, through clubs, and then actually meet them. Social apps are good at followers and bad at friends. I designed the app from research to high fidelity, around one question: what gets someone from a chat to showing up?',
  glance: {
    problem: 'Social apps make it easy to follow people and hard to actually meet them. A survey of 200+ people found two gaps: conversations online feel inauthentic, and the step from online to real life is where most connections die.',
    role: 'UX/UI designer, from research to high-fidelity screens in five weeks, alongside other projects. Surveys and interviews, personas, flows, wireframes, the visual design and usability sessions.',
    did: ['Organised the app around interest clubs instead of people’s profiles', 'Designed club pages that show who is there and when they meet, before you join', 'Made events the end of every path, and let anyone host one', 'Tested the layout with users and iterated on where they tripped'],
    outcome: 'A complete high-fidelity app: onboarding, club discovery, club pages, group chat and events. It was a design project, so there are no usage numbers to report; the measure I would track first is how many people who join a club attend its first event.',
  },
  preview: misfitsScenes,
  chapters: [
    { id: 'problem', title: 'Followers are not friends', kicker: 'The problem', blocks: [
      { type: 'lead', text: 'Most social apps are built to keep you scrolling, not to get you out of the house. You can follow a thousand people who share your hobby and still have nobody to play board games with on Saturday. Misfits set out to be the opposite: an app you use so that you can stop using it.' },
      { type: 'grid', cols: 3, phone: true, images: [
        { src: A + 'LlJ5OvpyCvxaPCT39k3u9kVFocU.png', alt: 'Onboarding: discover hobbies you love' },
        { src: A + 'ohaffIRt0xglZU0U2rKGdrcYD5o.webp', alt: 'Explore Misfits: Sporty, Brainiac, Cultural' },
        { src: A + 'YyM87pl8zqWCd4Bs2uGCujP0srA.webp', alt: 'Welcome screen with avatar picker' },
      ], bg: '#0E0A1C' },
    ]},
    { id: 'research', title: 'What 200+ people told us', kicker: 'Research', blocks: [
      { type: 'p', text: 'I started with a survey of more than 200 people about how they make friends today and where existing platforms let them down, then followed up with interviews. Two findings came up again and again, and both became design requirements.' },
      { type: 'cards', cols: 2, items: [
        { kicker: 'Finding 01', title: 'Online feels inauthentic', text: 'People did not trust profiles and follower counts. They wanted a reason to talk to someone that was not just “we are both on this app”.' },
        { kicker: 'Finding 02', title: 'The leap to real life is the hard part', text: 'Plenty of people chat. Few meet. Going from a conversation to showing up somewhere, among strangers, is where connections quietly die.' },
      ]},
      { type: 'p', text: 'Personas and empathy maps turned these into three needs the app had to meet: **meaningful connection**, **communities diverse enough to find your niche**, and **events that are easy to organise and easy to say yes to**.' },
    ]},
    { id: 'decisions', title: 'Three decisions that shaped the app', kicker: 'Design decisions', blocks: [
      { type: 'list', items: [
        '**Clubs, not profiles.** The home of the app is a club, built around an interest, not a feed of people. A shared interest is a reason to talk that does not feel forced, which answers the first finding. Clubs are grouped into Sporty, Brainiac and Cultural, so browsing feels like picking a plan, not shopping for people.',
        '**Show the club before you commit.** Joining a group of strangers is a risk. The club page answers the questions people actually have before saying yes: when it meets, who runs it, who else is in it, and what a meetup really looks like, with photos from past events.',
        '**Every path ends in an event.** Chat exists to make plans. Events sit inside every club, and anyone can host one, because the people who organise are the ones who feel they belong. The app counts as working when people leave it to go somewhere.',
      ]},
    ]},
    { id: 'solution', title: 'Discover, join, talk, show up', kicker: 'The app', blocks: [
      { type: 'grid', cols: 3, phone: true, images: [
        { src: A + 'Yqrk26djw5tgPKy7Ix365qrk3s.webp', alt: 'Club detail page', caption: 'Check the vibe before you commit: timings, the council, the other misfits.' },
        { src: A + 'YFMAoHq6S23Hc3M6YhFtRK0th5M.webp', alt: 'Explore the boardgaming club, with a photo from a meetup', caption: 'Real photos from real meetups, not stock imagery.' },
        { src: A + 'XpJNlpQXMaQtWyVGkRLhMl174.png', alt: 'Club chat', caption: 'Group chat, for turning a conversation into a plan.' },
      ], bg: '#0E0A1C' },
      { type: 'p', text: 'Onboarding starts with hobbies, not with a profile: you pick what you love, then an avatar, and you land among clubs that match. Friendly, illustrated and a little loud, because the people this is for are tired of polished, performative social apps.' },
    ]},
    { id: 'process', title: 'How it came together', kicker: 'Five weeks', blocks: [
      { type: 'cards', cols: 3, items: [
        { kicker: 'Weeks 1–2', title: 'Research and define', text: 'Survey, interviews, personas and empathy maps. The two findings above.' },
        { kicker: 'Weeks 2–4', title: 'Flows to high fidelity', text: 'Club joining, event hosting and chat first, as wireframes; then onboarding and the visual language.' },
        { kicker: 'Week 5', title: 'Test and iterate', text: 'Usability sessions on the layout and features, then fixes to wherever people hesitated or got lost.' },
      ]},
    ]},
    { id: 'reflection', title: 'What I would do differently', blocks: [
      { type: 'p', text: '**Decide how success is measured before designing.** For an app whose whole point is meeting in person, the number that matters is how many people who join a club go to its first event. I would set that up front and use it to judge every flow, instead of judging screens by how they look.' },
      { type: 'p', text: '**Test the scary part in real life.** Usability sessions told us how people moved through the screens. They could not tell us how it feels to walk into a room of strangers. Next time I would run a small real meetup through a prototype and watch what happens at the door.' },
    ]},
  ],
};
