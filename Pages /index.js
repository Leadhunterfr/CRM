// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login"); // première étape = connexion
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Chargement...</h1>
    </div>
  );
}
