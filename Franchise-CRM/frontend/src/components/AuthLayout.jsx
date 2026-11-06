export default function AuthLayout({ art, header, top, children }) {
  return (
    <main className="auth-page">
      <span className="bg-circle circle-one" aria-hidden="true" />
      <span className="bg-circle circle-two" aria-hidden="true" />
      <span className="bg-circle circle-three" aria-hidden="true" />

      <section className="auth-card">
        {/* LEFT: brand + rocket */}
        <aside className="auth-art">
          <div className="brand">
            <div className="brand-logo" aria-hidden="true">F</div>
            <div className="brand-text">
              <span>FRANCHISE</span>
              <strong>CRM</strong>
            </div>
          </div>

          <div className="art-content">
            <span className="art-tag">{art.tag}</span>
            <h1>
              {art.headline}
              <span>{art.highlight}</span>
            </h1>
            <p>{art.description}</p>

            <div className="art-visual" aria-hidden="true">
              <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="150" r="34" fill="rgba(252, 250, 246, 0.08)" />
                <circle cx="30" cy="176" r="16" fill="rgba(252, 250, 246, 0.12)" />
                <circle cx="214" cy="36" r="6" fill="#b89065" />
                <circle cx="198" cy="92" r="4" fill="#b89065" />

                <g transform="rotate(35 120 100)">
                  <path
                    d="M120 28 C142 48 152 80 152 120 L88 120 C88 80 98 48 120 28 Z"
                    fill="#fcfaf6"
                  />
                  <path d="M88 104 L66 132 L88 124 Z" fill="#b89065" />
                  <path d="M152 104 L174 132 L152 124 Z" fill="#b89065" />
                  <circle cx="120" cy="84" r="12" fill="#8c6239" />
                  <circle cx="120" cy="84" r="6" fill="#b89065" />
                  <path d="M104 120 Q120 184 136 120 Z" fill="#e7cfb0" />
                </g>
              </svg>
            </div>
          </div>

          <p className="art-footer">
            © {new Date().getFullYear()} Franchise CRM. All rights reserved.
          </p>
        </aside>

        <svg
          className="cloud-edge"
          viewBox="0 0 180 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M180 0 H100 A50 50 0 0 0 100 100 A70 70 0 0 0 100 240 A80 80 0 0 0 100 400 A80 80 0 0 0 100 560 A70 70 0 0 0 100 700 A50 50 0 0 0 100 800 H180 Z"
            fill="#fcfaf6"
          />
        </svg>

        <div className="auth-form">
          {top}

          <header className="form-header">
            <span className="form-eyebrow">{header.eyebrow}</span>
            <h2 className="form-title">
              {header.title}
              <span>{header.accent}</span>
            </h2>
            <p className="form-desc">{header.description}</p>
          </header>

          {children}

          <footer className="form-footer">
            <div className="footer-line" />
            <p>Secure access for authorized franchise members.</p>
          </footer>
        </div>
      </section>
    </main>
  );
}