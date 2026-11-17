import { useEffect, useMemo, useState } from 'react';
import { useCopy, useToast } from '../ui';
import type { Resolved, State } from './model';
import type { Edit } from './choices';
import { dtcgFiles, dtcgReadme, figmaPlugin, slug, toCss, toTailwind, tokenList, type ValueStyle } from './export';
import { download, zip } from './zip';
import { Seg } from './controls';

type Tab = 'figma' | 'css' | 'tailwind' | 'json';

export function ExportPanel({ res, st, edit, onClose }: { res: Resolved; st: State; edit: Edit; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('figma');
  const [style, setStyle] = useState<ValueStyle>('objects');
  const [prefix, setPrefix] = useState('');
  const [file, setFile] = useState('color.light.json');
  const copy = useCopy();
  const toast = useToast();
  const name = slug(res.name);
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on);
  }, [onClose]);

  const css = useMemo(() => toCss(res, prefix), [res, prefix]);
  const tw = useMemo(() => toTailwind(res), [res]);
  const files = useMemo(() => dtcgFiles(res, style, prefix), [res, style, prefix]);
  const shown = files.find(f => f.name === file) ?? files[0];

  const getPlugin = () => { download(zip(figmaPlugin(res, prefix).map(f => ({ ...f, name: `${name}-figma-plugin/${f.name}` }))), `${name}-figma-plugin.zip`); toast('Plugin downloaded'); };
  const getJson = () => { download(zip([...files, { name: 'README.md', data: dtcgReadme(res) }].map(f => ({ ...f, name: `${name}-tokens/${f.name}` }))), `${name}-tokens.zip`); toast('Tokens downloaded'); };
  const getText = (text: string, file: string, type = 'text/css') => { download(new Blob([text], { type }), file); toast(`${file} downloaded`); };

  const counts = useMemo(() => {
    const t = tokenList(res);
    return { primitives: t.filter(x => x.coll === 'primitives').length, semantic: t.filter(x => x.coll === 'color').length };
  }, [res]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0d0f14]/40 p-0 backdrop-blur-sm md:items-center md:p-6" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal aria-label="Export" onClick={e => e.stopPropagation()}
        className="tk-fade flex max-h-[92svh] w-full max-w-[920px] flex-col overflow-hidden rounded-t-[26px] bg-[#f7f6f2] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] md:rounded-[26px]">
        <header className="flex items-center justify-between gap-3 border-b border-ink/[0.08] px-5 py-4">
          <div className="min-w-0">
            <label className="flex items-center gap-2">
              <span className="text-[20px] font-semibold tracking-[-0.01em] text-ink">Export</span>
              <input value={st.name} maxLength={24} aria-label="System name" spellCheck={false}
                onChange={e => { const v = e.target.value; edit(x => ({ ...x, name: v }), 'name'); }}
                className="min-w-0 max-w-[220px] rounded-[10px] border border-ink/12 bg-white px-2 py-0.5 text-[20px] font-semibold tracking-[-0.01em] text-ink outline-none focus:border-ink/40" />
            </label>
            <p className="text-[13px] text-ink/55">{counts.primitives} primitives, {counts.semantic} semantic colours in two modes, {res.type.styles.length} text styles, spacing, radius, shadows and grids.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink shadow-sm hover:bg-ink/5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/[0.08] px-5 py-3">
          <div className="w-full max-w-[420px]"><Seg label="Format" value={tab} onChange={setTab} options={[{ value: 'figma', label: 'Figma' }, { value: 'css', label: 'CSS' }, { value: 'tailwind', label: 'Tailwind' }, { value: 'json', label: 'JSON' }]} /></div>
          <label className="ml-auto flex items-center gap-2 text-[13px] text-ink/60">
            CSS prefix
            <input value={prefix} onChange={e => setPrefix(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))} placeholder="none" maxLength={16} aria-label="CSS variable prefix"
              className="w-[96px] rounded-[10px] border border-ink/12 bg-white px-2 py-1 font-mono text-[13px] text-ink outline-none" />
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          {tab === 'figma' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-[20px] bg-white p-5">
                <span className="self-start rounded-full bg-[#dcf5e4] px-2 py-0.5 text-[11.5px] font-semibold text-[#11652f]">Builds everything</span>
                <h3 className="text-[17px] font-semibold text-ink">Figma plugin</h3>
                <p className="text-[13.5px] leading-relaxed text-ink/65">A tiny plugin with your system inside. Run it in any file and it makes:</p>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px] leading-snug text-ink/70">
                  <li>Variable collections: Primitives, Color with Light and Dark modes, Size, Typography with Desktop and Mobile modes, Layout</li>
                  <li>{res.type.styles.length} text styles, bound to the Typography variables</li>
                  <li>Effect styles for each elevation, light and dark</li>
                  <li>Grid styles for mobile, tablet and desktop</li>
                  <li>A Tokens page that shows it all</li>
                </ul>
                <p className="text-[12.5px] leading-snug text-ink/55">Run it again after changes and it updates in place, so anything already using the variables keeps working.</p>
                <button type="button" onClick={getPlugin} className="mt-1 self-start rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white hover:-translate-y-0.5">Download plugin</button>
                <ol className="mt-1 flex list-decimal flex-col gap-1 pl-5 text-[12.5px] leading-snug text-ink/60">
                  <li>Unzip it.</li>
                  <li>In the Figma desktop app: Plugins › Development › Import plugin from manifest, then pick manifest.json.</li>
                  <li>Run “{res.name} tokens” from Plugins › Development.</li>
                </ol>
              </div>
              <div className="flex flex-col gap-3 rounded-[20px] bg-white p-5">
                <span className="self-start rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11.5px] font-semibold text-ink/60">Variables only</span>
                <h3 className="text-[17px] font-semibold text-ink">Variables as JSON</h3>
                <p className="text-[13.5px] leading-relaxed text-ink/65">The standard design tokens format (DTCG), one file per collection and mode. Import it with Figma’s variable import, Tokens Studio, or Style Dictionary.</p>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] text-ink/60">Values</span>
                  <Seg label="Value format" value={style} onChange={setStyle} options={[{ value: 'objects', label: 'DTCG 2025' }, { value: 'strings', label: 'Plain strings' }]} />
                  <span className="text-[12px] leading-snug text-ink/50">{style === 'objects' ? 'Colours as { colorSpace, components, hex } and sizes as { value, unit }, as the stable spec has them.' : 'Colours as “#2f6bed” and sizes as “16px”, for older tools.'}</span>
                </div>
                <button type="button" onClick={getJson} className="mt-1 self-start rounded-full border border-ink/15 bg-white px-4 py-2.5 text-[14px] font-medium text-ink hover:border-ink/40">Download {files.length} files</button>
                <p className="text-[12px] leading-snug text-ink/50">Import primitives first: the other files point into it. Text styles and shadows aren’t variables in Figma, so the plugin is the way to get those.</p>
              </div>
            </div>
          )}
          {tab === 'css' && <Code text={css} onCopy={() => copy(css, 'CSS')} onDownload={() => getText(css, `${name}-tokens.css`)} note="Custom properties for every token, mobile first. Dark mode follows the system, or set data-theme on any element. Includes a .text-* class per style." />}
          {tab === 'tailwind' && <Code text={tw} onCopy={() => copy(tw, 'Tailwind theme')} onDownload={() => getText(tw, `${name}-tailwind.css`)} note={'For Tailwind CSS v4: put it in your main CSS file. Semantic colours switch with data-theme="dark"; text sizes switch at your tablet breakpoint.'} />}
          {tab === 'json' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {files.map(f => (
                  <button key={f.name} type="button" onClick={() => setFile(f.name)} aria-pressed={shown.name === f.name}
                    className={`rounded-full border px-2.5 py-1 font-mono text-[12px] ${shown.name === f.name ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/70'}`}>{f.name}</button>
                ))}
              </div>
              <Code text={shown.data} onCopy={() => copy(shown.data, shown.name)} onDownload={getJson} downloadLabel="Download all" note="DTCG format. Aliases like {color.neutral.900} point across files." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Code({ text, onCopy, onDownload, note, downloadLabel = 'Download' }: { text: string; onCopy: () => void; onDownload: () => void; note: string; downloadLabel?: string }) {
  const lines = text.split('\n').length;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto max-w-[60ch] text-[13px] leading-snug text-ink/60">{note}</p>
        <button type="button" onClick={onCopy} className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-white">Copy</button>
        <button type="button" onClick={onDownload} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[13.5px] font-medium text-ink">{downloadLabel}</button>
      </div>
      <pre className="max-h-[52svh] overflow-auto rounded-[16px] bg-[#17191e] p-4 font-mono text-[12px] leading-relaxed text-[#f1ece4]">{text}</pre>
      <p className="text-[12px] text-ink/45">{lines} lines</p>
    </div>
  );
}
