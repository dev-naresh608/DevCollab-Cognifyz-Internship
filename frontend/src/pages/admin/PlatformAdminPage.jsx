import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Users, Building2, UserPlus, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'orgs'
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  // User Provisioning Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [provError, setProvError] = useState("");
  const [provLoading, setProvLoading] = useState(false);

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

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    setProvError("");
    setProvLoading(true);

    try {
      const res = await platformAdminApi.provisionUser({
        firstName,
        lastName,
        username,
        email,
        password,
      });

      if (res.success) {
        setModalOpen(false);
        setFirstName("");
        setLastName("");
        setUsername("");
        setEmail("");
        setPassword("");
        // Refresh users
        const usersRes = await platformAdminApi.getUsers();
        if (usersRes.success && usersRes.users) setUsers(usersRes.users);
      } else {
        setProvError(res.message || "Failed to provision user.");
      }
    } catch (err) {
      setProvError(err.response?.data?.message || "Error provisioning user.");
    } finally {
      setProvLoading(false);
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
          <div className="p-1.5 bg-indigo-600 rounded text-white font-bold text-xs">
            ADMIN
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
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Provisioned Users</p>
              <h3 className="text-2xl font-bold text-gray-100 mt-1">{users.length}</h3>
            </div>
            <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-lg text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Platform Organizations</p>
              <h3 className="text-2xl font-bold text-gray-100 mt-1">{organizations.length}</h3>
            </div>
            <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-lg text-indigo-400">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Header & Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800"
              }`}
            >
              <Users className="w-4 h-4" /> Provisioned Users ({users.length})
            </button>
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
          </div>

          {activeTab === "users" && (
            <Button onClick={() => setModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1" /> Provision User
            </Button>
          )}
        </div>

        {/* Tab 1: Provisioned Users */}
        {activeTab === "users" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-300">
                <thead className="bg-gray-950 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Platform Role</th>
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
                      <td className="px-4 py-3 font-mono text-indigo-400">{u.username}</td>
                      <td className="px-4 py-3 text-gray-300">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.is_platform_admin ? (
                          <Badge variant="indigo">Platform Admin</Badge>
                        ) : (
                          <Badge variant="gray">Provisioned User</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.is_active ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
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

        {/* Tab 2: Organizations Overview */}
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
      </main>

      {/* Modal: Provision Controlled User */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Provision Platform User"
        description="Controlled user provisioning. Created user will be able to log in immediately."
      >
        <form onSubmit={handleProvisionUser} className="space-y-4">
          {provError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-md">
              {provError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="Jane"
              value={firstName}
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              placeholder="Developer"
              value={lastName}
              required
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Username"
            placeholder="janedev"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@company.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={provLoading}>
              Provision User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
