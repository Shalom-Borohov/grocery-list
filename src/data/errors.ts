class MissingRecordError extends Error {
  constructor(kind: string, id: string) {
    super(`no ${kind} with id ${id}`)
    this.name = 'MissingRecordError'
  }
}

export class DuplicateNameError extends Error {
  constructor(name: string) {
    super(`another item is already called ${name}`)
    this.name = 'DuplicateNameError'
  }
}

export function existing<Found>(found: Found | undefined, kind: string, id: string): Found {
  if (found === undefined) {
    throw new MissingRecordError(kind, id)
  }

  return found
}
