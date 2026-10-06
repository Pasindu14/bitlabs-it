import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy for Social Auto Publisher · Bitlabs',
  description: 'Privacy policy for Social Auto Publisher, a private tool used by one person to publish his own videos to his own social media accounts.',
  robots: { index: true, follow: true },
}

const sectionTitle = { fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 500, letterSpacing: '-0.02em', marginTop: 44, marginBottom: 12 }
const para = { fontSize: 17, lineHeight: 1.7, color: 'var(--ink-60)', marginBottom: 14 }

export default function SocialAutoPublisherPrivacy() {
  return (
    <>
      <Nav />
      <main>
        <section className="section-pad" style={{ paddingTop: 'clamp(130px, 14vw, 190px)' }}>
          <div className="wrap" style={{ maxWidth: 820 }}>
            <span className="eyebrow">Legal</span>
            <h1 className="h2" style={{ marginTop: 22, marginBottom: 14 }}>
              Privacy Policy for Social Auto Publisher
            </h1>
            <p style={{ ...para, color: 'var(--ink-40)', marginBottom: 36 }}>Last updated: October 6, 2026</p>

            <p style={para}>
              Social Auto Publisher is a private tool built and used by one person, Pasindu Dulanjaya
              Panditharathna, to publish his own videos to social media accounts he owns, including the
              Facebook page One Tired Potato. It is not offered to the public and nobody else can sign in to it.
            </p>

            <h2 style={sectionTitle}>Information we collect</h2>
            <p style={para}>
              The app does not collect, store or process personal information from any member of the public.
              It has no sign-up, no user accounts and no tracking.
            </p>

            <h2 style={sectionTitle}>Information the app uses</h2>
            <p style={para}>
              To publish posts, the app stores access tokens for the owner&apos;s own social media accounts.
              These are kept encrypted on the owner&apos;s own computer and are never shared with or sold to anyone.
            </p>
            <p style={para}>
              Through the Meta platform, the app uses these permissions only to publish the owner&apos;s content to
              his own Facebook page and linked Instagram account, and to read basic information about those posts
              such as their status and view counts.
            </p>

            <h2 style={sectionTitle}>Sharing</h2>
            <p style={para}>
              No data is shared with third parties. Content is sent only to the platforms it is being published on
              (Meta, YouTube, X), under their own privacy policies.
            </p>

            <h2 style={sectionTitle}>Data deletion</h2>
            <p style={para}>
              Since the app holds no data about other people, there is nothing to delete on request. The owner can
              remove the app&apos;s access at any time from his Facebook settings under Business Integrations, which
              invalidates the stored tokens.
            </p>

            <h2 style={sectionTitle}>Contact</h2>
            <p style={para}>
              Questions about this policy:{' '}
              <a href="mailto:pasindu14@gmail.com" style={{ color: 'var(--orange)' }}>pasindu14@gmail.com</a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
