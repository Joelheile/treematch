# Student Type Usage Guide

The `Student.ts` file now always matches the database schema automatically. Here's how to use the different types:

## Database Types (Always in Sync)

```typescript
import { Student, StudentInsert, StudentUpdate, StudentRow, StudentWithMetadata } from '@/types/Student'

// These types automatically match your database schema
type Student = StudentRow           // For reading data from DB
type StudentInsert = StudentInsert  // For creating new students
type StudentUpdate = StudentUpdate  // For updating existing students
```

## Usage Examples

### 1. Creating a Student
```typescript
import { createStudentWithDefaults } from '@/types/Student'
import { studentService } from '@/integrations/supabase/student-service'

const newStudent = createStudentWithDefaults({
  name: 'John Doe',
  email: 'john@stanford.edu'
})

// Add additional fields
const studentData: StudentInsert = {
  ...newStudent,
  country: 'United States',
  skills: ['Web Development', 'Machine Learning'],
  summer_goals: ['Build a SaaS product']
}

const result = await studentService.createStudent(studentData)
```

### 2. Working with Database Results
```typescript
import { formatStudentFromDB } from '@/types/Student'

// When you get data from the database
const { data } = await studentService.getStudentById('123')

if (data) {
  // data is of type Student (matches database exactly)
  console.log(data.created_at)  // string | null
  console.log(data.skills)      // string[] | null
  
  // Convert to formatted version if needed for UI
  const formatted = formatStudentFromDB(data)
  console.log(formatted.createdAt)  // Date
  console.log(formatted.skills)     // string[] (never null)
}
```

### 3. Type Validation
```typescript
import { isValidStudent, isValidStudentFormatted } from '@/types/Student'

// Runtime type checking
if (isValidStudent(someData)) {
  // someData is now typed as Student
  console.log(someData.email) // string | null
}

if (isValidStudentFormatted(someData)) {
  // someData is now typed as StudentFormatted
  console.log(someData.email) // string (never null)
}
```

## Key Benefits

1. **Always in Sync**: Types automatically update when you run `npm run update-types`
2. **Type Safety**: Full TypeScript support with null-safety
3. **Flexibility**: Choose between database-exact types or formatted types for UI
4. **Validation**: Built-in type guards for runtime checking

## Migration Guide

If you have existing code using the old Student interface:

```typescript
// Old way
interface Student {
  name: string;
  email: string;
  // ...
}

// New way - choose the appropriate type:
import { Student, StudentFormatted } from '@/types/Student'

// For database operations:
const dbStudent: Student = { /* ... */ }

// For UI/display:
const uiStudent: StudentFormatted = formatStudentFromDB(dbStudent)
``` 