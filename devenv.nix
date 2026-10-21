{ pkgs, ... }:
{
  languages.javascript.enable = true;
  languages.typescript.enable = true;
  languages.python.enable = true;

  # Language servers + debug adapters for the omp coding agent.
  packages = with pkgs; [
    typescript-language-server
    vscode-langservers-extracted
    pyright
    ruff
    python3Packages.debugpy
  ];
}
