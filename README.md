# CitiBike Dock Data

A website to allow users to look up usage for their favorite CitiBike docks

# Local Setup

(Example commands given for Ubuntu)

## Database

1. Install postgres
1. Create a user
   1. `$ sudo -u postgres psql`
   1. `postgres=# CREATE USER citibike WITH PASSWORD 'citibike'
1. Create a database and a shadow database
   1. `postgres=# CREATE DATABASE dockdata;`
   1. `postgres=# CREATE DATABASE dockdatashadow;`
1. Set permissions in psql to allow Prisma to perform actions
   1. `postgres=# \c dockdata`
   1. `dockdata=# GRANT ALL ON SCHEMA public TO citibike;`
   1. `postgres=# \c dockdatashadow`
   1. `dockdata=# GRANT ALL ON SCHEMA public TO citibike;`
1. Set your environment variables to reference these databases in `.env`
   1. `DATABASE_URL='postgresql://citibike:citibike@localhost/dockdata'`
   1. `SHADOW_DATABASE_URL='postgresql://citbike:citibike@localhost/dockdatashadow'`

# Development Commands

- Start the web server
  - `npm run dev`
- Start the prisma studio, allowing interactive access to the database via a web GUI
  - `npx prisma studio`
- Further Prisma CLI commands can be found on [their
  website](https://www.prisma.io/docs/orm/tools/prisma-cli)
