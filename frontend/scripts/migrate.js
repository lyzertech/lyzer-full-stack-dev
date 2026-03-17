const path = require('path')
const fs = require('fs/promises')
const mysql = require('mysql2/promise')

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'lyzer-nextjs',
  multipleStatements: true,
}

async function runSqlFile(connection, filePath) {
  const sql = await fs.readFile(filePath, 'utf8')

  // Basic cleanup: strip MySQL client-only directives like SOURCE and comments
  const cleaned = sql
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim().toUpperCase()
      if (trimmed.startsWith('--')) return false
      if (trimmed.startsWith('SOURCE ')) return false
      return true
    })
    .join('\n')
    .trim()

  if (!cleaned) {
    console.log(`Skipping empty SQL file: ${path.basename(filePath)}`)
    return
  }

  console.log(`\nRunning: ${path.basename(filePath)}`)
  await connection.query(cleaned)
  console.log(`Done: ${path.basename(filePath)}`)
}

async function main() {
  const baseDir = path.join(__dirname, '..', 'db')

  const orderedFiles = [
    // Core school tables (grades, teachers, rooms, students, subjects, settings)
    'create_all_tables.sql',

    // Finance tables in dependency order
    'create_finance_banks_table.sql',
    'create_finance_accounts_table.sql',
    'create_finance_categories_table.sql',
    'create_finance_transactions_table.sql',

    // Schema migration(s)
    'migrate_subjects_add_grade_id.sql',
  ]

  const connection = await mysql.createConnection(DB_CONFIG)

  try {
    console.log('Starting DB migration using files from /db')

    for (const file of orderedFiles) {
      const fullPath = path.join(baseDir, file)
      try {
        await fs.access(fullPath)
      } catch {
        console.log(`Skipping missing SQL file: ${file}`)
        continue
      }

      try {
        await runSqlFile(connection, fullPath)
      } catch (err) {
        console.error(`Error while running ${file}:`, err.message)
        throw err
      }
    }

    console.log('\nAll migrations completed successfully.')
  } finally {
    await connection.end()
  }
}

main().catch((err) => {
  console.error('\nMigration failed.', err)
  process.exitCode = 1
})


