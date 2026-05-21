const API_URL = 'http://localhost:3000/api';

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    if(tabName === 'doktor') { updateBolumDropdowns(); getDoktorlar(); }
    if(tabName === 'bolum') { getBolumler(); }
    if(tabName === 'randevu') { updateRandevuDropdowns(); }
    if(tabName === 'hasta') { getHastalar(); }
}

// ================= HASTA İŞLEMLERİ =================
async function getHastalar() {
    const res = await fetch(`${API_URL}/hastalar`);
    const data = await res.json();
    const tbody = document.querySelector('#hastaTablosu tbody');
    tbody.innerHTML = '';
    data.forEach(h => {
        tbody.innerHTML += `<tr>
            <td>${h.TC_Kimlik_No}</td>
            <td>${h.Ad_Soyad}</td>
            <td>${new Date(h.Dogum_Tarihi).toLocaleDateString('tr-TR')}</td>
            <td>${h.Cinsiyet}</td>
            <td><button class="btn btn-red" onclick="deleteHasta('${h.TC_Kimlik_No}')">Sil</button></td>
        </tr>`;
    });
}

document.getElementById('hastaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        tc: document.getElementById('tcNo').value,
        ad: document.getElementById('adSoyad').value,
        dogum: document.getElementById('dogumTarihi').value,
        cinsiyet: document.getElementById('cinsiyet').value
    };
    const res = await fetch(`${API_URL}/hasta-ekle`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
    if(res.ok) { alert('Hasta eklendi!'); document.getElementById('hastaForm').reset(); getHastalar(); }
});

async function deleteHasta(tc) {
    if(confirm('Silmek istediğinize emin misiniz?')) {
        await fetch(`${API_URL}/hasta-sil/${tc}`, { method: 'DELETE' });
        getHastalar();
    }
}

// ================= BÖLÜM İŞLEMLERİ =================
async function getBolumler() {
    const res = await fetch(`${API_URL}/bolumler`);
    const data = await res.json();
    const tbody = document.querySelector('#bolumTablosu tbody');
    tbody.innerHTML = '';
    data.forEach(b => {
        tbody.innerHTML += `<tr>
            <td>${b.Bolum_ID}</td>
            <td>${b.Bolum_Adi}</td>
            <td>${b.Oda_Numarasi}</td>
            <td><button class="btn btn-red" onclick="deleteBolum(${b.Bolum_ID})">Sil</button></td>
        </tr>`;
    });
}

document.getElementById('bolumForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = { adi: document.getElementById('bolumAdi').value, oda: document.getElementById('odaNo').value };
    const res = await fetch(`${API_URL}/bolum-ekle`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
    if(res.ok) { alert('Bölüm eklendi!'); document.getElementById('bolumForm').reset(); getBolumler(); }
});

async function deleteBolum(id) {
    if(confirm('Bölümü silmek istiyor musunuz?')) {
        await fetch(`${API_URL}/bolum-sil/${id}`, { method: 'DELETE' });
        getBolumler();
    }
}

async function updateBolumDropdowns() {
    const res = await fetch(`${API_URL}/bolumler`);
    const data = await res.json();
    const select = document.getElementById('docBolumSelect');
    select.innerHTML = '<option value="">Bölüm Seçiniz...</option>';
    data.forEach(b => { select.innerHTML += `<option value="${b.Bolum_ID}">${b.Bolum_Adi}</option>`; });
}

// ================= DOKTOR İŞLEMLERİ =================
async function getDoktorlar() {
    const res = await fetch(`${API_URL}/doktorlar`);
    const data = await res.json();
    const tbody = document.querySelector('#doktorTablosu tbody');
    tbody.innerHTML = '';
    data.forEach(d => {
        tbody.innerHTML += `<tr>
            <td>${d.Personel_ID}</td>
            <td>${d.Ad_Soyad}</td>
            <td>${d.Uzmanlik_Alani}</td>
            <td>${d.Unvan}</td>
            <td>${d.Bolum_Adi || 'Atanmamış'}</td>
            <td><button class="btn btn-red" onclick="deleteDoktor(${d.Personel_ID})">Sil</button></td>
        </tr>`;
    });
}

document.getElementById('doktorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        ad: document.getElementById('docAdSoyad').value,
        uzmanlik: document.getElementById('docUzmanlik').value,
        unvan: document.getElementById('docUnvan').value,
        bolumId: document.getElementById('docBolumSelect').value
    };
    const res = await fetch(`${API_URL}/doktor-ekle`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
    if(res.ok) { alert('Doktor eklendi!'); document.getElementById('doktorForm').reset(); getDoktorlar(); }
});

async function deleteDoktor(id) {
    if(confirm('Doktoru silmek istiyor musunuz?')) {
        await fetch(`${API_URL}/doktor-sil/${id}`, { method: 'DELETE' });
        getDoktorlar();
    }
}

// ================= RANDEVU İŞLEMLERİ =================
async function updateRandevuDropdowns() {
    // Hastaları doldur
    const resH = await fetch(`${API_URL}/hastalar`);
    const hastalar = await resH.json();
    const selectH = document.getElementById('randevuHasta');
    selectH.innerHTML = '<option value="">Hasta Seçiniz...</option>';
    hastalar.forEach(h => { selectH.innerHTML += `<option value="${h.TC_Kimlik_No}">${h.Ad_Soyad}</option>`; });

    // Bölümleri doldur
    const resB = await fetch(`${API_URL}/bolumler`);
    const bolumler = await resB.json();
    const selectB = document.getElementById('randevuBolum');
    selectB.innerHTML = '<option value="">Bölüm Seçiniz...</option>';
    bolumler.forEach(b => { selectB.innerHTML += `<option value="${b.Bolum_ID}">${b.Bolum_Adi}</option>`; });
}

async function filterDoktorByBolum() {
    const bolumId = document.getElementById('randevuBolum').value;
    const selectD = document.getElementById('randevuDoktor');
    if(!bolumId) { selectD.innerHTML = '<option value="">Önce Bölüm Seçin...</option>'; return; }

    const res = await fetch(`${API_URL}/doktorlar-by-bolum/${bolumId}`);
    const doktorlar = await res.json();
    selectD.innerHTML = '<option value="">Doktor Seçiniz...</option>';
    doktorlar.forEach(d => { selectD.innerHTML += `<option value="${d.Personel_ID}">${d.Unvan} ${d.Ad_Soyad}</option>`; });
}

document.getElementById('randevuForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        hastaTc: document.getElementById('randevuHasta').value,
        doktorId: document.getElementById('randevuDoktor').value,
        tarih: document.getElementById('randevuTarih').value
    };
    const res = await fetch(`${API_URL}/randevu-ekle`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
    if(res.ok) { alert('Randevu oluşturuldu!'); document.getElementById('randevuForm').reset(); }
});

// İlk açılış
getHastalar();