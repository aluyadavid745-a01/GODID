import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../state/AuthContext";
import { useMeta } from "../../hooks/useMeta";

export const LoginPage = () => <AuthForm mode="login" />;
export const RegisterPage = () => <AuthForm mode="register" />;
const AuthForm = ({ mode }: { mode: "login" | "register" }) => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useMeta(mode === "login" ? "Login | GODID" : "Register | GODID", "Access your GODID customer account.");
  if (user?.role === "customer") return <Navigate to="/account" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "register") await register(name, email, password);
      else await login(email, password, "customer");
      navigate("/account");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not authenticate.");
    }
  };
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl font-semibold">{mode === "login" ? "Login" : "Create account"}</h1>
      <form className="mt-8 grid gap-4" onSubmit={submit}>
        {mode === "register" ? <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required /> : null}
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error ? <p className="text-sm font-semibold text-clay">{error}</p> : null}
        <Button>{mode === "login" ? "Login" : "Register"}</Button>
        <Button to={mode === "login" ? "/register" : "/login"} variant="secondary">{mode === "login" ? "Create account" : "Already have an account"}</Button>
      </form>
    </main>
  );
};
