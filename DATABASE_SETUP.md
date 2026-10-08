# Database Setup Guide

Diese Anleitung erklärt, wie du die PostgreSQL-Datenbank lokal oder auf einem Server verwendest.

## Lokale Entwicklung

### 1. Docker starten

```bash
docker-compose up -d
```

Das startet:
- **PostgreSQL** auf `localhost:5432`
- **Adminer** (DB-UI) auf `http://localhost:8080`

### 2. .env.local erstellen

```bash
cp .env.example .env.local
```

Bearbeite `.env.local`:
```
DATABASE_URL="postgresql://ds_user:ds_password_change_me@localhost:5432/ds_akquise?schema=public"
JWT_SECRET="dev-secret-key-change-in-production-at-least-32-chars"
NODE_ENV="development"
```

### 3. Dependencies installieren & Prisma initialisieren

```bash
npm install
npx prisma migrate dev --name init
```

Das erstellt die Datenbank-Tabellen.

### 4. Dev Server starten

```bash
npm run dev
```

Öffne http://localhost:3001 und registriere dich.

### 5. Adminer (optionale DB-UI)

http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: ds_user
- Password: ds_password_change_me
- Database: ds_akquise

---

## Production auf VPS / Docker

### 1. Server vorbereiten

```bash
# SSH auf deinen Server
ssh user@your-server.com

# Docker installieren (falls noch nicht vorhanden)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Repository klonen
git clone https://github.com/yourusername/ds-akquise.git
cd ds-akquise
```

### 2. .env.production erstellen

```bash
nano .env.production
```

```
DATABASE_URL="postgresql://SECURE_USER:SECURE_PASSWORD@postgres:5432/ds_akquise?schema=public"
JWT_SECRET="$(openssl rand -base64 32)"
NODE_ENV="production"
```

**Wichtig:** 
- `SECURE_PASSWORD` sollte ein starkes Passwort sein
- `JWT_SECRET` über `openssl rand -base64 32` generieren

### 3. Docker Compose für Production

```bash
# Mit environment variables
DB_USER="secure_db_user" \
DB_PASSWORD="$(openssl rand -base64 16)" \
JWT_SECRET="$(openssl rand -base64 32)" \
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Datenbank initialisieren

```bash
# In den Container gehen
docker exec -it ds-akquise-app-prod bash

# Migrations ausführen
npx prisma migrate deploy

# Oder für Production (falls noch keine Migration):
npx prisma migrate dev --name init
```

### 5. Nginx Reverse Proxy (optional, empfohlen)

```nginx
server {
    listen 80;
    server_name akquise.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Dann HTTPS mit Let's Encrypt:
```bash
sudo certbot --nginx -d akquise.yourdomain.com
```

---

## Datenbank Backup

### Automatische tägliche Backups

```bash
# Backup Script erstellen
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
mkdir -p $BACKUP_DIR
docker exec ds-akquise-db-prod pg_dump -U ds_user ds_akquise | gzip > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz
# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Zu Cron hinzufügen (täglich um 2:00 Uhr)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

### Restore aus Backup

```bash
docker exec -i ds-akquise-db-prod psql -U ds_user ds_akquise < db_backup.sql
```

---

## Troubleshooting

### Port bereits in Gebrauch?

```bash
# Finde Prozess auf Port 5432
lsof -i :5432
# oder
netstat -tulpn | grep 5432

# Container neu starten
docker-compose restart postgres
```

### Datenbank Connection Error?

```bash
# Container Logs anschauen
docker logs ds-akquise-db

# Health Status prüfen
docker ps | grep ds-akquise
```

### Migrations sind fehlgeschlagen?

```bash
# Neue Migration erstellen
npx prisma migrate dev --name fix_name

# Oder auf Production:
npx prisma migrate reset
npx prisma migrate deploy
```

---

## Environment Variables

| Variable | Beschreibung | Beispiel |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pwd@host:5432/dbname` |
| `JWT_SECRET` | Token-Signierung (mind. 32 chars) | `openssl rand -base64 32` |
| `NODE_ENV` | Environment | `production` oder `development` |

---

## Nächste Schritte

1. API-Routes für Customers, Projects, etc. erstellen
2. Frontend an neue API anpassen
3. Tests schreiben
4. CI/CD Pipeline (GitHub Actions) einrichten
