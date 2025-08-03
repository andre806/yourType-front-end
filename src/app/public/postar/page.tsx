"use client"
import { useState } from "react"

export default function Postar() {
   
    const [descricao, setDescricao] = useState("")
    const [imagem, setImagem] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        if ( !descricao || !imagem) {
            setError("Preencha todos os campos e selecione uma imagem.")
            setLoading(false)
            return
        }

        try {
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
            const id = getUserIdFromToken();
            const token = localStorage.getItem("authToken")
            const userId = id // ajuste conforme seu app

            
            const formData = new FormData()
            formData.append("userId", userId || "")
            formData.append("file", imagem)
            formData.append("descricao", descricao)

            const response = await fetch("http://localhost:8080/upload/postar", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                setDescricao("")
                setImagem(null)
                setSuccess("Post criado com sucesso!")
            } else {
                setError("Erro ao criar post.")
            }
        } catch (err) {
            setError("Erro de conexão com o servidor.")
        } finally {
            setLoading(false)
        }
    
    }

    return (
        <form onSubmit={handleSubmit} style={{
            maxWidth: "400px",
            margin: "0 auto",
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
        }}>
            <h2 style={{ marginBottom: "16px" }}>Postar Imagem</h2>
            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
            {success && <div style={{ color: "green", marginBottom: "10px" }}>{success}</div>}
            <div style={{ marginBottom: "12px" }}>
                <label htmlFor="descricao" style={{ display: "block", marginBottom: "4px" }}>Descrição:</label>
                <textarea
                    id="descricao"
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
            </div>
            <div style={{ marginBottom: "12px" }}>
                <label htmlFor="imagem" style={{ display: "block", marginBottom: "4px" }}>Imagem:</label>
                <input
                    id="imagem"
                    type="file"
                    accept="image/*"
                    onChange={e => setImagem(e.target.files?.[0] || null)}
                    style={{ width: "100%" }}
                />
                {/* Preview da imagem selecionada */}
                {imagem && (
                    <div style={{ marginTop: "8px", textAlign: "center" }}>
                        <img
                            src={URL.createObjectURL(imagem)}
                            alt="Preview"
                            style={{ maxWidth: "100%", maxHeight: "180px", borderRadius: "8px", border: "1px solid #eee" }}
                        />
                    </div>
                )}
            </div>
            <button
                type="submit"
                disabled={loading}
                style={{
                    background: "#007bff",
                    color: "#fff",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer"
                }}
            >
                {loading ? "Postando..." : "Postar"}
            </button>
        </form>
    )
}