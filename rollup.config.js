import babel from 'rollup-plugin-babel'

export default {
  input: './src/index.js',
  output: {
    file: './lib/index.min.js',
    format: 'iife',
    name: 'index',
    sourcemap: false
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
