import { Client } from 'pg';

async function setupDatabase() {
  // Aucun secret en dur : les mots de passe proviennent de l'environnement.
  const superuserPassword = process.env.POSTGRES_SUPERUSER_PASSWORD ?? process.env.PGPASSWORD;
  const appPassword = process.env.DB_PASSWORD;
  if (!superuserPassword || !appPassword) {
    console.error(
      'Variables requises : POSTGRES_SUPERUSER_PASSWORD (ou PGPASSWORD) pour le superutilisateur postgres, et DB_PASSWORD pour le compte applicatif ma2e_admin.'
    );
    process.exit(1);
  }

  const credentials = {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? 'postgres',
    password: superuserPassword,
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
      await client.query(`CREATE USER ma2e_admin WITH PASSWORD ${client.escapeLiteral(appPassword)}`);
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
