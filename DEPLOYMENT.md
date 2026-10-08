# Deployment Guide

## Schritt-für-Schritt lokales Setup testen

### 1. Alle Dependencies installieren
```bash
npm install
```

### 2. Docker starten (PostgreSQL)
```bash
docker-compose up -d
```

### 3. .env.local erstellen
```bash
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://ds_user:ds_password_change_me@localhost:5432/ds_akquise?schema=public"
JWT_SECRET="dev-secret-key-at-least-32-chars-long-here"
NODE_ENV="development"
EOF
```

### 4. Datenbank migrieren
```bash
npx prisma migrate dev --name init
```

### 5. Dev Server starten
```bash
npm run dev
```

Öffne http://localhost:3001

---

## Production Deployment auf DigitalOcean / Hetzner

### Voraussetzungen
- VPS mit mindestens 2GB RAM
- Docker & Docker Compose installiert
- Domain (optional, für HTTPS)
- SSH-Zugriff zum Server

### 1. Repository auf Server klonen

```bash
ssh root@your-server-ip
cd /opt
git clone https://github.com/yourusername/ds-akquise.git
cd ds-akquise
```

### 2. Production-Secrets generieren

```bash
# Sichere Passwörter generieren
DB_PASSWORD=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -base64 32)

echo "DB_PASSWORD: $DB_PASSWORD"
echo "JWT_SECRET: $JWT_SECRET"
```

Speichere diese Werte sicher (z.B. in Bitwarden, 1Password).

### 3. .env.production erstellen

```bash
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://ds_user:YOUR_SECURE_PASSWORD@postgres:5432/ds_akquise?schema=public"
JWT_SECRET="YOUR_JWT_SECRET"
NODE_ENV="production"
EOF
```

### 4. Production starten

```bash
docker-compose -f docker-compose.prod.yml up -d

# Überprüfe Logs
docker-compose -f docker-compose.prod.yml logs -f app

# Migrations ausführen
docker exec ds-akquise-app-prod npx prisma migrate deploy
```

### 5. Nginx Reverse Proxy (empfohlen)

```bash
# Nginx installieren
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx -y

# Config erstellen
sudo nano /etc/nginx/sites-available/akquise
```

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Config aktivieren
sudo ln -s /etc/nginx/sites-available/akquise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# HTTPS mit Let's Encrypt
sudo certbot --nginx -d akquise.yourdomain.com
```

### 6. Systemd Service für Auto-Start

```bash
sudo cat > /etc/systemd/system/ds-akquise.service << 'EOF'
[Unit]
Description=DS Akquise Docker Compose
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/ds-akquise
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ds-akquise
sudo systemctl start ds-akquise
```

---

## Updates durchführen

```bash
# Code updaten
cd /opt/ds-akquise
git pull origin main

# Docker Images neu bauen
docker-compose -f docker-compose.prod.yml build --no-cache

# Container neu starten
docker-compose -f docker-compose.prod.yml up -d

# Migrations ausführen (falls nötig)
docker exec ds-akquise-app-prod npx prisma migrate deploy
```

---

## Monitoring & Logs

```bash
# App Logs
docker-compose -f docker-compose.prod.yml logs -f app

# Datenbank Logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Health Status
docker-compose -f docker-compose.prod.yml ps

# Restart nach Fehler
docker-compose -f docker-compose.prod.yml restart app
```

---

## Backup Strategie

### Automatische tägliche Backups

```bash
cat > /opt/ds-akquise/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/ds-akquise"
mkdir -p $BACKUP_DIR
docker exec ds-akquise-db-prod pg_dump -U ds_user ds_akquise | gzip > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz

# Behalte nur letzte 30 Tage
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /opt/ds-akquise/backup.sh

# Zu Cron hinzufügen
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/ds-akquise/backup.sh") | crontab -
```

### Backup herunterladen

```bash
scp root@your-server-ip:/backups/ds-akquise/db_*.sql.gz ./backups/
```

---

## Security Checklist

- [ ] JWT_SECRET ist starkes 32+ Zeichen-Passwort
- [ ] DB_PASSWORD ist sichere Zeichenkette
- [ ] HTTPS mit Let's Encrypt aktiviert
- [ ] UFW Firewall nur notwendige Ports offen (80, 443)
- [ ] SSH key-based auth (kein Password-Login)
- [ ] Regelmäßige Backups eingerichtet
- [ ] Fail2ban für Brute-Force Protection
- [ ] .env Datei nicht im Git-Repo

---

## Troubleshooting Production

### App startet nicht?
```bash
docker-compose -f docker-compose.prod.yml logs app
# Suche nach Fehler, meist DATABASE_URL oder JWT_SECRET
```

### Datenbank-Verbindungsfehler?
```bash
docker exec ds-akquise-db-prod psql -U ds_user -d ds_akquise -c "SELECT 1;"
```

### Port 3000 wird nicht gebunden?
```bash
# Container neu starten
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### SSL-Zertifikat erneuern
```bash
sudo certbot renew --quiet  # wird täglich über Cron aufgerufen
```

---

## Nächste Schritte

1. Alle API-Routes implementieren (siehe API_ROUTES.md)
2. Frontend an neue API anpassen
3. E-Mail-Benachrichtigungen (optional)
4. SMS-Reminder (optional)
5. Mobile App (optional)
