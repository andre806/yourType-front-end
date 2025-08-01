"use client"

import { useState, useEffect } from "react"
import FotoPerfil from "@/app/components/FotoPerfil"
// Dados de estados e cidades brasileiras
const estadosCidades = {
    "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
    "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "Penedo"],
    "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"],
    "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari"],
    "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas"],
    "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato"],
    "DF": ["Brasília", "Taguatinga", "Ceilândia", "Samambaia", "Planaltina"],
    "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Viana", "Linhares"],
    "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás"],
    "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó"],
    "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres"],
    "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Naviraí"],
    "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves"],
    "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal", "Parauapebas"],
    "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa"],
    "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu"],
    "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Bandeira", "Caruaru", "Petrolina", "Paulista"],
    "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior"],
    "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "Campos dos Goytacazes"],
    "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim"],
    "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão"],
    "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura"],
    "RR": ["Boa Vista", "Rorainópolis", "Caracaraí", "Alto Alegre", "Mucajaí"],
    "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí"],
    "SP": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "Ribeirão Preto", "Sorocaba"],
    "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância", "Tobias Barreto"],
    "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins", "Colinas do Tocantins"]
}

interface UserProfile {
    id?: string
    nome: string
    email: string
    numero: string
    senha?: string
    fotoPerfil?: string
    bio?: string
    cidade?: string
    estado?: string
    pais?: string
}

