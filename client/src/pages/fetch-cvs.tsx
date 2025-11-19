import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Mail, Download, CheckCircle2, XCircle, Loader2, Inbox, Settings, Calendar, Tag } from "lucide-react";
import { SiGmail } from "react-icons/si";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [daysBack, setDaysBack] = useState(30);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const { data: providers, isLoading: providersLoading } = useQuery<EmailProvider[]>({
    queryKey: ["/api/email-providers"],
  });

  const { data: fetchHistory, isLoading: historyLoading } = useQuery<FetchHistory[]>({
    queryKey: ["/api/fetch-history"],
  });

  const fetchCVsMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest("POST", "/api/fetch-cvs", { 
        provider,
        daysBack,
        keywords 
      });
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

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-2 text-gray-600">Fetch CVs</h1>
          <p className="text-gray-500">
            Connect your email provider and import resume attachments automatically.
          </p>
        </div>

        {/* Advanced Options */}
        <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-lg text-gray-900">Advanced Options</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    {showAdvanced ? "Hide" : "Show"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-500">
                  Customize search criteria and date range for fetching CVs
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="daysBack" className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Days to Search Back
                  </Label>
                  <Input
                    id="daysBack"
                    type="number"
                    min="1"
                    max="365"
                    value={daysBack}
                    onChange={(e) => setDaysBack(parseInt(e.target.value) || 30)}
                    placeholder="30"
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-500">
                    Search emails from the last {daysBack} days
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Tag className="h-4 w-4" />
                    Additional Keywords
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="e.g. intern, senior, developer"
                      onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                      className="border-gray-200"
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={addKeyword}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywords.map((keyword) => (
                        <Badge 
                          key={keyword} 
                          variant="secondary" 
                          className="cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
                          onClick={() => removeKeyword(keyword)}
                        >
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Additional terms to search for in email content and attachments
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {providersLoading ? (
            <>
              <Card className="bg-white border border-gray-200 shadow-sm">
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
              <Card className="bg-white border border-gray-200 shadow-sm">
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
              <Card key={provider.name} className="bg-white border border-gray-200 shadow-sm" data-testid={`card-provider-${provider.name.toLowerCase()}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 border border-gray-200">
                      <IconComponent className="h-6 w-6" style={{ color: provider.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                        {provider.status === "connected" ? (
                          <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200" data-testid={`badge-status-${provider.name.toLowerCase()}`}>
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-gray-100 text-gray-600" data-testid={`badge-status-${provider.name.toLowerCase()}`}>
                            <XCircle className="h-3 w-3" />
                            Not Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {provider.name === "Gmail"
                          ? "Google email service"
                          : "Microsoft email service"}
                      </p>
                      {provider.lastFetch && (
                        <p className="text-xs text-gray-500 mb-4" data-testid={`text-last-fetch-${provider.name.toLowerCase()}`}>
                          Last fetched: {format(new Date(provider.lastFetch), "MMM dd, yyyy, h:mm a")}
                        </p>
                      )}
                      {provider.status === "connected" ? (
                        <Button
                          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={fetchingFrom !== null}
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
                      ) : (
                        <Button
                          className="w-full gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                          variant="outline"
                          onClick={() => window.location.href = `/api/auth/${provider.name.toLowerCase()}`}
                          data-testid={`button-connect-${provider.name.toLowerCase()}`}
                        >
                          <Mail className="h-4 w-4" />
                          Connect {provider.name}
                        </Button>
                      )}
                      {provider.status !== "connected" && (
                        <p className="text-xs text-gray-500 mt-3">
                          {provider.name === "Outlook"
                            ? "Connect your Microsoft account to access Outlook emails"
                            : "Connect your Google account to access Gmail"}
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

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Fetch History</CardTitle>
            <CardDescription className="text-gray-500">Your recent CV import activities</CardDescription>
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
                <Mail className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-sm font-medium text-gray-600 mb-2">
                  No fetch history yet
                </p>
                <p className="text-xs text-gray-500 max-w-sm">
                  Connect an email provider and start importing CVs.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {fetchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
                    data-testid={`history-item-${item.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-history-description-${item.id}`}>
                        Fetched {item.cvsCount} CVs from {item.source}
                      </p>
                      <p className="text-xs text-gray-500" data-testid={`text-history-date-${item.id}`}>
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
