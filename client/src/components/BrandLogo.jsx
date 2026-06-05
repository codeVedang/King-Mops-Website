export const BrandLogo = ({ admin = false, light = false }) => (
  <span className={`king-logo ${light ? 'king-logo-light' : ''}`}>
    <span className="king-logo-copy">
      <strong>KING</strong>
      <small>{admin ? 'Mops Admin' : 'Brand Mops'}</small>
    </span>
  </span>
);
