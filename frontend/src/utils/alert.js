import Swal from 'sweetalert2';

export const confirmDelete = async (title = 'Tem certeza?', text = 'Você não poderá reverter esta ação!') => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // Vermelho (Tailwind red-500)
        cancelButtonColor: '#6b7280', // Cinza (Tailwind gray-500)
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true, // Botão de cancelar à esquerda (padrão UX)
        focusCancel: true     // Foca no cancelar por segurança
    });

    return result.isConfirmed;
};

export const showAlert = (title, text, icon = 'success') => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#3b82f6', // Azul (Primary)
        timer: 2000,
        timerProgressBar: true
    });
};