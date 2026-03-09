import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useWebHID } from './lib/hid';
import RemapPage from './pages/Remap';

function Shell({ children, hid }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header style={{
        height: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: '1px solid #1f1f1f',
        background: '#0a0a0a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', letterSpacing: '-0.2px' }}>Keydeck</span>
          <nav style={{ display: 'flex', gap: 2 }}>
            <NavLink to="/" end style={({ isActive }) => ({
              padding: '3px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500,
              color: isActive ? '#e0e0e0' : '#555',
              background: isActive ? '#1e1e1e' : 'transparent',
              textDecoration: 'none', transition: 'all .15s',
            })}>Remap</NavLink>
          </nav>
        </div>
        <button
          onClick={hid.connected ? hid.disconnect : hid.connect}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: hid.connected ? '#1a1a1a' : '#0a84ff',
            color: hid.connected ? '#666' : '#fff',
            border: hid.connected ? '1px solid #252525' : '1px solid transparent',
            cursor: 'pointer', transition: 'all .15s',
          }}>
          {hid.connected && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30d158' }} />}
          {hid.connected ? 'Connected' : 'Connect Keyboard'}
        </button>
      </header>
      <main style={{ flex: 1, overflow: 'hidden', height: 'calc(100vh - 60px)' }}>{children}</main>
    </div>
  );
}

export default function App() {
  const hid = useWebHID();
  return (
    <BrowserRouter>
      <Shell hid={hid}>
        <Routes>
          <Route path="/" element={<RemapPage hid={hid} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}