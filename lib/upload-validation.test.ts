import { describe, expect, it } from "vitest"
import { MAX_UPLOAD_SIZE_BYTES, validateUploadFile } from "./upload-validation"

describe("validateUploadFile", () => {
  it("aceita um PDF dentro do limite de tamanho", () => {
    const result = validateUploadFile({ name: "balanco.pdf", size: 1024, type: "application/pdf" })
    expect(result.ok).toBe(true)
  })

  it("aceita PNG e JPG", () => {
    expect(validateUploadFile({ name: "balanco.png", size: 1024, type: "image/png" }).ok).toBe(true)
    expect(validateUploadFile({ name: "balanco.jpg", size: 1024, type: "image/jpeg" }).ok).toBe(true)
  })

  it("rejeita arquivo maior que 20 MB", () => {
    const result = validateUploadFile({
      name: "balanco.pdf",
      size: MAX_UPLOAD_SIZE_BYTES + 1,
      type: "application/pdf",
    })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/muito grande/i)
  })

  it("rejeita arquivo vazio ou corrompido (tamanho zero)", () => {
    const result = validateUploadFile({ name: "balanco.pdf", size: 0, type: "application/pdf" })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/vazio ou corrompido/i)
  })

  it("rejeita formato não suportado", () => {
    const result = validateUploadFile({ name: "planilha.xlsx", size: 1024, type: "application/vnd.ms-excel" })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/formato não suportado/i)
  })

  it("usa a extensão do nome quando o navegador não informa o MIME type", () => {
    expect(validateUploadFile({ name: "balanco.pdf", size: 1024, type: "" }).ok).toBe(true)
    expect(validateUploadFile({ name: "balanco.exe", size: 1024, type: "" }).ok).toBe(false)
  })
})
