import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Users, Building2, Plus, ArrowLeft, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { platformAdminApi } from "../../services/platform-admin.api.js";
import { Button } from "../../components/common/Button.jsx";
import { Input } from "../../components/common/Input.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { Badge } from "../../components/common/Badge.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

export const PlatformAdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState("orgs"); // 'orgs' | 'users'
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  // Create Organization Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const checkAdminAndFetch = async () => {
    setLoading(true);
    try {
      const meRes = await platformAdminApi.getMe();
      if (meRes.success && meRes.isPlatformAdmin) {
        setIsAdmin(true);
        const [usersRes, orgsRes] = await Promise.all([
          platformAdminApi.getUsers(),
          platformAdminApi.getOrganizations(),
        ]);
        if (usersRes.success && usersRes.users) setUsers(usersRes.users);
        if (orgsRes.success && orgsRes.organizations) setOrganizations(orgsRes.organizations);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const resetForm = () => {
    setOrgName("");
    setOrgSlug("");
    setOwnerFirstName("");
    setOwnerLastName("");
    setOwnerUsername("");
    setOwnerEmail("");
    setOwnerPassword("");
    setCreateError("");
  };

  const handleOrgNameChange = (val) => {
    setOrgName(val);
    if (!orgSlug || orgSlug === orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setOrgSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
    }
  };

  const handleCreateOrgAndOwner = async (e) => {
    e.preventDefault();
    setCreateError("");
    setSuccessMsg("");
    setCreateLoading(true);

    try {
      const res = await platformAdminApi.createOrganizationAndOwner({
        name: orgName,
        slug: orgSlug,
        owner: {
          firstName: ownerFirstName,
          lastName: ownerLastName,
          username: ownerUsername,
          email: ownerEmail,
          password: ownerPassword,
        },
      });

      if (res.success) {
        setSuccessMsg(
          `Organization "${res.organization.name}" created successfully. Owner: ${res.owner.email}`
        );
        setModalOpen(false);
        resetForm();
        // Refresh orgs and users
        const [usersRes, orgsRes] = await Promise.all([
          platformAdminApi.getUsers(),
          platformAdminApi.getOrganizations(),
        ]);
        if (usersRes.success && usersRes.users) setUsers(usersRes.users);
        if (orgsRes.success && orgsRes.organizations) setOrganizations(orgsRes.organizations);
      } else {
        setCreateError(res.message || "Failed to create organization.");
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "Error creating organization.");
    } finally {
      setOwnerPassword(""); // Immediately clear password state
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Verifying platform administration privileges..." fullPage />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <EmptyState
          icon={ShieldAlert}
          title="Access Denied"
          description="You do not have Platform Admin privileges. Controlled platform administration requires elevated authority."
          action={
            <Link to="/app">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-1" /> Return to Workspace
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Admin Top Navbar */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-600 rounded text-white font-bold text-xs flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> PLATFORM ADMIN
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-100">DevCollab Platform Administration</h1>
          </div>
        </div>

        <Link to="/app">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Exit Admin
          </Button>
        </Link>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 text-left">
        {successMsg && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-emerald-200 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Platform Organizations</p>
              <h3 className="text-2xl font-bold text-gray-100 mt-1">{organizations.length}</h3>
            </div>
            <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-lg text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Registered Platform Users</p>
              <h3 className="text-2xl font-bold text-gray-100 mt-1">{users.length}</h3>
            </div>
            <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-lg text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Header & Main Platform Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("orgs")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === "orgs"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800"
              }`}
            >
              <Building2 className="w-4 h-4" /> Organizations ({organizations.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800"
              }`}
            >
              <Users className="w-4 h-4" /> All Users ({users.length})
            </button>
          </div>

          <Button onClick={() => { resetForm(); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Create Organization
          </Button>
        </div>

        {/* Tab 1: Organizations Overview */}
        {activeTab === "orgs" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Members</th>
                    <th className="px-4 py-3">Workspaces</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {organizations.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-semibold text-gray-100">{o.name}</td>
                      <td className="px-4 py-3 font-mono text-indigo-400">{o.slug}</td>
                      <td className="px-4 py-3">{o.member_count} members</td>
                      <td className="px-4 py-3">{o.workspace_count} workspaces</td>
                      <td className="px-4 py-3">
                        {o.is_active ? (
                          <Badge variant="emerald">Active</Badge>
                        ) : (
                          <Badge variant="rose">Archived</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users Overview */}
        {activeTab === "users" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Platform Authority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-semibold text-gray-100">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-indigo-400">@{u.username}</td>
                      <td className="px-4 py-3 text-gray-300">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.is_platform_admin ? (
                          <Badge variant="indigo">Platform Admin</Badge>
                        ) : (
                          <Badge variant="gray">Provisioned Account</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.is_active ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create Organization & Organization Owner */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Organization & Owner"
        description="Onboards a new organization and provisions its initial Organization Owner."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateOrgAndOwner} className="space-y-4 text-left">
          {createError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {createError}
            </div>
          )}

          {/* Section 1: Organization Details */}
          <div className="p-3.5 border border-gray-800 rounded-lg bg-gray-950/60 space-y-3">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              1. Organization Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Organization Name"
                placeholder="e.g. Acme Corp"
                value={orgName}
                required
                onChange={(e) => handleOrgNameChange(e.target.value)}
              />
              <Input
                label="Organization Slug"
                placeholder="e.g. acme-corp"
                value={orgSlug}
                required
                onChange={(e) => setOrgSlug(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Organization Owner Details */}
          <div className="p-3.5 border border-gray-800 rounded-lg bg-gray-950/60 space-y-3">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              2. Organization Owner Account
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="John"
                value={ownerFirstName}
                required
                onChange={(e) => setOwnerFirstName(e.target.value)}
              />
              <Input
                label="Last Name"
                placeholder="Owner"
                value={ownerLastName}
                required
                onChange={(e) => setOwnerLastName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Username"
                placeholder="johnowner"
                value={ownerUsername}
                required
                onChange={(e) => setOwnerUsername(e.target.value)}
              />
              <Input
                label="Owner Email"
                type="email"
                placeholder="owner@acme.com"
                value={ownerEmail}
                required
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>

            <Input
              label="Owner Initial Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={ownerPassword}
              required
              onChange={(e) => setOwnerPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Create Organization & Owner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
