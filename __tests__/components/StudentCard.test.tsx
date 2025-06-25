import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudentCard } from '@/components/StudentCard'
import type { StudentWithSkills } from '@/types/Student'

jest.mock('@/components/StudentDetailPopup', () => ({
  StudentDetailPopup: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? (
      <div data-testid="student-detail-popup">
        <button onClick={onClose} data-testid="close-popup">Close</button>
      </div>
    ) : null
  )
}))

const mockStudent: StudentWithSkills = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  country: 'USA',
  current_project: 'Building a social media app',
  coolest_thing: 'Created an AI chatbot',
  profile_image: 'https://example.com/profile.jpg',
  linkedin: 'https://linkedin.com/in/johndoe',
  github: 'https://github.com/johndoe',
  website: 'https://johndoe.com',
  summer_goals: ['Find co-founder', 'Launch MVP', 'Get funding'],
  skills: [
    { id: 'skill1', name: 'React', is_global: true, user_id: null, created_at: '2023-01-01' },
    { id: 'skill2', name: 'Node.js', is_global: true, user_id: null, created_at: '2023-01-01' },
    { id: 'skill3', name: 'Python', is_global: true, user_id: null, created_at: '2023-01-01' },
    { id: 'skill4', name: 'TypeScript', is_global: true, user_id: null, created_at: '2023-01-01' },
  ],
  created_at: '2023-01-01T00:00:00Z',
  isOnboarded: true,
  phone_number: null,
  updated_at: null,
}

