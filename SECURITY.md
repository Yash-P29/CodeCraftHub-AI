# Security Guidelines

## Git Ignore Strategy

- All `.env` files are ignored globally via the patterns:
  ```
  .env
  .env.*
  *.env
  ```
  This covers any environment configuration files placed anywhere in the repository, such as:
  - `backend/.env`
  - `backend/ai-service/.env`
  - `frontend/.env`
- SQLite databases are ignored to prevent accidental commit of data files:
  ```
  backend/data/*.db
  backend/data/codecraft.db
  ```
- Build artifacts and `node_modules` directories are ignored to keep the repo clean:
  ```
  frontend/dist/
  frontend-react/node_modules/
  frontend-react/dist/
  ```
- Any additional secret files should be added to `.gitignore` following the same pattern.

## Recommendations

- Review the repository for any new secret files before committing.
- Use the `.gitignore` file as the single source of truth for files that should not be tracked.
- When adding new services or configuration files, ensure they conform to the ignore rules.
- Keep this `SECURITY.md` updated with any changes to ignore policies.
