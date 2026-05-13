# Classroom Backend - Spring Boot

Backend API for the Classroom Management System built with Spring Boot 3.3.

## Tech Stack

- **Java 17** + **Spring Boot 3.3.5**
- **Spring Data JPA** (Hibernate)
- **Spring Security** + **JWT** (jjwt 0.12.6)
- **H2** (default, in-memory) / **PostgreSQL** (production)
- **Lombok** for boilerplate reduction
- **Bean Validation** (Jakarta)

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+

### Run with H2 (default)

```bash
cd backend
./mvnw spring-boot:run
```

The server starts on `http://localhost:8080`.  
H2 console available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:classroomdb`).

### Run with PostgreSQL

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres
```

Make sure PostgreSQL is running with database `classroomdb` on port 5432.

## Default Users (auto-seeded)

| Email | Password | Role |
|-------|----------|------|
| admin@classroom.com | admin123 | ADMIN |
| teacher@classroom.com | teacher123 | TEACHER |
| parent@classroom.com | parent123 | PARENT |
| student@classroom.com | student123 | STUDENT |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Overview
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/overview` | Dashboard statistics |

### Teachers
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/teachers` | All authenticated |
| GET | `/api/teachers/{id}` | All authenticated |
| POST | `/api/teachers` | ADMIN only |
| PUT | `/api/teachers/{id}` | ADMIN only |
| DELETE | `/api/teachers/{id}` | ADMIN only |

### Classes
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/classes` | All authenticated |
| GET | `/api/classes/{id}` | All authenticated |
| GET | `/api/classes/level/{level}` | All authenticated |
| POST | `/api/classes` | ADMIN only |
| PUT | `/api/classes/{id}` | ADMIN only |
| DELETE | `/api/classes/{id}` | ADMIN only |

### Students
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/students` | All authenticated |
| GET | `/api/students/{id}` | All authenticated |
| GET | `/api/students/class/{classId}` | All authenticated |
| POST | `/api/students` | ADMIN only |
| PUT | `/api/students/{id}` | ADMIN only |
| DELETE | `/api/students/{id}` | ADMIN only |

### Parents
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/parents` | All authenticated |
| GET | `/api/parents/{id}` | All authenticated |
| GET | `/api/parents/student/{studentId}` | All authenticated |
| POST | `/api/parents` | ADMIN only |
| PUT | `/api/parents/{id}` | ADMIN only |
| DELETE | `/api/parents/{id}` | ADMIN only |

### Matieres (Subjects)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/matieres` | All authenticated |
| POST | `/api/matieres` | ADMIN only |
| PUT | `/api/matieres/{id}` | ADMIN only |
| DELETE | `/api/matieres/{id}` | ADMIN only |

### Courses
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/courses` | All authenticated |
| GET | `/api/courses/matiere/{matiereId}` | All authenticated |
| POST | `/api/courses` | ADMIN only |
| PUT | `/api/courses/{id}` | ADMIN only |
| DELETE | `/api/courses/{id}` | ADMIN only |

### Rooms
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/rooms` | All authenticated |
| POST | `/api/rooms` | ADMIN only |
| PUT | `/api/rooms/{id}` | ADMIN only |
| DELETE | `/api/rooms/{id}` | ADMIN only |

### Calendar Events
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/calendar` | All authenticated |
| GET | `/api/calendar/date/{date}` | All authenticated |
| POST | `/api/calendar` | ADMIN only |
| PUT | `/api/calendar/{id}` | ADMIN only |
| DELETE | `/api/calendar/{id}` | ADMIN only |

### Schedule
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/schedule` | All authenticated |
| GET | `/api/schedule/class/{classId}` | All authenticated |
| GET | `/api/schedule/day/{day}` | All authenticated |
| POST | `/api/schedule` | ADMIN only |
| PUT | `/api/schedule/{id}` | ADMIN only |
| DELETE | `/api/schedule/{id}` | ADMIN only |

### Attendance
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/attendance` | All authenticated |
| GET | `/api/attendance/student/{studentId}` | All authenticated |
| GET | `/api/attendance/class/{classId}` | All authenticated |
| GET | `/api/attendance/stats/{studentId}` | All authenticated |
| POST | `/api/attendance` | ADMIN, TEACHER |
| PUT | `/api/attendance/{id}` | ADMIN, TEACHER |
| DELETE | `/api/attendance/{id}` | ADMIN only |

### Grades & Evaluations
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/grades/evaluations` | All authenticated |
| GET | `/api/grades/evaluations/class/{classId}` | All authenticated |
| POST | `/api/grades/evaluations` | ADMIN, TEACHER |
| DELETE | `/api/grades/evaluations/{id}` | ADMIN, TEACHER |
| GET | `/api/grades` | All authenticated |
| GET | `/api/grades/student/{studentId}` | All authenticated |
| POST | `/api/grades` | ADMIN, TEACHER |
| DELETE | `/api/grades/{id}` | ADMIN, TEACHER |
| GET | `/api/grades/averages/class/{classId}` | All authenticated |

### Payments
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/payments/reminders` | All authenticated |
| POST | `/api/payments/reminders` | ADMIN only |
| PATCH | `/api/payments/reminders/{id}/status` | ADMIN only |
| DELETE | `/api/payments/reminders/{id}` | ADMIN only |
| GET | `/api/payments/receipts` | All authenticated |
| POST | `/api/payments/receipts` | ADMIN only |
| DELETE | `/api/payments/receipts/{id}` | ADMIN only |

### Canteen
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/canteen` | All authenticated |
| GET | `/api/canteen/day/{day}` | All authenticated |
| POST | `/api/canteen` | ADMIN only |
| PUT | `/api/canteen/{id}` | ADMIN only |
| DELETE | `/api/canteen/{id}` | ADMIN only |

### Transport
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/transport` | All authenticated |
| GET | `/api/transport/{id}` | All authenticated |
| GET | `/api/transport/student/{studentId}` | All authenticated |
| POST | `/api/transport` | ADMIN only |
| PUT | `/api/transport/{id}` | ADMIN only |
| PATCH | `/api/transport/{id}/students` | ADMIN only |
| DELETE | `/api/transport/{id}` | ADMIN only |

### Schools
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/schools` | All authenticated |
| POST | `/api/schools` | ADMIN only |
| PUT | `/api/schools/{id}` | ADMIN only |
| DELETE | `/api/schools/{id}` | ADMIN only |

### Users (Admin management)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users` | ADMIN only |
| GET | `/api/users/role/{role}` | ADMIN only |
| POST | `/api/users` | ADMIN only |
| PUT | `/api/users/{id}` | ADMIN only |
| DELETE | `/api/users/{id}` | ADMIN only |

## Authentication

All API calls (except `/api/auth/**`) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
backend/
├── pom.xml
└── src/main/java/com/classroom/backend/
    ├── ClassroomApplication.java
    ├── config/
    │   ├── SecurityConfig.java
    │   ├── CorsConfig.java
    │   ├── GlobalExceptionHandler.java
    │   └── DataSeeder.java
    ├── security/
    │   ├── JwtTokenProvider.java
    │   ├── JwtAuthenticationFilter.java
    │   └── UserDetailsServiceImpl.java
    ├── model/
    │   ├── enums/ (UserRole, AttendanceStatus, etc.)
    │   └── (JPA entities)
    ├── dto/
    │   ├── auth/ (Login/Register DTOs)
    │   ├── request/ (Create/Update DTOs)
    │   └── response/ (Response DTOs)
    ├── repository/ (Spring Data JPA interfaces)
    ├── service/ (Business logic)
    └── controller/ (REST endpoints)
```
