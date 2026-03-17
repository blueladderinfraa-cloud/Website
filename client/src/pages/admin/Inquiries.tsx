import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Search,
  Download,
  Eye,
  MessageSquare,
  Mail,
  Phone,
  Building2,
  Calendar,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import { PageLoadingSpinner, ButtonLoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminInquiries() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const { handleApiError } = useErrorHandler();
  const { isLoading, setLoading } = useLoadingStates();

  const utils = trpc.useUtils();
  const { data: inquiries, isLoading: isLoadingInquiries, error, refetch } = trpc.inquiries.list.useQuery(
    undefined,
    {
      onError: (error) => {
        handleApiError(error, "load inquiries", () => refetch());
      },
      retry: (failureCount, error) => {
        // Retry up to 3 times for network errors
        if (failureCount < 3) {
          return true;
        }
        return false;
      },
    }
  );

  const updateStatus = trpc.inquiries.updateStatus.useMutation({
    onMutate: async ({ id, status }) => {
      setLoading("updateStatus", true);
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.inquiries.list.cancel();

      // Snapshot the previous value
      const previousInquiries = utils.inquiries.list.getData();

      // Optimistically update to the new value
      utils.inquiries.list.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, status } : inquiry
        );
      });

      // Return a context object with the snapshotted value
      return { previousInquiries };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInquiries) {
        utils.inquiries.list.setData(undefined, context.previousInquiries);
      }
      handleApiError(error, "update inquiry status", () => {
        updateStatus.mutate(variables);
      });
    },
    onSuccess: () => {
      toast.success("Status updated!");
    },
    onSettled: () => {
      setLoading("updateStatus", false);
      // Always refetch after error or success to ensure we have the latest data
      utils.inquiries.list.invalidate();
    },
  });

  const exportToCSV = async () => {
    if (!inquiries || inquiries.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      setLoading("export", true);
      
      const headers = ["Name", "Email", "Phone", "Company", "Project Type", "Budget", "Timeline", "Status", "Date"];
      const rows = inquiries.map((i: any) => [
        i.name,
        i.email,
        i.phone || "",
        i.company || "",
        i.projectType || "",
        i.budget || "",
        i.timeline || "",
        i.status,
        new Date(i.createdAt).toLocaleDateString(),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully!");
    } catch (error) {
      handleApiError(error, "export data");
    } finally {
      setLoading("export", false);
    }
  };

  const filteredInquiries = inquiries?.filter((i: any) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!i.name.toLowerCase().includes(query) && !i.email.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (statusFilter && statusFilter !== "all" && i.status !== statusFilter) return false;
    return true;
  }) || [];

  return (
    <AdminLayout 
      currentPage="inquiries"
      title="Inquiries" 
      description="Manage quote requests and contact form submissions"
    >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex-1">
            {error && (
              <div className="flex items-center gap-2 text-destructive">
                <span className="text-sm">Failed to load inquiries</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoadingInquiries}
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            )}
          </div>
          <Button 
            onClick={exportToCSV} 
            variant="outline"
            disabled={isLoading("export") || !inquiries?.length}
          >
            {isLoading("export") && <ButtonLoadingSpinner />}
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-elegant mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-0">
            {isLoadingInquiries ? (
              <PageLoadingSpinner text="Loading inquiries..." />
            ) : filteredInquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Project</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((inquiry: any) => (
                      <tr key={inquiry.id} className="border-t">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{inquiry.name}</div>
                          <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                          {inquiry.phone && (
                            <div className="text-sm text-muted-foreground">{inquiry.phone}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-foreground capitalize">{inquiry.projectType || "-"}</div>
                          <div className="text-sm text-muted-foreground">{inquiry.budget || "-"}</div>
                        </td>
                        <td className="p-4">
                          <Select
                            value={inquiry.status}
                            onValueChange={(value: "new" | "contacted" | "quoted" | "converted" | "closed") => updateStatus.mutate({ id: inquiry.id, status: value })}
                            disabled={updateStatus.isPending}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="quoted">Quoted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInquiry(inquiry)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <a href={`mailto:${inquiry.email}`}>
                              <Button variant="ghost" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Inquiries Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter
                    ? "Try adjusting your filters"
                    : "New inquiries will appear here"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{selectedInquiry.name}</div>
                      <div className="text-sm text-muted-foreground">Contact Person</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  
                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  )}
                  
                  {selectedInquiry.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <span>{selectedInquiry.company}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Project Type</div>
                    <div className="font-medium text-foreground capitalize">
                      {selectedInquiry.projectType || "Not specified"}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Budget</div>
                    <div className="font-medium text-foreground">
                      {selectedInquiry.budget || "Not specified"}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Timeline</div>
                    <div className="font-medium text-foreground">
                      {selectedInquiry.timeline || "Not specified"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Message</div>
                <div className="p-4 bg-secondary/50 rounded-lg whitespace-pre-wrap">
                  {selectedInquiry.message || "No message provided"}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <a href={`mailto:${selectedInquiry.email}`}>
                  <Button className="gradient-primary text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
