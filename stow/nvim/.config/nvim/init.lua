-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║                         NEOVIM CONFIGURATION                              ║
-- ║                     Migrated from NixVim to Gentoo                        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Bootstrap lazy.nvim plugin manager
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Load core configuration modules
require("config.opts")
require("config.keymaps")
require("config.autocmds")

-- Initialize lazy.nvim with plugin specs
require("lazy").setup({
  { import = "plugins" },
}, {
  install = {
    colorscheme = { "habamax" },
  },
  checker = {
    enabled = true,
    notify = false,
  },
  change_detection = {
    notify = false,
  },
})

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                      GENTOO SYNTAX SUPPORT                               │
-- │              (must be after lazy.nvim setup)                             │
-- └──────────────────────────────────────────────────────────────────────────┘
local gentoo_path = "/usr/share/vim/vimfiles"
if vim.fn.isdirectory(gentoo_path) == 1 then
  vim.opt.runtimepath:append(gentoo_path)
  vim.opt.runtimepath:append(gentoo_path .. "/after")
end

vim.cmd("filetype plugin indent on")
vim.cmd("syntax enable")
