const path = require("path");
const webpack = require("webpack");
const webpackPackageJson = require("./package.json");
const fs = require("fs");

module.exports = {
    entry: {
        index: "./src/index.ts"  // 修改入口文件为 .ts
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    optimization: {
    },
    plugins: [
        new webpack.BannerPlugin({
            entryOnly: true,
            raw: true,
            banner: () => {
                let userscriptHeaders = fs.readFileSync("./userscript-headers.js").toString("utf-8");
                userscriptHeaders = userscriptHeaders.replaceAll("${name}", webpackPackageJson["name"] || "");
                userscriptHeaders = userscriptHeaders.replaceAll("${namespace}", webpackPackageJson["namespace"] || "");
                userscriptHeaders = userscriptHeaders.replaceAll("${version}", webpackPackageJson["version"] || "");
                userscriptHeaders = userscriptHeaders.replaceAll("${description}", webpackPackageJson["description"] || "");
                userscriptHeaders = userscriptHeaders.replaceAll("${document}", webpackPackageJson["document"] || "");
                userscriptHeaders = userscriptHeaders.replaceAll("${author}", webpackPackageJson["author"] || "");
                userscriptHeaders = userscriptHeaders.replaceAll("${repository}", webpackPackageJson["repository"] || "");
                return userscriptHeaders;
            }
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,  // 添加 TypeScript 文件的支持
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],  // 添加 .ts 和 .tsx 扩展名
    }
};