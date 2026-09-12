// Blog posts 21 — Snarfing / evil twin attacks guide
export const BLOG_POSTS_21 = [
  {
    id: "snarfing-evil-twin-attacks-explained",
    slug: "snarfing-evil-twin-attacks-explained",
    title: "Snarfing Explained — How Evil Twin Access Points Steal Hotspot Credentials",
    excerpt: "Snarfing is the art of standing up a fake Wi-Fi hotspot with a captive portal that harvests logins. Here's exactly how an evil twin attack works, why your DNS settings don't protect you, and how to spot one before you type a password.",
    date: "2026-09-12",
    author: "Derrk Samuel",
    category: "Security",
    tags: ["Snarfing", "Evil Twin", "Wi-Fi Security", "Captive Portal", "AirSnarf", "Cybersecurity", "Wireless", "Phishing"],
    readTime: "11 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/1c400246c_generated_image.png",
    content: `## What Is Snarfing?

**Snarfing** is the wireless cousin of phishing. Instead of emailing you a fake login page, the attacker *becomes the network you connect to* — spinning up a rogue wireless hotspot that impersonates a legitimate one, then quietly harvesting whatever credentials you hand over.

The classic example of a snarf is the **evil twin attack**: using a simple shell script running software like [AirSnarf](https://en.wikipedia.org/wiki/Evil_twin_(wireless_networks)) to create a wireless hotspot complete with a **captive portal** — that "please log in to continue" page you see in airports, hotels, and coffee shops.

Wireless clients that associate to a snarf access point receive an IP address, DNS, and a default gateway, and appear completely normal. But every DNS query the client makes resolves to the attacker's machine, regardless of the client's DNS settings — so any website the victim attempts to visit brings up the attacker's "splash page," politely requesting a username and password. The credentials entered by unsuspecting users are then **mailed to root@localhost**.

> **One sentence:** a snarf is a fake hotspot with a fake login page, and it works because your laptop can't tell the difference between the real network and the twin.

### Why It Actually Works

The attack succeeds for exactly two reasons:

1. **Legitimate access points can be impersonated and/or drowned out by rogue access points.** Wi-Fi has no built-in way for a client to verify that an AP named \`Airport_Free_WiFi\` belongs to the airport. A rogue AP with a stronger signal — or one that deauthenticates clients from the real AP — wins the connection race.
2. **Users without a means to validate the authenticity of access points will nevertheless give up their hotspot credentials when asked for them.** Decades of captive-portal training have conditioned people to type usernames and passwords into whatever login box appears the moment they join public Wi-Fi.

---

## Anatomy of a Snarf: The Attack Chain

Here's what actually happens when a victim connects to an evil twin, step by step:

| Stage | What the attacker does | What the victim sees |
|---|---|---|
| 1. Beacon | Rogue AP broadcasts an SSID identical (or near-identical) to the real one | A familiar network name in the Wi-Fi list |
| 2. Association | Victim connects (often automatically, via a saved-network profile) | "Connected" — with full signal bars |
| 3. DHCP | Rogue AP hands out an IP, DNS server, and default gateway | Everything looks normal; no warnings |
| 4. DNS hijack | All DNS queries resolve to the attacker's IP | Typing any URL "works" |
| 5. Captive portal | Every HTTP request lands on the fake splash page | A login form asking for credentials |
| 6. Credential capture | Submitted username/password is stored (in the classic example, mailed to \`root@localhost\`) | "Welcome!" — often granted real internet afterward so nothing seems wrong |

The genius of the last step is that many snarfs then proxy the victim onto the real internet. The victim browses happily, never knowing their credentials were just harvested. If those credentials are reused on email, banking, or corporate VPNs, the attacker is already inside.

### The Evil Twin vs. a Plain Rogue AP

Not every rogue access point is a snarf — the distinction matters:

- A **rogue AP** is any unauthorized access point. It might be an attacker's, or just an employee's pocket router.
- An **evil twin** is a rogue AP that *specifically impersonates* a legitimate one, typically cloning the SSID and sometimes spoofing the MAC address.
- A **snarf** is an evil twin whose *purpose* is credential harvesting via a fake captive portal.

---

## Why Your DNS Settings Don't Save You

This is the part that surprises people: the victim's device can be configured with any DNS server they like — \`1.1.1.1\`, \`8.8.8.8\`, a custom resolver — and it makes no difference.

Why? Because on a Wi-Fi network, DNS queries are just packets, and **every packet leaving the client passes through the attacker's machine**. The snarf doesn't need to respect your DNS configuration. It simply intercepts outbound UDP/53 traffic and answers it itself, or points its own DHCP-supplied DNS at a resolver it controls. Your device asked \`1.1.1.1\` for \`example.com\` — the attacker answered *before* the real resolver ever saw the query.

You can watch this class of behavior from the client side. On Linux, check who your machine actually believes is the gateway and DNS server:

\`\`\`bash
ip route show default
\`\`\`

\`\`\`bash
resolvectl status
\`\`\`

And compare what DNS answers you're getting against a known-good network:

\`\`\`bash
dig +short example.com
\`\`\`

\`\`\`bash
nslookup example.com 1.1.1.1
\`\`\`

> **Callout:** On a snarf, \`dig\` and \`nslookup\` will happily return the attacker's IP for *every* domain. The tool isn't lying — the network underneath it is.

One defense does survive the DNS hijack: **DNS over HTTPS (DoH)** or **DNS over TLS (DoT)**, which encrypts the query inside a TLS session the snarf can't forge or rewrite (though the attacker can still block it entirely, which is its own telltale).

---

## The AirSnarf Example, Deconstructed

The original AirSnarf-style setup is a useful teaching model because it's so small. Stripped to its bones, a snarf needs only four components:

1. **A hostapd-based access point** — turns any Linux machine with a monitor-capable Wi-Fi card into a base station:

\`\`\`bash
sudo apt install hostapd dnsmasq
\`\`\`

\`\`\`ini
# /etc/hostapd/hostapd.conf (hostapd.conf)
interface=wlan0
driver=nl80211
ssid=Airport_Free_WiFi
channel=6
auth_algs=1
\`\`\`

2. **A DHCP + DNS layer** — traditionally dnsmasq, handing out IPs and answering every DNS query with the attacker's own address:

\`\`\`ini
# dnsmasq.conf — answer ALL queries with this machine's IP
interface=wlan0
dhcp-range=192.168.7.10,192.168.7.150,12h
address=/#/192.168.7.1
\`\`\`

The \`address=/#/...\` wildcard is the whole DNS hijack in one line — *every* hostname, regardless of the client's configured resolver, points at the snarf.

3. **A web server with a captive portal** — a simple login page (often a pixel-perfect clone of the venue's real portal, or a generic "Wi-Fi Services" page) whose form POST handler writes the submitted credentials to a file — in the classic telling, mailing them to \`root@localhost\`.

4. **Traffic forwarding** — so that after "login," the victim gets working internet and suspicion evaporates:

\`\`\`bash
sudo sysctl -w net.ipv4.ip_forward=1
\`\`\`

That's the entire attack: a shell script's worth of moving parts, and it defeats anyone who connects without a second thought.

> **Ethics and legality:** Running a snarf against people who haven't consented is a crime in most jurisdictions — it's unauthorized access to a computer system and wire fraud, not a prank. The only legitimate uses are on hardware you own or on a lab network with explicit authorization (your own gear, a pentest engagement with a signed scope, or a training range).

---

## How to Detect an Evil Twin Before You Log In

You can't fully validate an AP from a phone, but you can catch most snarfs with a few cheap checks — especially on Linux, where the tools are built in.

### 1. Enumerate the networks around you and their BSSIDs

\`\`\`bash
sudo iwlist wlan0 scan | grep -E "ESSID|Address|Quality"
\`\`\`

If the *same SSID* is being broadcast by **multiple BSSIDs (MAC addresses) at once**, one of them may be a twin. Legitimate enterprise Wi-Fi uses multiple APs too — but a hotel or café rarely does. Note which BSSID you're associated with:

\`\`\`bash
iwgetid -a
\`\`\`

### 2. Check where your traffic is actually going

\`\`\`bash
ip route show default
\`\`\`

\`\`\`bash
ip neigh show
\`\`\`

If the default gateway's MAC address doesn't match the AP you associated with — or changes mid-session — you have a man-in-the-middle.

### 3. Verify DNS is behaving

Compare a domain's resolution against what it resolves to on a trusted network (e.g., mobile hotspot):

\`\`\`bash
dig +short web3tech.site
\`\`\`

If *every* domain resolves to one IP — the captive-portal trick — you're on a snarf.

### 4. Trust the certificate warnings

A snarf that tries to intercept HTTPS traffic must present a certificate for the target site, which the real certificate authority won't sign. If your browser throws a certificate error on public Wi-Fi, **do not click through it.** That warning is often the only honest thing on the network.

### Quick-reference: Red Flags on Public Wi-Fi

| Red flag | What it means |
|---|---|
| Two APs with the same SSID, one much stronger | Possible twin drowning out the real AP |
| \`dig\` returns the same IP for every domain | DNS hijack — you are on the portal |
| Certificate warnings on well-known HTTPS sites | Traffic interception in progress |
| Gateway MAC differs from the associated AP's BSSID | Traffic is being bridged through a third machine |
| Login page on plain **http://** asking for sensitive credentials | Credentials are being sent in cleartext — possibly to the attacker |

---

## Defenses That Actually Work

### For users

- **Use a VPN on any network you don't control.** A VPN creates an encrypted tunnel *before* your traffic touches the snarf's interception layer. The attacker still sees you connect, but your credentials and session content stay sealed. Turn it on *before* you interact with any captive portal.
- **Prefer mobile tethering over public Wi-Fi** for anything that matters. Cellular data has no twin attack.
- **Never reuse credentials** on hotspot portals. The password you type into an airport splash page should exist nowhere else in your life.
- **Treat every captive portal as hostile by default.** A legitimate portal never needs your email password — only venues should ask for venue credentials.
- **Use HTTPS-everywhere / encrypted DNS (DoH)** so the hijack has less to grab.

### For network operators

If you run the public Wi-Fi, starve the attack of victims:

- **Deploy 802.1X (WPA2/WPA3-Enterprise)** — per-user authentication makes AP impersonation fail hard, because the twin can't complete the RADIUS handshake.
- **Monitor for rogue SSIDs and unknown BSSIDs** in your environment — wireless IDS tools and many enterprise APs flag duplicate-SSID broadcasts automatically.
- **Never put a login form on plain HTTP.** Serve your captive portal over TLS with a valid certificate, and train users that real portals are HTTPS.
- **Reduce portal dependence.** Every password prompt you eliminate is a credential a snarf can't harvest — consider open access with bandwidth limits instead of password-gated Wi-Fi.

> **Callout:** The two reasons a snarf works — impersonatable APs and credulous users — are only fixable at the protocol level (802.1X) and the habit level (VPN + no credential reuse). Neither is fixable after the victim hits Submit.

---

## Snarfing in Context: Related Attacks

The evil twin sits in a family of wireless attacks worth knowing by name:

| Attack | Mechanism | Difference from a snarf |
|---|---|---|
| **Evil twin** | Rogue AP impersonating a legitimate one | The delivery vehicle; a snarf is its credential-harvesting payload |
| **Karma / MANA attack** | Rogue AP that *responds to* the victim's saved-network probe requests, impersonating any network the device has saved | No fake SSID needed — it exploits your laptop's memory of past networks |
| **Wi-Fi phishing** | Captive portal page cloned from a real brand (hotel chain, airline) | Focuses on the page; can ride on an evil twin or a compromised network |
| **KRACK (2017)** | Vulnerability in the WPA2 4-way handshake | Protocol-level decryption, not credential theft — fixed by patches |
| **DEAUTH + twin combo** | Floods the real AP with deauthentication frames to force clients onto the twin | The "drowning out" step that makes the twin win the race |

---

## The Takeaway

Snarfing endures because it exploits the trust architecture of public Wi-Fi itself — a network where the client has **no mechanism to authenticate the access point**, and users have **years of training to type credentials into unexplained login pages**. A $30 Wi-Fi card, dnsmasq's one-line wildcard DNS, and a cloned portal are all it takes.

Your defense is behavioral, not technical: VPN before portal, unique throwaway credentials for hotspot logins, mobile data for anything sensitive, and a reflexive distrust of any network that asks for a password over HTTP. The snarf only works on the second reason it needs — a user who gives up credentials when asked. Don't be that user.`
  },
];