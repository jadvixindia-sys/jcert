# Deploying Jadvix Certificate Portal to AWS EC2 (Elastic IP)

Goal: run the whole app on a single EC2 instance, reachable at **`http://<ELASTIC_IP>`**, to share with the owner. One Nginx reverse proxy fronts both apps (same origin → no CORS headaches, cookie auth just works). MongoDB stays on Atlas.

> The Atlas database already contains the migrated data (20 certificates, etc.),
> so **no re-migration is needed** — just point the server at the same `MONGODB_URI`.

---

## Architecture on the box
```
Internet ──▶ Elastic IP :80 ──▶ Nginx ─┬─ /       ─▶ Next.js (127.0.0.1:3000)
                                        ├─ /api    ─▶ Express (127.0.0.1:8000)
                                        └─ /uploads─▶ Express (127.0.0.1:8000)
                                                          │
                                                          └─▶ MongoDB Atlas
```

---

## Step 1 — Launch the EC2 instance
1. EC2 → **Launch instance**. AMI: **Ubuntu Server 22.04 LTS**. Type: **t3.small** (2 GB RAM min; t2.micro/1 GB is tight for a Next build).
2. Create/choose a key pair (`.pem`).
3. Storage: 20 GB gp3.
4. **Security group** inbound rules:
   | Type  | Port | Source |
   |-------|------|--------|
   | SSH   | 22   | **My IP** (not 0.0.0.0/0) |
   | HTTP  | 80   | 0.0.0.0/0 |
   | HTTPS | 443  | 0.0.0.0/0 (for later SSL) |

   Do **not** open 3000/8000 to the world — they stay internal behind Nginx.

## Step 2 — Allocate & associate an Elastic IP
1. EC2 → **Elastic IPs** → **Allocate**.
2. **Actions → Associate** → select your instance.
3. Note the IP — call it `ELASTIC_IP` below.

## Step 3 — Whitelist the server in MongoDB Atlas
Atlas → **Network Access** → **Add IP Address** → enter `ELASTIC_IP/32`.
(Or `0.0.0.0/0` temporarily to test, then tighten.)

## Step 4 — Connect & install the toolchain
```bash
ssh -i your-key.pem ubuntu@ELASTIC_IP

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx, git, PM2
sudo apt-get install -y nginx git
sudo npm install -g pm2
```

## Step 5 — Get the code onto the server
Either `git clone <your-repo>` **or** copy the two folders up with scp
(exclude `node_modules`, `.next`, `dist`). Example with scp from your PC:
```bash
scp -i your-key.pem -r jadvixCertificate ubuntu@ELASTIC_IP:~/
```
Then on the server: `cd ~/jadvixCertificate`.

## Step 6 — Configure the backend
```bash
cd ~/jadvixCertificate/backend
cp .env.example .env
nano .env
```
Set:
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.evxw0jg.mongodb.net/jadvix_certificate?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<paste a fresh 64-byte hex — see below>
CLIENT_ORIGIN=http://ELASTIC_IP
PUBLIC_API_URL=http://ELASTIC_IP
COOKIE_SECURE=false      # plain HTTP for now; set true after you add SSL
COOKIE_SAMESITE=lax
```
Generate a secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Build:
```bash
npm ci
npm run build
# (data already in Atlas — only run these if starting a fresh DB)
# npm run migrate
# npm run reset-admin
```

## Step 7 — Configure & build the frontend
> `NEXT_PUBLIC_*` values are baked in at **build time**, so set them BEFORE `npm run build`.
> If the Elastic IP ever changes, update these and rebuild.
```bash
cd ~/jadvixCertificate/frontend
cp .env.example .env.local
nano .env.local
```
Set:
```env
NEXT_PUBLIC_API_URL=http://ELASTIC_IP/api
API_INTERNAL_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_SITE_URL=http://ELASTIC_IP
```
Build:
```bash
npm ci
npm run build
```

## Step 8 — Start both apps with PM2
```bash
cd ~/jadvixCertificate
pm2 start ecosystem.config.js
pm2 save
pm2 startup            # run the command it prints, to auto-start on reboot
pm2 status             # both jadvix-api and jadvix-web should be "online"
```

## Step 9 — Configure Nginx
```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/jadvix
sudo ln -s /etc/nginx/sites-available/jadvix /etc/nginx/sites-enabled/jadvix
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Step 10 — Test
- Open **`http://ELASTIC_IP`** → home page.
- Verify a known Order ID, e.g. `http://ELASTIC_IP/verify/JX-W0GY-2K8W`.
- Log in at `http://ELASTIC_IP/admin` with `admin@jadvix.com` / `Jadvix@2026`.
- `curl http://ELASTIC_IP/api/health` → `{"success":true,...}`.

Send the owner: **`http://ELASTIC_IP`**

---

## Updating later
```bash
cd ~/jadvixCertificate
git pull                      # or re-scp
cd backend  && npm ci && npm run build
cd ../frontend && npm ci && npm run build
cd .. && pm2 restart ecosystem.config.js
```

## Recommended next: HTTPS (removes browser "Not secure")
An IP alone can't get a Let's Encrypt certificate — you need a domain
(e.g. `certificate.jadvix.uk`) pointed at the Elastic IP via an A record. Then:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d certificate.jadvix.uk
```
After SSL is live, update: backend `COOKIE_SECURE=true`, `CLIENT_ORIGIN`/`PUBLIC_API_URL`
to `https://…`, and frontend `NEXT_PUBLIC_API_URL=https://certificate.jadvix.uk/api`
+ `NEXT_PUBLIC_SITE_URL=https://certificate.jadvix.uk`, then rebuild the frontend.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Login seems to succeed then bounces back | `COOKIE_SECURE=false` on HTTP; restart api |
| 502 Bad Gateway | `pm2 status` — an app is down; `pm2 logs` |
| Logos don't load | `/uploads/` Nginx block missing, or assets not on server |
| API 500 at boot | Atlas IP not whitelisted, or bad `MONGODB_URI` |
| Verify page can't reach API | `API_INTERNAL_URL` must be `http://127.0.0.1:8000/api` |
