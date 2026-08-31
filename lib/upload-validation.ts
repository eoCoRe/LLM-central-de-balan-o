// Validação de upload (RF01 / Fluxo Alternativo §3.2 "Formato não suportado / arquivo
// corrompido: erro tratado, com mensagem clara ao analista") — roda no cliente antes de
// simular a extração; quando existir um endpoint real de upload, a mesma checagem deve
// ser repetida no servidor (nunca confiar só na validação do cliente).

export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB, conforme informado na tela
export const ACCEPTED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"]
export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"]

export interface UploadValidationResult {
  ok: boolean
  error?: string
}

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export function validateUploadFile(file: { name: string; size: number; type: string }): UploadValidationResult {
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "O arquivo está vazio ou corrompido." }
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, error: `Arquivo muito grande (máximo ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)} MB).` }
  }
  // Alguns navegadores/SO não preenchem `type` corretamente — nesse caso, cai para a
  // extensão do nome do arquivo em vez de rejeitar um arquivo válido.
  const typeOk = file.type ? ACCEPTED_MIME_TYPES.includes(file.type) : hasAcceptedExtension(file.name)
  if (!typeOk) {
    return { ok: false, error: "Formato não suportado. Envie um PDF, PNG ou JPG." }
  }
  return { ok: true }
}
