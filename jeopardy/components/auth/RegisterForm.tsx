"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";

type RegisterFormProps = {
  onSwitch: () => void;
};

const RegisterForm = ({ onSwitch }: RegisterFormProps) => {
  const { register } = useAuth();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getErrorMessage = (err: unknown) => {
    if (typeof err === "string") {
      return err;
    }
    if (err && typeof err === "object" && "code" in err && "message" in err) {
      return `${(err as { code: string }).code}: ${(err as { message: string }).message}`;
    }
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/email-already-in-use":
          return "Email already in use. Try signing in.";
        case "auth/invalid-email":
          return "Email format is invalid.";
        case "auth/weak-password":
          return "Password is too weak. Use at least 6 characters.";
        default:
          return err.message;
      }
    }
    return "Registration failed. Please try again.";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim() || undefined);
    } catch (err) {
      console.error("Registration error", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create your host profile</h2>
      <p className="muted">Start building your Jeopardy board.</p>
      <Input
        label="Display name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
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
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {error ? <p className="error-text">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </Button>
      <button type="button" className="link" onClick={onSwitch}>
        Already have an account? Sign in
      </button>
    </form>
  );
};

export default RegisterForm;
