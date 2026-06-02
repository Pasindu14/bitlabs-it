import { ScrollProgress } from '@/components/ScrollProgress'
import { ScrollCurveArrow } from '@/components/ScrollCurveArrow'
import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Marquee } from '@/components/Marquee'
import { Trust } from '@/components/Trust'
import { Services } from '@/components/Services'
import { HowWeWork } from '@/components/HowWeWork'
import { WhyBitlabs } from '@/components/WhyBitlabs'
import { OurProjects } from '@/components/OurProjects'
import { Testimonials } from '@/components/Testimonials'
import { FinalCTA } from '@/components/FinalCTA'
import { Footer } from '@/components/Footer'
import { MotionInit } from '@/components/MotionInit'
import { TweaksApp } from '@/components/TweaksApp'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <ScrollCurveArrow />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Trust />
        <Services />
        <HowWeWork />
        <WhyBitlabs />
        <OurProjects />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
      <MotionInit />
      <TweaksApp />
    </>
  )
}
