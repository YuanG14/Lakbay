# Lakbay — Phase 5

Smart Trip Cost Planner built with React, Vite, TypeScript and Firebase.

## Phase 5 features
- Firebase Email/Password Authentication
- Per-user Firestore vehicle storage
- Per-user Firestore saved-trip storage
- Signed-in user profile in the app shell
- Logout support
- Firebase configuration guard (no white screen when `.env` is missing)
- Existing Phase 1–4 trip calculator, garage and trip history flows preserved

## Setup
1. Run `npm install`.
2. Create a Firebase project and add a Web App.
3. In Firebase Authentication, enable **Email/Password**.
4. Create a **Cloud Firestore** database.
5. Copy `.env.example` to `.env` and insert your Firebase Web App config values.
6. Run `npm run dev`.

## Recommended Firestore rules
Use authenticated, user-scoped rules while developing:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Never commit `.env`. The provided `.gitignore` already excludes environment files.
