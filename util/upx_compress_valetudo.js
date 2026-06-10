/* eslint-disable */
const fs = require("fs");
const { execFileSync } = require("child_process");

// Uses the system-provided `upx` binary (install it via your package manager, e.g.
// `apt-get install -y upx-ucl`, or from https://github.com/upx/upx/releases).
// Previously this used the git+Hypfer/upx npm wrapper — dropped to remove that
// build-time dependency on third-party infrastructure.
const UPX_ARGS = ["--lzma", "--best"];

const binaries = {
    armv7: {
        base: "./build_dependencies/pkg/v3.5/built-v22.17.1-linuxstatic-armv7",
        built: "./build/armv7/valetudo",
        out: "./build/armv7/valetudo.upx",
    },
    armv7_lowmem: {
        base: "./build_dependencies/pkg/v3.5/built-v22.17.1-linuxstatic-armv7",
        built: "./build/armv7/valetudo-lowmem",
        out: "./build/armv7/valetudo-lowmem.upx",
    },
    aarch64: {
        base: "./build_dependencies/pkg/v3.5/built-v22.17.1-linuxstatic-arm64",
        built: "./build/aarch64/valetudo",
        out: "./build/aarch64/valetudo.upx",
    }
};

function compress(file) {
    // upx compresses the given file in place
    execFileSync("upx", [...UPX_ARGS, file], {stdio: "inherit"});
}

/**
 * Note that this only works with patched base binaries.
 */
console.log("Starting UPX compression");

try {
    execFileSync("upx", ["--version"], {stdio: "ignore"});
} catch (e) {
    console.error("`upx` is not available on PATH. Install it (e.g. `apt-get install -y upx-ucl`) before running this script.");
    throw e;
}

Object.keys(binaries).forEach((name) => {
    const b = binaries[name];
    console.log("Compressing " + b.built);
    console.time(name);

    const baseSize = fs.readFileSync(b.base).length;
    const built = fs.readFileSync(b.built);

    const runtime = built.subarray(0, baseSize);
    const payload = built.subarray(baseSize);

    // UPX will reject files without the executable bit on linux. Also, default mode is 666
    const runtimePath = b.out + "_runtime";
    fs.writeFileSync(runtimePath, runtime, {mode: 0o777});

    compress(runtimePath);

    const compressedRuntime = fs.readFileSync(runtimePath);
    fs.unlinkSync(runtimePath);

    const fullNewBinary = Buffer.concat([compressedRuntime, payload]);

    fs.writeFileSync(b.out, fullNewBinary, {mode: 0o777});

    console.log("Successfully wrote " + b.out);
    console.timeEnd(name);
});
