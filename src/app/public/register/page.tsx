"use client"

import { useState } from "react"

export default function Register() {
    const [user, setUser] = useState({
        nome: "",
        email: "",
        numero: "",
        senha: ""
    })

    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUser(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validação básica
        if (!user.nome || !user.email || !user.numero || !user.senha) {
            alert("Por favor, preencha todos os campos!")
            return
        }

        setLoading(true)

        try {
            const response = await fetch("http://localhost:8080/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            })

            if (response.ok) {
                const data = await response.json()
                alert(`Seja bem-vindo(a), ${user.nome}!`)
                // Limpar formulário após sucesso
                setUser({
                    nome: "",
                    email: "",
                    numero: "",
                    senha: ""
                })
            } else {
                alert("Erro ao registrar usuário. Tente novamente.")
            }
        } catch (error) {
            console.error("Erro:", error)
            alert("Erro de conexão. Verifique sua internet.")
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
                    Cadastro
                </h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "5px",
                            color: "#555",
                            fontWeight: "500"
                        }}>
                            Nome completo:
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={user.nome}
                            onChange={handleChange}
                            placeholder="Digite seu nome completo"
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
                            value={user.email}
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

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "5px",
                            color: "#555",
                            fontWeight: "500"
                        }}>
                            Telefone:
                        </label>
                        <input
                            type="tel"
                            name="numero"
                            value={user.numero}
                            onChange={handleChange}
                            placeholder="Digite seu telefone"
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
                            value={user.senha}
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
                            backgroundColor: loading ? "#ccc" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "background-color 0.3s"
                        }}
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <p style={{
                    textAlign: "center",
                    marginTop: "20px",
                    color: "#666"
                }}>
                    Já tem uma conta? <a href="/public/login" style={{ color: "#007bff", textDecoration: "none" }}>Faça login</a>
                </p>
            </div>
        </div>
    )
}