/**
 * Companies whose job boards are public (checked November 2026), searched straight from the
 * browser. Boards of several megabytes (OpenAI, Palantir, Paytm, SpaceX, Harvey, Notion) are
 * left out to keep a search quick on a phone; most of them still turn up through the job
 * searches in sources.ts.
 */
export type Ats = 'greenhouse' | 'lever' | 'ashby';
export type Board = { ats: Ats; slug: string; name: string };

const list = (ats: Ats, entries: string) =>
  entries.split(',').map(e => { const [slug, name] = e.split(':'); return { ats, slug: slug.trim(), name: (name ?? slug).trim() }; });

export const BOARDS: Board[] = [
  ...list('greenhouse', 'databricks:Databricks,stripe:Stripe,anthropic:Anthropic,cloudflare:Cloudflare,elastic:Elastic,mongodb:MongoDB,datadog:Datadog,hellofresh:HelloFresh,okta:Okta,toast:Toast,samsara:Samsara,brex:Brex,coinbase:Coinbase,celonis:Celonis,gitlab:GitLab,affirm:Affirm,airbnb:Airbnb,robinhood:Robinhood,pinterest:Pinterest,lyft:Lyft,reddit:Reddit,figma:Figma,intercom:Intercom,twilio:Twilio,vercel:Vercel,instacart:Instacart,inmobi:InMobi,gusto:Gusto,chime:Chime,duolingo:Duolingo,monzo:Monzo,contentful:Contentful,dropbox:Dropbox,n26:N26,discord:Discord,wise:Wise,squarespace:Squarespace,airtable:Airtable,groww:Groww,typeform:Typeform,calendly:Calendly,'
    + 'lucidmotors:Lucid Motors,waymo:Waymo,braze:Braze,verkada:Verkada,roblox:Roblox,flexport:Flexport,fivetran:Fivetran,riotgames:Riot Games,oscar:Oscar Health,'
    + 'rubrik:Rubrik,scaleai:Scale AI,klaviyo:Klaviyo,epicgames:Epic Games,mozilla:Mozilla,asana:Asana,nuro:Nuro,zoominfo:ZoomInfo,carta:Carta,smartsheet:Smartsheet,'
    + 'faire:Faire,wrike:Wrike,twitch:Twitch,apolloio:Apollo.io,mixpanel:Mixpanel,sigmoid:Sigmoid,peloton:Peloton,launchdarkly:LaunchDarkly,tamara:Tamara,later:Later,'
    + 'druva:Druva,salesloft:Salesloft,slice:Slice,pendo:Pendo,wikimedia:Wikimedia,circleci:CircleCI,careem:Careem,cockroachlabs:Cockroach Labs,planetscale:PlanetScale,'
    + 'hootsuite:Hootsuite,descript:Descript,netlify:Netlify,lattice:Lattice,kickstarter:Kickstarter'),
  ...list('lever', 'spotify:Spotify,meesho:Meesho,zeta:Zeta,cred:CRED,eternal:Eternal (Zomato),mindtickle:Mindtickle,contentsquare:Contentsquare,outreach:Outreach,neon:Neon,fi:Fi'),
  ...list('ashby', 'perplexity:Perplexity,plaid:Plaid,elevenlabs:ElevenLabs,cursor:Cursor,supabase:Supabase,modal:Modal,sentry:Sentry,linear:Linear,replit:Replit,attio:Attio,resend:Resend,zapier:Zapier,posthog:PostHog,pinecone:Pinecone,'
    + 'temporal:Temporal,vultr:Vultr,benchling:Benchling,amplitude:Amplitude,hostinger:Hostinger,clickup:ClickUp,writer:Writer,render:Render,webflow:Webflow,'
    + 'patreon:Patreon,oyster:Oyster,substack:Substack,midjourney:Midjourney,airbyte:Airbyte,character:Character.AI,miro:Miro,gorgias:Gorgias,mural:Mural,'
    + 'fullstory:FullStory,quora:Quora,atlan:Atlan,railway:Railway,helpscout:Help Scout,dovetail:Dovetail'),
];
