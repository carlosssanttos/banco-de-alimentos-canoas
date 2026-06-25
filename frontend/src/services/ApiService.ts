export class ApiService {
  private baseUrl: string;

  constructor() {
    // Defina a URL base do seu back-end (pode vir de variáveis de ambiente)
    this.baseUrl = import.meta.env.REACT_APP_API_URL || "http://localhost:5000";
  }

  // Método genérico central para fazer as requisições
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Configurações padrão cruciais para HttpOnly Cookies e JSON
    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // CRUCIAL: 'include' força o fetch a enviar e receber cookies, mesmo cross-origin
      credentials: "include",
    };

    try {
      const response = await fetch(url, config);

      // Tratamento centralizado de erros (ex: token expirado / 401 Unauthorized)
      if (!response.ok) {
        if (response.status === 401) {
          // Aqui você pode limpar o localStorage e redirecionar para o login
          localStorage.removeItem("@App:user");
          window.location.href = "/login";
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      // Se a resposta não tiver conteúdo (ex: 204 No Content), evita quebrar o JSON
      if (response.status === 204) {
        return {} as T;
      }

      // Retorna o dado tipado corretamente
      return (await response.json()) as T;
    } catch (error) {
      console.error("Erro na requisição da API:", error);
      throw error;
    }
  }

  // Atalhos para os métodos HTTP mais comuns
  protected get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  protected post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}
