# CitiBike Dock Data

A website to allow users to look up usage for their favorite CitiBike docks

# Local Setup
(Example commands given for Ubuntu)

## Database
1. Install `mysql-server`
a. `$ sudo apt install mysql-server`
1. Create a user
a. `$ sudo mysql`
a. `mysql> CREATE USER 'citibikeuser'@'localhost' IDENTIFIED BY 'password';`
1. Grant that user privileges
a. `mysql> GRANT ALL PRIVILEGES ON *.* TO 'citibike'@'localhost';`
1. Create a database and a shadow database
a. `mysql> CREATE DATABASE 'citibikedockdata';`
a. `mysql> CREATE DATABASE 'citibikedockdatashadow';`
1. Set your environment variables to reference these databases in `.env`
a. `DATABASE_URL='mysql://citibikeuser:password@localhost/citibikedockdata'`
a. `SHAODW_DATABASE_URL='mysql://citibikeuser:password@localhost/citibikedockdatashadow'`

# Development Commands
- Start the web server
  - `npm run dev`
- Start the prisma studio, allowing interactive access to the database via a web GUI
  - `npx prisma studio`
- Further Prisma CLI commands can be found on [their
    website](https://www.prisma.io/docs/orm/tools/prisma-cli)
