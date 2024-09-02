const express = require('express');
const router = express.Router();
const db = require('../db/db'); 
const geoip = require('geoip-lite');
const bcrypt = require('bcryptjs'); // Assuming you want to hash the password before storing it




router.get('/getEscortName/:category/:region/:location/:name',(req,res)=>{
 let {name,category,location,region}=req.params; 
  try{
    let query = `
    SELECT ads.*, advertisers.category 
    FROM ads 
    JOIN advertisers ON ads.advertiser_id = advertisers.id
    WHERE 
  `; // Query SQL base
  const queryParams = [];
  if(category){
    query+=' advertisers.category = ?'
    queryParams.push(category)
  }

  // Se uma região for fornecida, adicionar a cláusula WHERE para filtrar os resultados
  if (region) {
    query += ' AND ads.region =?';
    queryParams.push(region);
  }

  // Se uma localização for fornecida, adicionar a cláusula WHERE para filtrar os resultados
  if (location) {
    query += ' AND ads.location = ?';
    queryParams.push(location);
  }
  if (name) {
    query += ' AND ads.title LIKE ?';
    queryParams.push(`%${name}%`);
}

  db.query(query, queryParams, (err, results) => {

return res.status(200).json({
  results
})
  })
  }catch(e){
    return res.status(400).json({
      message:e.message
    })
  }
})





router.get('/', (req, res) => {
  // Consulta ao banco de dados para buscar todas as categorias
  const query = 'SELECT DISTINCT category FROM advertisers';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }

    // Passando as categorias para a view EJS
    res.render('client/selectCategory', { categories: results });
  });
});

router.get('/model/:id', async(req, res) => {
  const adId = req.params.id;
  const query = `
 SELECT 
  ads.*, 
  favourite.id AS favourite_id,
  favourite.advertiser_id AS favourite_advertiser_id,
  favourite.userid AS favourite_user_id
FROM 
  ads
LEFT JOIN 
  favourite ON ads.advertiser_id = favourite.advertiser_id
WHERE 
  ads.id = ?`;
  const advertiserQuery = `
  SELECT * FROM ads WHERE id = ?
`;


  const userQuery = `
  SELECT * FROM favourite WHERE advertiser_id = ?
`;

const likesQuery=`
  SELECT * FROM likes WHERE advertiser_id = ?
`
const followQuery=`
 SELECT * FROM follows WHERE advertiser_id = ?
`
const commentsQuery=`
SELECT * FROM comments
`

const comments = await queryAsync(commentsQuery);

const advertiserResults = await queryAsync(advertiserQuery, [adId]);
let advertiseridresult=advertiserResults[0]

const userResults = await queryAsync(userQuery, [advertiseridresult.advertiser_id]);
const likes = await queryAsync(likesQuery, [advertiseridresult.advertiser_id]);
const follows= await queryAsync(followQuery, [advertiseridresult.advertiser_id]);

const favourites = userResults;

  // Consulta ao banco de dados para obter as informações do anúncio
  db.query(query, [adId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar as informações do anúncio:', err);
      return res.status(500).send('Erro ao buscar as informações do anúncio');
    }

    if (results.length === 0) {
      return res.status(404).send('Anúncio não encontrado');
    }

    const adData = results[0];

    // Renderizar a página passando os dados do anúncio
    res.render('client/model', { adData ,favourites,likes,follows,comments});
  });
});
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

