const { environment } = require("@rails/webpacker");
const webpack = require("webpack");
environment.plugins.prepend(
  "Provide",
  new webpack.ProvidePlugin({
    $: "jquery/src/jquery",
    jQuery: "jquery/src/jquery",
  })
);
const dotenv = require("dotenv");

dotenv.config({ path: __dirname + "/.env" });

environment.plugins.insert(
  "Environment",
  new webpack.EnvironmentPlugin(process.env)
);

module.exports = environment;
