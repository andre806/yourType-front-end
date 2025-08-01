"use client"

import { useEffect, useState } from "react"

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userName, setUserName] = useState("")

    useEffect(() => {
        // Verificar se há token e extrair nome do usuário
        const token = localStorage.getItem("authToken")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setUserName(payload.nome || "Usuário")
                setIsLoggedIn(true)
            } catch (error) {
                console.error("Erro ao decodificar token:", error)
                localStorage.removeItem("authToken")
            }
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("authToken")
        setIsLoggedIn(false)
        setUserName("")
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "50px",
                borderRadius: "15px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                width: "100%",
                maxWidth: "500px",
                textAlign: "center"
            }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 30px",
                    fontSize: "32px",
                    color: "white",
                    fontWeight: "bold"
                }}>
                    🚀
                </div>

                <h1 style={{
                    color: "#333",
                    fontSize: "32px",
                    marginBottom: "15px",
                    fontWeight: "700"
                }}>
                    Solidarify
                </h1>

                <p style={{
                    color: "#666",
                    fontSize: "18px",
                    marginBottom: "40px",
                    lineHeight: "1.6"
                }}>
                    {isLoggedIn
                        ? `Bem-vindo de volta, ${userName}!`
                        : "Sua plataforma de conexões solidárias"
                    }
                </p>

                {isLoggedIn ? (
                    // Menu para usuários logados
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <a
                            href="/public/perfil"
                            style={{
                                display: "block",
                                padding: "15px 25px",
                                backgroundColor: "#007bff",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#0056b3"}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#007bff"}
                        >
                            👤 Meu Perfil
                        </a>

                        <button
                            onClick={handleLogout}
                            style={{
                                padding: "15px 25px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#c82333"}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#dc3545"}
                        >
                            🚪 Sair
                        </button>
                    </div>
                ) : (
                    // Menu para visitantes
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <a
                            href="/public/login"
                            style={{
                                display: "block",
                                padding: "15px 25px",
                                backgroundColor: "#007bff",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#0056b3"}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#007bff"}
                        >
                            🔑 Fazer Login
                        </a>

                        <a
                            href="/public/register"
                            style={{
                                display: "block",
                                padding: "15px 25px",
                                backgroundColor: "#28a745",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#218838"}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#28a745"}
                        >
                            📝 Criar Conta
                        </a>

                        <div style={{
                            margin: "20px 0",
                            color: "#999",
                            fontSize: "14px"
                        }}>
                            Já tem uma conta? Faça login acima!
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    marginTop: "40px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eee",
                    color: "#999",
                    fontSize: "14px"
                }}>
                    <p>Construindo pontes através da tecnologia 💙</p>
                </div>
            </div>
        </div>
    )
}