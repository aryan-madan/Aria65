import { useState, useRef } from 'react';
import { ROWS, KEYCODES, KC_MAP, U } from '../lib/layout';

const GAP = 3;
const TOTAL_W = 16 * U + 15 * GAP;
const MODS = new Set(['Tab','Ctrl','Shift','Bspc','Enter','Fn','Cmd','Space','Esc','PgUp','PgDn','Ins']);

function Key({ k, selected, remapped, onClick }) {
  const w = k.w * U + (k.w - 1) * GAP;
  const isMod = MODS.has(k.main);
  const label = remapped ?? k.main;
  const hasAlt = k.alt && !remapped && !isMod;

  return (
    <button onClick={onClick} style={{
      position: 'absolute',
      left: k.x * U + k.x * GAP,
      width: w, height: U,
      display: 'flex', flexDirection: 'column',
      alignItems: hasAlt ? 'flex-start' : 'center',
      justifyContent: hasAlt ? 'space-between' : 'center',
      padding: hasAlt ? '5px 6px 4px' : 0,
      background: selected ? '#0a84ff' : '#1c1c1c',
      border: `1px solid ${selected ? 'rgba(255,255,255,0.18)' : '#282828'}`,
      borderBottom: `2px solid ${selected ? '#0060cc' : '#111'}`,
      borderRadius: 7,
      color: selected ? '#fff' : isMod ? '#444' : '#c8c8c8',
      boxShadow: selected ? '0 0 0 2px rgba(10,132,255,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      cursor: 'pointer', userSelect: 'none',
      transition: 'background .08s, transform .06s',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#242424'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#1c1c1c'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'none'; }}
    >
      {hasAlt && <span style={{ fontSize: 10, color: selected ? 'rgba(255,255,255,0.35)' : '#333', lineHeight: 1 }}>{k.alt}</span>}
      <span style={{ fontSize: label.length > 4 ? 11 : label.length > 2 ? 13 : 14, fontWeight: 500, lineHeight: 1 }}>{label}</span>
    </button>
  );
}

function Keyboard({ sel, onKey, keymaps, layer }) {
  return (
    <div style={{ width: TOTAL_W, userSelect: 'none' }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ position: 'relative', height: U, marginBottom: ri < ROWS.length - 1 ? GAP : 0 }}>
          {row.map((k, ki) => (
            <Key
              key={ki} k={k}
              selected={sel?.r === k.r && sel?.c === k.c}
              remapped={keymaps?.[layer]?.[k.r]?.[k.c]}
              onClick={() => onKey(k)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Remap({ hid }) {
  const [sel, setSel]         = useState(null);
  const [layer, setLayer]     = useState(0);
  const [keymaps, setKeymaps] = useState({});
  const [cat, setCat]         = useState('Letters');
  const [flash, setFlash]       = useState('');
  const [flashOut, setFlashOut] = useState(false);
  const t1 = useRef(null), t2 = useRef(null);

  const remap = async (label) => {
    if (!sel) return;
    if (hid.connected) await hid.remapKey(layer, sel.r, sel.c, KC_MAP[label.toUpperCase()] ?? 0);
    setKeymaps(p => ({
      ...p,
      [layer]: { ...(p[layer] ?? {}), [sel.r]: { ...(p[layer]?.[sel.r] ?? {}), [sel.c]: label } }
    }));
    clearTimeout(t1.current); clearTimeout(t2.current);
    setFlash(`${sel.main} → ${label}`);
    setFlashOut(false);
    t1.current = setTimeout(() => setFlashOut(true), 1600);
    t2.current = setTimeout(() => { setFlash(''); setFlashOut(false); }, 2000);
    setSel(null);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[['Base', 0], ['Fn', 1]].map(([lbl, l]) => (
                <button key={l} onClick={() => setLayer(l)} style={{
                  padding: '6px 20px', borderRadius: 7, fontSize: 14, fontWeight: 500,
                  background: layer === l ? '#1e1e1e' : 'transparent',
                  color: layer === l ? '#ccc' : '#383838',
                  border: '1px solid ' + (layer === l ? '#2a2a2a' : 'transparent'),
                  cursor: 'pointer', transition: 'all .15s',
                }}>{lbl}</button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-20px',
                background: 'radial-gradient(ellipse at 50% 60%, rgba(10,132,255,0.12) 0%, transparent 70%)',
                borderRadius: 40,
                animation: 'pulse 3s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.6; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.03); }
                }
              `}</style>
              <div style={{ background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: 14, padding: '20px 22px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', position: 'relative' }}>
                <img src="/logo.svg" alt="logo" style={{
                  position: 'absolute',
                  top: 20 + (U - 18) / 2,
                  right: 22 + (U - 18) / 2,
                  width: 18,
                  height: 18,
                  objectFit: 'contain',
                  opacity: 0.35,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }} />
                <Keyboard
                  sel={sel}
                  onKey={k => setSel(p => p?.r === k.r && p?.c === k.c ? null : k)}
                  keymaps={keymaps}
                  layer={layer}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 32px 24px' }}>
          <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
            {sel
              ? <><span style={{ color: '#666' }}>Remapping </span><span style={{ color: '#bbb', fontWeight: 500 }}>{sel.main}</span><span style={{ color: '#666' }}> — pick a keycode from the panel</span></>
              : 'Click a key on the keyboard to start remapping'}
          </p>
        </div>

        <style>{`
          @keyframes toast-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes toast-out {
            from { opacity: 1; transform: translateY(0); }
            to   { opacity: 0; transform: translateY(8px); }
          }
        `}</style>
        {flash && (
          <div style={{
            position: 'fixed', bottom: 32,
            left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 100,
          }}>
            <div style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              borderRadius: 10, padding: '10px 18px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              animation: `${flashOut ? 'toast-out' : 'toast-in'} 0.25s ease forwards`,
            }}>
              <span style={{ fontSize: 13, color: '#30d158' }}>✓</span>
              <span style={{ fontSize: 13, color: '#bbb', fontWeight: 500 }}>{flash}</span>
            </div>
          </div>
        )}

      </div>

      <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid #181818', background: '#0c0c0c', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 10px 6px' }}>
          {Object.keys(KEYCODES).map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              width: '100%', padding: '7px 10px', borderRadius: 6,
              fontSize: 13, textAlign: 'left', display: 'block',
              fontWeight: cat === c ? 500 : 400,
              background: cat === c ? '#181818' : 'transparent',
              color: cat === c ? '#ccc' : '#3a3a3a',
              border: '1px solid ' + (cat === c ? '#242424' : 'transparent'),
              cursor: 'pointer', transition: 'all .12s',
            }}>{c}</button>
          ))}
        </div>
        <div style={{ height: 1, background: '#181818', margin: '9px 0' }} />
        <div style={{ flex: 1, padding: '0 7px 10px', display: 'flex', flexWrap: 'wrap', gap: 4, alignContent: 'flex-start', overflowY: 'auto' }}>
          {KEYCODES[cat].map(k => (
            <button key={k} onClick={() => sel && remap(k)} style={{
              padding: '6px 8px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              background: '#141414', border: '1px solid #202020',
              color: sel ? '#aaa' : '#2e2e2e',
              cursor: sel ? 'pointer' : 'not-allowed',
              minWidth: 34, textAlign: 'center', opacity: sel ? 1 : 0.4,
              transition: 'all .1s',
            }}
              onMouseEnter={e => { if (sel) { e.currentTarget.style.background = '#1c1c1c'; e.currentTarget.style.color = '#ccc'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.color = sel ? '#aaa' : '#2e2e2e'; }}
            >{k}</button>
          ))}
        </div>
        {!sel && (
          <div style={{ padding: '10px 12px', borderTop: '1px solid #181818' }}>
          <p style={{ fontSize: 12, color: '#2e2e2e', lineHeight: 1.6, margin: 0 }}>Select a key on the keyboard first.</p>
          </div>
        )}
      </div>
    </div>
  );
}