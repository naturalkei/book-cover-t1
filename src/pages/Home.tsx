import { ArrowRight, CheckCircle2, Github, Zap } from 'lucide-react'

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-blue-200 hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-blue-50">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-slate-950 px-6 py-24 text-center text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2000&q=80"
            alt="Coding Background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 flex justify-center">
            <span className="rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur-sm">
              v1.0.0 Public Release
            </span>
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl">
            Build Faster with <br />
            <span className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Modern Stack
            </span>
          </h1>
          <p className="mb-8 text-lg text-slate-300 sm:text-xl">
            React 19, Vite 7, Tailwind 4, and ESLint 9. <br className="hidden sm:block" />
            Pure productivity.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="group flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 font-bold transition hover:bg-blue-500">
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a href="https://medium.nkcroft.com/%EC%9D%B4%EB%A0%87%EA%B2%8C-%EC%8B%9C%EC%9E%91%ED%95%98%EC%84%B8%EC%9A%94-react-19-vite-7-%EC%B5%9C%EC%A0%81%EC%9D%98-spa-%EC%8A%A4%ED%83%9D-17cda4841e2d"
              target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 font-semibold backdrop-blur-sm transition hover:bg-white/10">
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Zap className="text-amber-500" />}
            title="Lightning Fast"
            desc="Vite 7 ensures instant server start and HMR, keeping your flow uninterrupted."
          />
          <FeatureCard
            icon={<CheckCircle2 className="text-blue-500" />}
            title="Type Safe"
            desc="Full TypeScript support with strict config and separated app/node environments."
          />
          <FeatureCard
            icon={<Github className="text-slate-900" />}
            title="Open Source Ready"
            desc="Includes GitHub Actions for automated deployment and issue templates."
          />
        </div>
      </section>
    </div>
  )
}
