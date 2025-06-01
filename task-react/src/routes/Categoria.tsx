import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL_NEW } from "../auth/authConstants";
import PortalLayout from "../layout/PortalLayout";

export default function Categoria() {
  const auth = useAuth();
  const [categoryName, setCategoryName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL_NEW}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (response.ok) {
        setSuccessMessage("Categoría creada exitosamente");
        setCategoryName("");
      } else {
        const json = await response.json();
        setError(json.message || "Error al crear categoría");
      }
    } catch (err) {
      setError("Error de red o del servidor");
    }
  }

  return (
    <PortalLayout>
      <h1>Perfil</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <h2>Agregar nueva categoría</h2>
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <button type="submit">Agregar</button>

        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </PortalLayout>
  );
}
