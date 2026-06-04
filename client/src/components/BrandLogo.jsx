export const BrandLogo = ({ admin = false, light = false }) => (
  <span className={`king-logo ${light ? 'king-logo-light' : ''}`}>
    <span className="king-logo-crown" aria-hidden="true">
      <svg viewBox="0 0 64 42" focusable="false">
        <path d="M6 35h52l-4 5H10l-4-5Z" />
        <path d="M10 33 6 12l13 9L32 3l13 18 13-9-4 21H10Z" />
        <circle cx="18" cy="29" r="2.2" />
        <circle cx="32" cy="29" r="2.2" />
        <circle cx="46" cy="29" r="2.2" />
      </svg>
    </span>
    <span className="king-logo-copy">
      <strong>KING</strong>
      <small>{admin ? 'Mops Admin' : 'Brand Mops'}</small>
    </span>
  </span>
);
