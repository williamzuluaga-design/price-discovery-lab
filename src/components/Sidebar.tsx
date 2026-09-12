import type { ViewId } from '../App';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

const NAV_ITEMS: { id: ViewId; label: string }[] = [
  { id: 'setup', label: '1. Market Setup' },
  { id: 'floor', label: '2. Trading Floor' },
  { id: 'news', label: '3. Breaking News' },
  { id: 'reveal', label: '4. Market Reveal' },
];

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <nav className="sidebar">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={activeView === item.id ? 'active' : ''}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
      <div className="sidebar-section">Sesión</div>
      <div style={{ padding: '0 14px', fontSize: '12px', color: 'var(--muted)' }}>
        ANDT · Andina Tech S.A.
      </div>
    </nav>
  );
}
