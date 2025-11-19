import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, FileText, Download, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CVWithAnalysis } from "@shared/schema";

export default function Results() {
  const [selectedCV, setSelectedCV] = useState<CVWithAnalysis | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { data: results, isLoading } = useQuery<CVWithAnalysis[]>({
    queryKey: ["/api/results"],
  });

  const downloadCV = async (cvId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/cv/${cvId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download CV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download CV. Please try again.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-blue-600";
    if (score >= 40) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2 text-gray-600">Results</h1>
          <p className="text-gray-500">
            AI-scored candidates sorted by best match for your job opening
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-16 w-16 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !results || results.length === 0 ? (
          <Card className="p-12 bg-white border border-gray-200">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Results Yet</h3>
              <p className="text-sm text-gray-600 max-w-md mb-6">
                Run an analysis on your fetched CVs to see ranked results here. Go to the Rank
                Resumes page to get started.
              </p>
              <Button 
                onClick={() => window.location.href = "/rank-resumes"} 
                data-testid="button-go-to-rank"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Rank Resumes
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {results.map((cv, index) => {
              const isExpanded = expandedCards.has(cv.id);
              const score = cv.analysis?.score || 0;
              const strengths = cv.analysis?.strengths || [];
              const weaknesses = cv.analysis?.weaknesses || [];

              return (
                <Card key={cv.id} data-testid={`card-result-${cv.id}`} className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary" className="font-mono bg-gray-100 text-gray-700" data-testid={`badge-rank-${cv.id}`}>
                            #{index + 1}
                          </Badge>
                          <CardTitle className="text-xl text-gray-900" data-testid={`text-candidate-name-${cv.id}`}>
                            {cv.candidateName}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-gray-600 mb-3" data-testid={`text-candidate-email-${cv.id}`}>
                          {cv.candidateEmail}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{cv.fileType.toUpperCase()}</span>
                          <span>•</span>
                          <span>{cv.source}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`text-4xl font-bold font-mono ${getScoreColor(score)}`}
                          data-testid={`text-score-${cv.id}`}
                        >
                          {score}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">/ 100</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Match Score</span>
                        <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className={`h-full transition-all ${getProgressColor(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="grid gap-4 md:grid-cols-2 pt-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            Strengths
                          </div>
                          {strengths.length > 0 ? (
                            <ul className="space-y-2" data-testid={`list-strengths-${cv.id}`}>
                              {strengths.map((strength, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 pl-4 border-l-2 border-green-600/50"
                                >
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No strengths identified</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                            <TrendingDown className="h-4 w-4" />
                            Weaknesses
                          </div>
                          {weaknesses.length > 0 ? (
                            <ul className="space-y-2" data-testid={`list-weaknesses-${cv.id}`}>
                              {weaknesses.map((weakness, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 pl-4 border-l-2 border-red-600/50"
                                >
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No weaknesses identified</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(cv.id)}
                        className="gap-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                        data-testid={`button-toggle-details-${cv.id}`}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            View Details
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCV(cv)}
                        className="gap-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                        data-testid={`button-view-cv-${cv.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        View Full CV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                        onClick={() => downloadCV(cv.id, cv.fileName || 'resume.pdf')}
                        data-testid={`button-download-${cv.id}`}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedCV} onOpenChange={() => setSelectedCV(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {selectedCV?.candidateName} - Full Resume
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedCV?.candidateEmail} • {selectedCV?.fileType.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border border-gray-200 p-4 bg-gray-50">
            <div className="whitespace-pre-wrap text-sm font-mono text-gray-800" data-testid="text-cv-content">
              {selectedCV?.extractedText || "No content available"}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
