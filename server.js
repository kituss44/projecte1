const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234qwer',
  database: 'cacaproject'
});

app.post('/api/usuaris', async (req, res) => {
  const { correu, nom, cognom, password, admin } = req.body;

  if (!correu || !nom || !cognom || !password) {
    return res.status(400).json({ error: 'Falten camps obligatoris' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO `user` (userCorreu, userNom, userCognom, userPassword, admin) VALUES (?, ?, ?, ?, ?)',
      [correu, nom, cognom, hash, admin ? 1 : 0]
    );
    res.status(201).json({ correu, nom, cognom, admin: !!admin });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Aquest correu ja existeix' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  const { correu, password } = req.body;

  if (!correu || !password) {
    return res.status(400).json({ error: 'Falten camps obligatoris' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT userCorreu, userNom, userCognom, userPassword, admin FROM `user` WHERE userCorreu = ?',
      [correu]
    );

    // Mateix missatge si no existeix l'usuari o la contrasenya és incorrecta
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuari o contrasenya incorrectes' });
    }

    const user = rows[0];
    const correcta = await bcrypt.compare(password, user.userPassword);

    if (!correcta) {
      return res.status(401).json({ error: 'Usuari o contrasenya incorrectes' });
    }

    const token = crypto.randomUUID();
    await pool.execute(
      'UPDATE `user` SET sessionToken = ? WHERE userCorreu = ?',
      [token, user.userCorreu]
    );

    res.json({
      correu: user.userCorreu,
      nom: user.userNom,
      cognom: user.userCognom,
      admin: !!user.admin,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/api/sessio', async (req, res) => {
  const { correu, token } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT userCorreu FROM `user` WHERE userCorreu = ? AND sessionToken = ?',
      [correu, token]
    );
    if (rows.length === 0 || !token) {
      return res.status(401).json({ error: 'Sessió no vàlida' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Tanca la sessió
app.post('/api/logout', async (req, res) => {
  const { correu, token } = req.body;
  try {
    await pool.execute(
      'UPDATE `user` SET sessionToken = NULL WHERE userCorreu = ? AND sessionToken = ?',
      [correu, token]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.listen(3000, () => console.log('Servidor a http://localhost:3000'));
