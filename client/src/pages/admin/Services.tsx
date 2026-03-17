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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Wrench,
  Eye,
  EyeOff,
} from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminServices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    icon: "",
    image: "",
    category: "residential" as const,
    features: [] as string[],
    isActive: true,
    sortOrder: 0,
  });
  const [newFeature, setNewFeature] = useState("");

  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.services.all.useQuery();

  const createService = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully!");
      utils.services.all.invalidate();
      utils.services.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create service");
      console.error(error);
    },
  });

  const updateService = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully!");
      utils.services.all.invalidate();
      utils.services.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update service");
      console.error(error);
    },
  });

  const deleteService = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully!");
      utils.services.all.invalidate();
      utils.services.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete service");
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      icon: "",
      image: "",
      category: "residential",
      features: [],
      isActive: true,
      sortOrder: 0,
    });
    setEditingService(null);
    setNewFeature("");
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription || "",
      fullDescription: service.fullDescription || "",
      icon: service.icon || "",
      image: service.image || "",
      category: service.category,
      features: service.features || [],
      isActive: service.isActive,
      sortOrder: service.sortOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      features: formData.features.length > 0 ? formData.features : undefined,
    };

    if (editingService) {
      updateService.mutate({ id: editingService.id, ...data });
    } else {
      createService.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteService.mutate({ id });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const toggleServiceStatus = (service: any) => {
    updateService.mutate({
      id: service.id,
      isActive: !service.isActive,
    });
  };

  const filteredServices = services?.filter((s: any) => {
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter && categoryFilter !== "all" && s.category !== categoryFilter) return false;
    return true;
  }) || [];

  return (
    <AdminLayout 
      currentPage="services"
      title="Services" 
      description="Manage your service offerings and website content"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex-1" />
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingService ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  placeholder="Brief description for service cards"
                />
              </div>

              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  rows={4}
                  placeholder="Detailed description for service pages"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon (Lucide icon name)</Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., Home, Building2, Factory"
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active Service</Label>
                </div>
              </div>

              <ImageUpload
                label="Service Image"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                placeholder="Upload service image or paste URL"
              />

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded">
                        <span className="flex-1">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gradient-primary text-white"
                  disabled={createService.isPending || updateService.isPending}
                >
                  {editingService ? "Update" : "Create"} Service
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
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="border-0 shadow-elegant">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Service</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Features</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service: any) => (
                    <tr key={service.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            {service.image ? (
                              <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Wrench className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{service.title}</div>
                            <div className="text-sm text-muted-foreground">{service.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-foreground">{service.category}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            service.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleServiceStatus(service)}
                          >
                            {service.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {service.features?.length || 0} features
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(service.id)}
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
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || categoryFilter
                  ? "Try adjusting your filters"
                  : "Get started by adding your first service"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
