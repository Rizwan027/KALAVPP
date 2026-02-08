import Hero from '@/components/home/Hero';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FeaturedServices from '@/components/home/FeaturedServices';
import Categories from '@/components/home/Categories';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <FeaturedServices />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </>
  );
}
