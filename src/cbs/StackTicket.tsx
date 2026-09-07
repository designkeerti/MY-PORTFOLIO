export type StackProps = { num: string; name: string; variations: string; level: string; mission: string; bestFor: string; goal: string; href?: string; className?: string; style?: React.CSSProperties };

/* The live stack tile, markup verbatim from the home page template. */
export const StackTicket = ({ num, name, variations, level, mission, bestFor, goal, href = 'https://crossbordersupps.com/product-category/stack/', className = '', style }: StackProps) => (
  <a className={`cbs-stack-tile ${className}`} href={href} target="_blank" rel="noreferrer" style={style} onClick={e => e.stopPropagation()}>
    <div className="cbs-stack-tile__hd">
      <div className="cbs-stack-tile__title">
        <div className="cbs-stack-tile__numwrap"><span className="cbs-stack-tile__num">{num}</span><span className="cbs-stack-tile__numlabel">STACK</span></div>
        <h3 className="cbs-stack-tile__stackname">{name}</h3>
      </div>
      <div className="cbs-stack-tile__meta">
        <div className="cbs-stack-tile__metaitem"><span>VARIATIONS</span><strong>{variations}</strong></div>
        <div className="cbs-stack-tile__metaitem"><span>LEVEL</span><strong>{level}</strong></div>
      </div>
    </div>
    <div className="cbs-stack-tile__inner">
      <div className="cbs-stack-tile__brand"><span>CBS · STACK PROTOCOL</span></div>
      <div className="cbs-stack-tile__data">
        <div className="cbs-stack-tile__field cbs-stack-tile__field--full"><span>MISSION</span><strong>{mission}</strong></div>
        <div className="cbs-stack-tile__field"><span>BEST FOR</span><strong>{bestFor}</strong></div>
        <div className="cbs-stack-tile__field"><span>GOAL</span><strong>{goal}</strong></div>
      </div>
    </div>
    <div className="cbs-stack-tile__barcode">
      <span className="cbs-stack-tile__barcode-label">VIEW STACK →</span>
      <div className="cbs-stack-tile__bars" aria-hidden="true" />
    </div>
  </a>
);

export const stacks: StackProps[] = [
  { num: '01', name: 'HARDCORE LIFTERS', variations: '3', level: 'PRO', mission: 'Heavy plates. Daily war.', bestFor: 'HEAVY LIFTERS', goal: 'BUILD MASS', href: 'https://crossbordersupps.com/product-category/stack/hardcore-lifters/' },
  { num: '02', name: 'ENHANCED LIFTERS', variations: '3', level: 'ELITE', mission: 'Push the ceiling.', bestFor: 'COMPETITIVE', goal: 'PUSH LIMITS', href: 'https://crossbordersupps.com/product-category/stack/enhanced-lifters-stack/' },
  { num: '03', name: 'LIFESTYLE GRINDERS', variations: '3', level: 'STANDARD', mission: 'Built for the routine.', bestFor: 'BUSY PEOPLE', goal: 'STAY READY' },
  { num: '04', name: 'SENIORS & WELLNESS', variations: '3', level: 'RESTORATIVE', mission: 'Strong. Longer.', bestFor: 'AGE 60+', goal: 'AGE WELL' },
];
