-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║                            AUTOCOMMANDS                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                     DISABLE DIAGNOSTICS FOR .env FILES                    │
-- └──────────────────────────────────────────────────────────────────────────┘
augroup("EnvFileDiagnostics", { clear = true })
autocmd({ "BufRead", "BufNewFile" }, {
  group = "EnvFileDiagnostics",
  pattern = { ".env", "*.env" },
  callback = function()
    vim.diagnostic.enable(false, { bufnr = 0 })
  end,
})

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                    HIGHLIGHT ON YANK (NICE FEEDBACK)                      │
-- └──────────────────────────────────────────────────────────────────────────┘
augroup("HighlightYank", { clear = true })
autocmd("TextYankPost", {
  group = "HighlightYank",
  callback = function()
    vim.highlight.on_yank({ higroup = "IncSearch", timeout = 150 })
  end,
})

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                    GENTOO FILETYPE DETECTION                              │
-- └──────────────────────────────────────────────────────────────────────────┘
augroup("GentooFiletypes", { clear = true })
autocmd({ "BufRead", "BufNewFile" }, {
  group = "GentooFiletypes",
  pattern = { "*.ebuild", "*.eclass" },
  callback = function()
    vim.bo.filetype = "ebuild"
  end,
})

autocmd({ "BufRead", "BufNewFile" }, {
  group = "GentooFiletypes",
  pattern = {
    "/etc/portage/*",
    "*/etc/portage/**/*",
    "make.conf",
  },
  callback = function()
    vim.bo.filetype = "gentoo-conf-d"
  end,
})

-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │                   RESTORE CURSOR POSITION ON OPEN                         │
-- └──────────────────────────────────────────────────────────────────────────┘
augroup("RestoreCursor", { clear = true })
autocmd("BufReadPost", {
  group = "RestoreCursor",
  callback = function()
    local mark = vim.api.nvim_buf_get_mark(0, '"')
    local lcount = vim.api.nvim_buf_line_count(0)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})
