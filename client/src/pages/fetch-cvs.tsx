import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mail, Download, CheckCircle2, XCircle, Loader2, Inbox } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FetchHistory } from "@shared/schema";
import { format } from "date-fns";

type EmailProvider = {
  name: string;
  icon: string;
  color: string;
  status: "connected" | "not_connected";
  lastFetch?: string;
};

const iconMap: Record<string, React.ComponentType<any>> = {
  "SiGmail": SiGmail,
  "Inbox": Inbox,
};

export default function FetchCVs() {
  const { toast } = useToast();
  const [fetchingFrom, setFetchingFrom] = useState<string | null>(null);

  const { data: providers, isLoading: providersLoading } = useQuery<EmailProvider[]>({
    queryKey: ["/api/email-providers"],
  });

  const { data: fetchHistory, isLoading: historyLoading } = useQuery<FetchHistory[]>({
    queryKey: ["/api/fetch-history"],
  });

  const fetchCVsMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest("POST", "/api/fetch-cvs", { provider });
    },
    onSuccess: (data: any) => {
      toast({
        title: "CVs Fetched Successfully",
        description: `Found and imported ${data.count} resume(s) from your inbox.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fetch-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setFetchingFrom(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Fetching CVs",
        description: error.message || "Failed to fetch CVs. Please try again.",
        variant: "destructive",
      });
      setFetchingFrom(null);
    },
  });

  const handleFetchCVs = (provider: string) => {
    setFetchingFrom(provider);
    fetchCVsMutation.mutate(provider);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fetch CVs from Email</h1>
          <p className="text-muted-foreground">
            Connect your email provider and import resume attachments automatically.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {providersLoading ? (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            providers?.map((provider) => {
              const IconComponent = iconMap[provider.icon] || Mail;
              return (
              <Card key={provider.name} data-testid={`card-provider-${provider.name.toLowerCase()}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-card" style={{ border: '1px solid hsl(var(--border))' }}>
                      <IconComponent className="h-6 w-6" style={{ color: provider.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{provider.name}</h3>
                        {provider.status === "connected" ? (
                          <Badge variant="secondary" className="gap-1" data-testid={`badge-status-${provider.name.toLowerCase()}`}>
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1" data-testid={`badge-status-${provider.name.toLowerCase()}`}>
                            <XCircle className="h-3 w-3" />
                            Not Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {provider.name === "Gmail"
                          ? "Google email service"
                          : "Microsoft email service"}
                      </p>
                      {provider.lastFetch && (
                        <p className="text-xs text-muted-foreground mb-4" data-testid={`text-last-fetch-${provider.name.toLowerCase()}`}>
                          Last fetched: {format(new Date(provider.lastFetch), "MMM dd, yyyy, h:mm a")}
                        </p>
                      )}
                      <Button
                        className="w-full gap-2"
                        disabled={provider.status !== "connected" || fetchingFrom !== null}
                        onClick={() => handleFetchCVs(provider.name.toLowerCase())}
                        data-testid={`button-fetch-${provider.name.toLowerCase()}`}
                      >
                        {fetchingFrom === provider.name.toLowerCase() ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Fetching CVs...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Fetch CVs from {provider.name}
                          </>
                        )}
                      </Button>
                      {provider.status !== "connected" && (
                        <p className="text-xs text-muted-foreground mt-3">
                          {provider.name === "Outlook"
                            ? "Microsoft Outlook integration requires manual API key setup. Contact support for configuration instructions."
                            : "Coming Soon - Manual configuration available with Microsoft Graph API credentials"}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        We'll search for emails with resume attachments (PDF, DOC, DOCX)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fetch History</CardTitle>
            <CardDescription>Your recent CV import activities</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !fetchHistory || fetchHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Mail className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  No fetch history yet
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Connect an email provider and start importing CVs.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {fetchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-3 px-4 rounded-md hover-elevate"
                    data-testid={`history-item-${item.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" data-testid={`text-history-description-${item.id}`}>
                        Fetched {item.cvsCount} CVs from {item.source}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-history-date-${item.id}`}>
                        {format(new Date(item.fetchedAt), "MMMM dd, yyyy 'at' h:mm a")}
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
