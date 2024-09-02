const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { isAuthenticated } = require('../controllers/auth'); // Importando o middleware
const upload = require('../controllers/uploads');

const queryAsync = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };
// Rota para a home
router.get('/account', async(req, res) => {
    const userId = req.session.user.id;
   
    let viewsQuery=`
    SELECT 
    v.advertiser_id, 
    COUNT(*) AS view_count,
    MIN(v.created_at) AS earliest_view_date
FROM 
    viewsandcontacts v
JOIN 
    ads a ON v.advertiser_id = a.advertiser_id
WHERE 
    v.reason = 'view' AND v.advertiser_id = ?
GROUP BY 
    v.advertiser_id;

    `


    let contactQuery=`
    SELECT 
    v.advertiser_id, 
    COUNT(*) AS view_count,
    MIN(v.created_at) AS earliest_view_date
FROM 
    viewsandcontacts v
JOIN 
    ads a ON v.advertiser_id = a.advertiser_id
WHERE 
    v.reason = 'view' AND v.advertiser_id = ?
GROUP BY 
    v.advertiser_id;

    `
    const views = await queryAsync(viewsQuery, [userId]);
    const contacts = await queryAsync(contactQuery, [userId]);

    // Consultar a tabela de anúncios (ads) para ver se há um registro existente para o advertiser_id
    db.query('SELECT * FROM ads WHERE advertiser_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            // Se o registro já existir, passe os dados para a view
            const adData = results[0];
            res.render('advertiser/account', { userId, adData,views,contacts });
        } else {
            // Se não houver um registro, insira um novo com valores padrão
            const newAd = {
                advertiser_id: userId,
                title: '',
                description: '',
                whatsapp: '',
                number: '',
                price: null,
                location: '',
                address: '',
                hours: '',
                age: '',
                hair: '',
                height: '',
                body_size: '',
                nationality: '',
                images: ''
            };

            db.query('INSERT INTO ads SET ?', newAd, (err, insertResult) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).send('Database error');
                }

                // Após a inserção, passe os dados para a view
                res.render('advertiser/account', { userId, adData: newAd,views,contacts});
            });
        }
    });
});



router.post('/update-ad', (req, res) => {
    const userId = req.session.user.id; // Obtém o ID do usuário da sessão

    console.log('Requisição', req.body);

    const {
        pub_phone,
        pub_whatsapp,
        pub_region,
        pub_gmap_address,
        work_time_range,
        work_days,
        pub_age,
        pub_height,
        pub_weight,
        pub_penis_size,
        pub_body,
        pub_nationality,
        pub_languages,
        pub_tag_location,
        pub_waxing,
        pub_description,
        pub_social_facebook,
        pub_social_instagram,
        pub_social_twitter,
        pub_social_snapchat,
        pub_social_tiktok,
        pub_social_onlyfans,
        pub_social_patreon,
        pub_social_manyvids,
        pub_social_webcam,
        country 
    } = req.body;

    console.log('pub_languages:', pub_languages);
    console.log('Type of pub_languages:', typeof pub_languages);

    // Helper function to clean up values
    const safeValue = (value) => {
        if (Array.isArray(value)) {
            // Handle arrays, remove empty strings and join non-empty values
            const filteredArray = value.filter(item => item !== '');
            return filteredArray.length > 0 ? filteredArray.join(',') : null;
        }
        // Handle empty strings and undefined values
        return value === '' || value === undefined ? null : value;
    };

    const query = `
        UPDATE ads SET
            whatsapp = ?, 
            phone = ?, 
            region = ?, 
            location =?,
            gmap_address = ?, 
            work_time_range = ?, 
            work_days = ?,
            age = ?, 
            height = ?, 
            weight = ?, 
            penis_size = ?, 
            body = ?, 
            nationality = ?, 
            languages = ?, 
            service_location = ?,
            waxing = ?,
            description = ?, 
            social_facebook = ?, 
            social_instagram = ?, 
            social_twitter = ?, 
            social_snapchat = ?, 
            social_tiktok = ?, 
            social_onlyfans = ?, 
            social_patreon = ?, 
            social_manyvids = ?, 
            social_webcam = ? 
        WHERE advertiser_id = ?`;

    const values = [
        safeValue(pub_whatsapp),
        safeValue(pub_phone),
        safeValue(country),
        safeValue(pub_region),
        safeValue(pub_gmap_address),
        safeValue(work_time_range), 
        safeValue(work_days),
        safeValue(pub_age),
        safeValue(pub_height),
        safeValue(pub_weight),
        safeValue(pub_penis_size),
        safeValue(pub_body),
        safeValue(pub_nationality),
        safeValue(pub_languages),  // This will handle arrays with empty strings
        safeValue(pub_tag_location),
        safeValue(pub_waxing),
        safeValue(pub_description),
        safeValue(pub_social_facebook),
        safeValue(pub_social_instagram),
        safeValue(pub_social_twitter),
        safeValue(pub_social_snapchat),
        safeValue(pub_social_tiktok),
        safeValue(pub_social_onlyfans),
        safeValue(pub_social_patreon),
        safeValue(pub_social_manyvids),
        safeValue(pub_social_webcam),
        userId
    ];

    // Debugging: Log the query and values
    console.log('SQL Query:', query);
    console.log('SQL Values:', values);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update ad' });
        }

        res.status(200).json({ success: 'Ad updated successfully' });
    });
});


