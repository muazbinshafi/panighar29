// @ts-nocheck
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Droplets, Shield, Wrench, Truck, Phone, Mail, MapPin, Star,
  ChevronRight, Package, Users, Award, Clock, CheckCircle2, Heart,
  Menu, X, ArrowRight, Sparkles, Globe, Leaf, FlaskConical, Headphones,
  BadgePercent, ThumbsUp, Search, ClipboardCheck, Settings, Zap,
  TrendingUp, ShieldCheck, MessageCircle, Sun, Battery, PlugZap,
  Cable, Building2, Home as HomeIcon
} from "lucide-react";

import heroImage from "@/assets/hero-water.jpg";
import imgDomesticRO from "@/assets/products/ro-plant-domestic.jpg";
import imgCommercialRO from "@/assets/products/ro-plant-commercial.jpg";
import imgWaterBottle from "@/assets/products/water-bottle-19l.jpg";
import imgBottleCaps from "@/assets/products/bottle-seals-caps.jpg";
import imgFilters from "@/assets/products/filters-membranes.jpg";
import imgSpareParts from "@/assets/products/spare-parts.jpg";
import imgSolarRooftop from "@/assets/products/solar-rooftop.jpg";
import imgSolarInverter from "@/assets/products/solar-inverter.jpg";
import imgSolarPanel from "@/assets/products/solar-panel.jpg";
import imgSolarCommercial from "@/assets/products/solar-commercial.jpg";
import imgSolarBattery from "@/assets/products/solar-battery.jpg";
import imgSolarAccessories from "@/assets/products/solar-accessories.jpg";

const BRAND = "Qazi Enterprises";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#why-us" },
  { label: "Services", href: "#services" },
  { label: "Water", href: "#water-products" },
  { label: "Solar", href: "#solar-products" },
  { label: "Process", href: "#process" },
  { label: "Areas", href: "#areas" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  { icon: Droplets, title: "Domestic Water Filtration", desc: "Complete home RO & multi-stage purification systems delivering safe drinking water for your family." },
  { icon: Shield, title: "Commercial Water Plants", desc: "Industrial-grade water treatment plants for factories, hospitals, schools and businesses." },
  { icon: Sun, title: "Solar System Establishment", desc: "End-to-end solar installation — on-grid, off-grid and hybrid systems for homes and businesses." },
  { icon: Battery, title: "Solar Batteries & Backup", desc: "Lithium and tubular battery banks engineered for reliable, long-lasting energy storage." },
  { icon: Package, title: "Bottles & Accessories", desc: "Wholesale 19L bottles, seals, caps, filters, membranes and water plant spare parts." },
  { icon: Wrench, title: "Maintenance & After-Sales", desc: "AMC, panel cleaning, filter replacements and 24/7 technical support — water + solar." },
];

const WATER_PRODUCTS = [
  { name: "Domestic RO Plants", desc: "6–8 stage home reverse osmosis systems for pure drinking water", price: "Starting from Rs. 15,000", image: imgDomesticRO, slug: "domestic-ro-plants" },
  { name: "Commercial RO Plants", desc: "Heavy-duty 400–8000 GPD plants for businesses & factories", price: "Custom Pricing", image: imgCommercialRO, slug: "commercial-ro-plants" },
  { name: "Water Bottles (19L)", desc: "Empty 19-liter reusable polycarbonate water dispenser bottles", price: "Wholesale Rates", image: imgWaterBottle, slug: "water-bottles-19l" },
  { name: "Bottle Seals & Caps", desc: "Heat-shrink seals, snap caps and dispenser closures", price: "Bulk Available", image: imgBottleCaps, slug: "bottle-seals-caps" },
  { name: "Filters & RO Membranes", desc: "Sediment, carbon, post-carbon filters and 50–4000 GPD membranes", price: "All Brands", image: imgFilters, slug: "filters-membranes" },
  { name: "Plant Spare Parts", desc: "Booster pumps, housings, fittings, gauges, tubing & more", price: "Best Prices", image: imgSpareParts, slug: "spare-parts" },
];

