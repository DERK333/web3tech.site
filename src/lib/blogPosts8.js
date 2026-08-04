export const BLOG_POSTS_8 = [
  {
    id: "host-website-app-ubuntu-2504-linux-server-guide",
    slug: "host-website-app-ubuntu-2504-linux-server-guide",
    title: "How to Host a Website and Web App on Ubuntu 25.04 — Complete Server Setup Guide",
    excerpt: "A complete, beginner-to-intermediate guide to setting up a Linux server on Ubuntu 25.04, hosting a static website with Nginx, and deploying a Node.js or Python web application — from a fresh VPS to a live domain with HTTPS.",
    date: "2026-06-06",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Ubuntu", "Linux", "Nginx", "VPS", "Hosting", "Node.js", "Python", "SSL", "HTTPS", "Server", "Web Development", "Deployment"],
    readTime: "20 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
    content: `## How to Host a Website and Web App on Ubuntu 25.04

Whether you're a developer launching your first project, a sysadmin setting up infrastructure, or a tech enthusiast wanting full control over your hosting — this guide walks you through the entire process from a blank Ubuntu 25.04 server to a live website and web application with a real domain and HTTPS.

No prior Linux server experience is required, but familiarity with the command line will help. Every command is explained so you understand *what* it does, not just *how* to run it.

---

## What We'll Cover

1. Choosing and accessing a VPS (Virtual Private Server)
2. Initial server setup and security hardening
3. Installing Nginx as a web server
4. Hosting a static website
5. Setting up a domain and HTTPS with Let's Encrypt
6. Deploying a Node.js web application
7. Deploying a Python (Flask/Django) web application
8. Using PM2 to keep your app running
9. Setting up a firewall

---

## Part 1 — Getting a Server

### What Is a VPS?

A VPS is a virtual machine you rent from a provider. It runs Linux 24/7 in a data center and is accessible over the internet via SSH. Popular providers include:

- **DigitalOcean** — beginner-friendly, $6/month for a basic droplet
- **Vultr** — competitive pricing, good global locations
- **Linode (Akamai)** — solid performance, $5/month entry
- **Hetzner** — excellent value, especially in Europe
- **AWS EC2 / Google Cloud / Azure** — enterprise-grade, more complex

For this guide, any provider works. Create an account, spin up a new server (often called a "droplet", "instance", or "VPS"), and select:

- **OS:** Ubuntu 25.04 (Noble Numbat)
- **Plan:** At least 1 vCPU, 1 GB RAM (2 GB recommended for apps)
- **Region:** Closest to your users

After creation, you'll receive an IP address (e.g., 203.0.113.42) and either a root password or an SSH key option.

---

## Part 2 — Connecting to Your Server

### SSH Into Your Server

From your local machine (Mac/Linux terminal, or Windows with PuTTY/Windows Terminal):

\`\`\`bash
ssh root@203.0.113.42
\`\`\`

Replace 203.0.113.42 with your server's actual IP address. If you set up an SSH key during provisioning, you'll connect automatically. Otherwise, enter the root password when prompted.

You should now see a terminal prompt like:

\`\`\`
root@ubuntu-server:~#
\`\`\`

You're inside your server.

---

## Part 3 — Initial Server Setup

Before installing anything, get the server in a clean, secure state.

### Step 1 — Update the System

Ubuntu ships with some packages already outdated. Always update before doing anything else:

\`\`\`bash
apt update && apt upgrade -y
\`\`\`

- **apt update** — refreshes the list of available packages
- **apt upgrade -y** — upgrades all installed packages to their latest versions
- **-y** — automatically says "yes" to prompts

### Step 2 — Create a Non-Root User

Running everything as **root** is dangerous. If you make a mistake or get hacked, the attacker has full control. Create a regular user and give it **sudo** (admin) privileges:

\`\`\`bash
adduser deploy
\`\`\`

You'll be prompted to set a password and fill in some optional details (just press Enter to skip them).

Now give this user sudo access:

\`\`\`bash
usermod -aG sudo deploy
\`\`\`

This adds **deploy** to the **sudo** group — meaning they can run admin commands by prefixing them with sudo.

### Step 3 — Set Up SSH Key Authentication for the New User

Copy the authorized SSH keys from root to the new user so you can log in without a password:

\`\`\`bash
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
\`\`\`

Now test the new user in a **new terminal window** (don't close your current session yet):

\`\`\`bash
ssh deploy@203.0.113.42
\`\`\`

If it connects, you're good. From now on, use this user — not root.

### Step 4 — Disable Root SSH Login

Open the SSH configuration file:

\`\`\`bash
sudo nano /etc/ssh/sshd_config
\`\`\`

Find the line **PermitRootLogin yes** and change it to:

\`\`\`
PermitRootLogin no
\`\`\`

Also ensure password authentication is disabled (if you're using SSH keys):

\`\`\`
PasswordAuthentication no
\`\`\`

Save the file (Ctrl+O, Enter, Ctrl+X in nano), then reload SSH:

\`\`\`bash
sudo systemctl reload sshd
\`\`\`

---

## Part 4 — Set Up the Firewall

Ubuntu 25.04 comes with UFW (Uncomplicated Firewall). Let's enable it and only allow the ports we need:

\`\`\`bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
\`\`\`

- **OpenSSH** — allows your SSH connection (port 22)
- **80/tcp** — HTTP traffic (regular web)
- **443/tcp** — HTTPS traffic (secure web)

Check the status:

\`\`\`bash
sudo ufw status
\`\`\`

---

## Part 5 — Install Nginx

**Nginx** (pronounced "engine-x") is a high-performance web server. It serves your website files to visitors and can also act as a **reverse proxy** — forwarding requests to your backend application.

### Install Nginx

\`\`\`bash
sudo apt install nginx -y
\`\`\`

### Start and Enable Nginx

\`\`\`bash
sudo systemctl start nginx
sudo systemctl enable nginx
\`\`\`

- **start** — starts Nginx right now
- **enable** — makes Nginx start automatically when the server reboots

### Test It

Open a browser and go to http://203.0.113.42 (your server IP). You should see the **"Welcome to nginx!"** default page. If you do, Nginx is working.

---

## Part 6 — Host a Static Website

A **static website** is one made of plain HTML, CSS, and JavaScript files — no server-side processing needed. This includes portfolios, landing pages, documentation sites, and more.

### Step 1 — Create Your Site Directory

\`\`\`bash
sudo mkdir -p /var/www/mysite.com/html
sudo chown -R deploy:deploy /var/www/mysite.com
\`\`\`

- **/var/www/** — standard location for website files on Linux
- **chown** — changes the owner so your user (not root) can edit files

### Step 2 — Add Your Website Files

Create a simple test page:

\`\`\`bash
nano /var/www/mysite.com/html/index.html
\`\`\`

Paste this basic HTML:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Site</title>
</head>
<body>
  <h1>Hello from my Ubuntu 25.04 server!</h1>
  <p>My website is live.</p>
</body>
</html>
\`\`\`

Save and exit (Ctrl+O, Enter, Ctrl+X).

### Step 3 — Create an Nginx Server Block

A **server block** (equivalent to Apache's "virtual host") tells Nginx which files to serve for which domain.

\`\`\`bash
sudo nano /etc/nginx/sites-available/mysite.com
\`\`\`

Paste the following:

\`\`\`nginx
server {
    listen 80;
    listen [::]:80;

    server_name mysite.com www.mysite.com;
    root /var/www/mysite.com/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
\`\`\`

**What this means:**
- **listen 80** — listen for HTTP traffic on port 80
- **server_name** — which domain name this block handles
- **root** — where the website files are located
- **try_files** — try to serve the requested file; return 404 if not found

### Step 4 — Enable the Site

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/mysite.com /etc/nginx/sites-enabled/
\`\`\`

This creates a symbolic link (shortcut) from sites-available to sites-enabled. Nginx only serves sites in sites-enabled.

### Step 5 — Test and Reload Nginx

\`\`\`bash
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

- **nginx -t** — tests your configuration for syntax errors before applying it
- Always test before reloading to avoid breaking a live server

---

## Part 7 — Point Your Domain to the Server

### Update DNS Records

Log in to wherever you bought your domain (Namecheap, GoDaddy, Cloudflare, etc.) and update the DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 203.0.113.42 |
| A | www | 203.0.113.42 |

- The **@** symbol represents the root domain (mysite.com)
- **www** handles www.mysite.com

DNS changes can take anywhere from a few minutes to 48 hours to propagate globally. You can check propagation at [dnschecker.org](https://dnschecker.org).

---

## Part 8 — Enable HTTPS with Let's Encrypt (Free SSL)

HTTPS encrypts the connection between your visitor and your server. Without it, browsers show a "Not Secure" warning. **Let's Encrypt** provides free, auto-renewing SSL certificates.

### Install Certbot

\`\`\`bash
sudo apt install certbot python3-certbot-nginx -y
\`\`\`

### Obtain a Certificate

\`\`\`bash
sudo certbot --nginx -d mysite.com -d www.mysite.com
\`\`\`

Certbot will:
1. Verify you own the domain (via HTTP challenge)
2. Download and install the certificate
3. Automatically modify your Nginx config to enable HTTPS
4. Set up automatic renewal

Follow the prompts — enter your email for renewal notifications and agree to the terms.

### Test Auto-Renewal

\`\`\`bash
sudo certbot renew --dry-run
\`\`\`

This simulates a renewal without actually doing it, confirming the renewal process will work when the certificate expires in 90 days.

Your site is now live at https://mysite.com with a green padlock.

---

## Part 9 — Deploy a Node.js Web Application

Now let's go beyond static files and host a real web application. We'll deploy a Node.js app and use Nginx as a reverse proxy in front of it.

### Step 1 — Install Node.js

The recommended way to install a modern Node.js version is via NodeSource:

\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install nodejs -y
\`\`\`

Verify:

\`\`\`bash
node --version
npm --version
\`\`\`

### Step 2 — Upload or Clone Your App

If you have a Git repository:

\`\`\`bash
cd /home/deploy
git clone https://github.com/yourusername/your-app.git
cd your-app
\`\`\`

Or create a simple test app:

\`\`\`bash
mkdir /home/deploy/myapp && cd /home/deploy/myapp
nano app.js
\`\`\`

Paste this minimal Node.js HTTP server:

\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from my Node.js app!\\n');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('App running on port 3000');
});
\`\`\`

### Step 3 — Install Dependencies

If your app has a package.json:

\`\`\`bash
npm install
\`\`\`

### Step 4 — Install PM2 (Process Manager)

If you run **node app.js** directly in the terminal and close your SSH session, the app stops. **PM2** is a process manager that keeps your app running in the background, restarts it if it crashes, and starts it on server reboot.

\`\`\`bash
sudo npm install -g pm2
\`\`\`

Start your app with PM2:

\`\`\`bash
pm2 start app.js --name "myapp"
\`\`\`

Make PM2 start on boot:

\`\`\`bash
pm2 startup
\`\`\`

PM2 will output a command — copy and run it. Then save the current process list:

\`\`\`bash
pm2 save
\`\`\`

Useful PM2 commands:

\`\`\`bash
pm2 list           # See all running apps
pm2 logs myapp     # View app logs
pm2 restart myapp  # Restart the app
pm2 stop myapp     # Stop the app
pm2 delete myapp   # Remove it from PM2
\`\`\`

### Step 5 — Configure Nginx as a Reverse Proxy

Your Node.js app runs on port 3000 internally. Nginx will accept requests on port 80/443 and forward them to your app.

\`\`\`bash
sudo nano /etc/nginx/sites-available/myapp.com
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name myapp.com www.myapp.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

**What the proxy headers do:**
- **proxy_pass** — forwards requests to your app running on port 3000
- **X-Real-IP** — passes the visitor's real IP address to your app
- **Upgrade / Connection** — required for WebSocket support

Enable the site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/myapp.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

Then get your SSL certificate:

\`\`\`bash
sudo certbot --nginx -d myapp.com -d www.myapp.com
\`\`\`

Your Node.js app is now live at https://myapp.com.

---

## Part 10 — Deploy a Python Web Application (Flask or Django)

Python apps work similarly — they run on a port and Nginx proxies to them. We'll use **Gunicorn** as the Python WSGI server (the equivalent of PM2 for Python apps).

### Step 1 — Install Python and pip

Ubuntu 25.04 comes with Python 3.13. Verify:

\`\`\`bash
python3 --version
pip3 --version
\`\`\`

If pip isn't installed:

\`\`\`bash
sudo apt install python3-pip python3-venv -y
\`\`\`

### Step 2 — Set Up Your App

Clone or create your app:

\`\`\`bash
mkdir /home/deploy/myflaskapp && cd /home/deploy/myflaskapp
\`\`\`

Create a virtual environment (isolates your project's dependencies from the system):

\`\`\`bash
python3 -m venv venv
source venv/bin/activate
\`\`\`

Your prompt will change to show **(venv)** — you're now inside the virtual environment.

Install Flask and Gunicorn:

\`\`\`bash
pip install flask gunicorn
\`\`\`

Create a simple Flask app:

\`\`\`bash
nano app.py
\`\`\`

\`\`\`python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello from my Flask app!'

if __name__ == '__main__':
    app.run()
\`\`\`

Test it locally:

\`\`\`bash
python app.py
\`\`\`

Press Ctrl+C to stop it.

### Step 3 — Run with Gunicorn

Gunicorn is a production-ready Python WSGI server — more robust than Flask's built-in development server.

\`\`\`bash
gunicorn --workers 3 --bind 127.0.0.1:5000 app:app
\`\`\`

- **--workers 3** — 3 parallel worker processes (rule of thumb: 2 x CPU cores + 1)
- **--bind 127.0.0.1:5000** — listen on localhost port 5000
- **app:app** — the file app.py, the object app inside it

Press Ctrl+C to stop for now.

### Step 4 — Create a Systemd Service (Auto-start)

Instead of PM2, Python apps typically use **systemd** to stay running:

\`\`\`bash
sudo nano /etc/systemd/system/myflaskapp.service
\`\`\`

\`\`\`ini
[Unit]
Description=Gunicorn instance to serve myflaskapp
After=network.target

[Service]
User=deploy
Group=www-data
WorkingDirectory=/home/deploy/myflaskapp
Environment="PATH=/home/deploy/myflaskapp/venv/bin"
ExecStart=/home/deploy/myflaskapp/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 app:app

[Install]
WantedBy=multi-user.target
\`\`\`

Enable and start the service:

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl start myflaskapp
sudo systemctl enable myflaskapp
\`\`\`

Check it's running:

\`\`\`bash
sudo systemctl status myflaskapp
\`\`\`

### Step 5 — Nginx Reverse Proxy for Python App

\`\`\`bash
sudo nano /etc/nginx/sites-available/myflaskapp.com
\`\`\`

\`\`\`nginx
server {
    listen 80;
    server_name myflaskapp.com www.myflaskapp.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
\`\`\`

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/myflaskapp.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d myflaskapp.com -d www.myflaskapp.com
\`\`\`

Your Flask app is now live at https://myflaskapp.com.

---

## Part 11 — Hosting Multiple Sites on One Server

You can host as many websites and apps as you want on one server — each gets its own Nginx server block and its own domain.

The pattern is always the same:
1. Create a site config in /etc/nginx/sites-available/
2. Enable it with a symlink to /etc/nginx/sites-enabled/
3. Run your app on a unique port (3000, 3001, 5000, 5001, etc.)
4. Point the domain to your server IP via DNS
5. Get an SSL certificate with Certbot

---

## Part 12 — Useful Server Management Commands

### Check Disk Space

\`\`\`bash
df -h
\`\`\`

### Check RAM Usage

\`\`\`bash
free -h
\`\`\`

### Check Running Processes

\`\`\`bash
htop
\`\`\`

Install htop if needed: sudo apt install htop -y

### View Nginx Error Logs

\`\`\`bash
sudo tail -f /var/log/nginx/error.log
\`\`\`

### View Nginx Access Logs

\`\`\`bash
sudo tail -f /var/log/nginx/access.log
\`\`\`

### Restart a Service

\`\`\`bash
sudo systemctl restart nginx
sudo systemctl restart myflaskapp
\`\`\`

### Check Service Status

\`\`\`bash
sudo systemctl status nginx
\`\`\`

---

## Troubleshooting Common Issues

### "502 Bad Gateway" in the Browser
Your app isn't running or crashed. Check:
\`\`\`bash
pm2 logs myapp          # For Node.js
sudo systemctl status myflaskapp  # For Python
\`\`\`

### "403 Forbidden"
Nginx can't read your files. Fix permissions:
\`\`\`bash
sudo chown -R www-data:www-data /var/www/mysite.com
sudo chmod -R 755 /var/www/mysite.com
\`\`\`

### "404 Not Found"
Your Nginx **root** path or **try_files** directive is wrong. Double-check the file exists where Nginx is looking.

### Certbot Fails
DNS hasn't propagated yet. Wait a few minutes and try again. Also ensure ports 80 and 443 are open in your firewall.

### Can't Connect via SSH
Make sure UFW has OpenSSH allowed:
\`\`\`bash
sudo ufw allow OpenSSH
\`\`\`

---

## Summary — The Full Stack

Here's the complete picture of what you've built:

\`\`\`
Internet visitor
      |
  Your Domain (DNS -> Server IP)
      |
  Ubuntu 25.04 Server
      |
  UFW Firewall (allows 80, 443, SSH)
      |
  Nginx (web server / reverse proxy)
      |
  +----------------------------------+
  |  Static Site | Node.js App      |
  |  /var/www/   | PM2 -> :3000     |
  |              | Python/Gunicorn  |
  |              | systemd -> :5000 |
  +----------------------------------+
\`\`\`

Every layer has a job:
- **Firewall** — only lets in what it should
- **Nginx** — routes requests to the right place and handles HTTPS
- **PM2 / systemd** — keeps your apps running forever
- **Certbot** — keeps your SSL certificate valid

This setup powers millions of production websites and applications worldwide. It scales from a personal blog to a high-traffic platform — just upgrade your VPS plan as you grow.`,
  },
];