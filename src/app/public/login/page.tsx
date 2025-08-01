"use client"

import { useState } from "react"

export default function Login() {
    const [credentials, setCredentials] = useState({
        email: "",
        senha: ""
    })

    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validação básica
        if (!credentials.email || !credentials.senha) {
            alert("Por favor, preencha todos os campos!")
            return
        }

        setLoading(true)

        try {
            console.log("🚀 Iniciando login com:", credentials)

            const response = await fetch("http://localhost:8080/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(credentials)
            })

            console.log("📡 Status da resposta:", response.status)
            console.log("📡 Headers da resposta:", response.headers)

            if (response.ok) {
                const data = await response.text()
                console.log("✅ Login bem-sucedido:", data)

                // Extrair token da resposta (formato: "Token: JWT_TOKEN_HERE")
                if (data.startsWith("Token: ")) {
                    const token = data.substring(7) // Remove "Token: " do início
                    localStorage.setItem("authToken", token)

                    alert("Login realizado com sucesso!")

                    // Clear form after successful login
                    setCredentials({
                        email: "",
                        senha: ""
                    })

                    // Redirect to profile page
                    window.location.href = "/public/perfil"
                } else {
                    alert(data)
                }

            } else {
                console.error("❌ Erro na resposta. Status:", response.status)

                // Tentar obter a mensagem de erro
                try {
                    const errorMessage = await response.text()
                    console.error("❌ Mensagem de erro:", errorMessage)
                    alert(`Erro ${response.status}: ${errorMessage}`)
                } catch (textError) {
                    console.error("❌ Erro ao ler mensagem:", textError)
                    alert(`Erro ${response.status}: Problema interno do servidor`)
                }
            }
        } catch (error) {
            console.error("💥 Erro de conexão:", error)
            alert("Erro de conexão. Verifique se o servidor está rodando na porta 8080.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            padding: "20px"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "40px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxWidth: "400px"
            }}>
                <h1 style={{
                    textAlign: "center",
                    color: "#333",
                    marginBottom: "30px",
                    fontSize: "24px"
                }}>
                    Login
                </h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "5px",
                            color: "#555",
                            fontWeight: "500"
                        }}>
                            E-mail:
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="Digite seu e-mail"
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                boxSizing: "border-box"
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "5px",
                            color: "#555",
                            fontWeight: "500"
                        }}>
                            Senha:
                        </label>
                        <input
                            type="password"
                            name="senha"
                            value={credentials.senha}
                            onChange={handleChange}
                            placeholder="Digite sua senha"
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                boxSizing: "border-box"
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: loading ? "#ccc" : "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "background-color 0.3s"
                        }}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div style={{
                    textAlign: "center",
                    marginTop: "20px"
                }}>
                    <a
                        href="#"
                        style={{
                            color: "#007bff",
                            textDecoration: "none",
                            fontSize: "14px"
                        }}
                    >
                        Esqueceu sua senha?
                    </a>
                </div>

                <p style={{
                    textAlign: "center",
                    marginTop: "20px",
                    color: "#666"
                }}>
                    Não tem uma conta? <a href="/public/register" style={{ color: "#007bff", textDecoration: "none" }}>Cadastre-se</a>
                </p>
            </div>
        </div>
    )
}