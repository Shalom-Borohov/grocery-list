import { db } from './db'

function requestResult<Result>(request: IDBRequest<Result>): Promise<Result> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function openAtStoredVersion(): Promise<IDBDatabase> {
  const request = indexedDB.open(db.name)

  request.onupgradeneeded = () => request.transaction?.abort()

  return requestResult(request)
}

export async function readRawStoredData() {
  const connection = await openAtStoredVersion()

  try {
    const storedNames = db.tables
      .map((table) => table.name)
      .filter((name) => connection.objectStoreNames.contains(name))

    const transaction = connection.transaction(storedNames, 'readonly')

    const readAll = (name: string): Promise<unknown[]> =>
      storedNames.includes(name) ? requestResult(transaction.objectStore(name).getAll()) : Promise.resolve([])

    const [items, listEntries, trips, sets, photos, thumbnails] = await Promise.all([
      readAll(db.items.name),
      readAll(db.listEntries.name),
      readAll(db.trips.name),
      readAll(db.sets.name),
      readAll(db.photos.name),
      readAll(db.thumbnails.name),
    ])

    return { records: { items, listEntries, trips, sets }, photos, thumbnails }
  } finally {
    connection.close()
  }
}
