import Swal from 'sweetalert2';

/**
 * Alerta de confirmação para deleção (Vermelho/Perigo)
 */
export const confirmDelete = async (title = 'Tem certeza?', text = 'Você não poderá reverter esta ação!') => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // Vermelho (Tailwind red-500)
        cancelButtonColor: '#6b7280', // Cinza
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
    });

    return result.isConfirmed;
};

/**
 * Alerta de confirmação genérico (Para ações como Converter, Aprovar, etc)
 */
export const confirmAction = async (title, text, confirmButtonText = 'Sim, confirmar', confirmButtonColor = '#3b82f6') => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: confirmButtonColor,
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    return result.isConfirmed;
};

export const showAlert = (title, text, icon = 'success') => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        timerProgressBar: true
    });
};