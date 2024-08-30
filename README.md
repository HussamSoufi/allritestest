# Personal Task Manager Dashboard

This is a full-stack personal task manager web application that allows users to create, manage, and organize a list of to-do items. The application is built using Next.js for both the frontend and backend, with NextAuth for authentication, Prisma for ORM, and PostgreSQL for the database. The styling is done using Tailwind CSS.

## Features

- **User Authentication:** Secure sign-in and sign-out functionality using NextAuth.
- **Task Management:** Create, read, update, and delete tasks. Tasks can have a title, description, priority, and due date.
- **Task Sorting:** Sort tasks by priority or due date.
- **Notifications:** Display overdue and upcoming tasks to users.
- **Responsive UI:** Built with Tailwind CSS for a clean and responsive design.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js:** Version 14 or above - honestly, just get the latest
- **npm:** Node package manager - same here, latest!
- **Docker:** For running the PostgreSQL database locally
- **Git:** For cloning the repository, i will give you access to clone

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/HussamSoufi/allritestest.git
cd task-manager-dashboard
```

### 2. install dependencies

```bash
npm install
```

### 3. run the db

```bash
docker run --name my-postgres-container -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydatabase -p 5432:5432 -d postgres
```

### 4. Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. finally run it!!!

```bash
npm run dev
```

This command will start the development server. You can view the application in your browser at http://localhost:3000.

Let me know if you have any questions.
I would've also added log out functions, asking other users for review, etc..
Sadly i was a bit sick and couldn't invest as much time as i wanted on the dashboard.
-Sam
