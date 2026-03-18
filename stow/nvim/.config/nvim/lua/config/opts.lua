-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║                              OPTIONS                                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

local opt = vim.opt
local g = vim.g

-- Leader key (MUST be set before lazy.nvim loads)
g.mapleader = " "
g.maplocalleader = " "

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                              VISUALS                                      │
-- └──────────────────────────────────────────────────────────────────────────┘
opt.number = true
opt.relativenumber = false
opt.cursorline = false
opt.signcolumn = "yes"
opt.termguicolors = true
opt.smartindent = true
opt.autoindent = true

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                              TABBING                                      │
-- └──────────────────────────────────────────────────────────────────────────┘
opt.expandtab = true
opt.shiftwidth = 2
opt.tabstop = 2

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                              SEARCH                                       │
-- └──────────────────────────────────────────────────────────────────────────┘
opt.incsearch = true
opt.hlsearch = true
opt.ignorecase = true
opt.smartcase = true

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                         HISTORY & UNDO                                    │
-- └──────────────────────────────────────────────────────────────────────────┘
opt.undofile = true
opt.undodir = vim.fn.expand("~/.local/share/nvim/undo")

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                            BEHAVIOR                                       │
-- └──────────────────────────────────────────────────────────────────────────┘
opt.updatetime = 300
opt.completeopt = { "menu", "menuone", "noselect" }
opt.showmatch = true
opt.matchtime = 2

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                           CLIPBOARD                                       │
-- └──────────────────────────────────────────────────────────────────────────┘
opt.clipboard = "unnamedplus"

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                          DIAGNOSTICS                                      │
-- └──────────────────────────────────────────────────────────────────────────┘
vim.diagnostic.config({
  severity_sort = true,
  virtual_text = {
    prefix = "●",
    spacing = 4,
  },
  float = {
    border = "rounded",
    source = "always",
  },
  signs = true,
  underline = true,
  update_in_insert = false,
})

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                          HIGHLIGHTS                                       │
-- └──────────────────────────────────────────────────────────────────────────┘
vim.api.nvim_set_hl(0, "MatchParen", { bg = "#444444", fg = "#ffffff", bold = true })
vim.api.nvim_set_hl(0, "MiniIndentscopeSymbol", { fg = "#008b8b", bold = true })

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                      GENTOO SYNTAX SUPPORT                               │
-- └──────────────────────────────────────────────────────────────────────────┘
local gentoo_path = "/usr/share/vim/vimfiles"
if vim.fn.isdirectory(gentoo_path) == 1 then
  vim.opt.runtimepath:prepend(gentoo_path)
end
vim.cmd("filetype plugin indent on")
vim.cmd("syntax enable")
