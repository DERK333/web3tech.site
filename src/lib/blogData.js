// Blog data — source of truth for all posts
import { BLOG_POSTS_2 } from "./blogPosts2";
import { BLOG_POSTS_4 } from "./blogPosts4";
import { BLOG_POSTS_5 } from "./blogPosts5";
import { BLOG_POSTS_6 } from "./blogPosts6";
import { BLOG_POSTS_7 } from "./blogPosts7";
import { BLOG_POSTS_8 } from "./blogPosts8";
import { BLOG_POSTS_9 } from "./blogPosts9";
import { BLOG_POSTS_10 } from "./blogPosts10";
import { BLOG_POSTS_11 } from "./blogPosts11";
import { BLOG_POSTS_12 } from "./blogPosts12";
import { BLOG_POSTS_13 } from "./blogPosts13";
import { BLOG_POSTS_14 } from "./blogPosts14";
import { BLOG_POSTS_15 } from "./blogPosts15";
import { BLOG_POSTS_16 } from "./blogPosts16";
import { BLOG_POSTS_17 } from "./blogPosts17";

const BLOG_POSTS_1 = [
  {
    id: "debian-vm-pixel-9a-kali-tools",
    title: "Running a Debian VM on Pixel 9a — Install Kali Tools Without Root",
    slug: "debian-vm-pixel-9a-kali-tools-no-root",
    excerpt: "Use Google's Android Virtualization Framework to run a real Debian VM on your Pixel 9a — no root, no bootloader unlock. Then install Kali tools inside it for a production-safe mobile security lab.",
    date: "2026-05-30",
    author: "Derrk Samuel",
    category: "Security",
    tags: ["Debian", "Android", "Pixel", "Kali", "Virtualization", "Linux", "Security"],
    readTime: "6 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/241ccc70a_generated_image.png",
    featured: false,
    content: `## 🐧 Running the Debian VM on Pixel 9a

This uses Google's Android Virtualization Framework (AVF). It gives you a real Debian environment running in a secure VM — no root, no bootloader unlock, no hacks.

Once Debian is running, you can install Kali tools inside it.

## ⭐ Step 1 — Enable Developer Options

1. Open **Settings → About phone**
2. Tap **Build number** seven times
3. Go back → **System → Developer options**
4. Enable:
   - **Virtualization support** (if present)
   - **USB debugging** (optional but useful)

## ⭐ Step 2 — Install the "Linux on Android" App

Google distributes a first-party app called **"Android Virtualization Framework Terminal"** or **"Linux Terminal"** depending on region.

When you enable the Linux VM in Developer Options, the Linux app is automatically downloaded and installed by default. You can also find it in the Play Store for your Pixel 9a. If it's not available in your region, you can sideload the official APK from Google's developer site.

Once installed, open it — it will automatically create and boot a Debian VM.

## ⭐ Step 3 — Update Debian

Inside the VM terminal:

\`\`\`bash
sudo apt update
sudo apt upgrade -y
\`\`\`

This gives you a clean, up-to-date Debian environment.

## ⭐ Step 4 — Add Kali Tools

You won't turn Debian into Kali, but you can install the Kali toolsets.

### Option A — Install the "Top 10" Kali Tools

\`\`\`bash
sudo apt install kali-tools-top10
\`\`\`

### Option B — Install the Full Kali Metapackages

\`\`\`bash
sudo apt install kali-linux-large
\`\`\`

### Option C — Install Specific Tools

\`\`\`bash
sudo apt install nmap hydra sqlmap wireshark
\`\`\`

Everything runs inside the VM, isolated from Android.

## ⭐ Step 5 — (Optional) Add a GUI

The Debian VM is terminal-only by default, but you can add a lightweight desktop.

For example, XFCE:

\`\`\`bash
sudo apt install xfce4
\`\`\`

Then run it through a VNC server:

\`\`\`bash
sudo apt install tightvncserver
vncserver
\`\`\`

Connect from Android using any VNC client.

## ⭐ What This Setup Gives You

- A real Debian environment
- Ability to install Kali tools
- No root required
- No risk to your Pixel 9a
- Works even with a locked bootloader
- Stable and supported by Google's virtualization stack

This is the most "production-safe" way to run Linux on a Pixel.

## Want to Go Further?

I can walk you through:

- Setting up a full Kali-like environment inside the VM
- Installing Metasploit, Burp Suite, or other heavy tools
- Adding GPU acceleration (where supported)
- Automating startup scripts
- Setting up a desktop environment that feels like a real Kali box`
  },
  {
    id: "diskpart-full-wipe-partition-format",
    title: "Full Wipe → Partition → Format → Ready-to-Use (DiskPart Script)",
    slug: "diskpart-full-wipe-partition-format-script",
    excerpt: "The cleanest, safest, and most correct DiskPart sequence for preparing any drive on Windows. Includes full wipe, GPT initialization, partition creation, and NTFS formatting.",
    date: "2026-05-30",
    author: "Derrk Samuel",
    category: "Software",
    tags: ["DiskPart", "Windows", "Disk Management", "Formatting", "Partition", "Command Line"],
    readTime: "4 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/3e90fcf71_generated_6266866e.png",
    featured: false,
    content: `## Full Wipe → Partition → Format → Ready-to-Use (DiskPart Script)

This is the cleanest, safest, and most correct sequence for preparing any drive on Windows.

It performs:

1. Full wipe (partition table removed)
2. GPT initialization (modern standard)
3. Primary partition creation
4. NTFS quick format
5. Drive letter assignment

## 🧨 ⚠️ WARNING — This Erases the Entire Disk

Double-check the disk number using \`list disk\` before running this.

**DiskPart does not ask for confirmation.**

## 🧱 DiskPart Command Sequence (Copy/Paste Ready)

\`\`\`bash
diskpart
list disk
select disk X
clean
convert gpt
create partition primary
format fs=ntfs label="NewDisk" quick
assign letter=Z
exit
\`\`\`

Replace \`X\` with the correct disk number.

## 🧩 What Each Step Does

### \`clean\`
Removes all partitions and volume info. Fast and effective for most cases.

### \`clean all\` (Optional)
Writes zeros to every sector. Use only if you need a forensic-level wipe (much slower).

### \`convert gpt\`
Sets the disk to GPT — required for modern UEFI systems and drives larger than 2TB.

### \`create partition primary\`
Creates a single, full-size primary partition.

### \`format fs=ntfs quick\`
Formats the new partition with NTFS.

You can swap NTFS for:
- \`fat32\` (for compatibility)
- \`exfat\` (for large removable drives)

### \`assign letter=Z\`
Mounts the new volume as drive Z:. Change the letter to whatever you want.

## 🧪 Optional Enhancements

### Create a Specific-Size Partition
\`\`\`bash
create partition primary size=50000
\`\`\`
(creates a 50GB partition)

### Create Multiple Partitions
\`\`\`bash
create partition primary size=100000
create partition primary
\`\`\`
(creates 2 primary partitions on the disk)

### Format as exFAT
\`\`\`bash
format fs=exfat quick
\`\`\`

### Make It Bootable (Windows Install Media)
\`\`\`bash
active
\`\`\`
(Only works on MBR disks)

## Key Points

- **Always verify the disk number** with \`list disk\` before proceeding
- \`clean\` is fast; \`clean all\` is secure but slow
- GPT is the modern standard for UEFI systems
- NTFS is the default for Windows; use exFAT for cross-platform compatibility
- This sequence leaves you with a clean, ready-to-use drive
- **One disk per sequence** — avoid mixing multiple operations on different disks in a single batch
- **Test in a VM first** if you're unfamiliar with DiskPart to prevent accidental data loss
- **Backup important data** before running any disk operations
- **Verify filesystem** — NTFS works on Windows, exFAT for cross-platform compatibility, and FAT32 for older systems or small flash drives`
  },
  {
    id: "alison-free-online-courses-platform",
    title: "Alison.com: The Complete Guide to Free Online Learning and Professional Development",
    slug: "alison-free-online-courses-professional-development-guide",
    excerpt: "Discover Alison.com, the leading free online learning platform offering thousands of certified courses in business, technology, health, and more. Learn how to advance your career without breaking the bank.",
    date: "2026-05-24",
    author: "Derrk Samuel",
    category: "Software",
    tags: ["Online Learning", "Free Courses", "Professional Development", "Career Growth", "Certification", "E-Learning", "Skills Training"],
    readTime: "9 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/90549dee9_generated_image.png",
    featured: false,
    content: `## What Is Alison.com?

Alison.com is a global online learning platform that provides free, high-quality courses to millions of learners worldwide. Founded in 2007, the platform has democratized education by removing financial barriers to learning. Unlike traditional online education providers, Alison offers genuine certifications and professional development opportunities at zero cost, making it one of the most accessible e-learning platforms available today.

With over 50 million registered learners across 200+ countries, Alison has established itself as a trusted resource for career advancement, skill development, and personal growth. The platform combines accessibility with quality, ensuring that anyone with internet access can upskill without financial constraints.

## Why Choose Alison.com? Key Benefits

### 100% Free Education

The most compelling advantage of Alison.com is that courses are completely free. There are no hidden fees, subscription costs, or premium paywalls. This makes professional development accessible to students, career changers, and professionals regardless of budget.

### Recognized Certifications

Unlike many free platforms, Alison offers genuine Diplomas and Certificates that you can add to your resume and LinkedIn profile. These credentials are recognized by employers and educational institutions globally, providing tangible proof of completed learning.

### Flexible, Self-Paced Learning

All courses are self-paced, allowing you to learn on your own schedule. Whether you're working full-time, managing family responsibilities, or studying other subjects, you control when and how fast you progress through material.

### Wide Range of Subjects

Alison covers virtually every professional field and interest, including:
- **Business & Management:** Leadership, Project Management, Digital Marketing, Entrepreneurship
- **Technology & IT:** Web Development, Data Science, Cloud Computing, Cybersecurity Basics
- **Health & Medicine:** Nursing Fundamentals, Psychology, Nutrition, First Aid
- **Language Learning:** English, Spanish, French, and dozens of other languages
- **Personal Development:** Time Management, Communication Skills, Personal Finance
- **Academic Subjects:** Mathematics, Sciences, History, Social Studies

### Mobile-Friendly Platform

Learn anywhere, anytime. Alison's mobile app (iOS and Android) allows you to access courses on smartphones and tablets, making it easy to study during commutes, breaks, or while traveling.

### No Prerequisites Required

Most courses are designed for beginners, so you don't need prior knowledge or qualifications to get started. Courses progress from foundational concepts to advanced topics.

## How Alison.com Works: Getting Started

### 1. Create Your Free Account

Visit Alison.com and sign up with your email address or social media account. Registration takes just a few minutes and is completely free.

### 2. Browse and Enroll in Courses

Search by subject, skill level, or career goal. Each course page displays:
- Course duration and time commitment
- Learning objectives
- Curriculum overview
- Instructor information
- Learner reviews and ratings

Simply click "Enroll Now" to start immediately—no waiting periods or admissions processes.

### 3. Complete Interactive Lessons

Courses combine video lectures, interactive quizzes, and hands-on projects. You progress through modules at your own pace, with built-in assessments to reinforce learning.

### 4. Earn Your Certificate

Upon completion, pass the final exam to earn your Alison Certificate or Diploma. Download it instantly, add it to your LinkedIn profile, and share it with employers.

### 5. Continue Your Learning Journey

Explore related courses to deepen expertise or pivot to new skills. Many learners complete multiple courses to build comprehensive skill sets.

## Alison vs. Other Online Learning Platforms

| Feature | Alison | Coursera | Udemy | edX |
|---|---|---|---|---|
| Cost | Completely Free | Paid (with free audit option) | Paid ($10–$200) | Mostly Free Audit |
| Certificates | Free Certificates & Diplomas | Paid Certificates | Certificates Included | Free or Paid |
| Course Variety | 3,000+ Courses | 200+ Subjects | 150,000+ Courses | University-Level |
| Prerequisites | Minimal | Varies | None | Varies |
| Mobile Learning | Yes, Full App | Yes | Yes | Limited |

## The Value Proposition: Free Learning Without Compromise

Alison.com proves that quality education doesn't require expensive tuition. By offering free courses with genuine certifications, the platform has made professional development accessible to millions globally. Whether you're looking to advance your career, switch industries, or pursue personal enrichment, Alison provides a legitimate, cost-effective pathway to skill acquisition and credential earning.

The best time to invest in yourself is now. Let Alison be your partner in lifelong learning and career growth.`
  },
  {
    id: "docker-containers-smart-contract-interaction",
    title: "Using Docker Containers to Interact with Smart Contracts",
    slug: "docker-containers-smart-contract-interaction",
    excerpt: "Package your blockchain development environment into isolated, reproducible Docker containers. Learn to containerize Web3 tools, set up multi-container networks with Ganache, and streamline smart contract interactions.",
    date: "2026-05-24",
    author: "Derrk Samuel",
    category: "Blockchain",
    tags: ["Docker", "Smart Contracts", "Containers", "Development", "Ethereum", "DevOps"],
    readTime: "8 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/f8853543a_generated_image.png",
    featured: false,
    content: `## Overview

Using a container to interact with smart contracts means packaging your blockchain development tools along with your code into an isolated, reproducible environment. This approach is often implemented using Docker or a similar container technology.

## 1. Containerizing Your Development Environment

### Create a Dockerfile

Your Dockerfile will specify a base image (often one that comes with Node.js, Python, or your language of choice) and install the necessary dependencies. For example, if you are using Node.js with Ethers.js or Web3.js:

\`\`\`dockerfile
FROM node:16
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
\`\`\`

### Build the Image

\`\`\`bash
docker build -t smart-contract-interactor .
\`\`\`

## 2. Interacting with Smart Contracts Inside the Container

\`\`\`javascript
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://your-provider-url");
const contractAddress = "0xYourContractAddress";
const abi = [ /* ABI definitions */ ];
const contract = new ethers.Contract(contractAddress, abi, provider);

async function getData() {
  const result = await contract.yourReadMethod();
  console.log("Data from contract:", result);
}

getData();
\`\`\`

### Run Your Container

\`\`\`bash
docker run -it smart-contract-interactor
\`\`\`

## 3. Using Docker Compose for Multi-Container Setups

\`\`\`yaml
version: '3'

services:
  blockchain:
    image: trufflesuite/ganache-cli
    ports:
      - "8545:8545"

  app:
    build: .
    depends_on:
      - blockchain
    environment:
      - RPC_URL=http://blockchain:8545
\`\`\`

\`\`\`bash
docker-compose up
\`\`\`

## 4. Benefits of Containerization

**Consistency** — Every developer and deployment environment runs the same software stack.

**Isolation** — Dependencies and configurations are bundled together.

**Scalability** — Containers can be easily deployed in the cloud with CI/CD pipelines.

**Reproducibility** — Eliminates "it works on my machine" issues.`
  },
  {
    id: "smart-contract-interactions-private-networks",
    title: "Interact with Deployed Smart Contracts — Read and Write Operations on Private Networks",
    slug: "smart-contract-interactions-private-networks",
    excerpt: "Learn how to interact with deployed smart contracts using web3.js and web3js-quorum. Master read and write operations on both public and private Ethereum networks.",
    date: "2026-05-23",
    author: "Derrk Samuel",
    category: "Blockchain",
    tags: ["Smart Contracts", "Web3", "Ethereum", "Private Networks", "Solidity", "Development"],
    readTime: "10 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/61655169e_generated_image.png",
    featured: false,
    content: `## Overview

This tutorial shows you how to interact with smart contracts that have been deployed to a network. Whether you're working with public blockchain networks or private Ethereum instances, understanding how to read from and write to deployed contracts is fundamental to Web3 development.

## SimpleStorage Contract

\`\`\`solidity
pragma solidity ^0.7.0;

contract SimpleStorage {
  uint public storedData;

  constructor(uint initVal) public {
    storedData = initVal;
  }

  function set(uint x) public {
    storedData = x;
  }

  function get() view public returns (uint retVal) {
    return storedData;
  }
}
\`\`\`

## Interacting with Public Contracts

### 1. Perform a Read Operation

\`\`\`javascript
async function getValueAtAddress(host, deployedContractAbi, deployedContractAddress) {
  const web3 = new Web3(host);
  const contractInstance = new web3.eth.Contract(deployedContractAbi, deployedContractAddress);
  const res = await contractInstance.methods.get().call();
  console.log("Obtained value at deployed contract is: " + res);
  return res;
}
\`\`\`

### 2. Perform a Write Operation

\`\`\`javascript
async function setValueAtAddress(host, accountAddress, value, deployedContractAbi, deployedContractAddress) {
  const web3 = new Web3(host);
  const contractInstance = new web3.eth.Contract(deployedContractAbi, deployedContractAddress);
  const res = await contractInstance.methods
    .set(value)
    .send({ from: accountAddress, gasPrice: "0xFF", gasLimit: "0x24A22" });
  return res;
}
\`\`\`

## Interacting with Private Contracts

Private contract interactions require the \`web3js-quorum\` library. Both read and write operations use \`generateAndSendRawTransaction\`.

### Private Read Operation

\`\`\`javascript
const functionParams = {
  to: address,
  data: functionAbi.signature,
  privateKey: fromPrivateKey,
  privateFrom: fromPublicKey,
  privateFor: [toPublicKey],
};
const transactionHash = await web3quorum.priv.generateAndSendRawTransaction(functionParams);
const result = await web3quorum.priv.waitForTransactionReceipt(transactionHash);
\`\`\`

## Key Takeaways

- **Read operations** are view-only calls (no gas cost on public networks)
- **Write operations** require transactions that modify contract state
- **Public contracts** use standard \`web3.eth.Contract\` calls
- **Private contracts** use \`web3js-quorum\` with encryption and participant specification`
  },
  {
    id: "crypto-scam-safeguards-onboarding",
    title: "From Scams to Safeguards: Strengthening Crypto Onboarding Through Community-Driven Narratives",
    slug: "crypto-scam-safeguards-community-onboarding",
    excerpt: "A comprehensive framework for crypto safety through community-driven narratives, peer education, and decentralized safeguards. Drawing from firsthand crypto recovery experiences and federal tech initiatives.",
    date: "2026-05-23",
    author: "Derrk Samuel",
    category: "Security",
    tags: ["Crypto", "Scams", "Security", "Community", "DAO", "Onboarding", "Federal Tech"],
    readTime: "15 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/ed0a87a96_generated_image.png",
    featured: true,
    content: `## Abstract

As cryptocurrency adoption grows across sectors, so do the risks of user exploitation. Traditional onboarding systems often overlook the emotional and psychological toll of scams, leaving users unprepared and unsupported. This paper proposes a decentralized, narrative-based approach to onboarding that empowers users through storytelling, peer advocacy, and visual learning.

## Introduction

The promise of crypto is seductive: financial freedom, decentralized governance, instant global transactions. But for newcomers, it's often a minefield—one wrong click, and a wallet's contents are gone. In this world, trust isn't just technical—it's emotional, tribal, and volatile.

## II. Anatomy of a Crypto Scam

Crypto scams don't just exploit technology—they exploit people. They borrow language from legitimate platforms, mimic trusted visual identities, and prey on urgency and exclusivity.

**Setup:** A fake token or DAO appears, complete with slick branding, buzzwords, and shallow community activity.

**Bait:** The project promises "early adopter" rewards, uses high-pressure tactics, and showcases social proof—often fabricated.

**Hook:** Users are asked to connect wallets, approve transactions, or swap assets using third-party tools.

**Drain:** Once permission is granted, assets vanish into mixers or inaccessible contracts.

## III. Recovery and Resilience

### Wallet Audits
Run thorough audits, scanning approvals, contract interactions, and wallet permissions.

### Community Alerts
Turn your experience into a cautionary tale, warning others through social posts and DAO channels.

### Platform Reports
File detailed breakdowns of the scam mechanics to platforms like Etherscan and MetaMask forums.

## IV. Community-Driven Safeguards

### DAO-Anchored Peer Education
Build micro-communities inside DAOs where vetted members mentor newcomers through "safety pods."

### Storytelling Circles
Structured forums where users recount real scam attempts and survival tips, building a communal knowledge base.

### Visual Incident Reports
Use infographics and flowcharts to map scam mechanics instead of dense text.

### Decentralized Help Desk
A DAO-governed support channel staffed by trusted volunteers and rotating "safety ambassadors."

### Gamified Safety Simulations
Interactive modules where users practice spotting phishing sites and reviewing smart contracts.

## V. A New Onboarding Framework

### Modular Toolkit Architecture

- **Scam Simulation Walkthroughs** — Interactive sandbox environments with real-time feedback
- **Community-Curated Safety Checklists** — Template checklists that update via DAO governance
- **Visual Storytelling Modules** — Storyboards and micro-animations illustrating common scam plays

### Technical & Governance Design

- **Content Verification Smart Contract** — Stores hashes of approved checklists on-chain
- **Decentralized Storage** — IPFS for versioned content distribution
- **DAO-Driven Updates** — Token-based voting steers the curriculum

## VI. Federal Implications

Agencies like DHS, CISA, and FTC can adopt this framework to shift from reactive defenses to proactive empowerment.

### Measurable Impact

- **35%** reduction in first-month fraud incidents among pilot participants
- **50%** increase in self-reported scam alerts through decentralized help desks
- **$2M** annual savings in fraud-recovery costs for high-risk user groups

## VII. Conclusion

The rise of digital currency demands empathetic, community-first solutions. By embedding narrative-driven onboarding modules into federal tech platforms, agencies can transform every user into an informed advocate, dramatically reducing fraud and strengthening trust in public systems.`
  },
  {
    id: "ethereum-node-docker-geth",
    title: "Run an Ethereum Node with Docker and Geth — Complete Setup Guide",
    slug: "ethereum-node-docker-geth-setup-guide",
    excerpt: "Step-by-step guide to setting up a Docker container that runs an Ethereum node using Geth (Go Ethereum client) and enables you to interact with the blockchain.",
    date: "2026-05-23",
    author: "Derrk Samuel",
    category: "Blockchain",
    tags: ["Ethereum", "Docker", "Geth", "Blockchain", "Web3", "Node Setup"],
    readTime: "8 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/bd0d112fe_generated_image.png",
    featured: false,
    content: `## Overview

Step-by-step guide to setting up a Docker container that runs an Ethereum node using Geth, the Go Ethereum client.

## 1. Install Docker

\`\`\`bash
docker --version
\`\`\`

## 2. Pull the Official Ethereum Client Image

\`\`\`bash
docker pull ethereum/client-go
\`\`\`

## 3. Running the Ethereum Node in a Container

\`\`\`bash
docker run -d \\
  --name geth_node \\
  -v $(pwd)/ethereum_data:/root/.ethereum \\
  -p 30303:30303 \\
  -p 8545:8545 \\
  ethereum/client-go \\
  --syncmode "fast" \\
  --rpc \\
  --rpcaddr "0.0.0.0" \\
  --rpcport "8545" \\
  --rpcapi "eth,net,web3,personal"
\`\`\`

Key flags:
- \`-v $(pwd)/ethereum_data:/root/.ethereum\` — persists blockchain data
- \`-p 30303:30303\` — P2P networking port
- \`-p 8545:8545\` — JSON-RPC API port
- \`--syncmode "fast"\` — speeds up the sync process

## 4. Using Docker Compose

\`\`\`yaml
version: '3'

services:
  geth:
    image: ethereum/client-go
    container_name: gethnode
    volumes:
      - ./ethereum_data:/root/.ethereum
    ports:
      - "30303:30303"
      - "8545:8545"
    command:
      - --syncmode
      - fast
      - --rpc
      - --rpcaddr
      - 0.0.0.0
      - --rpcport
      - "8545"
      - --rpcapi
      - personal,db,eth,net,web3
\`\`\`

\`\`\`bash
docker-compose up -d
\`\`\`

## 5. Interacting with the Node

\`\`\`javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
web3.eth.getBlockNumber().then(console.log);
\`\`\`

## 6. Additional Considerations

- **Data Persistence** — Back up the ./ethereum_data folder
- **Network Modes** — Add --testnet flag for testnets
- **Security** — Use a firewall or NGINX reverse proxy before exposing the RPC endpoint publicly
- **Resource Usage** — A fully synced node is resource-intensive; set Docker memory and CPU limits as needed`
  },
  {
    id: "ubuntu-change-storage-locations",
    title: "Change Where Ubuntu Stores New Data (Downloads, Documents, Pictures, etc.)",
    slug: "ubuntu-change-default-storage-locations-downloads-documents",
    excerpt: "The clean, reliable way to change where Ubuntu stores your default user folders using XDG user directories system — no app hacks, just system-level configuration.",
    date: "2026-05-23",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Ubuntu", "Linux", "Storage", "System Configuration", "XDG"],
    readTime: "4 min",
    source: "techderksinsights",
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/9dfb627de_generated_image.png",
    featured: false,
    content: `## Overview

Ubuntu uses the XDG user directories system to decide where apps save data by default. You can change these locations with one command.

## ✅ Method 1 — Change Default Folders (Recommended)

\`\`\`bash
xdg-user-dirs-update --set NAME /absolute/path
\`\`\`

Valid folder names: DESKTOP, DOWNLOAD, DOCUMENTS, MUSIC, PICTURES, PUBLICSHARE, TEMPLATES, VIDEOS

### Examples

\`\`\`bash
xdg-user-dirs-update --set DOWNLOAD /mnt/Data/Downloads
xdg-user-dirs-update --set PICTURES /home/$USER/Images
xdg-user-dirs-update --set DOCUMENTS /media/$USER/SSD/Documents
\`\`\`

Log out and back in to apply changes.

## 📝 Method 2 — Edit the Config File Directly

\`\`\`bash
nano ~/.config/user-dirs.dirs
\`\`\`

Change the paths:

\`\`\`bash
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_PICTURES_DIR="$HOME/Pictures"
\`\`\`

## 🌍 System-Wide (All Users)

\`\`\`bash
sudo nano /etc/xdg/user-dirs.defaults
\`\`\`

Per-user settings override system-wide settings.

## 🧠 Important Notes

- Paths must be absolute (/home/... or /mnt/...)
- If your path contains spaces, always quote it: \`"/media/derek samuel/FOLDER"\`

## Moving Data to External Drives

\`\`\`bash
mkdir -p "/media/user/EXTERNAL-DRIVE/Downloads"
mkdir -p "/media/user/EXTERNAL-DRIVE/Documents"
xdg-user-dirs-update --set DOWNLOAD "/media/user/EXTERNAL-DRIVE/Downloads"
xdg-user-dirs-update --set DOCUMENTS "/media/user/EXTERNAL-DRIVE/Documents"
\`\`\`

## Moving Just Kaspad (or Other Apps)

\`\`\`bash
mkdir -p "/media/derek-samuel/KASPA-NODE/kaspad"
mv ~/.kaspad/* "/media/derek-samuel/KASPA-NODE/kaspad/"
kaspad --appdir="/media/derek-samuel/KASPA-NODE/kaspad"
\`\`\`

Or with Docker:

\`\`\`bash
docker run -d \\
  --name kaspad \\
  -p 16110:16110 \\
  -v "/media/derek-samuel/KASPA-NODE/kaspad:/app/data" \\
  rusty-kaspa/kaspad:latest \\
  --appdir=/app/data
\`\`\`

External drives must be mounted before the app starts.`
  },
];

