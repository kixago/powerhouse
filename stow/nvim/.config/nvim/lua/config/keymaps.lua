-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║                              KEYMAPS                                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

local keymap = vim.keymap.set

local function opts(desc, extra)
  local options = { noremap = true, silent = true, desc = desc }
  if extra then
    for k, v in pairs(extra) do
      options[k] = v
    end
  end
  return options
end

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                         HEBREW SUPPORT                                    │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap({ "n", "i" }, "<F10>", "<cmd>set invrightleft<CR><cmd>set inviminsert<CR>", opts("Toggle Hebrew RTL mode"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                    YAZI FILE MANAGER INTEGRATION                          │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<leader>-", "<cmd>Yazi<CR>", opts("Open Yazi"))
keymap("n", "<leader>cw", "<cmd>Yazi cwd<CR>", opts("Open Yazi in current directory"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                        FORMATTING SHORTCUT                                │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "cf", function()
  require("conform").format({ async = true, lsp_fallback = true })
end, opts("Format buffer"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                   HISTORY AND DIAGNOSTICS TOGGLES                         │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<leader>u", "<cmd>UndotreeToggle<CR>", opts("Toggle UndoTree"))

keymap("n", "<leader>td", function()
  if vim.diagnostic.is_enabled() then
    vim.diagnostic.enable(false)
    print("Diagnostics Disabled")
  else
    vim.diagnostic.enable(true)
    print("Diagnostics Enabled")
  end
end, opts("Toggle Diagnostics visibility"))

keymap("n", "<leader>th", function()
  local current_setting = vim.lsp.inlay_hint.is_enabled()
  vim.lsp.inlay_hint.enable(not current_setting)
end, opts("Toggle LSP Inlay Hints"))

keymap("n", "<leader>tw", function()
  if vim.g.warnings_visible == nil then
    vim.g.warnings_visible = true
  end
  if vim.g.warnings_visible then
    vim.diagnostic.config({ severity = { min = vim.diagnostic.severity.ERROR } })
    vim.g.warnings_visible = false
    print("Showing Errors Only")
  else
    vim.diagnostic.config({ severity = nil })
    vim.g.warnings_visible = true
    print("Showing All Diagnostics")
  end
end, opts("Toggle Warnings visibility"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                      CLIPBOARD AND PASTE LOGIC                            │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "p", function()
  local line = vim.fn.getline(".")
  if line:match("^%s*$") then
    vim.cmd('normal! "+p')
  else
    local keys = vim.api.nvim_replace_termcodes('o<Esc>"+p', true, false, true)
    vim.api.nvim_feedkeys(keys, "n", false)
  end
end, opts("Smart paste below"))

keymap("n", "P", function()
  local line = vim.fn.getline(".")
  if line:match("^%s*$") then
    vim.cmd('normal! "+P')
  else
    local keys = vim.api.nvim_replace_termcodes('O<Esc>"+p', true, false, true)
    vim.api.nvim_feedkeys(keys, "n", false)
  end
end, opts("Smart paste above"))

keymap("v", "p", '"+p', opts("Paste over selection"))
keymap({ "n", "v" }, "y", '"+y', opts("Yank to system clipboard"))
keymap("n", "Y", '"+Y', opts("Yank line to system clipboard"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                        BUFFER MANAGEMENT                                  │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<leader>w", "<cmd>w<CR>", opts("Save buffer"))
keymap("n", "<leader>q", "<cmd>q<CR>", opts("Quit"))
keymap("n", "<leader>bc", "<cmd>bd<CR>", opts("Close buffer"))
keymap("n", "<leader>bn", "<cmd>bnext<CR>", opts("Next buffer"))
keymap("n", "<leader>bb", "<cmd>bprevious<CR>", opts("Previous buffer"))
keymap("n", "<leader>b", "<cmd>ls<CR>:b<Space>", opts("List and select buffer", { silent = false }))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                      WINDOW AND NAVIGATION                                │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<C-l>", "<C-w>l", opts("Navigate to right window"))
keymap("n", "<C-h>", "<C-w>h", opts("Navigate to left window"))
keymap("n", "<C-j>", "<C-w>j", opts("Navigate to window below"))
keymap("n", "<C-k>", "<C-w>k", opts("Navigate to window above"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                   THE "ALT LAYER" (HYPRLAND STYLE)                        │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<M-h>", "<cmd>bprev<CR>", opts("Previous Buffer"))
keymap("n", "<M-l>", "<cmd>bnext<CR>", opts("Next Buffer"))
keymap("n", "<M-j>", vim.diagnostic.goto_next, opts("Next Diagnostic"))
keymap("n", "<M-k>", vim.diagnostic.goto_prev, opts("Previous Diagnostic"))
keymap("n", "<M-q>", "<cmd>bd<CR>", opts("Close Buffer"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                   LINE MANIPULATION AND EDITING                           │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "K", "i<CR><Esc>", opts("Split line at cursor"))
keymap("v", "J", ":m '>+1<CR>gv=gv", opts("Move selection down"))
keymap("v", "K", ":m '<-2<CR>gv=gv", opts("Move selection up"))
keymap("n", ">", ">>", opts("Indent line"))
keymap("n", "<", "<<", opts("Unindent line"))
keymap("v", ">", ">gv", opts("Indent selection"))
keymap("v", "<", "<gv", opts("Unindent selection"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                          LSP INTERACTION                                  │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<CR>", vim.lsp.buf.hover, opts("LSP Hover information"))
keymap("n", "<leader><CR>", vim.diagnostic.open_float, opts("Show floating diagnostic"))
keymap("n", "gd", vim.lsp.buf.definition, opts("Go to definition"))
keymap("n", "gr", vim.lsp.buf.references, opts("Go to references"))
keymap("n", "<leader>rn", vim.lsp.buf.rename, opts("Rename symbol"))
keymap("n", "<leader>ca", vim.lsp.buf.code_action, opts("LSP Code actions"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                       SEARCH AND JUMP TOOLS                               │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<leader>h", "<cmd>nohlsearch<CR>", opts("Clear search highlights"))
keymap({ "n", "x", "o" }, "s", function()
  require("flash").jump()
end, opts("Flash Jump"))
keymap({ "n", "x", "o" }, "S", function()
  require("flash").treesitter()
end, opts("Flash Treesitter selection"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                        PLUGINS AND TOOLS                                  │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<leader>/", function()
  require("Comment.api").toggle.linewise.current()
end, opts("Toggle line comment"))

keymap({ "v", "x" }, "<leader>/", function()
  local esc = vim.api.nvim_replace_termcodes("<Esc>", true, false, true)
  vim.api.nvim_feedkeys(esc, "nx", false)
  require("Comment.api").toggle.linewise(vim.fn.visualmode())
end, opts("Toggle selection comment"))

keymap("n", "<leader>g", "<cmd>!lazygit<CR>", opts("Open Lazygit"))
keymap("n", "<leader>e", "<cmd>NvimTreeToggle<CR>", opts("Toggle file explorer"))

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                          TROUBLE PLUGIN                                   │
-- └──────────────────────────────────────────────────────────────────────────┘
keymap("n", "<leader>xx", "<cmd>Trouble diagnostics toggle<CR>", opts("Toggle Trouble"))
keymap("n", "<leader>xw", "<cmd>Trouble diagnostics toggle<CR>", opts("Workspace diagnostics"))
keymap("n", "<leader>xd", "<cmd>Trouble diagnostics toggle filter.buf=0<CR>", opts("Document diagnostics"))
keymap("n", "<leader>xq", "<cmd>Trouble quickfix toggle<CR>", opts("Quickfix list"))
keymap("n", "<leader>xl", "<cmd>Trouble loclist toggle<CR>", opts("Location list"))
