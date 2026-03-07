import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Target, TrendingUp, Zap, ChevronRight, BarChart3, ShieldCheck, Code2, Layers, Type, Palette, Move, FileCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollVelocity from '../components/ScrollVelocity';
import TextType from '../components/TextType';
import LogoLoop from '../components/LogoLoop';

const techLogos = [
  { node: <Code2 className="w-10 h-10 text-emerald-400" />, title: "React", href: "https://react.dev" },
  { node: <Layers className="w-10 h-10 text-emerald-400" />, title: "Next.js", href: "https://nextjs.org" },
  { node: <Type className="w-10 h-10 text-emerald-400" />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <Palette className="w-10 h-10 text-emerald-400" />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <Move className="w-10 h-10 text-emerald-400" />, title: "Framer Motion", href: "https://www.framer.com/motion/" },
  { node: <FileCode className="w-10 h-10 text-emerald-400" />, title: "Python", href: "https://www.python.org/" },
];

// Simple Intersection Observer hook for scroll animations
function useInView(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Animate only once
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ─── AnimatedReveal ────────────────────────────────────────────────
function AnimatedReveal({
  children,
  delay = 0,
  className = "",
  direction = "up"
}) {
  const { ref, isVisible } = useInView(0.1);

  const translateClass = 
    direction === "up" ? "translate-y-12" : 
    direction === "left" ? "-translate-x-12" : "translate-x-12";

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className} ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0"
          : `opacity-0 ${translateClass}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-gray-100 selection:bg-emerald-500/30 overflow-x-hidden">

      {/* --- Ambient Mesh Gradients --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-teal-500/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full">
        {/* --- Header / Nav --- */}
        <header className="px-6 py-6 w-full max-w-7xl mx-auto flex justify-between items-center opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-xl tracking-tight text-white">Impact Metric</span>
          </div>
          <Link to="/leaderboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Go to App
          </Link>
        </header>

        {/* --- Hero Section --- */}
        <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <AnimatedReveal delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-emerald-400 mb-8 backdrop-blur-md">
              <Zap className="w-4 h-4" />
              <span>The Next Generation of Cricket Analytics</span>
            </div>
          </AnimatedReveal>
          
          <AnimatedReveal delay={150}>
            <div className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 min-h-[140px] md:min-h-[200px]">
              <TextType 
                text={["Beyond the Averages.", "Measure True Impact."]}
                typingSpeed={50}
                pauseDuration={2500}
                deletingSpeed={30}
                showCursor={true}
                cursorCharacter="|"
                className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500"
                textColors={['transparent', 'transparent']}
              />
            </div>
          </AnimatedReveal>

          <AnimatedReveal delay={300}>
            <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Traditional stats lie. A 50 off 40 balls in the powerplay is not the same as a 50 off 40 chasing 200. We quantify <strong className="text-gray-200">Context</strong> and <strong className="text-gray-200">Pressure</strong> to reveal who actually wins matches.
            </p>
          </AnimatedReveal>

          <AnimatedReveal delay={450}>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <Link 
                to="/leaderboard" 
                className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] flex items-center gap-3"
              >
                <span className="relative z-10">Explore Global Leaderboard</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedReveal>
        </section>

        {/* --- Why Impact Matters Section --- */}
        <section className="py-24 px-6 relative border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <AnimatedReveal delay={0}>
              <div className="text-center mb-20 min-h-[100px]">
                <TextType 
                  as="h2"
                  text={["Why traditional stats are flawed.", "Why averages don't win matches.", "Why you need Context & Pressure."]}
                  typingSpeed={40}
                  pauseDuration={3000}
                  deletingSpeed={30}
                  showCursor={true}
                  className="text-3xl md:text-5xl font-extrabold mb-6"
                />
                <p className="text-gray-400 text-xl max-w-2xl mx-auto mt-4">In modern T20 cricket, all runs and wickets are not created equal. Our 3-layer architecture fixes the bias.</p>
              </div>
            </AnimatedReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <AnimatedReveal delay={100} direction="up">
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] hover:bg-white/[0.04] transition-colors duration-500 group h-full">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Target className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">1. Raw Performance</h3>
                  <p className="text-gray-400 leading-relaxed">
                    We start with the fundamentals. For batters: runs, strike rate, boundaries, and dot ball penalties. For bowlers: wickets, economy rate, and dot balls.
                  </p>
                </div>
              </AnimatedReveal>

              {/* Feature 2 */}
              <AnimatedReveal delay={250} direction="up">
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] hover:bg-white/[0.04] transition-colors duration-500 group h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-8 border border-teal-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <BarChart3 className="w-7 h-7 text-teal-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">2. Match Context</h3>
                  <p className="text-gray-400 leading-relaxed relative z-10">
                    A wicket in the death overs or runs scored in the powerplay have drastically different values. We multiply raw performance by the phase of the game.
                  </p>
                </div>
              </AnimatedReveal>

              {/* Feature 3 */}
              <AnimatedReveal delay={400} direction="up">
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] hover:bg-white/[0.04] transition-colors duration-500 group h-full relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-8 border border-amber-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <TrendingUp className="w-7 h-7 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">3. Pressure Index</h3>
                  <p className="text-gray-400 leading-relaxed relative z-10">
                    The ultimate differentiator. Hitting runs when the required rate is 12+ or taking wickets while defending a low total multiplies the impact exponentially.
                  </p>
                </div>
              </AnimatedReveal>
            </div>
          </div>
        </section>

        {/* --- Machine Learning Section --- */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <AnimatedReveal delay={0}>
              <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-10 md:p-16 rounded-[3rem] overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-12 text-left">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
                
                <div className="flex-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400 mb-6 uppercase tracking-wider w-fit">
                    <ShieldCheck className="w-4 h-4" /> Powering the Engine
                  </div>
                  <div className="min-h-[120px]">
                    <TextType
                      as="h2"
                      text={["Trained on over 10,000+ Matches.", "Analyzed 1.1 million deliveries.", "Calculated ball-by-ball WPA."]}
                      typingSpeed={40}
                      pauseDuration={3000}
                      deletingSpeed={30}
                      className="text-3xl md:text-5xl font-extrabold mb-6"
                    />
                  </div>
                  <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8">
                    Our model analyzes 1.1 million individual deliveries across men's and women's T20 Internationals. We calculate ball-by-ball Win Probability Added (WPA) to ensure the impact score reflects actual contributions to winning.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      "Gradient Boosting Classifier for Win Probability",
                      "Calculates Delta WPA per delivery",
                      "Recency-weighted 10-innings rolling average",
                      "Normalized globally on a 0-100 scale"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/leaderboard" className="text-white font-semibold hover:text-violet-400 transition-colors flex items-center gap-2 w-fit">
                    See the results <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex-1 w-full relative z-10">
                  <div className="bg-black/50 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-700">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                      <div>
                        <div className="text-sm text-gray-400 mb-1 font-sans">Impact = </div>
                        <div className="text-2xl font-mono text-emerald-400 font-bold tracking-tight">Perf × Context × Pressure</div>
                      </div>
                      <Trophy className="w-8 h-8 text-white/20" />
                    </div>
                    <div className="space-y-4 hidden sm:block">
                      {['Player 1', 'Player 2', 'Player 3'].map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-gray-500 font-mono text-sm">0{i+1}</div>
                            <div className="w-8 h-8 rounded-full bg-gray-800" />
                            <div className="w-24 h-4 bg-gray-800 rounded animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                          </div>
                          <div className="w-12 h-6 bg-gray-800 rounded animate-pulse" style={{ animationDelay: `${i * 200 + 100}ms` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </section>

        {/* --- Scroll Velocity Marquee --- */}
        <section className="py-12 border-t border-white/5 opacity-80 overflow-hidden relative z-0">
          <ScrollVelocity
            texts={['CRICHEROS', 'NEIL A', 'BINGHAMPTON UNIVERSITY']} 
            velocity={50}
            className="custom-scroll-text"
          />
          <div className="mt-12 h-[80px] relative overflow-hidden flex items-center max-w-5xl mx-auto">
            <LogoLoop
              logos={techLogos}
              speed={60}
              direction="left"
              logoHeight={40}
              gap={60}
              hoverSpeed={0}
              scaleOnHover={true}
              fadeOut={true}
              fadeOutColor="transparent"
              ariaLabel="Technology Stack"
            />
          </div>
        </section>

        {/* --- Footer --- */}
        <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Cricket Impact Metric. Built for the modern game.</p>
        </footer>

      </div>
    </main>
  );
}
