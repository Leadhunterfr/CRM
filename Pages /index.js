// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirige vers la page d'accueil du CRM
    router.push("/contacts"); // ou "/pipeline" si tu veux
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Chargement...</h1>
    </div>
  );
}
