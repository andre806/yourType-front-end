"use client"
import { useEffect, useState } from "react";


function getUserIdFromToken() {
    try {
        const token = localStorage.getItem("authToken")
        if (!token) return null
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.sub || payload._id
    } catch (error) {
        console.error("Erro ao extrair userId do token:", error)
        return null
    }
}

export default function PostsUser() {
    const [imagens, setImagens] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchImagens = async () => {
            setLoading(true);
            setError("");
            try {
                const id = getUserIdFromToken();
                if (!id) {
                    setError("Usuário não autenticado.");
                    setImagens([]);
                    return;
                }
                const res = await fetch(`http://localhost:8080/upload/user/${id}/images`);
                const data = await res.json();
                if (res.ok && data.images) {
                    setImagens(data.images);
                } else {
                    setError("Nenhuma imagem encontrada.");
                    setImagens([]);
                }
            } catch (err) {
                setError("Erro ao buscar imagens.");
                setImagens([]);
            } finally {
                setLoading(false);
            }
        };
        fetchImagens();
    }, []);

    return (
        <div>
            <h2>Minhas Imagens</h2>
            {loading && <p>Carregando...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {imagens.map((url, idx) => (
                    <img
                        key={url}
                        src={`http://localhost:8080/upload/image?url=${encodeURIComponent(url)}`}
                        alt={`Imagem ${idx + 1}`}
                        style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }}
                    />
                ))}
            </div>
        </div>
    );
}