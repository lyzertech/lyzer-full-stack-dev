const mysql = require('mysql2/promise')
const fs = require('fs/promises')
const path = require('path')

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'lyzer-nextjs',
  multipleStatements: true,
}

async function main() {
  const connection = await mysql.createConnection(DB_CONFIG)

  try {
    console.log('Creating _prisma_migrations table...')
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'create_prisma_migrations_table.sql')
    const sql = await fs.readFile(sqlPath, 'utf8')
    await connection.query(sql)
    
    console.log('✓ _prisma_migrations table created successfully')
    console.log('\nNext steps:')
    console.log('1. Mark your initial migration as applied:')
    console.log('   npx prisma migrate resolve --applied init')
    console.log('2. Generate Prisma Client:')
    console.log('   npm run prisma:generate')
    
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('✓ _prisma_migrations table already exists')
    } else {
      console.error('Error:', err.message)
      throw err
    }
  } finally {
    await connection.end()
  }
}

main().catch((err) => {
  console.error('\nSetup failed:', err)
  process.exitCode = 1
})
