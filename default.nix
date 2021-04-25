with (import ./nix/packages); stdenv.mkDerivation rec {
  name = "env";

  env = buildEnv {
    name = name;
    paths = buildInputs;
  };

  buildInputs = [
    curl
    fd
    jq
    nodejs-12_x
    (yarn.override { nodejs = nodejs-12_x; })
  ] ++ lib.optionals stdenv.isLinux [
    glibcLocales
    nssTools
  ];
}
