# SRMIST OD Track

SRMIST OD Track is a web application for submitting and approving on-duty (OD)
requests. It consists of a React frontend and a Spring Boot backend.

## Project Structure

```text
OD_FRONTEND/
├── backend/   # Spring Boot API and database access
└── frontend/  # React user interface
```

## Prerequisites

Install the following tools before running the application:

- Java 25 LTS
- Maven
- Node.js 18 or later
- npm

## Run the Application

Run the backend and frontend in separate terminal windows.

### 1. Start the backend

From the `OD_FRONTEND` directory:

```bash
cd backend
mvn spring-boot:run
```

The backend starts at [http://localhost:8080](http://localhost:8080).

### 2. Start the frontend

From the `OD_FRONTEND` directory, open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at [http://localhost:5173](http://localhost:5173).

Open the frontend URL in a browser after both servers are running.

## Demo Login Details

The demo OTP is:

```text
123456
```

Use one of these accounts:

| Role | NetID | Notes |
| --- | --- | --- |
| Student | Any NetID, such as `arun` | A student account is created automatically if it does not exist. |
| Mentor | `priya` | Reviews student requests. |
| HOD | `rajesh` | Gives the final approval. |

### Approval Flow

1. A student submits an OD request.
2. The mentor reviews and approves or rejects the request.
3. If approved by the mentor, the request moves to the HOD.
4. The HOD gives the final approval or rejects the request.

On a student's first login, the student must upload a passport-size photo and
identity document. The camera quality check runs in the browser. Mentor and HOD
accounts may skip profile setup.

## Development Notes

- The backend uses H2 as its local database.
- Uploaded profile files are stored locally in the configured upload directory.
- The frontend uses the backend API through the `/api` path.
- The frontend production build can be created with:

  ```bash
  cd frontend
  npm run build
  ```

## Production Checklist

Before deploying the application, complete the following:

- Replace the fixed demo OTP in `backend/src/main/java/edu/srmist/od/AuthController.java`
  with a secure, expiring OTP service and email delivery.
- Replace the custom token implementation in
  `backend/src/main/java/edu/srmist/od/Auth.java` with Spring Security and JWT
  or SRM SSO.
- Replace H2 with MySQL or PostgreSQL and update `pom.xml` and
  `application.properties`.
- Set a strong random value for `app.secret`.
- Set `app.cors` to the production frontend URL.
- Restrict mentor requests to their assigned students or department.
- Move uploaded files from local storage to secure object storage such as S3.
- Add backend face matching and OCR verification. The current `ml.js` checks
  image quality locally in the browser but does not verify identity.
