module.exports = {
    devServer: {
        proxy:{
            '/api':{
                target:'http://localhost:8088/',
                changeOrigin: true,
                ws:true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/socket':{
                target:'http://47.102.205.136:8091/',//TODO:push前改回去
                changeOrigin: true,
                ws:true,
                pathRewrite: {
                    '^/socket': ''
                }
            }
        }
    }
}