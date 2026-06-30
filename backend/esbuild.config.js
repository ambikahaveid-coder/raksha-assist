import esbuild from "esbuild";

const banner = `
import { createRequire } from 'module';
import { fileURLToPath as _fileURLToPath } from 'url';
import { dirname as _dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = _fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);
`;

await esbuild.build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.js",
  packages: "external",
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  banner: { js: banner },
});

console.log("Backend build complete: dist/index.js");

await esbuild.build({
  entryPoints: ["server/bootstrap.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/bootstrap.js",
  packages: "external",
  sourcemap: true,
  minify: false,
  external: ["./index.js"],
  banner: { js: banner },
});

console.log("Bootstrap build complete: dist/bootstrap.js");
