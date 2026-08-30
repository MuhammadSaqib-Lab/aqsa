import {
  Activity,
  Bone,
  Brain,
  Dumbbell,
  HeartPulse,
  PersonStanding,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import {
  Footprints,
  Hand,
  Shield,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";
import { UserCheck, Users, Smile, MessageCircle } from "lucide-react";
import type {
  Condition,
  Feature,
  FAQItem,
  NavLink,
  ProcessStepData,
  Service,
  TeamMember,
  Testimonial,
} from "../types";

/**
 * Centralized, editable clinic data.
 * Update this file to change clinic details across the entire site.
 *
 * Verified facts (name, address landmark, phone numbers, email, doctor
 * qualifications) come from the clinic's own printed marketing material.
 * Fields explicitly marked "placeholder" below have no confirmed source yet
 * and should be replaced with real information before going live.
 */
export const clinic = {
  name: "Aqsa Physiotherapy Centre",
  shortName: "Aqsa Physiotherapy",
  tagline: "Move Better. Feel Stronger. Live Without Limits.",
  city: "Haripur",
  region: "Khyber Pakhtunkhwa, Pakistan",
  address: "Tarbela Road, near District Council, Haripur, KPK, Pakistan",
  phonePrimary: "0314-2247280",
  phonePrimaryHref: "tel:+923142247280",
  phoneSecondary: "0345-5131814",
  phoneSecondaryHref: "tel:+923455131814",
  whatsapp: "0314-2247280",
  whatsappHref: "https://wa.me/923142247280",
  email: "Muhammadamjad2812@gmail.com",
  emailHref: "mailto:Muhammadamjad2812@gmail.com",
  // Placeholder — confirm and replace with exact daily hours.
  hours: [
    { day: "Monday – Saturday", time: "9:00 AM – 8:00 PM" },
    { day: "Sunday", time: "By appointment" },
  ],
  hoursNote: "Hours may vary on public holidays — please call ahead to confirm.",
  mapEmbedSrc:
    "https://www.google.com/maps?q=Tarbela+Road,+Haripur,+Pakistan&output=embed",
  social: {
    // Placeholder — replace with the clinic's live Facebook page URL.
    facebook: "#",
    instagram: "#",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Conditions", href: "#conditions" },
  { label: "Why Choose Us", href: "#why-choose-us" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export const services: Service[] = [
  {
    slug: "pain-management",
    icon: Activity,
    title: "Pain Management",
    description: "Treatment support for common musculoskeletal pain.",
    details: [
      "Assessment of pain source and movement limitations",
      "Manual therapy and modality-based pain relief techniques",
      "Home-care guidance to support day-to-day comfort",
    ],
  },
  {
    slug: "sports-injury-rehabilitation",
    icon: Dumbbell,
    title: "Sports Injury Rehabilitation",
    description:
      "Structured rehabilitation to support recovery and safe return to activity.",
    details: [
      "Injury-specific recovery plans for common sports injuries",
      "Progressive strength and mobility rebuilding",
      "Guidance on a safe, gradual return to sport",
    ],
  },
  {
    slug: "back-neck-pain",
    icon: Bone,
    title: "Back & Neck Pain",
    description:
      "Physiotherapy approaches for improving mobility and managing discomfort.",
    details: [
      "Postural and movement assessment",
      "Targeted mobility and strengthening exercises",
      "Ergonomic advice for daily activities",
    ],
  },
  {
    slug: "post-surgical-rehabilitation",
    icon: ShieldCheck,
    title: "Post-Surgical Rehabilitation",
    description: "Guided rehabilitation following appropriate surgical procedures.",
    details: [
      "Coordinated recovery plans aligned with surgical guidance",
      "Gradual restoration of strength and range of motion",
      "Progress monitoring at each stage of recovery",
    ],
  },
  {
    slug: "joint-rehabilitation",
    icon: PersonStanding,
    title: "Joint Rehabilitation",
    description: "Support for improving strength, mobility, and function.",
    details: [
      "Joint mobility and stability exercises",
      "Techniques to help manage stiffness and discomfort",
      "Functional training for everyday movement",
    ],
  },
  {
    slug: "exercise-therapy",
    icon: HeartPulse,
    title: "Exercise Therapy",
    description: "Personalized therapeutic exercises based on individual needs.",
    details: [
      "Individually tailored exercise programs",
      "Focus on strength, balance, and flexibility",
      "Guidance for safe progression over time",
    ],
  },
  {
    slug: "posture-mobility",
    icon: Wind,
    title: "Posture & Mobility",
    description:
      "Guidance to improve movement patterns, flexibility, and posture.",
    details: [
      "Postural assessment and correction strategies",
      "Flexibility and mobility-focused routines",
      "Practical tips for sustaining better posture",
    ],
  },
  {
    slug: "neurological-rehabilitation",
    icon: Brain,
    title: "Neurological Rehabilitation",
    description:
      "Rehabilitation support focused on mobility and functional movement, including support for stroke recovery and paediatric conditions.",
    details: [
      "Movement-focused rehabilitation for neurological conditions",
      "Functional training to support daily independence",
      "Family guidance for continued home support",
    ],
  },
];

export const conditions: Condition[] = [
  { icon: Bone, name: "Back Pain" },
  { icon: PersonStanding, name: "Neck Pain" },
  { icon: Hand, name: "Shoulder Pain" },
  { icon: Footprints, name: "Knee Pain" },
  { icon: Dumbbell, name: "Sports Injuries" },
  { icon: Activity, name: "Joint Stiffness & Arthritis" },
  { icon: Zap, name: "Muscle Strain" },
  { icon: ShieldCheck, name: "Post-Surgical Recovery" },
  { icon: Wind, name: "Mobility Problems" },
  { icon: Sparkles, name: "Posture-Related Issues" },
  { icon: Brain, name: "Stroke Recovery" },
  { icon: Shield, name: "Paediatric Conditions" },
];

export const features: Feature[] = [
  {
    icon: UserCheck,
    title: "Personalized Treatment",
    description: "Treatment plans designed around individual needs and goals.",
  },
  {
    icon: Smile,
    title: "Patient-Centered Care",
    description: "Focus on comfort, communication, and individual progress.",
  },
  {
    icon: Stethoscope,
    title: "Professional Approach",
    description: "Structured physiotherapy and rehabilitation strategies.",
  },
  {
    icon: Activity,
    title: "Functional Recovery",
    description: "Focus on helping patients return to everyday activities.",
  },
  {
    icon: Users,
    title: "Supportive Environment",
    description:
      "A welcoming environment designed to make rehabilitation comfortable.",
  },
  {
    icon: MessageCircle,
    title: "Ongoing Guidance",
    description: "Clear exercise and recovery guidance when appropriate.",
  },
];

export const processSteps: ProcessStepData[] = [
  {
    number: "01",
    title: "Initial Assessment",
    description: "Understand the patient's concerns, movement, and goals.",
  },
  {
    number: "02",
    title: "Personalized Plan",
    description: "Develop an appropriate treatment and rehabilitation approach.",
  },
  {
    number: "03",
    title: "Guided Treatment",
    description: "Provide physiotherapy and exercise-based support.",
  },
  {
    number: "04",
    title: "Progress & Recovery",
    description: "Monitor progress and adjust the plan when appropriate.",
  },
];

/**
 * Placeholder testimonials — for demonstration of layout only.
 * Replace with real, consented patient reviews before launch.
 */
export const testimonials: Testimonial[] = [
  {
    name: "Imran S.",
    initials: "IS",
    category: "Back Pain",
    quote:
      "The team took time to understand my daily routine before building my treatment plan. I felt genuinely listened to at every visit.",
  },
  {
    name: "Ayesha K.",
    initials: "AK",
    category: "Post-Surgical Rehabilitation",
    quote:
      "My recovery after surgery felt structured and clear. Each session built on the last, and I always knew what to expect next.",
  },
  {
    name: "Bilal R.",
    initials: "BR",
    category: "Sports Injury",
    quote:
      "Coming back from a knee injury was daunting, but the guided exercises made the process feel manageable and safe.",
  },
  {
    name: "Sana M.",
    initials: "SM",
    category: "Neck & Shoulder Pain",
    quote:
      "The clinic environment was calm and comfortable, which made a real difference during a stressful time.",
  },
  {
    name: "Waqas A.",
    initials: "WA",
    category: "Joint Rehabilitation",
    quote:
      "I appreciated how clearly the exercises were explained, along with guidance for what to do at home between visits.",
  },
];

export const faqs: FAQItem[] = [
  {
    question: "What should I expect during my first physiotherapy visit?",
    answer:
      "Your first visit typically includes a discussion of your concerns and medical history, followed by a physical assessment of movement, strength, and posture. From there, a suitable treatment approach is discussed with you.",
  },
  {
    question: "How long does a physiotherapy session take?",
    answer:
      "Session length can vary depending on the type of treatment and individual needs. Your therapist will let you know what to expect for your specific plan.",
  },
  {
    question: "Do I need an appointment?",
    answer:
      "Yes, we recommend booking an appointment in advance so we can prepare for your visit and minimize waiting time.",
  },
  {
    question: "What should I wear to physiotherapy?",
    answer:
      "Comfortable, loose-fitting clothing that allows easy movement is recommended, along with suitable footwear if your session involves exercise.",
  },
  {
    question: "How many sessions might I need?",
    answer:
      "The number of sessions depends on the individual condition and response to treatment. This will be discussed with you as part of your personalized plan.",
  },
  {
    question: "Can physiotherapy help with back pain?",
    answer:
      "Physiotherapy is commonly used to support the management of back pain through targeted exercises and movement-based approaches. Suitability depends on individual assessment.",
  },
  {
    question: "Can I continue normal activities during treatment?",
    answer:
      "In many cases, yes — your therapist will guide you on which activities are appropriate to continue and which may need to be adjusted during your recovery.",
  },
];

export const team: TeamMember[] = [
  {
    name: "Dr. Muhammad Amjad Awan",
    role: "Founder & Physiotherapist",
    credentials: [
      "DPT (Pakistan)",
      "DHPMS (Pakistan)",
      "OT (Florence, Italy)",
      "BLS (Pakistan)",
      "MA, MSc (Pakistan)",
      "Ex-Physiotherapist, Pakistan Navy",
    ],
    image: "/images/doctor-amjad-awan.jpg",
    bio: "Leads the clinic's physiotherapy and rehabilitation programs, with experience across Pakistan Navy hospitals including PNS Shifa Naval Hospital, Karachi and PNS Hafeez Naval Hospital, Islamabad.",
  },
  {
    name: "Dr. Sahil",
    role: "Physiotherapist",
    credentials: ["Aqsa Physiotherapy Centre"],
    image: "/images/doctor-sahil.jpg",
    bio: "Supports patients through guided exercise therapy and hands-on rehabilitation as part of the clinic's care team.",
  },
];

export type { LucideIcon };
