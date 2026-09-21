// Glossary terms for the /glossary SEO hub page. Each term links to the
// post whose slug it names — terms whose slug no longer exists in the
// corpus are filtered out at render time, so links never break.
export const GLOSSARY_TERMS = [
  {
    term: "Advanced Protection Program",
    slug: "benefits-google-advanced-protection-program",
    definition:
      "Google's strongest account-security tier. It enforces sign-in with security keys or passkeys, blocks unverified third-party apps, and deep-scans every Chrome download.",
  },
  {
    term: "apt",
    slug: "update-upgrade-debian-linux-full-guide",
    definition:
      "The package manager at the core of Debian and Ubuntu. `apt update` refreshes the list of available software; `apt upgrade` installs the newer versions.",
  },
  {
    term: "Debian",
    slug: "install-debian-persistent-live-usb-rufus-guide",
    definition:
      "One of the oldest and most influential Linux distributions, and the foundation Ubuntu is built on. Its Live images can even run from a USB with persistent storage.",
  },
  {
    term: "DiskPart",
    slug: "diskpart-full-wipe-partition-format-script",
    definition:
      "Windows' built-in command-line tool for wiping, partitioning, and formatting drives. It never asks for confirmation, so always verify the disk number with `list disk` first.",
  },
  {
    term: "Docker",
    slug: "docker-container-logs-linux-guide",
    definition:
      "A container platform that packages an application together with its dependencies so it runs identically on any machine. Containers isolate software from the host system.",
  },
  {
    term: "Docker Compose",
    slug: "fix-unable-to-locate-docker-compose-plugin-linux-debian",
    definition:
      "A Docker companion tool for defining whole multi-container applications in a single YAML file — one `docker compose up` starts the entire stack.",
  },
  {
    term: "eVTOL",
    slug: "doroni-h1-x-personal-evtol-review-investor-questions",
    definition:
      "Electric vertical takeoff and landing aircraft — the \"flying car\" category. These aircraft take off and land like drones, then cruise forward like small planes.",
  },
  {
    term: "Ethereum",
    slug: "ethereum-node-docker-geth-setup-guide",
    definition:
      "The largest smart-contract blockchain. Running your own node means you verify transactions yourself instead of trusting someone else's RPC endpoint.",
  },
  {
    term: "ext4",
    slug: "format-ssd-debian-linux-ext4-gparted-cli",
    definition:
      "The standard, most reliable filesystem for Linux drives. On SSDs, pair it with TRIM and the `noatime` mount option to keep the drive fast and healthy.",
  },
  {
    term: "Geth",
    slug: "ethereum-node-docker-geth-setup-guide",
    definition:
      "Go-Ethereum, the most widely used Ethereum client. It ships as the `ethereum/client-go` Docker image, so a full node is one `docker run` away.",
  },
  {
    term: "GitHub Pages",
    slug: "ai-generated-website-github-pages-deploy-guide",
    definition:
      "Free static website hosting served straight from a GitHub repository on a global CDN. Any repo of plain HTML, CSS, and JavaScript can be live in minutes.",
  },
  {
    term: "GPT",
    slug: "manual-partitioning-ubuntu-20-04-uefi-gpt-guide",
    definition:
      "GUID Partition Table — the modern disk-partitioning standard. It is required for UEFI booting and for drives larger than 2TB.",
  },
  {
    term: "Have I Been Pwned",
    slug: "hidden-cybersecurity-toolkit-5-resources-pros",
    definition:
      "A free database where you can check whether your email address has appeared in a known data breach. Its Domain Search tool watches every address on a company domain.",
  },
  {
    term: "IceRiver KS3M",
    slug: "best-step-up-transformer-iceriver-ks3m-miner",
    definition:
      "A Kaspa ASIC miner that pulls roughly 3200W at 180–285V AC. On US 110–120V power, it needs a copper-coil step-up transformer on its own dedicated circuit.",
  },
  {
    term: "Kali Linux",
    slug: "install-kali-linux-wsl2-windows-11-win-kex-gui",
    definition:
      "The security-testing Linux distribution, loaded with tools like nmap, Wireshark, and Metasploit. It runs on bare metal, in VMs, or inside WSL2 with the Win-KeX GUI.",
  },
  {
    term: "Kaspa",
    slug: "run-kaspa-rust-node-ubuntu-rpc",
    definition:
      "A proof-of-work blockchain built on the GHOSTDAG protocol, which lets blocks be mined in parallel instead of one at a time. The Rust node (kaspad) runs it.",
  },
  {
    term: "Monero",
    slug: "send-crypto-command-line-cli-guide",
    definition:
      "The privacy-focused cryptocurrency with untraceable transactions. Its CLI wallet, `monero-wallet-cli`, sends funds straight from the terminal with a simple `transfer` command.",
  },
  {
    term: "Shodan",
    slug: "hidden-cybersecurity-toolkit-5-resources-pros",
    definition:
      "A search engine for internet-connected devices — webcams, routers, servers, and control systems. Security pros use it to see exactly what a network exposes publicly.",
  },
  {
    term: "Smart Contract",
    slug: "interact-deployed-smart-contract-any-network",
    definition:
      "A program deployed to a blockchain that runs exactly as written, with no owner able to change it after deployment. Reads are free; writes are transactions that cost gas.",
  },
  {
    term: "Snap",
    slug: "manually-update-snap-store-ubuntu-20-04",
    definition:
      "Ubuntu's containerized package format. Snaps update in the background, so refreshing a stubborn snap like the Snap Store means stopping its processes first.",
  },
  {
    term: "Stratum Bridge",
    slug: "kaspa-stratum-bridge-docker-environment-variables",
    definition:
      "Software that translates between a mining pool's Stratum protocol and your own node, letting ASIC miners point directly at your Kaspa setup instead of a public pool.",
  },
  {
    term: "systemd",
    slug: "restart-x-server-ubuntu-display-manager",
    definition:
      "The service and init manager on modern Linux distributions. `systemctl restart` (or `start` and `stop`) is how you control nearly everything the system runs.",
  },
  {
    term: "TailsOS",
    slug: "tailsos-bootable-usb-persistent-storage-full-guide",
    definition:
      "The amnesic privacy operating system that routes all traffic through Tor and leaves no trace on the host machine. Encrypted persistent storage lets chosen files survive reboots.",
  },
  {
    term: "TTY",
    slug: "switch-gui-to-terminal-tty-ubuntu",
    definition:
      "A text-only virtual console on a Linux desktop. When the GUI freezes, Ctrl+Alt+F3 drops you into one with full command-line access to fix things.",
  },
  {
    term: "UEFI",
    slug: "manual-partitioning-ubuntu-20-04-uefi-gpt-guide",
    definition:
      "The modern firmware standard that replaced the BIOS. It boots from GPT-partitioned disks and requires a small FAT32 EFI System Partition.",
  },
  {
    term: "Win-KeX",
    slug: "install-kali-linux-wsl2-windows-11-win-kex-gui",
    definition:
      "The Kali Desktop Experience for Windows — `kex --win` opens a full Kali Linux GUI window from inside WSL2, no dual boot needed.",
  },
  {
    term: "X Server",
    slug: "restart-x-server-ubuntu-display-manager",
    definition:
      "The program that draws the Linux graphical desktop. When the GUI hangs, restarting the display manager with `systemctl restart display-manager` usually revives it.",
  },
  {
    term: "XDG",
    slug: "ubuntu-change-default-storage-locations-downloads-documents",
    definition:
      "The freedesktop standard that defines Linux default folders like Downloads and Documents. `xdg-user-dirs-update --set` moves them to any drive you choose.",
  },
];