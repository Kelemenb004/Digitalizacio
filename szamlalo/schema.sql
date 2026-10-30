-- A kelenref-szamlalo D1 adatbázis szerkezete (egyszer kell lefuttatni; 2026-10-30-án létrehozva)
CREATE TABLE IF NOT EXISTS szamlalo (nev TEXT PRIMARY KEY, ertek INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS napi (nap TEXT PRIMARY KEY, ertek INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO szamlalo (nev, ertek) VALUES ('osszes', 0);
