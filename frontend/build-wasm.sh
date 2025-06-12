# frontend/build-wasm.sh
cd wasm
npm install
npm run asbuild:release
cp build/release.wasm ../public/formulae.wasm