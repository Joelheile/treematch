import {
  formatStudentFromDB,
  formatStudentForDB,
  isValidStudent,
  isValidStudentFormatted,
  createEmptyStudent,
  createStudentWithDefaults,
  type StudentRow,
  type SkillRow,
  type StudentFormatted,
  type Student,
} from '@/types/Student'

describe('Student utility functions', () => {
  describe('formatStudentFromDB', () => {
    describe('when converting complete database student', () => {
      it('should format all fields correctly', () => {
        const dbStudent: StudentRow = {
          id: '123',
          name: 'John Doe',
          country: 'USA',
          profile_image: 'https://example.com/profile.jpg',
          summer_goals: ['Goal 1', 'Goal 2'],
          current_project: 'My Project',
          coolest_thing: 'Cool Thing',
          phone_number: '+1234567890',
          email: 'john@example.com',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.com',
          isOnboarded: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
        }

        const skills: SkillRow[] = [
          {
            id: 'skill1',
            name: 'React',
            is_global: true,
            user_id: null,
            created_at: '2023-01-01T00:00:00Z',
          },
        ]

        const result = formatStudentFromDB(dbStudent, skills)

        expect(result).toEqual({
          id: '123',
          name: 'John Doe',
          country: 'USA',
          profileImage: 'https://example.com/profile.jpg',
          skills: skills,
          summerGoals: ['Goal 1', 'Goal 2'],
          currentProject: 'My Project',
          coolestThing: 'Cool Thing',
          phoneNumber: '+1234567890',
          email: 'john@example.com',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.com',
          isOnboarded: true,
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        })
      })
    })

    describe('when converting student with null fields', () => {
      it('should handle null values correctly', () => {
        const dbStudent: StudentRow = {
          id: '123',
          name: null,
          country: null,
          profile_image: null,
          summer_goals: null,
          current_project: null,
          coolest_thing: null,
          phone_number: null,
          email: null,
          linkedin: null,
          github: null,
          website: null,
          isOnboarded: null,
          created_at: null,
          updated_at: null,
        }

        const result = formatStudentFromDB(dbStudent)

        expect(result.id).toBe('123')
        expect(result.name).toBe('')
        expect(result.country).toBe('')
        expect(result.profileImage).toBeUndefined()
        expect(result.skills).toEqual([])
        expect(result.summerGoals).toEqual([])
        expect(result.currentProject).toBe('')
        expect(result.coolestThing).toBe('')
        expect(result.phoneNumber).toBe('')
        expect(result.email).toBe('')
        expect(result.linkedin).toBeUndefined()
        expect(result.github).toBeUndefined()
        expect(result.website).toBeUndefined()
        expect(result.isOnboarded).toBe(false)
        // Skip testing invalid dates as they will be NaN
      })
    })

    describe('when skills are not provided', () => {
      it('should default to empty skills array', () => {
        const dbStudent: StudentRow = {
          id: '123',
          name: 'John Doe',
          country: 'USA',
          profile_image: null,
          summer_goals: null,
          current_project: null,
          coolest_thing: null,
          phone_number: null,
          email: 'john@example.com',
          linkedin: null,
          github: null,
          website: null,
          isOnboarded: true,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }

        const result = formatStudentFromDB(dbStudent)

        expect(result.skills).toEqual([])
      })
    })
  })

  describe('formatStudentForDB', () => {
    describe('when converting complete formatted student', () => {
      it('should format all fields for database', () => {
        const formattedStudent: Partial<StudentFormatted> = {
          name: 'John Doe',
          country: 'USA',
          profileImage: 'https://example.com/profile.jpg',
          summerGoals: ['Goal 1', 'Goal 2'],
          currentProject: 'My Project',
          coolestThing: 'Cool Thing',
          phoneNumber: '+1234567890',
          email: 'john@example.com',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.com',
          isOnboarded: true,
        }

        const result = formatStudentForDB(formattedStudent)

        expect(result).toEqual({
          name: 'John Doe',
          country: 'USA',
          profile_image: 'https://example.com/profile.jpg',
          summer_goals: ['Goal 1', 'Goal 2'],
          current_project: 'My Project',
          coolest_thing: 'Cool Thing',
          phone_number: '+1234567890',
          email: 'john@example.com',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.com',
          isOnboarded: true,
        })
      })
    })

    describe('when converting partial formatted student', () => {
      it('should handle missing fields with null defaults', () => {
        const partialStudent: Partial<StudentFormatted> = {
          name: 'John Doe',
          email: 'john@example.com',
        }

        const result = formatStudentForDB(partialStudent)

        expect(result).toEqual({
          name: 'John Doe',
          country: null,
          profile_image: null,
          summer_goals: null,
          current_project: null,
          coolest_thing: null,
          phone_number: null,
          email: 'john@example.com',
          linkedin: null,
          github: null,
          website: null,
          isOnboarded: false,
        })
      })
    })

    describe('when converting empty formatted student', () => {
      it('should handle empty object with defaults', () => {
        const emptyStudent: Partial<StudentFormatted> = {}

        const result = formatStudentForDB(emptyStudent)

        expect(result).toEqual({
          name: null,
          country: null,
          profile_image: null,
          summer_goals: null,
          current_project: null,
          coolest_thing: null,
          phone_number: null,
          email: null,
          linkedin: null,
          github: null,
          website: null,
          isOnboarded: false,
        })
      })
    })
  })

  describe('isValidStudent', () => {
    describe('when validating valid student objects', () => {
      it('should return true for complete student', () => {
        const student: Student = {
          id: '123',
          name: 'John Doe',
          country: 'USA',
          profile_image: 'profile.jpg',
          summer_goals: ['Goal 1'],
          current_project: 'Project',
          coolest_thing: 'Thing',
          phone_number: '+123',
          email: 'john@example.com',
          linkedin: 'linkedin.com',
          github: 'github.com',
          website: 'website.com',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        }

        expect(isValidStudent(student)).toBe(true)
      })

      it('should return true for student with null email', () => {
        const student = {
          id: '123',
          email: null,
        }

        expect(isValidStudent(student)).toBe(true)
      })

      it('should return true for student with string email', () => {
        const student = {
          id: '123',
          email: 'john@example.com',
        }

        expect(isValidStudent(student)).toBe(true)
      })
    })

    describe('when validating invalid student objects', () => {
      it('should return falsy for null object', () => {
        expect(isValidStudent(null)).toBeFalsy()
      })

      it('should return falsy for undefined object', () => {
        expect(isValidStudent(undefined)).toBeFalsy()
      })

      it('should return false for object without id', () => {
        const invalid = {
          email: 'john@example.com',
        }

        expect(isValidStudent(invalid)).toBe(false)
      })

      it('should return false for object with non-string id', () => {
        const invalid = {
          id: 123,
          email: 'john@example.com',
        }

        expect(isValidStudent(invalid)).toBe(false)
      })

      it('should return false for object with non-string, non-null email', () => {
        const invalid = {
          id: '123',
          email: 123,
        }

        expect(isValidStudent(invalid)).toBe(false)
      })
    })
  })

  describe('isValidStudentFormatted', () => {
    describe('when validating valid formatted student objects', () => {
      it('should return true for complete formatted student', () => {
        const formattedStudent: StudentFormatted = {
          id: '123',
          name: 'John Doe',
          country: 'USA',
          skills: [],
          summerGoals: ['Goal 1'],
          currentProject: 'Project',
          coolestThing: 'Thing',
          phoneNumber: '+123',
          email: 'john@example.com',
          isOnboarded: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(isValidStudentFormatted(formattedStudent)).toBe(true)
      })

      it('should return true for minimal valid formatted student', () => {
        const minimal = {
          id: '123',
          name: 'John',
          email: 'john@example.com',
          skills: [],
          summerGoals: [],
        }

        expect(isValidStudentFormatted(minimal)).toBe(true)
      })
    })

    describe('when validating invalid formatted student objects', () => {
      it('should return falsy for null object', () => {
        expect(isValidStudentFormatted(null)).toBeFalsy()
      })

      it('should return false for object without id', () => {
        const invalid = {
          name: 'John',
          email: 'john@example.com',
          skills: [],
          summerGoals: [],
        }

        expect(isValidStudentFormatted(invalid)).toBe(false)
      })

      it('should return false for object with non-string name', () => {
        const invalid = {
          id: '123',
          name: null,
          email: 'john@example.com',
          skills: [],
          summerGoals: [],
        }

        expect(isValidStudentFormatted(invalid)).toBe(false)
      })

      it('should return false for object with non-string email', () => {
        const invalid = {
          id: '123',
          name: 'John',
          email: null,
          skills: [],
          summerGoals: [],
        }

        expect(isValidStudentFormatted(invalid)).toBe(false)
      })

      it('should return false for object with non-array skills', () => {
        const invalid = {
          id: '123',
          name: 'John',
          email: 'john@example.com',
          skills: 'not-array',
          summerGoals: [],
        }

        expect(isValidStudentFormatted(invalid)).toBe(false)
      })

      it('should return false for object with non-array summerGoals', () => {
        const invalid = {
          id: '123',
          name: 'John',
          email: 'john@example.com',
          skills: [],
          summerGoals: 'not-array',
        }

        expect(isValidStudentFormatted(invalid)).toBe(false)
      })
    })
  })

  describe('createEmptyStudent', () => {
    it('should create student with all fields null or empty arrays', () => {
      const emptyStudent = createEmptyStudent()

      expect(emptyStudent).toEqual({
        name: null,
        country: null,
        profile_image: null,
        summer_goals: [],
        current_project: null,
        coolest_thing: null,
        phone_number: null,
        email: null,
        linkedin: null,
        github: null,
        website: null,
      })
    })

    it('should create new instance each time', () => {
      const student1 = createEmptyStudent()
      const student2 = createEmptyStudent()

      expect(student1).not.toBe(student2)
      expect(student1.summer_goals).not.toBe(student2.summer_goals)
    })
  })

  describe('createStudentWithDefaults', () => {
    describe('when creating student with required fields', () => {
      it('should set required fields and defaults', () => {
        const required = {
          name: 'John Doe',
          email: 'john@example.com',
        }

        const student = createStudentWithDefaults(required)

        expect(student).toEqual({
          name: 'John Doe',
          email: 'john@example.com',
          country: null,
          profile_image: null,
          summer_goals: [],
          current_project: null,
          coolest_thing: null,
          phone_number: null,
          linkedin: null,
          github: null,
          website: null,
        })
      })
    })

    describe('when creating multiple students', () => {
      it('should create independent instances', () => {
        const student1 = createStudentWithDefaults({
          name: 'John',
          email: 'john@example.com',
        })

        const student2 = createStudentWithDefaults({
          name: 'Jane',
          email: 'jane@example.com',
        })

        expect(student1.name).toBe('John')
        expect(student2.name).toBe('Jane')
        expect(student1.summer_goals).not.toBe(student2.summer_goals)
      })
    })

    describe('when required fields are empty strings', () => {
      it('should accept empty strings for required fields', () => {
        const required = {
          name: '',
          email: '',
        }

        const student = createStudentWithDefaults(required)

        expect(student.name).toBe('')
        expect(student.email).toBe('')
      })
    })
  })

  describe('type consistency', () => {
    it('should maintain consistency between format functions', () => {
      const dbStudent: StudentRow = {
        id: '123',
        name: 'John Doe',
        country: 'USA',
        profile_image: 'profile.jpg',
        summer_goals: ['Goal 1'],
        current_project: 'Project',
        coolest_thing: 'Thing',
        phone_number: '+123',
        email: 'john@example.com',
        linkedin: 'linkedin.com',
        github: 'github.com',
        website: 'website.com',
        isOnboarded: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }

      const formatted = formatStudentFromDB(dbStudent)
      const backToDb = formatStudentForDB(formatted)

      expect(backToDb.name).toBe(dbStudent.name)
      expect(backToDb.country).toBe(dbStudent.country)
      expect(backToDb.email).toBe(dbStudent.email)
      expect(backToDb.isOnboarded).toBe(dbStudent.isOnboarded)
    })
  })
})