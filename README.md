# powerhouse

Gentoo Linux system configuration for the powerhouse machine (AMD Ryzen 9 6900HX).
Managed declaratively with Ansible + GNU Stow. Everything tracked in git, everything
reproducible from a fresh stage3 install.

## What this repo manages

- `/etc/portage` — make.conf, package.use, package.accept_keywords, package.mask, env, repos.conf, patches
- `/etc/fstab`, `/etc/hosts`, `/etc/hostname`, `/etc/sysctl.conf`, `/etc/locale.conf`, `/etc/vconsole.conf`
- `/etc/kernel/cmdline`
- `/etc/nut/` — UPS config
- `/etc/systemd/system/getty@tty1.service.d/autologin.conf`
- `~/.bashrc`, `~/.bash_profile`, `~/.bash_logout`, `~/.inputrc`, `~/.gitconfig`
- `~/.config/nvim`
- `~/.config/hypr`, `~/.config/rofi`, `~/.config/wezterm`
- `~/.config/ags`
- `~/.config/lazygit`
- `~/.config/mpv`
- `~/.config/systemd/user/ssh-agent.service`
- `~/.local/share/applications/bitwarden.desktop`

## Companion repo

Gentoo overlay lives separately at `github.com/kixago/powerhouse-repo`.
Ansible clones it automatically during setup.

## Fresh install

### Prerequisites

Start from a working Gentoo stage3 with systemd, no-multilib profile:
```
default/linux/amd64/23.0/no-multilib/systemd
```

SSH key, locale, hostname, and network should already be configured before
proceeding.

### 1. Install dependencies
```bash
emerge --ask dev-vcs/git app-admin/ansible-core app-admin/stow
```

### 2. Set up SSH for GitHub

Generate a key and add it to GitHub. The key needs a passphrase — you will
be prompted for it on first login after the ssh-agent service is running.
```bash
ssh-keygen -t ed25519 -C "your@email.com" -f ~/.ssh/id_ed25519_github
ssh-keygen -p -f ~/.ssh/id_ed25519_github
```

Install and authenticate gh:
```bash
emerge --ask dev-util/github-cli
gh auth login
```

Choose GitHub.com → SSH → your key → Login with browser.

Verify:
```bash
ssh -T git@github.com
```

### 3. Clone this repo
```bash
git clone git@github.com:kixago/powerhouse.git ~/.powerhouse
```

### 4. Run the playbook
```bash
cd ~/.powerhouse/ansible
ansible-playbook site.yml -i inventory.ini
```

This will:
- Set the Portage profile
- Clone powerhouse-repo overlay to `/var/db/repos/powerhouse-repo`
- Stow all configs into their correct locations
- Install all world packages via `emerge --noreplace @world`
- Enable ssh-agent as a user systemd service
- Create the nvim undo directory
- Skip the certs role gracefully if rbw is not yet set up

### 5. Set up rbw (Bitwarden CLI)

rbw is installed by the workstation role. Before it can be used you need
to register the device with Bitwarden's server to avoid bot detection.

Get your API keys from `vault.bitwarden.com`:
Account Settings → Security → Keys → View API Key
```bash
rbw register
# prompts for: email, client_id, client_secret

rbw login
# prompts for master password via pinentry
```

### 6. Run the playbook again
```bash
cd ~/.powerhouse/ansible
ansible-playbook site.yml -i inventory.ini
```

This time the certs role will run and:
- Fetch the root CA cert from Bitwarden (stored as secure note "kixago-root-ca.crt")
- Write it to `~/kixago-root-ca.crt`
- Install it to `/usr/local/share/ca-certificates/`
- Run `update-ca-certificates`

### 7. Manual steps after playbook

These cannot be automated:

**Firefox** — does not use the system certificate store. Import manually:
`about:preferences#privacy` → View Certificates → Authorities → Import → select `~/kixago-root-ca.crt`

**ssh-agent** — the service is enabled but you need to add your key on first login:
```bash
ssh-add ~/.ssh/id_ed25519_github
```
After this, `.bashrc` handles it automatically on subsequent logins.

**Root SSH for powerhouse-repo** — root needs SSH access to GitHub to push
ebuild changes. Root's SSH config uses your user's agent socket, so your
agent must be running and the key loaded before running any `sudo git push`
in `/var/db/repos/powerhouse-repo`.

Verify root can reach GitHub:
```bash
sudo ssh -T git@github.com
```

If it fails, check `/root/.ssh/config` contains:
```
Host github.com
    HostName github.com
    User git
    IdentityFile /root/.ssh/id_ed25519_github
    IdentityAgent /home/kixadmin/.ssh/agent/ssh-agent.socket
```

And that `/root/.ssh/id_ed25519_github` exists (copy from your user's `.ssh`).

## Daily workflow

The `powerhouse` function is defined in `~/.bashrc` (managed by Stow).
On a fresh install before the first playbook run, call Ansible directly:
```bash
cd ~/.powerhouse/ansible
ansible-playbook site.yml -i inventory.ini
```

After the first run, use the shell function:
```bash
powerhouse apply    # apply all changes
powerhouse check    # dry run, no changes made
powerhouse verify   # check all symlinks are intact, detect drift
```

## Adding a new package

Just install it normally:
```bash
sudo emerge --ask some/package
```

Portage adds it to `/var/lib/portage/world` automatically. The next
`powerhouse apply` will pick it up via `emerge --noreplace @world`.

## Adding a new config file to Stow

1. Move the file into the appropriate stow package directory:
```bash
mv ~/.config/something ~/.powerhouse/stow/desktop/.config/something
```

2. Run the playbook to create the symlink:
```bash
powerhouse apply
```

3. Commit:
```bash
cd ~/.powerhouse
git add .
git commit -m "feat: add something config to desktop stow package"
git push
```

## Adding a new ebuild to powerhouse-repo
```bash
cd /var/db/repos/powerhouse-repo
sudo mkdir -p category/package
sudo nvim category/package/package-version.ebuild
sudo ebuild category/package/package-version.ebuild manifest
sudo git add .
sudo git commit -m "feat: add package ebuild"
sudo git push
```

## Checking for drift
```bash
powerhouse verify
```

Stow will report any symlink that has been replaced with a real file.
Run `powerhouse apply` to restore correct symlinks.

After kernel updates or `dispatch-conf` runs, check git for unexpected changes:
```bash
cd ~/.powerhouse
git diff
```

## Structure
```
~/.powerhouse/
├── ansible/
│   ├── ansible.cfg
│   ├── inventory.ini
│   ├── site.yml
│   ├── group_vars/
│   │   └── all.yml
│   ├── host_vars/
│   │   └── powerhouse.yml
│   └── roles/
│       ├── ags/
│       ├── certs/
│       ├── desktop/
│       ├── lazygit/
│       ├── mpv/
│       ├── nvim/
│       ├── portage/
│       ├── shell/
│       ├── system/
│       └── workstation/
├── stow/
│   ├── ags/
│   ├── desktop/
│   ├── lazygit/
│   ├── mpv/
│   ├── nvim/
│   ├── portage/
│   ├── shell/
│   └── system/
└── docs/
    └── README.md
```

## License

MIT License

Copyright (c) 2026 kixago

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
