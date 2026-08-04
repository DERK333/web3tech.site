export const BLOG_POSTS_9 = [
  {
    id: "kaspa-node-ubuntu-server-complete-setup-mining",
    slug: "kaspa-node-ubuntu-server-complete-setup-mining-guide",
    title: "Run a Full Kaspa Node on Ubuntu Server (No GUI) and Mine It — Complete Command-Line Guide",
    excerpt: "Every single step from a fresh Ubuntu Server install to a fully synced Kaspa node running as a service, a configured wallet, and a live miner hashing against your own local node. No GUI, no shortcuts — pure command line, beginner to fully operational.",
    date: "2026-08-04",
    author: "Derrk Samuel",
    category: "Blockchain",
    tags: ["Kaspa", "Ubuntu", "Node", "Mining", "Rust", "Blockchain", "CLI", "Server", "Linux", "DevOps", "Web3", "Crypto"],
    readTime: "25 min read",
    featured: true,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/20e70266a_generated_image.png",
    content: `## Run a Full Kaspa Node on Ubuntu Server and Mine It — The Complete Command-Line Guide

This guide takes you from a **completely blank Ubuntu Server** to a **fully synced Kaspa node running as a background service**, with a **wallet** and a **live miner hashing against your own node** — no graphical interface, no copy-paste shortcuts you don't understand, every command explained.

Kaspa is a proof-of-work cryptocurrency built on the GhostDAG protocol — a BlockDAG (not a blockchain) that lets blocks be produced in parallel. Running your own node means you don't trust a third party for transactions or mining, and mining against your own node gives you the lowest possible latency (which matters — Kaspa's block rate is extremely fast).

This is a long guide because it's *complete*. Skim the section headers and jump to what you need.

---

## What We'll Cover

1. Server requirements and access
2. Initial server hardening (user, SSH, firewall)
3. System updates and build dependencies
4. Installing the Rust toolchain
5. Cloning and building rusty-kaspa
6. Configuring the node (config file, ports, RPC)
7. Running the node as a systemd service
8. Syncing and verifying the node
9. Creating a Kaspa wallet
10. Choosing and installing a miner
11. Configuring the miner to use your local node
12. Starting mining and monitoring
13. Stopping, updating, and troubleshooting

---

## Part 1 — Server Requirements and Access

### Hardware Requirements

Kaspa's mainnet has grown — a full node needs real storage and decent RAM.

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4+ vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 200 GB SSD | 500 GB+ NVMe SSD |
| Bandwidth | 50 Mbps | 100+ Mbps |
| OS | Ubuntu 22.04 / 24.04 | Ubuntu 24.04 LTS |

> **Storage matters most.** A pruned node needs less, but a full archival node with \`--utxoindex\` grows continuously. Use SSD, not HDD — an HDD will fall behind the network's block rate.

> **For mining on a VPS:** CPU mining Kaspa is generally **not profitable** against GPU/ASIC miners on mainnet. This guide is fully correct for mainnet, but if your goal is profit, testnet or a mining pool with your own hardware is more realistic. The setup steps are identical either way.

### Get a Server

Any VPS provider works — DigitalOcean, Vultr, Hetzner, Linode, or your own bare metal. Create an Ubuntu 24.04 LTS server and note the public IP (e.g., \`203.0.113.50\`).

### SSH Into Your Server

From your local machine:

\`\`\`bash
ssh root@203.0.113.50
\`\`\`

Accept the host key fingerprint and enter the root password (or use the SSH key you configured at the provider).

---

## Part 2 — Initial Server Hardening

Running a node as \`root\` over the long term is bad practice. We'll create a dedicated user, lock down SSH, and open a firewall.

### 2.1 Create a Non-Root User

\`\`\`bash
adduser kaspa
\`\`\`

Set a strong password and press Enter through the optional fields. Now grant sudo privileges:

\`\`\`bash
usermod -aG sudo kaspa
\`\`\`

### 2.2 Copy Your SSH Key (Recommended)

On your **local machine**, copy your public key to the new user:

\`\`\`bash
ssh-copy-id kaspa@203.0.113.50
\`\`\`

Test it works:

\`\`\`bash
ssh kaspa@203.0.113.50
\`\`\`

You should log in without a password.

### 2.3 Disable Root Login and Password Auth

Once you've confirmed your key works for \`kaspa\`, harden SSH:

\`\`\`bash
sudo nano /etc/ssh/sshd_config
\`\`\`

Find and change these lines:

\`\`\`
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
\`\`\`

Save (Ctrl+O, Enter) and exit (Ctrl+X). Restart SSH:

\`\`\`bash
sudo systemctl restart ssh
\`\`\`

> **Keep your current SSH session open** and open a second terminal to test login before closing the first one. If you're locked out, you can't fix it remotely.

### 2.4 Configure the Firewall (UFW)

Kaspa needs two kinds of ports:
- **P2P network port (16111)** — must be open to the internet so peers can reach you
- **RPC ports (16110, 17110)** — **must NOT** be public; they control your node

\`\`\`bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp          # SSH
sudo ufw allow 16111/tcp      # Kaspa P2P
sudo ufw enable
\`\`\`

Verify:

\`\`\`bash
sudo ufw status verbose
\`\`\`

You should see \`22/tcp\` and \`16111/tcp\` allowed, everything else denied.

---

## Part 3 — System Updates and Build Dependencies

\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

Install the build tools and libraries the Kaspa Rust node needs to compile:

\`\`\`bash
sudo apt install -y build-essential curl git cmake clang pkg-config libssl-dev libudev-dev
\`\`\`

What each one is for:
- \`build-essential\` — GCC compiler and make
- \`curl\` — downloading the Rust installer
- \`git\` — cloning the source
- \`cmake\`, \`clang\` — native build helpers some crates use
- \`pkg-config\`, \`libssl-dev\` — TLS/encryption libraries
- \`libudev-dev\` — hardware detection (used for some miner backends)

Reboot if the kernel was upgraded, then log back in as \`kaspa\`:

\`\`\`bash
sudo reboot
\`\`\`

---

## Part 4 — Install the Rust Toolchain

Kaspa's reference implementation (\`rusty-kaspa\`) is written in Rust. Install the official toolchain:

\`\`\`bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
\`\`\`

When prompted, choose option \`1\` (default installation). Then load Rust into your current shell:

\`\`\`bash
source "$HOME/.cargo/env"
\`\`\`

Make it permanent by adding it to your shell profile:

\`\`\`bash
echo 'source "$HOME/.cargo/env"' >> ~/.bashrc
\`\`\`

Install the stable toolchain and verify:

\`\`\`bash
rustup toolchain install stable
rustc --version
cargo --version
\`\`\`

You should see version numbers for both. You now have a working Rust compiler.

---

## Part 5 — Clone and Build rusty-kaspa

### 5.1 Clone the Repository

\`\`\`bash
cd ~
git clone https://github.com/kaspanet/rusty-kaspa.git
cd rusty-kaspa
\`\`\`

### 5.2 Build the Node Binary

Build in **release mode** — this is optimized and much faster than debug:

\`\`\`bash
cargo build --release --bin kaspad
\`\`\`

This will take 5–15 minutes depending on your CPU. The output binary lands at:

\`\`\`
~/rusty-kaspa/target/release/kaspad
\`\`\`

### 5.3 Build the Wallet and Miner Helper Binaries (Optional but Useful)

\`\`\`bash
cargo build --release --bin kaspawallet
\`\`\`

This gives you the \`kaspawallet\` CLI, used in Part 9.

> The separate mining binaries (\`kaspanaut\`, \`kaspa-miner\`, \`honeyminer\`) are separate projects — we install one in Part 10.

### 5.4 Add the Binaries to Your PATH

So you can run \`kaspad\` from anywhere:

\`\`\`bash
mkdir -p ~/.local/bin
ln -s ~/rusty-kaspa/target/release/kaspad ~/.local/bin/kaspad
ln -s ~/rusty-kaspa/target/release/kaspawallet ~/.local/bin/kaspawallet
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
\`\`\`

Verify:

\`\`\`bash
kaspad --version
\`\`\`

---

## Part 6 — Configure the Node

### 6.1 Create the Data Directory

\`\`\`bash
mkdir -p ~/.kaspad
\`\`\`

This is where the blockchain database and logs will live.

### 6.2 First Run to Generate a Config

Run kaspad once briefly so it writes a default config file, then stop it with Ctrl+C:

\`\`\`bash
kaspad --utxoindex
\`\`\`

After a few seconds, press **Ctrl+C** to stop it. A config file has been created.

### 6.3 Edit the Config File

\`\`\`bash
nano ~/.kaspad/kaspad-mainnet.toml
\`\`\`

Set the most important options. The key ones:

\`\`\`toml
# Listen for P2P connections on all interfaces
listen = "0.0.0.0:16111"

# JSON RPC — local only (we'll bind to localhost)
rpclisten = "127.0.0.1:16110"

# Borsh RPC — local only (faster binary protocol)
rpclisten-borsh = "127.0.0.1:17110"

# Keep the UTXO index — required for wallets and mining
utxoindex = true

# Log file
logdir = "/home/kaspa/.kaspad/logs"

# Data directory
datadir = "/home/kaspa/.kaspad/datadir"

# Number of logs files to keep
loglevel = "info"
\`\`\`

Save and exit (Ctrl+O, Enter, Ctrl+X).

> **Why localhost for RPC?** The RPC interface lets any caller query balances, send transactions, or shut down the node. Binding it to \`127.0.0.1\` means only someone already logged into your server can use it. The firewall also blocks external access, so you have two layers.

### 6.4 Test the Config Manually

Start the node in the foreground to confirm it boots cleanly:

\`\`\`bash
kaspad
\`\`\`

You should see log lines about connecting to peers and starting sync. Once you see it's working, stop it with **Ctrl+C** — we'll set it up as a service next.

---

## Part 7 — Run the Node as a systemd Service

Running kaspad directly in a terminal dies when you disconnect. A systemd service keeps it running, restarts it after crashes, and starts it on boot.

### 7.1 Create the Service File

\`\`\`bash
sudo nano /etc/systemd/system/kaspad.service
\`\`\`

Paste (adjust the paths if your username isn't \`kaspa\`):

\`\`\`ini
[Unit]
Description=Kaspa Full Node (rusty-kaspa)
After=network-online.target
Wants=network-online.target

[Service]
User=kaspa
Group=kaspa
Type=simple
ExecStart=/home/kaspa/.local/bin/kaspad --utxoindex
WorkingDirectory=/home/kaspa
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
\`\`\`

Save and exit.

### 7.2 Enable and Start the Service

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable kaspad
sudo systemctl start kaspad
\`\`\`

### 7.3 Check the Status

\`\`\`bash
sudo systemctl status kaspad
\`\`\`

You should see \`active (running)\`. To follow the live log:

\`\`\`bash
sudo journalctl -u kaspad -f
\`\`\`

Press **Ctrl+C** to exit the log stream (the node keeps running).

---

## Part 8 — Syncing and Verifying the Node

### 8.1 Watch the Sync

\`\`\`bash
sudo journalctl -u kaspad -f
\`\`\`

You'll see the node downloading blocks. Kaspa syncs fast compared to Bitcoin, but mainnet still has a lot of history — expect anywhere from 30 minutes to a few hours depending on disk speed and bandwidth.

### 8.2 Check Sync Status via RPC

While the node is syncing, query it directly:

\`\`\`bash
curl -s -X POST http://127.0.0.1:16110 \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":"1","method":"getBlockCount","params":[]}' | python3 -m json.tool
\`\`\`

You'll get a JSON response with the current block count. Compare it against a block explorer like [\`kas.fyi\`](https://kas.fyi) or [\`kaspares.org\`](https://kaspares.org) to see how far along you are.

### 8.3 When Sync Is Complete

You'll see log lines like \`Synced with network\` and the block count will match the explorer within a few blocks (the network keeps producing blocks, so you'll always be a tiny bit behind — that's normal).

At this point your node is a **fully validating Kaspa node**. Every transaction and block is verified by *your* machine, not a third party.

---

## Part 9 — Create a Kaspa Wallet

Mining rewards need somewhere to go. You'll create a wallet using the \`kaspawallet\` CLI that came with the build.

### 9.1 Create the Wallet

\`\`\`bash
kaspawallet create
\`\`\`

You'll be prompted to:
1. Enter a **password** — choose a strong one; this encrypts the wallet file
2. Confirm the password

The tool will output your **wallet address** (starts with \`kaspa:\`) and a **mnemonic seed phrase**.

> **⚠️ CRITICAL:** Write the 24-word mnemonic on paper and store it offline. Anyone with this phrase controls your funds. There is no recovery if you lose it and no way to reverse a stolen phrase.

Example output (yours will differ):

\`\`\`
Your wallet address is:
kaspa:qz8k...example

Your mnemonic seed phrase is:
word1 word2 word3 ... word24
\`\`\`

### 9.2 Check Your Balance

\`\`\`bash
kaspawallet balance
\`\`\`

Initially this is \`0\`. Once you mine, rewards show up here.

### 9.3 Get Your Receiving Address

You'll need this to configure the miner:

\`\`\`bash
kaspawallet address
\`\`\`

Copy the output (\`kaspa:q...\`) — this is where mining rewards go.

---

## Part 10 — Install a Miner

There are several Kaspa miners. The most common open-source one is [\`kaspa-miner\`](https://github.com/kaspanet/kaspa-miner) (also Rust, from the Kaspa team). There are also community miners like [\`honeyminer\`](https://github.com/hencrice/honeyminer) and [\`kaspanaut\`](https://github.com/nepalbitcoin/kaspanaut).

> **Mainnet reality check:** Kaspa mainnet is dominated by high-hashrate GPU and ASIC farms. A CPU/VPS will mine but almost certainly will not find a block solo. For learning, testnet is the realistic path. For profit, join a mining pool with real hardware. The *setup steps below are identical for mainnet, testnet, or a pool.*

### 10.1 Clone and Build kaspa-miner

\`\`\`bash
cd ~
git clone https://github.com/kaspanet/kaspa-miner.git
cd kaspa-miner
cargo build --release
\`\`\`

Build takes a few minutes. The binary lands at:

\`\`\`
~/kaspa-miner/target/release/kaspa-miner
\`\`\`

### 10.2 (Alternative) Build on a GPU Machine

If you have a GPU machine for actual mining, build \`kaspa-miner\` *there* with GPU features enabled (e.g. \`--features opencl\` or \`cuda\` depending on your hardware) and point it at your node's RPC over a VPN or SSH tunnel. A VPS typically has no GPU.

### 10.3 Link the Miner

\`\`\`bash
ln -s ~/kaspa-miner/target/release/kaspa-miner ~/.local/bin/kaspa-miner
\`\`\`

Verify:

\`\`\`bash
kaspa-miner --help
\`\`\`

---

## Part 11 — Configure the Miner to Use Your Local Node

The miner needs three things:
1. **RPC address** of the node — \`127.0.0.1:16110\` (your local node)
2. **Mining address** — your wallet address from Part 9.3
3. **Number of threads** — match your CPU core count

### 11.1 Find Your CPU Count

\`\`\`bash
nproc
\`\`\`

Remember this number (e.g., \`4\`).

### 11.2 Test Run the Miner (Foreground)

\`\`\`bash
kaspa-miner --kaspad-address 127.0.0.1:16110 \\
            --mining-address kaspa:qz8k...your-address \\
            --threads 4
\`\`\`

Replace \`kaspa:qz8k...your-address\` with your actual wallet address.

You should immediately see output like:

\`\`\`
Connected to kaspad at 127.0.0.1:16110
Mining with 4 threads
Block template received...
Hashing at ... GH/s
\`\`\`

The hashrate number will stabilize after a few seconds. **This means mining is working.** Press **Ctrl+C** to stop it — we'll make it a service next.

### 11.3 Solo vs Pool Mining

The command above is **solo mining** — you alone get the full reward if *you* find a block, but the chance is tiny unless you have massive hashrate.

To **pool mine** instead, replace the \`--kaspad-address\` with the pool's stratum/RPC endpoint (the pool gives you this URL) and keep your mining address as the payout address the pool registered for you. Pool mining pays out small frequent amounts regardless of whether *you* find a block.

Common Kaspa pools (verify they're still active before joining):
- \`pool.woolypooly.com\`
- \`pool.rplant.net\`
- \`herominers.com\`

> Pools have their own setup pages — follow the pool's instructions for the stratum URL and worker name, but the miner binary and the general flags stay the same.

---

## Part 12 — Run Mining as a Service

### 12.1 Create a Service File

\`\`\`bash
sudo nano /etc/systemd/system/kaspa-miner.service
\`\`\`

Paste (replace the wallet address and thread count with your real values):

\`\`\`ini
[Unit]
Description=Kaspa Miner
After=kaspad.service
Requires=kaspad.service

[Service]
User=kaspa
Group=kaspa
Type=simple
ExecStart=/home/kaspa/.local/bin/kaspa-miner --kaspad-address 127.0.0.1:16110 --mining-address kaspa:qz8k...YOUR-ADDRESS --threads 4
WorkingDirectory=/home/kaspa
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
\`\`\`

Save and exit.

> Notice \`Requires=kaspad.service\` — the miner won't start until the node is up, and if the node restarts, systemd coordinates them.

### 12.2 Enable and Start the Miner

\`\`\`bash
sudo systemctl daemon-reload
sudo systemctl enable kaspa-miner
sudo systemctl start kaspa-miner
\`\`\`

### 12.3 Watch the Miner Log

\`\`\`bash
sudo journalctl -u kaspa-miner -f
\`\`\`

You should see hashrate lines. Press **Ctrl+C** to exit the stream.

### 12.4 Confirm Rewards Are Flowing

After some time (for solo mining: could be never on a VPS; for pool mining: within hours), check your wallet:

\`\`\`bash
kaspawallet balance
\`\`\`

---

## Part 13 — Stopping, Updating, and Troubleshooting

### 13.1 Stop / Start / Restart the Services

\`\`\`bash
sudo systemctl stop kaspa-miner
sudo systemctl stop kaspad

sudo systemctl start kaspad
sudo systemctl start kaspa-miner

sudo systemctl restart kaspad
\`\`\`

Always stop the **miner first**, then the node. Start the **node first**, then the miner.

### 13.2 Update rusty-kaspa

\`\`\`bash
sudo systemctl stop kaspa-miner
sudo systemctl stop kaspad

cd ~/rusty-kaspa
git pull
cargo build --release --bin kaspad
cargo build --release --bin kaspawallet

sudo systemctl start kaspad
sudo systemctl start kaspa-miner
\`\`\`

### 13.3 Update the Miner

\`\`\`bash
sudo systemctl stop kaspa-miner
cd ~/kaspa-miner
git pull
cargo build --release
sudo systemctl start kaspa-miner
\`\`\`

### 13.4 Common Problems

**Node won't sync / shows 0 peers:**
- Check the firewall allows \`16111/tcp\`: \`sudo ufw status\`
- Check your clock is accurate: \`timedatectl status\` — enable NTP if drift: \`sudo timedatectl set-ntp true\`. Kaspa's block timestamps are sensitive to clock skew.
- Restart the node: \`sudo systemctl restart kaspad\`

**Miner connects but hashrate is 0:**
- The node may not be fully synced. Wait for sync to finish.
- Check your wallet address is valid and on the correct network (mainnet vs testnet).

**"Connection refused" from the miner:**
- The node RPC isn't running. Check \`sudo systemctl status kaspad\`.
- Confirm RPC is bound to \`127.0.0.1:16110\` in the config.

**Disk full:**
- Kaspa's data grows continuously. Check with \`df -h\`.
- If you don't need full history, research pruning options in the rusty-kaspa docs.
- Consider moving the datadir to a larger mounted volume and updating \`datadir\` in the config.

**Wallet says "no connection":**
- The wallet CLI needs the node's RPC. Make sure \`kaspad\` is running and RPC is on \`127.0.0.1:16110\`.

### 13.5 Back Up Your Wallet

Your wallet file lives at \`~/.kaspawallet\`. Back it up securely:

\`\`\`bash
tar -czf kaspawallet-backup.tar.gz ~/.kaspawallet
\`\`\`

Store this file somewhere safe **and offline**. The mnemonic phrase is still your ultimate recovery — keep that even safer.

---

## Final State — What You Now Have

- A hardened Ubuntu Server with a dedicated \`kaspa\` user
- A **fully validating Kaspa node** running 24/7 as a systemd service
- The node synced to the Kaspa mainnet, reachable on P2P port 16111
- RPC locked to localhost so only you can control it
- A **Kaspa wallet** with your address and mnemonic backed up offline
- A **miner** running as a service, hashing against your own local node
- Logs viewable with \`journalctl\` and auto-restart on crash

Every transaction you send, every block you mine, is verified by your own machine — not a third party. That's what running a full node means.

---

## Quick Reference — All the Daily Commands

| Task | Command |
|---|---|
| Node status | \`sudo systemctl status kaspad\` |
| Node live log | \`sudo journalctl -u kaspad -f\` |
| Miner status | \`sudo systemctl status kaspa-miner\` |
| Miner live log | \`sudo journalctl -u kaspa-miner -f\` |
| Wallet balance | \`kaspawallet balance\` |
| Wallet address | \`kaspawallet address\` |
| Send funds | \`kaspawallet send --address kaspa:q... --amount 10\` |
| Block count | \`curl -s -X POST http://127.0.0.1:16110 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":"1","method":"getBlockCount","params":[]}'\` |
| Stop everything | \`sudo systemctl stop kaspa-miner && sudo systemctl stop kaspad\` |
| Start everything | \`sudo systemctl start kaspad && sudo systemctl start kaspa-miner\` |

That's the entire pipeline — from a blank server to a mining Kaspa node, all from the command line.`
  }
];