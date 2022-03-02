const esbuild = require('esbuild');
const glob = require('fast-glob');

const entryPoints = glob.sync(['./src/**/*.ts'], {ignore: './src/__tests__/*.ts'});

esbuild.build({
	entryPoints,
	format: 'cjs',
	outdir: 'lib',
	platform: 'node',
});