router.post('/upload-images',  upload.array('images', 10), (req, res) => {
    const imagePaths = req.files.map(file => file.path).join(',');
    const userId = req.session.user.id;

    // Recuperar as imagens existentes do banco de dados
    db.query('SELECT images FROM ads WHERE advertiser_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar imagens existentes:', err);
            return res.status(500).json({ error: 'Erro ao buscar imagens existentes' });
        }

        let existingImages = results[0]?.images || '';

        // Se houver imagens existentes, concatene-as com as novas
        if (existingImages) {
            existingImages += ',' + imagePaths;
        } else {
            existingImages = imagePaths;
        }

        // Atualizar o banco de dados com as imagens concatenadas
        db.query('UPDATE ads SET images = ? WHERE advertiser_id = ?', [existingImages, userId], (err, result) => {
            if (err) {
                console.error('Erro ao atualizar as imagens:', err);
                return res.status(500).json({ error: 'Erro ao atualizar as imagens' });
            }

            res.json({ success: true, message: 'Imagens carregadas com sucesso!' });
        });
    });
});



router.post('/set-cover-image',  (req, res) => {
    const { imageUrl } = req.body;
    const userId = req.session.user.id;

    // Atualizar a coluna cover_image no banco de dados
    db.query('UPDATE ads SET cover_image = ? WHERE advertiser_id = ?', [imageUrl, userId], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar a imagem de capa:', err);
            return res.status(500).json({ error: 'Erro ao atualizar a imagem de capa' });
        }

        res.json({ success: true, message: 'Imagem de capa atualizada com sucesso!' });
    });
});

router.post('/delete-image', (req, res) => {
    const { image } = req.body;
    const userId = req.session.user.id;

    // Primeiro, recupera as imagens existentes do banco de dados
    db.query('SELECT images FROM ads WHERE advertiser_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar imagens existentes:', err);
            return res.status(500).json({ error: 'Erro ao buscar imagens existentes' });
        }

        let existingImages = results[0]?.images || '';

        // Transforma a string de imagens em um array
        let imageArray = existingImages.split(',');

        // Remove a imagem específica do array
        imageArray = imageArray.filter(img => img !== image);

        // Verifica se o array não está vazio
        let updatedImages = imageArray.length > 0 ? imageArray.join(',') : '';

        // Atualiza o banco de dados com a nova lista de imagens
        db.query('UPDATE ads SET images = ? WHERE advertiser_id = ?', [updatedImages, userId], (err, result) => {
            if (err) {
                console.error('Erro ao atualizar as imagens:', err);
                return res.status(500).json({ error: 'Erro ao atualizar as imagens' });
            }

            res.json({ success: true, message: 'Imagem deletada com sucesso!' });
        });
    });
});

router.post('/upload-videos',  upload.array('videos', 10), (req, res) => {
    const videoPaths = req.files.map(file => file.path).join(',');
    const userId = req.session.user.id;

    // Recuperar os vídeos existentes do banco de dados
    db.query('SELECT videos FROM ads WHERE advertiser_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar vídeos existentes:', err);
            return res.status(500).json({ error: 'Erro ao buscar vídeos existentes' });
        }

        let existingVideos = results[0]?.videos || '';

        // Se houver vídeos existentes, concatene-os com os novos
        if (existingVideos) {
            existingVideos += ',' + videoPaths;
        } else {
            existingVideos = videoPaths;
        }

        // Atualizar o banco de dados com os vídeos concatenados
        db.query('UPDATE ads SET videos = ? WHERE advertiser_id = ?', [existingVideos, userId], (err, result) => {
            if (err) {
                console.error('Erro ao atualizar os vídeos:', err);
                return res.status(500).json({ error: 'Erro ao atualizar os vídeos' });
            }

            res.json({ success: true, message: 'Vídeos carregados com sucesso!' });
        });
    });
});

router.post('/delete-video', (req, res) => {
    const { video } = req.body;
    const userId = req.session.user.id;

    // Primeiro, recupera os vídeos existentes do banco de dados
    db.query('SELECT videos FROM ads WHERE advertiser_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar vídeos existentes:', err);
            return res.status(500).json({ error: 'Erro ao buscar vídeos existentes' });
        }

        let existingVideos = results[0]?.videos || '';

        // Remove o vídeo específico da lista
        let updatedVideos = existingVideos.split(',').filter(v => v !== video).join(',');

        // Atualiza o banco de dados com a nova lista de vídeos
        db.query('UPDATE ads SET videos = ? WHERE advertiser_id = ?', [updatedVideos, userId], (err, result) => {
            if (err) {
                console.error('Erro ao atualizar os vídeos:', err);
                return res.status(500).json({ error: 'Erro ao atualizar os vídeos' });
            }

            res.json({ success: true, message: 'Vídeo deletado com sucesso!' });
        });
    });
});



module.exports = router;
