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
  Eye,
  Users,
  Mail,
  Phone,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminSubcontractors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: subcontractors, isLoading } = trpc.subcontractors.list.useQuery();

  const updateStatus = trpc.subcontractors.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      utils.subcontractors.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const filteredSubcontractors = subcontractors?.filter((s: any) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!(s.companyName || "").toLowerCase().includes(query) && !(s.contactName || "").toLowerCase().includes(query)) {
        return false;
      }
    }
    if (statusFilter && statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  }) || [];

  return (
    <AdminLayout 
      currentPage="subcontractors"
      title="Subcontractors" 
      description="Manage subcontractor registrations and applications"
    >
      {/* Filters */}
        <Card className="border-0 shadow-elegant mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by company or contact name..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subcontractors Table */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : filteredSubcontractors.length > 0 ? (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-3">
                  {filteredSubcontractors.map((sub: any) => (
                    <div key={sub.id} className="bg-white rounded-xl border p-3 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">{sub.companyName}</div>
                          <div className="text-sm text-muted-foreground truncate">{sub.contactName}</div>
                          <div className="text-sm text-muted-foreground truncate">{sub.email}</div>
                          {sub.phone && <div className="text-sm text-muted-foreground">{sub.phone}</div>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSubcontractor(sub)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <a href={`mailto:${sub.email}`}>
                            <Button variant="ghost" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="capitalize text-foreground">{sub.specialty || "No specialty"}</span>
                        {(sub.licenseUrl || sub.insuranceUrl) && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            {sub.licenseUrl && (
                              <a href={sub.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                <FileText className="w-3 h-3" /> License
                              </a>
                            )}
                            {sub.insuranceUrl && (
                              <a href={sub.insuranceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Insurance
                              </a>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Select
                          value={sub.status}
                          onValueChange={(value: "pending" | "approved" | "rejected") => updateStatus.mutate({ id: sub.id, status: value })}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">Company</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Specialty</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Documents</th>
                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubcontractors.map((sub: any) => (
                        <tr key={sub.id} className="border-t">
                          <td className="p-4">
                            <div className="font-medium text-foreground">{sub.companyName}</div>
                            <div className="text-sm text-muted-foreground">{sub.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-foreground">{sub.contactName}</div>
                            <div className="text-sm text-muted-foreground">{sub.phone}</div>
                          </td>
                          <td className="p-4">
                            <span className="capitalize text-foreground">{sub.specialty || "-"}</span>
                          </td>
                          <td className="p-4">
                            <Select
                              value={sub.status}
                              onValueChange={(value: "pending" | "approved" | "rejected") => updateStatus.mutate({ id: sub.id, status: value })}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {sub.licenseUrl && (
                                <a href={sub.licenseUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" title="License">
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                </a>
                              )}
                              {sub.insuranceUrl && (
                                <a href={sub.insuranceUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" title="Insurance">
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSubcontractor(sub)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <a href={`mailto:${sub.email}`}>
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
              </>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Subcontractors Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter
                    ? "Try adjusting your filters"
                    : "New registrations will appear here"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubcontractor} onOpenChange={() => setSelectedSubcontractor(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Subcontractor Details</DialogTitle>
          </DialogHeader>
          {selectedSubcontractor && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{selectedSubcontractor.companyName}</div>
                      <div className="text-sm text-muted-foreground">Company</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span>{selectedSubcontractor.contactName}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <a href={`mailto:${selectedSubcontractor.email}`} className="text-primary hover:underline">
                      {selectedSubcontractor.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${selectedSubcontractor.phone}`} className="text-primary hover:underline">
                      {selectedSubcontractor.phone}
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Specialty</div>
                    <div className="font-medium text-foreground capitalize">
                      {selectedSubcontractor.specialty || "Not specified"}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      {selectedSubcontractor.status === "approved" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {selectedSubcontractor.status === "rejected" && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {selectedSubcontractor.status === "pending" && (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="font-medium text-foreground capitalize">
                        {selectedSubcontractor.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedSubcontractor.description && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <div className="p-4 bg-secondary/50 rounded-lg whitespace-pre-wrap">
                    {selectedSubcontractor.description}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-2">Documents</div>
                <div className="flex gap-4">
                  {selectedSubcontractor.licenseUrl ? (
                    <a
                      href={selectedSubcontractor.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <FileText className="w-5 h-5 text-primary" />
                      <span>License Document</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg text-muted-foreground">
                      <FileText className="w-5 h-5" />
                      <span>No license uploaded</span>
                    </div>
                  )}
                  {selectedSubcontractor.insuranceUrl ? (
                    <a
                      href={selectedSubcontractor.insuranceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Insurance Document</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg text-muted-foreground">
                      <FileText className="w-5 h-5" />
                      <span>No insurance uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => updateStatus.mutate({ id: selectedSubcontractor.id, status: "rejected" })}
                  disabled={selectedSubcontractor.status === "rejected"}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="gradient-primary text-white"
                  onClick={() => updateStatus.mutate({ id: selectedSubcontractor.id, status: "approved" })}
                  disabled={selectedSubcontractor.status === "approved"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
