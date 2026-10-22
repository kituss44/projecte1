const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'patata',
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


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new Error('Només es permeten fitxers CSV'));
    }
    cb(null, true);
  }
});

app.post('/api/importar-csv', upload.single('archivo'), async (req, res) => {
  let connection;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No s’ha rebut cap fitxer'
      });
    }

    // Leer el CSV. Acepta encabezados en la primera fila.
    const contenido = req.file.buffer.toString('utf8');

    const registros = parse(contenido, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      delimiter: [',', ';']
    });

    if (registros.length === 0) {
      return res.status(400).json({
        error: 'El CSV no conté registres'
      });
    }

    // Ajusta estos nombres a los encabezados reales de tu CSV
    // y a los nombres exactos de las columnas de tu tabla.
    const columnas = [
      'idEducacio',
      'nom',
      'cognom1',
      'cognom2',
      'codiGrupMatricula',
      'urlImatge',
      'correu',
      'conflictiu'
    ];

    const encabezados = Object.keys(registros[0]);

    const faltantes = columnas.filter(
      columna => !encabezados.includes(columna)
    );

    if (faltantes.length > 0) {
      return res.status(400).json({
        error: 'Falten columnes al CSV',
        columnasFaltantes: faltantes
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const sql = `
      INSERT INTO alumne
      (
        idEducacio,
        nom,
        cognom1,
        cognom2,
        codiGrupMatricula,
        urlImatge,
        correu,
        conflictiu
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const fila of registros) {
      await connection.execute(sql, [
        fila.idEducacio,
        fila.nom,
        fila.cognom1,
        fila.cognom2 || null,
        fila.codiGrupMatricula,
        fila.urlImatge || null,
        fila.correu,
        fila.conflictiu === '1' ||
        fila.conflictiu?.toLowerCase() === 'true' ? 1 : 0
      ]);
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Importació completada correctament',
      registrosInsertados: registros.length
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Error important CSV:', error);

    res.status(500).json({
      error: 'No s’ha pogut importar el CSV'
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.listen(3000, () => console.log('Servidor a http://localhost:3000'));