const SOLAR_PRODUCTS = [
  { name: "Rooftop Solar Systems", desc: "Complete grid-tied solar PV installations for homes — 3kW to 15kW", price: "Turnkey Packages", image: imgSolarRooftop, slug: "solar-rooftop" },
  { name: "Solar Panels (Mono PERC)", desc: "Tier-1 monocrystalline PV modules — 450W to 580W high-efficiency", price: "Best Market Rates", image: imgSolarPanel, slug: "solar-panels" },
  { name: "Hybrid & On-Grid Inverters", desc: "Premium inverters from 3kW to 50kW with smart monitoring", price: "All Top Brands", image: imgSolarInverter, slug: "solar-inverters" },
  { name: "Lithium & Tubular Batteries", desc: "LiFePO4 wall-mount and deep-cycle batteries for reliable backup", price: "Long Warranty", image: imgSolarBattery, slug: "solar-batteries" },
  { name: "Commercial Solar Plants", desc: "Industrial rooftop & ground-mount solar for factories and warehouses", price: "Custom Engineered", image: imgSolarCommercial, slug: "solar-commercial" },
  { name: "Mounting & Accessories", desc: "Aluminum rails, clamps, MC4 connectors, DC cables and structures", price: "Complete Kits", image: imgSolarAccessories, slug: "solar-accessories" },
];

const REVIEWS = [
  { name: "Ahmed Khan", role: "Restaurant Owner", text: "Qazi Enterprises installed a commercial RO plant for our restaurant. Water quality is excellent and their after-sales service is outstanding!", rating: 5 },
  { name: "Dr. Fatima Noor", role: "Clinic Owner", text: "We've been using their domestic filtration system for 2 years. Best investment for our family's health. Highly recommended!", rating: 5 },
  { name: "Engr. Tariq Mehmood", role: "Factory Owner", text: "Their team installed a 25kW solar system at our facility. Power bills dropped by 70% and the workmanship is top-notch.", rating: 5 },
  { name: "Haji Rasheed", role: "School Administrator", text: "Qazi Enterprises provided both water plants and a 10kW rooftop solar at our school. Professional installation and regular maintenance.", rating: 5 },
  { name: "Sana Malik", role: "Homeowner", text: "Got my home solar + RO filtration done together. One trusted vendor, smooth experience and fair pricing.", rating: 5 },
  { name: "Bilal Hussain", role: "Factory Manager", text: "Their commercial water treatment and solar solutions solved our utility issues completely. Excellent technical expertise!", rating: 4 },
];

const FAQS = [
  { q: "What businesses does Qazi Enterprises operate in?", a: "We specialize in two complete domains: (1) Water Treatment Technologies — domestic and commercial RO plants, filtration systems, water bottles, seals, caps, filters, membranes and spare parts; and (2) Solar System Establishment — solar panels, inverters, batteries, mounting structures, on-grid, off-grid and hybrid system design, installation and maintenance." },
  { q: "Do you handle both water and solar projects under one roof?", a: "Yes — that's our biggest advantage. From initial site survey to design, supply, installation, commissioning and lifetime maintenance, you deal with one trusted team for both water treatment and solar." },
  { q: "What types of water filtration systems do you offer?", a: "Domestic (under-sink, countertop, multi-stage, UV+RO) and commercial/industrial (400–8000 GPD RO plants, softeners, mineral systems, bottling lines) suitable for any scale." },
  { q: "What kind of solar systems can you install?", a: "On-grid (net-metering), off-grid (battery backup) and hybrid systems from 1kW homes up to multi-megawatt commercial plants. We provide A-grade panels, premium inverters and end-to-end installation including net-metering paperwork." },
  { q: "Do you provide free site surveys and quotes?", a: "Yes. For both water and solar projects we offer free on-site visits, water testing or load assessment, and a transparent no-obligation quotation." },
  { q: "What warranties do you provide?", a: "Water plants: 1-year parts & labor warranty (extendable). Solar panels: up to 25-year performance warranty. Inverters: 5–10 years. Batteries: as per brand (typically 5–10 years for lithium)." },
  { q: "Do you sell water bottles and accessories in bulk?", a: "Absolutely. We supply 19-liter bottles, seals, caps, filters and accessories at competitive wholesale prices with bulk-order discounts." },
  { q: "Do you offer maintenance contracts (AMC)?", a: "Yes — annual maintenance contracts for both water plants (servicing, filter replacement) and solar systems (panel cleaning, inverter health checks, performance monitoring) with priority support." },
  { q: "What areas do you serve?", a: "Bahawalpur and surrounding districts as standard. For larger water and solar projects we deliver across South Punjab and beyond." },
];

