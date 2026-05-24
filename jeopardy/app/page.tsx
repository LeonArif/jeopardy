"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import useAuth from "@/hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showRegister, setShowRegister] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <main className="page">
      <div className="page-inner grid-two">
        <section className="hero">
          {/* <p className="hero-kicker">Live Jeopardy</p> */}
          <h1>Build trivia boards. Run the show. Buzz in live.</h1>
          <p>
            Host real-time Jeopardy nights with custom categories, instant
            buzzing, and score control in one place.
          </p>
        </section>
        {showRegister ? (
          <RegisterForm onSwitch={() => setShowRegister(false)} />
        ) : (
          <LoginForm onSwitch={() => setShowRegister(true)} />
        )}
      </div>
    </main>
  );
}