export default function Perfil() {
    const [perfil, setPerfil] = useState<UserProfile>({
        nome: "",
        email: "",
        numero: "",
        fotoPerfil: "",
        bio: "",
        cidade: "",
        estado: "",
        pais: ""
    })

    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [userId, setUserId] = useState<string>("")
    const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([])
    const [estadoSelecionado, setEstadoSelecionado] = useState("")
    const [uploadingPhoto, setUploadingPhoto] = useState(false)

    // Extrair userId do token JWT
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

    // Buscar dados do perfil
    const buscarDados = async () => {
        const id = getUserIdFromToken()
        if (!id) {
            setError("Token não encontrado. Faça login novamente.")
            setLoading(false)
            return
        }

        setUserId(id)
        setLoading(true)
        setError("")

        try {
            const token = localStorage.getItem("authToken")

            // Primeiro validar o token
            const validationResponse = await fetch("http://localhost:8080/users/validate-token", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!validationResponse.ok) {
                setError("Sessão expirada. Faça login novamente.")
                localStorage.removeItem("authToken")
                setLoading(false)
                return
            }

            // Buscar todos os usuários e filtrar pelo ID do token
            const response = await fetch("http://localhost:8080/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.ok) {
                const users = await response.json()
                const currentUser = users.find((user: any) => user.id === id)

                if (currentUser) {
                    // Buscar foto de perfil do S3 (se não estiver no banco)
                    

                    setPerfil({
                        id: currentUser.id,
                        nome: currentUser.nome || "",
                        email: currentUser.email || "",
                        numero: currentUser.numero || "",
                        bio: currentUser.bio || "",
                        cidade: currentUser.cidade || "",
                        estado: currentUser.estado || "",
                        pais: currentUser.pais || ""
                    })

                    // Configurar estado e cidades se já existirem
                    if (currentUser.estado) {
                        setEstadoSelecionado(currentUser.estado)
                        setCidadesDisponiveis(estadosCidades[currentUser.estado as keyof typeof estadosCidades] || [])
                    }
                } else {
                    setError("Usuário não encontrado.")
                }
            } else {
                setError("Erro ao carregar dados do perfil.")
            }
        } catch (error) {
            console.error("Erro:", error)
            setError("Erro de conexão com o servidor. Verifique se o backend está rodando.")
        } finally {
            setLoading(false)
        }
    }

    // Atualizar perfil
    const atualizarPerfil = async () => {
        if (!userId) return

        setSaving(true)
        setError("")

        try {
            const token = localStorage.getItem("authToken")
            const response = await fetch(`http://localhost:8080/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: perfil.nome,
                    email: perfil.email,
                    numero: perfil.numero,
                    fotoPerfil: perfil.fotoPerfil,
                    bio: perfil.bio,
                    cidade: perfil.cidade,
                    estado: perfil.estado,
                    pais: perfil.pais
                })
            })

            if (response.ok) {
                const updatedUser = await response.json()
                setPerfil(updatedUser)
                setEditMode(false)
                alert("Perfil atualizado com sucesso!")
            } else {
                const errorText = await response.text()
                setError(errorText || "Erro ao atualizar perfil.")
            }
        } catch (error) {
            console.error("Erro:", error)
            setError("Erro de conexão com o servidor.")
        } finally {
            setSaving(false)
        }
    }

    // Validar token
    const validarToken = async () => {
        const token = localStorage.getItem("authToken")
        if (!token) return false

        try {
            const response = await fetch("http://localhost:8080/users/validate-token", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            return response.ok
        } catch (error) {
            console.error("Erro ao validar token:", error)
            return false
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setPerfil(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const novoEstado = e.target.value
        setEstadoSelecionado(novoEstado)

        // Atualizar cidades disponíveis
        const cidades = estadosCidades[novoEstado as keyof typeof estadosCidades] || []
        setCidadesDisponiveis(cidades)

        // Atualizar perfil com novo estado e limpar cidade
        setPerfil(prev => ({
            ...prev,
            estado: novoEstado,
            cidade: "" // Limpar cidade quando muda estado
        }))
    }

    const handleEdit = () => {
        setEditMode(true)
        setError("")

        // Configurar estado e cidades se já existirem
        if (perfil.estado) {
            setEstadoSelecionado(perfil.estado)
            setCidadesDisponiveis(estadosCidades[perfil.estado as keyof typeof estadosCidades] || [])
        }
    }

    const handleCancel = () => {
        setEditMode(false)
        setError("")
        // Resetar estados locais
        setEstadoSelecionado("")
        setCidadesDisponiveis([])
        buscarDados() // Recarregar dados originais
    }

    const handleSave = () => {
        if (!perfil.nome || !perfil.email) {
            setError("Nome e email são obrigatórios.")
            return
        }
        atualizarPerfil()
    }

    const handleLogout = () => {
        localStorage.removeItem("authToken")
        window.location.href = "/public/login"
    }

    // Carregar dados ao montar componente
    useEffect(() => {
        const initializePage = async () => {
            const tokenValid = await validarToken()
            if (!tokenValid) {
                alert("Sessão inválida. Redirecionando para login...")
                handleLogout()
                return
            }
            buscarDados()
        }

        initializePage()
    }, [])

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5"
            }}>
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    backgroundColor: "white",
                    borderRadius: "10px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}>
                    <p style={{ fontSize: "18px", color: "#666" }}>Carregando perfil...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f5f5f5",
            padding: "20px"
        }}>
            <div style={{
                maxWidth: "600px",
                margin: "0 auto",
                backgroundColor: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                overflow: "hidden"
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "30px",
                    textAlign: "center"
                }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 15px",
                        fontSize: "32px",
                        fontWeight: "bold",
                        overflow: "hidden",
                        border: "3px solid rgba(255,255,255,0.3)",
                        position: "relative"
                    }}>
                        {uploadingPhoto ? (
                            <div style={{
                                color: "white",
                                fontSize: "14px",
                                textAlign: "center"
                            }}>
                                📤
                            </div>
                        ) : perfil.fotoPerfil ? (
                            <img
                                src={perfil.fotoPerfil}
                                alt="Foto do perfil"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />

                        ) : null}
                        <div style={{
                            display: perfil.fotoPerfil && !uploadingPhoto ? "none" : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%"
                        }}>

                            {uploadingPhoto ? "📤" : perfil.nome ? perfil.nome.charAt(0).toUpperCase() : "U"}
                        </div>
                    </div>
                    <h1 style={{ margin: "0", fontSize: "24px" }}>Meu Perfil</h1>
                </div>

                {/* Content */}
                <div style={{ padding: "40px" }}>
                    {error && (
                        <div style={{
                            backgroundColor: error.includes("📱") ? "#e8f5e8" : "#f8d7da",
                            color: error.includes("📱") ? "#2e7d2e" : "#721c24",
                            padding: "12px",
                            borderRadius: "5px",
                            marginBottom: "20px",
                            border: error.includes("📱") ? "1px solid #4caf50" : "1px solid #f5c6cb",
                            fontSize: "14px"
                        }}>
                            {error}
                            {(error.includes("S3") || error.includes("servidor") || error.includes("configurado")) && !error.includes("✅") && (
                                <div style={{ marginTop: "8px" }}>
                                    <small style={{ color: "#666", fontSize: "11px" }}>
                                        ℹ️ Funcionalidade disponível após configuração do AWS S3
                                    </small>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            Foto de Perfil:
                        </label>

                        <FotoPerfil
                            userId={userId}
                            fotoPerfil={perfil.fotoPerfil}
                            onFotoChange={(novaFoto) => setPerfil(prev => ({ ...prev, fotoPerfil: novaFoto }))}
                            editMode={editMode}
                            size="large"
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            Nome completo:
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={perfil.nome}
                            onChange={handleChange}
                            disabled={!editMode}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: editMode ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                backgroundColor: editMode ? "white" : "#f8f9fa",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            E-mail:
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={perfil.email}
                            onChange={handleChange}
                            disabled={!editMode}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: editMode ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                backgroundColor: editMode ? "white" : "#f8f9fa",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            Telefone:
                        </label>
                        <input
                            type="tel"
                            name="numero"
                            value={perfil.numero}
                            onChange={handleChange}
                            disabled={!editMode}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: editMode ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                backgroundColor: editMode ? "white" : "#f8f9fa",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            Biografia:
                        </label>
                        <textarea
                            name="bio"
                            value={perfil.bio || ""}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="Conte um pouco sobre você..."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: editMode ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                backgroundColor: editMode ? "white" : "#f8f9fa",
                                boxSizing: "border-box",
                                resize: "vertical",
                                fontFamily: "inherit"
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            Estado:
                        </label>
                        <select
                            name="estado"
                            value={perfil.estado || ""}
                            onChange={handleEstadoChange}
                            disabled={!editMode}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: editMode ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                backgroundColor: editMode ? "white" : "#f8f9fa",
                                boxSizing: "border-box",
                                cursor: editMode ? "pointer" : "default"
                            }}
                        >
                            <option value="">Selecione um estado</option>
                            {Object.keys(estadosCidades).map(estado => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            Cidade:
                        </label>
                        <select
                            name="cidade"
                            value={perfil.cidade || ""}
                            onChange={handleChange}
                            disabled={!editMode || !estadoSelecionado}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: editMode ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                backgroundColor: editMode && estadoSelecionado ? "white" : "#f8f9fa",
                                boxSizing: "border-box",
                                cursor: editMode && estadoSelecionado ? "pointer" : "default",
                                opacity: !estadoSelecionado && editMode ? 0.6 : 1
                            }}
                        >
                            <option value="">
                                {!estadoSelecionado ? "Primeiro selecione um estado" : "Selecione uma cidade"}
                            </option>
                            {cidadesDisponiveis.map(cidade => (
                                <option key={cidade} value={cidade}>
                                    {cidade}
                                </option>
                            ))}
                        </select>
                        {editMode && !estadoSelecionado && (
                            <small style={{ color: "#666", fontSize: "14px", marginTop: "5px", display: "block" }}>
                                💡 Selecione primeiro um estado para ver as cidades disponíveis
                            </small>
                        )}
                    </div>

                    <div style={{ marginBottom: "40px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#333"
                        }}>
                            País:
                        </label>
                        <input
                            type="text"
                            name="pais"
                            value={perfil.pais || ""}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="Seu país"
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: editMode ? "2px solid #007bff" : "1px solid #ddd",
                                borderRadius: "5px",
                                fontSize: "16px",
                                backgroundColor: editMode ? "white" : "#f8f9fa",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    {/* Botões */}
                    <div style={{
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap"
                    }}>
                        {!editMode ? (
                            <>
                                <button
                                    onClick={handleEdit}
                                    style={{
                                        flex: "1",
                                        padding: "12px 20px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        minWidth: "120px"
                                    }}
                                >
                                    ✏️ Editar Perfil
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        flex: "1",
                                        padding: "12px 20px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        minWidth: "120px"
                                    }}
                                >
                                    🚪 Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        flex: "1",
                                        padding: "12px 20px",
                                        backgroundColor: saving ? "#ccc" : "#28a745",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        cursor: saving ? "not-allowed" : "pointer",
                                        minWidth: "120px"
                                    }}
                                >
                                    {saving ? "💾 Salvando..." : "💾 Salvar"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    style={{
                                        flex: "1",
                                        padding: "12px 20px",
                                        backgroundColor: "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        cursor: saving ? "not-allowed" : "pointer",
                                        minWidth: "120px"
                                    }}
                                >
                                    ❌ Cancelar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{
                maxWidth: "600px",
                margin: "20px auto 0",
                textAlign: "center"
            }}>
                <a
                    href="/public/login"
                    style={{
                        color: "#007bff",
                        textDecoration: "none",
                        marginRight: "20px"
                    }}
                >
                    ← Voltar ao Login
                </a>
                <a
                    href="/public/register"
                    style={{
                        color: "#007bff",
                        textDecoration: "none"
                    }}
                >
                    Criar Nova Conta
                </a>
            </div>
        </div>
    )
}