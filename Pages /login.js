// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // ici tu connectes ton backend / supabase / base44 API
    // pour valider l'auth utilisateur
    if (email && password) {
      // simulate login ok
      router.push("/dashboard"); // page après login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">CRM Flow</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full border px-3 py-2 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              type="password"
              className="mt-1 w-full border px-3 py-2 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
          >
            Se connecter
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            S’inscrire
          </a>
        </div>
      </div>
    </div>
  );
}
