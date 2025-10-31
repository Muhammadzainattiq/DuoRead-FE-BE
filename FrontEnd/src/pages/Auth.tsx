import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nativeLanguage: z.string().min(2, "Language must be at least 2 characters").max(50, "Language name too long")
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get("signup") === "true");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nativeLanguage: "English"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (isSignup) {
        signupSchema.parse(formData);
      } else {
        loginSchema.parse({ email: formData.email, password: formData.password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const success = isSignup
      ? await signup(formData.name, formData.email, formData.password, formData.nativeLanguage)
      : await login(formData.email, formData.password);

    setLoading(false);
    
    if (success) {
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-[var(--shadow-strong)]">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="w-10 h-10 text-primary" />
          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            DuoRead
          </span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignup ? "Start reading in any language" : "Sign in to continue reading"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
          </div>

          {isSignup && (
            <div>
              <Label htmlFor="nativeLanguage">Native Language</Label>
              <LanguageSelector
                value={formData.nativeLanguage}
                onValueChange={(value) => setFormData({ ...formData, nativeLanguage: value })}
                placeholder="Select your native language"
              />
              {errors.nativeLanguage && <p className="text-sm text-destructive mt-1">{errors.nativeLanguage}</p>}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setErrors({});
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
