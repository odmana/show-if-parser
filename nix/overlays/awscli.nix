{ buildEnv, makeWrapper, awscli }:

# See https://github.com/NixOS/nixpkgs/issues/47900

buildEnv {
  name = "wrapped-awscli-${awscli.version}";
  paths = [ awscli ];
  pathsToLink = [ "/bin" ];
  buildInputs = [ makeWrapper ];
  postBuild = ''
    wrapProgram $out/bin/aws --unset PYTHONPATH
  '';
}
