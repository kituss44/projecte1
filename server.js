const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer');
const XLSX = require('xlsx');

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


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/\.(xlsx|xls)$/i.test(file.originalname)) {
      return cb(new Error('Només es permeten fitxers Excel (.xlsx o .xls)'));
    }
    cb(null, true);
  }
});

// Envolta multer perquè els seus errors es retornin com a JSON (400)
function pujarArxiu(req, res, next) {
  upload.single('archivo')(req, res, err => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

app.post('/api/importar-csv', pujarArxiu, async (req, res) => {
  let connection;

  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No s’ha rebut cap fitxer'
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]]; // primera hoja

    // Lee las filas usando la primera fila como cabecera
    const registrosRaw = XLSX.utils.sheet_to_json(hoja, { defval: '', raw: false });

    // Quita espacios sobrantes en los nombres de las cabeceras y en los valores
    const registros = registrosRaw.map(fila => {
      const limpia = {};
      for (const [clave, valor] of Object.entries(fila)) {
        limpia[clave.trim()] = typeof valor === 'string' ? valor.trim() : valor;
      }
      return limpia;
    });

    if (registros.length === 0) {
      return res.status(400).json({
        error: 'L’Excel no conté registres'
      });
    }

    const columnas = [
      'idEducacio',
      'nom',
      'cognom1',
      'cognom2',
      'codiGrupMatricula',
    ];

    const encabezados = Object.keys(registros[0]);
    console.log('Capçaleres rebudes:', encabezados);

    const faltantes = columnas.filter(
      columna => !encabezados.includes(columna)
    );

    if (faltantes.length > 0) {
      return res.status(400).json({
        error: 'Falten columnes a l’Excel',
        columnasFaltantes: faltantes
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const sql = `
      INSERT INTO alumne
      (
        idIeduca,
        nom,
        cognom1,
        cognom2,
        codiGrupMatriculat,
        conflictiu
      )
      VALUES (?, ?, ?, ?, ?, 0)
    `;

    for (const fila of registros) {

      // Els "--" i les cel·les buides es guarden com a NULL
      const aNull = v => (v === undefined || v === '' || v === '--') ? null : v;

      await connection.execute(sql, [
        fila.idEducacio,
        fila.nom,
        aNull(fila.cognom1),
        aNull(fila.cognom2),
        fila.codiGrupMatricula
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

    console.error('Error important Excel:', error);

    res.status(500).json({
      error: 'No s’ha pogut importar l’Excel',
      detall: error.sqlMessage || error.message
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});


        // VISUALITZAR BASES DE DADES

async function llistarTaules() {
  const [rows] = await pool.query('SHOW TABLES');
  return rows.map(r => Object.values(r)[0]);
}

// Llista de taules
app.get('/api/db/taules', async (req, res) => {
  try {
    res.json(await llistarTaules());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Contingut d'una taula
app.get('/api/db/taules/:nom', async (req, res) => {
  try {
    const nom = req.params.nom;
    const taules = await llistarTaules();
    if (!taules.includes(nom)) {
      return res.status(404).json({ error: 'Taula no trobada' });
    }

    const [files] = await pool.query('SELECT * FROM ??', [nom]);
    const columnes = files.length ? Object.keys(files[0]) : [];

    const [pkRows] = await pool.query(
      "SHOW KEYS FROM ?? WHERE Key_name = 'PRIMARY'",
      [nom]
    );
    const pk = pkRows.map(r => r.Column_name);

    res.json({ columnes, files, pk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualitza files d'una taula
app.put('/api/db/taules/:nom', async (req, res) => {
  let connection;
  try {
    const nom = req.params.nom;
    const { canvis } = req.body;

    const taules = await llistarTaules();
    if (!taules.includes(nom)) {
      return res.status(404).json({ error: 'Taula no trobada' });
    }
    if (!Array.isArray(canvis) || canvis.length === 0) {
      return res.status(400).json({ error: 'No hi ha canvis' });
    }

    const [colRows] = await pool.query('SHOW COLUMNS FROM ??', [nom]);
    const columnesValides = colRows.map(c => c.Field);

    const [pkRows] = await pool.query(
      "SHOW KEYS FROM ?? WHERE Key_name = 'PRIMARY'",
      [nom]
    );
    const pkCols = pkRows.map(r => r.Column_name);
    if (pkCols.length === 0) {
      return res.status(400).json({ error: 'La taula no té clau primària' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const { pk, valors } of canvis) {
      const cols = Object.keys(valors || {});
      if (
        cols.length === 0 ||
        !cols.every(c => columnesValides.includes(c)) ||
        !pkCols.every(c => pk && pk[c] !== undefined)
      ) {
        throw new Error('Canvi invàlid');
      }

      const where = pkCols.map(() => '?? = ?').join(' AND ');
      const paramsWhere = pkCols.flatMap(c => [c, pk[c]]);

      await connection.query(
        `UPDATE ?? SET ? WHERE ${where}`,
        [nom, valors, ...paramsWhere]
      );
    }

    await connection.commit();
    res.json({ ok: true, actualitzades: canvis.length });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'No s\'han pogut guardar els canvis' });
  } finally {
    if (connection) connection.release();
  }
});


app.listen(3000, () => console.log('Servidor a http://localhost:3000'));
