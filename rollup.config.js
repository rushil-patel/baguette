import babel from 'rollup-plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/index.ts',
  output: {
    file: './dist/index.min.js',
    format: 'iife',
    name: 'index',
    sourcemap: false
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    typescript({
      typescript: require('typescript')
    }),
    terser()
  ]

}
