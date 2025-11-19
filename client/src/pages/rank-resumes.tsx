import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TrendingUp, FileText, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function RankResumes() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [jobDescription, setJobDescription] = useState("");

  const { data: stats } = useQuery<{ totalCVs: number }>({
    queryKey: ["/api/stats"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest("POST", "/api/analyze-cvs", { jobDescription: description });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.count} resume(s). Redirecting to results...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setTimeout(() => {
        setLocation("/results");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze resumes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description before analyzing resumes.",
        variant: "destructive",
      });
      return;
    }

    if (!stats?.totalCVs || stats.totalCVs === 0) {
      toast({
        title: "No CVs Available",
        description: "Please fetch CVs from your email inbox before running analysis.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate(jobDescription);
  };

  const characterCount = jobDescription.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2 text-gray-600">Rank Resumes</h1>
          <p className="text-gray-500">
            Use AI to score and rank candidates for your job opening
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 text-gray-900">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600">
                  Provide a job description and let AI analyze all resumes, scoring them from 0-100
                  with detailed insights.
                </p>
              </div>
            </div>

            {(!stats?.totalCVs || stats.totalCVs === 0) && (
              <Alert className="mb-6 bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  You don't have any CVs in your database yet. Please fetch CVs from your email inbox
                  before running analysis.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="job-description" className="text-base font-medium text-gray-700">
                    Job Description
                  </Label>
                  <span className="text-xs text-gray-500" data-testid="text-character-count">
                    {characterCount} characters
                  </span>
                </div>
                <Textarea
                  id="job-description"
                  placeholder="Enter the job description, required skills, qualifications, and any other criteria you want to evaluate candidates against...&#10;&#10;Example:&#10;We are looking for a Senior Full-Stack Developer with 5+ years of experience. Must have expertise in React, Node.js, and PostgreSQL. Strong communication skills and experience with Agile methodologies required."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[300px] resize-y text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="textarea-job-description"
                  disabled={analyzeMutation.isPending}
                />
                <p className="text-xs text-gray-500">
                  Provide detailed information about the role, requirements, and ideal candidate profile
                  for best results.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || !stats?.totalCVs || stats.totalCVs === 0}
                data-testid="button-analyze-cvs"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing {stats?.totalCVs || 0} Resume{stats?.totalCVs === 1 ? "" : "s"}...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    Analyze {stats?.totalCVs || 0} Resume{stats?.totalCVs === 1 ? "" : "s"}
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FileText className="h-5 w-5 text-gray-500" />
                Current Database
              </CardTitle>
              <CardDescription className="text-gray-500">
                CVs available for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold text-gray-900" data-testid="text-available-cvs">
                    {stats?.totalCVs || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    Resume{stats?.totalCVs === 1 ? "" : "s"} ready to analyze
                  </p>
                </div>
                {stats?.totalCVs && stats.totalCVs > 0 && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
