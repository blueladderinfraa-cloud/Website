import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Briefcase,
  DollarSign,
  Eye,
  FileText,
} from "lucide-react";

export default function AdminTenders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<any>(null);
  const [selectedTender, setSelectedTender] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "residential" as const,
    budget: "",
    deadline: "",
    requirements: "",
    status: "open" as const,
  });

  const utils = trpc.useUtils();
  const { data: tenders, isLoading } = trpc.tenders.all.useQuery();
  const { data: applications } = trpc.tenders.applications.useQuery(
    { tenderId: selectedTender?.id || 0 },
    { enabled: !!selectedTender }
  );

  const createTender = trpc.tenders.create.useMutation({
    onSuccess: () => {
      toast.success("Tender created!");
      utils.tenders.all.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create tender"),
  });

  const updateTender = trpc.tenders.update.useMutation({
    onSuccess: () => {
      toast.success("Tender updated!");
      utils.tenders.all.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update tender"),
  });

  const deleteTender = trpc.tenders.delete.useMutation({
    onSuccess: () => {
      toast.success("Tender deleted!");
      utils.tenders.all.invalidate();
    },
    onError: () => toast.error("Failed to delete tender"),
  });

  const updateApplicationStatus = trpc.tenders.updateApplicationStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated!");
      utils.tenders.applications.invalidate();
    },
    onError: () => toast.error("Failed to update status"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "residential",
      budget: "",
      deadline: "",
      requirements: "",
      status: "open",
    });
    setEditingTender(null);
  };

  const handleEdit = (tender: any) => {
    setEditingTender(tender);
    setFormData({
      title: tender.title,
      description: tender.description || "",
      category: tender.category,
      budget: tender.budget || "",
      deadline: tender.deadline ? new Date(tender.deadline).toISOString().split("T")[0] : "",
      requirements: tender.requirements || "",
      status: tender.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
    };

    if (editingTender) {
      updateTender.mutate({ id: editingTender.id, ...data });
    } else {
      createTender.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tender?")) {
      deleteTender.mutate({ id });
    }
  };

  const filteredTenders = tenders?.filter((t: any) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter && statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  }) || [];

  return (
    <AdminLayout currentPage="tenders" title="Tenders" description="Manage tender postings and applications">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tenders</h1>
          <p className="text-muted-foreground">Manage tender postings and applications</p>
        </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Tender
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTender ? "Edit Tender" : "Create New Tender"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <Input
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="e.g., $50,000 - $100,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={4}
                    placeholder="List requirements, qualifications, etc."
                  />
                </div>

                {editingTender && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-primary text-white"
                    disabled={createTender.isPending || updateTender.isPending}
                  >
                    {editingTender ? "Update" : "Create"} Tender
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-elegant mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenders..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tenders Table */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : filteredTenders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Tender</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Budget</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Deadline</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenders.map((tender: any) => (
                      <tr key={tender.id} className="border-t">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{tender.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {tender.description}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-foreground">{tender.category}</span>
                        </td>
                        <td className="p-4 text-foreground">
                          {tender.budget || "-"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {tender.deadline
                            ? new Date(tender.deadline).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tender.status === "open" ? "bg-green-100 text-green-700" :
                            tender.status === "awarded" ? "bg-blue-100 text-blue-700" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTender(tender)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tender)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(tender.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Tenders Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter
                    ? "Try adjusting your filters"
                    : "Create your first tender to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Applications Dialog */}
      <Dialog open={!!selectedTender} onOpenChange={() => setSelectedTender(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tender Applications: {selectedTender?.title}</DialogTitle>
          </DialogHeader>
          {selectedTender && (
            <div className="space-y-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 capitalize">{selectedTender.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="ml-2">{selectedTender.budget || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="ml-2">
                      {selectedTender.deadline
                        ? new Date(selectedTender.deadline).toLocaleDateString()
                        : "No deadline"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-4">Applications</h4>
                {applications && applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app: any) => (
                      <div key={app.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-foreground">{app.companyName}</div>
                            <div className="text-sm text-muted-foreground">{app.contactEmail}</div>
                          </div>
                          <Select
                            value={app.status}
                            onValueChange={(value: "submitted" | "under_review" | "shortlisted" | "rejected" | "awarded") => 
                              updateApplicationStatus.mutate({ id: app.id, status: value })
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="awarded">Awarded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {app.proposal && (
                          <div className="text-sm text-muted-foreground mb-3">
                            {app.proposal}
                          </div>
                        )}
                        <div className="flex gap-4 text-sm">
                          {app.bidAmount && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>{app.bidAmount}</span>
                            </div>
                          )}
                          {app.proposalUrl && (
                            <a
                              href={app.proposalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Proposal</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No applications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
