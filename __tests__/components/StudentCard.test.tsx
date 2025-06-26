import type { StudentWithSkills } from "@/integrations/supabase/useStudents";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentCard } from "../../src/components/StudentCard";

jest.mock("@/components/StudentDetailPopup", () => ({
  StudentDetailPopup: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="student-detail-popup">
        <button onClick={onClose} data-testid="close-popup">
          Close
        </button>
      </div>
    ) : null,
}));

const mockStudent: StudentWithSkills = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  country: "USA",
  coolest_thing: "Created an AI chatbot",
  profile_image: "https://example.com/profile.jpg",
  linkedin: "https://linkedin.com/in/johndoe",
  github: "https://github.com/johndoe",
  website: "https://johndoe.com",
  summer_goals: ["Find co-founder", "Launch MVP", "Get funding"],
  skills: [
    {
      id: "skill1",
      name: "React",
      is_global: true,
      user_id: null,
      created_at: "2023-01-01",
    },
    {
      id: "skill2",
      name: "Node.js",
      is_global: true,
      user_id: null,
      created_at: "2023-01-01",
    },
    {
      id: "skill3",
      name: "Python",
      is_global: true,
      user_id: null,
      created_at: "2023-01-01",
    },
    {
      id: "skill4",
      name: "TypeScript",
      is_global: true,
      user_id: null,
      created_at: "2023-01-01",
    },
  ],
  created_at: "2023-01-01T00:00:00Z",
  isOnboarded: true,
  phone_number: null,
  updated_at: null,
};

describe("StudentCard", () => {
  it("should display student profile information correctly", () => {
    render(<StudentCard student={mockStudent} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("USA")).toBeInTheDocument();
    expect(screen.getByText("Created an AI chatbot")).toBeInTheDocument();
  });

  it("should display skills with +more indicator when over 3 skills", () => {
    render(<StudentCard student={mockStudent} />);

    const skillsSection = screen.getByText("Skills").closest("div");
    if (skillsSection) {
      expect(within(skillsSection).getByText("React")).toBeInTheDocument();
      expect(within(skillsSection).getByText("Node.js")).toBeInTheDocument();
      expect(within(skillsSection).getByText("Python")).toBeInTheDocument();
      expect(within(skillsSection).getByText("+1 more")).toBeInTheDocument();
      expect(
        within(skillsSection).queryByText("TypeScript")
      ).not.toBeInTheDocument();
    }
  });

  it("should display summer goals with +more indicator when over 2 goals", () => {
    render(<StudentCard student={mockStudent} />);

    const lookingForSection = screen.getByText("Looking For").closest("div");
    if (lookingForSection) {
      expect(
        within(lookingForSection).getByText("Find co-founder")
      ).toBeInTheDocument();
      expect(
        within(lookingForSection).getByText("Launch MVP")
      ).toBeInTheDocument();
      expect(
        within(lookingForSection).getByText("+1 more")
      ).toBeInTheDocument();
      expect(
        within(lookingForSection).queryByText("Get funding")
      ).not.toBeInTheDocument();
    }
  });

  it("should handle empty profile gracefully", () => {
    const minimalStudent: StudentWithSkills = {
      id: "2",
      name: null,
      email: "minimal@example.com",
      country: null,
      coolest_thing: null,
      profile_image: null,
      linkedin: null,
      github: null,
      website: null,

      skills: [],
      created_at: "2023-01-01T00:00:00Z",
      isOnboarded: true,
      phone_number: null,
      updated_at: null,
    };

    render(<StudentCard student={minimalStudent} />);

    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.queryByText("What's their thing")).not.toBeInTheDocument();
    expect(screen.queryByText("Skills")).not.toBeInTheDocument();
    expect(screen.queryByText("Looking For")).not.toBeInTheDocument();
  });

  it("should open detail popup when card is clicked", async () => {
    const user = userEvent.setup();
    render(<StudentCard student={mockStudent} />);

    const card = screen.getByText("John Doe").closest(".cursor-pointer");
    if (card) {
      await act(async () => {
        await user.click(card);
      });
      expect(screen.getByTestId("student-detail-popup")).toBeInTheDocument();
    }
  });

  it("should not open popup when social links are clicked", async () => {
    const user = userEvent.setup();
    render(<StudentCard student={mockStudent} />);

    const linkedinLink = screen.getByRole("link", { name: /linkedin/i });
    await act(async () => {
      await user.click(linkedinLink);
    });

    expect(
      screen.queryByTestId("student-detail-popup")
    ).not.toBeInTheDocument();
  });

  it("should not display current project section if student has none", () => {
    const { student: mockStudentWithoutProject } = createMockStudent({
      coolest_thing: null,
    });
    
    render(
      <StudentCard student={mockStudentWithoutProject as StudentWithSkills} />
    );
    
    expect(screen.queryByText("What's their thing")).not.toBeInTheDocument();
  });
});
