import { Client } from 'pg';

async function setupDatabase() {
  const credentials = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Soulking',
    database: 'postgres', // Connexion à la DB par défaut pour créer les autres
  };

  const client = new Client(credentials);

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    // 1. Création de l'utilisateur dédié s'il n'existe pas
    const userRes = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'ma2e_admin'");
    if (userRes.rowCount === 0) {
      console.log('Creating user "ma2e_admin"...');
      await client.query("CREATE USER ma2e_admin WITH PASSWORD 'ma2e_password'");
      console.log('User "ma2e_admin" created.');
    } else {
      console.log('User "ma2e_admin" already exists.');
    }

    // 2. Création de la base de données assignée à ce nouvel utilisateur
    const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'ma2edb'");
    if (dbRes.rowCount === 0) {
      console.log('Creating database "ma2edb"...');
      await client.query('CREATE DATABASE ma2edb OWNER ma2e_admin');
      console.log('Database "ma2edb" created successfully.');
    } else {
      console.log('Database "ma2edb" already exists.');
    }

  } catch (err) {
    console.error('Error during database setup:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
