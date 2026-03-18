-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║                           UI PLUGINS                                       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

return {
  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           COLORSCHEME                                    │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    config = function()
      require("tokyonight").setup({
        style = "night",
        transparent = false,
        terminal_colors = true,
        on_highlights = function(highlights, colors)
          highlights.Normal = { bg = "#000000" }
          highlights.NormalFloat = { bg = "#000000" }
          highlights.FloatBorder = { bg = "#000000", fg = "#bb9af7" }
          highlights.NormalNC = { bg = "#000000" }
          highlights.EndOfBuffer = { bg = "#000000" }
          highlights.SignColumn = { bg = "#000000" }
          highlights.LineNr = { bg = "#000000" }
          highlights.CursorLineNr = { bg = "#000000" }
          highlights.StatusLine = { bg = "#000000" }
          highlights.StatusLineNC = { bg = "#000000" }
          highlights.NvimTreeNormal = { bg = "#000000" }
          highlights.NvimTreeNormalNC = { bg = "#000000" }
          highlights.NeoTreeNormal = { bg = "#000000" }
          highlights.NeoTreeNormalNC = { bg = "#000000" }
        end,
        styles = {
          comments = { italic = true },
          keywords = { italic = true },
          sidebars = "dark",
          floats = "dark",
        },
      })
      vim.cmd.colorscheme("tokyonight")
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                        SMEAR CURSOR                                      │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "sphamba/smear-cursor.nvim",
    opts = {
      stiffness = 0.20,
      trailing_stiffness = 0.45,
      distance_stop_animating = 0.05,
      smear_between_neighbor_lines = true,
      legacy_computing_symbols_support = false,
    },
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           STATUS LINE                                    │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "nvim-lualine/lualine.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      require("lualine").setup({
        options = {
          theme = "auto",
          component_separators = { left = "", right = "" },
          section_separators = { left = "", right = "" },
        },
        sections = {
          lualine_a = { "mode" },
          lualine_b = { "branch", "diff" },
          lualine_c = {
            {
              "filename",
              path = 1, -- 0 = just filename, 1 = relative path, 2 = absolute path
            },
          },
          lualine_x = { "diagnostics", "encoding", "fileformat", "filetype" },
          lualine_y = { "progress" },
          lualine_z = { "location" },
        },
      })
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                          FILE EXPLORER                                   │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "nvim-tree/nvim-tree.lua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    config = function()
      vim.g.loaded_netrw = 1
      vim.g.loaded_netrwPlugin = 1

      require("nvim-tree").setup({
        actions = {
          open_file = { quit_on_open = true },
        },
        auto_reload_on_write = true,
        hijack_cursor = true,
        view = { adaptive_size = true },
        renderer = {
          highlight_opened_files = "all",
          icons = {
            show = { git = true, folder = true, file = true, folder_arrow = true },
          },
        },
        on_attach = function(bufnr)
          local api = require("nvim-tree.api")
          local function opts(desc)
            return { desc = "nvim-tree: " .. desc, buffer = bufnr, noremap = true, silent = true, nowait = true }
          end
          vim.keymap.set("n", "l", api.node.open.edit, opts("Open"))
          vim.keymap.set("n", "h", api.node.navigate.parent_close, opts("Close Directory"))
          vim.keymap.set("n", "<CR>", api.node.open.edit, opts("Open"))
          vim.keymap.set("n", "a", api.fs.create, opts("Create"))
          vim.keymap.set("n", "r", api.fs.remove, opts("Remove"))
          vim.keymap.set("n", "d", api.fs.cut, opts("Cut"))
          vim.keymap.set("n", "y", api.fs.copy.node, opts("Copy"))
          vim.keymap.set("n", "p", api.fs.paste, opts("Paste"))
        end,
      })
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                         INDENT GUIDES                                    │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "echasnovski/mini.indentscope",
    version = false,
    config = function()
      require("mini.indentscope").setup({
        symbol = "│",
        options = { try_as_border = true },
      })
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                         BUFFER LINE                                      │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "akinsho/bufferline.nvim",
    version = "*",
    dependencies = "nvim-tree/nvim-web-devicons",
    config = function()
      require("bufferline").setup({
        options = {
          always_show_bufferline = true,
          buffer_close_icon = "󰅖",
          close_icon = "",
          diagnostics = "nvim_lsp",
          separator_style = { "|", "|" },
          offsets = {
            {
              filetype = "NvimTree",
              text = "File Explorer",
              highlight = "Directory",
              text_align = "center",
            },
          },
        },
      })
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                       NOTIFICATIONS (FIDGET)                             │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "j-hui/fidget.nvim",
    opts = {
      progress = { suppress_on_insert = true },
    },
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                         ICONS                                            │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "nvim-tree/nvim-web-devicons",
    lazy = true,
  },
}
