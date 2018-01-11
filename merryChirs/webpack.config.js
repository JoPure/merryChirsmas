//这里引入webpack是为了使用webpack的热更新功能以及其他自带插件，见 module.exports.plugins
var webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    ImageminPlugin = require('imagemin-webpack-plugin').default;

//定义了一些文件夹的路径
var path = require('path');
var ROOT_PATH = path.resolve(__dirname);
var BUILD_PATH = path.resolve(ROOT_PATH, './dist');

var config = {
    entry: process.env.NODE_ENV === 'production' ? './webpack.entry.js' : [
        // 给webpack-dev-server启动一个本地服务，并连接到1122端口
        'webpack-dev-server/client?http://localhost:8081',
        // 给上面启动的本地服务开启自动刷新功能，'only-dev-server'的'only-'意思是只有当模块允许被热更新之后才有热加载，否则就是整页刷新
        'webpack/hot/only-dev-server',
        './webpack.entry.js'
    ],
    output: {
        filename: 'js/webpack.bundle.js',
        path: BUILD_PATH,
        publicPath: ''
    },
    context: __dirname,
    module: {
        rules: [{
            test: /\.css$/,
            use: process.env.NODE_ENV == 'production' ? ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            }) :
                [
                    'style-loader',
                    'css-loader?sourceMap' // 这里需要配置sourceMap参数
                ]
        }, {
            test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
            use: [
                'url-loader?limit=8192&name=./img/[name].[ext]'
            ]
        }, {
            test: /\.html$/,
            use: [
                'html-loader'
            ]
        }]
    },
    plugins: [
        new webpack.EnvironmentPlugin(['NODE_ENV']),
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ],
    // 定义webpack-dev-server
    devServer: {
        contentBase: path.resolve(__dirname, 'src'), // 静态文件目录位置，只有当你需要在webpack-dev-server本地服务器查看或引用静态文件时用到。类型：boolean | string | array, 建议使用绝对路径
        hot: true, // 模块热更新。依赖于HotModuleReplacementPlugin
        noInfo: false, // 在命令行窗口显示打包信息
    }
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
        //压缩图片
        new ImageminPlugin({
            pngquant: {
                quality: '70'
            }
        }),
        // 单独打包css
        new ExtractTextPlugin({filename: '[name].css', disable: false, allChunks: true}),
        // js、css都会压缩
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['$super', '$', 'exports', 'require', 'module', '_', '*.swf']
            },
            compress: {
                warnings: false
            },
            output: {
                comments: false
            }
        }))
}

module.exports = config;