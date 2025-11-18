import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, FileText, Mail, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats, FetchHistory } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<FetchHistory[]>({
    queryKey: ["/api/fetch-history"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your resume screening activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card data-testid="card-total-cvs">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total CVs Fetched
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <>
                  <div className="text-4xl font-bold" data-testid="text-total-cvs">
                    {stats?.totalCVs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Resumes in your database
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-last-analysis">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Analysis
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <>
                  <div className="text-4xl font-bold" data-testid="text-last-analysis">
                    {stats?.lastAnalysisDate
                      ? format(new Date(stats.lastAnalysisDate), "MMM dd")
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Most recent ranking
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-highest-score">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Highest Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="text-4xl font-bold" data-testid="text-highest-score">
                    {stats?.highestScore !== null
                      ? `${stats?.highestScore}/100`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best candidate match
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Fetch New CVs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect to your email inbox and import resume attachments
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically extract CVs from Gmail or Outlook emails. We'll search for PDF,
                  DOC, and DOCX attachments.
                </p>
                <Link href="/fetch-cvs">
                  <Button className="gap-2" data-testid="button-go-to-fetch-cvs">
                    Go to Fetch CVs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Rank Resumes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use AI to score and rank candidates for your job opening
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Provide a job description and let AI analyze all resumes, scoring them from 0-100
                  with detailed insights.
                </p>
                <Link href="/rank-resumes">
                  <Button className="gap-2" data-testid="button-go-to-rank-resumes">
                    Go to Rank Resumes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !recentActivity || recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No fetch history yet. Connect an email provider and start importing CVs.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4" data-testid={`activity-${activity.id}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" data-testid={`text-activity-description-${activity.id}`}>
                        Fetched {activity.cvsCount} CVs from {activity.source}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-activity-date-${activity.id}`}>
                        {format(new Date(activity.fetchedAt), "MMM dd, yyyy, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
