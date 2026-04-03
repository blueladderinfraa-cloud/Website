import { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image,
  FileText,
  Calendar,
  Upload,
  Pencil,
} from "lucide-react";

export default function AdminProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const projectId = parseInt(id || "0");
  const isNew = !projectId;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    category: "residential" as "residential" | "commercial" | "industrial" | "infrastructure",
    status: "upcoming" as "upcoming" | "ongoing" | "completed",
    coverImage: "",
    beforeImage: "",
    afterImage: "",
    client: "",
    area: "",
    progress: "0",
    featured: false,
    startDate: "",
    endDate: "",
  });

  const [phases, setPhases] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  const utils = trpc.useUtils();
  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  const createProject = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success("Project created successfully!");
      navigate(`/admin/projects/${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create project");
      console.error(error);
    },
  });

  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      utils.projects.getById.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Failed to update project");
      console.error(error);
    },
  });

  const uploadImage = trpc.upload.image.useMutation();

  const addGalleryImage = trpc.projects.addImage.useMutation({
    onSuccess: () => {
      toast.success("Image added to gallery!");
      utils.projects.getById.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Failed to add image");
      console.error(error);
    },
  });

  const deleteGalleryImage = trpc.projects.deleteImage.useMutation({
    onSuccess: () => {
      toast.success("Image removed from gallery");
      utils.projects.getById.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Failed to delete image");
      console.error(error);
    },
  });

  const addPhase = trpc.projects.addPhase.useMutation({
    onSuccess: () => {
      toast.success("Phase added!");
      utils.projects.getById.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Failed to add phase");
      console.error(error);
    },
  });

  const updatePhase = trpc.projects.updatePhase.useMutation({
    onSuccess: () => {
      toast.success("Phase updated!");
      utils.projects.getById.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Failed to update phase");
      console.error(error);
    },
  });

  const deletePhase = trpc.projects.deletePhase.useMutation({
    onSuccess: () => {
      toast.success("Phase deleted!");
      utils.projects.getById.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error("Failed to delete phase");
      console.error(error);
    },
  });

  // Gallery image upload
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [showGalleryCaptionDialog, setShowGalleryCaptionDialog] = useState(false);
  const [pendingGalleryFile, setPendingGalleryFile] = useState<File | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Phase dialog state
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<any | null>(null);
  const [phaseForm, setPhaseForm] = useState({
    name: "",
    description: "",
    status: "pending" as "pending" | "in_progress" | "completed",
    startDate: "",
    endDate: "",
  });

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be less than 20MB");
      return;
    }
    setPendingGalleryFile(file);
    setGalleryCaption("");
    setShowGalleryCaptionDialog(true);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleGalleryUploadConfirm = async () => {
    if (!pendingGalleryFile) return;
    setIsUploadingGallery(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pendingGalleryFile);
      });

      const { url } = await uploadImage.mutateAsync({
        base64,
        filename: pendingGalleryFile.name,
        contentType: pendingGalleryFile.type,
        folder: "gallery",
      });

      await addGalleryImage.mutateAsync({
        projectId,
        imageUrl: url,
        caption: galleryCaption || undefined,
        sortOrder: images.length,
      });

      setShowGalleryCaptionDialog(false);
      setPendingGalleryFile(null);
      setGalleryCaption("");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    deleteGalleryImage.mutate({ id: imageId });
  };

  const openAddPhaseDialog = () => {
    setEditingPhase(null);
    setPhaseForm({ name: "", description: "", status: "pending", startDate: "", endDate: "" });
    setShowPhaseDialog(true);
  };

  const openEditPhaseDialog = (phase: any) => {
    setEditingPhase(phase);
    setPhaseForm({
      name: phase.name || "",
      description: phase.description || "",
      status: phase.status || "pending",
      startDate: phase.startDate ? new Date(phase.startDate).toISOString().split("T")[0] : "",
      endDate: phase.endDate ? new Date(phase.endDate).toISOString().split("T")[0] : "",
    });
    setShowPhaseDialog(true);
  };

  const handlePhaseSubmit = () => {
    if (!phaseForm.name.trim()) {
      toast.error("Phase name is required");
      return;
    }

    const data = {
      name: phaseForm.name,
      description: phaseForm.description || undefined,
      status: phaseForm.status,
      startDate: phaseForm.startDate ? new Date(phaseForm.startDate) : undefined,
      endDate: phaseForm.endDate ? new Date(phaseForm.endDate) : undefined,
    };

    if (editingPhase) {
      updatePhase.mutate({ id: editingPhase.id, ...data });
    } else {
      addPhase.mutate({ projectId, ...data, sortOrder: phases.length });
    }
    setShowPhaseDialog(false);
  };

  const handleDeletePhase = (phaseId: number) => {
    if (!confirm("Are you sure you want to delete this phase?")) return;
    deletePhase.mutate({ id: phaseId });
  };

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        slug: project.slug,
        description: project.description || "",
        location: project.location || "",
        category: project.category as "residential" | "commercial" | "industrial" | "infrastructure",
        status: project.status as "upcoming" | "ongoing" | "completed",
        coverImage: project.coverImage || "",
        beforeImage: project.beforeImage || "",
        afterImage: project.afterImage || "",
        client: project.clientName || "",
        area: project.sqftBuilt?.toString() || "",
        progress: project.progress?.toString() || "0",
        featured: project.featured || false,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
      });
      setPhases(project.phases || []);
      setImages(project.images || []);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      area: formData.area ? parseInt(formData.area) : undefined,
      progress: formData.progress ? parseInt(formData.progress) : 0,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };

    if (isNew) {
      createProject.mutate(data);
    } else {
      updateProject.mutate({ id: projectId, ...data });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    navigate(getLoginUrl());
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/admin/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <span className="font-semibold text-foreground truncate">
                {isNew ? "New Project" : `Edit: ${project?.title}`}
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              className="gradient-primary text-white"
              disabled={createProject.isPending || updateProject.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {isNew ? "Create" : "Save"} Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-4 md:py-8 px-3 md:px-4">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="details" className="flex-1 md:flex-none">Details</TabsTrigger>
            <TabsTrigger value="images" className="flex-1 md:flex-none">Images</TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 md:flex-none">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-elegant">
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                title: e.target.value,
                                slug: isNew ? generateSlug(e.target.value) : formData.slug,
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
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Client</Label>
                          <Input
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                          />
                        </div>
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
                          <Label>Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="ongoing">Ongoing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Area (sq ft)</Label>
                          <Input
                            type="number"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Progress (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.progress}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              setFormData({ ...formData, progress: val.toString() });
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-0 shadow-elegant">
                    <CardHeader>
                      <CardTitle>Cover Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.coverImage ? (
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={formData.coverImage}
                            alt="Cover"
                            className="w-full h-40 object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setFormData({ ...formData, coverImage: "" })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="h-40 border-2 border-dashed rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Image className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">No cover image</p>
                          </div>
                        </div>
                      )}
                      <Input
                        placeholder="Image URL"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-elegant">
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Label>Featured Project</Label>
                        <Switch
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="images">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle>Before & After Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Before Image URL</Label>
                    <Input
                      value={formData.beforeImage}
                      onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value })}
                      placeholder="https://..."
                    />
                    {formData.beforeImage && (
                      <img
                        src={formData.beforeImage}
                        alt="Before"
                        className="w-full h-40 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>After Image URL</Label>
                    <Input
                      value={formData.afterImage}
                      onChange={(e) => setFormData({ ...formData, afterImage: e.target.value })}
                      placeholder="https://..."
                    />
                    {formData.afterImage && (
                      <img
                        src={formData.afterImage}
                        alt="After"
                        className="w-full h-40 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-elegant mt-6">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle>Gallery Images</CardTitle>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryFileSelect}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isNew || isUploadingGallery}
                  onClick={() => galleryFileInputRef.current?.click()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isUploadingGallery ? "Uploading..." : "Add Image"}
                </Button>
              </CardHeader>
              <CardContent>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img: any) => (
                      <div key={img.id} className="relative rounded-lg overflow-hidden group">
                        <img
                          src={img.imageUrl}
                          alt={img.caption || "Gallery image"}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteGalleryImage(img.id)}
                            disabled={deleteGalleryImage.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No gallery images yet</p>
                    {isNew && <p className="text-xs mt-1">Save the project first to add gallery images</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery caption dialog */}
            <Dialog open={showGalleryCaptionDialog} onOpenChange={setShowGalleryCaptionDialog}>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Add Gallery Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {pendingGalleryFile && (
                    <p className="text-sm text-muted-foreground">
                      File: {pendingGalleryFile.name}
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label>Caption (optional)</Label>
                    <Input
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      placeholder="Enter image caption..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowGalleryCaptionDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGalleryUploadConfirm} disabled={isUploadingGallery}>
                    {isUploadingGallery ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="border-0 shadow-elegant">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle>Project Phases</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isNew}
                  onClick={openAddPhaseDialog}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
                </Button>
              </CardHeader>
              <CardContent>
                {phases.length > 0 ? (
                  <div className="space-y-4">
                    {phases.map((phase: any, index: number) => (
                      <div key={phase.id} className="p-4 bg-secondary/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{phase.name}</h4>
                            <p className="text-sm text-muted-foreground">{phase.description}</p>
                            {(phase.startDate || phase.endDate) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {phase.startDate && new Date(phase.startDate).toLocaleDateString()}
                                {phase.startDate && phase.endDate && " - "}
                                {phase.endDate && new Date(phase.endDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              phase.status === "completed" ? "bg-green-100 text-green-700" :
                              phase.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {phase.status}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditPhaseDialog(phase)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePhase(phase.id)}
                              disabled={deletePhase.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No phases defined yet</p>
                    {isNew && <p className="text-xs mt-1">Save the project first to add phases</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Phase add/edit dialog */}
            <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>{editingPhase ? "Edit Phase" : "Add Phase"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={phaseForm.name}
                      onChange={(e) => setPhaseForm({ ...phaseForm, name: e.target.value })}
                      placeholder="e.g. Foundation Work"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={phaseForm.description}
                      onChange={(e) => setPhaseForm({ ...phaseForm, description: e.target.value })}
                      placeholder="Describe this phase..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={phaseForm.status}
                      onValueChange={(value: "pending" | "in_progress" | "completed") =>
                        setPhaseForm({ ...phaseForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={phaseForm.startDate}
                        onChange={(e) => setPhaseForm({ ...phaseForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={phaseForm.endDate}
                        onChange={(e) => setPhaseForm({ ...phaseForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPhaseDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePhaseSubmit}
                    disabled={addPhase.isPending || updatePhase.isPending}
                  >
                    {addPhase.isPending || updatePhase.isPending
                      ? "Saving..."
                      : editingPhase
                        ? "Update Phase"
                        : "Add Phase"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
