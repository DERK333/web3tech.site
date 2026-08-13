// Blog posts 14 — Bitcoin Core / running a full node
export const BLOG_POSTS_14 = [
  {
    id: "bitcoin-core-full-node-guide-bitcoincore-org",
    slug: "bitcoin-core-full-node-guide-bitcoincore-org",
    title: "Bitcoin Core & bitcoincore.org — The Official Client, Explained (Run a Full Node in 2026)",
    excerpt: "Bitcoin Core is the reference implementation of the Bitcoin protocol and the software that secures the network. This complete guide covers what bitcoincore.org is, how to download and verify the client, and how to run your own full node — solo, pruned, or in Docker.",
    date: "2026-08-13",
    author: "Derrk Samuel",
    category: "Blockchain",
    tags: ["Bitcoin", "Bitcoin Core", "Full Node", "bitcoincore.org", "Cryptocurrency", "Blockchain", "Self-Custody", "Linux"],
    readTime: "11 min read",
    featured: true,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/4855bce44_generated_image.png",
    content: `## What Is Bitcoin Core?

**Bitcoin Core** is the original and most widely used reference implementation of the Bitcoin protocol. It's the software that defines what "a Bitcoin node" is for most of the network — it validates blocks and transactions, enforces consensus rules, and (optionally) serves as a wallet.

Bitcoin Core is not a company or a product. It's an open-source project maintained by a distributed group of contributors, released under the MIT license, and descended directly from the 2009 software published by Satoshi Nakamoto. When people say "running a Bitcoin node," they almost always mean running Bitcoin Core.

The official home of the project is **[bitcoincore.org](https://bitcoincore.org)** — the only site you should download the client from.

---

## What bitcoincore.org Actually Is

[bitcoincore.org](https://bitcoincore.org) is the official website for the Bitcoin Core project. It's where you'll find:

| Section | What you get |
|---------|--------------|
| **Download** | The latest signed release binaries for Windows, macOS, Linux, and ARM |
| **Documentation** | The user and developer docs, including the node setup guide |
| **Release notes** | Full changelog for every release — consensus changes, RPC additions, fixes |
| **Verify** | SHA256 checksums and PGP signatures so you can prove your download is authentic |
| **Contribute** | Source on GitHub, build instructions, and how to report issues |

> Treat any other site offering "Bitcoin Core" downloads as untrusted. The whole point of running a node is not having to trust someone else — so start by not trusting the download itself. Verify it (below).

---

## Why Run a Full Node?

Running your own Bitcoin Core node means **you** enforce the rules — you don't outsource validation to a third-party server.

**Key benefits:**

- **Trustless validation** — every block and transaction is checked against consensus rules by you, not an exchange or wallet server.
- **Privacy** — your wallet queries your own node, so no one sees your addresses or balances.
- **Network sovereignty** — you don't depend on someone else's uptime, censorship, or API limits.
- **Contributing to the network** — your node relays blocks and transactions, strengthening decentralization.
- **Solo mining / dev work** — required if you want to mine solo, build on Bitcoin, or test protocol features.

---

## Step 1 — Download Bitcoin Core from bitcoincore.org

Always download from the official site.

\`\`\`text
https://bitcoincore.org/en/download/
\`\`\`

Pick the binary for your platform:

\`\`\`bash
# Linux x86_64 example
wget https://bitcoincore.org/bin/bitcoin-core-28.0/bitcoin-28.0-x86_64-linux-gnu.tar.gz
\`\`\`

> Replace the version number with whatever is current on the download page. Never copy a URL from a forum or chat — only from bitcoincore.org.

---

## Step 2 — Verify the Download (Do Not Skip)

This is the single most important step. A tampered binary could silently steal your keys or mislead your node.

### Get the checksums and signatures

On the download page, grab:

- The **SHA256SUMS** file (hashes of every binary)
- The **SHA256SUMS.asc** file (PGP signature proving the hashes are authentic)

### Verify the hash

\`\`\`bash
sha256sum bitcoin-28.0-x86_64-linux-gnu.tar.gz
# Compare the output to the matching line in SHA256SUMS
\`\`\`

### Verify the signature on the hashes

\`\`\`bash
# Import the Bitcoin Core release-signing key
gpg --keyserver hkps://keys.openpgp.org --recv-keys 0x90C8019E36ECB4A56

# Verify the signed checksum file
gpg --verify SHA256SUMS.asc SHA256SUMS
\`\`\`

You want to see a valid "Good signature" line from the Bitcoin Core release signer. The "key is not certified" warning is normal — what matters is the signature is valid and matches a key you recognize from the official release process.

---

## Step 3 — Install

### Linux (from tarball)

\`\`\`bash
tar -xzf bitcoin-28.0-x86_64-linux-gnu.tar.gz
sudo install -m 0755 -o root -g root -t /usr/local/bin bitcoin-28.0/bin/*
\`\`\`

### macOS / Windows

Use the official installer from bitcoincore.org and follow the wizard. The macOS app is Bitcoin-Qt; Windows gives you bitcoin-qt.exe (GUI) and bitcoind.exe (daemon).

Confirm the install:

\`\`\`bash
bitcoind --version
\`\`\`

---

## Step 4 — Configure Your Node

Bitcoin Core stores its data and config in a default data directory. On Linux that is \`~/.bitcoin/\`, on macOS \`~/Library/Application Support/Bitcoin/\`, on Windows \`%APPDATA%\\Bitcoin\\\`.

Create a config file:

\`\`\`bash
mkdir -p ~/.bitcoin
nano ~/.bitcoin/bitcoin.conf
\`\`\`

A sensible default for a personal full node:

\`\`\`ini
# ~/.bitcoin/bitcoin.conf
server=1
daemon=1
rpcuser=your_rpc_user
rpcpassword=USE_A_LONG_RANDOM_PASSWORD
rpcallowip=127.0.0.1
listen=1

# Optional: prune to save disk (see Pruned Node section)
# prune=550
\`\`\`

> Never expose the RPC port (8332) to the public internet. Keep it on 127.0.0.1 unless you know exactly what you're doing.

---

## Step 5 — Start the Node

### As a daemon

\`\`\`bash
bitcoind -daemon
\`\`\`

### Watch the sync (initial block download)

The first sync downloads and validates the entire chain — **500+ GB and several hours to days** depending on hardware.

\`\`\`bash
bitcoin-cli getblockchaininfo
\`\`\`

Watch the verification progress climb to 1.0 and the headers count match the blocks count.

---

## Disk Space — Full Node vs Pruned Node

A full archival node keeps every block forever and grows continuously. If disk is tight, **pruning** keeps only the latest blocks (default 550 MB minimum) while still fully validating the chain.

\`\`\`ini
# bitcoin.conf — keep roughly the last 10 GB of blocks
prune=10000
\`\`\`

| Mode | Disk | History | Notes |
|------|------|---------|-------|
| Archival | ~600 GB+ and growing | Full | Required to serve old blocks to the network |
| Pruned | ~550 MB – 10 GB | Recent only | Still fully validates; can't serve old blocks |

Pruned mode gives you the same trustless validation with a fraction of the storage.

---

## Run Bitcoin Core in Docker

For a clean, isolated setup, use Docker.

\`\`\`bash
docker run -d \\
  --name bitcoin-core \\
  --restart unless-stopped \\
  -p 8333:8333 \\
  -v ~/.bitcoin:/bitcoin/.bitcoin \\
  bitcoin/bitcoind \\
  -rpcuser=your_rpc_user \\
  -rpcpassword=USE_A_LONG_RANDOM_PASSWORD \\
  -server=1 \\
  -daemon=0
\`\`\`

Key flags:

- \`-p 8333:8333\` — P2P port so your node relays blocks and transactions
- \`-v ~/.bitcoin:/bitcoin/.bitcoin\` — persist the chain and config on the host
- \`--restart unless-stopped\` — auto-start on reboot

Follow the logs:

\`\`\`bash
docker logs -f bitcoin-core
\`\`\`

---

## Run Bitcoin Core as a systemd Service (Linux)

For a server that stays online, a systemd unit keeps the node running and auto-restarts on crash.

\`\`\`ini
# /etc/systemd/system/bitcoind.service
[Unit]
Description=Bitcoin Core daemon
After=network-online.target

[Service]
ExecStart=/usr/local/bin/bitcoind -daemonwait -conf=/home/bitcoin/.bitcoin/bitcoin.conf -datadir=/home/bitcoin/.bitcoin
Type=forking
User=bitcoin
Group=bitcoin
Restart=on-failure
TimeoutStartSec=infinity

[Install]
WantedBy=multi-user.target
\`\`\`

Enable and start:

\`\`\`bash
sudo systemctl enable bitcoind
sudo systemctl start bitcoind
sudo journalctl -u bitcoind -f
\`\`\`

---

## Useful bitcoin-cli Commands

Once the node is running, control it through the RPC interface:

\`\`\`bash
bitcoin-cli getblockchaininfo      # Sync status, chain height, headers
bitcoin-cli getnetworkinfo         # Connections, version, sub-version
bitcoin-cli getpeerinfo           # List connected peers
bitcoin-cli getbalance            # Wallet balance (if wallet enabled)
bitcoin-cli stop                   # Shut down the daemon cleanly
\`\`\`

---

## Wallet Considerations

Bitcoin Core includes a built-in descriptor wallet, but for larger amounts most users prefer a dedicated hardware wallet (Coldcard, Trezor, Ledger) for **cold storage**, using Bitcoin Core only as a validating node.

If you use the built-in wallet:

- **Encrypt it** — Settings → Encrypt wallet (or \`bitcoin-cli encryptwallet "<passphrase>"\`), and back up wallet.dat / the wallet directory.
- **Back up regularly** — losing the wallet file loses access to those funds.
- **Use a fresh, long passphrase** — never reuse one from another service.

> A full node protects your *privacy and validation*. A hardware wallet protects your *keys*. For meaningful holdings, use both.

---

## Common Issues & Fixes

### Node won't sync / stuck on headers
- Check your firewall allows outbound port 8333.
- Add a few seed nodes: \`bitcoin-cli addnode "node address" "add"\`.
- Ensure your system clock is accurate (use NTP) — Bitcoin rejects blocks with skewed timestamps.

### "Error opening block database"
- Usually a corrupted data dir. Stop the node, run the salvage tooling, or re-index: \`bitcoind -reindex\` (slow).

### RPC "401 Unauthorized"
- rpcuser / rpcpassword in bitcoin.conf must match the node's config. Restart bitcoind after editing.

### Out of disk
- Switch to pruning (\`prune=550\`) or add storage. Never delete the blocks or chainstate directories manually.

---

## Security Best Practices

- **Verify every download** with SHA256SUMS + PGP (Step 2). No exceptions.
- **Keep the node updated** — subscribe to the bitcoincore.org release announcements.
- **Firewall the RPC port** (8332) to localhost only.
- **Run as a dedicated non-root user.**
- **Back up your wallet** before any upgrade.
- **Don't run random third-party plugins** against your node.

---

## Bitcoin Core vs Other Bitcoin Clients

| Client | Language | Notes |
|--------|----------|-------|
| **Bitcoin Core** | C++ | Reference implementation; sets consensus rules |
| btcd | Go | Alternative full node; not always consensus-compatible |
| LND / Core Lightning | Go / C | Lightning Network daemons, run on top of a node like Core |
| Electrum / Electrs | Python | SPV / indexer, useful for light wallets; not a full validating node |

For enforcing the actual consensus rules of the Bitcoin network, **Bitcoin Core is the reference**.

---

## Key Takeaways

- **bitcoincore.org** is the only official source for Bitcoin Core — always download and PGP-verify from there.
- Running a full node gives you **trustless validation, privacy, and network sovereignty**.
- Use **pruning** (\`prune=550\`) if you can't spare 600+ GB.
- Docker or systemd makes a node production-grade and auto-restarting.
- Keep the RPC port local, encrypt any wallet, and update on each release.

Running Bitcoin Core is the most direct way to participate in the Bitcoin network on your own terms — no custodian, no middleman, just your hardware enforcing the rules.`
  },
];