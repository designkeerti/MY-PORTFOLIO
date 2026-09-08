import { skills } from '../components/SkillsSection';

const icons: Record<string, string> = { 'UX Design': 'ph-compass', 'UI Design': 'ph-paint-brush', 'UX Research': 'ph-flask', 'Prototyping': 'ph-device-mobile', 'Vibecoding': 'ph-lightning', 'Collaboration': 'ph-handshake' };

/** The six skills as quiet tiles. */
export const SkillTiles = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-baseline justify-between px-1">
      <h3 className="d-h">What I do</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {skills.map(s => (
        <div key={s.title} className="d-card p-4 flex flex-col gap-3">
          <i className={`ph-bold ${icons[s.title] ?? 'ph-circle'} text-[20px] text-[var(--ink)]`} aria-hidden="true" />
          <div>
            <div className="text-[14px] font-semibold text-[var(--ink)]">{s.title}</div>
            <p className="text-[12.5px] leading-snug text-[var(--ink-2)] mt-1">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
