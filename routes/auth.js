const express =require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db')
router.post('/register', async(req, res) => {
    const { name, username, password, gender, age } = req.body;
    if(!name || !username || !password || !gender || !age) 
        {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
   if (password.length < 6)
        {
            return res.status(400).json({ message: 'Password need to be at least 6 characters' });
        } 
    try {
         const usernameCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
             if(usernameCheck.rows.length>0)
             {
                 return res.status(409).json({error: 'Mathching username already exists'});
             }
         const hashedPassword = await bcrypt.hash(password, 10);

     const result = await pool.query(
    'INSERT INTO users (name, username, password,gender, age) VALUES ( $1, $2, $3, $4, $5) RETURNING Id, name, username',
    [name, username, hashedPassword, gender, age]
);
            
    


console.log('New user registered:', result.rows[0]);
return res.status(201).json({
    message: 'User registered successfully', user: result.rows[0]
});

}
catch (error) {
    console.error('Error registering user:', error.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
}
});
/* Login */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

   if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
   try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
     if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
     const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
     req.session.user = {
      id:       user.id,
      name:     user.name,
      username: user.username,
    };

    return res.status(200).json({
      message: 'Login successful!',
      user: {
        id:       user.id,
        name:     user.name,
        username: user.username,
      }
    });
    } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

router.get('/check', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    return res.status(200).json({
      loggedIn: false
    });
  }
});

module.exports = router;