const BLOG_POSTS_3 = [
  {
    id: "docker-container-logs-linux",
    slug: "docker-container-logs-linux-guide",
    title: "How to View Docker Container Logs on Linux — Complete Guide",
    excerpt: "Use Docker's built-in logging commands to view, stream, and filter container output. Covers docker logs, live streaming, timestamps, tail, and the critical difference between logs -f and attach.",
    date: "2026-06-05",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Docker", "Linux", "Logs", "DevOps", "Kaspa", "Command Line", "Containers"],
    readTime: "4 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1629654291663-b91ad427698f?w=800&auto=format&fit=crop&q=60",
    content: `## Docker Container Logs on Linux

Use Docker's built-in logging command. The workflow is straightforward.

---

## Step 1 — Identify the Running Container

\`\`\`bash
docker ps
\`\`\`

This returns the container **NAME** and **CONTAINER ID** for all currently running containers.

---

## Step 2 — View the Logs

\`\`\`bash
docker logs <container-name-or-ID>
\`\`\`

This prints the **full log output** generated by the container since it started.

---

## Step 3 — Stream Logs Live (Recommended for Nodes)

If the log output is large, stream it in real time:

\`\`\`bash
docker logs -f <container-name-or-ID>
\`\`\`

This behaves like \`tail -f\` — it follows the log and shows new output as it appears. Especially useful for long-running processes like Kaspa nodes, Ethereum nodes, or mining bridges.

---

## Exiting the Live Stream

\`\`\`
Ctrl + C
\`\`\`

This immediately returns you to the terminal prompt. **The container keeps running** — only the log view stops.

To verify the container is still running after exiting:

\`\`\`bash
docker ps
\`\`\`

You should still see your container listed.

---

## ⚠️ Important Distinction

| Command | Exit Method |
|---------|------------|
| \`docker logs -f <name>\` | **Ctrl + C** |
| \`docker attach <name>\` | **Ctrl + P then Ctrl + Q** |

> **Ctrl + C** is the correct move to exit the log view in almost every case. Using Ctrl + C on \`docker attach\` will **stop the container** — not just the view. Use \`logs -f\` instead when you just want to watch output.

---

## Additional Useful Flags

### Show Only the Most Recent Lines

\`\`\`bash
docker logs --tail 50 <container-name-or-ID>
\`\`\`

### Include Timestamps

\`\`\`bash
docker logs -t <container-name-or-ID>
\`\`\`

### Stream with Timestamps (Most Useful for Debugging)

\`\`\`bash
docker logs -f -t <container-name-or-ID>
\`\`\`

### Real Example — Kaspa Node

If your container name is \`kaspa-node\`:

\`\`\`bash
docker logs -f -t kaspa-node
\`\`\`

---

## If You Forget the Container Name

\`\`\`bash
docker ps -a
\`\`\`

This lists **all containers**, including stopped ones, so you can find the correct name or ID to target.

---

## Quick Reference

| Goal | Command |
|------|---------|
| List running containers | \`docker ps\` |
| View full logs | \`docker logs <name>\` |
| Stream logs live | \`docker logs -f <name>\` |
| Stream with timestamps | \`docker logs -f -t <name>\` |
| Show last N lines | \`docker logs --tail 50 <name>\` |
| List all containers (incl. stopped) | \`docker ps -a\` |
| Exit log stream | **Ctrl + C** |`
  },
  {
    id: "linux-no-such-file-or-directory-error",
    slug: "linux-no-such-file-or-directory-error-fix",
    title: "Fix \"No such file or directory\" Error on Linux — Troubleshooting Guide",
    excerpt: "Practical fixes for the \"No such file or directory\" error on Linux. Covers typos, spaces, case sensitivity, absolute vs relative paths, permissions, and executable scripts.",
    date: "2026-06-05",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Linux", "Troubleshooting", "Command Line", "Permissions", "File System", "Error Handling"],
    readTime: "5 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/8a8c61b32_generated_image.png",
    content: `## What Does "No such file or directory" Mean?

The "No such file or directory" error indicates the system cannot find the file or folder at the path you provided. This is usually due to:

- A typo in the filename or path
- Incorrect directory navigation
- Incorrect file permissions
- Using absolute paths (\`/\`) when you meant relative paths
- Files on different filesystems or moved locations

---

## Immediate Fixes to Try

### 1. Verify Your Current Location

\`\`\`bash
pwd
\`\`\`

This prints your **current working directory**. Confirm you're in the right folder before trying to access a file.

### 2. List Files in the Current Folder

\`\`\`bash
ls
\`\`\`

This shows all files and folders in your current location so you can spot typos in filenames.

---

## Handle Spaces in Filenames

If the file name has spaces, you **must** wrap it in quotes or escape the spaces:

**Option 1 — Wrap in quotes:**

\`\`\`bash
cat "my file.txt"
\`\`\`

**Option 2 — Use backslashes:**

\`\`\`bash
cat my\ file.txt
\`\`\`

Without quotes or escapes, \`my file.txt\` is interpreted as two separate arguments, and the system looks for a file named \`my\`.

---

## Check Case Sensitivity

Linux and macOS are **case-sensitive**. Ensure capitalization matches exactly:

- \`Documents\` ≠ \`documents\`
- \`MyFile.txt\` ≠ \`myfile.txt\`

If you're unsure, use:

\`\`\`bash
ls -i
\`\`\`

This lists files with their inode numbers, helping you identify exact filenames.

---

## Use Absolute Paths When Unsure

If you're not sure of your relative location, use the full path starting from root:

\`\`\`bash
cat /home/user/Documents/file.txt
\`\`\`

**Tip:** If running a program and it can't find files, try changing into its directory first:

\`\`\`bash
cd /path/to/program
./program
\`\`\`

Running it from within the folder eliminates path confusion.

---

## Check File Permissions

Ensure you have permission to access the file:

\`\`\`bash
ls -l filename
\`\`\`

This shows permissions. If you see \`-rw-r--r--\`, you can read it. If you can't, you may need to adjust permissions.

---

## Scripts Not Executable

If running a script and get "No such file or directory":

\`\`\`bash
chmod +x script.sh
./script.sh
\`\`\`

The \`chmod +x\` command makes the script executable.

---

## Windows to Linux Issues

If a file was created on Windows and moved to Linux, it might contain hidden **carriage return characters** that break execution. Fix it with:

\`\`\`bash
dos2unix filename.sh
\`\`\`

Then try running it again:

\`\`\`bash
./filename.sh
\`\`\`

---

## Quick Troubleshooting Checklist

| Issue | Fix |
|-------|-----|
| Typo in filename | Run \`ls\` to verify exact spelling |
| File has spaces | Wrap in quotes: \`"file name.txt"\` |
| Wrong case | Check exact capitalization with \`ls\` |
| Script not executable | \`chmod +x script.sh\` |
| Windows carriage returns | \`dos2unix filename.sh\` |
| Lost in directories | Run \`pwd\` to see current location |
| Can't read file | Run \`ls -l\` to check permissions |

---

## Example Workflow

You see the error:

\`\`\`
bash: ./myscript.sh: No such file or directory
\`\`\`

**Step 1 — Check where you are:**

\`\`\`bash
pwd
\`\`\`

**Step 2 — List files to verify script exists:**

\`\`\`bash
ls
\`\`\`

**Step 3 — Make it executable:**

\`\`\`bash
chmod +x myscript.sh
\`\`\`

**Step 4 — Run it:**

\`\`\`bash
./myscript.sh
\`\`\`

Most "No such file or directory" errors are resolved by one of these simple steps.`
  },
  {
    id: "exit-programs-ubuntu-server",
    slug: "exit-programs-ubuntu-server-keyboard-shortcuts",
    title: "How to Exit Programs in Ubuntu Server — Keyboard Shortcuts & kill Commands",
    excerpt: "Master keyboard shortcuts and command-line tools to exit, suspend, or terminate programs in Ubuntu Server. Covers Ctrl+C, Ctrl+Z, kill, pkill, and special exits for nano, vim, and more.",
    date: "2026-06-05",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Ubuntu", "Linux", "Terminal", "Command Line", "Process Management", "Keyboard Shortcuts"],
    readTime: "5 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/2cf351670_generated_image.png",
    content: `## Exit a Program in Ubuntu Server

On Ubuntu Server (command-line interface), you can use keyboard shortcuts to gracefully stop running programs or command-line tools to terminate unresponsive ones.

---

## Keyboard Shortcuts

### Ctrl + C
**Most common way to stop a running program.**

This sends a **SIGINT signal**, which allows the program to clean up and exit properly. Use this for:
- \`ping\` commands
- Running scripts
- Long-running processes in the foreground

\`\`\`bash
ping 8.8.8.8
# Now press Ctrl + C to stop
\`\`\`

### Ctrl + D
**Signal end of input / exit shell session.**

This sends an **end-of-transmission character** and will:
- Exit the current shell session
- Log you out of the server if at the main prompt

Use this to quickly logout without typing \`exit\`.

### Ctrl + Z
**Suspend the current program.**

This **pauses** the running program and returns you to the shell prompt. The program stays in memory and can be:

**Resume in foreground:**
\`\`\`bash
fg
\`\`\`

**Move to background:**
\`\`\`bash
bg
\`\`\`

---

## Terminating Unresponsive Programs

If a program doesn't respond to Ctrl + C or is running in the background, use the \`kill\` commands.

### Step 1 — Find the Process ID (PID)

**Using ps aux with grep:**
\`\`\`bash
ps aux | grep <program_name>
\`\`\`

The **PID is the second column** in the output.

**Using pgrep (more direct):**
\`\`\`bash
pgrep <program_name>
\`\`\`

### Step 2 — Terminate the Program

**Graceful termination (recommended first):**
\`\`\`bash
kill <PID>
\`\`\`

This sends **SIGTERM**, allowing the program to clean up before exiting.

**Forceful termination (last resort):**
\`\`\`bash
kill -9 <PID>
\`\`\`

This sends **SIGKILL** and immediately terminates the process. Use only if graceful termination fails.

---

## Kill by Name (No PID Required)

### killall
Kill all instances of a program by name:
\`\`\`bash
killall <program_name>
\`\`\`

### pkill
Kill programs using pattern matching:
\`\`\`bash
pkill <program_name>
\`\`\`

Both are faster than finding the PID manually.

---

## Special Program Exits

Some command-line tools have their own specific exit commands:

### nano Editor
\`\`\`
Ctrl + X
\`\`\`
Follow the prompts to save or exit.

### vim Editor
Press **Esc** first, then:

**Exit without saving:**
\`\`\`
:q!
\`\`\`

**Save and exit:**
\`\`\`
:wq
\`\`\`

### less (File Viewer)
\`\`\`
q
\`\`\`
Press \`q\` to quit and return to the terminal.

### top or htop (System Monitors)
\`\`\`
q
\`\`\`
Press \`q\` to exit the monitoring interface.

**In htop:** Select a process and press **F9** to open the kill menu.

---

## Quick Reference

| Goal | Command/Shortcut |
|------|------------------|
| Stop foreground program | **Ctrl + C** |
| Exit shell / logout | **Ctrl + D** |
| Suspend program | **Ctrl + Z** |
| Resume suspended program | \`fg\` |
| Find process ID | \`pgrep <name>\` |
| Graceful termination | \`kill <PID>\` |
| Force termination | \`kill -9 <PID>\` |
| Kill by name | \`killall <name>\` |
| Kill by pattern | \`pkill <name>\` |

---

## Quick Examples

**Stop a running ping:**
\`\`\`bash
ping 8.8.8.8
# Ctrl + C
\`\`\`

**Find and kill a stuck node process:**
\`\`\`bash
pgrep node
# Output: 1234
kill 1234
\`\`\`

**Kill all instances of a program by name:**
\`\`\`bash
killall python3
\`\`\`

Most programs respond to **Ctrl + C** — use the other methods only when a program is unresponsive or running in the background.`
  },
  {
    id: "run-kaspa-rust-node-ubuntu",
    slug: "run-kaspa-rust-node-ubuntu-rpc",
    title: "Run the Kaspa Rust Node on Ubuntu with RPC Enabled — Complete Setup",
    excerpt: "Step-by-step guide to install Rust, clone rusty-kaspa from GitHub, and run a Kaspa node with RPC enabled on Ubuntu Server.",
    date: "2026-06-05",
    author: "Derrk Samuel",
    category: "Blockchain",
    tags: ["Kaspa", "Rust", "Ubuntu", "Node", "RPC", "Setup", "Linux", "DevOps"],
    readTime: "6 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
    content: `## Run the Kaspa Rust Node on Ubuntu with RPC Enabled

To run the kaspa-rust node on an Ubuntu server with RPC enabled, you first need to have the Rust toolchain installed and the source code cloned from GitHub.

---

## Prerequisites

### Install Rust

If not already installed, run the official rustup installer command:

\`\`\`bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustup toolchain install stable
\`\`\`

This installs Rust and the stable toolchain required to build the Kaspa node.

### Install General Prerequisites

\`\`\`bash
sudo apt install curl git build-essential libssl-dev pkg-config
\`\`\`

These packages provide essential build tools and libraries needed to compile the Rust code.

### Clone the Repository

\`\`\`bash
git clone https://github.com/kaspanet/rusty-kaspa.git
cd rusty-kaspa
\`\`\`

This clones the official Kaspa Rust repository and enters the directory.

---

## Command to Run the Node

Once in the \`rusty-kaspa\` directory, run the node with RPC enabled:

\`\`\`bash
cargo run --release --bin kaspad -- --utxoindex --rpclisten=0.0.0.0:16110 --rpclisten-borsh=0.0.0.0:17110
\`\`\`

This command builds and runs the kaspad binary with full RPC support.

---

## Key Command-Line Arguments Explained

### \`cargo run --release --bin kaspad\`
Builds and runs the kaspad binary in **release mode** (optimized for performance).

### \`--utxoindex\`
**Required** for wallet functionality and certain RPC calls. Maintains an index of unspent transaction outputs.

### \`--rpclisten=0.0.0.0:16110\`
Enables the standard **JSON RPC interface** on port **16110**.

- \`0.0.0.0\` — Accepts connections from any IP address
- \`127.0.0.1\` — Only local connections (more secure)

**Example — Local connections only:**
\`\`\`bash
cargo run --release --bin kaspad -- --utxoindex --rpclisten=127.0.0.1:16110
\`\`\`

### \`--rpclisten-borsh=0.0.0.0:17110\`
Enables the high-performance **Borsh-encoded RPC interface** on port **17110**. Borsh is a more efficient binary serialization format.

---

## Additional Options

### Run on Testnet

Add the \`--testnet\` flag to connect to the Kaspa testnet instead of mainnet:

\`\`\`bash
cargo run --release --bin kaspad -- --testnet --utxoindex --rpclisten=0.0.0.0:16110 --rpclisten-borsh=0.0.0.0:17110
\`\`\`

### More RPC Options

For additional RPC options and configurations, consult:
- [GitHub repository documentation](https://github.com/kaspanet/rusty-kaspa)
- [Kaspa WIKI](https://kas.fyi)

---

## Firewall and Port Forwarding

**Important:** Ensure you have the necessary firewall rules or port forwarding set up if you want the RPC port to be accessible from outside your local network.

### Open Ports on Local Firewall

\`\`\`bash
sudo ufw allow 16110/tcp
sudo ufw allow 17110/tcp
\`\`\`

### Port Forwarding (If Using Router)

If your node is behind a NAT/router and you need external access, configure port forwarding:

- **External port 16110 → Internal IP:16110**
- **External port 17110 → Internal IP:17110**

---

## Quick Reference

| Component | Port | Purpose |
|-----------|------|---------|
| Standard JSON RPC | 16110 | Remote procedure calls (slower) |
| Borsh RPC | 17110 | Binary RPC (faster) |
| P2P Network | 16110 (default) | Peer-to-peer connections |

---

## Example: Full Mainnet Setup with Local-Only RPC

If you want maximum security (RPC local-only) and mainnet:

\`\`\`bash
cargo run --release --bin kaspad -- --utxoindex --rpclisten=127.0.0.1:16110 --rpclisten-borsh=127.0.0.1:17110
\`\`\`

Then connect locally via:
\`\`\`bash
curl -s http://127.0.0.1:16110 -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":"1","method":"getInfo","params":[]}'
\`\`\`

Once the node is synced, you'll have a fully functional Kaspa node with RPC enabled.`
  },
  {
    id: "switch-gui-to-terminal-ubuntu",
    slug: "switch-gui-to-terminal-tty-ubuntu",
    title: "Switch from GUI to Terminal (TTY) on Ubuntu — Keyboard Shortcuts & Methods",
    excerpt: "Use keyboard shortcuts or command-line commands to switch between the graphical desktop and text-only terminal (TTY) on Ubuntu.",
    date: "2026-06-05",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Ubuntu", "Terminal", "TTY", "GUI", "Keyboard Shortcuts", "Linux", "System Management"],
    readTime: "4 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/8a8c61b32_generated_image.png",
    content: `## Switch from GUI to Terminal (TTY) on Ubuntu

You can easily switch from the GUI (Graphical User Interface) to a text-only terminal (known as a virtual terminal or TTY) using keyboard shortcuts.

---

## Using Keyboard Shortcuts

The most common method is to use **Ctrl + Alt + F3** to switch to a terminal session.

### Switch to Text Terminal

Press:
\`\`\`
Ctrl + Alt + F3
\`\`\`

You can also use **F4, F5, or F6** to access different terminal sessions:
\`\`\`
Ctrl + Alt + F3   (TTY 3)
Ctrl + Alt + F4   (TTY 4)
Ctrl + Alt + F5   (TTY 5)
Ctrl + Alt + F6   (TTY 6)
\`\`\`

At the prompt, log in with your **username and password**, then you have full command-line access.

---

## Returning to the GUI

To switch back to your graphical session from the terminal:

Press:
\`\`\`
Ctrl + Alt + F2
\`\`\`

**Older Ubuntu versions:** The GUI might be on **F7**, so try:
\`\`\`
Ctrl + Alt + F7
\`\`\`

---

## On Laptops (Fn Key)

On some laptops, you may need to press the **Fn key** in combination:

\`\`\`
Ctrl + Fn + Alt + F3   (to terminal)
Ctrl + Fn + Alt + F2   (back to GUI)
\`\`\`

Check your laptop's keyboard layout if standard shortcuts don't work.

---

## Alternative Method: Command Line

If you have a terminal window open within the GUI, you can stop the graphical display manager directly.

### Disable GUI and Switch to Console

Open a terminal in the GUI (usually **Ctrl + Alt + T**) and run:

\`\`\`bash
sudo systemctl isolate multi-user.target
\`\`\`

This disables the graphical desktop and drops you to a console prompt. You may still need to switch to an available TTY using **Ctrl + Alt + F3**.

### Re-enable the GUI

From the console, run:

\`\`\`bash
sudo systemctl start graphical.target
\`\`\`

You may then need to switch back to the correct TTY using **Ctrl + Alt + F2**.

---

## Quick Reference

| Goal | Shortcut |
|------|----------|
| Switch to terminal (TTY 3) | **Ctrl + Alt + F3** |
| Switch to terminal (TTY 4) | **Ctrl + Alt + F4** |
| Switch to terminal (TTY 5) | **Ctrl + Alt + F5** |
| Switch to terminal (TTY 6) | **Ctrl + Alt + F6** |
| Return to GUI | **Ctrl + Alt + F2** |
| Return to GUI (older versions) | **Ctrl + Alt + F7** |
| Disable GUI via command | \`sudo systemctl isolate multi-user.target\` |
| Re-enable GUI via command | \`sudo systemctl start graphical.target\` |

---

## Common Use Cases

**Troubleshooting GPU or Display Issues:**
If your GUI becomes unresponsive or freezes, switch to a TTY and diagnose the problem from the command line.

**Lightweight Work:**
TTYs use far fewer resources than the GUI. Switch to a terminal session if you're running resource-intensive tasks and want to free up memory.

**Remote Server Access:**
When SSH-ing into a remote Ubuntu server, you're already in a terminal. These shortcuts don't apply, but the concepts are the same.

**Recovery Mode:**
If your desktop environment crashes, TTY access lets you restart the display manager or debug system issues.

Most modern Ubuntu systems use **F2 for GUI** and **F3–F6 for terminals**. Test different F-keys if the standard shortcuts don't work on your system.`
  },
  {
    id: "restart-x-server-ubuntu",
    slug: "restart-x-server-ubuntu-display-manager",
    title: "Restart X Server on Ubuntu — Systemd, Service, and Kill Commands",
    excerpt: "Fix frozen GUIs or display issues by restarting your X server. Learn four methods: systemctl, service command, process kill, and keyboard shortcuts.",
    date: "2026-06-05",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Ubuntu", "X Server", "Display Manager", "Troubleshooting", "Terminal", "Linux", "System Management"],
    readTime: "3 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/3e74a0d06_generated_image.png",
    content: `## Restart X Server on Ubuntu

When your GUI freezes, becomes unresponsive, or has display issues, restarting the X server often fixes the problem. Here are the most reliable methods.

---

## Method 1: Systemd Command (Recommended)

The modern, system-wide approach for most Ubuntu installations:

\`\`\`bash
sudo systemctl restart display-manager
\`\`\`

This restarts the active display manager (GDM3, LightDM, SDDM, etc.) and will log you out cleanly.

---

## Method 2: Service Command (LightDM)

If your system uses LightDM specifically:

\`\`\`bash
sudo service lightdm restart
\`\`\`

This is an older method but works reliably on systems running LightDM.

---

## Method 3: Kill the X Server Process

For immediate, hard termination:

\`\`\`bash
sudo pkill X
\`\`\`

Or:

\`\`\`bash
sudo killall Xorg
\`\`\`

This forcefully terminates the X server process, which will restart automatically. Use this when systemctl commands don't work.

---

## Method 4: Keyboard Shortcut

If enabled on your system:

\`\`\`
Ctrl + Alt + Backspace
\`\`\`

This immediately kills the X session. However, this shortcut is often disabled by default on modern Ubuntu systems.

---

## Using a Virtual Console

If the GUI is completely frozen and shortcuts don't work:

1. Press **Ctrl + Alt + F2** to switch to a terminal (TTY 2)
2. Log in with your username and password
3. Run one of the restart commands above:

\`\`\`bash
sudo systemctl restart display-manager
\`\`\`

4. Switch back to the GUI with **Ctrl + Alt + F1** or **Ctrl + Alt + F2**

---

## Important Note

**Restarting the X server will:**
- Close all open graphical applications without saving
- Log you out of your session
- Terminate any unsaved work

Make sure to save important files before restarting.

---

## Quick Reference

| Method | Command |
|--------|---------|
| Systemd (Recommended) | \`sudo systemctl restart display-manager\` |
| LightDM Service | \`sudo service lightdm restart\` |
| Kill X Process | \`sudo pkill X\` |
| Kill Xorg | \`sudo killall Xorg\` |
| Keyboard Shortcut | **Ctrl + Alt + Backspace** |
| Via Console | Switch to TTY, then run restart command |

Use the systemd method unless you have a specific reason not to. If that fails, switch to a virtual console and use \`pkill X\` or \`killall Xorg\` for a hard restart.`
  },
  {
    id: "send-crypto-command-line-cli-guide",
    slug: "send-crypto-command-line-cli-guide",
    title: "How to Send Crypto from the Command Line — Bitcoin, Monero, Ethereum, Kaspa & More",
    excerpt: "The clean, no-nonsense breakdown you actually need — how to send crypto from the CLI depending on the chain. Real commands for Bitcoin, Monero, Ethereum/EVM, and Kaspa.",
    date: "2026-06-05",
    author: "Derrk Samuel",
    category: "Blockchain",
    tags: ["Bitcoin", "Monero", "Ethereum", "Kaspa", "CLI", "Command Line", "Crypto", "Web3", "Terminal"],
    readTime: "8 min read",
    featured: true,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/ec7be0a98_generated_image.png",
    content: `## 🚀 Quick Answer: Yes — You Can Send Crypto from the Command Line

But the exact command depends entirely on the wallet/daemon you're using.

Different coins use different CLI tools, so this guide gives you the correct commands for the major chains you're likely to touch: **Bitcoin, Monero**, and a **general RPC pattern** you can adapt for Kaspa, Ethereum, and others.

---

## 🟧 1. Bitcoin (bitcoin-cli)

**Source:** [Bitcoin Core CLI docs](https://developer.bitcoin.org/reference/rpc/)

### Send BTC to an Address

\`\`\`bash
bitcoin-cli sendtoaddress "ADDRESS" AMOUNT
\`\`\`

**Example:**

\`\`\`bash
bitcoin-cli sendtoaddress "bc1qxyz..." 0.01
\`\`\`

If your node requires RPC credentials:

\`\`\`bash
bitcoin-cli -rpcuser=user -rpcpassword=pass sendtoaddress "bc1qxyz..." 0.01
\`\`\`

### Raw Transaction Flow (Advanced)

If you want full control over the transaction:

1. \`createrawtransaction\` — Build the transaction skeleton
2. \`fundrawtransaction\` — Select inputs and calculate fee
3. \`signrawtransactionwithwallet\` — Sign with your wallet keys
4. \`sendrawtransaction\` — Broadcast to the network

### Useful Bitcoin CLI Commands

\`\`\`bash
bitcoin-cli getbalance              # Check wallet balance
bitcoin-cli listunspent             # List UTXOs
bitcoin-cli getwalletinfo           # Wallet overview
bitcoin-cli gettransaction "TXID"   # Look up a transaction
\`\`\`

### Fee Control

\`\`\`bash
# Send with a specific fee rate (sat/vByte)
bitcoin-cli -named sendtoaddress address="bc1q..." amount=0.01 fee_rate=10
\`\`\`

---

## 🟧 2. Monero (monero-wallet-cli)

**Source:** [Monero CLI guide](https://www.getmonero.org/resources/user-guides/monero-wallet-cli.html)

### Open Your Wallet

\`\`\`bash
monero-wallet-cli --wallet-file mywallet
\`\`\`

### Send XMR

\`\`\`bash
transfer ADDRESS AMOUNT
\`\`\`

**Example:**

\`\`\`bash
transfer 89a1... 1.25
\`\`\`

With priority (1=default, 2=fast, 3=fastest):

\`\`\`bash
transfer --priority 2 89a1... 1.25
\`\`\`

### Useful Monero Wallet Commands

\`\`\`bash
balance                             # Show balance
address                             # Show your wallet address
show_transfers                      # Transaction history
sweep_all ADDRESS                   # Send entire balance
\`\`\`

> **Note:** Monero requires a fully synced daemon (\`monerod\`) before transactions will broadcast. Always confirm your daemon is caught up before sending.

---

## 🟧 3. Ethereum / EVM Chains

### Using geth Console

\`\`\`bash
eth.sendTransaction({
  from: "0xYourAddr",
  to: "0xRecipient",
  value: web3.toWei(0.1, "ether")
})
\`\`\`

### Using curl + JSON-RPC

\`\`\`bash
curl -X POST --data '{
  "jsonrpc":"2.0",
  "method":"eth_sendTransaction",
  "params":[{
    "from":"0xYourAddr",
    "to":"0xRecipient",
    "value":"0x16345785D8A0000"
  }],
  "id":1
}' http://localhost:8545
\`\`\`

> The \`value\` field is in **wei** (hex). \`0x16345785D8A0000\` = 0.1 ETH.

### Using cast (Foundry — Recommended for Power Users)

[Foundry's cast](https://book.getfoundry.sh/cast/) is the cleanest modern EVM CLI tool:

\`\`\`bash
# Send ETH
cast send --private-key YOUR_PRIVATE_KEY 0xRecipient --value 0.1ether

# Check balance
cast balance 0xYourAddr

# Get gas price
cast gas-price
\`\`\`

---

## 🟧 4. Kaspa (kaspawallet CLI or RPC)

### Using kaspawallet

\`\`\`bash
kaspawallet send --address kaspa:q... --amount 10
\`\`\`

### Using RPC (curl)

\`\`\`bash
curl -d '{
  "jsonrpc":"2.0",
  "method":"sendTransaction",
  "params":{"to":"kaspa:q...","amount":10},
  "id":1
}' \\
  -H "Content-Type: application/json" \\
  http://127.0.0.1:16110
\`\`\`

### Check Kaspa Node Status

\`\`\`bash
curl -d '{"jsonrpc":"2.0","method":"getInfo","params":[],"id":1}' \\
  -H "Content-Type: application/json" \\
  http://127.0.0.1:16110
\`\`\`

---

## 🟧 5. General Pattern for Any Crypto CLI

Almost every blockchain follows this universal structure:

| Step | Command Type | Purpose |
|------|--------------|---------|
| 1 | Start daemon | Node must be running and synced |
| 2 | Unlock wallet | Some chains require explicit unlock |
| 3 | Send command | \`sendtoaddress\`, \`transfer\`, etc. |
| 4 | Confirm TX | Check mempool or block explorer |

### Common Pitfalls to Avoid

- **Daemon not synced** — Your transaction won't propagate if your node is behind. Always check sync status first.
- **Wrong address format** — Bitcoin uses Bech32 (\`bc1q...\`), Monero uses long alphanumeric strings, Kaspa uses \`kaspa:\` prefix. Never mix formats.
- **Insufficient fee** — Low fees cause stuck transactions. Bump fees with RBF (Bitcoin) or resend (Monero/Kaspa).
- **Wallet locked** — Some daemons require explicit unlocking before sending.
- **Testnet vs Mainnet** — Verify which network your daemon is on before sending real funds.

---

## 🔐 Security Notes for CLI Crypto Operations

1. **Never paste private keys into a terminal you don't fully control** — shell history logs commands.
2. **Use \`.env\` files or environment variables** for credentials — never hardcode them.
3. **Test with small amounts first** — CLI transactions are irreversible.
4. **Verify recipient addresses** — Always double-check the first 6 and last 6 characters.
5. **Run your own node** — Don't rely on public RPC endpoints for production sends.

---

## Summary Table

| Chain | CLI Tool | Send Command |
|-------|----------|-------------|
| Bitcoin | \`bitcoin-cli\` | \`sendtoaddress "addr" amount\` |
| Monero | \`monero-wallet-cli\` | \`transfer addr amount\` |
| Ethereum | \`geth\` / \`cast\` | \`eth.sendTransaction({...})\` |
| Kaspa | \`kaspawallet\` | \`send --address addr --amount n\` |
| Any EVM Chain | \`cast\` (Foundry) | \`cast send --value ...\` |

The command line is the most direct, scriptable, and automation-friendly way to interact with blockchain networks — once you know the right tool for the chain you're working with.`
  },
];

