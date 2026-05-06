"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome, Check } from "lucide-react";
import { toast } from "@/components/ui/toaster";

const PERKS = ["Free to join", "Instant digital tickets", "Secure QR codes", "24/7 support"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password too short", "Must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error("Registration failed", data.error); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      toast.success("Account created! Welcome 🎉");
      router.push("/dashboard");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{ background: "var(--bg-base)" }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", filter: "blur(80px)" }} />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left — perks */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="hidden md:block">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800 }} className="text-xl gradient-text">EventHub Pro</span>
          </Link>
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-bold mb-4">Join millions of event lovers</h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Create your free account and start discovering amazing events near you.</p>
          <div className="flex flex-col gap-3">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — form */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="text-center mb-6 md:hidden">
            <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold">Create Account</h1>
          </div>

          <div className="card p-8">
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold mb-6 hidden md:block">Create your account</h2>

            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn-ghost w-full mb-5 py-3 gap-3">
              <Chrome className="w-5 h-5" /> Continue with Google
            </button>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>or with email</span>
              <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="name">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: "var(--text-muted)" }} />
                  <input id="name" value={form.name} onChange={update("name")} placeholder="Jane Smith" className="pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="reg-email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: "var(--text-muted)" }} />
                  <input id="reg-email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="reg-password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: "var(--text-muted)" }} />
                  <input id="reg-password" type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Min 8 characters" className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
                {loading ? "Creating account…" : <><span>Create Free Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-indigo-400 hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
            </p>
            <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
