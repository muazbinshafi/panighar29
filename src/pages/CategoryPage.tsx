// @ts-nocheck
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Droplets, ChevronRight, ArrowLeft, Phone, Star, CheckCircle2,
  ArrowRight, Sparkles, Shield, Award, Truck, Clock, Package,
  Menu, X, Heart
} from "lucide-react";

import heroImage from "@/assets/hero-water.jpg";
import imgDomesticRO from "@/assets/products/ro-plant-domestic.jpg";
import imgCommercialRO from "@/assets/products/ro-plant-commercial.jpg";
import imgWaterBottle from "@/assets/products/water-bottle-19l.jpg";
import imgBottleCaps from "@/assets/products/bottle-seals-caps.jpg";
import imgFilters from "@/assets/products/filters-membranes.jpg";
import imgSpareParts from "@/assets/products/spare-parts.jpg";

const CATEGORY_DATA: Record<string, {
  title: string;
  description: string;
  heroImage: string;
  icon: typeof Droplets;
  features: string[];
  products: { name: string; desc: string; price: string; image: string; specs?: string[] }[];
}> = {
  "domestic-ro-plants": {
    title: "Domestic RO Plants",
    description: "High-quality home reverse osmosis systems designed for Pakistani water conditions. Our domestic RO plants remove 99% of contaminants including TDS, heavy metals, bacteria, and viruses.",
    heroImage: imgDomesticRO,
    icon: Droplets,
    features: ["6-8 Stage Filtration", "UV + RO Technology", "1 Year Warranty", "Free Installation", "After-Sales Support", "NSF Certified Parts"],
    products: [
      { name: "Qazi Basic 6-Stage RO", desc: "Entry-level 6-stage reverse osmosis system perfect for small families", price: "Rs. 15,000", image: imgDomesticRO, specs: ["6 Stage Filtration", "75 GPD Membrane", "10L Storage Tank", "1 Year Warranty"] },
      { name: "Qazi Pro 7-Stage RO+UV", desc: "Advanced 7-stage system with UV sterilization for extra protection", price: "Rs. 22,000", image: imgDomesticRO, specs: ["7 Stage + UV", "100 GPD Membrane", "12L Storage Tank", "2 Year Warranty"] },
      { name: "Qazi Premium 8-Stage", desc: "Top-of-the-line 8-stage system with alkaline & mineral filters", price: "Rs. 30,000", image: imgDomesticRO, specs: ["8 Stage + Alkaline", "100 GPD Membrane", "15L Storage Tank", "3 Year Warranty"] },
      { name: "Qazi Compact Mini RO", desc: "Space-saving compact RO system for apartments and kitchens", price: "Rs. 12,000", image: imgDomesticRO, specs: ["5 Stage Filtration", "50 GPD Membrane", "6L Storage Tank", "1 Year Warranty"] },
      { name: "Qazi Wall-Mount RO", desc: "Wall-mounted design for modern kitchens with LED indicators", price: "Rs. 25,000", image: imgDomesticRO, specs: ["7 Stage + UV", "100 GPD", "Digital TDS Display", "2 Year Warranty"] },
      { name: "Qazi Hot & Cold RO Dispenser", desc: "All-in-one RO with hot and cold water dispensing", price: "Rs. 45,000", image: imgDomesticRO, specs: ["8 Stage + UV", "Hot & Cold", "Built-in Dispenser", "3 Year Warranty"] },
    ],
  },
  "commercial-ro-plants": {
    title: "Commercial RO Plants",
    description: "Industrial-grade water treatment solutions for businesses, factories, hospitals, and commercial establishments. Custom-built to handle high-volume water purification needs.",
    heroImage: imgCommercialRO,
    icon: Shield,
    features: ["400-10000 GPD Capacity", "Industrial Grade", "Custom Built", "Installation Included", "AMC Available", "SS Frame Construction"],
    products: [
      { name: "Commercial 400 GPD Plant", desc: "Perfect for small businesses, offices, and restaurants", price: "Rs. 85,000", image: imgCommercialRO, specs: ["400 GPD", "SS Frame", "Auto Flush", "1 Year AMC"] },
      { name: "Commercial 800 GPD Plant", desc: "Medium capacity for schools, clinics, and mid-size businesses", price: "Rs. 1,50,000", image: imgCommercialRO, specs: ["800 GPD", "Heavy Duty Pump", "Digital Controller", "2 Year AMC"] },
      { name: "Commercial 1600 GPD Plant", desc: "High-capacity for hotels, hospitals, and large offices", price: "Rs. 2,50,000", image: imgCommercialRO, specs: ["1600 GPD", "Dual Pump System", "PLC Controller", "3 Year AMC"] },
      { name: "Industrial 4000 GPD Plant", desc: "Factory-grade water treatment for manufacturing units", price: "Custom Quote", image: imgCommercialRO, specs: ["4000 GPD", "FRP Vessels", "Full Automation", "Custom AMC"] },
      { name: "Water Bottling Plant Setup", desc: "Complete bottling line setup for water business startups", price: "Custom Quote", image: imgCommercialRO, specs: ["2000+ GPD", "Filling Machine", "Packaging Line", "Full Training"] },
      { name: "Mineral Water Plant", desc: "Complete mineral water production with TDS management", price: "Custom Quote", image: imgCommercialRO, specs: ["Mineral Addition", "UV + Ozone", "Lab Testing", "License Support"] },
    ],
  },
  "water-bottles-19l": {
    title: "Water Bottles (19L)",
    description: "Premium quality 19-liter reusable water bottles made from food-grade materials. Available in bulk quantities at the best wholesale rates in Bahawalpur.",
    heroImage: imgWaterBottle,
    icon: Package,
    features: ["Food Grade Material", "BPA Free", "Reusable", "Wholesale Rates", "Bulk Discounts", "All Sizes Available"],
    products: [
      { name: "19L PET Water Bottle", desc: "Standard 19-liter PET water bottle for dispensers", price: "Rs. 350/pc", image: imgWaterBottle, specs: ["19 Liter", "PET Material", "BPA Free", "Reusable"] },
      { name: "19L PC Water Bottle", desc: "Premium polycarbonate 19L bottle — extra durable", price: "Rs. 550/pc", image: imgWaterBottle, specs: ["19 Liter", "Polycarbonate", "100+ Reuses", "Impact Resistant"] },
      { name: "10L PET Bottle", desc: "10-liter PET bottle for smaller households", price: "Rs. 200/pc", image: imgWaterBottle, specs: ["10 Liter", "PET Material", "Lightweight", "Easy Handle"] },
      { name: "5 Gallon Round Bottle", desc: "Classic round 5-gallon bottle for top-load dispensers", price: "Rs. 400/pc", image: imgWaterBottle, specs: ["5 Gallon", "Round Shape", "Standard Neck", "Stackable"] },
      { name: "Bulk Pack (50 Bottles)", desc: "Wholesale pack of 50 x 19L PET bottles", price: "Rs. 15,000", image: imgWaterBottle, specs: ["50 Bottles", "Best Price", "Free Delivery", "Bahawalpur Area"] },
      { name: "Custom Branded Bottles", desc: "Custom label printing on bottles for your water brand", price: "Contact Us", image: imgWaterBottle, specs: ["Custom Label", "Your Brand", "Min 100 pcs", "Design Support"] },
    ],
  },
  "bottle-seals-caps": {
    title: "Bottle Seals & Caps",
    description: "Complete range of bottle accessories including heat-shrink seals, snap-on caps, handles, and stickers. Everything you need for professional water bottle packaging.",
    heroImage: imgBottleCaps,
    icon: Award,
    features: ["Heat Shrink Seals", "Snap-On Caps", "Custom Printing", "Bulk Pricing", "Fast Delivery", "All Standards"],
    products: [
      { name: "Heat Shrink Seals (Pack of 1000)", desc: "Tamper-evident heat shrink seals for 19L bottles", price: "Rs. 2,500", image: imgBottleCaps, specs: ["1000 Pieces", "Heat Shrink", "Tamper Evident", "Clear/Colored"] },
      { name: "Snap-On Caps (Pack of 500)", desc: "Non-spill snap-on caps for 19L water bottles", price: "Rs. 3,000", image: imgBottleCaps, specs: ["500 Pieces", "Non-Spill", "Easy Snap", "Standard Size"] },
      { name: "Bottle Handles (Pack of 200)", desc: "Ergonomic carry handles for 19L bottles", price: "Rs. 1,800", image: imgBottleCaps, specs: ["200 Pieces", "Strong Grip", "Universal Fit", "Durable Plastic"] },
      { name: "Custom Printed Seals", desc: "Seals with your brand name and logo printed", price: "Rs. 5/pc", image: imgBottleCaps, specs: ["Custom Print", "Your Logo", "Min 5000 pcs", "Full Color"] },
      { name: "Bottle Labels & Stickers", desc: "Waterproof adhesive labels for water bottles", price: "Rs. 3/pc", image: imgBottleCaps, specs: ["Waterproof", "Adhesive", "Custom Design", "Min 1000 pcs"] },
      { name: "Complete Packaging Kit", desc: "Seals + Caps + Handles combo pack for 100 bottles", price: "Rs. 5,500", image: imgBottleCaps, specs: ["100 Sets", "Seal + Cap", "Handle Included", "Best Value"] },
    ],
  },
  "filters-membranes": {
    title: "Filters & Membranes",
    description: "Genuine replacement filters, RO membranes, and cartridges for all brands. We stock Filmtec, Vontron, CSM, and other top membrane brands at competitive prices.",
    heroImage: imgFilters,
    icon: Sparkles,
    features: ["All Brands", "Genuine Parts", "RO Membranes", "Carbon Filters", "Sediment Filters", "UV Lamps"],
    products: [
      { name: "Filmtec 75 GPD RO Membrane", desc: "Original Filmtec membrane for domestic RO systems", price: "Rs. 3,500", image: imgFilters, specs: ["75 GPD", "Filmtec USA", "2-3 Year Life", "Best Rejection"] },
      { name: "Vontron 100 GPD Membrane", desc: "High-capacity Vontron membrane for home RO", price: "Rs. 2,800", image: imgFilters, specs: ["100 GPD", "Vontron China", "2 Year Life", "Great Value"] },
      { name: "Sediment Filter Set (3 Pack)", desc: "PP sediment filters — 5 micron pre-filtration", price: "Rs. 600", image: imgFilters, specs: ["3 Filters", "5 Micron", "6 Month Life", "Standard 10\""] },
      { name: "Carbon Block Filter Set (3 Pack)", desc: "Activated carbon block filters for chlorine removal", price: "Rs. 900", image: imgFilters, specs: ["3 Filters", "CTO Carbon", "6-12 Month Life", "Standard 10\""] },
      { name: "Complete Filter Kit (Annual)", desc: "Full year filter replacement kit — all stages", price: "Rs. 2,500", image: imgFilters, specs: ["All Stages", "1 Year Supply", "Includes Membrane", "Installation Guide"] },
      { name: "UV Lamp & Quartz Sleeve", desc: "Replacement UV sterilization lamp with quartz sleeve", price: "Rs. 1,800", image: imgFilters, specs: ["11W UV Lamp", "Quartz Sleeve", "9000 Hour Life", "Standard Size"] },
    ],
  },
  "spare-parts": {
    title: "Plant Spare Parts",
    description: "Complete range of water plant accessories, spare parts, and maintenance supplies. Pumps, housings, fittings, tanks, and everything needed to build or maintain water filtration systems.",
    heroImage: imgSpareParts,
    icon: Package,
    features: ["Booster Pumps", "Filter Housings", "Fittings & Connectors", "Storage Tanks", "TDS Meters", "Tools & Accessories"],
    products: [
      { name: "RO Booster Pump (100 GPD)", desc: "High-pressure booster pump for domestic RO systems", price: "Rs. 3,000", image: imgSpareParts, specs: ["100 GPD", "24V DC", "Self-Priming", "Low Noise"] },
      { name: "Filter Housing Set (3 Stage)", desc: "Standard 10\" filter housings with brackets and wrench", price: "Rs. 1,500", image: imgSpareParts, specs: ["3 Housings", "10\" Standard", "Wrench Included", "Wall Mount"] },
      { name: "RO Storage Tank (10L)", desc: "Pressurized storage tank for RO systems", price: "Rs. 2,500", image: imgSpareParts, specs: ["10 Liter", "Steel Tank", "Pressurized", "Food Grade"] },
      { name: "Quick Connect Fittings Kit", desc: "Complete set of 1/4\" quick-connect fittings and tubing", price: "Rs. 800", image: imgSpareParts, specs: ["20+ Pieces", "1/4\" Size", "Push Fit", "NSF Certified"] },
      { name: "Digital TDS Meter", desc: "Handheld TDS tester for water quality checking", price: "Rs. 500", image: imgSpareParts, specs: ["0-9999 PPM", "Auto Temp", "Pocket Size", "Battery Included"] },
      { name: "Complete DIY RO Kit", desc: "All parts needed to assemble a 6-stage home RO system", price: "Rs. 8,000", image: imgSpareParts, specs: ["All Parts", "Assembly Guide", "6 Stage", "No Tools Needed"] },
    ],
  },
};

