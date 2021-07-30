const Koa = require('koa')
const Router = require('koa-router');
const fs = require('fs/promises')

const app = new Koa()
const router = new Router()

// 实现的虚拟列表
router.get('/', async (ctx, next) => {
  const content = await fs.readFile('./src/index.html', { encoding: 'utf8' })
  ctx.body = content
})

// worker
router.get('/worker.js', async (ctx, next) => {
  const content = await fs.readFile('./src/worker.js')
  ctx.body = content
})

const port = 9527

app.use(router.routes()).use(router.allowedMethods()).listen(port)
  
console.log(`预览：`, `\x1B[36mhttp://localhost:${port}\x1B[0m`)
