const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const clientRoutes = require('./routes/clientRoutes');
const advertiserRoutes = require('./routes/advertiserRoutes');
const path = require('path');
const authRoutes = require('./routes/auth');
const checkLogin = require('./controllers/checklogin'); // Certifique-se de apontar para o caminho correto do middleware

// Carregar as variáveis de ambiente
dotenv.config();

// Configurações
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));
app.use(checkLogin);

app.use(express.static('public'));
// Serve arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View Engine
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');



// Rotas
app.use('/', advertiserRoutes);
app.use('/', clientRoutes); // Define as rotas dos clientes como padrão para a raiz

app.use('/auth', authRoutes);


// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
