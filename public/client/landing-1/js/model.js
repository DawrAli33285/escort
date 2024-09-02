document.addEventListener('DOMContentLoaded', function() {
    const photoButton = document.querySelector('button[data-target="photo"]');
    const videoButton = document.querySelector('button[data-target="video"]');
    const photoSection = document.getElementById('photo-section');
    const videoSection = document.getElementById('video-section');

    // Exibir fotos e ocultar vídeos
    photoButton.addEventListener('click', function() {
        photoSection.classList.remove('d-none');
        videoSection.classList.add('d-none');
    });

    // Exibir vídeos e ocultar fotos
    videoButton.addEventListener('click', function() {
        videoSection.classList.remove('d-none');
        photoSection.classList.add('d-none');
    });
});
