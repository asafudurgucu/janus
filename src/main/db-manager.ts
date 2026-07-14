import pg from 'pg'
import mysql from 'mysql2/promise'
import Redis from 'ioredis'
import type { DbConnection, DbQueryResult } from '@shared/types'

type ForwardOpener = (
  sshServerId: string,
  host: string,
  port: number
) => Promise<{ localPort: number; close: () => void }>

interface Live {
  close: () => Promise<void>
  query: (sql: string) => Promise<DbQueryResult>
  tables: () => Promise<string[]>
}

/** Manages pooled database connections, optionally tunneled through SSH. */
export class DbManager {
  private openForward: ForwardOpener
  private live = new Map<string, Live>()

  constructor(openForward: ForwardOpener) {
    this.openForward = openForward
  }

  private async endpoint(conn: DbConnection): Promise<{ host: string; port: number; closeFwd: () => void }> {
    if (conn.sshServerId) {
      const fwd = await this.openForward(conn.sshServerId, conn.host, conn.port)
      return { host: '127.0.0.1', port: fwd.localPort, closeFwd: fwd.close }
    }
    return { host: conn.host, port: conn.port, closeFwd: () => undefined }
  }

  private async build(conn: DbConnection): Promise<Live> {
    const { host, port, closeFwd } = await this.endpoint(conn)

    if (conn.type === 'postgres') {
      const client = new pg.Client({
        host,
        port,
        user: conn.username,
        password: conn.password,
        database: conn.database || undefined,
        connectionTimeoutMillis: 15000
      })
      await client.connect()
      return {
        close: async () => {
          await client.end().catch(() => undefined)
          closeFwd()
        },
        query: async (sql) => {
          const t = Date.now()
          const r = await client.query(sql)
          return {
            columns: r.fields?.map((f) => f.name) ?? [],
            rows: (r.rows as Record<string, unknown>[]) ?? [],
            rowCount: r.rowCount ?? r.rows?.length ?? 0,
            durationMs: Date.now() - t
          }
        },
        tables: async () => {
          const r = await client.query(
            "select table_name from information_schema.tables where table_schema not in ('pg_catalog','information_schema') order by table_name"
          )
          return r.rows.map((x) => String((x as { table_name: string }).table_name))
        }
      }
    }

    if (conn.type === 'mysql') {
      const client = await mysql.createConnection({
        host,
        port,
        user: conn.username,
        password: conn.password,
        database: conn.database || undefined,
        connectTimeout: 15000,
        multipleStatements: false
      })
      return {
        close: async () => {
          await client.end().catch(() => undefined)
          closeFwd()
        },
        query: async (sql) => {
          const t = Date.now()
          const [rows, fields] = (await client.query(sql)) as [unknown, unknown]
          const rowsArr = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : []
          const cols = Array.isArray(fields)
            ? (fields as { name: string }[]).map((f) => f.name)
            : rowsArr[0]
              ? Object.keys(rowsArr[0])
              : []
          return {
            columns: cols,
            rows: rowsArr,
            rowCount: Array.isArray(rows) ? rows.length : ((rows as { affectedRows?: number })?.affectedRows ?? 0),
            durationMs: Date.now() - t
          }
        },
        tables: async () => {
          const [rows] = (await client.query('show tables')) as [Record<string, unknown>[], unknown]
          return rows.map((r) => String(Object.values(r)[0]))
        }
      }
    }

    // redis
    const client = new Redis({
      host,
      port,
      password: conn.password || undefined,
      db: Number(conn.database) || 0,
      lazyConnect: true,
      maxRetriesPerRequest: 1
    })
    await client.connect()
    return {
      close: async () => {
        client.disconnect()
        closeFwd()
      },
      query: async (line) => {
        const t = Date.now()
        const parts = line.trim().split(/\s+/)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (client as any).call(...parts)
        const rows = Array.isArray(res)
          ? res.map((v, i) => ({ '#': i + 1, value: v === null ? '(nil)' : String(v) }))
          : [{ value: res === null ? '(nil)' : String(res) }]
        return {
          columns: Array.isArray(res) ? ['#', 'value'] : ['value'],
          rows,
          rowCount: Array.isArray(res) ? res.length : 1,
          durationMs: Date.now() - t
        }
      },
      tables: async () => {
        const keys = await client.keys('*')
        return keys.slice(0, 500)
      }
    }
  }

  private async get(conn: DbConnection): Promise<Live> {
    let l = this.live.get(conn.id)
    if (!l) {
      l = await this.build(conn)
      this.live.set(conn.id, l)
    }
    return l
  }

  async test(conn: DbConnection): Promise<boolean> {
    const l = await this.build(conn)
    try {
      await l.query(conn.type === 'redis' ? 'PING' : 'select 1')
    } finally {
      await l.close()
    }
    return true
  }

  async query(conn: DbConnection, sql: string): Promise<DbQueryResult> {
    return (await this.get(conn)).query(sql)
  }

  async tables(conn: DbConnection): Promise<string[]> {
    return (await this.get(conn)).tables()
  }

  async close(id: string): Promise<void> {
    const l = this.live.get(id)
    if (l) {
      await l.close()
      this.live.delete(id)
    }
  }

  shutdown(): void {
    for (const [, l] of this.live) l.close().catch(() => undefined)
    this.live.clear()
  }
}
