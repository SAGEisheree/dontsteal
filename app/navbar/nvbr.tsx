export default function Nvbr() {
  return (
    <nav style={{ padding: '12px', background: '#0f172a', color: '#fff' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700 }}>dont-steal</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
          <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>Docs</a>
          <a href="#" style={{ color: '#fff', textDecoration: 'none' }}>About</a>
        </div>
      </div>
    </nav>
  );
}