const STATS = [
  { value: "500+", label: "Water Plants Installed" },
  { value: "200+", label: "Solar Systems Deployed" },
  { value: "1000+", label: "Happy Customers" },
  { value: "24/7", label: "Support Available" },
];

const WHY_US = [
  { icon: ShieldCheck, title: "Two Businesses, One Team", desc: "Water treatment and solar — fully under one roof, one accountable team." },
  { icon: BadgePercent, title: "Best Wholesale Rates", desc: "Direct pricing on bottles, caps, filters, panels and inverters — no middlemen." },
  { icon: Headphones, title: "Real Human Support", desc: "Talk to actual technicians, not bots. Same-day response on workdays." },
  { icon: Leaf, title: "Eco-Friendly", desc: "Reusable bottles, energy-efficient plants and clean solar energy." },
  { icon: FlaskConical, title: "Free Survey & Testing", desc: "On-site TDS testing for water, load assessment for solar — free of cost." },
  { icon: ThumbsUp, title: "5-Star Rated", desc: "Hundreds of homes, clinics, schools and factories trust Qazi Enterprises." },
];

const PROCESS = [
  { icon: Phone, title: "1. Get in Touch", desc: "Call, WhatsApp, or fill the contact form — we respond within hours." },
  { icon: Search, title: "2. Free Site Visit", desc: "We visit, test water or assess solar load, and understand your needs." },
  { icon: ClipboardCheck, title: "3. Custom Quote", desc: "Transparent, no-obligation quote tailored to your space and budget." },
  { icon: Settings, title: "4. Installation", desc: "Certified technicians install and commission your system end-to-end." },
  { icon: Wrench, title: "5. Aftercare", desc: "Ongoing maintenance, replacements and priority AMC support." },
];

const BENEFITS = [
  { icon: Zap, label: "Fast Delivery" },
  { icon: ShieldCheck, label: "Up to 25-Yr Warranty" },
  { icon: BadgePercent, label: "Wholesale Pricing" },
  { icon: TrendingUp, label: "20+ Yrs Experience" },
  { icon: Headphones, label: "24/7 Support" },
  { icon: Leaf, label: "Eco-Friendly" },
];

const SERVICE_AREAS = [
  "Bahawalpur City", "Model Town", "Satellite Town", "Cantt Area",
  "Yazman Road", "Hasilpur Road", "Ahmadpur East", "Khairpur Tamewali",
  "Yazman", "Lodhran", "Multan Road", "Rahim Yar Khan (Bulk)",
];

// What's included in each business line
const WATER_INCLUDES = [
  "Domestic RO purification systems (6–8 stage)",
  "Commercial & industrial RO plants (400–8000 GPD)",
  "UV sterilizers & water softeners",
  "Mineral & alkaline water systems",
  "19-liter water dispenser bottles (wholesale)",
  "Bottle seals, caps & heat-shrink closures",
  "Sediment, carbon & post-carbon filters",
  "RO membranes (all GPD ratings, all brands)",
  "Booster pumps, housings, fittings & gauges",
  "Tubing, valves & complete spare parts",
  "Free on-site water (TDS) testing",
  "Installation, commissioning & AMC",
];

