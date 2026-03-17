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
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Search,
  Users,
  Shield,
  User,
  Eye,
  Building2,
} from "lucide-react";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();

  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated!");
      utils.users.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5 text-red-600" />;
      case "client":
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case "subcontractor":
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      client: "bg-blue-100 text-blue-700",
      subcontractor: "bg-green-100 text-green-700",
      user: "bg-gray-100 text-gray-700",
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const filteredUsers = users?.filter((u: any) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!u.name?.toLowerCase().includes(query) && !u.email?.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (roleFilter && roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  }) || [];

  return (
    <AdminLayout currentPage="users" title="Users" description="Manage user accounts and roles">

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
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Last Active</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="border-t">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {getRoleIcon(u.role)}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {u.name || "Unnamed User"}
                              </div>
                              {u.company && (
                                <div className="text-sm text-muted-foreground">{u.company}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {u.email || "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Select
                              value={u.role}
                              onValueChange={(value: "admin" | "client" | "subcontractor" | "user") => {
                                updateRole.mutate({ userId: u.id, role: value });
                              }}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(u.role)}`}>
                              {u.role}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(u.lastSignedIn).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(u)}
                            >
                              <Eye className="w-4 h-4" />
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
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || roleFilter
                    ? "Try adjusting your filters"
                    : "Users will appear here after they sign in"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>User Details: {selectedUser?.name || "Unnamed User"}</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <div className="font-medium">{selectedUser.name || "Not provided"}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <div className="font-medium">{selectedUser.email || "Not provided"}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(selectedUser.role)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Company:</span>
                    <div className="font-medium">{selectedUser.company || "Not provided"}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <div className="font-medium">{selectedUser.phone || "Not provided"}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Joined:</span>
                    <div className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Last Active:</span>
                    <div className="font-medium">{new Date(selectedUser.lastSignedIn).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Login Method:</span>
                    <div className="font-medium">{selectedUser.loginMethod || "Not specified"}</div>
                  </div>
                </div>

                {/* Role-specific information */}
                {selectedUser.role === "client" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Client Information</h4>
                    <p className="text-sm text-muted-foreground">
                      This user has client access and can view assigned projects and documents.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Note:</strong> Project assignment functionality will be available in a future update.
                    </p>
                  </div>
                )}

                {selectedUser.role === "subcontractor" && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Subcontractor Information</h4>
                    <p className="text-sm text-muted-foreground">
                      This user has subcontractor access and can view and apply for tenders.
                    </p>
                  </div>
                )}

                {selectedUser.role === "admin" && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Administrator Access</h4>
                    <p className="text-sm text-muted-foreground">
                      This user has full administrative access to the system.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
    </AdminLayout>
  );
}
