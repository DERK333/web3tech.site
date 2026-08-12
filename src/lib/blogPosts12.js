// Blog posts 12 — Linux file system links (symlinks, hard links, inodes, fstab)
export const BLOG_POSTS_12 = [
  {
    id: "symbolic-links-vs-hard-links-linux-inodes-fstab-mklink",
    slug: "symbolic-links-vs-hard-links-linux-inodes-fstab-mklink",
    title: "Symbolic Links vs Hard Links in Linux — Inodes, /etc/fstab, and the Windows mklink Difference",
    excerpt: "A clear, command-line-first breakdown of how ln -s and mklink create links, what an inode actually is, why a hard link survives a rename but a symlink breaks, and which file auto-mounts disks at boot.",
    date: "2026-08-12",
    author: "Derrk Samuel",
    category: "Linux",
    tags: ["Linux", "Symlinks", "Hard Links", "Inodes", "fstab", "File System", "mklink", "Windows", "Command Line"],
    readTime: "6 min read",
    featured: false,
    image: "https://media.base44.com/images/public/6a112c3e2737801908a7c002/c5b378ae8_generated_image.png",
    content: `## Creating a Symbolic Link in Linux

To create a symbolic link (a "soft link") named \`cauliflower\` that points to a file named \`broccoli.txt\`, you run a single command:

\`\`\`bash
ln -s broccoli.txt cauliflower
\`\`\`

Here is what each piece of that command does:

| Part | Meaning |
|------|---------|
| \`ln\` | The command used to create links between files. |
| \`-s\` | The flag specifying a **symbolic** (soft) link rather than a hard link. |
| \`broccoli.txt\` | The **target** file you are linking to (the original). |
| \`cauliflower\` | The **name of the link** you are creating. |

The argument order is always **target first, link name second** — a detail that trips up anyone switching between Linux and Windows.

---

## The Windows Equivalent: \`mklink\`

Yes, \`mklink\` does the same job — but only on Windows. In the classic Command Prompt, the syntax is:

\`\`\`cmd
mklink cauliflower broccoli.txt
\`\`\`

The Windows argument order is the opposite of Linux:

| Part | Meaning |
|------|---------|
| \`mklink\` | The Windows command for creating links. |
| \`cauliflower\` | The **name of the link** you are creating (comes first). |
| \`broccoli.txt\` | The **target** file you are pointing to. |

### Two Important Catches on Windows

**Reversed order.** Notice that \`mklink\` puts the link name *first*, whereas Linux's \`ln -s\` puts the *target* first. This is the most common tripping point when switching operating systems.

**Permissions.** By default, Windows requires you to open the Command Prompt **as an Administrator** to create symbolic links. If you don't want to run as Administrator every time, enable **Developer Mode** in Windows settings.

> Tip: If you are using PowerShell instead of the classic Command Prompt, \`mklink\` won't work directly. Either wrap it in \`cmd\`:

\`\`\`powershell
cmd /c mklink cauliflower broccoli.txt
\`\`\`

…or use PowerShell's native cmdlet:

\`\`\`powershell
New-Item -ItemType SymbolicLink -Path cauliflower -Target broccoli.txt
\`\`\`

---

## Which File Auto-Mounts a File System at Startup?

The correct file is **\`/etc/fstab\`** (the File System Table). This configuration file tells the operating system which disk partitions, network file systems, or other storage devices to mount automatically during boot — and where to mount them.

A typical entry looks like this:

\`\`\`text
/dev/sda1  /mnt/data  ext4  defaults  0  2
\`\`\`

Here is why the other files are wrong:

| File | What It Actually Does |
|------|-----------------------|
| \`/etc/fstab\` | Tells the OS which storage devices to auto-mount at boot and where. |
| \`/dev/sda\` | Not a config file — it's a **device file** representing the first physical/virtual block drive. |
| \`/etc/sudoers\` | Controls who can run commands with elevated (\`sudo\`) privileges. |
| \`/etc/group\` | Defines user groups and which users belong to each group. |

---

## Do Hard Links Point to a File's Inode Number?

Yes. In Linux, a hard link points directly to the file's **inode number** (index node) — not to the file's name.

### How it works under the hood

- **Inode** — The actual file data plus its metadata (permissions, ownership, timestamps) is stored in a structure called an inode. Each inode has a unique number.
- **Filename** — A filename is just a directory entry that links a human-readable name to an inode number.
- **Hard link** — When you create a hard link, you create a *new directory entry* pointing to the **same inode number** as the original.

You create a hard link by dropping the \`-s\` flag:

\`\`\`bash
ln broccoli.txt cauliflower_hard
\`\`\`

Verify that both names share the same inode:

\`\`\`bash
ls -i broccoli.txt cauliflower_hard
\`\`\`

Both columns will show the **identical inode number**, proving they are the same underlying data.

Because both the original and the hard link point to the same inode, they are essentially the same file. If you delete the original filename, the data remains on disk as long as the hard link still exists — the inode's **link count** is still greater than zero.

> Note: This is fundamentally different from a symbolic (soft) link, which points to the *path/name* of the original file, not its inode number.

---

## A Symlink Points to a Filename

A symbolic link points to a **file path**, not the underlying inode. Because it's just a path, it behaves differently from a hard link:

- **Dangling links** — If you move, rename, or delete the original file, the symlink **breaks**. It becomes a "dangling" link because the path it points to no longer exists.
- **Cross-filesystem linking** — Because a symlink is just a path, it can point to files or directories on completely different hard drives, partitions, or file systems. Hard links cannot do this — inode numbers are only unique within a single file system.
- **Linking to directories** — Symlinks can point to directories, whereas standard users cannot create hard links to directories.

Create a symlink and inspect it:

\`\`\`bash
ln -s broccoli.txt cauliflower_soft
ls -l cauliflower_soft
\`\`\`

The \`ls -l\` output shows an arrow (\`cauliflower_soft -> broccoli.txt\`) confirming it stores the target **path**, not an inode.

---

## Does Renaming the Original Break a Hard Link?

No — a hard link keeps working perfectly.

Because a hard link points directly to the **inode number** (the actual data on disk) rather than the filename, changing the name of the original file has no effect on the hard link.

When you rename a file, you are simply changing the text label on one directory entry. The underlying inode and the data it holds remain untouched. Since the hard link is its own separate label pointing to that same inode, it continues to access the same data.

\`\`\`bash
mv broccoli.txt renamed_broccoli.txt
cat cauliflower_hard
\`\`\`

The \`cat\` command still prints the original contents, because \`cauliflower_hard\` resolves straight to the inode — it never cared about the filename \`broccoli.txt\` in the first place.

> By contrast, the symlink \`cauliflower_soft\` from the previous section would now be **dangling**, because it pointed to the path \`broccoli.txt\` which no longer exists.

---

## Quick Reference

| Question | Answer |
|----------|--------|
| Linux command to create a symlink | \`ln -s <target> <link>\` |
| Windows command to create a symlink | \`mklink <link> <target>\` |
| PowerShell native symlink cmdlet | \`New-Item -ItemType SymbolicLink\` |
| File that auto-mounts disks at boot | \`/etc/fstab\` |
| What a hard link points to | The **inode number** |
| What a symlink points to | The **file path / filename** |
| Does renaming the original break a hard link? | No |
| Does renaming the original break a symlink? | Yes — it becomes dangling |

---

## Key Takeaways

- **Argument order flips between OSes:** Linux is *target → link*, Windows is *link → target*. Memorize this and you'll never create a backwards link again.
- **\`/etc/fstab\` is the only boot-mount config** among the common \`/etc\` files — \`/dev/sda\` is a device, \`sudoers\` and \`group\` govern permissions and identity.
- **Hard links survive renames and even deletion of the original name**, because they bind to the inode, not the path.
- **Symlinks are flexible but fragile** — they cross file systems and point at directories, but break the moment the target path changes.

Understand the inode layer and the difference between a *name* and the *data it points to*, and links of either kind become predictable instead of confusing.`
  },
];