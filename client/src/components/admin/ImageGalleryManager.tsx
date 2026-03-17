import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Copy,
  Image as ImageIcon,
  Grid,
  List,
  Search,
} from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  filename?: string;
  size?: number;
  uploadedAt?: Date;
  category?: string;
}

interface ImageGalleryManagerProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  title?: string;
  allowMultiple?: boolean;
  categories?: string[];
  maxImages?: number;
}

export default function ImageGalleryManager({
  images,
  onImagesChange,
  title = "Image Gallery",
  allowMultiple = true,
  categories = ["General", "Projects", "Services", "Testimonials"],
  maxImages = 20,
}: ImageGalleryManagerProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [newImage, setNewImage] = useState({
    url: "",
    caption: "",
    alt: "",
    category: "General",
  });

  const filteredImages = images.filter((image) => {
    if (searchQuery && !image.caption?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !image.alt?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory && image.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleAddImage = () => {
    if (!newImage.url) {
      toast.error("Please select an image");
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const imageItem: ImageItem = {
      id: Date.now().toString(),
      url: newImage.url,
      caption: newImage.caption,
      alt: newImage.alt || newImage.caption,
      category: newImage.category,
      uploadedAt: new Date(),
    };

    onImagesChange([...images, imageItem]);
    setNewImage({ url: "", caption: "", alt: "", category: "General" });
    setIsAddDialogOpen(false);
    toast.success("Image added successfully!");
  };

  const handleUpdateImage = () => {
    if (!editingImage) return;

    const updatedImages = images.map((img) =>
      img.id === editingImage.id ? editingImage : img
    );
    onImagesChange(updatedImages);
    setEditingImage(null);
    toast.success("Image updated successfully!");
  };

  const handleDeleteImage = (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      const updatedImages = images.filter((img) => img.id !== id);
      onImagesChange(updatedImages);
      toast.success("Image deleted successfully!");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  const handleDownloadImage = (url: string, filename?: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-0 shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {title}
            <span className="text-sm font-normal text-muted-foreground">
              ({images.length}/{maxImages})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <ImageUpload
                    label="Image"
                    value={newImage.url}
                    onChange={(url) => setNewImage({ ...newImage, url })}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Caption</Label>
                      <Input
                        value={newImage.caption}
                        onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                        placeholder="Image caption"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alt Text</Label>
                      <Input
                        value={newImage.alt}
                        onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                        placeholder="Alt text for accessibility"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={newImage.category}
                      onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddImage} className="gradient-primary text-white">
                      Add Image
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Images Display */}
        {filteredImages.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary/50 border">
                    <img
                      src={image.url}
                      alt={image.alt || image.caption || "Image"}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E"; }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => handleCopyUrl(image.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => handleDownloadImage(image.url, image.filename)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => setEditingImage(image)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {image.caption && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.alt || image.caption || "Image"}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {image.caption || "Untitled Image"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {image.category} • {image.uploadedAt?.toLocaleDateString()}
                    </div>
                    {image.alt && (
                      <div className="text-xs text-muted-foreground truncate">
                        Alt: {image.alt}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(image.url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingImage(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Images Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory
                ? "Try adjusting your filters"
                : "Add your first image to get started"}
            </p>
          </div>
        )}

        {/* Edit Image Dialog */}
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Image</DialogTitle>
            </DialogHeader>
            {editingImage && (
              <div className="space-y-4">
                <div className="aspect-video w-full max-w-xs rounded-lg overflow-hidden border bg-secondary/50">
                  <img
                    src={editingImage.url}
                    alt={editingImage.alt || editingImage.caption || "Image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <Input
                      value={editingImage.caption || ""}
                      onChange={(e) =>
                        setEditingImage({ ...editingImage, caption: e.target.value })
                      }
                      placeholder="Image caption"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alt Text</Label>
                    <Input
                      value={editingImage.alt || ""}
                      onChange={(e) =>
                        setEditingImage({ ...editingImage, alt: e.target.value })
                      }
                      placeholder="Alt text for accessibility"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select
                    value={editingImage.category || "General"}
                    onChange={(e) =>
                      setEditingImage({ ...editingImage, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setEditingImage(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateImage} className="gradient-primary text-white">
                    Update Image
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}