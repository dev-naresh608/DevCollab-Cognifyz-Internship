import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck, Key, ArrowRight, ArrowLeft } from "lucide-react";
import { platformAdminApi } from "../../services/platform-admin.api.js";
import { Input } from "../../components/common/Input.jsx";
import { Button } from "../../components/common/Button.jsx";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";

export const BootstrapAdminPage = () => {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const [secret, setSecret] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await platformAdminApi.checkStatus();
        if (res.success) {
          setIsBootstrapped(res.isBootstrapped);
        }
      } catch (err) {
        console.error("Failed to check bootstrap status", err);
      } finally {
        setChecking(false);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await platformAdminApi.bootstrap(secret, {
        firstName,
        lastName,
        username,
        email,
        password,
      });

      if (res.success) {
        setSuccessMsg("Initial Platform Admin created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(res.message || "Failed to bootstrap Platform Admin.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to connect to server during admin bootstrap.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <LoadingSpinner label="Checking platform setup status..." fullPage />;
  }

  if (isBootstrapped) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl space-y-6 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-950/80 border border-indigo-800 rounded-full flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Setup Already Completed</h1>
            <p className="text-xs text-gray-400 mt-2">
              The initial Platform Admin account has already been bootstrapped. One-time setup is no longer available.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/login">
              <Button className="w-full">
                Proceed to Login <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl space-y-6 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-lg text-white">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">Platform Admin Setup</h1>
              <p className="text-xs text-gray-400">One-time initial bootstrap</p>
            </div>
          </div>
          <Link to="/login" className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Login
          </Link>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-200">Create First Platform Admin</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Requires the deployment <code className="text-indigo-400">X-Platform-Bootstrap-Secret</code> header value.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-md">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-md">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Bootstrap Secret Key"
            type="password"
            placeholder="Enter PLATFORM_ADMIN_BOOTSTRAP_SECRET"
            value={secret}
            required
            onChange={(e) => setSecret(e.target.value)}
            helperText="Check your server deployment .env file for PLATFORM_ADMIN_BOOTSTRAP_SECRET."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="System"
              value={firstName}
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              placeholder="Admin"
              value={lastName}
              required
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Username"
            placeholder="sysadmin"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@devcollab.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" loading={loading} className="w-full">
            Bootstrap Platform Admin <ShieldAlert className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
};
