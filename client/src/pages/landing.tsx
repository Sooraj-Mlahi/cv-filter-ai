import { Button } from "@/components/ui/button";
import { FileSearch, Sparkles, TrendingUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileSearch className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              ResumeRank
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered resume screening and candidate ranking platform
          </p>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transform Your Hiring Process with AI
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automatically fetch resumes from your inbox, analyze them with OpenAI, and rank candidates based on job requirements. Save hours of manual screening.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="text-lg px-8 py-6 h-auto"
            data-testid="button-login"
          >
            Log In to Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Auto-Fetch Resumes</h3>
            <p className="text-muted-foreground">
              Connect Gmail or Outlook to automatically import resume attachments from your inbox.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-muted-foreground">
              Let OpenAI analyze each resume against your job description with detailed insights.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Ranking</h3>
            <p className="text-muted-foreground">
              Get candidates ranked by match score with strengths and weaknesses highlighted.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Connect Your Email</h3>
                <p className="text-muted-foreground">
                  Link your Gmail or Outlook account to automatically fetch resume attachments.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Enter Job Requirements</h3>
                <p className="text-muted-foreground">
                  Describe the role and qualifications you're looking for in a candidate.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Get Ranked Results</h3>
                <p className="text-muted-foreground">
                  Review AI-analyzed candidates ranked by relevance with detailed insights.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Button 
            onClick={handleLogin}
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 h-auto"
            data-testid="button-login-bottom"
          >
            Start Screening Resumes Now
          </Button>
        </div>
      </div>
    </div>
  );
}
