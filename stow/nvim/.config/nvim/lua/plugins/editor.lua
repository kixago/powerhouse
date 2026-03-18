-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║                         EDITOR PLUGINS                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

return {
  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                          TREESITTER                                      │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function()
      ---@diagnostic disable-next-line: missing-fields
      require("nvim-treesitter").setup({})

      -- Install parsers
      local parsers = {
        "lua",
        "vim",
        "vimdoc",
        "bash",
        "rust",
        "go",
        "gomod",
        "gosum",
        "typescript",
        "tsx",
        "javascript",
        "json",
        "yaml",
        "toml",
        "markdown",
        "markdown_inline",
        "html",
        "css",
      }

      -- Use vim.treesitter for highlighting (built-in in 0.11+)
      vim.api.nvim_create_autocmd("FileType", {
        callback = function(args)
          pcall(vim.treesitter.start, args.buf)
        end,
      })

      -- Auto-install parsers on first use
      vim.api.nvim_create_autocmd("FileType", {
        callback = function()
          local ft = vim.bo.filetype
          local lang = vim.treesitter.language.get_lang(ft) or ft
          if vim.tbl_contains(parsers, lang) then
            pcall(function()
              if not pcall(vim.treesitter.language.inspect, lang) then
                vim.cmd("TSInstall " .. lang)
              end
            end)
          end
        end,
      })
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                          TELESCOPE                                       │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "nvim-telescope/telescope.nvim",
    tag = "0.1.8",
    dependencies = {
      "nvim-lua/plenary.nvim",
      {
        "nvim-telescope/telescope-fzf-native.nvim",
        build = "make",
      },
    },
    config = function()
      local telescope = require("telescope")
      telescope.setup({
        defaults = {
          mappings = {
            i = {
              ["<C-j>"] = "move_selection_next",
              ["<C-k>"] = "move_selection_previous",
            },
          },
        },
      })
      telescope.load_extension("fzf")

      local builtin = require("telescope.builtin")
      vim.keymap.set("n", "<leader>ff", builtin.find_files, { desc = "Find files" })
      vim.keymap.set("n", "<leader>fg", builtin.live_grep, { desc = "Live grep" })
      vim.keymap.set("n", "<leader>fb", builtin.buffers, { desc = "Find buffers" })
      vim.keymap.set("n", "<leader>fh", builtin.help_tags, { desc = "Help tags" })
      vim.keymap.set("n", "<leader>fr", builtin.oldfiles, { desc = "Recent files" })
      vim.keymap.set("n", "<leader>fs", builtin.lsp_document_symbols, { desc = "Document symbols" })
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           FLASH (NAVIGATION)                             │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "folke/flash.nvim",
    event = "VeryLazy",
    opts = {},
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                          AUTOPAIRS                                       │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "windwp/nvim-autopairs",
    event = "InsertEnter",
    config = function()
      require("nvim-autopairs").setup({
        check_ts = true,
      })
      local cmp_autopairs = require("nvim-autopairs.completion.cmp")
      local cmp = require("cmp")
      cmp.event:on("confirm_done", cmp_autopairs.on_confirm_done())
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           COMMENTS                                       │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "numToStr/Comment.nvim",
    opts = {},
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           SURROUND                                       │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "kylechui/nvim-surround",
    version = "*",
    event = "VeryLazy",
    opts = {},
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           UNDOTREE                                       │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "mbbill/undotree",
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           GIT SIGNS                                      │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "lewis6991/gitsigns.nvim",
    config = function()
      require("gitsigns").setup({
        signs = {
          add = { text = "│" },
          change = { text = "│" },
          delete = { text = "_" },
          topdelete = { text = "‾" },
          changedelete = { text = "~" },
        },
      })
    end,
  },

  -- ┌──────────────────────────────────────────────────────────────────────────┐
  -- │                           WHICH KEY                                      │
  -- └──────────────────────────────────────────────────────────────────────────┘
  {
    "folke/which-key.nvim",
    event = "VeryLazy",
    opts = {},
  },
}
