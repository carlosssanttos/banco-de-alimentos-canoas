import { isAxiosError } from 'axios'

/**
 * Extrai a mensagem de erro que o backend já formatou (campo `detail` do
 * FastAPI, ex: violação de FK ao excluir) — cai no texto padrão só quando
 * o backend não mandou nada específico (erro de rede, 500 genérico, etc.).
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err) && typeof err.response?.data?.detail === 'string') {
    return err.response.data.detail
  }
  return fallback
}
