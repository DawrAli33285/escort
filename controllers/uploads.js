const multer = require('multer');
const path = require('path');

// Configuração do armazenamento do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Função para filtrar o tipo de arquivo (permitindo imagens e vídeos)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', // Tipos de imagem
        'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm' // Tipos de vídeo
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido. Somente imagens e vídeos são permitidos.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB para vídeos
});

module.exports = upload;