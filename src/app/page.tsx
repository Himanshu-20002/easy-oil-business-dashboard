'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowRight, 
  ClipboardList, 
  CheckCircle, 
  FileCheck, 
  Layers, 
  Fuel, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Activity, 
  MapPin, 
  HelpCircle 
} from 'lucide-react';
import { Header } from '../components/brand/Header';
import { Footer } from '../components/brand/Footer';

const CAROUSEL_IMAGES = [
  'https://res.cloudinary.com/dniebxelj/image/upload/v1780056592/Gemini_Generated_Image_15uarw15uarw15ua_gsycg3.png',
  'https://res.cloudinary.com/dniebxelj/image/upload/v1780056620/Gemini_Generated_Image_omcypqomcypqomcy_azpxgx.png',
  'https://res.cloudinary.com/dniebxelj/image/upload/v1780056685/Gemini_Generated_Image_h6u2puh6u2puh6u2_1_tilry1.png',
  'https://res.cloudinary.com/dniebxelj/image/upload/v1780056665/Gemini_Generated_Image_ghtac9ghtac9ghta_iev0bi.png',
];

function CarouselCard({ startIndex = 0, children }: { startIndex?: number; children: React.ReactNode }) {
  const [activeIdx, setActiveIdx] = useState(startIndex % CAROUSEL_IMAGES.length);

  const advance = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, 4000);
    return () => clearInterval(timer);
  }, [advance]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 group hover:border-slate-700 transition-all hover:translate-y-[-4px] duration-300">
      {/* Stacked crossfade images */}
      {CAROUSEL_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === activeIdx ? 1 : 0,
          }}
        />
      ))}
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40" />
      {/* Card content */}
      <div className="relative z-10 p-6 space-y-4">{children}</div>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();

  const getDashboardLink = () => {
    if (!session?.user) return '/login';
    const role = session.user.role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'sales_officer') return '/officer/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-iocl-orange selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36  overflow-hidden">
        {/* Abstract futuristic glowing backgrounds */}
        <div className="absolute top-[-20%] left-[-15%] w-[80%] md:w-[60%] h-[60%] rounded-full bg-iocl-blue/20 blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] md:w-[65%] h-[65%] rounded-full bg-iocl-orange/15 blur-[150px] pointer-events-none"></div>
        
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-iocl-orange text-xs font-bold uppercase tracking-wider">
                <span className="flex h-2 w-2 rounded-full bg-iocl-orange animate-pulse"></span>
                EasyOil B2B e-Onboarding Portal
                <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">BETA</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Direct & Reliable <br />
                <span className="  text-orange-400">Bulk Fuel</span> Onboarding
              </h1>
              
              <p className="text-base sm:text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
                Accelerate commercial and industrial fueling with EasyOil. Register your company, submit compliance documentation securely, track verification workflows, and unlock B2B distribution instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {session ? (
                  <Link
                    href={getDashboardLink()}
                    className="flex justify-center items-center gap-2 py-4 px-8 rounded-xl text-white font-extrabold text-sm iocl-gradient-orange shadow-lg hover:shadow-iocl-orange/20 hover:brightness-110 active:brightness-95 transition-all"
                  >
                    Go to Your Workspace
                    <ArrowRight className="w-4.5 h-4.5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="flex justify-center items-center gap-2 py-4 px-8 rounded-xl text-white font-extrabold text-sm iocl-gradient-orange shadow-lg hover:shadow-iocl-orange/20 hover:brightness-110 active:brightness-95 transition-all"
                    >
                      Register B2B Company
                      <ArrowRight className="w-4.5 h-4.5" />
                    </Link>
                    <Link
                      href="/login"
                      className="flex justify-center items-center gap-2 py-4 px-8 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-extrabold text-sm transition-all"
                    >
                      Existing Member 
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-4 text-sm text-amber-200 font-medium max-w-xl leading-relaxed">
                This platform is currently in <strong>BETA</strong>. Some workflows are in testing mode and seeded access is recommended.
              </p>
              <div className="pt-8 border-t border-slate-900/60 grid grid-cols-3 gap-6 max-w-md">
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Digital Compliance</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">24/7</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Tracking</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Swift</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Officer Assignment</div>
                </div>
              </div>
            </div>

            {/* Right Hero Column - Visual Component Representation */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-iocl-blue/10 to-iocl-orange/10 rounded-[2.5rem] blur-2xl -z-10"></div>
              
              <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative">
                <div className="flex justify-between items-center pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-iocl-orange/10 flex items-center justify-center text-iocl-orange">
                      <Building2 className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Portal Preview</div>
                      <div className="text-sm font-black text-white">B2B Partner Intake</div>
                    </div>
                  </div>
                  <Link
                    href="#help-center"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-iocl-orange/10 border border-iocl-orange/20 text-iocl-orange hover:bg-iocl-orange/15 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-iocl-orange animate-ping"></span>
                    Help Center
                  </Link>
                </div>

                <div className="space-y-4 pt-6">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40">
                    <div className="w-8 h-8 rounded-lg bg-iocl-blue/10 flex items-center justify-center text-iocl-blue shrink-0">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Product Availability</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">High Speed Diesel (HSD), LDO, Bitumen</div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Secure Data Vault</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Automated Zod format parsing & file sanity checks</div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Real-Time Verification Queue</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Direct assignment to registered Regional Sales Officers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Onboarding Steps Visual Grid */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,84,166,0.05),transparent_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-black text-iocl-orange uppercase tracking-widest">Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Seamless Onboarding Pipeline</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-lg mx-auto">Swift verification pipelines ensure industrial partners transition from draft registration to active procurement without bottlenecks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-slate-700/60 transition-all group hover:translate-y-[-4px] duration-300">
              <div className="w-12 h-12 rounded-2xl bg-iocl-blue/10 flex items-center justify-center text-iocl-blue mb-5 group-hover:bg-iocl-blue group-hover:text-white transition-all">
                <ClipboardList className="w-5.5 h-5.5" />
              </div>
              <div className="text-xs font-black text-iocl-orange uppercase tracking-wider mb-1">Step 01</div>
              <h3 className="font-extrabold text-base text-white mb-2">Corporate Profile</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">Enter secure B2B entity profiles including verified GSTIN, PAN, and corporate address.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-slate-700/60 transition-all group hover:translate-y-[-4px] duration-300">
              <div className="w-12 h-12 rounded-2xl bg-iocl-blue/10 flex items-center justify-center text-iocl-blue mb-5 group-hover:bg-iocl-blue group-hover:text-white transition-all">
                <Layers className="w-5.5 h-5.5" />
              </div>
              <div className="text-xs font-black text-iocl-orange uppercase tracking-wider mb-1">Step 02</div>
              <h3 className="font-extrabold text-base text-white mb-2">Requirements</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">Specify exact energy products (HSD, LDO, Bitumen), volume expectations, and depot locations.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-slate-700/60 transition-all group hover:translate-y-[-4px] duration-300">
              <div className="w-12 h-12 rounded-2xl bg-iocl-blue/10 flex items-center justify-center text-iocl-blue mb-5 group-hover:bg-iocl-blue group-hover:text-white transition-all">
                <FileCheck className="w-5.5 h-5.5" />
              </div>
              <div className="text-xs font-black text-iocl-orange uppercase tracking-wider mb-1">Step 03</div>
              <h3 className="font-extrabold text-base text-white mb-2">Compliance Vault</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">Upload required scanned authorization certificates directly with instant file type validation checks.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-slate-700/60 transition-all group hover:translate-y-[-4px] duration-300">
              <div className="w-12 h-12 rounded-2xl bg-iocl-blue/10 flex items-center justify-center text-iocl-blue mb-5 group-hover:bg-iocl-blue group-hover:text-white transition-all">
                <CheckCircle className="w-5.5 h-5.5" />
              </div>
              <div className="text-xs font-black text-iocl-orange uppercase tracking-wider mb-1">Step 04</div>
              <h3 className="font-extrabold text-base text-white mb-2">Officer Deal Lock</h3>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">Track officer inspection notes, update correction requests instantly, and lock final dealership status.</p>
            </div>
          </div>
        </div>
      </section>

     

      {/* Featured Products Showcase Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="text-xs font-black text-iocl-orange uppercase tracking-widest">Enterprise Support</div>
            <h2 className="text-3xl font-extrabold text-white">Engineered For Multi-Product Scale</h2>
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              Whether refueling massive freight logistics hubs or sourcing raw bituminous binder materials for road networks, EasyOil provides standardized B2B solutions.
            </p>
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <Zap className="w-4.5 h-4.5 text-iocl-orange shrink-0" />
                <span>Standardized pricing & volume contract locks</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <MapPin className="w-4.5 h-4.5 text-iocl-orange shrink-0" />
                <span>Geographic routing to nearest EasyOil depot</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">

  
            {/* Product Card 1 */}
            <CarouselCard startIndex={0}>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-extrabold backdrop-blur-sm">HSD</div>
              <h4 className="font-extrabold text-base text-white drop-shadow-lg">High Speed Diesel</h4>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed drop-shadow">For generators, heavy freight transportation, and corporate locomotive fleets.</p>
            </CarouselCard>

            {/* Product Card 2 */}
            <CarouselCard startIndex={1}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-extrabold backdrop-blur-sm">LDO</div>
              <h4 className="font-extrabold text-base text-white drop-shadow-lg">Light Diesel Oil</h4>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed drop-shadow">Ideal fuel resource for industrial furnaces, boilers, and thermal heating equipment.</p>
            </CarouselCard>

            {/* Product Card 3 */}
            <CarouselCard startIndex={2}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold backdrop-blur-sm">BIT</div>
              <h4 className="font-extrabold text-base text-white drop-shadow-lg">Bitumen & Asphalts</h4>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed drop-shadow">Supreme quality binder for airport runways, highways, and infrastructure builds.</p>
            </CarouselCard>
          </div>

          <div className="lg:col-span-12 mt-10 rounded-[2.5rem] border border-orange-400/20 bg-gradient-to-br from-slate-950/95 via-slate-950/85 to-slate-950/75 p-6 shadow-[0_30px_90px_rgba(249,115,22,0.14)] backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.15),transparent_30%)]" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-orange-500/5 to-transparent" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="text-xs font-black text-iocl-orange uppercase tracking-widest mb-3">Support</div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Indian Oil</div>
                <p className="mt-3 text-sm text-slate-400 max-w-xl leading-relaxed">
                  Primary fueling partner for enterprise-grade procurement, backed by verified supply channels and seamless corporate intake.
                </p>
              </div>
              {/* <div className="flex flex-wrap gap-3">
                {[''].map((partner) => (
                  <span
                    key={partner}
                    className="rounded-full border border-orange-400/20 bg-slate-900/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 shadow-[0_0_30px_rgba(249,115,22,0.08)]"
                  >
                    {partner}
                  </span>
                ))}
              </div> */}
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="rounded-3xl border border-orange-400/15 bg-slate-900/75 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-iocl-orange font-black mb-2">Verified Supply</div>
                <p className="leading-relaxed">End-to-end vetting with regional sales officers for secure large-volume delivery.</p>
              </div>
              <div className="rounded-3xl border border-orange-400/15 bg-slate-900/75 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-iocl-orange font-black mb-2">Brand Network</div>
                <p className="leading-relaxed">Trusted by leading fuel players while Indian Oil remains the current active provider.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
       {/* Help & Requests Section */}
      <section id="help-center" className="py-16 bg-slate-950/60 border-y border-slate-900  mb-20 py-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <div className="text-xs font-black text-iocl-orange uppercase tracking-widest">Support Hub</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Help Center for questions, complaints, and requests</h2>
            <p className="text-slate-400 text-sm font-semibold leading-relaxed">
              A simple, lightweight place to raise a question, submit a complaint, or request help with onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-3xl border border-iocl-orange/20 bg-slate-900/85 p-6 text-center shadow-[0_20px_80px_rgba(249,115,22,0.12)]">
              <div className="text-xs uppercase tracking-[0.24em] text-iocl-orange font-bold mb-4">Question</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Find fast answers and clarifications for common onboarding topics.
              </p>
            </div>
            <div className="rounded-3xl border border-iocl-orange/20 bg-slate-900/85 p-6 text-center shadow-[0_20px_80px_rgba(249,115,22,0.12)]">
              <div className="text-xs uppercase tracking-[0.24em] text-iocl-orange font-bold mb-4">Complaint</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Report an issue or submit a complaint with a single click for quick follow-up.
              </p>
            </div>
            <div className="rounded-3xl border border-iocl-orange/20 bg-slate-900/85 p-6 text-center shadow-[0_20px_80px_rgba(249,115,22,0.12)]">
              <div className="text-xs uppercase tracking-[0.24em] text-iocl-orange font-bold mb-4">Request</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ask for support on documentation, officer assignment, or fuel procurement next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
