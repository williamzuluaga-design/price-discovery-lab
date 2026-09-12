interface HeaderProps {
  statusText: string;
  statusClass: string;
  clock: string;
}

export default function Header({ statusText, statusClass, clock }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        PRICE DISCOVERY LAB
        <span className="badge">V1 · local</span>
      </div>
      <div className="header-right">
        <span className={`pill ${statusClass}`}>{statusText}</span>
        <span className="clock">{clock}</span>
      </div>
    </header>
  );
}
