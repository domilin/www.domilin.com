/* eslint-disable */
const path = require("path");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const darkThemeVars = require("antd/dist/dark-theme");
const {
  override,
  fixBabelImports,
  addLessLoader,
  useEslintRc,
  addWebpackPlugin,
  addWebpackResolve
  // addWebpackAlias
} = require("customize-cra");

module.exports = override(
  // addWebpackAlias({ "@": path.join(path.resolve(process.cwd()), "/src") }),
  addWebpackResolve({
    extensions: [".ts", ".tsx", ".js", ".jsx", ".scss"]
  }),
  addWebpackPlugin(new StyleLintPlugin()),
  useEslintRc("./.eslintrc.js"),
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      hack: `true;@import "${require.resolve(
        "antd/lib/style/color/colorPalette.less"
      )}";`,
      ...darkThemeVars
    }
  })
);
