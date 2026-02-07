import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url
  if (pathname === '/past' || pathname === '/past/') {
    return context.redirect('/past-sites/', 302)
  }

  if (!pathname.startsWith('/past/')) {
    return next()
  }

  const proxyPath = pathname.replace('/past/', '/past-proxy/')
  return context.rewrite(`${proxyPath}${search}`)
})
