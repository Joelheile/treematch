import type { StudentWithSkills } from "@/integrations/supabase/useStudents";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentCard } from "@/components/StudentCard";

jest.mock("@/integrations/supabase/useStudentLikes", () => ({
  useStudentLikes: () => ({
    isLiked: () => false,
    toggleLike: jest.fn(),
    isToggling: false,
  }),
}));

jest.mock("@/components/StudentDetailPopup", () => ({
  StudentDetailPopup: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="student-detail-popup" /> : null,
}));

const skill = (id: string, name: string): StudentWithSkills["skills"][number] => ({
  id,
  name,
  is_global: true,
  user_id: null,
  created_at: "2023-01-01",
});

const makeStudent = (overrides: Partial<StudentWithSkills> = {}): StudentWithSkills => ({
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  country: "Germany",
  university: "Stanford",
  courses: ["CS229"],
  coolest_thing: "Created an AI chatbot",
  goals: "Find a co-founder",
  profile_image: null,
  linkedin: "johndoe",
  github: null,
  website: null,
  instagram: null,
  twitter: null,
  phone_number: null,
  icon: null,
  has_engr145_team: null,
  isOnboarded: true,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: null,
  skills: [
    skill("skill1", "React"),
    skill("skill2", "Node.js"),
    skill("skill3", "Python"),
    skill("skill4", "TypeScript"),
  ],
  ...overrides,
});

describe("StudentCard", () => {
  it("shows name, course, story and goals", () => {
    render(<StudentCard student={makeStudent()} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("CS229")).toBeInTheDocument();
    expect(screen.getByText("Created an AI chatbot")).toBeInTheDocument();
    expect(screen.getByText("Find a co-founder")).toBeInTheDocument();
  });

  it("shows three skills and a +more counter", () => {
    render(<StudentCard student={makeStudent()} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
    expect(screen.getByText(/\+1 more/)).toBeInTheDocument();
  });

  it("falls back to Unknown and hides empty sections", () => {
    render(
      <StudentCard
        student={makeStudent({
          name: null,
          courses: null,
          coolest_thing: null,
          goals: null,
          linkedin: null,
          skills: [],
        })}
      />
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.queryByText(/thing\/story\/passion/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Why Stanford/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("opens the detail popup when the card is clicked", async () => {
    const user = userEvent.setup();
    render(<StudentCard student={makeStudent()} />);

    await act(async () => {
      await user.click(screen.getByText("John Doe"));
    });

    expect(screen.getByTestId("student-detail-popup")).toBeInTheDocument();
  });

  it("does not open the popup when a social link is clicked", async () => {
    const user = userEvent.setup();
    render(<StudentCard student={makeStudent()} />);

    await act(async () => {
      await user.click(screen.getByRole("link", { name: "LinkedIn" }));
    });

    expect(screen.queryByTestId("student-detail-popup")).not.toBeInTheDocument();
  });
});