router.get('/getUserId/:email',async(req,res)=>{
  let {email}=req.params;
  try{
    const userQuery = `
    SELECT * FROM advertisers WHERE email = ?
  `;

  const userResults = await queryAsync(userQuery, [email]);
  if (userResults.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  const user = userResults[0];
  return res.status(200).json({
    user
  })
 

  }catch(e){
    return res.status(400).json({
      error:"Server error please try again"
    })
  }
})

router.post('/add-comments', async (req, res) => {
  let { name, comment, advertiserid } = req.body;

  try {
    const advertiserQuery = `
      SELECT * FROM ads WHERE id = ?
    `;

    const commentQuery = `
      INSERT INTO comments (name, comment, advertiser_id)
      VALUES (?, ?, ?)
    `;

    // Check if the advertiser exists
    const advertiserResults = await queryAsync(advertiserQuery, [advertiserid]);
    if (advertiserResults.length === 0) {
      return res.status(404).json({ error: 'Advertiser not found' });
    }

advertiserid=advertiserResults[0].advertiser_id
    // Insert the comment
    await queryAsync(commentQuery, [name, comment, advertiserid]);
    
    return res.status(200).json({ message: 'Comment added successfully' });
  } catch (e) {
    console.log(e.message);
    return res.status(400).json({ error: 'Server error, please try again' });
  }
});

router.post('/update-password', async (req, res) => {
  let { useremail, password,oldPassword} = req.body;
  console.log(useremail)
  console.log(oldPassword)
  console.log(password)
  try {
      // Hash the password before saving it to the database (optional, but recommended)
    let hashedPassword = await bcrypt.hash(password, 10);
let userQuery=`
SELECT * FROM advertisers WHERE email=?
`
      let userData = await queryAsync(userQuery, [useremail]);
      userData=userData[0]
    
      let hashCompare=await bcrypt.compare(oldPassword,userData.password)
  console.log(hashCompare)
      if(hashCompare==false){
    
        return res.status(400).json({
          error:"old password is incorrect"
        })
      }
     

      // Update the password in the 'advertisers' table
      let updateQuery = `
      UPDATE advertisers SET password = ? WHERE email = ?
    `;
    const result = await queryAsync(updateQuery, [hashedPassword, useremail]);

     
      if (result.affectedRows > 0) {
          return res.status(200).json({
              message: "Password updated successfully"
          });
      } else {
          return res.status(404).json({
              error: "User not found"
          });
      }
  } catch (e) {

      return res.status(400).json({
          error: "Server error, please try again"
      });
  }
});

router.post('/add-favourte',async(req,res)=>{
let {useremail,advertiserid}=req.body;

const adId = 23;
try{
  const userQuery = `
  SELECT * FROM advertisers WHERE email = ?
`;
    // Query to check if the favourite already exists
    const favouriteQuery = `
      SELECT * FROM favourite WHERE userid = ? AND advertiser_id = ?
    `;

    // Query to remove the favourite
    const removeFavouriteQuery = `
      DELETE FROM favourite WHERE userid = ? AND advertiser_id = ?
    `;

    // Query to add the favourite
    const addFavouriteQuery = `
      INSERT INTO favourite (userid, advertiser_id) VALUES (?, ?)
    `;

    // Query to check if advertiser exists
    const advertiserQuery = `
    SELECT * FROM ads WHERE id = ?
  `;

  // Consulta ao banco de dados para obter as informações do anúncio
  const userResults = await queryAsync(userQuery, [useremail]);
  if (userResults.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  const user = userResults[0];
 
  const advertiserResults = await queryAsync(advertiserQuery, [advertiserid]);
let advertiseridresult=advertiserResults[0]
advertiserid=advertiseridresult.advertiser_id
  db.query(favouriteQuery, [user.id, advertiserid], (err, favouriteResults) => {

    if (err) {
      console.error('Error checking if favourite exists:', err);
      return res.status(500).send('Error checking if favourite exists');
    }
  
    if (favouriteResults.length > 0) {
      // If it exists, remove the favourite
      db.query(removeFavouriteQuery, [user.id, advertiserid], (err) => {
        if (err) {
          console.error('Error removing favourite:', err);
          return res.status(500).send('Error removing favourite');
        }
        return res.status(200).json({ message: 'Favourite removed successfully' });
      });
    } else {
      // If it does not exist, add the favourite
      db.query(addFavouriteQuery, [user.id, advertiserid], (err) => {
        if (err) {
          console.error('Error adding favourite:', err);
          return res.status(500).send('Error adding favourite');
        }
        return res.status(200).json({ message: 'Favourite added successfully' });
      });
    }
  });



  }catch(e){
    console.log("ERROR")
    console.log(e.message)
    return res.status(400).json({
      error:"Server error please try again"
    })
  }
})

//add like
router.post('/add-like',async(req,res)=>{
  let {useremail,advertiserid}=req.body;
  
  const adId = 23;
  try{
    const userQuery = `
    SELECT * FROM advertisers WHERE email = ?
  `;
      // Query to check if the favourite already exists
      const favouriteQuery = `
        SELECT * FROM likes WHERE userid = ? AND advertiser_id = ?
      `;
  
      // Query to remove the favourite
      const removeFavouriteQuery = `
        DELETE FROM likes WHERE userid = ? AND advertiser_id = ?
      `;
  
      // Query to add the favourite
      const addFavouriteQuery = `
        INSERT INTO likes (userid, advertiser_id) VALUES (?, ?)
      `;
  
      // Query to check if advertiser exists
      const advertiserQuery = `
      SELECT * FROM ads WHERE id = ?
    `;
  
    // Consulta ao banco de dados para obter as informações do anúncio
    const userResults = await queryAsync(userQuery, [useremail]);
    if (userResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResults[0];
   
    const advertiserResults = await queryAsync(advertiserQuery, [advertiserid]);
  let advertiseridresult=advertiserResults[0]
  advertiserid=advertiseridresult.advertiser_id
    db.query(favouriteQuery, [user.id, advertiserid], (err, favouriteResults) => {
  
      if (err) {
        console.error('Error checking if favourite exists:', err);
        return res.status(500).send('Error checking if favourite exists');
      }
    
      if (favouriteResults.length > 0) {
        // If it exists, remove the favourite
        db.query(removeFavouriteQuery, [user.id, advertiserid], (err) => {
          if (err) {
            console.error('Error removing favourite:', err);
            return res.status(500).send('Error removing favourite');
          }
          return res.status(200).json({ message: 'Favourite removed successfully' });
        });
      } else {
        // If it does not exist, add the favourite
        db.query(addFavouriteQuery, [user.id, advertiserid], (err) => {
          if (err) {
            console.error('Error adding favourite:', err);
            return res.status(500).send('Error adding favourite');
          }
          return res.status(200).json({ message: 'Favourite added successfully' });
        });
      }
    });
  
  
  
    }catch(e){
      console.log("ERROR")
      console.log(e.message)
      return res.status(400).json({
        error:"Server error please try again"
      })
    }
  })


  //follows
  router.post('/add-follow',async(req,res)=>{
    let {useremail,advertiserid}=req.body;
    
    const adId = 23;
    try{
      const userQuery = `
      SELECT * FROM advertisers WHERE email = ?
    `;
        // Query to check if the favourite already exists
        const favouriteQuery = `
          SELECT * FROM follows WHERE userid = ? AND advertiser_id = ?
        `;
    
        // Query to remove the favourite
        const removeFavouriteQuery = `
          DELETE FROM follows WHERE userid = ? AND advertiser_id = ?
        `;
    
        // Query to add the favourite
        const addFavouriteQuery = `
          INSERT INTO follows (userid, advertiser_id) VALUES (?, ?)
        `;
    
        // Query to check if advertiser exists
        const advertiserQuery = `
        SELECT * FROM ads WHERE id = ?
      `;
    
      // Consulta ao banco de dados para obter as informações do anúncio
      const userResults = await queryAsync(userQuery, [useremail]);
      if (userResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user = userResults[0];
     
      const advertiserResults = await queryAsync(advertiserQuery, [advertiserid]);
    let advertiseridresult=advertiserResults[0]
    advertiserid=advertiseridresult.advertiser_id
      db.query(favouriteQuery, [user.id, advertiserid], (err, favouriteResults) => {
    
        if (err) {
          console.error('Error checking if favourite exists:', err);
          return res.status(500).send('Error checking if favourite exists');
        }
      
        if (favouriteResults.length > 0) {
          // If it exists, remove the favourite
          db.query(removeFavouriteQuery, [user.id, advertiserid], (err) => {
            if (err) {
              console.error('Error removing favourite:', err);
              return res.status(500).send('Error removing favourite');
            }
            return res.status(200).json({ message: 'Favourite removed successfully' });
          });
        } else {
          // If it does not exist, add the favourite
          db.query(addFavouriteQuery, [user.id, advertiserid], (err) => {
            if (err) {
              console.error('Error adding favourite:', err);
              return res.status(500).send('Error adding favourite');
            }
            return res.status(200).json({ message: 'Favourite added successfully' });
          });
        }
      });
    
    
    
      }catch(e){
        console.log("ERROR")
        console.log(e.message)
        return res.status(400).json({
          error:"Server error please try again"
        })
      }
    })
  

// Rota para a home
router.get('/:category/:region?/:location?', async(req, res) => {
  // Obtenção do IP do cliente

  let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
 

  // Obtenção da localização do cliente com base no IP
  let geo = geoip.lookup(clientIp);
  if (geo) {
    console.log(`País: ${geo.country}, Cidade: ${geo.city}`);
  } else {
    console.log('Localização não encontrada para este IP');
  }

  let{ category, region, location } = req.params; // Obtém os parâmetros de categoria, região e localização da URL

 if(category=="premium"){
  category="trans"
 }
  if(location===undefined && region===undefined && geo){
  
  location=geo.city
  region=geo.country
 }

//  if(region=="brasil" && location==undefined){
// location="lisboa"
//  }else if(region=="portugal" && location==undefined){
// location="lisboa"
//  }else if(region=="germany" && location==undefined){
//   location="berlin"
//  }else if(region=="uk" && location==undefined){
//   location="london"
//  }else if(region=="usa" && location==undefined){
//   location="los-angeles"
//  }
let filter = req.query.filter;
 

let query = `
    SELECT 
        ads.*, 
        advertisers.category, 
        favourite.* 
    FROM 
        ads 
    JOIN 
        advertisers ON ads.advertiser_id = advertisers.id
    LEFT JOIN 
        favourite ON ads.advertiser_id = favourite.advertiser_id
    WHERE 
`;
let diamondquery = `
    SELECT 
        ads.*, 
        advertisers.category, 
        favourite.* 
    FROM 
        ads 
    JOIN 
        advertisers ON ads.advertiser_id = advertisers.id
    LEFT JOIN 
        favourite ON ads.advertiser_id = favourite.advertiser_id
    WHERE 
        ads.plan = 'Diamond'
`;


let premiumquery = `
    SELECT 
        ads.*, 
        advertisers.category, 
        favourite.* 
    FROM 
        ads 
    JOIN 
        advertisers ON ads.advertiser_id = advertisers.id
    LEFT JOIN 
        favourite ON ads.advertiser_id = favourite.advertiser_id
    WHERE 
        ads.plan = 'Premium'
`;




  const queryParams = [];
  if(category){
    query+=' advertisers.category = ?'
    queryParams.push(category)
  }

  // Se uma região for fornecida, adicionar a cláusula WHERE para filtrar os resultados
  if (region) {
    query += ' AND ads.region =?';
    queryParams.push(region);
  }

  // Se uma localização for fornecida, adicionar a cláusula WHERE para filtrar os resultados
  if (location) {
    query += ' AND ads.location = ?';
    queryParams.push(location);
  }
  const diamond = await queryAsync(diamondquery);

  const premium = await queryAsync(premiumquery);

if(filter=='new'){
  query += ' ORDER BY ads.created_at DESC';
}

  db.query(query, queryParams, (err, results) => {
  
  
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Database error');
    }

    // Processar os dados para pegar apenas a primeira imagem
    const advertisers = results.map(ad => {
      if (ad.images) {
        ad.images = ad.images.split(',')[0]; // Pega apenas a primeira URL
      }
      return ad;
    });

    let videos=results.filter(u=>u.videos!=null)


   
    // Passando os dados processados para a view EJS, incluindo a localização se disponível
    res.render('client/home', { advertisers, location,region,category,videos,filter,diamond,premium});
  });
});




router.get('/home-man', (req, res) => {
  res.render('client/home-man');
});



router.get('/galeria', (req, res) => {
  res.render('client/galery'); 
});


router.delete('/delete/:email', async (req, res) => {
  let { email } = req.params;
  console.log(email);
  console.log("EMAIL");

  try {
      const updateUserQuery = `
          UPDATE advertisers
          SET email = CONCAT('deleted+', email),
              password = CONCAT('deleted+', email)
          WHERE email = ?
      `;

      db.query(updateUserQuery, [email], (err) => {
          if (err) {
              console.error('Error updating user:', err);
              return res.status(500).send('Error updating user');
          }
          return res.status(200).json({ message: 'User marked as deleted successfully' });
      });

  } catch (e) {
      return res.status(400).json({
          error: "Server error, please try again"
      });
  }
});


//view
router.post('/add-viewcontact',async(req,res)=>{
 let {email,advertiserid,reason}=req.body;

  try{
    const userQuery = `
    SELECT * FROM advertisers WHERE email = ?
  `;

  let userResults = await queryAsync(userQuery, [email]);
  userResults=userResults[0]
  const advertiserQuery = `
  SELECT * FROM ads WHERE id = ?
`;
let advertiserResults = await queryAsync(advertiserQuery, [advertiserid]);
advertiserResults=advertiserResults[0]
let insertionQuery=`
      INSERT INTO viewsandcontacts (userid, advertiser_id, reason)
      VALUES (?, ?, ?)
`
await queryAsync(insertionQuery, [userResults.id, advertiserResults.advertiser_id, reason]);
    
  }catch(e){
    return res.status(400).json({
      error:"Server error please try again"
    })
  }
})

module.exports = router;
