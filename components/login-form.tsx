"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Bot, Eye, EyeOff, FileStack, GraduationCap, LockKeyhole, Rocket, ShieldCheck, Sparkles } from "lucide-react";

const previewCards = [
  { title: "Academic Tracker", body: "Subject-wise files, notes, progress, and exam proof.", icon: GraduationCap },
  { title: "Certificate Vault", body: "Upload, preview, edit, sort, and download certificates.", icon: FileStack },
  { title: "AI Automation Notes", body: "Store workflows, prompts, bots, and client automation proof.", icon: Bot },
  { title: "3-Year Roadmap", body: "CGPA, IELTS, DevOps, portfolio, debate, Rover, contest.", icon: Rocket },
];

export function LoginForm() {
  const [username, setUsername] = useState("myplan");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("myplan.rememberedUsername");
    if (stored) setUsername(stored);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    if (remember) localStorage.setItem("myplan.rememberedUsername", username);
    else localStorage.removeItem("myplan.rememberedUsername");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error || "Login failed. Check your credentials and production env file.");
      setLoading(false);
      return;
    }
    window.location.href = "/welcome";
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white">
      <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-[-15%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100">
            <Sparkles className="h-4 w-4" /> Private Admin Access
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            My Plan Project
            <span className="block bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-transparent">3-Year Career & Study OS</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Track academic journey, skills, certificates, documents, projects, notes, and abroad preparation in one secure dashboard.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {previewCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200"><Icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 text-lg font-black">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        <section className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.075] shadow-2xl shadow-cyan-950/50 backdrop-blur-2xl">
          <div className="border-b border-white/10 bg-gradient-to-r from-cyan-400/15 via-blue-500/10 to-emerald-400/15 p-7">
            <div className="mb-4 inline-flex rounded-2xl bg-cyan-400/15 p-3 text-cyan-200 ring-1 ring-cyan-300/25">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Admin Login</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Secure entry to your private roadmap, certificate vault, notes, and upload system.</p>
          </div>

          <form onSubmit={submit} className="space-y-4 p-7">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Username</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none ring-cyan-400/25 transition placeholder:text-slate-500 focus:ring-4" placeholder="myplan" autoComplete="username" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Password</span>
              <div className="mt-2 flex rounded-2xl border border-white/10 bg-slate-950/60 ring-cyan-400/25 transition focus-within:ring-4">
                <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" type={showPassword ? "text" : "password"} placeholder="Enter admin password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4 text-slate-300">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-950" /> Remember username
            </label>

            {error ? <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">{error}</div> : null}

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              <ShieldCheck className="h-4 w-4" /> {loading ? "Checking..." : "Login to Private OS"} <ArrowRight className="h-4 w-4" />
            </button>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-xs leading-5 text-slate-400">
              Security note: credentials come from production environment variables. Never push passwords or database URLs to GitHub.
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
