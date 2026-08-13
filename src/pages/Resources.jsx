import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Boxes, Shield, Terminal, Code, BookOpen, Globe, Network, Brain, Users, Wallet, Cpu } from "lucide-react";

const RESOURCE_GROUPS = [
  {
    icon: Boxes,
    title: "Blockchain & Web3",
    links: [
      { name: "Ethereum Docs", url: "https://ethereum.org/developers", desc: "Official Ethereum developer documentation." },
      { name: "Solidity Language", url: "https://docs.soliditylang.org", desc: "Smart contract programming language reference." },
      { name: "Ethers.js", url: "https://docs.ethers.org", desc: "JavaScript library for Ethereum interaction." },
      { name: "web3.js", url: "https://web3js.readthedocs.io", desc: "Ethereum JavaScript API and quorum extensions." },
      { name: "Foundry / Cast", url: "https://book.getfoundry.sh", desc: "Modern EVM development toolkit and CLI." },
      { name: "Hardhat", url: "https://hardhat.org", desc: "Ethereum development environment for professionals." },
      { name: "OpenZeppelin", url: "https://docs.openzeppelin.com", desc: "Audited smart contract libraries and security standards." },
      { name: "Kaspa WIKI", url: "https://kas.fyi", desc: "Kaspa protocol docs and node guides." },
      { name: "rusty-kaspa", url: "https://github.com/kaspanet/rusty-kaspa", desc: "Rust implementation of the Kaspa node." },
      { name: "Solana Web3.js", url: "https://solana-labs.github.io/solana-web3.js", desc: "Solana JavaScript SDK." },
      { name: "Solana Docs", url: "https://docs.solana.com", desc: "Official Solana developer documentation." },
      { name: "TRON / SunSwap", url: "https://developers.tron.network", desc: "TRON network developer docs and DEX guides." },
      { name: "Etherscan", url: "https://etherscan.io", desc: "Ethereum block explorer and contract verification." },
      { name: "Chainlink", url: "https://docs.chain.link", desc: "Decentralized oracle networks and data feeds." },
      { name: "The Graph", url: "https://thegraph.com/docs", desc: "Indexing and querying blockchain data with GraphQL." },
      { name: "IPFS Docs", url: "https://docs.ipfs.tech", desc: "InterPlanetary File System documentation." },
      { name: "Filecoin", url: "https://docs.filecoin.io", desc: "Decentralized storage network built on IPFS." },
      { name: "Arweave", url: "https://docs.arweave.org", desc: "Permanent, decentralized data storage." },
      { name: "Hardhat Toolbox", url: "https://hardhat.org/hardhat-toolbox", desc: "Bundled Hardhat plugins for testing and deployment." },
    ],
  },
  {
    icon: Wallet,
    title: "Crypto Utilities & Wallets",
    links: [
      { name: "Bitcoin Core", url: "https://bitcoincore.org", desc: "Reference Bitcoin client and full-node docs." },
      { name: "Monero", url: "https://www.getmonero.org/resources/developer-guides", desc: "Monero developer guides and CLI reference." },
      { name: "kaspawallet CLI", url: "https://github.com/kaspanet/rusty-kaspa#wallet", desc: "Command-line Kaspa wallet for sending transactions." },
      { name: "MetaMask", url: "https://metamask.io", desc: "Browser wallet for Ethereum and EVM chains." },
      { name: "Rabby Wallet", url: "https://rabby.io", desc: "Multi-chain wallet with clear transaction previews." },
      { name: "CoinGecko", url: "https://www.coingecko.com", desc: "Crypto prices, market caps, and on-chain stats." },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", desc: "Cryptocurrency market data and rankings." },
      { name: "DefiLlama", url: "https://defillama.com", desc: "Total value locked and DeFi protocol analytics." },
      { name: "Dune Analytics", url: "https://dune.com", desc: "Build and share SQL queries over blockchain data." },
      { name: "Gas Now", url: "https://ethgasstation.info", desc: "Real-time Ethereum gas price tracker." },
      { name: "Etherscan Gas Tracker", url: "https://etherscan.io/gastracker", desc: "Live Ethereum gas fees and historical charts." },
      { name: "revoke.cash", url: "https://revoke.cash", desc: "Review and revoke token spend approvals." },
      { name: "DeBank", url: "https://debank.com", desc: "Portfolio tracker across DeFi protocols and chains." },
      { name: "Zapper", url: "https://zapper.fi", desc: "Track wallets, DeFi positions, and NFTs in one dashboard." },
      { name: "Grass.io", url: "https://grass.io", desc: "Earn crypto by sharing unused internet bandwidth." },
    ],
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    links: [
      { name: "Tails OS", url: "https://tails.net", desc: "Amnesic incognito live operating system." },
      { name: "Tor Project", url: "https://www.torproject.org", desc: "Anonymous browsing and the Tor network." },
      { name: "VirusTotal", url: "https://www.virustotal.com", desc: "Scan files and URLs against dozens of engines." },
      { name: "Shodan", url: "https://www.shodan.io", desc: "Search engine for internet-connected devices." },
      { name: "Censys", url: "https://search.censys.io", desc: "Internet-wide scanning and asset discovery." },
      { name: "Have I Been Pwned", url: "https://haveibeenpwned.com", desc: "Check if your email appears in data breaches." },
      { name: "Google Advanced Protection", url: "https://landing.google.com/advancedprotection", desc: "Strongest Google account security for high-risk users." },
      { name: "OWASP", url: "https://owasp.org", desc: "Open Web Application Security Project resources." },
      { name: "MITRE ATT&CK", url: "https://attack.mitre.org", desc: "Adversary tactics and techniques knowledge base." },
      { name: "CVE Database", url: "https://cve.mitre.org", desc: "Common Vulnerabilities and Exposures catalog." },
      { name: "NIST Cybersecurity", url: "https://www.nist.gov/cyberframework", desc: "NIST cybersecurity framework and guidelines." },
      { name: "CISA Alerts", url: "https://www.cisa.gov/news-events/cybersecurity-advisories", desc: "US cyber agency advisories and bulletins." },
      { name: "AbuseIPDB", url: "https://www.abuseipdb.com", desc: "Check and report malicious IP addresses." },
      { name: "URLScan.io", url: "https://urlscan.io", desc: "Scan and analyze suspicious websites safely." },
      { name: "Hybrid Analysis", url: "https://www.hybrid-analysis.com", desc: "Free malware analysis service with sandbox." },
      { name: "Kali Linux", url: "https://www.kali.org", desc: "Penetration testing and security auditing distro." },
      { name: "Samsung Knox", url: "https://www.samsungknox.com", desc: "Defense-grade mobile security for Galaxy devices." },
    ],
  },
  {
    icon: Terminal,
    title: "Linux & DevOps",
    links: [
      { name: "Ubuntu Documentation", url: "https://help.ubuntu.com", desc: "Official Ubuntu server and desktop guides." },
      { name: "Debian Reference", url: "https://www.debian.org/doc", desc: "Debian system administration manual." },
      { name: "Arch Wiki", url: "https://wiki.archlinux.org", desc: "In-depth Linux knowledge applicable to any distro." },
      { name: "Docker Docs", url: "https://docs.docker.com", desc: "Containerization engine and Compose reference." },
      { name: "Docker Hub", url: "https://hub.docker.com", desc: "Container image registry and official images." },
      { name: "systemd man pages", url: "https://www.freedesktop.org/software/systemd/man", desc: "Linux service management reference." },
      { name: "UFW — Uncomplicated Firewall", url: "https://help.ubuntu.com/community/UFW", desc: "Simple firewall configuration for Ubuntu." },
      { name: "Nginx Documentation", url: "https://nginx.org/en/docs", desc: "Web server, reverse proxy, and load balancer." },
      { name: "Let's Encrypt", url: "https://letsencrypt.org", desc: "Free TLS/SSL certificates via certbot." },
      { name: "Certbot", url: "https://certbot.eff.org", desc: "Automate Let's Encrypt certificate issuance." },
      { name: "fail2ban", url: "https://github.com/fail2ban/fail2ban", desc: "Ban IPs that show malicious signs in logs." },
      { name: "tmux", url: "https://github.com/tmux/tmux/wiki", desc: "Terminal multiplexer for persistent sessions." },
      { name: "GNU Bash Manual", url: "https://www.gnu.org/software/bash/manual", desc: "Bash shell reference and scripting guide." },
      { name: "Linux Man Pages Online", url: "https://man7.org/linux/man-pages", desc: "Searchable Linux programmer manual pages." },
      { name: "Proxmox VE", url: "https://www.proxmox.com/en/proxmox-ve", desc: "Open-source virtualization and container management." },
      { name: "Cockpit Project", url: "https://cockpit-project.org", desc: "Web-based graphical Linux server admin." },
    ],
  },
  {
    icon: Code,
    title: "Developer Tools",
    links: [
      { name: "Base44", url: "https://base44.com", desc: "Backend-as-a-service for building apps fast." },
      { name: "GitHub", url: "https://github.com", desc: "Code hosting, version control, and CI/CD." },
      { name: "GitLab", url: "https://gitlab.com", desc: "DevOps platform with CI/CD and registries." },
      { name: "Bitbucket", url: "https://bitbucket.org", desc: "Git code hosting with Jira integration." },
      { name: "Obsidian", url: "https://obsidian.md", desc: "Local-first Markdown knowledge base." },
      { name: "Rufus", url: "https://rufus.ie", desc: "Create bootable USB drives on Windows." },
      { name: "BalenaEtcher", url: "https://etcher.balena.io", desc: "Flash OS images to SD cards and USB drives." },
      { name: "MajorGeeks", url: "https://www.majorgeeks.com", desc: "Trusted source for free Windows software." },
      { name: "VS Code", url: "https://code.visualstudio.com/docs", desc: "Microsoft code editor documentation." },
      { name: "Neovim", url: "https://neovim.io", desc: "Modern, extensible terminal text editor." },
      { name: "Postman", url: "https://www.postman.com", desc: "API development and testing workbench." },
      { name: "Insomnia", url: "https://insomnia.rest", desc: "Open-source API client and design tool." },
      { name: "Vite", url: "https://vite.dev", desc: "Next-generation frontend build tooling." },
      { name: "React Docs", url: "https://react.dev", desc: "Official React documentation and tutorials." },
      { name: "Tailwind CSS", url: "https://tailwindcss.com/docs", desc: "Utility-first CSS framework reference." },
      { name: "shadcn/ui", url: "https://ui.shadcn.com", desc: "Reusable component library for React." },
      { name: "regex101", url: "https://regex101.com", desc: "Build and debug regular expressions with explanations." },
      { name: "DevDocs", url: "https://devdocs.io", desc: "Combined, searchable API documentation." },
    ],
  },
  {
    icon: Network,
    title: "Networking & Infrastructure",
    links: [
      { name: "Cloudflare", url: "https://www.cloudflare.com", desc: "CDN, DNS, DDoS protection, and edge workers." },
      { name: "Hetzner Cloud", url: "https://www.hetzner.com/cloud", desc: "Affordable European VPS and bare-metal hosting." },
      { name: "DigitalOcean", url: "https://www.digitalocean.com", desc: "Developer-friendly cloud droplets and apps." },
      { name: "Linode / Akamai", url: "https://www.linode.com", desc: "Linux cloud computing and storage." },
      { name: "Tailscale", url: "https://tailscale.com", desc: "Zero-config WireGuard mesh VPN." },
      { name: "WireGuard", url: "https://www.wireguard.com", desc: "Fast, modern VPN protocol." },
      { name: "Pi-hole", url: "https://pi-hole.net", desc: "Network-wide ad blocking DNS sinkhole." },
      { name: "NextDNS", url: "https://nextdns.io", desc: "Cloud-based DNS filtering and privacy." },
      { name: "Fastly", url: "https://www.fastly.com", desc: "Edge cloud and content delivery network." },
      { name: "UptimeRobot", url: "https://uptimerobot.com", desc: "Free uptime monitoring and alerts." },
      { name: "ntop", url: "https://www.ntop.org", desc: "Network traffic monitoring and analysis." },
    ],
  },
  {
    icon: Brain,
    title: "AI & LLM Tools",
    links: [
      { name: "OpenAI Platform", url: "https://platform.openai.com/docs", desc: "GPT models, embeddings, and API reference." },
      { name: "Anthropic API", url: "https://docs.anthropic.com", desc: "Claude model documentation and guides." },
      { name: "Google Gemini", url: "https://ai.google.dev", desc: "Gemini models and AI APIs." },
      { name: "LangChain", url: "https://python.langchain.com", desc: "Framework for LLM-powered applications." },
      { name: "LlamaIndex", url: "https://docs.llamaindex.ai", desc: "Data framework for RAG and agents." },
      { name: "Ollama", url: "https://ollama.com", desc: "Run LLMs locally on your own machine." },
      { name: "Hugging Face", url: "https://huggingface.co", desc: "Model hub, datasets, and Spaces demos." },
      { name: "MCP Specification", url: "https://modelcontextprotocol.io", desc: "Model Context Protocol for tool-using agents." },
      { name: "Semantic Kernel", url: "https://learn.microsoft.com/semantic-kernel", desc: "Microsoft SDK for AI orchestration." },
      { name: "Pinecone", url: "https://www.pinecone.io", desc: "Vector database for semantic search." },
    ],
  },
  {
    icon: Users,
    title: "Community & News",
    links: [
      { name: "Hacker News", url: "https://news.ycombinator.com", desc: "Tech and startup community discussion." },
      { name: "Reddit / r/CryptoCurrency", url: "https://www.reddit.com/r/CryptoCurrency", desc: "Crypto community news and discussion." },
      { name: "Reddit / r/ethdev", url: "https://www.reddit.com/r/ethdev", desc: "Ethereum developer community." },
      { name: "Stack Overflow", url: "https://stackoverflow.com", desc: "Q&A for programming and tooling." },
      { name: "Ethereum Stack Exchange", url: "https://ethereum.stackexchange.com", desc: "Q&A for Solidity and Ethereum development." },
      { name: "Dev.to", url: "https://dev.to", desc: "Community blog platform for developers." },
      { name: "Hashnode", url: "https://hashnode.com", desc: "Developer blogging community." },
      { name: "Coindesk", url: "https://www.coindesk.com", desc: "Crypto and blockchain news." },
      { name: "The Block", url: "https://www.theblock.co", desc: "Crypto research, data, and news." },
      { name: "Kaspa Discord", url: "https://discord.gg/kaspa", desc: "Official Kaspa community chat." },
    ],
  },
  {
    icon: BookOpen,
    title: "Learning & Docs",
    links: [
      { name: "Alison", url: "https://alison.com", desc: "Free online courses with certificates." },
      { name: "freeCodeCamp", url: "https://www.freecodecamp.org", desc: "Free coding bootcamp with certifications." },
      { name: "The Odin Project", url: "https://www.theodinproject.com", desc: "Full-stack web development curriculum." },
      { name: "MDN Web Docs", url: "https://developer.mozilla.org", desc: "Mozilla web standards and API reference." },
      { name: "W3Schools", url: "https://www.w3schools.com", desc: "Beginner-friendly web tutorials." },
      { name: "Khan Academy", url: "https://www.khanacademy.org/computing", desc: "Free computer science and math courses." },
      { name: "Coursera", url: "https://www.coursera.org", desc: "University courses and specializations." },
      { name: "edX", url: "https://www.edx.org", desc: "Free and paid university-level courses." },
      { name: "CryptoZombies", url: "https://cryptozombies.io", desc: "Learn Solidity by building a zombie game." },
      { name: "Buildspace", url: "https://buildspace.so", desc: "Project-based Web3 and AI learning." },
      { name: "Protocol Berg", url: "https://protocol.cspr.io", desc: "Protocol-level blockchain engineering resources." },
      { name: "Rust Book", url: "https://doc.rust-lang.org/book", desc: "Official guide to the Rust programming language." },
      { name: "Learn You a Haskell", url: "http://learnyouahaskell.com", desc: "Friendly introduction to functional programming." },
      { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu", desc: "Free MIT course materials online." },
      { name: "Roadmap.sh", url: "https://roadmap.sh", desc: "Career learning roadmaps for developers." },
    ],
  },
];

export default function Resources() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Resources</h1>
          <p className="text-muted-foreground max-w-lg">
            A curated list of Web3 tools, developer websites, and documentation we reference and recommend. All links open in a new tab.
          </p>
        </div>

        <div className="space-y-8">
          {RESOURCE_GROUPS.map((group, gi) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h2 className="font-heading font-bold text-lg text-foreground">{group.title}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {group.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/40 hover:bg-card transition-all group"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{link.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{link.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}