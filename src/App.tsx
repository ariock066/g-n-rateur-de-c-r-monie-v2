import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Download, 
  Sparkles, 
  RefreshCw,
  Settings
} from "lucide-react";
import MarkdownRenderer, { parseMarkdownToHtmlForWord } from "./components/MarkdownRenderer";

// Liturgical and pedagogical quotes to display during generation
const LITURGICAL_QUOTES = [
  {
    text: "« Là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux. »",
    author: "Matthieu 18, 20"
  },
  {
    text: "« Éduquer, c'est conduire dehors, faire grandir, ouvrir à la transcendance. »",
    author: "Pédagogie Chrétienne"
  },
  {
    text: "Conseil : Aménagez le coin prière avec une Bible ouverte, une bougie et une nappe de la couleur du temps liturgique.",
    author: "Guide pratique"
  },
  {
    text: "« L'éducation est l'art d'aider l'âme à se tourner vers la lumière. »",
    author: "Inspiré de Platon"
  },
  {
    text: "Conseil : Confiez des rôles actifs aux élèves (lectures, intentions, gestes symboliques) pour favoriser l'implication de tous.",
    author: "Conseil d'animation"
  },
  {
    text: "Conseil : Prévoyez de vrais temps de silence, même courts (30 à 60 secondes), après la Parole pour laisser résonner le texte.",
    author: "Sagesse monastique"
  }
];