describe('StudentCard', () => {
  describe('when student has complete profile', () => {
    it('should display student name and country', () => {
      render(<StudentCard student={mockStudent} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('USA')).toBeInTheDocument()
    })

    it('should display profile image when available', () => {
      render(<StudentCard student={mockStudent} />)

      const profileImage = screen.getByAltText('John Doe')
      expect(profileImage).toBeInTheDocument()
      expect(profileImage).toHaveAttribute('src', 'https://example.com/profile.jpg')
    })

    it('should display current project', () => {
      render(<StudentCard student={mockStudent} />)

      expect(screen.getByText('Current Project')).toBeInTheDocument()
      expect(screen.getByText('Building a social media app')).toBeInTheDocument()
    })

    it('should display coolest thing', () => {
      render(<StudentCard student={mockStudent} />)

      expect(screen.getByText('Coolest Thing')).toBeInTheDocument()
      expect(screen.getByText('Created an AI chatbot')).toBeInTheDocument()
    })

    it('should display first 3 skills with +more indicator', () => {
      render(<StudentCard student={mockStudent} />)

      const skillsSection = screen.getByText('Skills').closest('div')
      expect(skillsSection).toBeInTheDocument()
      
      if (skillsSection) {
        expect(within(skillsSection).getByText('React')).toBeInTheDocument()
        expect(within(skillsSection).getByText('Node.js')).toBeInTheDocument()
        expect(within(skillsSection).getByText('Python')).toBeInTheDocument()
        expect(within(skillsSection).getByText('+1 more')).toBeInTheDocument()
        expect(within(skillsSection).queryByText('TypeScript')).not.toBeInTheDocument()
      }
    })

    it('should display first 2 summer goals with +more indicator', () => {
      render(<StudentCard student={mockStudent} />)

      const lookingForSection = screen.getByText('Looking For').closest('div')
      expect(lookingForSection).toBeInTheDocument()
      
      if (lookingForSection) {
        expect(within(lookingForSection).getByText('Find co-founder')).toBeInTheDocument()
        expect(within(lookingForSection).getByText('Launch MVP')).toBeInTheDocument()
        expect(within(lookingForSection).getByText('+1 more')).toBeInTheDocument()
        expect(within(lookingForSection).queryByText('Get funding')).not.toBeInTheDocument()
      }
    })

    it('should display social media links', () => {
      render(<StudentCard student={mockStudent} />)

      const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
      const githubLink = screen.getByRole('link', { name: /github/i })
      const websiteLink = screen.getByRole('link', { name: /website/i })

      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/johndoe')
      expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe')
      expect(websiteLink).toHaveAttribute('href', 'https://johndoe.com')

      expect(linkedinLink).toHaveAttribute('target', '_blank')
      expect(githubLink).toHaveAttribute('target', '_blank')
      expect(websiteLink).toHaveAttribute('target', '_blank')
    })
  })

  describe('when student has minimal profile', () => {
    const minimalStudent: StudentWithSkills = {
      id: '2',
      name: null,
      email: 'minimal@example.com',
      country: null,
      current_project: null,
      coolest_thing: null,
      profile_image: null,
      linkedin: null,
      github: null,
      website: null,
      summer_goals: [],
      skills: [],
      created_at: '2023-01-01T00:00:00Z',
      isOnboarded: true,
      phone_number: null,
      updated_at: null,
    }

    it('should display fallback name and avatar', () => {
      render(<StudentCard student={minimalStudent} />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
      expect(screen.getByText('?')).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('should not display empty sections', () => {
      render(<StudentCard student={minimalStudent} />)

      expect(screen.queryByText('Current Project')).not.toBeInTheDocument()
      expect(screen.queryByText('Coolest Thing')).not.toBeInTheDocument()
      expect(screen.queryByText('Skills')).not.toBeInTheDocument()
      expect(screen.queryByText('Looking For')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('should not display country when not provided', () => {
      render(<StudentCard student={minimalStudent} />)

      expect(screen.queryByText('USA')).not.toBeInTheDocument()
    })
  })

  describe('when student has name with multiple words', () => {
    it('should display initials correctly', () => {
      const studentWithLongName: StudentWithSkills = {
        ...mockStudent,
        name: 'John Michael Doe',
        profile_image: null,
      }

      render(<StudentCard student={studentWithLongName} />)

      expect(screen.getByText('JMD')).toBeInTheDocument()
    })
  })

  describe('when student has exactly 3 skills', () => {
    it('should not show +more indicator', () => {
      const studentWith3Skills: StudentWithSkills = {
        ...mockStudent,
        skills: mockStudent.skills.slice(0, 3),
      }

      render(<StudentCard student={studentWith3Skills} />)

      const skillsSection = screen.getByText('Skills').closest('div')
      expect(skillsSection).toBeInTheDocument()
      
      if (skillsSection) {
        expect(within(skillsSection).getByText('React')).toBeInTheDocument()
        expect(within(skillsSection).getByText('Node.js')).toBeInTheDocument()
        expect(within(skillsSection).getByText('Python')).toBeInTheDocument()
        expect(within(skillsSection).queryByText('+1 more')).not.toBeInTheDocument()
      }
    })
  })

  describe('when student has exactly 2 summer goals', () => {
    it('should not show +more indicator', () => {
      const studentWith2Goals: StudentWithSkills = {
        ...mockStudent,
        summer_goals: ['Find co-founder', 'Launch MVP'],
      }

      render(<StudentCard student={studentWith2Goals} />)

      const lookingForSection = screen.getByText('Looking For').closest('div')
      expect(lookingForSection).toBeInTheDocument()
      
      if (lookingForSection) {
        expect(within(lookingForSection).getByText('Find co-founder')).toBeInTheDocument()
        expect(within(lookingForSection).getByText('Launch MVP')).toBeInTheDocument()
        expect(within(lookingForSection).queryByText('+1 more')).not.toBeInTheDocument()
      }
    })
  })

  describe('when clicking on card', () => {
    it('should open student detail popup', async () => {
      const user = userEvent.setup()
      render(<StudentCard student={mockStudent} />)

      // Find the card element (it has cursor-pointer class)
      const card = screen.getByText('John Doe').closest('.cursor-pointer')
      expect(card).toBeInTheDocument()
      
      if (card) {
        await act(async () => {
          await user.click(card)
        })
        expect(screen.getByTestId('student-detail-popup')).toBeInTheDocument()
      }
    })

    it('should not open popup when clicking on social links', async () => {
      const user = userEvent.setup()
      render(<StudentCard student={mockStudent} />)

      const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
      await act(async () => {
        await user.click(linkedinLink)
      })

      expect(screen.queryByTestId('student-detail-popup')).not.toBeInTheDocument()
    })

    it('should close popup when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<StudentCard student={mockStudent} />)

      const card = screen.getByText('John Doe').closest('.cursor-pointer')
      if (card) {
        await act(async () => {
          await user.click(card)
        })
        expect(screen.getByTestId('student-detail-popup')).toBeInTheDocument()

        const closeButton = screen.getByTestId('close-popup')
        await act(async () => {
          await user.click(closeButton)
        })

        expect(screen.queryByTestId('student-detail-popup')).not.toBeInTheDocument()
      }
    })
  })

  describe('when student has only one social link', () => {
    it('should display only available social links', () => {
      const studentWithLinkedInOnly: StudentWithSkills = {
        ...mockStudent,
        github: null,
        website: null,
      }

      render(<StudentCard student={studentWithLinkedInOnly} />)

      expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /website/i })).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper alt text for profile image', () => {
      render(<StudentCard student={mockStudent} />)

      const profileImage = screen.getByAltText('John Doe')
      expect(profileImage).toBeInTheDocument()
    })

    it('should have proper alt text when name is not available', () => {
      const studentWithoutName: StudentWithSkills = {
        ...mockStudent,
        name: null,
      }

      render(<StudentCard student={studentWithoutName} />)

      const profileImage = screen.getByAltText('Student')
      expect(profileImage).toBeInTheDocument()
    })

    it('should have clickable card area', () => {
      render(<StudentCard student={mockStudent} />)

      const card = screen.getByText('John Doe').closest('.cursor-pointer')
      expect(card).toHaveClass('cursor-pointer')
    })
  })

  describe('hover effects', () => {
    it('should have hover transition classes', () => {
      render(<StudentCard student={mockStudent} />)

      const card = screen.getByText('John Doe').closest('.cursor-pointer')
      expect(card).toHaveClass('hover:shadow-lg', 'transition-all', 'hover:-translate-y-1')
    })
  })
})