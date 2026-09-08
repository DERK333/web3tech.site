// Internal linking map — builds in-content links between related posts to
// boost topical authority. Each anchor links its FIRST occurrence (outside
// code blocks) in any post except the target post itself. Max 5 per post.

export const INTERNAL_LINKS = [
  { text: "Zorin OS", slug: "zorin-os-complete-guide-install-customize-tips-tricks" },
  { text: "Docker container logs", slug: "docker-container-logs-linux-guide" },
  { text: "Docker Compose", slug: "docker-compose-multi-service-linux-guide" },
  { text: "Kaspa node", slug: "run-kaspa-rust-node-ubuntu-rpc" },
  { text: "Kali tools", slug: "debian-vm-pixel-9a-kali-tools-no-root" },
  { text: "Kali Linux", slug: "install-kali-linux-wsl2-windows-11-win-kex-gui" },
  { text: "Ethereum node", slug: "ethereum-node-docker-geth-setup-guide" },
  { text: "smart contracts", slug: "smart-contract-interactions-private-networks" },
  { text: "No such file or directory", slug: "linux-no-such-file-or-directory-error-fix" },
  { text: "X server", slug: "restart-x-server-ubuntu-display-manager" },
  { text: "Ctrl + Alt + F3", slug: "switch-gui-to-terminal-tty-ubuntu" },
  { text: "SSH", slug: "linux-ssh-hardening-guide" },
  { text: "firewall", slug: "linux-ufw-firewall-setup-guide" },
  { text: "systemd", slug: "linux-process-management-systemd-guide" },
];

// True when the position sits inside a fenced code block (``` ... ```)
function isInsideFence(content, idx) {
  const fences = (content.slice(0, idx).match(/```/g) || []).length;
  return fences % 2 === 1;
}

// True when the position sits inside inline code (` ... `)
function isInsideInlineCode(content, idx) {
  const before = content.slice(0, idx);
  const fences = (before.match(/```/g) || []).length;
  const backticks = (before.match(/`/g) || []).length;
  return (backticks - fences * 3) % 2 === 1;
}

export function applyInternalLinks(content, currentSlug) {
  let result = content;
  let added = 0;

  for (const { text, slug } of INTERNAL_LINKS) {
    if (added >= 5) break;
    if (slug === currentSlug) continue;
    // Don't double-link the same target in one post
    if (result.includes(`](/blog/${slug})`)) continue;

    let idx = result.indexOf(text);
    while (idx !== -1) {
      if (!isInsideFence(result, idx) && !isInsideInlineCode(result, idx)) {
        result =
          result.slice(0, idx) +
          `[${text}](/blog/${slug})` +
          result.slice(idx + text.length);
        added++;
        break;
      }
      idx = result.indexOf(text, idx + 1);
    }
  }

  return result;
}