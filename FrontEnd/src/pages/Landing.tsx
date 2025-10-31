import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Languages, 
  BookOpen, 
  Sparkles, 
  MessageSquare,
  Lightbulb,
  Volume2,
  Shuffle,
  FileText,
  ArrowRight,
  StickyNote,
  Pause,
  Play,
  Zap,
  Shield,
  Rocket,
  ToggleLeft,
  Cpu,
  Globe,
  Network
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import featureTranslation from "@/assets/feature-translation.jpg";
import featureChat from "@/assets/feature-chat.jpg";
import featureSimplify from "@/assets/feature-simplify.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Languages,
      title: "AI-Powered Translation",
      description: "Instantly translate text to your native language without switching apps",
      image: featureTranslation
    },
    {
      icon: MessageSquare,
      title: "Context-Aware Chat",
      description: "Ask questions about your book and get intelligent, context-aware answers",
      image: featureChat
    },
    {
      icon: Sparkles,
      title: "Smart Simplification",
      description: "Simplify complex text and get instant summaries for better comprehension",
      image: featureSimplify
    }
  ];

  const tools = [
    { icon: Languages, name: "Translation" },
    { icon: Shuffle, name: "Synonyms" },
    { icon: Lightbulb, name: "Explanations" },
    { icon: Volume2, name: "Read Aloud" },
    { icon: BookOpen, name: "Definitions" },
    { icon: FileText, name: "Summaries" },
    { icon: Sparkles, name: "Simplification" },
    { icon: StickyNote, name: "Sticky Notes" },
    { icon: MessageSquare, name: "AI Chat" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              DuoRead
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth?signup=true")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Read Books & Learn Language{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Without Switching Apps
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Not ready to tackle a novel? Think again...
            </p>
            <p className="text-lg text-muted-foreground">
              Your intelligent reading companion powered by Chrome's Gemini Nano AI. Experience <span className="font-semibold text-primary">offline, private, instant</span> processing.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Offline processing - No data leaves your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Private - Your reading data stays on your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Instant results powered by Chrome's built-in Gemini Nano</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate("/auth?signup=true")} className="gap-2 hover-scale">
                Start Reading Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="hover-scale">
                Sign In
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl animate-pulse"></div>
            <img 
              src={heroImage} 
              alt="DuoRead Hero" 
              className="rounded-2xl shadow-[var(--shadow-strong)] w-full relative z-10 hover-scale"
            />
          </div>
        </div>
      </section>

      {/* Dual Mode Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative animate-fade-in order-2 md:order-1">
                {/* Mode Toggle Mockup */}
                <Card className="p-8 bg-card border-2 border-border shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">The Word Alchemist</h3>
                    </div>
                  </div>
                  
                  {/* Toggle Mockup */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">Processing Mode</span>
                    </div>
                    <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-gradient-to-r from-primary/10 to-accent/10">
                      <div className="flex-1 flex items-center justify-center py-2 px-4 rounded-md bg-gradient-to-br from-primary to-primary-glow text-white transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105">
                        <Zap className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold">Offline</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center py-2 px-4 rounded-md bg-transparent text-muted-foreground transition-all duration-300 cursor-pointer hover:bg-muted">
                        <Network className="w-4 h-4 mr-2" />
                        <span className="text-sm font-semibold">Hybrid</span>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">Offline Mode Active</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        All AI processing happens locally in your browser using Chrome's Gemini Nano
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Floating Badges */}
                <div className="absolute -top-6 -right-6 animate-float">
                  <Card className="p-3 bg-gradient-to-r from-primary to-accent text-white shadow-xl border-none">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      <span className="text-sm font-bold">100% Private</span>
                    </div>
                  </Card>
                </div>
                <div className="absolute -bottom-6 -left-6 animate-float" style={{ animationDelay: "0.5s" }}>
                  <Card className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl border-none">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="text-sm font-bold">Lightning Fast</span>
                    </div>
                  </Card>
                </div>
              </div>
              
              <div className="space-y-6 animate-fade-in order-1 md:order-2" style={{ animationDelay: "200ms" }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-full">
                  <ToggleLeft className="w-5 h-5 text-indigo-900 dark:text-indigo-200" />
                  <span className="font-semibold text-indigo-900 dark:text-indigo-200">Smart Processing</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Choose Your{" "}
                  <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Processing Mode
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  DuoRead offers two powerful modes to match your privacy and feature needs. Switch seamlessly between Offline and Hybrid modes.
                </p>
                
                {/* Offline Mode */}
                <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        Offline Mode
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Private</span>
                      </h3>
                      <p className="text-muted-foreground mb-3">Process everything locally in your browser using Chrome's Gemini Nano AI</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">100% private - no data sent to servers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Rocket className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Instant processing with zero latency</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Globe className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Works offline, no internet required</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Hybrid Mode */}
                <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Network className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        Hybrid Mode
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Advanced</span>
                      </h3>
                      <p className="text-muted-foreground mb-3">Access server-powered features including the DuoRead Agent</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Full DuoRead Agent with tool calling</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Advanced Gemini models on the cloud</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Enhanced context understanding</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <div className="pt-2">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth?signup=true")}
                    className="gap-2 hover-scale bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                  >
                    Try Both Modes Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chrome AI Integration Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-900/50 dark:to-orange-900/50 rounded-full mb-6">
                <Cpu className="w-5 h-5 text-amber-900 dark:text-amber-200" />
                <span className="font-semibold text-amber-900 dark:text-amber-200">Chrome Built-in AI</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Powered by{" "}
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Gemini Nano
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                DuoRead leverages Chrome's built-in Gemini Nano AI for offline, private, instant processing
              </p>
            </div>

            {/* API Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Languages,
                  name: "Translator API",
                  desc: "Real-time translation powered by Chrome's native AI",
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "bg-blue-500/10",
                  badge: "Offline"
                },
                {
                  icon: Sparkles,
                  name: "Summarizer API",
                  desc: "Instant summaries with Chrome's built-in summarization",
                  color: "from-purple-500 to-pink-500",
                  bgColor: "bg-purple-500/10",
                  badge: "Offline"
                },
                {
                  icon: FileText,
                  name: "Prompt API",
                  desc: "Advanced text processing with Gemini Nano",
                  color: "from-indigo-500 to-purple-500",
                  bgColor: "bg-indigo-500/10",
                  badge: "Offline"
                },
                {
                  icon: Rocket,
                  name: "Writer API",
                  desc: "Generate explanations with Chrome's writing AI",
                  color: "from-orange-500 to-red-500",
                  bgColor: "bg-orange-500/10",
                  badge: "Offline"
                },
                {
                  icon: Lightbulb,
                  name: "Rewriter API",
                  desc: "Simplify and rephrase text instantly",
                  color: "from-emerald-500 to-teal-500",
                  bgColor: "bg-emerald-500/10",
                  badge: "Offline"
                },
                {
                  icon: Zap,
                  name: "Streaming",
                  desc: "Stream results in real-time as AI generates them",
                  color: "from-amber-500 to-orange-500",
                  bgColor: "bg-amber-500/10",
                  badge: "Instant"
                }
              ].map((api, index) => (
                <Card 
                  key={index} 
                  className="relative group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-scale-in cursor-pointer border-2 hover:border-primary/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${api.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="p-6 relative z-10">
                    {/* Icon */}
                    <div className="relative mb-4">
                      <div className={`absolute inset-0 bg-gradient-to-br ${api.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${api.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <api.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full mb-3 border border-green-200 dark:border-green-800">
                      <Shield className="w-3 h-3" />
                      <span className="text-xs font-semibold">{api.badge}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{api.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">{api.desc}</p>
                    
                    {/* Hover indicator */}
                    <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                      <span className="text-sm font-semibold">Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Decorative corner */}
                  <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${api.color} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                </Card>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: "600ms" }}>
              <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-3xl font-bold">All Powered by Chrome's Native AI</h3>
                  <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Every AI feature in Offline mode runs directly in your browser using Chrome's Gemini Nano. 
                  No cloud processing, no data transmission, just pure, instant AI power.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">100% Private</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full">
                    <Rocket className="w-5 h-5" />
                    <span className="font-semibold">Instant Results</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-full">
                    <Globe className="w-5 h-5" />
                    <span className="font-semibold">Works Offline</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full backdrop-blur-sm border border-primary/30 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">AI-Powered Tools</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Powerful AI Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to read and understand books in any language
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="relative group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 animate-fade-in cursor-pointer border-2 hover:border-primary/50"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500 z-0"></div>
                
                {/* Image Section with Gradient Overlay */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {/* Floating Icon on Image */}
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{feature.description}</p>
                  
                  {/* Animated Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                    <span className="text-sm font-semibold">Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Decorative Corner Element */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Notes Feature Highlight */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-pink-100/20 to-purple-100/20 dark:from-yellow-900/10 dark:via-pink-900/10 dark:to-purple-900/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-200 to-pink-200 dark:from-yellow-900/50 dark:to-pink-900/50 rounded-full">
                  <StickyNote className="w-5 h-5 text-yellow-900 dark:text-yellow-200" />
                  <span className="font-semibold text-yellow-900 dark:text-yellow-200">New Feature</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Save Your Insights with{" "}
                  <span className="bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Colorful Sticky Notes
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Never lose track of important vocabulary, translations, or insights. Create beautiful, color-coded sticky notes directly from any text or AI tool output.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-200 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-900 dark:text-yellow-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Save translations, definitions, and AI explanations instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-200 dark:bg-pink-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-pink-900 dark:text-pink-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Organize notes with 7 vibrant colors for easy categorization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-900 dark:text-purple-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Access all your notes from the library or while reading</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-900 dark:text-blue-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Edit and manage notes anytime with full CRUD operations</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth?signup=true")}
                    className="gap-2 hover-scale bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 hover:from-yellow-600 hover:via-pink-600 hover:to-purple-600"
                  >
                    Try Sticky Notes Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Sticky Note Examples */}
                  <Card className="p-4 bg-yellow-200 border-yellow-400 !text-yellow-900 transform rotate-2 hover:rotate-0 transition-transform duration-300 hover:shadow-xl cursor-pointer font-caveat">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase">Translation</span>
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium mb-1">serendipity</p>
                    <p className="text-xs opacity-80">The occurrence of events by chance in a happy way</p>
                  </Card>
                  <Card className="p-4 bg-blue-200 border-blue-400 !text-blue-900 transform -rotate-1 hover:rotate-0 transition-transform duration-300 hover:shadow-xl cursor-pointer font-caveat mt-8">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase">Definition</span>
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium mb-1">ephemeral</p>
                    <p className="text-xs opacity-80">Lasting for a very short time</p>
                  </Card>
                  <Card className="p-4 bg-pink-200 border-pink-400 !text-pink-900 transform -rotate-2 hover:rotate-0 transition-transform duration-300 hover:shadow-xl cursor-pointer font-caveat">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase">Synonym</span>
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium mb-1">eloquent</p>
                    <p className="text-xs opacity-80">articulate, expressive, fluent, persuasive</p>
                  </Card>
                  <Card className="p-4 bg-purple-200 border-purple-400 !text-purple-900 transform rotate-1 hover:rotate-0 transition-transform duration-300 hover:shadow-xl cursor-pointer font-caveat mt-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase">Summary</span>
                      <StickyNote className="w-4 h-4" />
                    </div>
                    <p className="text-xs opacity-80">Key points from Chapter 3 about protagonist's journey...</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Companion / Read Aloud Feature */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative animate-fade-in order-2 md:order-1">
                <div className="relative">
                  {/* Audio Waves Visualization */}
                  <div className="flex items-center justify-center gap-2 p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl backdrop-blur-sm border border-blue-200 dark:border-blue-800">
                    <div className="flex items-end gap-2 h-32">
                      {[3, 7, 4, 8, 5, 9, 4, 6, 3, 8, 5, 7, 4].map((height, i) => (
                        <div
                          key={i}
                          className="w-3 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse"
                          style={{
                            height: `${height * 12}%`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '1.5s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Floating Control Buttons */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-card p-4 rounded-2xl shadow-xl border border-border">
                    <button className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg">
                      <Volume2 className="w-6 h-6" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors">
                      <Pause className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors">
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6 animate-fade-in order-1 md:order-2" style={{ animationDelay: "200ms" }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full">
                  <Volume2 className="w-5 h-5 text-blue-900 dark:text-blue-200" />
                  <span className="font-semibold text-blue-900 dark:text-blue-200">Audio Companion</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Listen to Your Book with{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Read Aloud
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Turn any text into speech with our built-in text-to-speech engine. Perfect for multitasking, learning pronunciation, or just relaxing while your book reads itself.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-900 dark:text-blue-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Read entire pages aloud with one click</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-900 dark:text-purple-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Select any text to hear it pronounced correctly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-200 dark:bg-pink-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-pink-900 dark:text-pink-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Pause, resume, and stop controls for easy management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-indigo-900 dark:text-indigo-200 text-sm">✓</span>
                    </div>
                    <span className="text-muted-foreground">Browser-based TTS - no internet required for playback</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth?signup=true")}
                    className="gap-2 hover-scale bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
                  >
                    Start Listening Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DuoRead Agent Feature */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full backdrop-blur-sm border border-primary/30">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">AI-Powered</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Your Personal{" "}
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                    DuoRead Agent
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Meet your intelligent reading companion that understands context. Ask questions, discuss themes, explore characters, and dive deeper into your book with AI-powered conversations.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <span className="text-muted-foreground">Context-aware conversations about your book content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm font-bold">✓</span>
                    </div>
                    <span className="text-muted-foreground">Add selected text as context for more relevant answers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent text-sm font-bold">✓</span>
                    </div>
                    <span className="text-muted-foreground">Responds in your native language automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent text-sm font-bold">✓</span>
                    </div>
                    <span className="text-muted-foreground">Persistent chat history for each book you read</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth?signup=true")}
                    className="gap-2 hover-scale bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent"
                  >
                    Chat with DuoRead Agent
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="relative animate-fade-in order-1 md:order-2" style={{ animationDelay: "200ms" }}>
                {/* Chat Interface Mockup */}
                <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">DuoRead Agent</h3>
                      <p className="text-xs text-muted-foreground">Always ready to help</p>
                    </div>
                  </div>
                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 h-80 overflow-hidden">
                    {/* Added Context Indicator */}
                    <div className="animate-slide-in-left">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Added Context (1)</span>
                          <span className="text-xs text-muted-foreground">Clear all</span>
                        </div>
                        <Card className="px-3 py-2 bg-accent/10 border-accent/30 flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              "The old man gazed at the horizon, contemplating the journey that brought him here..."
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground cursor-pointer">×</span>
                        </Card>
                      </div>
                    </div>
                    {/* User Message */}
                    <div className="flex justify-end animate-slide-in-right" style={{ animationDelay: "0.3s" }}>
                      <Card className="p-3 max-w-[80%] bg-primary text-primary-foreground">
                        <p className="text-sm">What does this passage reveal about the character?</p>
                      </Card>
                    </div>
                    {/* Bot Message 1 */}
                    <div className="flex gap-2 animate-slide-in-left" style={{ animationDelay: "0.6s" }}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <Card className="p-3 max-w-[85%] bg-secondary">
                        <p className="text-sm">Based on the passage you shared, this reveals the character's reflective nature and his tendency to find meaning in past experiences...</p>
                      </Card>
                    </div>
                    {/* User Message 2 */}
                    <div className="flex justify-end animate-slide-in-right" style={{ animationDelay: "0.9s" }}>
                      <Card className="p-3 max-w-[80%] bg-primary text-primary-foreground">
                        <p className="text-sm">Tell me more about the symbolism</p>
                      </Card>
                    </div>
                    {/* Bot Message 2 - Typing Indicator */}
                    <div className="flex gap-2 animate-slide-in-left" style={{ animationDelay: "1.2s" }}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 animate-pulse">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <Card className="p-3 bg-secondary">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </Card>
                    </div>
                  </div>
                  {/* Chat Input */}
                  <div className="p-4 border-t border-border bg-muted/30">
                    <div className="flex gap-2 items-center px-4 py-2 bg-background border border-border rounded-lg">
                      <span className="text-sm text-muted-foreground flex-1">Ask me anything about your book...</span>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating "Add to Chat" Indicator */}
                <div className="absolute -top-8 -left-4 animate-float" style={{ animationDelay: "0.5s" }}>
                  <Card className="p-3 bg-gradient-to-r from-primary to-accent text-white shadow-xl border-none relative">
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-accent"></div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <p className="text-xs font-semibold">Add to Chat</p>
                    </div>
                    <p className="text-xs opacity-90 mt-1">Select text → Context added!</p>
                  </Card>
                </div>
                {/* Floating Context Bubble */}
                <div className="absolute -top-4 -right-4 animate-float">
                  <Card className="p-3 bg-accent text-accent-foreground shadow-lg">
                    <p className="text-xs font-medium">💡 Contextual AI responses</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 relative overflow-hidden">
        {/* Animated Geometric Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary-glow/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full backdrop-blur-sm border border-primary/30 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-semibold text-primary">9 Powerful Tools</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                All-in-One
              </span>{" "}
              Reading Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select any text and access powerful AI tools instantly. No switching apps, no interruptions.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {tools.map((tool, index) => (
              <Card 
                key={index} 
                className="relative p-8 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-scale-in cursor-pointer overflow-hidden border-2 hover:border-primary/50"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-500"></div>
                
                {/* Icon container with glow effect */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    <tool.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <p className="font-semibold text-sm relative z-10 group-hover:text-primary transition-colors duration-300">{tool.name}</p>
                
                {/* Hover indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "900ms" }}>
            <p className="text-muted-foreground mb-4">And many more features to discover!</p>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth?signup=true")}
              className="gap-2 hover-scale border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              Explore All Features
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background with Mesh Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-orange-100 dark:from-violet-950/30 dark:via-fuchsia-950/20 dark:to-orange-950/30"></div>
        <div className="absolute inset-0">
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0s" }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-200 to-orange-200 dark:from-violet-900/50 dark:to-orange-900/50 rounded-full mb-6">
                <BookOpen className="w-5 h-5 text-violet-900 dark:text-violet-200" />
                <span className="font-semibold text-violet-900 dark:text-violet-200">For Everyone</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Who Benefits from{" "}
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">
                  DuoRead?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Whether you're learning, studying, or exploring—DuoRead is your perfect reading companion
              </p>
            </div>
            
            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { 
                  title: "Language Learners", 
                  desc: "Practice reading in your target language with instant support and never miss a word", 
                  icon: Languages,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "bg-blue-500/10",
                  emoji: "🌍"
                },
                { 
                  title: "Students", 
                  desc: "Understand complex academic texts with AI-powered explanations and summaries", 
                  icon: BookOpen,
                  color: "from-purple-500 to-pink-500",
                  bgColor: "bg-purple-500/10",
                  emoji: "📚"
                },
                { 
                  title: "Researchers", 
                  desc: "Access international research papers with seamless translation and comprehension tools", 
                  icon: FileText,
                  color: "from-orange-500 to-red-500",
                  bgColor: "bg-orange-500/10",
                  emoji: "🔬"
                },
                { 
                  title: "Avid Readers", 
                  desc: "Explore books from around the world without language barriers holding you back", 
                  icon: Sparkles,
                  color: "from-emerald-500 to-teal-500",
                  bgColor: "bg-emerald-500/10",
                  emoji: "📖"
                }
              ].map((benefit, index) => (
                <Card 
                  key={index} 
                  className="relative group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in cursor-pointer border-2 hover:border-primary/50"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 ${benefit.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="p-8 relative z-10">
                    {/* Icon and Emoji combo */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
                        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          <benefit.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <span className="text-4xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{benefit.emoji}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">{benefit.desc}</p>
                    
                    {/* Animated checkmark */}
                    <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${benefit.color} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-sm font-semibold">Perfect for you</span>
                    </div>
                  </div>
                  
                  {/* Decorative corner glow */}
                  <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br ${benefit.color} rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                </Card>
              ))}
            </div>
            
            {/* Bottom testimonial-style text */}
            <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: "600ms" }}>
              <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border shadow-lg">
                <p className="text-lg text-muted-foreground italic mb-4">
                  "Join thousands of readers who are breaking language barriers and discovering the joy of reading in any language"
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-card"></div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">+1,000 readers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary to-primary-glow text-primary-foreground relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[slide-in-right_3s_ease-in-out_infinite]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Start Reading?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of readers breaking language barriers
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate("/auth?signup=true")}
                className="gap-2 hover-scale"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">DuoRead</span>
          </div>
          <p>© 2024 DuoRead. Read in any language, without limits.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
