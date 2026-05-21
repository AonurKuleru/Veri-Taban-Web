const express = require('express');
const sql = require('mssql/msnodesqlv8'); // Windows Authentication için güçlendirilmiş sürücü
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Yenilenen ve kilitleri kıran yerel SQL Server bağlantı ayarımız
const dbConfig = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=HastaneDB;Trusted_Connection=yes;'
};

// --- HASTA API ---
app.get('/api/hastalar', async (req, res) => {
    try { let pool = await sql.connect(dbConfig); let r = await pool.request().query("SELECT * FROM Hasta"); res.json(r.recordset); } 
    catch (err) { res.status(500).send(err.message); }
});

app.post('/api/hasta-ekle', async (req, res) => {
    const { tc, ad, dogum, cinsiyet } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request().input('tc', sql.VarChar, tc).input('ad', sql.NVarChar, ad).input('dogum', sql.Date, dogum).input('cinsiyet', sql.NVarChar, cinsiyet)
            .query("INSERT INTO Hasta (TC_Kimlik_No, Ad_Soyad, Dogum_Tarihi, Cinsiyet) VALUES (@tc, @ad, @dogum, @cinsiyet)");
        res.sendStatus(200);
    } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/hasta-sil/:tc', async (req, res) => {
    try { let pool = await sql.connect(dbConfig); await pool.request().input('tc', sql.VarChar, req.params.tc).query("DELETE FROM Hasta WHERE TC_Kimlik_No = @tc"); res.sendStatus(200); } 
    catch (err) { res.status(500).send(err.message); }
});

// --- BÖLÜM API ---
app.get('/api/bolumler', async (req, res) => {
    try { let pool = await sql.connect(dbConfig); let r = await pool.request().query("SELECT * FROM Bölüm"); res.json(r.recordset); } 
    catch (err) { res.status(500).send(err.message); }
});

app.post('/api/bolum-ekle', async (req, res) => {
    const { adi, oda } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request().input('adi', sql.NVarChar, adi).input('oda', sql.VarChar, oda).query("INSERT INTO Bölüm (Bolum_Adi, Oda_Numarasi) VALUES (@adi, @oda)");
        res.sendStatus(200);
    } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/bolum-sil/:id', async (req, res) => {
    try { let pool = await sql.connect(dbConfig); await pool.request().input('id', sql.Int, req.params.id).query("DELETE FROM Bölüm WHERE Bolum_ID = @id"); res.sendStatus(200); } 
    catch (err) { res.status(500).send(err.message); }
});

// --- DOKTOR API ---
app.get('/api/doktorlar', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let r = await pool.request().query("SELECT d.*, b.Bolum_Adi FROM Doktor d LEFT JOIN Bölüm b ON d.Bolum_ID = b.Bolum_ID");
        res.json(r.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/doktorlar-by-bolum/:bolumId', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let r = await pool.request().input('bId', sql.Int, req.params.bolumId).query("SELECT Personel_ID, Ad_Soyad, Unvan FROM Doktor WHERE Bolum_ID = @bId");
        res.json(r.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/doktor-ekle', async (req, res) => {
    const { ad, uzmanlik, unvan, bolumId } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request().input('ad', sql.NVarChar, ad).input('uzman', sql.NVarChar, uzmanlik).input('unvan', sql.NVarChar, unvan).input('bId', sql.Int, bolumId)
            .query("INSERT INTO Doktor (Ad_Soyad, Uzmanlik_Alani, Unvan, Bolum_ID) VALUES (@ad, @uzman, @unvan, @bId)");
        res.sendStatus(200);
    } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/doktor-sil/:id', async (req, res) => {
    try { let pool = await sql.connect(dbConfig); await pool.request().input('id', sql.Int, req.params.id).query("DELETE FROM Doktor WHERE Personel_ID = @id"); res.sendStatus(200); } 
    catch (err) { res.status(500).send(err.message); }
});

// --- RANDEVU API ---
app.post('/api/randevu-ekle', async (req, res) => {
    const { hastaTc, doktorId, tarih } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request().input('tc', sql.VarChar, hastaTc).input('dId', sql.Int, doktorId).input('tarih', sql.DateTime, tarih)
            .query("INSERT INTO Randevu (TC_Kimlik_No, Personel_ID, Tarih_Saat) VALUES (@tc, @dId, @tarih)");
        res.sendStatus(200);
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(3000, () => console.log('Sistem 3000 portunda eksiksiz çalışıyor!'));