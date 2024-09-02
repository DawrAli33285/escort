document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pubEditForm');
    const citySelect = document.getElementById('citySelect'); // Supondo que esse seja o select das cidades

    if (form && citySelect) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const data = {};

            formData.forEach((value, key) => {
                // Remove brackets for array keys
                const normalizedKey = key.replace(/\[\]$/, '');

                if (data.hasOwnProperty(normalizedKey)) {
                    // Ensure the property is an array and add new values to it
                    if (!Array.isArray(data[normalizedKey])) {
                        data[normalizedKey] = [data[normalizedKey]];
                    }
                    data[normalizedKey].push(value);
                } else {
                    // Assign the value directly for non-array and the first array entry
                    data[normalizedKey] = value;
                }
            });

            // Captura a cidade e o país selecionados
            const selectedCity = citySelect.value; // Valor da cidade selecionada
            const selectedCountry = citySelect.options[citySelect.selectedIndex].parentNode.label; // Label do optgroup (país)

            // Adicionar cidade e país ao objeto data
            data.city = selectedCity;
            data.country = selectedCountry;

            console.log('form data object:', data);

            fetch('/update-ad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Dados atualizados com sucesso!');
                    // Optionally redirect or perform another action
                } else {
                    alert('Erro ao atualizar os dados: ' + result.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocorreu um erro ao tentar atualizar os dados.');
            });
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pubEditForm');
    const imageInput = document.getElementById('image-upload');
    const preview = document.getElementById('image-preview');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const files = imageInput.files;

            // Verifica se o usuário selecionou pelo menos uma imagem
            if (files.length === 0) {
                return; // Interrompe a execução do código
            }

            const formData = new FormData();

            // Adiciona as imagens ao FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            // Enviar os dados do formulário para a rota de upload de imagens
            fetch('/upload-images', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Imagens carregadas com sucesso!');
                    // Redirecionar ou atualizar a página conforme necessário
                    window.location.reload(); // Exemplo de recarregar a página
                } else {
                    alert('Falha no upload das imagens: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro durante o upload das imagens:', error);
                alert('Ocorreu um erro durante o upload das imagens. Por favor, tente novamente.');
            });
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const currentImages = document.querySelectorAll('#current-images img');

    currentImages.forEach(image => {
        image.addEventListener('click', function() {
            const imageUrl = this.src.replace(window.location.origin + '/', ''); // Obtém o caminho relativo da imagem

            // Enviar o URL da imagem para o backend para definir como imagem de capa
            fetch('/set-cover-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ imageUrl: imageUrl })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Atualiza a visualização para refletir a nova imagem de capa
                    currentImages.forEach(img => img.classList.remove('cover-image'));
                    this.classList.add('cover-image');
                    alert('Imagem de capa atualizada com sucesso!');
                } else {
                    alert('Falha ao atualizar a imagem de capa: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao atualizar a imagem de capa:', error);
                alert('Ocorreu um erro ao atualizar a imagem de capa. Por favor, tente novamente.');
            });
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-image');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imageToDelete = this.getAttribute('data-image');

            if (confirm('Tem certeza de que deseja excluir esta imagem?')) {
                fetch('/delete-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image: imageToDelete })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Imagem deletada com sucesso!');
                        // Remover a imagem do DOM
                        this.parentElement.remove();
                    } else {
                        alert('Falha ao deletar a imagem: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao deletar a imagem:', error);
                    alert('Ocorreu um erro ao deletar a imagem. Por favor, tente novamente.');
                });
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pubEditForm');
    const videoInput = document.getElementById('video-upload');
    const videoPreview = document.getElementById('video-preview');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const files = videoInput.files;

            // Verifica se o usuário selecionou pelo menos um vídeo
            if (files.length === 0) {
                return; // Interrompe a execução do código
            }

            const formData = new FormData();

            // Adiciona os vídeos ao FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('videos', files[i]);
            }

            // Enviar os dados do formulário para a rota de upload de vídeos
            fetch('/upload-videos', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Vídeos carregados com sucesso!');
                    // Redirecionar ou atualizar a página conforme necessário
                    window.location.reload(); // Exemplo de recarregar a página
                } else {
                    alert('Falha no upload dos vídeos: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro durante o upload dos vídeos:', error);
                alert('Ocorreu um erro durante o upload dos vídeos. Por favor, tente novamente.');
            });
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const deleteButtons = document.querySelectorAll('.delete-video');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoToDelete = this.getAttribute('data-video');

            if (confirm('Tem certeza de que deseja excluir este vídeo?')) {
                fetch('/delete-video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ video: videoToDelete })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Vídeo deletado com sucesso!');
                        // Remover o vídeo do DOM
                        this.parentElement.remove();
                    } else {
                        alert('Falha ao deletar o vídeo: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro ao deletar o vídeo:', error);
                    alert('Ocorreu um erro ao deletar o vídeo. Por favor, tente novamente.');
                });
            }
        });
    });
});



