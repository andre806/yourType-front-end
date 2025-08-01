"use client"

import { useState, useEffect } from "react"

interface FotoPerfilProps {
    userId?: string
    fotoPerfil?: string
    onFotoChange?: (novaFoto: string) => void
    editMode?: boolean
    size?: "small" | "medium" | "large"
}

export default function FotoPerfil({
    userId,
    fotoPerfil,
    onFotoChange,
    editMode = false,
    size = "medium"
}: FotoPerfilProps) {
    const [fotoAtual, setFotoAtual] = useState<string>(fotoPerfil || "")
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [error, setError] = useState("")

    console.log("📷 FotoPerfil - Estado atual:", { fotoAtual, fotoPerfil, userId, editMode })

    // Configurações de tamanho
    const sizeConfig = {
        small: { width: "60px", height: "60px", fontSize: "20px" },
        medium: { width: "80px", height: "80px", fontSize: "32px" },
        large: { width: "120px", height: "120px", fontSize: "48px" }
    }

    const currentSize = sizeConfig[size]

    // Extrair userId do token JWT se não foi fornecido
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

    // Buscar foto de perfil existente do usuário no S3
    const buscarFotoPerfil = async (id: string) => {
        try {
            const token = localStorage.getItem("authToken")
            if (!token) return null

            const response = await fetch(`http://localhost:8080/upload/foto-perfil/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (response.ok) {
                const result = await response.json()
                console.log("📸 Resposta da busca de foto:", result)

                if (result.hasProfileImage && result.profileImageUrl) {
                    return result.profileImageUrl
                }
            } else {
                console.log("ℹ️ Usuário não possui foto de perfil no S3")
            }

            return null
        } catch (error) {
            console.error("❌ Erro ao buscar foto de perfil:", error)
            return null
        }
    }



    // Carregar foto ao montar componente
    useEffect(() => {
        const loadFoto = async () => {
            console.log("🔄 loadFoto iniciado - fotoPerfil:", fotoPerfil, "userId:", userId)

            if (fotoPerfil) {
                console.log("✅ Usando fotoPerfil da prop:", fotoPerfil)
                setFotoAtual(fotoPerfil)

                // Testar se a URL está acessível
                if (fotoPerfil.startsWith('http')) {
                    try {
                        const testResponse = await fetch(fotoPerfil, { method: 'HEAD' })
                        console.log("🔗 Status da URL da foto:", testResponse.status)
                        if (!testResponse.ok) {
                            console.warn("⚠️ URL da foto não está acessível:", fotoPerfil)
                        }
                    } catch (urlError) {
                        console.error("❌ Erro ao testar URL da foto:", urlError)
                    }
                }
            } else {
                console.log("🔍 Buscando foto do S3...")
                const currentUserId = userId || getUserIdFromToken()
                if (currentUserId) {
                    const fotoS3 = await buscarFotoPerfil(currentUserId)
                    if (fotoS3) {
                        console.log("✅ Foto encontrada no S3:", fotoS3)
                        setFotoAtual(fotoS3)
                        if (onFotoChange) {
                            onFotoChange(fotoS3)
                        }
                    } else {
                        console.log("ℹ️ Nenhuma foto encontrada no S3")
                    }
                }
            }
        }

        loadFoto()
    }, [userId, fotoPerfil])

    // Upload de foto para o servidor
    const uploadFotoPerfil = async (file: File, id: string) => {
        try {
            setUploadingPhoto(true)
            setError("")

            const token = localStorage.getItem("authToken")
            if (!token) {
                setError("Token de autenticação não encontrado")
                return null
            }

            // Criar FormData para upload do arquivo
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', id)

            const response = await fetch(`http://localhost:8080/upload/profile-image`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const result = await response.json()
                console.log("✅ Upload realizado com sucesso:", result)

                if (result.imageUrl) {
                    return result.imageUrl
                } else {
                    console.error("❌ Resposta do servidor não contém imageUrl:", result)
                    return null
                }
            } else {
                const errorResponse = await response.text()
                console.log("❌ Erro no upload:", errorResponse)
                return null
            }
        } catch (error) {
            console.error("❌ Erro no upload:", error)
            return null
        } finally {
            setUploadingPhoto(false)
        }
    }
    const enviarurldoPerfil = async (profileImageUrl: string, id: string) => {
        try {
            const token = localStorage.getItem("authToken")
            if (!token) return false

            const response = await fetch(`http://localhost:8080/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    profileImageUrl: profileImageUrl
                })
            })

            if (response.ok) {
                console.log("✅ URL da foto salva no banco de dados")
                return true
            } else {
                console.error("❌ Erro ao salvar URL no banco:", await response.text())
                return false
            }
        } catch (error) {
            console.error("❌ Erro na requisição:", error)
            return false
        }
    }
    // Converter imagem para base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                const base64String = event.target?.result as string
                resolve(base64String)
            }
            reader.onerror = () => {
                reject(new Error('Erro ao processar a imagem'))
            }
            reader.readAsDataURL(file)
        })
    }

    // Manipular upload de foto
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            setError('Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WebP)')
            return
        }

        // Validar tamanho (máximo 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB em bytes
        if (file.size > maxSize) {
            setError('A imagem deve ter no máximo 5MB')
            return
        }

        const currentUserId = userId || getUserIdFromToken()
        if (!currentUserId) {
            setError("ID do usuário não encontrado")
            return
        }

        setUploadingPhoto(true)
        setError("")

        try {
            // Tentar upload para S3 primeiro
            const imageUrl = await uploadFotoPerfil(file, currentUserId)

            let novaFoto: string
            if (imageUrl) {
                // Upload S3 bem-sucedido (backend já salvou automaticamente)
                novaFoto = imageUrl
                console.log("✅ Foto enviada para S3 e salva automaticamente no banco:", imageUrl)
            } else {
                // Fallback para base64 e salvar manualmente no banco
                console.log("⚠️ Upload S3 falhou, usando base64...")
                novaFoto = await convertToBase64(file)
                console.log("✅ Foto convertida para base64")

                // Salvar base64 no banco manualmente
                const salvouNoBanco = await enviarurldoPerfil(novaFoto, currentUserId)
                if (salvouNoBanco) {
                    console.log("✅ Base64 salvo no banco de dados")
                } else {
                    console.error("❌ Erro ao salvar base64 no banco")
                    setError("Erro ao salvar foto no banco de dados")
                    return
                }
            }

            // Atualizar estado local
            setFotoAtual(novaFoto)

            // Notificar componente pai sobre a mudança
            if (onFotoChange) {
                onFotoChange(novaFoto)
            }

        } catch (error) {
            console.error("❌ Erro no processamento da imagem:", error)
            setError('Erro ao processar a imagem')
        } finally {
            setUploadingPhoto(false)
        }
    }

    // Remover foto
    const handleRemovePhoto = async () => {
        const currentUserId = userId || getUserIdFromToken()
        if (currentUserId) {
            // Remover foto do banco de dados
            const removeuDoBanco = await enviarurldoPerfil("", currentUserId)
            if (removeuDoBanco) {
                console.log("✅ Foto removida do banco de dados")
            } else {
                console.error("❌ Erro ao remover foto do banco")
                setError("Erro ao remover foto do banco de dados")
                return
            }
        }

        setFotoAtual("")
        if (onFotoChange) {
            onFotoChange("")
        }
    }

    // Atualizar foto quando prop mudar
    useEffect(() => {
        console.log("🔄 FotoPerfil - Prop fotoPerfil mudou:", fotoPerfil)
        console.log("🔄 Estado atual fotoAtual antes da atualização:", fotoAtual)
        if (fotoPerfil !== undefined) {
            setFotoAtual(fotoPerfil)
            console.log("✅ FotoPerfil - Atualizando fotoAtual para:", fotoPerfil)
        }
    }, [fotoPerfil])

    return (
        <div style={{ textAlign: "center" }}>
            {/* Avatar */}
            <div style={{
                width: currentSize.width,
                height: currentSize.height,
                borderRadius: "50%",
                backgroundColor: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                fontSize: currentSize.fontSize,
                fontWeight: "bold",
                overflow: "hidden",
                border: "3px solid #dee2e6",
                position: "relative"
            }}>
                {uploadingPhoto ? (
                    <div style={{
                        color: "#007bff",
                        fontSize: "14px",
                        textAlign: "center",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2
                    }}>
                        📤
                    </div>
                ) : null}

                {fotoAtual && !uploadingPhoto ? (
                    <img
                        src={fotoAtual}
                        alt="Foto do perfil"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "absolute",
                            top: "0",
                            left: "0"
                        }}
                        onLoad={() => {
                            console.log("✅ Imagem carregada com sucesso:", fotoAtual)
                        }}
                        onError={(e) => {
                            console.error("❌ Erro ao carregar imagem:", fotoAtual)
                            console.error("❌ Detalhes do erro:", e)
                            setError("Erro ao carregar a imagem do perfil")
                        }}
                    />
                ) : null}

                {(!fotoAtual || uploadingPhoto) && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#007bff",
                        color: "white",
                        position: "absolute",
                        top: "0",
                        left: "0"
                    }}>
                        {uploadingPhoto ? "📤" : "👤"}
                    </div>
                )}
            </div>

            {/* Controles de edição */}
            {editMode && (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "2px dashed #007bff",
                            borderRadius: "5px",
                            fontSize: "14px",
                            backgroundColor: "white",
                            boxSizing: "border-box",
                            cursor: uploadingPhoto ? "not-allowed" : "pointer",
                            marginBottom: "10px"
                        }}
                    />

                    {fotoAtual && (
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor: "pointer",
                                marginTop: "5px"
                            }}
                        >
                            🗑️ Remover
                        </button>
                    )}
                </div>
            )}

            {/* Mensagem de erro */}
            {error && (
                <div style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "8px",
                    borderRadius: "4px",
                    marginTop: "10px",
                    fontSize: "12px",
                    border: "1px solid #f5c6cb"
                }}>
                    {error}
                </div>
            )}

            {/* Indicador de upload */}
            {uploadingPhoto && (
                <div style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "#007bff"
                }}>
                    📤 Enviando...
                </div>
            )}
        </div>
    )
}