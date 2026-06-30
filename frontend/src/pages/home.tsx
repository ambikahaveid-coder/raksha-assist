import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Plans } from "@/components/sections/Plans";
import { Trust } from "@/components/sections/Trust";
import { TrustBadges } from "@/components/sections/TrustBadges";
import { WhyRakshaAssist } from "@/components/sections/WhyRakshaAssist";
import { FAQ } from "@/components/sections/FAQ";
export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <Hero />
        <TrustBadges />
        <WhyRakshaAssist />
        <HowItWorks />
        <Trust />
        <Plans />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}