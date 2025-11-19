import { Button } from "@/components/ui/button";
import { FileSearch, Sparkles, TrendingUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileSearch className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              ResumeRank
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered resume screening and candidate ranking platform
          </p>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Transform Your Hiring Process with AI
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Automatically fetch resumes from your inbox, analyze them with OpenAI, and rank candidates based on job requirements. Save hours of manual screening.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="text-lg px-8 py-6 h-auto bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-login"
          >
            Log In to Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileSearch className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Auto-Fetch Resumes</h3>
            <p className="text-gray-600">
              Connect Gmail or Outlook to automatically import resume attachments from your inbox.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Let OpenAI analyze each resume against your job description with detailed insights.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Ranking</h3>
            <p className="text-gray-600">
              Get candidates ranked by match score with strengths and weaknesses highlighted.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Connect Your Email</h3>
                <p className="text-gray-600">
                  Link your Gmail or Outlook account to automatically fetch resume attachments.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Enter Job Requirements</h3>
                <p className="text-gray-600">
                  Describe the role and qualifications you're looking for in a candidate.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">Get Ranked Results</h3>
                <p className="text-gray-600">
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
            className="text-lg px-8 py-6 h-auto border-gray-200 text-gray-600 hover:bg-gray-50"
            data-testid="button-login-bottom"
          >
            Start Screening Resumes Now
          </Button>
        </div>
      </div>
    </div>
  );
}