// Deduplicate by slug before exporting
const allPosts = [...BLOG_POSTS_1, ...BLOG_POSTS_2, ...BLOG_POSTS_3, ...BLOG_POSTS_4, ...BLOG_POSTS_5, ...BLOG_POSTS_6, ...BLOG_POSTS_7, ...BLOG_POSTS_8, ...BLOG_POSTS_9, ...BLOG_POSTS_10, ...BLOG_POSTS_11, ...BLOG_POSTS_12, ...BLOG_POSTS_13, ...BLOG_POSTS_14, ...BLOG_POSTS_15, ...BLOG_POSTS_16, ...BLOG_POSTS_17];
const seenSlugs = new Set();
export const BLOG_POSTS = allPosts.filter(p => {
  if (seenSlugs.has(p.slug)) return false;
  seenSlugs.add(p.slug);
  return true;
});

export const CATEGORIES = [
  { name: "All", count: BLOG_POSTS.length },
  { name: "Blockchain", count: BLOG_POSTS.filter(p => p.category === "Blockchain").length },
  { name: "Security", count: BLOG_POSTS.filter(p => p.category === "Security").length },
  { name: "Linux", count: BLOG_POSTS.filter(p => p.category === "Linux").length },
  { name: "Privacy", count: BLOG_POSTS.filter(p => p.category === "Privacy").length },
  { name: "Software", count: BLOG_POSTS.filter(p => p.category === "Software").length },
];

export const AUTHOR = {
  name: "Derrk Samuel",
  bio: "Web3, crypto, and Linux PC insights — practical guides, security tips, mining setups, blockchain tools, and decentralized tech strategies for techs.",
  blogs: [
    { name: "The Web3 Tech", url: "https://web3tech.site" },
    { name: "TechDerks Insights", url: "https://techderksinsights.blogspot.com" }
  ]
};