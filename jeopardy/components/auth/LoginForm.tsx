"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";

type LoginFormProps = {
  onSwitch: () => void;
};

const LoginForm = ({ onSwitch }: LoginFormProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getErrorMessage = (err: unknown) => {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "Email or password is incorrect.";
        case "auth/invalid-email":
          return "Email format is invalid.";
        default:
          return err.message;
      }
    }
    return "Login failed. Please check your credentials.";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Welcome back</h2>
      <p className="muted">Sign in to host or join a game.</p>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {error ? <p className="error-text">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
      <button type="button" className="link" onClick={onSwitch}>
        Need an account? Create one
      </button>
    </form>
  );
};

export default LoginForm;
