/**
 * Companies whose job boards are public (checked November 2026), searched straight from the
 * browser. Boards of several megabytes (OpenAI, Palantir, Paytm, SpaceX) are left out to keep a
 * search quick on a phone.
 */
export type Ats = 'greenhouse' | 'lever' | 'ashby';
export type Board = { ats: Ats; slug: string; name: string };

const list = (ats: Ats, entries: string) =>
  entries.split(',').map(e => { const [slug, name] = e.split(':'); return { ats, slug: slug.trim(), name: (name ?? slug).trim() }; });

export const BOARDS: Board[] = [
  ...list('greenhouse', 'databricks:Databricks,stripe:Stripe,anthropic:Anthropic,cloudflare:Cloudflare,elastic:Elastic,mongodb:MongoDB,datadog:Datadog,hellofresh:HelloFresh,okta:Okta,toast:Toast,samsara:Samsara,brex:Brex,coinbase:Coinbase,celonis:Celonis,gitlab:GitLab,affirm:Affirm,airbnb:Airbnb,robinhood:Robinhood,pinterest:Pinterest,lyft:Lyft,reddit:Reddit,figma:Figma,intercom:Intercom,twilio:Twilio,vercel:Vercel,instacart:Instacart,inmobi:InMobi,gusto:Gusto,chime:Chime,duolingo:Duolingo,monzo:Monzo,contentful:Contentful,dropbox:Dropbox,n26:N26,discord:Discord,wise:Wise,squarespace:Squarespace,airtable:Airtable,groww:Groww,typeform:Typeform,calendly:Calendly'),
  ...list('lever', 'spotify:Spotify,meesho:Meesho,zeta:Zeta,cred:CRED'),
  ...list('ashby', 'perplexity:Perplexity,plaid:Plaid,elevenlabs:ElevenLabs,cursor:Cursor,supabase:Supabase,modal:Modal,sentry:Sentry,linear:Linear,replit:Replit,attio:Attio,resend:Resend,zapier:Zapier,posthog:PostHog,pinecone:Pinecone'),
];
