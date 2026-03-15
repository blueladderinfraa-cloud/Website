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
  MessageSquare,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export default function AdminTestimonials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    clientCompany: "",
    clientTitle: "",
    content: "",
    rating: 5,
    projectType: "",
    clientImage: "",
    isActive: true,
    featured: false,
  });

  const utils = trpc.useUtils();
  const { data: testimonials, isLoading } = trpc.testimonials.all.useQuery();

  const createTestimonial = trpc.testimonials.create.useMutation({
    onSuccess: () => {
      toast.success("Testimonial created!");
      utils.testimonials.all.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create testimonial"),
  });

  const updateTestimonial = trpc.testimonials.update.useMutation({
    onSuccess: () => {
      toast.success("Testimonial updated!");
      utils.testimonials.all.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to update testimonial"),
  });

  const deleteTestimonial = trpc.testimonials.delete.useMutation({
    onSuccess: () => {
      toast.success("Testimonial deleted!");
      utils.testimonials.all.invalidate();
    },
    onError: () => toast.error("Failed to delete testimonial"),
  });

  const resetForm = () => {
    setFormData({
      clientName: "",
      clientCompany: "",
      clientTitle: "",
      content: "",
      rating: 5,
      projectType: "",
      clientImage: "",
      isActive: true,
      featured: false,
    });
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial);
    setFormData({
      clientName: testimonial.clientName || "",
      clientCompany: testimonial.clientCompany || "",
      clientTitle: testimonial.clientTitle || "",
      content: testimonial.content || "",
      rating: testimonial.rating || 5,
      projectType: testimonial.projectType || "",
      clientImage: testimonial.clientImage || "",
      isActive: testimonial.isActive ?? true,
      featured: testimonial.featured ?? false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTestimonial) {
      updateTestimonial.mutate({ id: editingTestimonial.id, ...formData });
    } else {
      createTestimonial.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteTestimonial.mutate({ id });
    }
  };

  const toggleActive = (testimonial: any) => {
    updateTestimonial.mutate({
      id: testimonial.id,
      isActive: !testimonial.isActive,
    });
  };

  const toggleFeatured = (testimonial: any) => {
    updateTestimonial.mutate({
      id: testimonial.id,
      featured: !testimonial.featured,
    });
  };

  const filteredTestimonials = testimonials?.filter((t: any) => {
    if (searchQuery && !t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !t.clientCompany?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === "active" && !t.isActive) return false;
    if (statusFilter === "inactive" && t.isActive) return false;
    if (statusFilter === "featured" && !t.featured) return false;
    return true;
  }) || [];

  return (
    <AdminLayout currentPage="testimonials" title="Testimonials" description="Manage customer testimonials and reviews">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={formData.clientCompany}
                    onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title/Position</Label>
                  <Input
                    value={formData.clientTitle}
                    onChange={(e) => setFormData({ ...formData, clientTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Input
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    placeholder="e.g., Residential Construction"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Testimonial Content *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ImageUpload
                label="Client Photo"
                value={formData.clientImage}
                onChange={(url) => setFormData({ ...formData, clientImage: url })}
                placeholder="Upload client photo (optional)"
              />

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary text-white"
                  disabled={createTestimonial.isPending || updateTestimonial.isPending}
                >
                  {editingTestimonial ? "Update" : "Create"} Testimonial
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
                placeholder="Search testimonials..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      <Card className="border-0 shadow-elegant">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : filteredTestimonials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Content</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTestimonials.map((testimonial: any) => (
                    <tr key={testimonial.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {testimonial.clientImage && (
                            <img
                              src={testimonial.clientImage}
                              alt={testimonial.clientName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-foreground">{testimonial.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              {testimonial.clientCompany && testimonial.clientTitle
                                ? `${testimonial.clientTitle} at ${testimonial.clientCompany}`
                                : testimonial.clientCompany || testimonial.clientTitle || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-foreground line-clamp-2 max-w-xs">
                          {testimonial.content}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            testimonial.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                          }`}>
                            {testimonial.isActive ? "Active" : "Inactive"}
                          </span>
                          {testimonial.featured && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(testimonial)}
                            title={testimonial.isActive ? "Deactivate" : "Activate"}
                          >
                            {testimonial.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFeatured(testimonial)}
                            title={testimonial.featured ? "Remove from featured" : "Add to featured"}
                            className={testimonial.featured ? "text-blue-600" : ""}
                          >
                            <Star className={`w-4 h-4 ${testimonial.featured ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(testimonial)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(testimonial.id)}
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
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Testimonials Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || (statusFilter && statusFilter !== "all")
                  ? "Try adjusting your filters"
                  : "Add your first testimonial to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}