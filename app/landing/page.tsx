'use client'

import { Header } from '@/components/landing/Header'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { OnboardingSteps } from '@/components/landing/OnboardingSteps'
import { TargetAudience } from '@/components/landing/TargetAudience'
import { TestimonialBento } from '@/components/landing/TestimonialBento'
import { TrustMarquee } from '@/components/landing/TrustMarquee'
import { ComparisonMatrix } from '@/components/landing/ComparisonMatrix'
import { FooterCTA } from '@/components/landing/FooterCTA'

export default function LandingPage() {
  return (
    <div className="w-full bg-background text-foreground">
      <Header />
      <HeroSection onOpenVideo={() => {}} />
      <FeaturesGrid />
      <OnboardingSteps />
      <TargetAudience />
      <TestimonialBento />
      <TrustMarquee />
      <ComparisonMatrix />
      <FooterCTA />
    </div>
  )
}
