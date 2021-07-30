const databaseName = 'virtualList'
let db
let isFinished = false

const controlDatabase = db => {
  db.onversionchange = () => {
    postMessage({ type: 'close', msg: '只能打开一个页面哦，请关闭其他页面再刷新哦' })
    db.close()
  }
}

// 创建数据库
const createDatabase = async () => {
  let version = 1
  const databases = await indexedDB.databases()
  const preDatabase = databases.find(({ name }) => name === databaseName)
  if (preDatabase) version = preDatabase.version + 1

  // indexedDB.deleteDatabase(databaseName)
  const database = indexedDB.open(databaseName, version)
  return new Promise((f, r) => {
    database.onsuccess = e => controlDatabase(e.target.result)
    database.onupgradeneeded = f
    database.onerror = r
  })
}

// 创建表
const createTable = db => {
  return new Promise((f, r) => {
    db.deleteObjectStore('list')
    const table = db.createObjectStore('list', { keyPath: 'id' })
    
    table.transaction.oncomplete = () => {
      const store = db.transaction('list', 'readwrite').objectStore('list')
    
      let i = 0
      while (i < 100000) {
        store.add({ id: i++, num: Math.random() })
      }

      f(i)
      isFinished = true
    }
  })
}

// 检索
const search = ({ size, start }) => {
  if (!isFinished) return []
  
  return new Promise((f, r) => {
    const store = db.transaction('list', 'readonly').objectStore('list')
    const range = IDBKeyRange.bound(start, start + size)
    const list = []
    
    store.openCursor(range).onsuccess = ({ target: { result } }) => {
      if (!result) {
        return f(list)
      }

      list.push(result.value)
      result.continue()
    }
  })
}

const start = async () => {
  const { target: { result } } = await createDatabase()
  const data = await createTable(db = result)
  postMessage({
    type: 'ok',
    data
  })
}

addEventListener('message', async ({ data }) => {
  const result = await search(data)
  postMessage(result)
})

start()