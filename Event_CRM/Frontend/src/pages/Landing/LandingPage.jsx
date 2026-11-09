import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Marquee from "../../components/landing/Marquee";
import Features from "../../components/landing/Features";
import Stats from "../../components/landing/Stats";
import Roles from "../../components/landing/Roles";
import Footer from "../../components/landing/Footer";

const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <Hero />
      <Marquee />
      <Features />
      <Stats />
      <Roles />
    </main>
    {/* <Footer /> */}
  </div>
);

export default LandingPage;
