'use client'
import { useEffect, useState } from "react";

export default function PostsUser() {
      const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem("authToken")
            if (!token) return null

            // Decodificar payload do JWT (sem verificação - só para pegar o ID)
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.sub || payload._id
        } catch (error) {
            console.error("Erro ao extrair userId do token:", error)
            return null
        }
    }
    const [imagens, setImagens] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const id = getUserIdFromToken();// ajuste conforme seu app  

    useEffect(() => {
        const fetchImagens = async () => {
            try {
                const res = await fetch(`http://localhost:8080/upload/user/${id}/images`);
                const data = await res.json();
                if (res.ok && data.images) {
                    setImagens(data.images);
                } else {
                    setError("Nenhuma imagem encontrada.");
                }
            } catch (err) {
                setError("Erro ao buscar imagens.");
            } finally {
                setLoading(false);
            }
        };
        fetchImagens();
    }, [id]);

    return (
        <div>
            <h2>Minhas Imagens</h2>
            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {imagens.map((url, idx) => (
                    <img
                        key={idx}
                        src={url}
                        alt={`Imagem ${idx + 1}`}
                        style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }}
                    />
                ))}
            </div>
        </div>
    );
}