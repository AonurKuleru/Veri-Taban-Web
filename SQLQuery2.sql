-- 1. Veritabanını sıfırdan tertemiz oluşturuyoruz
CREATE DATABASE HastaneDB;
GO

-- 2. Az önce oluşturduğumuz veritabanının içine giriyoruz
USE HastaneDB;
GO

-- 3. BÖLÜM TABLOSU
CREATE TABLE Bölüm (
    Bolum_ID INT IDENTITY(1,1) PRIMARY KEY,
    Bolum_Adi NVARCHAR(100) NOT NULL,
    Oda_Numarasi VARCHAR(50) NOT NULL
);

-- 4. HASTA TABLOSU
CREATE TABLE Hasta (
    TC_Kimlik_No VARCHAR(11) PRIMARY KEY,
    Ad_Soyad NVARCHAR(100) NOT NULL,
    Dogum_Tarihi DATE NOT NULL,
    Cinsiyet NVARCHAR(10) NOT NULL
);

-- 5. DOKTOR TABLOSU
CREATE TABLE Doktor (
    Personel_ID INT IDENTITY(1,1) PRIMARY KEY,
    Ad_Soyad NVARCHAR(100) NOT NULL,
    Uzmanlik_Alani NVARCHAR(100) NOT NULL,
    Unvan NVARCHAR(50) NOT NULL,
    Bolum_ID INT,
    FOREIGN KEY (Bolum_ID) REFERENCES Bölüm(Bolum_ID) ON DELETE SET NULL
);

-- 6. RANDEVU TABLOSU
CREATE TABLE Randevu (
    Randevu_ID INT IDENTITY(1,1) PRIMARY KEY,
    TC_Kimlik_No VARCHAR(11),
    Personel_ID INT,
    Tarih_Saat DATETIME NOT NULL,
    FOREIGN KEY (TC_Kimlik_No) REFERENCES Hasta(TC_Kimlik_No) ON DELETE CASCADE,
    FOREIGN KEY (Personel_ID) REFERENCES Doktor(Personel_ID) ON DELETE CASCADE
);
