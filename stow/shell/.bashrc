# /etc/skel/.bashrc
#
# This file is sourced by all *interactive* bash shells on startup,
# including some apparently interactive shells such as scp and rcp
# that can't tolerate any output.  So make sure this doesn't display
# anything or bad things will happen !

# Test for an interactive shell.  There is no need to set anything
# past this point for scp and rcp, and it's important to refrain from
# outputting anything in those cases.
if [[ $- != *i* ]]; then
  # Shell is non-interactive.  Be done now!
  return
fi

# Put your fun stuff here.
export EDITOR=nvim
export VISUAL=nvim

set -o vi

# Cursor shape based on vi mode
bind 'set show-mode-in-prompt on'

function _set_cursor() {
  if [[ $1 == "vicmd" ]]; then
    echo -ne '\e[1 q' # block = normal mode
  else
    echo -ne '\e[5 q' # beam = insert mode
  fi
}

bind 'set vi-ins-mode-string \1\e[5 q\2'
bind 'set vi-cmd-mode-string \1\e[1 q\2'
bind -m vi-insert '"\C-l": clear-screen'

# --- sudo-rs wrapper functions ---

# 1. Main sudo-rs wrapper
# Preserves HOME so Neovim/IDE configs work under sudo
sudo() {
  command sudo-rs --preserve-env=HOME,XDG_CONFIG_HOME,XDG_DATA_HOME,XDG_RUNTIME_DIR,WAYLAND_DISPLAY,DISPLAY,TERM,COLORTERM "$@"
}

# 2. Automated visudo-rs elevation
# Typing 'visudo' now automatically runs 'sudo-rs visudo-rs'
visudo() {
  sudo-rs visudo-rs "$@"
}

# 3. Map 'su' to 'sudo-rs -i'
# Gives you a ROOT login shell using YOUR password
su() {
  command sudo-rs -i "$@"
}

# --- Restore Tab Completion ---

if type _sudo >/dev/null 2>&1; then
  complete -F _sudo sudo
  complete -F _sudo su
  complete -F _sudo visudo
fi

alias ll='ls -la'
alias l='ls -lvhFa'
alias reboot='sudo reboot'

if [[ -z $DISPLAY && $(tty) == /dev/tty1 ]]; then
  exec start-hyprland
fi

export SSH_AUTH_SOCK=~/.ssh/agent/ssh-agent.socket

# Auto-add GitHub key if agent is empty
if [ -S "$SSH_AUTH_SOCK" ] && ! ssh-add -l &>/dev/null; then
  ssh-add ~/.ssh/id_ed25519_github
fi

# --- Powerhouse Ansible ---
powerhouse() {
  local cmd="${1:-apply}"
  case "$cmd" in
  apply)
    ansible-playbook ~/.powerhouse/ansible/site.yml --diff -i ~/.powerhouse/ansible/inventory.ini
    ;;
  check)
    ansible-playbook ~/.powerhouse/ansible/site.yml --diff --check -i ~/.powerhouse/ansible/inventory.ini
    ;;
  verify)
    echo "Checking for symlink drift..."
    sudo stow -d ~/.powerhouse/stow -t / system --verbose=2 --simulate 2>&1 | grep -i "conflict\|exist\|skip"
    stow -d ~/.powerhouse/stow -t ~ shell nvim desktop ags lazygit mpv --verbose=2 --simulate 2>&1 | grep -i "conflict\|exist\|skip"
    ;;
  lint)
    ansible-lint ~/.powerhouse/ansible/site.yml
    ;;
  *)
    echo "Usage: powerhouse [apply|check|verify|lint]"
    ;;
  esac
}
