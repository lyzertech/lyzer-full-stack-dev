/**@type {import('next').NextConfig} */

const {

  getLaravelApiUrl,

  assertProductionBuildConfig,

} = require('./lib/api-config.js')



assertProductionBuildConfig()



const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {

  // output: "export",  // Uncomment the following line only for building purposes. By default, this line should remain commented out.

  trailingSlash: true,

  // Keep POST /api/v1/login from redirecting to /api/v1/login/ (breaks Laravel + proxy)

  skipTrailingSlashRedirect: true,

  reactStrictMode: false,

  // swcMinify: true,

  basePath: isProd ? '' : undefined,

  assetPrefix: isProd ? '' : undefined,

  images: {

    loader: 'imgix',

    path: '/',

  },

  typescript: {

    ignoreBuildErrors: true,

  },

  images: {

    unoptimized: true,

  },

  reactStrictMode: false, // Disable Strict Mode if necessary

  async rewrites() {

    const laravelBase = getLaravelApiUrl()

    return [

      {

        source: '/api/v1/:path*',

        destination: `${laravelBase}/api/v1/:path*`,

      },

    ]

  },

}



module.exports = nextConfig

