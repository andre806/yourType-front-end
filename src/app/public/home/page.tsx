"use client"
import FotoPerfil from "@/app/components/FotoPerfil"
import { useEffect, useState } from "react"

export default function Home(){
    const[isLoggedIn, setIsLoggedIn] = useState(false)
    const[username, setUserName] = useState("")
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

    return(
        <div>
            {isLoggedIn ? (
                <div>
                    <a href="/public/perfil"><FotoPerfil /></a>
                    <a href="/public/postar">postar</a>
                </div>
            ):(
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


                
            )
            }
            <nav>

            </nav>

        </div>
    )
}