module.exports = {
  'type': 'postgres',
  'host': process.env.DB_HOST,
  'port': process.env.DB_PORT,
  'username': process.env.DB_USERNAME,
  'password': process.env.DB_PASSWORD,
  'database': process.env.DB_NAME,
  'synchronize': true,
  'logging': false,
  'entities': [
    'src/entities/*.ts'
  ],
  'migrations': [
    'src/migration/**/*.ts'
  ],
  'subscribers': [
    'src/subscriber/**/*.ts'
  ],
  'cli': {
    'entitiesDir': 'src/entities',
    'migrationsDir': 'src/migration',
    'subscribersDir': 'src/subscriber'
  },
  'seeds': ['src/seeding/seeders/mainSeeder.ts'],
  'factories': ['src/seeding/factories/*.ts']
}