export default function App() {
  // App states
  const [theme, setTheme] = useState("Fin d'année scolaire");
  const [niveau, setNiveau] = useState("Élémentaire Cycle 3 (CM1 - CM2)");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState("");
  const [error, setError] = useState("");
  
  // UI States
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Cycle quotes during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % LITURGICAL_QUOTES.length);
      }, 4500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Determine active theme string and level string
  const activeTheme = theme;
  const activeNiveau = niveau;

  // Handle generation action
  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError("Veuillez saisir un thème pour la célébration.");
      return;
    }
    if (!niveau.trim()) {
      setError("Veuillez saisir un public / niveau.");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult("");
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: theme.trim(), niveau: niveau.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la génération.");
      }

      setGeneratedResult(data.result);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Export to Microsoft Word (.doc format - highly compatible with LibreOffice/Word/Google Docs)
  const handleExportWord = () => {
    if (!generatedResult) return;

    const wordTheme = activeTheme;
    const wordNiveau = activeNiveau;

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Célébration - ${wordTheme}</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #2a2a2a; padding: 40px; background-color: #fcfaf7; }
    h1 { color: #1a1a1a; font-family: Georgia, serif; font-size: 22pt; font-weight: normal; margin-bottom: 5px; text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; }
    .subtitle { color: #991b1b; font-size: 13pt; font-style: italic; text-align: center; margin-bottom: 30px; font-family: Georgia, serif; }
    h2 { color: #1a1a1a; font-family: Georgia, serif; font-size: 15pt; font-weight: bold; font-style: italic; margin-top: 25px; border-bottom: 1px solid #e5e5e5; padding-bottom: 5px; }
    h3 { color: #991b1b; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 15px; border-left: 3px solid #991b1b; padding-left: 10px; }
    p { margin-bottom: 10px; font-size: 11pt; font-family: Georgia, serif; }
    ul { margin-bottom: 15px; padding-left: 20px; }
    li { margin-bottom: 5px; font-size: 11pt; font-family: Georgia, serif; }
    blockquote { margin: 15px 0; padding: 12px 18px; border-left: 4px solid #991b1b; background-color: #f9f6f0; color: #2a2a2a; font-style: italic; font-family: Georgia, serif; }
    .footer { font-size: 9pt; color: #64748B; text-align: center; margin-top: 50px; border-top: 1px solid #E2E8F0; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>CÉLÉBRATION SCOLAIRE</h1>
  <div class="subtitle">Thème : ${wordTheme} — Public : ${wordNiveau}</div>
  <hr style="border: 0; border-top: 1px solid #e5e5e5; margin-bottom: 20px;">
  
  ${parseMarkdownToHtmlForWord(generatedResult)}
  
  <div class="footer">Document généré par l'Assistant de Célébration Liturgique • Direction de l'Enseignement Catholique</div>
</body>
</html>`;

    const blob = new Blob(["\ufeff" + header], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Celebration_${wordTheme.replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="bg-[#fcfaf7] text-[#1a1a1a] min-h-screen font-sans flex flex-col">
      
      {/* Upper Navigation Bar */}
      <header className="bg-[#fcfaf7] border-b border-[#1a1a1a]/10 sticky top-0 z-50 shadow-sm px-6 py-6 sm:px-10 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[#1a1a1a] text-[#fcfaf7] p-2.5 rounded-sm shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold opacity-60 mb-1">Éducation Catholique • Service de Liturgie</p>
              <h1 className="text-3xl sm:text-4xl font-light font-display leading-none text-[#1a1a1a] tracking-tight">Générateur de Cérémonie</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-10 flex-1 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Setup Controls */}
          <div className="lg:col-span-5 space-y-8 no-print">
            
            {/* Guide & Info Card */}
            <div className="bg-white border border-[#1a1a1a]/10 rounded-sm p-6 shadow-sm flex items-start space-x-4">
              <div className="bg-red-50 text-red-800 p-3 rounded-sm">
                <Sparkles className="w-5 h-5 text-red-800" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-bold uppercase tracking-wider text-xs text-[#1a1a1a]">Outil d'accompagnement pastoral</h3>
                <p className="text-xs text-[#1a1a1a]/70 leading-relaxed font-serif">
                  Cet assistant d'intelligence artificielle est conçu pour aider les prêtres, enseignants et animateurs en pastorale. Il propose des structures liturgiques complètes et unifiées, respectant la tradition de l'Enseignement Catholique.
                </p>
              </div>
            </div>

            {/* Form controls */}
            <div className="bg-white rounded-sm shadow-md border border-[#1a1a1a]/10 p-8 space-y-8">
              <h2 className="text-xs uppercase tracking-[0.2em] font-sans font-black opacity-80 text-[#1a1a1a] border-b border-[#1a1a1a]/10 pb-4 flex items-center space-x-2">
                <Settings className="w-4 h-4 text-[#1a1a1a]" />
                <span>Paramètres de Célébration</span>
              </h2>

              {/* Theme input */}
              <div className="space-y-2 border-b border-[#1a1a1a]/20 pb-4">
                <label className="block text-[11px] uppercase tracking-widest font-sans text-red-800 font-bold">
                  Thème ou fête liturgique
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fin d'année, Rentrée, Avent et Noël, Pardon..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-transparent py-2 focus:border-red-800 outline-none font-serif text-lg italic text-[#1a1a1a] border-b border-[#1a1a1a]/10"
                />
              </div>

              {/* Class/Level input */}
              <div className="space-y-2 border-b border-[#1a1a1a]/20 pb-4">
                <label className="block text-[11px] uppercase tracking-widest font-sans text-red-800 font-bold">
                  Public / Niveau de classe
                </label>
                <input
                  type="text"
                  placeholder="Ex: CM1-CM2, Collège, Maternelle, Toute l'école..."
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                  className="w-full bg-transparent py-2 focus:border-red-800 outline-none font-serif text-lg italic text-[#1a1a1a] border-b border-[#1a1a1a]/10"
                />
              </div>

              {/* Generate button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-[#1a1a1a] hover:bg-red-900 disabled:bg-slate-300 text-white font-sans text-xs uppercase tracking-widest font-bold py-4 px-6 rounded-sm transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Création du déroulé...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Générer le déroulé</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700 font-sans">
                  {error}
                </div>
              )}
            </div>

            {/* Liturgical Prompt Display */}
            <div className="bg-white/50 border border-[#1a1a1a]/10 p-6 rounded-sm">
              <p className="text-[11px] leading-relaxed font-sans text-[#1a1a1a]/70 italic">
                "Agis comme un expert en liturgie et en pédagogie chrétienne pour une école privée catholique..."
              </p>
              <p className="mt-3 text-[10px] uppercase font-sans tracking-widest font-bold text-red-800">Prompt Expert de l'Enseignement Catholique Activé</p>
            </div>
          </div>

          {/* RIGHT: Document Preview / Celebration output */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* If generating - display inspiring quote and animated visual progress */}
            {isGenerating && (
              <div className="bg-[#f0ede8] rounded-sm p-8 sm:p-12 text-center space-y-8 max-w-xl mx-auto no-print">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-[#1a1a1a]/10"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-red-800 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-4 bg-[#fcfaf7] rounded-full flex items-center justify-center shadow-inner">
                    <BookOpen className="w-6 h-6 text-red-800 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-light font-display italic text-[#1a1a1a]">Inspiration pastorale en cours...</h3>
                  <p className="text-xs text-[#1a1a1a]/60 font-sans tracking-wide">L'assistant élabore une célébration structurée, solennelle et chaleureuse.</p>
                </div>

                {/* Animated quote cycling container */}
                <div className="bg-[#fcfaf7] rounded-sm p-6 border border-[#1a1a1a]/10 italic font-serif text-[#1a1a1a] leading-relaxed text-sm relative min-h-[140px] flex flex-col justify-center shadow-md">
                  <span className="absolute -top-3 left-4 bg-red-100 text-red-800 text-[9px] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Sagesse & Méditation
                  </span>
                  <p className="transition-all duration-300">
                    {LITURGICAL_QUOTES[quoteIndex].text}
                  </p>
                  <p className="text-xs font-sans uppercase tracking-widest font-bold text-red-800 mt-3 not-italic">
                    — {LITURGICAL_QUOTES[quoteIndex].author}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state when no celebration generated yet */}
            {!isGenerating && !generatedResult && (
              <div className="bg-[#f0ede8] rounded-sm p-8 sm:p-12 text-center space-y-6 no-print">
                <div className="w-16 h-16 bg-[#fcfaf7] border border-[#1a1a1a]/10 text-red-800 rounded-sm flex items-center justify-center mx-auto shadow-md">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-2xl font-light font-serif text-[#1a1a1a]">Aucun déroulé généré</h3>
                  <p className="text-sm text-[#1a1a1a]/70 font-serif leading-relaxed">
                    Saisissez un thème liturgique et un niveau scolaire dans les paramètres à gauche, puis cliquez sur générer pour obtenir un guide de célébration clés en main.
                  </p>
                </div>
                <div className="border-t border-[#1a1a1a]/10 pt-6 max-w-sm mx-auto flex items-center justify-center space-x-3 text-[10px] uppercase tracking-widest font-sans text-[#1a1a1a]/50 font-bold">
                  <span>Export Word (.doc)</span>
                  <span>•</span>
                  <span>Pédagogie Liturgique</span>
                </div>
              </div>
            )}

            {/* Celebration Results View */}
            {!isGenerating && generatedResult && (
              <div className="space-y-6">
                
                {/* Result header toolbar */}
                <div className="flex flex-wrap gap-3 items-center justify-between bg-white border border-[#1a1a1a]/10 rounded-sm px-6 py-4 shadow-sm no-print">
                  <div className="flex items-center space-x-2 text-xs font-sans tracking-wider text-[#1a1a1a]/60">
                    <span className="bg-red-50 text-red-900 border border-red-200/50 px-2 py-0.5 font-bold uppercase text-[9px] rounded-sm">Thème : {theme}</span>
                    <span>•</span>
                    <span className="font-bold text-[#1a1a1a]">{niveau}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportWord}
                      className="bg-white border border-[#1a1a1a] text-[#1a1a1a] px-4 py-2 font-sans text-[10px] uppercase tracking-widest font-bold hover:bg-[#1a1a1a] hover:text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      title="Télécharger pour Word, LibreOffice, ou Google Docs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Word (.doc)</span>
                    </button>
                  </div>
                </div>

                {/* Printable paper visual container */}
                <div className="bg-white rounded-sm border border-[#1a1a1a]/10 shadow-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden print:border-none print:shadow-none print:p-0">
                  
                  {/* Texture overlay Simulation */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                       style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}></div>
                  
                  <div className="border-[0.5px] border-[#1a1a1a]/20 p-6 sm:p-8">
                    {/* Decorative Header elements (visible on screen & print) */}
                    <header className="text-center mb-10 pb-6 border-b border-[#1a1a1a]/10">
                      <p className="text-[10px] uppercase tracking-[0.3em] font-sans mb-2 text-[#1a1a1a]/60 font-bold">Célébration de la Parole</p>
                      <h2 className="text-3xl italic font-serif text-[#1a1a1a]">{activeTheme}</h2>
                      <p className="text-xs font-sans uppercase tracking-widest text-red-800 font-semibold mt-2">DÉROULÉ LITURGIQUE POUR : {activeNiveau}</p>
                      <div className="h-[1.5px] w-12 bg-red-800 mx-auto mt-4"></div>
                    </header>

                    {/* Rendered markdown celebration content */}
                    <article className="prose prose-red max-w-none">
                      <MarkdownRenderer content={generatedResult} />
                    </article>

                    {/* Print-only Footer element */}
                    <div className="hidden print:block text-center text-[9px] uppercase tracking-widest text-[#1a1a1a]/40 mt-12 border-t border-[#1a1a1a]/10 pt-4">
                      Document de célébration liturgique • Enseignement Catholique Privé.
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Visual Footer */}
      <footer className="border-t border-[#1a1a1a]/10 bg-white/40 flex items-center px-8 py-6 justify-between text-[9px] uppercase tracking-[0.2em] font-sans opacity-60 mt-auto no-print">
        <span>© Direction de l'Enseignement Catholique</span>
        <span>Design Minimaliste • Éditorial Theme v1.9</span>
        <span>Format A4 • 300 DPI</span>
      </footer>
    </div>
  );
}
