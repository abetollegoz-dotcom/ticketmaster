"use client";
import { useState, useEffect } from "react";
import { QrCode, Scan, ShieldCheck, XCircle, Info, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock scan function for now since we can't easily access the camera in this env
  const handleScan = async () => {
    const qrCode = prompt("Enter QR Code Payload (for testing):");
    if (!qrCode) return;

    setLoading(true);
    try {
      const res = await fetch("/api/scanner/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode })
      });
      const data = await res.json();
      setResult(data.data || { valid: false, reason: data.error });
    } catch (err) {
      toast.error("Scan failed", "Check connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080812] text-white flex flex-col">
      <header className="p-4 border-b border-white/5 flex items-center gap-4 glass sticky top-0 z-10">
        <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-bold">Staff Scanner Portal</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {!result ? (
          <>
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-64 h-64 border-2 border-indigo-500/50 rounded-3xl flex items-center justify-center bg-indigo-500/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent animate-pulse" />
              <QrCode className="w-32 h-32 text-indigo-400 opacity-50" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
            </motion.div>

            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Ready to Scan</h2>
              <p className="text-sm text-secondary mb-8">Position the ticket QR code within the frame</p>
              <button 
                onClick={handleScan}
                disabled={loading}
                className="btn-primary py-4 px-12 rounded-2xl text-lg gap-3 shadow-xl shadow-indigo-500/30"
              >
                {loading ? "Validating..." : <><Scan className="w-6 h-6" /> Start Scanner</>}
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md card p-8 text-center ${result.valid ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${result.valid ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
              {result.valid ? <ShieldCheck className="w-12 h-12 text-emerald-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${result.valid ? "text-emerald-400" : "text-red-400"}`}>
              {result.valid ? "Access Granted" : "Access Denied"}
            </h2>
            <p className="text-secondary mb-8">{result.valid ? "Ticket verified successfully" : result.reason}</p>

            {result.ticket && (
              <div className="flex flex-col gap-3 text-left bg-black/20 p-6 rounded-2xl mb-8">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted text-xs uppercase tracking-wider">Event</span>
                  <span className="text-sm font-bold">{result.ticket.event}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted text-xs uppercase tracking-wider">Holder</span>
                  <span className="text-sm font-bold">{result.ticket.holderName}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-muted text-xs uppercase tracking-wider">Tier</span>
                  <span className="text-sm font-bold text-indigo-400">{result.ticket.ticketType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-xs uppercase tracking-wider">Ticket #</span>
                  <span className="text-sm font-mono">{result.ticket.ticketNumber}</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => setResult(null)}
              className="btn-ghost w-full py-4 text-lg"
            >
              Scan Next Ticket
            </button>
          </motion.div>
        )}
      </main>

      <footer className="p-6 text-center border-t border-white/5">
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <Info className="w-3 h-3" />
          Scanner active at Entrance A
        </div>
      </footer>
    </div>
  );
}
