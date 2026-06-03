export function Footer() {
  return (
    <footer className="footer" id="footer-contact">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#top" style={{ color: 'var(--on-dark)' }}>
              <span className="brand-mark"><span /></span>{' '}
              <span className="brand-word">Bit<b>labs</b></span>
            </a>
            <p>Crafting innovative software solutions for businesses in Sri Lanka and beyond.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
              <a className="contact-pill" href="mailto:bitlabs.solutions@gmail.com">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>
                </svg>
                bitlabs.solutions@gmail.com
              </a>
              <a className="contact-pill" href="https://www.facebook.com/BitlabsLtd/" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
            </div>

          </div>
          <div>
            <h4>Services</h4>
            <div className="footer-links">
              <a href="#services">Mobile Apps</a>
              <a href="#services">Web Platforms</a>
              <a href="#services">AI Solutions</a>
              <a href="#services">Custom Software</a>
              <a href="#services">UI / UX Design</a>
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <div className="footer-links">
              <a href="#why">Why Bitlabs</a>
              <a href="#process">Process</a>
              <a href="#projects">Projects</a>
              <a href="#testimonials">Work</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div>
            <h4>Studio</h4>
            <div className="footer-links">
              <a href="mailto:bitlabs.solutions@gmail.com">bitlabs.solutions@gmail.com</a>
              <a href="https://wa.me/94000000000">WhatsApp chat</a>
              <a href="https://www.facebook.com/BitlabsLtd/" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bitlabs. All rights reserved.</span>
          <span>Designed &amp; built in Sri Lanka 🇱🇰</span>
        </div>
      </div>
    </footer>
  )
}
