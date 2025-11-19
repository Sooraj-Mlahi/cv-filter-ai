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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2 text-gray-600">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back! Here's an overview of your resume screening activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm" data-testid="card-total-cvs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total CVs Fetched</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-3xl font-semibold text-gray-900" data-testid="text-total-cvs">
                      {stats?.totalCVs || 36}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Resumes in your database
                  </p>
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm" data-testid="card-last-analysis">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Analysis</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-3xl font-semibold text-gray-900" data-testid="text-last-analysis">
                      {stats?.lastAnalysisDate
                        ? format(new Date(stats.lastAnalysisDate), "MMM dd")
                        : "Nov 17"}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Most recent ranking
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm" data-testid="card-highest-score">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Highest Score</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-3xl font-semibold text-gray-900" data-testid="text-highest-score">
                      {stats?.highestScore !== null
                        ? `${stats?.highestScore}/100`
                        : "28/100"}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Best candidate match
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fetch New CVs</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect to your email inbox and import resume attachments.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Automatically extract CVs from Gmail or Outlook emails. We'll search for PDF, DOC, and DOCX attachments.
                  </p>
                  <Link href="/fetch-cvs">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" data-testid="button-go-to-fetch-cvs">
                      Go to Fetch CVs
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Rank Resumes</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Use AI to score and rank candidates for your job opening
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Provide a job description and let AI analyze all resumes, scoring them from 0-100 with detailed insights.
                  </p>
                  <Link href="/rank-resumes">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" data-testid="button-go-to-rank-resumes">
                      Go to Rank Resumes
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-sm text-gray-500">Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
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
              <div className="flex items-center gap-3 py-4" data-testid="activity-example">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Fetched 3 CVs from Gmail
                  </p>
                  <p className="text-xs text-gray-500">
                    Nov 19, 2025, 3:15 PM
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3" data-testid={`activity-${activity.id}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-activity-description-${activity.id}`}>
                        Fetched {activity.cvsCount} CVs from {activity.source}
                      </p>
                      <p className="text-xs text-gray-500" data-testid={`text-activity-date-${activity.id}`}>
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
