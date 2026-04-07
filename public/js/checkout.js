// public/js/checkout.js

document.addEventListener('DOMContentLoaded', function() {
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    const shippingForm = document.getElementById('shippingForm');

    processPaymentBtn.addEventListener('click', async function() {
        try {
            // Validar el formulario
            if (!validateForm()) {
                return;
            }

            // Deshabilitar el botón mientras se procesa
            processPaymentBtn.disabled = true;
            processPaymentBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

            // Recopilar datos del formulario
            const shippingData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zipCode: document.getElementById('zipCode').value
            };

            // Enviar la solicitud al servidor
            const response = await fetch('/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shippingInfo: shippingData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al procesar el pago');
            }

            // Mostrar mensaje de éxito
            alert('¡Pago procesado exitosamente!');
            
            // Redirigir a la página de confirmación
            window.location.href = `/order-confirmation/${data.orderId}`;

        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar el pago: ' + error.message);
            
            // Reactivar el botón
            processPaymentBtn.disabled = false;
            processPaymentBtn.innerHTML = 'Confirmar y Pagar';
        }
    });

    function validateForm() {
        // Validar campos requeridos
        const requiredFields = [
            'firstName',
            'lastName',
            'email',
            'phone',
            'address',
            'city',
            'zipCode'
        ];

        let isValid = true;
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        // Validar formato de email
        const emailField = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            emailField.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            alert('Por favor, complete todos los campos correctamente');
        }

        return isValid;
    }

    // Limpiar validación al escribir
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
    });
});