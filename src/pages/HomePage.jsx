import Navbar from '../components/Navbar'
import HeroBanner from '../components/HeroBanner'
import PromotionsSection from '../components/PromotionsSection'
import RewardsBanner from '../components/RewardsBanner'
import MenuPreview from '../components/MenuPreview'
import Footer from '../components/Footer'
import ReorderCard from '../components/ReorderCard'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />
        <ReorderCard />
        <PromotionsSection />
        <MenuPreview />
        <RewardsBanner />
      </main>
      <Footer />
    </div>
  )
}
