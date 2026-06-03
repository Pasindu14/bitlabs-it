import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { AboutPage } from '@/components/AboutPage'

export const metadata = {
  title: 'Founder — Pasindu Dulanjaya · Bitlabs',
  description: 'MSc & BSc IT from the University of Moratuwa. Founder of Bitlabs, full-stack developer, and former competitive badminton player.',
}

export default function About() {
  return (
    <>
      <Nav />
      <main>
        <AboutPage />
      </main>
      <Footer />
    </>
  )
}
