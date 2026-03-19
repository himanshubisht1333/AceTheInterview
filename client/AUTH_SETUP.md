# Authentication Setup Guide

This guide explains how to use the authentication system integrated with your backend.

## ✅ What Was Added

### 1. **Zustand Store** (`src/lib/auth.store.ts`)
State management for authentication that handles:
- User registration with `register()`
- User login with `login()`
- Fetch current user with `getUser()`
- Logout with `logout()`
- Error handling with `clearError()`
- Persistent storage (token & user data survive page refreshes)

### 2. **Auth Pages**
- **Login Page**: `/auth/login` — Email & password login
- **Register Page**: `/auth/register` — Full registration with validation
- Auto-redirects to `/setup` on successful authentication

### 3. **Auth Input Component** (`src/components/auth/AuthInput.tsx`)
Reusable form input with:
- Icon support (Mail, Lock, User)
- Error message display
- Consistent brutalist styling

### 4. **API Service** (`src/lib/auth.service.ts`)
Utility functions for backend API calls:
- `registerUser()` — POST /register
- `loginUser()` — POST /login
- `getUser()` — GET /user (with token)

### 5. **Updated Navbar**
Added "Sign In" link to desktop and mobile navigation

---

## 🔧 Setup Instructions

### Step 1: Configure Backend URL

Create/update `.env.local` in the client folder:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

Or use your production backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Step 2: Backend Requirements

Your backend must expose these endpoints:

#### **POST /register**
Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

Error Response (400):
```json
{
  "message": "User already exists"
}
```

---

#### **POST /login**
Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt-token-here"
}
```

Error Response (400):
```json
{
  "message": "Invalid credentials"
}
```

---

#### **GET /user**
Headers:
```
Authorization: Bearer {token}
```

Response (200):
```json
{
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🚀 Usage in Components

### Using the Auth Store

```typescript
import { useAuthStore } from "@/lib/auth.store";

function MyComponent() {
  const { user, isAuthenticated, logout, login, register } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Available Store Methods & State

```typescript
// State
user: User | null              // Current user data
token: string | null           // JWT token
loading: boolean               // API call loading state
error: string | null           // Error message
isAuthenticated: boolean       // Auth status

// Methods
register(name, email, password)  // Register new user
login(email, password)           // Login user
getUser()                        // Fetch current user
logout()                         // Logout & clear state
clearError()                     // Clear error message
```

---

## 🔐 Protected Routes

To create protected routes that require authentication:

```typescript
"use client";

import { useAuthStore } from "@/lib/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return null;

  return <div>Protected content here</div>;
}
```

---

## 💾 Data Persistence

The store automatically saves the following to localStorage:
- User data (`user`)
- JWT token (`token`)
- Authentication status (`isAuthenticated`)

This means users stay logged in even after page refreshes!

---

## 🛠️ Testing

### Test Registration
1. Go to `/auth/register`
2. Fill in form and submit
3. Should redirect to `/setup` on success

### Test Login
1. Go to `/auth/login`
2. Enter credentials
3. Should redirect to `/setup` on success

### Test CORS (if needed)
If you get CORS errors, add this to your backend:

```javascript
// Express example
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
```

---

## 📝 Customization

### Modify Auth Endpoints

Edit `src/lib/api.config.ts`:

```typescript
export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: `${API_BASE_URL}/api/auth/register`,  // Change path here
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        GET_USER: `${API_BASE_URL}/api/auth/user`,
    },
};
```

### Add More Auth Actions

Edit `src/lib/auth.store.ts` to add password reset, update profile, etc.:

```typescript
resetPassword: async (email: string) => {
    // Add your logic here
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot POST /register" | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| CORS Error | Add CORS middleware to backend |
| Token not saving | Check browser localStorage in DevTools |
| 401 Unauthorized on /user | Token might be expired, user needs to login again |
| Store not updating | Ensure you're using `useAuthStore()` hook in a client component |

---

## 📦 Dependencies

- **zustand** ^4.x — State management
- **framer-motion** — Animations
- **lucide-react** — Icons
- **next** 16.x — Framework

All already installed! ✅

---

## 🎨 Styling

Auth pages use your existing brutalist theme:
- **Color scheme**: Dark background with lime (#C8F135) accents
- **Typography**: Space Grotesk for headers, Inter for body
- **Components**: 3px borders, hard box shadows (brutalist style)

---

## 📞 Need Help?

Check these files for reference:
- Store logic: `src/lib/auth.store.ts`
- API calls: `src/lib/auth.service.ts`
- Login page: `src/app/auth/login/page.tsx`
- Register page: `src/app/auth/register/page.tsx`
- Auth input: `src/components/auth/AuthInput.tsx`
