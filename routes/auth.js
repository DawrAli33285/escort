const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/db');



router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
  
    db.query('SELECT * FROM advertisers WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.redirect('/auth/login');
      }
  
      if (results.length > 0) {
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (isMatch) {
            req.session.user = {
              id: user.id,
              username: user.username,
              email: user.email
            };
            res.cookie('user_id', user.id, { httpOnly: true, secure: true, sameSite: 'Strict' });
            return res.status(200).json({ success: true, message: 'Logged!' });
          } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        });
      } else {
        return res.redirect('/auth/login');
      }
    });
  });

  // Rota de logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      res.redirect('/');
    });
  });
  

// Rota para registro de advertiser
router.post('/register', (req, res) => {
    const { name, email, category, adName, phone, password, location } = req.body;

    // Validação básica
    if (!name || !email || !category || !adName || !phone || !password || !location) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // Verifica se o email já está em uso
    db.query('SELECT email FROM advertisers WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Erro ao verificar email:', err);
            return res.status(500).json({ message: 'Erro no servidor.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email já está em uso.' });
        }

        // Criptografa a senha
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Erro ao criptografar senha:', err);
                return res.status(500).json({ message: 'Erro no servidor.' });
            }

            // Insere o novo anunciante no banco de dados
            db.query(
                `INSERT INTO advertisers (username, email, password, name, contact_info, bio, approved, location, category)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, adName, phone, location, 0, location, category],
                (err, result) => {
                    if (err) {
                        console.error('Erro ao registrar o usuário:', err);
                        return res.status(500).json({ message: 'Erro no servidor.' });
                    }

                    res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: result.insertId });
                }
            );
        });
    });
});





module.exports = router;
