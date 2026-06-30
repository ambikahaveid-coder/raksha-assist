import { build as esbuild } from "esbuild";
import { rm, readFile, cp, access } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowlist = [
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "memorystore",
  "multer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "ws",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("Step 1: Building backend server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("Step 2: Copying frontend build into dist/public...");
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  const targetPublic = path.resolve(__dirname, "../dist/public");

  try {
    await access(frontendDist);
    await cp(frontendDist, targetPublic, { recursive: true });
    console.log(`Frontend copied: ${frontendDist} -> ${targetPublic}`);
  } catch (err) {
    console.warn("WARNING: Frontend dist not found at", frontendDist);
    console.warn("Build the frontend first: cd ../frontend && npx vite build");
  }

  console.log("\nBuild complete! Run 'npm start' to launch production server.");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
