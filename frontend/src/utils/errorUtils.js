/**
 * Analisa o objeto de erro do Axios e retorna uma mensagem amigável para o usuário.
 * Tenta alinhar com a estrutura ErrorMessage.java do Backend.
 */
export const parseApiError = (error) => {
    //  Sem resposta (Servidor caiu ou sem internet)
    if (!error.response) {
        return "Não foi possível conectar ao servidor. Verifique sua conexão.";
    }

    const { status, data } = error.response;

    //  Erros de Validação (Campos inválidos no Spring)
    // Geralmente retorna 422 ou 400 com uma lista de erros
    if ((status === 422 || status === 400) && data.errors) {
        // Se houver múltiplos erros de campo, retorna o primeiro como mensagem geral
        // ou uma mensagem genérica de validação.
        const firstField = Object.keys(data.errors)[0];
        if (firstField) {
            return `Erro no campo ${firstField}: ${data.errors[firstField]}`;
        }
        return "Existem dados inválidos no formulário. Verifique os campos em vermelho.";
    }

    //  Mensagem direta do Backend (ErrorMessage.java)
    // Se o backend mandou "Cliente não encontrado" ou "CPF já existe", usamos isso.
    if (data && data.message) {
        return data.message;
    }

    //  Fallbacks baseados no Status HTTP se não houver mensagem clara
    switch (status) {
        case 401:
            return "Sessão expirada. Faça login novamente.";
        case 403:
            return "Você não tem permissão para realizar esta ação.";
        case 404:
            return "O registro solicitado não foi encontrado.";
        case 409:
            return "Já existe um registro com esses dados.";
        case 422:
            return "Existem dados inválidos no formulário.";
        case 500:
            return "Erro interno no servidor. Tente novamente mais tarde.";
        default:
            return "Ocorreu um erro inesperado.";
    }
};

/**
 * Extrai o objeto de erros de validação para marcar os inputs em vermelho.
     * Retorna um objeto ex: { cpf: "CPF Inválido", email: "Email obrigatório" }
 */
export const getValidationErrors = (error) => {
    if (error.response?.data?.errors) {
        return error.response.data.errors;
    }
    return {};
};