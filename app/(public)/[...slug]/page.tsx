import { ShieldCheck, Info, FileText, HelpCircle, Mail } from "lucide-react";

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join("/");
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  return (
    <div className="container py-32 max-w-4xl">
      <div className="card p-12 relative overflow-hidden">
        {/* Abstract background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8">
            {slug.includes("privacy") || slug.includes("terms") ? (
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            ) : slug.includes("help") || slug.includes("contact") ? (
              <HelpCircle className="w-8 h-8 text-indigo-400" />
            ) : (
              <Info className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-6">{title}</h1>
          
          <div className="prose prose-invert prose-indigo max-w-none">
            <p className="text-secondary text-lg leading-relaxed mb-8">
              Welcome to the {title} page. We are currently updating our documentation to provide you with the most accurate and up-to-date information regarding EventHub Pro.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Latest Updates
                </h3>
                <p className="text-sm text-muted">Our team is working on detailed content for this section. Please check back shortly.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" /> Need Help?
                </h3>
                <p className="text-sm text-muted">If you have urgent questions, contact our support team at <a href="mailto:support@eventhubpro.com" className="text-indigo-400 hover:underline">support@eventhubpro.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
