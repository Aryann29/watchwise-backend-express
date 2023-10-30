const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5005;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json());


app.post('/register', async (req, res) => {
    const { username } = req.body;
  
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
  
    try {  
      const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      await pool.query('INSERT INTO users (username) VALUES ($1)', [username]);
  
      res.json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/like', async (req, res) => {
    const { username, movieId } = req.body;
  
    if (!username || !movieId) {
      return res.status(400).json({ error: 'User ID and Movie ID are required' });
    }
  
    try {
    
      const existingLike = await pool.query('SELECT * FROM liked_movies WHERE username = $1 AND movie_id = $2', [username, movieId]);
  
      if (existingLike.rows.length > 0) {
        return res.status(409).json({ error: 'Movie is already liked by the user' });
      }
  
   
      await pool.query('INSERT INTO liked_movies (username, movie_id) VALUES ($1, $2)', [username, movieId]);
  
      res.json({ message: 'Movie liked successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  
  app.post('/api/unlike', async (req, res) => {
    const { username, movieId } = req.body;
  
    if (!username || !movieId) {
      return res.status(400).json({ error: 'Username and Movie ID are required' });
    }
  
    try {

      const existingLike = await pool.query(
        'SELECT * FROM liked_movies WHERE username = (SELECT username FROM users WHERE username = $1) AND movie_id = $2',
        [username, movieId]
      );
  
      if (existingLike.rows.length === 0) {
        return res.status(404).json({ error: 'Movie is not liked by the user' });
      }
  
     
      await pool.query(
        'DELETE FROM liked_movies WHERE username = (SELECT username FROM users WHERE username = $1) AND movie_id = $2',
        [username, movieId]
      );
  
      res.json({ message: 'Movie unliked successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/api/liked-movies/:username', async (req, res) => {
    const username = req.params.username;
  
    try {
     
      const likedMovies = await pool.query(
        
        'SELECT movie_id FROM liked_movies WHERE username = $1',
        [username]
        
      );
    
  
     
      const movieIds = likedMovies.rows.map(row => row.movie_id);
  
      res.json(movieIds);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  app.post('/api/watchlist', async (req, res) => {
    const { username, movieId } = req.body;
   
    if (!username || !movieId) {
      return res.status(400).json({ error: 'User ID and Movie ID are required' });
    }
  
    try {
   
      const existingLike = await pool.query('SELECT * FROM watchlist_movies WHERE username = $1 AND movie_id = $2', [username, movieId]);
  
      if (existingLike.rows.length > 0) {
        return res.status(409).json({ error: 'Movie is already watchlist by the user' });
      }
  
      await pool.query('INSERT INTO watchlist_movies (username, movie_id) VALUES ($1, $2)', [username, movieId]);
  
      res.json({ message: 'Movie watchlist successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/unwatchlist', async (req, res) => {
    const { username, movieId } = req.body;
  
    if (!username || !movieId) {
      return res.status(400).json({ error: 'Username and Movie ID are required' });
    }
  
    try {
      
      const existingLike = await pool.query(
        'SELECT * FROM watchlist_movies WHERE username = (SELECT username FROM users WHERE username = $1) AND movie_id = $2',
        [username, movieId]
      );
  
      if (existingLike.rows.length === 0) {
        return res.status(404).json({ error: 'Movie is not liked by the user' });
      }
  

      await pool.query(
        'DELETE FROM watchlist_movies WHERE username = (SELECT username FROM users WHERE username = $1) AND movie_id = $2',
        [username, movieId]
      );
  
      res.json({ message: 'Movie unliked successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/watchlist-movies/:username', async (req, res) => {
    const username = req.params.username;
  
    try {
      // Query the database to get the liked movies for the user
      const watchList_mov = await pool.query(
        
        'SELECT movie_id FROM watchlist_movies WHERE username = $1',
        [username]
        
      ); 
  
      
      const movieIds = watchList_mov.rows.map(row => row.movie_id);
  
      res.json(movieIds); 
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

