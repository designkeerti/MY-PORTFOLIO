/**
 * Skills worth matching between a resume and a posting, with the other ways people write them
 * (after the colon, comma separated; a trailing ~ means "starts with", so prototyp~ takes
 * prototype and prototyping; anything with a backslash or a bracket is a pattern as it is).
 * Used to show which of someone's skills a posting asks for and what it wants that they lack,
 * and to read a resume when the model is unavailable.
 */
const RAW = String.raw`Figma; Sketch; Adobe XD; Framer; Prototyping:prototyp~; Design systems:design system~; User research:user research,ux research;
Usability testing:usability~; Interaction design; Visual design; UI design:ui design,user interface design; UX design:ux design,user experience design;
Information architecture; Accessibility:accessibility,wcag,a11y; Motion design:motion design,animation~; Illustration; Branding:branding,brand identity;
Typography; Wireframing:wirefram~; A/B testing:a/b test~,experimentation; Design thinking; Service design; Journey mapping:journey map~;
Workshops:facilitat~,workshop~; Product strategy; Roadmapping:roadmap~; Stakeholder management:stakeholder~; Agile:agile,scrum; Product management;
Data visualisation:data visuali~; Dashboards:dashboard~; Copywriting; UX writing; Content strategy; SEO; Growth marketing:growth marketing,growth hacking;
Performance marketing; Email marketing; Social media; Go-to-market:go-to-market,gtm; Salesforce; HubSpot; Account management; Customer success;
Recruiting:recruiting,talent acquisition; Project management; Financial modelling:financial model~; JavaScript; TypeScript;
React:react(?![a-z0-9]|\s*native); React Native; Next.js:next\.?js(?![a-z0-9]); Vue; Angular; Svelte; HTML; CSS; Tailwind; Node.js:node\.?js(?![a-z0-9]);
Python; Java:java(?![a-z0-9]|script); Kotlin; Swift:swift(?![a-z0-9]|ui); SwiftUI; iOS; Android; Flutter; Golang; Rust; Ruby on Rails:rails; PHP;
C++:c\+\+; C#:c#; .NET:\.net(?![a-z0-9]); Scala; SQL; PostgreSQL:postgres~; MySQL; MongoDB; Redis; Kafka; GraphQL; REST APIs:rest api~,restful;
Microservices:microservice~; AWS; Google Cloud:gcp,google cloud; Azure; Docker; Kubernetes:kubernetes,k8s; Terraform; CI/CD:ci/cd,continuous integration;
Linux; Machine learning; Deep learning; PyTorch; TensorFlow; LLMs:llm~,large language model~; NLP:nlp,natural language processing; Computer vision;
Statistics:statistic~; Data analysis:data analy~; Tableau; Power BI; Excel; Pandas; Spark; Airflow; dbt; Snowflake; ETL; QA:qa,quality assurance;
Test automation:test automation,automated test~; Playwright; Cypress; Jest; Unity; Blender; 3D:3d; After Effects; Photoshop; Illustrator; Webflow; Jira;
Mixpanel; Amplitude; Google Analytics; Mentoring:mentor~; People management:people management,manag[a-z]* (?:a )?team`;

export type Skill = { name: string; re: RegExp };
const esc = (s: string) => s.replace(/[.*+?^${}()[\]\\/|]/g, '\\$&');
const form = (f: string) => /[\\([]/.test(f) ? f : f.endsWith('~') ? esc(f.slice(0, -1)) : `${esc(f)}(?![a-z0-9])`;

export const SKILLS: Skill[] = RAW.split(';').map(e => e.trim()).filter(Boolean).map(entry => {
  const i = entry.indexOf(':');
  const name = i < 0 ? entry : entry.slice(0, i);
  const body = (i < 0 ? [name.toLowerCase()] : entry.slice(i + 1).split(',')).map(form).join('|');
  return { name, re: new RegExp(`(?:^|[^a-z0-9+#.])(?:${body})`, 'i') };
});

export const skillsIn = (text: string) => SKILLS.filter(s => s.re.test(text)).map(s => s.name);
