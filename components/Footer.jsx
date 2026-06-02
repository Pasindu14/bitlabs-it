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
              <a className="contact-pill" href="https://wa.me/94000000000">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-5.6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7 0 .2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.3-.2z"/>
                </svg>
                WhatsApp
              </a>
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
