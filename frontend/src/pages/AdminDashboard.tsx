import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Crown,
  LayoutDashboard,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { authApi, propertyApi } from "@/lib/api";
import { useUserRole } from "@/hooks/use-user-role";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Tab = "listings" | "users";

const AdminDashboard = () => {
  const { getToken, isSignedIn } = useAuth();
  const { isAdmin, isLoading: roleLoading, userId: currentUserId } = useUserRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<{ userId: string; currentRole: string } | null>(null);

  // ── Listings data ──
  const {
    data: properties = [],
    isLoading: propertiesLoading,
  } = useQuery({
    queryKey: ["properties"],
    queryFn: () => propertyApi.getProperties(),
    enabled: isAdmin,
  });

  // ── Users data ──
  const {
    data: usersData,
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return authApi.getAllUsers(token);
    },
    enabled: isAdmin && activeTab === "users",
  });

  // ── Delete property mutation ──
  const deleteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return propertyApi.deleteProperty(propertyId, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  });

  // ── Update role mutation ──
  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return authApi.updateUserRole(userId, role, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const handleDelete = useCallback((propertyId: string) => {
    setDeleteTarget(propertyId);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget, {
        onSettled: () => setDeleteTarget(null),
      });
    }
  }, [deleteTarget, deleteMutation]);

  const handleRoleToggle = useCallback((userId: string, currentRole: string) => {
    setRoleTarget({ userId, currentRole });
  }, []);

  const confirmRoleToggle = useCallback(() => {
    if (roleTarget) {
      const newRole = roleTarget.currentRole === "admin" ? "user" : "admin";
      roleMutation.mutate({ userId: roleTarget.userId, role: newRole }, {
        onSettled: () => setRoleTarget(null),
      });
    }
  }, [roleTarget, roleMutation]);

  // ── Loading / Access guard ──
  if (roleLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="animate-pulse text-muted-foreground">Checking permissions...</div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="mt-3 text-muted-foreground">
            This area is restricted to administrators only.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-foreground transition"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="flex items-center gap-2">
              <LayoutDashboard size={20} className="text-primary" />
              <h1 className="text-xl font-bold md:text-2xl">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/owner/list-property"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus size={16} /> New Listing
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-border">
        <div className="mx-auto flex gap-0 px-4 md:px-8">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
              activeTab === "listings"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard size={16} /> Listings
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users size={16} /> Users
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* ═══════════ LISTINGS TAB ═══════════ */}
        {activeTab === "listings" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                All Listings{" "}
                <span className="text-muted-foreground font-normal">({properties.length})</span>
              </h2>
            </div>

            {propertiesLoading ? (
              <div className="animate-pulse text-muted-foreground">Loading listings...</div>
            ) : properties.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
                <p className="text-muted-foreground">No listings yet.</p>
                <Link
                  to="/owner/list-property"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  <Plus size={16} /> Create First Listing
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/60">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Property</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Location</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Type</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => {
                      const img = property.images?.[0]
                        ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${property.images[0]}`
                        : null;
                      return (
                        <tr
                          key={property._id}
                          className="border-b border-border last:border-0 hover:bg-card/40 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {img ? (
                                <img
                                  src={img}
                                  alt=""
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-muted" />
                              )}
                              <span className="font-medium line-clamp-1">{property.title}</span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                            {property.location || "—"}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                            {property.houseType || "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            ₹{property.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/owner/list-property?edit=${property._id}`)}
                                className="rounded-lg bg-blue-500/10 p-2 text-blue-500 transition hover:bg-blue-500/20"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(property._id)}
                                disabled={deleteMutation.isPending}
                                className="rounded-lg bg-red-500/10 p-2 text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ USERS TAB ═══════════ */}
        {activeTab === "users" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                User Management{" "}
                <span className="text-muted-foreground font-normal">
                  ({usersData?.count ?? 0})
                </span>
              </h2>
            </div>

            {usersLoading ? (
              <div className="animate-pulse text-muted-foreground">Loading users...</div>
            ) : !usersData?.users?.length ? (
              <p className="text-muted-foreground">No users found.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/60">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.users.map((user: any) => {
                      const isSelf = user._id === currentUserId;
                      return (
                        <tr
                          key={user._id}
                          className="border-b border-border last:border-0 hover:bg-card/40 transition"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {user.role === "admin" ? <Crown size={16} /> : <User size={16} />}
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                            {user.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-blue-500/10 text-blue-500"
                              }`}
                            >
                              {user.role === "admin" ? <Crown size={12} /> : <User size={12} />}
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isSelf ? (
                              <span className="text-xs text-muted-foreground italic">You</span>
                            ) : (
                              <button
                                onClick={() => handleRoleToggle(user._id, user.role)}
                                disabled={roleMutation.isPending}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                                  user.role === "admin"
                                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                }`}
                              >
                                {user.role === "admin" ? "Demote" : "Promote"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Listing"
        description="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={roleTarget !== null}
        title={roleTarget?.currentRole === "admin" ? "Demote User" : "Promote User"}
        description={
          roleTarget?.currentRole === "admin"
            ? "This user will lose admin privileges and won't be able to manage listings."
            : "This user will gain admin access and be able to create, edit, and delete listings."
        }
        confirmLabel={roleTarget?.currentRole === "admin" ? "Demote" : "Promote"}
        variant={roleTarget?.currentRole === "admin" ? "danger" : "warning"}
        loading={roleMutation.isPending}
        onConfirm={confirmRoleToggle}
        onCancel={() => setRoleTarget(null)}
      />
    </main>
  );
};

export default AdminDashboard;
