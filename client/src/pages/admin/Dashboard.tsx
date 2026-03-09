import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Building2,
  FileText,
  Users,
  Briefcase,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  try {
    return (
      <AdminLayout 
        currentPage="dashboard" 
        title="Dashboard"
        description="Admin dashboard overview"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to the Blueladder Infrastructure admin panel</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Active Projects", value: "12", icon: Building2, color: "bg-blue-500", href: "/admin/projects" },
              { title: "New Inquiries", value: "8", icon: MessageSquare, color: "bg-green-500", href: "/admin/inquiries" },
              { title: "Total Clients", value: "45", icon: Users, color: "bg-purple-500", href: "/admin/users" },
              { title: "Total Projects", value: "67", icon: Briefcase, color: "bg-orange-500", href: "/admin/projects" },
            ].map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.title}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/projects">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <Building2 className="w-6 h-6 text-primary" />
                    <span>Manage Projects</span>
                  </Button>
                </Link>
                <Link href="/admin/inquiries">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    <span>View Inquiries</span>
                  </Button>
                </Link>
                <Link href="/admin/services">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <span>Edit Services</span>
                  </Button>
                </Link>
                <Link href="/admin/content">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span>Website Content</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>Admin Dashboard - Error</h1>
        <p>There was an error loading the dashboard. Please check the console for details.</p>
        <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
      </div>
    );
  }
}
