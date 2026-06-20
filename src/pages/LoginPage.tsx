import { useState, FormEvent } from "react";
import axios from "axios";
import { HomeQuickSearch } from "../components/HomeHero";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      alert(response?.data?.message || "Login successful");
    } catch (error) {
      console.error(error);
      // Show a simple alert on error (backend message if available)
      alert((error as any)?.response?.data?.message || "Login failed");
    }
  }

  return (
    <>
      <section className="login-hero" aria-labelledby="login-hero-title">
        <div className="login-hero__content">
          <h1 id="login-hero-title">
            Be a Reason for <span>Someone</span>
            <br />
            Else's Life
          </h1>
          <p>Every drop counts. Connect with blood donors near you in seconds and help save a life today.</p>
          <div className="login-hero__actions">
            <a className="home-hero__primary" href="#login">
              Become a donor <ArrowRightIcon />
            </a>
            <a className="home-hero__secondary" href="#urgent-requests">
              Request blood now
            </a>
          </div>
        </div>

        <form className="login-card" aria-labelledby="login-title" onSubmit={handleSubmit}>
          <h2 id="login-title">Log in</h2>
          <label>
            <span className="sr-only">Email address</span>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Password</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <a className="login-card__forgot" href="#forgot-password">
            Forget password?
          </a>
          <button className="login-card__submit" type="submit">
            Send
          </button>
          <p>
            Create new account? <a href="#sign-up">Sign up</a>
          </p>
        </form>
      </section>

      <HomeQuickSearch variant="login" />
    </>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"></path>
      <path d="m13 6 6 6-6 6"></path>
    </svg>
  );
}
