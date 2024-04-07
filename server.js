const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'hospital'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create a new patient
app.post('/addPatient', (req, res) => {
  const { pid, pname, age, gender, address, docid, roomid } = req.body;
  const sql = `INSERT INTO patients (pid, pname, age, gender, address, docid, roomid) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [pid, pname, age, gender, address, docid, roomid], (err, result) => {
    if (err) {
      console.error('Error adding patient:', err);
      res.status(500).send('Error adding patient');
    } else {
      console.log('Patient added:', result);
      res.redirect('/');
    }
  });
});

// Update an existing patient
app.post('/updatePatient', (req, res) => {
  const { updatePid, updatePname, updateAge, updateGender, updateAddress, updateDocid, updateRoomid } = req.body;
  const sql = `UPDATE patients SET pname = ?, age = ?, gender = ?, address = ?, docid = ?, roomid = ? WHERE pid = ?`;
  db.query(sql, [updatePname, updateAge, updateGender, updateAddress, updateDocid, updateRoomid, updatePid], (err, result) => {
    if (err) {
      console.error('Error updating patient:', err);
      res.status(500).send('Error updating patient');
    } else {
      console.log('Patient updated:', result);
      if (result.affectedRows === 0) {
        res.status(404).send('Patient ID not found'); // Patient ID not found
      } else {
        res.redirect('/');
      }
    }
  });
});

// Read operation to display patient table
app.get('/displayTable', (req, res) => {
  db.query('SELECT * FROM patients', (err, result) => {
    if (err) {
      console.error('Error fetching patients:', err);
      res.status(500).send('Error fetching patients');
    } else {
      console.log('Patients fetched:', result);
      res.send(result);
    }
  });
});

// Fetch a single patient by ID
app.get('/getPatient/:pid', (req, res) => {
  const pid = req.params.pid;
  const sql = `SELECT * FROM patients WHERE pid = ?`;
  db.query(sql, [pid], (err, result) => {
    if (err) {
      console.error('Error fetching patient:', err);
      res.status(500).send('Error fetching patient');
    } else {
      console.log('Patient fetched:', result);
      res.json(result[0]);
    }
  });
});

// Delete operation to remove a patient
app.delete('/deletePatient/:pid', (req, res) => {
  const pid = req.params.pid;
  const sql = `DELETE FROM patients WHERE pid = ?`;
  db.query(sql, [pid], (err, result) => {
    if (err) {
      console.error('Error deleting patient:', err);
      res.status(500).send('Error deleting patient');
    } else {
      console.log('Patient deleted:', result);
      res.json({ message: 'Patient deleted successfully' });
    }
  });
});

// Other CRUD operations...

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
