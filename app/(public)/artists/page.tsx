import { Music, ArrowRight, User } from "lucide-react";
import Link from "next/link";

export default function ArtistsPage() {
  return (
    <div className="container py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-8">
          <Music className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Artists & Performers</h1>
        <p className="text-secondary text-lg mb-12">We are currently integrating our comprehensive artist database. Soon you'll be able to follow your favorite performers and get notified of their upcoming shows.</p>
        
        <Link href="/events" className="btn-primary py-4 px-10 inline-flex items-center gap-2">
          Browse All Shows <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
