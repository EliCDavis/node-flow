import { build, serve, BuildOptions } from 'esbuild';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';


const buildOptsNode: BuildOptions = {
  entryPoints: ['./src/index.ts'],
  outfile: './dist/node/NodeFlow.js',
  platform: 'node',
  target: ['es2018'],
  format: 'cjs',
  bundle: true,
  sourcemap: true,
  minify: false,
  treeShaking: false,
  plugins: [
  ]
};

const buildOptsWeb: BuildOptions = {
  entryPoints: ['./src/index.ts'],
  //   inject: [],
  outfile: './dist/web/NodeFlow.js',
  //   external: [],
  platform: 'browser',
  target: ['esNext'],
  //   format: 'cjs',
  bundle: true,
  sourcemap: true,
  minify: true,
  treeShaking: true,
  plugins: [
    //     NodeModulesPolyfillPlugin(),
    //     NodeGlobalsPolyfillPlugin({
    //       process: true,
    //     }),
  ],
};

const serveOpts = {
  servedir: './'
};

const flags = process.argv.filter(arg => /--[^=].*/.test(arg));
const enableWatch = (flags.includes('--watch'));

if (enableWatch) {

  buildOptsNode.watch = {
    onRebuild: (error, result) => {
      if (error) { console.error('watch node development build failed:', error); }
      else { console.log('watch node development build succeeded:', result); }
    }
  };

  buildOptsWeb.watch = {
    onRebuild: (error, result) => {
      if (error) { console.error('watch web development build failed:', error); }
      else { console.log('watch web development build succeeded:', result); }
    }
  };

  serve(serveOpts, {}).then((result) => {
    console.log(`serving extension from "${serveOpts.servedir}" at "http://${result.host}:${result.port}"`);
  });
}

build(buildOptsNode).then(() => enableWatch ? console.log("watching node development build...") : null);
build(buildOptsWeb).then(() => enableWatch ? console.log("watching web development build...") : null);