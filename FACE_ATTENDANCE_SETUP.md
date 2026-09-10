# Face Attendance Setup

## User flow
1. `/login` is now only an option screen: **Admin Login**, **Student Login**, and **Scan Face for Attendance**.
2. Students register from **Student Login -> Register**. Registration captures a face descriptor.
3. Students use **Student Login** to access their personal dashboard. Face scan does NOT log a student in.
4. **Scan Face for Attendance** only matches the face and marks attendance. It intentionally does not display the student's name, roll number, email, dashboard, or personal profile.
5. A successful scan shows **DONE — Attendance marked**. A duplicate scan for the same day also shows DONE without creating a second record.

## Clear existing students
Run once from `backend` after MongoDB is running:

```bash
npm run clear-students
```

This removes all users with role `student` and their attendance records. Admin accounts are kept.
