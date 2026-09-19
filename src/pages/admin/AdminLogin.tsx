'use client'
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "../../components/brand/BrandLogo";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../state/AuthContext";
import { useMeta } from "../../hooks/useMeta";

export const AdminLogin = () => {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useMeta("Admin Login | GODID", "Secure GODID admin login.");
  if (user?.role === "admin") {
    router.replace("/admin");
    return null;
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await login(email, password, "admin");
      router.push("/admin");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in.");
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f8] px-4">
      <form className="w-full max-w-md border border-line bg-white p-8 shadow-soft" onSubmit={submit}>
        <BrandLogo size="lg" variant="admin" />
        <h1 className="mt-8 font-display text-3xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-sm text-muted">Sign in with a Firebase account that has the GODID admin claim.</p>
        <div className="mt-8 grid gap-4">
          <Input label="Admin email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? <p className="text-sm font-semibold text-clay">{error}</p> : null}
          <Button>Login securely</Button>
        </div>
      </form>
    </main>
  );
};