const SOLAR_INCLUDES = [
  "On-grid (net-metering) solar systems",
  "Off-grid solar with battery backup",
  "Hybrid solar systems (grid + battery)",
  "Tier-1 monocrystalline PV panels (up to 580W)",
  "Premium hybrid & string inverters (3–50 kW)",
  "Lithium (LiFePO4) & tubular battery banks",
  "Aluminum mounting structures & rails",
  "MC4 connectors, DC/AC cables & combiner boxes",
  "Earthing, lightning & surge protection",
  "Net-metering paperwork & DISCO liaison",
  "Performance monitoring & remote diagnostics",
  "Panel cleaning, AMC & inverter servicing",
];

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { enterGuest } = useAuth();
  const handleGuest = () => {
    enterGuest();
    navigate("/dashboard");
  };

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    const el = document.querySelector(id) as HTMLElement | null;
    if (!el) return;
    const HEADER_OFFSET = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // Scroll-reveal: add `.is-visible` to sections + [data-reveal] elements when they enter the viewport
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const targets = document.querySelectorAll<HTMLElement>(".qe-home section, .qe-home [data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Apply blue theme to :root while on home page so global elements (cursor, toasts, portals) match.
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-qe-home-theme", "");
    const vars = `--background:0 0% 100% !important;--foreground:217 60% 12% !important;--card:0 0% 100% !important;--card-foreground:217 60% 12% !important;--popover:0 0% 100% !important;--popover-foreground:217 60% 12% !important;--primary:217 91% 50% !important;--primary-foreground:0 0% 100% !important;--primary-glow:210 100% 65% !important;--secondary:214 100% 97% !important;--secondary-foreground:217 70% 22% !important;--muted:214 60% 96% !important;--muted-foreground:217 20% 45% !important;--accent:199 95% 48% !important;--accent-foreground:0 0% 100% !important;--success:152 65% 40% !important;--success-foreground:0 0% 100% !important;--border:214 32% 91% !important;--input:214 32% 91% !important;--ring:217 91% 50% !important;--chart-1:217 91% 50% !important;--chart-2:199 95% 48% !important;--chart-3:210 100% 65% !important;--chart-4:224 76% 38% !important;--chart-5:190 90% 55% !important;`;
    style.textContent = `:root,:root.dark,html,html.dark,body,body.dark,.dark{${vars}}`;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  // Locked blue theme for the public home page — overrides user theme via cascading CSS vars.
  const homeTheme: React.CSSProperties = {
    ["--background" as any]: "0 0% 100%",
    ["--foreground" as any]: "217 60% 12%",
    ["--card" as any]: "0 0% 100%",
    ["--card-foreground" as any]: "217 60% 12%",
    ["--popover" as any]: "0 0% 100%",
    ["--popover-foreground" as any]: "217 60% 12%",
    ["--primary" as any]: "217 91% 50%",
    ["--primary-foreground" as any]: "0 0% 100%",
    ["--primary-glow" as any]: "210 100% 65%",
    ["--secondary" as any]: "214 100% 97%",
    ["--secondary-foreground" as any]: "217 70% 22%",
    ["--muted" as any]: "214 60% 96%",
    ["--muted-foreground" as any]: "217 20% 45%",
    ["--accent" as any]: "199 95% 48%",
    ["--accent-foreground" as any]: "0 0% 100%",
    ["--success" as any]: "152 65% 40%",
    ["--success-foreground" as any]: "0 0% 100%",
    ["--border" as any]: "214 32% 91%",
    ["--input" as any]: "214 32% 91%",
    ["--ring" as any]: "217 91% 50%",
    ["--chart-1" as any]: "217 91% 50%",
    ["--chart-2" as any]: "199 95% 48%",
    ["--chart-3" as any]: "210 100% 65%",
    ["--chart-4" as any]: "224 76% 38%",
    ["--chart-5" as any]: "190 90% 55%",
    backgroundColor: "hsl(0 0% 100%)",
    color: "hsl(217 60% 12%)",
    colorScheme: "light",
  };

  return (
    <div className="qe-home min-h-screen bg-background text-foreground" style={homeTheme}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_-10px_hsl(217_91%_30%/0.18)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button
            onClick={() => scrollTo("#hero")}
            className="flex items-center gap-2 font-bold text-lg sm:text-xl text-primary transition-all duration-300 hover:scale-[1.03] active:scale-95"
          >
            <span className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_6px_20px_-4px_hsl(217_91%_50%/0.55)] transition-transform duration-500 hover:rotate-[8deg]">
              <Droplets className="h-4 w-4 absolute -translate-x-[3px]" />
              <Sun className="h-4 w-4 absolute translate-x-[3px] translate-y-[1px]" />
            </span>
            <span className="whitespace-nowrap bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {BRAND}
            </span>
          </button>

          {/* Desktop nav — glass pill */}
          <div className="hidden lg:flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-0.5 rounded-full border border-white/50 bg-white/40 backdrop-blur-2xl px-1 py-1 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.7),0_8px_24px_-12px_hsl(217_91%_30%/0.25)]">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="relative px-2.5 py-1.5 rounded-full text-[12px] xl:text-[13px] font-medium text-foreground/70 hover:text-primary transition-all duration-300 hover:bg-white/80 hover:shadow-[0_4px_14px_-4px_hsl(217_91%_50%/0.35)] hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                >
                  {l.label}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGuest}
              className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300 whitespace-nowrap px-3"
            >
              Guest
            </Button>
            <Link to="/login">
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_6px_18px_-4px_hsl(217_91%_50%/0.55)] hover:shadow-[0_10px_28px_-6px_hsl(217_91%_50%/0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 whitespace-nowrap px-3"
              >
                Login
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 transition-all duration-300 hover:bg-white/90 hover:scale-105"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5 text-primary" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="lg:hidden bg-white/90 backdrop-blur-xl border-t border-white/50 px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto animate-fade-in">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="block w-full text-left text-sm font-medium text-foreground/75 hover:text-primary px-3 py-2 rounded-lg hover:bg-primary/5 transition-all duration-200"
              >
                {l.label}
              </button>
            ))}
            <Button size="sm" variant="outline" className="w-full rounded-full border-primary/40 text-primary mt-1" onClick={handleGuest}>
              View Dashboard as Guest
            </Button>
            <Link to="/login" className="block pt-1">
              <Button size="sm" className="w-full rounded-full bg-gradient-to-r from-primary to-accent">Dashboard Login</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="hero" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-muted/30" />
        <div
          className="absolute inset-0 -z-10 opacity-[0.18] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 75%)",
          }}
        />
        <div className="pointer-events-none absolute -top-32 -left-24 -z-10 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="pointer-events-none absolute top-10 -right-24 -z-10 h-[380px] w-[380px] rounded-full bg-accent/20 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-7">
            <div className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-card/70 backdrop-blur-md text-[11px] sm:text-xs font-semibold shadow-[var(--shadow-xs)]">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-foreground/80 truncate sm:whitespace-normal">Water Treatment + Solar — 20+ Years (Since 2005)</span>
            </div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold leading-[1.05] tracking-[-0.04em] text-foreground break-words">
              Pure Water,
              <br />
              <span className="text-gradient">Clean Energy.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              <span className="font-semibold text-foreground">{BRAND}</span> delivers complete <span className="font-semibold text-foreground">Water Treatment Technologies</span> (domestic &amp; commercial) and end-to-end <span className="font-semibold text-foreground">Solar System Establishment</span> — panels, inverters, batteries and everything in between. One trusted partner for both.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="xl" variant="premium" onClick={() => scrollTo("#contact")} className="gap-2 group">
                Get a Free Quote
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => scrollTo("#water-products")} className="gap-2 backdrop-blur-md bg-card/60">
                <Droplets className="h-4 w-4" /> Water Products
              </Button>
              <Button size="xl" variant="outline" onClick={() => scrollTo("#solar-products")} className="gap-2 backdrop-blur-md bg-card/60">
                <Sun className="h-4 w-4" /> Solar Products
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" /> ISO Certified
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" /> Free Installation
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" /> Up to 25-Yr Warranty
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <a href="tel:03000317383" className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" /> 0300-0317383
              </a>
              <a href="tel:03007811479" className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" /> 0300-7811479
              </a>
            </div>
          </div>

          <div className="flex-1 flex justify-center w-full">
            <div className="relative w-full max-w-[480px] aspect-square">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-2xl" />
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden border border-border/60 shadow-[var(--shadow-xl)] bg-card">
                <img
                  src={heroImage}
                  alt="Qazi Enterprises — Water Treatment and Solar Systems"
                  className="w-full h-full object-cover"
                  width={1280}
                  height={1280}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -top-3 -right-3 rounded-xl border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-[var(--shadow-lg)] flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Droplets className="h-4 w-4 text-primary" />
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Water</div>
                  <div className="text-xs font-bold">Treatment Tech</div>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 rounded-xl border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-[var(--shadow-lg)] flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sun className="h-4 w-4 text-accent" />
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Solar</div>
                  <div className="text-xs font-bold">System Establishment</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-extrabold">{s.value}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About <span className="text-primary">{BRAND}</span></h2>
            <p className="text-muted-foreground text-lg">
              {BRAND} is a Bahawalpur-based company operating in two complete domains — <span className="font-semibold text-foreground">Water Treatment Technologies</span> for domestic and commercial clients, and <span className="font-semibold text-foreground">Solar System Establishment</span> covering panels, inverters, batteries, mounting and everything in between. From a single under-sink RO unit to a full industrial RO plant, and from a 3kW home solar setup to a multi-megawatt commercial solar farm — we deliver, install and maintain it all under one trusted roof.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "Quality Assured", desc: "Certified, high-grade components in every water plant and every solar installation." },
              { icon: Users, title: "Customer First", desc: "Personalized solutions tailored to your water needs and energy load." },
              { icon: Globe, title: "Wide Coverage", desc: "Bahawalpur and surrounding districts with reliable delivery and installation." },
            ].map((item) => (
              <Card key={item.title} className="text-center p-6 hover:shadow-lg transition-shadow border-border">
                <item.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Two-Business Overview */}
      <section id="business-lines" className="py-16 md:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What <span className="text-primary">We Do</span></h2>
            <p className="text-muted-foreground text-lg">Two complete businesses. One accountable team. Everything you need — included.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Water */}
            <Card className="overflow-hidden border-border hover:border-primary/40 transition-colors">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Business 01</div>
                    <h3 className="text-xl md:text-2xl font-bold">Water Treatment Technologies</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm md:text-base mb-5">
                  Complete water purification — domestic RO units for homes and large commercial RO plants for factories, hospitals and businesses. Plus all consumables and spare parts.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    <HomeIcon className="h-3 w-3" /> Domestic
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    <Building2 className="h-3 w-3" /> Commercial
                  </span>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                  {WATER_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => scrollTo("#water-products")} variant="outline" className="gap-2">
                  Browse Water Products <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Solar */}
            <Card className="overflow-hidden border-border hover:border-accent/40 transition-colors">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Sun className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Business 02</div>
                    <h3 className="text-xl md:text-2xl font-bold">Solar System Establishment</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm md:text-base mb-5">
                  End-to-end solar — design, supply, installation and maintenance of on-grid, off-grid and hybrid systems. Everything from a single panel to a full commercial solar farm.
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                    <PlugZap className="h-3 w-3" /> On-Grid
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                    <Battery className="h-3 w-3" /> Off-Grid
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                    <Cable className="h-3 w-3" /> Hybrid
                  </span>
                </div>
                <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                  {SOLAR_INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => scrollTo("#solar-products")} variant="outline" className="gap-2">
                  Browse Solar Products <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 border-y border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.label} className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-primary">{BRAND}</span></h2>
            <p className="text-muted-foreground text-lg">Six reasons families and businesses across Bahawalpur trust us for water and solar.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((w) => (
              <Card key={w.title} className="group p-6 hover:border-primary/40 transition-all">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <w.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{w.title}</h3>
                <p className="text-muted-foreground text-sm">{w.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our <span className="text-primary">Services</span></h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Comprehensive water and solar solutions — from design and installation to lifetime maintenance.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <Card key={s.title} className="group hover:shadow-lg hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process / How It Works */}
      <section id="process" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="text-primary">Works</span></h2>
            <p className="text-muted-foreground text-lg">From your first call to long-term aftercare — a simple, transparent journey.</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {PROCESS.map((p) => (
                <div key={p.title} className="relative text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center mb-4 shadow-[var(--shadow-card)]">
                    <p.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base mb-1">{p.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Water Products */}
      <section id="water-products" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Droplets className="h-3.5 w-3.5" /> WATER TREATMENT TECHNOLOGIES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Water <span className="text-primary">Products</span></h2>
            <p className="text-muted-foreground text-lg">Quality water treatment products and accessories at the best prices — domestic and commercial.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WATER_PRODUCTS.map((p) => (
              <Link key={p.name} to={`/category/${p.slug}`}>
                <Card className="hover:shadow-lg transition-all group overflow-hidden cursor-pointer hover:border-primary/30 h-full">
                  <CardContent className="p-0">
                    <div className="h-48 overflow-hidden bg-muted relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width={1024} height={768} />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <span className="text-background text-sm font-semibold flex items-center gap-1">View Products <ArrowRight className="h-3.5 w-3.5" /></span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{p.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{p.price}</span>
                        <span className="text-xs text-accent font-medium flex items-center gap-1">
                          Explore <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Solar Products */}
      <section id="solar-products" className="py-16 md:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-3">
              <Sun className="h-3.5 w-3.5" /> SOLAR SYSTEM ESTABLISHMENT
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Solar <span className="text-accent">Products</span></h2>
            <p className="text-muted-foreground text-lg">Complete solar power solutions — panels, inverters, batteries and accessories from top brands.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLAR_PRODUCTS.map((p) => (
              <Link key={p.name} to={`/category/${p.slug}`}>
                <Card className="hover:shadow-lg transition-all group overflow-hidden cursor-pointer hover:border-accent/30 h-full">
                  <CardContent className="p-0">
                    <div className="h-48 overflow-hidden bg-muted relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width={1024} height={768} />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                        <span className="text-background text-sm font-semibold flex items-center gap-1">View Products <ArrowRight className="h-3.5 w-3.5" /></span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">{p.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{p.desc}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-accent">{p.price}</span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          Explore <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Our <span className="text-primary">Customers Say</span></h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Trusted by hundreds of families and businesses across Bahawalpur.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < r.rating ? "fill-warning text-warning" : "text-border"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{r.text}"</p>
                  <div>
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section id="areas" className="py-16 md:py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Areas We <span className="text-primary">Serve</span></h2>
            <p className="text-muted-foreground text-lg">Free delivery and installation across Bahawalpur and nearby districts.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
            {SERVICE_AREAS.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-primary" /> {a}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't see your area? <a href="https://wa.me/923007811479" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Message us</a> — we likely cover it.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
          <p className="text-center text-muted-foreground mb-12">Everything you need to know about our water and solar offerings.</p>
          <Accordion type="multiple" className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-xl px-5 bg-card shadow-[var(--shadow-card)] data-[state=open]:border-primary/40 transition-colors"
              >
                <AccordionTrigger className="text-left text-sm md:text-base font-semibold hover:no-underline py-4">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">Still have questions? We're happy to help.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="premium" onClick={() => scrollTo("#contact")} className="gap-2 group">
                Contact Us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Link to="/login">
                <Button size="lg" variant="outline" className="gap-2">
                  Dashboard Login <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-accent p-8 md:p-12 text-primary-foreground shadow-[var(--shadow-xl)]">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-background/10 blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left max-w-xl">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready for cleaner water and clean energy?</h3>
                <p className="text-primary-foreground/85 text-sm md:text-base">Free site visit and quote — water treatment or solar system. No commitment, just clarity.</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="tel:03007811479">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Phone className="h-4 w-4" /> Call Now
                  </Button>
                </a>
                <a href="https://wa.me/923007811479" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 md:py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Get In <span className="text-primary">Touch</span></h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Contact Information</h3>
              <div className="space-y-4">
                <a href="tel:03000317383" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Phone className="h-5 w-5 text-primary" /></div>
                  <div><div className="text-xs text-muted-foreground">Phone 1</div><div className="font-medium text-foreground">0300-0317383</div></div>
                </a>
                <a href="tel:03007811479" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Phone className="h-5 w-5 text-primary" /></div>
                  <div><div className="text-xs text-muted-foreground">Phone 2</div><div className="font-medium text-foreground">0300-7811479</div></div>
                </a>
                <a href="mailto:imrankhalilqazi@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Mail className="h-5 w-5 text-primary" /></div>
                  <div><div className="text-xs text-muted-foreground">Email 1</div><div className="font-medium text-foreground">imrankhalilqazi@gmail.com</div></div>
                </a>
                <a href="mailto:muazbinshafi@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Mail className="h-5 w-5 text-primary" /></div>
                  <div><div className="text-xs text-muted-foreground">Email 2</div><div className="font-medium text-foreground">muazbinshafi@gmail.com</div></div>
                </a>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="h-5 w-5 text-primary" /></div>
                  <div><div className="text-xs text-muted-foreground">Address</div><div className="font-medium text-foreground">Al Hafeez Manzil, Darbar Mahal Road, Near University Chowk, Bahawalpur</div></div>
                </div>
              </div>
            </div>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
              <form onSubmit={(e) => { e.preventDefault(); window.open(`https://wa.me/923007811479?text=${encodeURIComponent(`Hi ${BRAND}, I'm interested in your water and/or solar solutions.`)}`, "_blank"); }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <input type="text" placeholder="Your Name" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <input type="tel" placeholder="Your Phone Number" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Message</label>
                  <textarea placeholder="Tell us about your water or solar requirement…" rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <Button type="submit" className="w-full gap-2">
                  Send via WhatsApp <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden text-white pt-16 pb-8 mt-8" style={{ background: "linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(217 91% 22%) 60%, hsl(199 95% 28%) 100%)" }}>
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-12 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3 font-bold text-2xl">
                <span className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_10px_30px_-8px_hsl(217_91%_50%/0.7)] transition-transform duration-500 hover:rotate-[10deg] hover:scale-110">
                  <Droplets className="h-5 w-5 absolute -translate-x-[4px] text-white" />
                  <Sun className="h-5 w-5 absolute translate-x-[4px] translate-y-[1px] text-white" />
                </span>
                <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">{BRAND}</span>
              </div>
              <p className="text-sm leading-relaxed text-white/70 max-w-md">
                Water Treatment Technologies (domestic &amp; commercial) and Solar System Establishment — proudly serving Bahawalpur for over 20 years (since 2005).
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[
                  { Icon: Phone, href: "tel:03007811479", label: "Call" },
                  { Icon: Mail, href: "mailto:imrankhalilqazi@gmail.com", label: "Email" },
                  { Icon: MapPin, href: "#contact", label: "Location" },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                     className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white hover:text-primary hover:-translate-y-1 hover:shadow-[0_10px_24px_-6px_hsl(217_91%_50%/0.55)] transition-all duration-300">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h4 className="font-semibold mb-4 text-white/95 tracking-wide text-sm uppercase">Quick Links</h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.href}
                    onClick={() => scrollTo(l.href)}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-all duration-300 hover:translate-x-1 text-left"
                  >
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="md:col-span-4">
              <h4 className="font-semibold mb-4 text-white/95 tracking-wide text-sm uppercase">Get in Touch</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3 group">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <div className="text-white/80">
                    <a href="tel:03000317383" className="block hover:text-white transition-colors">0300-0317383</a>
                    <a href="tel:03007811479" className="block hover:text-white transition-colors">0300-7811479</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <div className="text-white/80 break-all">
                    <a href="mailto:imrankhalilqazi@gmail.com" className="block hover:text-white transition-colors">imrankhalilqazi@gmail.com</a>
                    <a href="mailto:muazbinshafi@gmail.com" className="block hover:text-white transition-colors">muazbinshafi@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-white/80 leading-relaxed">
                    Al Hafeez Manzil, Darbar Mahal Road, Near University Chowk, Bahawalpur
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
            <p className="text-white/60 text-center md:text-left">
              © {new Date().getFullYear()} <span className="font-semibold text-white/80">{BRAND}</span>. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-white/60 flex-wrap justify-center">
              Made by
              <span className="font-semibold text-white">MuazBinShafi</span>
              with <Heart className="h-4 w-4 fill-destructive text-destructive inline animate-pulse" /> using
              <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-accent transition-colors">Lovable</a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/923007811479?text=${encodeURIComponent(`Assalam o Alaikum! I'm interested in ${BRAND} water and solar solutions. Can you please share more details?`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="hidden sm:inline font-semibold text-sm">WhatsApp Us</span>
      </a>
    </div>
  );
}
