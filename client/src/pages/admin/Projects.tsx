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
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  Star,
} from "lucide-react";
import { SimpleMultiImageUpload } from "@/components/SimpleMultiImageUpload";

export default function AdminProjects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    category: "residential" as const,
    status: "upcoming" as const,
    coverImage: "",
    images: [] as Array<{id?: number, imageUrl: string, caption?: string, sortOrder: number, isCover?: boolean}>,
    client: "",
    area: "",
    featured: false,
  });

  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.projects.list.useQuery({});
  const addImageMutation = trpc.projects.addImage.useMutation();

  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      utils.projects.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create project");
      console.error(error);
    },
  });

  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      utils.projects.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update project");
      console.error(error);
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully!");
      utils.projects.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete project");
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      location: "",
      category: "residential",
      status: "upcoming",
      coverImage: "",
      images: [],
      client: "",
      area: "",
      featured: false,
    });
    setEditingProject(null);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description || "",
      location: project.location || "",
      category: project.category,
      status: project.status,
      coverImage: project.coverImage || "",
      images: project.images || [],
      client: project.client || "",
      area: project.area?.toString() || "",
      featured: project.featured || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      area: formData.area ? parseInt(formData.area) : undefined,
    };

    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, ...data });
        
        if (formData.images.length > 0) {
          for (const image of formData.images) {
            if (!image.id) {
              await addImageMutation.mutateAsync({
                projectId: editingProject.id,
                imageUrl: image.imageUrl,
                caption: image.caption,
                sortOrder: image.sortOrder,
              });
            }
          }
        }
      } else {
        const result = await createProject.mutateAsync(data);
        
        if (result.id && formData.images.length > 0) {
          for (const image of formData.images) {
            await addImageMutation.mutateAsync({
              projectId: result.id,
              imageUrl: image.imageUrl,
              caption: image.caption,
              sortOrder: image.sortOrder,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate({ id });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const filteredProjects = projects?.filter((p: any) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter && statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  }) || [];

  return (
    <AdminLayout 
      currentPage="/admin/projects" 
      title="Projects" 
      description="Manage your construction projects"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex-1" />
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="admin-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto admin-card">
            <DialogHeader className="admin-card-header -m-6 mb-6 p-6">
              <DialogTitle className="admin-card-title">
                {editingProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 p-1">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="admin-label">Title *</Label>
                  <Input
                    className="admin-input"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingProject ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="admin-label">Slug *</Label>
                  <Input
                    className="admin-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="admin-label">Description</Label>
                <Textarea
                  className="admin-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="admin-label">Location</Label>
                  <Input
                    className="admin-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="admin-label">Client</Label>
                  <Input
                    className="admin-input"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="admin-label">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="admin-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="admin-card">
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="admin-label">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="admin-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="admin-card">
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="admin-label">Area (sq ft)</Label>
                  <Input
                    className="admin-input"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="admin-label">Project Images</Label>
                <SimpleMultiImageUpload
                  images={formData.images}
                  onChange={(newImages) => {
                    setFormData(prev => ({ ...prev, images: newImages }));
                  }}
                />
              </div>

              <div className="flex items-center gap-2 p-3 admin-info rounded-lg">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label className="admin-label">Featured Project</Label>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="admin-button-secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="admin-button-primary"
                  disabled={createProject.isPending || updateProject.isPending}
                >
                  {editingProject ? "Update" : "Create"} Project
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
                placeholder="Search projects..."
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
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="border-0 shadow-elegant">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground mt-4">Loading projects...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Project</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project: any) => (
                    <tr key={project.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            {project.coverImage ? (
                              <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              {project.title}
                              {project.featured && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{project.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-foreground">{project.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === "completed" ? "bg-green-100 text-green-700" :
                          project.status === "ongoing" ? "bg-blue-100 text-blue-700" :
                          "bg-orange-100 text-orange-700"
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {project.location || "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(project)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(project.id)}
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
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter
                  ? "Try adjusting your filters"
                  : "Get started by adding your first project"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
