"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Sign in failed", res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4" style={{ background: "var(--bg-base)" }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(80px)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800 }} className="text-xl gradient-text">EventHub Pro</span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-2">Welcome back</h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm">Sign in to your account to continue</p>
        </div>

        <div className="card p-8">
          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading} className="btn-ghost w-full mb-6 py-3 gap-3">
            <ShieldCheck className="w-5 h-5" />
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: "var(--text-muted)" }} />
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <Link href="/auth/forgot-password" className="text-xs hover:text-indigo-400 transition-colors" style={{ color: "var(--text-muted)" }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: "var(--text-muted)" }} />
                <input id="password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
