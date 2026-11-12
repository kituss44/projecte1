const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs/promises');
const path = require('path');

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

app.post('/api/importar-professors', pujarArxiu, async (req, res) => {
  let connection;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No s’ha rebut cap fitxer' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];

    // Cada fila como array: se usa la primera celda con contenido (nombre completo)
    const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '', raw: false });

    let nombres = filas
      .map(fila => String(fila.find(celda => String(celda).trim() !== '') ?? '').trim())
      .filter(nombre => nombre !== '');

    const esCabecera = /^(nom|nombre|professor|professorat|profesor|nom complet|nomprofessor)$/i;
    if (nombres.length > 0 && esCabecera.test(nombres[0])) {
      nombres.shift();
    }

    if (nombres.length === 0) {
      return res.status(400).json({ error: 'L’Excel no conté noms de professors' });
    }

    if (nombres.some(nombre => nombre.length > 255)) {
      return res.status(400).json({ error: 'Hi ha noms de més de 255 caràcters' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existentes] = await connection.query('SELECT nomprofessor FROM professor');
    const vistos = new Set(existentes.map(r => r.nomprofessor.trim().toLowerCase()));

    let insertados = 0;
    let duplicados = 0;

    for (const nombre of nombres) {
      const clave = nombre.toLowerCase();

      if (vistos.has(clave)) {
        duplicados++;
        continue;
      }

      await connection.execute(
        'INSERT INTO professor (nomprofessor) VALUES (?)',
        [nombre]
      );
      vistos.add(clave);
      insertados++;
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Importació completada correctament',
      registrosInsertados: insertados,
      duplicados
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Error important professors:', error);

    res.status(500).json({
      error: 'No s’han pogut importar els professors',
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

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Sessió no vàlida' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT userCorreu, admin FROM `user` WHERE sessionToken = ?',
      [token]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Sessió no vàlida' });
    }
    if (!rows[0].admin) {
      return res.status(403).json({ error: 'No tens permisos' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

app.delete('/api/db/buidar', requireAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query('DELETE FROM registrelavabo');
    await connection.query('DELETE FROM alumne');

    await connection.commit();

    await connection.query('ALTER TABLE registrelavabo AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE alumne AUTO_INCREMENT = 1');

    res.json({ ok: true });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'No s\'ha pogut eliminar la base de dades' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/usuaris/no-admin', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT userCorreu, userNom, userCognom FROM `user` WHERE admin = 0 ORDER BY userCorreu'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.delete('/api/usuaris/no-admin', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM `user` WHERE admin = 0');
    res.json({ ok: true, eliminats: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No s\'han pogut eliminar els usuaris' });
  }
});

app.delete('/api/usuaris/:correu', requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM `user` WHERE userCorreu = ? AND admin = 0',
      [req.params.correu]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuari no trobat o és administrador' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No s\'ha pogut eliminar l\'usuari' });
  }
});

app.get('/api/alumnes/sortides', async (req, res) => {
  const idAlumne = String(req.query.idAlumne ?? '').trim();
  const idIeduca = String(req.query.idIeduca ?? '').trim();

  if (!idAlumne && !idIeduca) {
    return res.status(400).json({ error: 'Falta l’identificador de l’alumne' });
  }

  if (idAlumne && !/^\d+$/.test(idAlumne)) {
    return res.status(400).json({ error: 'L’ID alumne ha de ser un número' });
  }

  try {
    // Si vienen los dos, manda el ID alumne
    const [alumnes] = idAlumne
      ? await pool.execute(
        `SELECT idAlumne, idIeduca, nom, cognom1, cognom2, codiGrupMatriculat
         FROM alumne WHERE idAlumne = ?`,
        [idAlumne]
      )
      : await pool.execute(
        `SELECT idAlumne, idIeduca, nom, cognom1, cognom2, codiGrupMatriculat
         FROM alumne WHERE idIeduca = ?`,
        [idIeduca]
      );

    if (alumnes.length === 0) {
      return res.status(404).json({ error: 'Alumne no trobat' });
    }

    const alumne = alumnes[0];

    const [sortides] = await pool.execute(
      `SELECT dataEntrada,
              dataSortida,
              TIMESTAMPDIFF(MINUTE, dataEntrada, dataSortida) AS durada,
              professor
       FROM registrelavabo
       WHERE idAlumne = ?
       ORDER BY dataEntrada DESC`,
      [alumne.idAlumne]
    );

    const durades = sortides
      .map(s => s.durada)
      .filter(d => d !== null);

    const tempsMitja = durades.length
      ? Math.round(durades.reduce((a, b) => a + b, 0) / durades.length)
      : null;

    res.json({
      alumne,
      sortides,
      tempsMitja,
      total: sortides.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const ALUMNES_DIR = path.join(UPLOADS_DIR, 'alumnes');

app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/api/alumnes/grups', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT codiGrupMatriculat
       FROM alumne
       WHERE codiGrupMatriculat IS NOT NULL
       ORDER BY codiGrupMatriculat`
    );
    res.json(rows.map(r => r.codiGrupMatriculat));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

const uploadImatges = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 200 },
  fileFilter: (req, file, cb) => {
    if (!/\.jpe?g$/i.test(file.originalname)) {
      return cb(new Error('Només es permeten imatges .jpg'));
    }
    cb(null, true);
  }
});

function pujarImatges(req, res, next) {
  uploadImatges.array('imatges')(req, res, err => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

app.post('/api/importar-imatges', pujarImatges, async (req, res) => {
  let connection;

  try {
    const grup = String(req.body.grup || '').trim();

    if (!grup) {
      return res.status(400).json({ error: 'Cal indicar el grup matriculat' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No s’ha rebut cap imatge' });
    }

    const [alumnes] = await pool.execute(
      `SELECT idIeduca
       FROM alumne
       WHERE codiGrupMatriculat = ?
       ORDER BY nom COLLATE utf8mb4_unicode_ci,
                cognom1 COLLATE utf8mb4_unicode_ci,
                cognom2 COLLATE utf8mb4_unicode_ci,
                idIeduca`,
      [grup]
    );

    if (alumnes.length === 0) {
      return res.status(404).json({ error: 'No hi ha cap alumne en aquest grup' });
    }

    const fitxers = [...req.files].sort((a, b) =>
      a.originalname.localeCompare(b.originalname, undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    );

    const total = Math.min(fitxers.length, alumnes.length);

    await fs.mkdir(ALUMNES_DIR, { recursive: true });

    const assignacions = [];
    for (let i = 0; i < total; i++) {
      const idSegur = String(alumnes[i].idIeduca).replace(/[^\w-]/g, '_');
      const nomFitxer = `${idSegur}.jpg`;

      await fs.writeFile(path.join(ALUMNES_DIR, nomFitxer), fitxers[i].buffer);
      assignacions.push([`/uploads/alumnes/${nomFitxer}`, alumnes[i].idIeduca]);
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const [url, idIeduca] of assignacions) {
      await connection.execute(
        'UPDATE alumne SET urlImatge = ? WHERE idIeduca = ?',
        [url, idIeduca]
      );
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Importació completada correctament',
      assignades: total,
      ignorades: fitxers.length - total,
      alumnesSenseFoto: alumnes.length - total
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error('Error important imatges:', error);

    res.status(500).json({
      error: 'No s’han pogut importar les imatges',
      detall: error.sqlMessage || error.message
    });

  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/alumnes/sortides-per-data', async (req, res) => {
  const data = String(req.query.data ?? '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || isNaN(Date.parse(data))) {
    return res.status(400).json({ error: 'La data ha de tenir el format AAAA-MM-DD' });
  }

  try {
    const [sortides] = await pool.execute(
      `SELECT a.idAlumne, a.idIeduca, a.nom, a.cognom1, a.cognom2,
              a.codiGrupMatriculat,
              r.dataEntrada,
              r.dataSortida,
              TIMESTAMPDIFF(MINUTE, r.dataEntrada, r.dataSortida) AS durada,
              r.professor
       FROM registrelavabo r
              JOIN alumne a ON a.idAlumne = r.idAlumne
       WHERE r.dataEntrada >= ?
         AND r.dataEntrada < DATE_ADD(?, INTERVAL 1 DAY)
       ORDER BY r.dataEntrada`,
      [data, data]
    );

    const durades = sortides.map(s => s.durada).filter(d => d !== null);
    const tempsMitja = durades.length
      ? Math.round(durades.reduce((a, b) => a + b, 0) / durades.length)
      : null;

    res.json({ data, sortides, tempsMitja, total: sortides.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


app.get('/api/alumnes/sortides-per-grup', async (req, res) => {
  const grup = String(req.query.grup ?? '').trim();

  if (!grup) {
    return res.status(400).json({ error: 'Cal indicar el codi de grup' });
  }

  try {
    const [existeix] = await pool.execute(
      'SELECT 1 FROM alumne WHERE codiGrupMatriculat = ? LIMIT 1',
      [grup]
    );
    if (existeix.length === 0) {
      return res.status(404).json({ error: 'No existeix cap alumne en aquest grup' });
    }

    const [sortides] = await pool.execute(
      `SELECT a.idAlumne, a.idIeduca, a.nom, a.cognom1, a.cognom2,
              a.codiGrupMatriculat,
              r.dataEntrada,
              r.dataSortida,
              TIMESTAMPDIFF(MINUTE, r.dataEntrada, r.dataSortida) AS durada,
              r.professor
       FROM registrelavabo r
              JOIN alumne a ON a.idAlumne = r.idAlumne
       WHERE a.codiGrupMatriculat = ?
       ORDER BY r.dataEntrada DESC`,
      [grup]
    );

    const durades = sortides.map(s => s.durada).filter(d => d !== null);
    const tempsMitja = durades.length
      ? Math.round(durades.reduce((a, b) => a + b, 0) / durades.length)
      : null;

    res.json({ grup, sortides, tempsMitja, total: sortides.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/api/alumnes/sortides-per-professor', async (req, res) => {
  const professor = String(req.query.professor ?? '').trim();

  if (!professor) {
    return res.status(400).json({ error: 'Cal indicar el nom del professor' });
  }

  // Escapa els comodins de LIKE perquè l'usuari no els pugui injectar
  const patro = `%${professor.replace(/[\\%_]/g, '\\$&')}%`;

  try {
    const [sortides] = await pool.execute(
      `SELECT a.idAlumne, a.idIeduca, a.nom, a.cognom1, a.cognom2,
              a.codiGrupMatriculat,
              r.dataEntrada,
              r.dataSortida,
              TIMESTAMPDIFF(MINUTE, r.dataEntrada, r.dataSortida) AS durada,
              r.professor
       FROM registrelavabo r
              JOIN alumne a ON a.idAlumne = r.idAlumne
       WHERE r.professor LIKE ?
       ORDER BY r.dataEntrada DESC`,
      [patro]
    );

    const durades = sortides.map(s => s.durada).filter(d => d !== null);
    const tempsMitja = durades.length
      ? Math.round(durades.reduce((a, b) => a + b, 0) / durades.length)
      : null;

    res.json({ professor, sortides, tempsMitja, total: sortides.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


app.get('/api/alumnes/sortides-per-interval', async (req, res) => {
  const desde = String(req.query.desde ?? '').trim();
  const fins = String(req.query.fins ?? '').trim();

  const dataValida = s => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00Z`);
    return !isNaN(d) && d.toISOString().slice(0, 10) === s;
  };

  if (!dataValida(desde) || !dataValida(fins)) {
    return res.status(400).json({ error: 'Les dates han de tenir el format AAAA-MM-DD' });
  }

  if (desde > fins) {
    return res.status(400).json({ error: 'La data inicial no pot ser posterior a la final' });
  }

  try {
    const [sortides] = await pool.execute(
      `SELECT a.idAlumne, a.idIeduca, a.nom, a.cognom1, a.cognom2,
              a.codiGrupMatriculat,
              r.dataEntrada,
              r.dataSortida,
              TIMESTAMPDIFF(MINUTE, r.dataEntrada, r.dataSortida) AS durada,
              r.professor
       FROM registrelavabo r
              JOIN alumne a ON a.idAlumne = r.idAlumne
       WHERE r.dataEntrada >= ?
         AND r.dataEntrada < DATE_ADD(?, INTERVAL 1 DAY)
       ORDER BY r.dataEntrada DESC`,
      [desde, fins]
    );

    const durades = sortides.map(s => s.durada).filter(d => d !== null);
    const tempsMitja = durades.length
      ? Math.round(durades.reduce((a, b) => a + b, 0) / durades.length)
      : null;

    res.json({ desde, fins, sortides, tempsMitja, total: sortides.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


// ===== LAVABO =====

// Busca un alumne pel seu idAlumne (per mostrar la foto)
app.get('/api/lavabo/alumne/:idAlumne', async (req, res) => {
  const idAlumne = String(req.params.idAlumne).trim();

  if (!/^\d+$/.test(idAlumne)) {
    return res.status(400).json({ error: 'L’ID alumne ha de ser un número' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT idAlumne, idIeduca, nom, cognom1, cognom2,
              codiGrupMatriculat, urlImatge, conflictiu
       FROM alumne WHERE idAlumne = ?`,
      [idAlumne]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alumne no trobat' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Guarda el registre complet quan l'alumne torna del lavabo
app.post('/api/lavabo/registre', async (req, res) => {
  const { idAlumne, professor, dataEntrada, dataSortida } = req.body;

  const formatDataHora = s => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s);

  if (!/^\d+$/.test(String(idAlumne ?? ''))) {
    return res.status(400).json({ error: 'ID alumne no vàlid' });
  }
  if (!professor || !String(professor).trim()) {
    return res.status(400).json({ error: 'Falta el professor' });
  }
  if (!formatDataHora(dataEntrada) || !formatDataHora(dataSortida)) {
    return res.status(400).json({ error: 'Format de data no vàlid' });
  }

  try {
    // Les dades de l'alumne es llegeixen de la BD, no es fia del client
    const [alumnes] = await pool.execute(
      `SELECT idAlumne, idIeduca, nom, cognom1, cognom2, codiGrupMatriculat
       FROM alumne WHERE idAlumne = ?`,
      [idAlumne]
    );

    if (alumnes.length === 0) {
      return res.status(404).json({ error: 'Alumne no trobat' });
    }
    const a = alumnes[0];

    await pool.execute(
      `INSERT INTO registrelavabo
       (nomalumn, cognomalumn1, cognomalumn2, professor,
        dataEntrada, dataSortida, grupMatriculat, idAlumne, idIeduca)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        a.nom, a.cognom1, a.cognom2, String(professor).trim(),
        dataEntrada, dataSortida, a.codiGrupMatriculat, a.idAlumne, a.idIeduca
      ]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'No s’ha pogut guardar el registre',
      detall: err.sqlMessage || err.message
    });
  }
});


app.listen(3000, () => console.log('Servidor a http://localhost:3000'));
