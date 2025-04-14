# Task Vault – Server

This is the **backend API** for the Task Vault project.  
Additional information about **Task Vault** can be found here: **[task-vault](https://github.com/task-vault)**

---

## API Documentation

You can find detailed API documentation, including example requests and responses, at:

👉 **[docs.hrustinszki.tech](https://docs.hrustinszki.tech)**

---

## Tech Stack

### Backend

- **Framework**: [NestJS](https://docs.nestjs.com) (deployed on AWS EC2)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- **Authentication**: JWT-based auth using [Passport](https://www.passportjs.org/concepts/authentication/)

### Database

- **Database**: PostgreSQL (managed by [Aiven.io](https://aiven.io))

---

## Project Structure

```pre
task-vault-server/
├── src/
│   ├── auth/          # Authentication logic (JWT, Passport)
│   ├── tasks/         # Task-related endpoints
│   ├── users/         # User registration and management
│   └── ...            # Additional modules
├── drizzle/           # ORM configuration and migrations
└── main.ts            # Entry point
```
