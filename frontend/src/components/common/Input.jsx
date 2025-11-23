const Input = ({
                   label,
                   type = 'text',
                   name,
                   value,
                   onChange,
                   onBlur, // <--- 1. ADICIONE ISTO AQUI
                   placeholder,
                   required = false,
                   error,
                   className = ''
               }) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur} // <--- 2. E VINCULE AQUI
                placeholder={placeholder}
                required={required}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${
                    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 hover:border-gray-400'
                }`}
            />
            {error && <p className="mt-1 text-sm text-red-600 animate-pulse">{error}</p>}
        </div>
    );
};

export default Input;