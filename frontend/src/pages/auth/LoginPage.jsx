import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderGit2, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate("/app");
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to connect to authentication server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl space-y-6 text-left">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-lg text-white">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">DevCollab</h1>
            <p className="text-xs text-gray-400">Developer Collaboration Platform</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-100">Sign in to your account</h2>
          <p className="text-xs text-gray-400 mt-1">
            Access your organizations, workspaces, and team RBAC rules.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="developer@company.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" loading={loading} className="w-full">
            Sign In <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <span className="text-gray-400">Controlled User Provisioning System</span>
          <Link to="/setup/admin" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Initial Admin Setup
          </Link>
        </div>
      </div>
    </div>
  );
};