const CATEGORY_SLUGS = Object.keys(CATEGORY_DATA);

export default function CategoryPage() {
  const params = useParams();
  const slug = (params as any).slug || "";
  const [mobileMenu, setMobileMenu] = useState(false);

  const category = CATEGORY_DATA[slug];

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Category Not Found</h1>
          <p className="text-muted-foreground">The product category you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Droplets className="h-7 w-7" />
            <span>Qazi Enterprises</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/login"><Button size="sm">Dashboard Login</Button></Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-card border-t border-border px-4 py-4 space-y-3">
            <Link to="/" className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-primary">Home</Link>
            <Link to="/login" className="block"><Button size="sm" className="w-full">Dashboard Login</Button></Link>
          </div>
        )}
      </nav>

      {/* Hero Banner */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to All Products
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
                <Icon className="h-3.5 w-3.5" /> {category.title}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground">{category.title}</h1>
              <p className="text-lg text-muted-foreground max-w-xl">{category.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {category.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" /> {f}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                <a href="tel:03007811479">
                  <Button size="lg" className="gap-2"><Phone className="h-4 w-4" /> Call Now: 0300-7811479</Button>
                </a>
                <a href={`https://wa.me/923007811479?text=${encodeURIComponent(`Hi Qazi Enterprises, I'm interested in ${category.title}.`)}`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2">WhatsApp Inquiry <ArrowRight className="h-4 w-4" /></Button>
                </a>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
                <img src={category.heroImage} alt={category.title} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Available Products</h2>
          <p className="text-muted-foreground mb-8">{category.products.length} products in this category</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map((p, i) => (
              <Card key={i} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border hover:border-primary/30">
                <CardContent className="p-0">
                  <div className="h-48 overflow-hidden bg-muted relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold shadow-lg">
                      {p.price}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-muted-foreground text-sm">{p.desc}</p>
                    {p.specs && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.specs.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <a href={`https://wa.me/923007811479?text=${encodeURIComponent(`Hi Qazi Enterprises, I want to inquire about ${p.name} (${p.price}).`)}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="w-full mt-2 gap-2">
                        Inquire Now <ArrowRight className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Categories */}
      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold mb-6">Browse Other Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORY_SLUGS.filter((s) => s !== slug).map((s) => {
              const cat = CATEGORY_DATA[s];
              const CatIcon = cat.icon;
              return (
                <Link key={s} to={`/category/${s}`}>
                  <Card className="text-center p-4 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                    <CatIcon className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-sm text-foreground">{cat.title}</h3>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Need Help Choosing?</h2>
          <p className="text-lg opacity-90">Our water experts will help you find the perfect solution for your needs. Free consultation available!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:03007811479"><Button size="lg" variant="secondary" className="gap-2"><Phone className="h-4 w-4" /> Call: 0300-7811479</Button></a>
            <a href="tel:03007811479"><Button size="lg" variant="secondary" className="gap-2"><Phone className="h-4 w-4" /> Call: 0300-7811479</Button></a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm opacity-60">
          <p>© {new Date().getFullYear()} Qazi Enterprises — Water & Solar. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Made by <span className="font-semibold">MuazBinShafi</span> with <Heart className="h-4 w-4 fill-destructive text-destructive inline" /> using <span className="font-semibold">Lovable</span>
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/923007811479?text=${encodeURIComponent("Assalam o Alaikum! I'm interested in Qazi Enterprises water & solar solutions. Can you please share more details?")}`}
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
