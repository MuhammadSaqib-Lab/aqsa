import { Hero } from "../components/sections/Hero";
import { About } from "../components/sections/About";
import { Services } from "../components/sections/Services";
import { Conditions } from "../components/sections/Conditions";
import { Equipment } from "../components/sections/Equipment";
import { FemalePhysiotherapy } from "../components/sections/FemalePhysiotherapy";
import { WhyChooseUs } from "../components/sections/WhyChooseUs";
import { Process } from "../components/sections/Process";
import { Testimonials } from "../components/sections/Testimonials";
import { PatientReviews } from "../components/sections/PatientReviews";
import { FAQSection } from "../components/sections/FAQSection";
import { AppointmentCTA } from "../components/sections/AppointmentCTA";
import { Contact } from "../components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Conditions />
      <Equipment />
      <FemalePhysiotherapy />
      <WhyChooseUs />
      <Process />
      <Testimonials />
      <PatientReviews />
      <FAQSection />
      <AppointmentCTA />
      <Contact />
    </>
  );
}
