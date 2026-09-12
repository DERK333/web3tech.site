// Blog posts 20 — Google dorking guide
export const BLOG_POSTS_20 = [
  {
    id: "google-dorking-advanced-search-operators",
    slug: "google-dorking-advanced-search-operators-guide",
    title: "Google Dorking Explained — How to Search Like a Security Pro (With Tons of Examples)",
    excerpt: "Google dorking turns ordinary Google searches into precision queries that cut through millions of irrelevant results. Learn what it is, every operator that matters, and dozens of copy-paste examples you can use today.",
    date: "2026-09-12",
    author: "Derrk Samuel",
    category: "Security",
    tags: ["Google Dorking", "OSINT", "Search Operators", "Cybersecurity", "Recon", "Google Hacking", "Security"],
    readTime: "12 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/fe6e4541c_generated_image.png",
    content: `## What Is Google Dorking?

**Google dorking** (also called *Google hacking*) is the practice of using Google's advanced search operators to find very specific information that a normal search would bury under millions of irrelevant results.

A "dork" is just a search query that uses special operators — like \`site:\`, \`filetype:\`, or \`intitle:\` — to tell Google exactly what you want, where you want it, and in what form. Google then filters its entire index down to results that match *every* condition you set.

The technique became famous in the security world when Johnny Long cataloged thousands of these queries into the **Google Hacking Database (GHDB)**, showing that search engines had quietly indexed login portals, exposed documents, and even camera control panels that nobody meant to make public.

> **The core idea in one sentence:** instead of asking Google "what pages mention X," you ask Google "show me only pages that contain X, in the title, on this specific site, in this file type, excluding everything else."

### Is It Legal?

Yes — searching is legal. You are only querying Google's public index, not breaking into anything. What matters is what you *do* with what you find:

- ✅ **Fine:** dorking your own sites, researching publicly available info, OSINT investigations, authorized security assessments
- ❌ **Not fine:** accessing files or systems you're not authorized to access, harvesting personal data, attacking endpoints you find

Finding an exposed door is not a crime. Walking through it is. If you discover a real security issue on someone else's site, the ethical move is to report it to the owner — not exploit it.

---

## The Operators You Need to Know

Think of these as filters. Each one narrows the results, and they stack — the more you use, the sharper the result set.

### \`site:\` — Restrict to One Domain

Only show results from a specific website.

\`\`\`text
site:web3tech.site docker
\`\`\`

Finds every page on web3tech.site that mentions Docker. Use it without keywords to enumerate what Google has indexed for a domain:

\`\`\`text
site:web3tech.site
\`\`\`

You can also exclude a subdomain by putting a minus in front:

\`\`\`text
site:web3tech.site -site:blog.web3tech.site
\`\`\`

### \`filetype:\` — Only One File Type

Returns results of a specific file format. This is one of the most powerful dorking operators.

\`\`\`text
filetype:pdf blockchain security
\`\`\`

Common types: \`pdf\`, \`xlsx\`, \`docx\`, \`pptx\`, \`csv\`, \`txt\`, \`sql\`, \`log\`, \`conf\`, \`bak\`, \`env\`

### \`intitle:\` — Keyword in the Page Title

Only pages whose **title** contains the keyword.

\`\`\`text
intitle:"admin login"
\`\`\`

\`allintitle:\` requires *every* following word to appear in the title:

\`\`\`text
allintitle: install docker ubuntu
\`\`\`

### \`inurl:\` — Keyword in the URL

Only pages whose **URL** contains the keyword. Great for finding specific scripts, portals, or parameter-driven pages.

\`\`\`text
inurl:admin
\`\`\`

### \`intext:\` — Keyword in the Body Text

Only pages whose **body content** contains the keyword. This is roughly the default for normal searches, but it becomes powerful when combined with the others:

\`\`\`text
intext:"password reset" filetype:pdf
\`\`\`

### \`inanchor:\` — Keyword in Link Text

Pages that are *linked to* with the keyword as anchor text.

\`\`\`text
inanchor:"click here" site:example.com
\`\`\`

### \`cache:\` — Google's Cached Copy

Shows the last version of a page Google stored — useful when a page is down or has been changed.

\`\`\`text
cache:web3tech.site
\`\`\`

### \`related:\` — Similar Sites

Shows sites Google considers similar to the given one.

\`\`\`text
related:reddit.com
\`\`\`

---

## The Basic Search Tricks That Do the Heavy Lifting

You use these in every single dork, often without thinking of them as "operators."

### Exact Phrase — Quotes

Quotes force Google to match the phrase word-for-word:

\`\`\`text
"the quick brown fox"
\`\`\`

### Exclude a Word — Minus

Removes results containing a term. Invaluable for killing noise:

\`\`\`text
jaguar -car -automobile
\`\`\`

### Logical OR — Uppercase OR

Matches either term (OR must be uppercase):

\`\`\`text
docker OR podman tutorial
\`\`\`

### Wildcard — Asterisk

Matches any word or words in a phrase:

\`\`\`text
"how to * a smart contract"
\`\`\`

### Range — Two Dots

Works on numbers, prices, and years:

\`\`\`text
laptop $500..$1000
\`\`\`

\`\`\`text
ethereum 2023..2025
\`\`\`

### Time Filters — \`before:\` and \`after:\`

Limits results to pages published before/after a date:

\`\`\`text
kaspa miner review after:2026-01-01
\`\`\`

\`\`\`text
windows 11 update issues before:2026-06-01
\`\`\`

---

## Copy-Paste Examples That Actually Work

This is the part you came for. Every query below is a building block — swap in your own domain, keyword, or file type.

### Finding Login Portals and Admin Panels

\`\`\`text
intitle:"admin login" site:example.com
\`\`\`

\`\`\`text
inurl:admin/login
\`\`\`

\`\`\`text
inurl:wp-admin site:example.com
\`\`\`

\`\`\`text
intitle:"index of" admin
\`\`\`

### Finding Exposed Documents

\`\`\`text
site:example.com filetype:pdf
\`\`\`

\`\`\`text
site:example.com filetype:xlsx
\`\`\`

\`\`\`text
site:example.com (filetype:docx OR filetype:doc)
\`\`\`

\`\`\`text
site:example.com filetype:csv
\`\`\`

### Finding Exposed Config and Backup Files (Audit Your Own Site!)

These are the classic dorks security teams run against their *own* infrastructure:

\`\`\`text
site:example.com filetype:env
\`\`\`

\`\`\`text
site:example.com filetype:log
\`\`\`

\`\`\`text
site:example.com filetype:sql
\`\`\`

\`\`\`text
site:example.com filetype:bak
\`\`\`

\`\`\`text
site:example.com filetype:conf
\`\`\`

\`\`\`text
site:example.com inurl:backup
\`\`\`

> **If any of these return results on YOUR domain, that's a finding worth fixing.** Exposed \`.env\` files usually contain database credentials and API keys — they should never be served by your web server.

### Finding Directory Listings

When a web server has no index page, it shows a raw file listing titled "Index of /":

\`\`\`text
intitle:"index of" site:example.com
\`\`\`

\`\`\`text
intitle:"index of" backup
\`\`\`

\`\`\`text
intitle:"index of" /wallet
\`\`\`

### Research and OSINT on a Person or Company

\`\`\`text
"John Smith" ("resume" OR "CV") filetype:pdf
\`\`\`

\`\`\`text
site:linkedin.com/in "software engineer" "blockchain"
\`\`\`

\`\`\`text
"Acme Corp" (email OR contact) filetype:pdf
\`\`\`

### Finding Presentations and Slides

\`\`\`text
filetype:pptx "security audit"
\`\`\`

\`\`\`text
site:slideshare.net intitle:ethereum
\`\`\`

### Finding Error and Log Text Leaked on Pages

\`\`\`text
intext:"sql syntax error" site:example.com
\`\`\`

\`\`\`text
intext:"warning: mysql_connect" -site:stackoverflow.com
\`\`\`

### Finding Old or Forgotten Subdomains

\`\`\`text
site:*.example.com -site:www.example.com
\`\`\`

\`\`\`text
site:example.com -www
\`\`\`

### Narrowing by Date and Type Together

\`\`\`text
site:example.com filetype:pdf after:2025-01-01
\`\`\`

\`\`\`text
"zero day" site:thehackernews.com after:2026-08-01
\`\`\`

---

## Combining Operators — How Real Dorks Are Built

Single operators are toys. Power comes from stacking. The mental model:

1. **Where?** — \`site:\`
2. **What form?** — \`filetype:\`, \`inurl:\`, \`intitle:\`
3. **What content?** — \`intext:\`, quoted phrases
4. **What noise?** — minus terms

Build it one filter at a time, checking results between steps.

**Example: find confidential PDFs on your own company site that shouldn't be public**

\`\`\`text
site:example.com filetype:pdf (confidential OR internal OR private)
\`\`\`

**Example: find staging/test environments exposed to the index**

\`\`\`text
site:example.com (inurl:staging OR inurl:dev OR inurl:test)
\`\`\`

**Example: find open FTP-style directory indexes serving video files**

\`\`\`text
intitle:"index of" (mp4 OR mkv) -site:youtube.com
\`\`\`

**Example: research a competitor's public documentation**

\`\`\`text
site:competitor.com filetype:pdf (api OR integration OR guide)
\`\`\`

---

## The Google Hacking Database (GHDB)

You don't have to invent dorks from scratch. The **Google Hacking Database** at [exploit-db.com/google-hacking-database](https://www.exploit-db.com/google-hacking-database) catalogs thousands of categorized, working dorks — from finding exposed printers and cameras to specific software misconfigurations.

Browse it by category, test the queries against your own assets, and treat every hit as a to-do item for your security team.

---

## How to Defend Against Dorking (The Other Side)

If you run a website, assume people are dorking your domain right now. Here's the defensive checklist:

| Risk | Defense |
|------|---------|
| Exposed config/backup files | Never serve \`.env\`, \`.sql\`, \`.bak\` files; block them in your web server config |
| Directory listings | Disable autoindexing (\`Options -Indexes\` in Apache, \`autoindex off\` in Nginx) |
| Sensitive pages in the index | Use \`robots.txt\` **plus** authentication — robots.txt alone just advertises the URL |
| Stale indexed content | Use the Google Search Console removal tool and return proper 404/410 status codes |
| Login portals easily found | Don't name your admin path \`/admin\`; restrict by IP or VPN |
| Documents you forgot about | Periodically run the dorks in this guide against your own domain |

> **robots.txt is not security.** It's a polite request that also acts as a roadmap for anyone curious. Anything genuinely sensitive needs authentication — not obscurity.

---

## Quick Reference Cheat Sheet

| Goal | Dork |
|------|------|
| One site only | \`site:example.com\` |
| One file type | \`filetype:pdf\` |
| Keyword in title | \`intitle:login\` |
| All words in title | \`allintitle: install docker ubuntu\` |
| Keyword in URL | \`inurl:admin\` |
| Keyword in body | \`intext:password\` |
| Anchor text | \`inanchor:click here\` |
| Google's cached copy | \`cache:example.com\` |
| Similar sites | \`related:example.com\` |
| Exact phrase | \`"exact words"\` |
| Exclude a word | \`-car\` |
| Either/or | \`docker OR podman\` |
| Any word in a phrase | \`"how to * linux"\` |
| Number/price range | \`$500..$1000\` |
| After a date | \`after:2026-01-01\` |
| Before a date | \`before:2026-06-01\` |

---

## The Bottom Line

Google dorking isn't hacking — it's **searching with intent**. The same index that serves recipe blogs also holds exposed login portals, forgotten config files, and directory listings that organizations never meant to publish. Operators like \`site:\`, \`filetype:\`, \`inurl:\`, and \`intitle:\` are simply how you ask Google for exactly that.

Learn the operators, stack them one filter at a time, run them against your own domains before someone else does — and if you find something that shouldn't be public on a site you don't own, do the right thing and report it.`
  },
];