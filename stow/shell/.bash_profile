# /etc/skel/.bash_profile

# This file is sourced by bash for login shells.  The following line
# runs your .bashrc and is recommended by the bash info pages.

export GOPATH="$HOME/.go"
export GOBIN="$HOME/.local/bin"
export PATH="$PATH:$HOME/.local/bin"

if [[ -f ~/.bashrc ]] ; then
	. ~/.bashrc
fi
