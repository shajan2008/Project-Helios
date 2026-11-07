# SRMIST OD Track (React + Spring Boot)

## Run
Backend (Java 17, Maven):   cd backend && mvn spring-boot:run      -> http://localhost:8080
Frontend (Node 18+):        cd frontend && npm install && npm run dev -> http://localhost:5173

## Demo logins (OTP 123456)
student: any NetID (auto-created, e.g. arun)   mentor: priya   hod: rajesh
Flow: student submits -> mentor approves -> HOD approves.
Students must upload photo + ID on first login (camera check runs in browser). Mentor/HOD can Skip for now.

## Going live
- Replace fixed OTP in AuthController (/api/auth/otp, /api/auth/login) with real OTP + SMTP mail.
- Replace Auth.java token with Spring Security + JWT or SRM SSO.
- Switch H2 to MySQL/Postgres in application.properties + pom.xml; set app.secret and app.cors.
- Restrict mentor queue to assigned students; move uploads to S3/object storage.
- ml.js is an on-device quality gate; add backend face-match/OCR for real identity verification.
