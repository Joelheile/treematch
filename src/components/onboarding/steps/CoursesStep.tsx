"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { FormData } from "../types";

interface CoursesStepProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  availableCourses: never[];
  coursesLoading: boolean;
  onNext?: () => void;
}

const ALL_COURSES = [
  {"catalog_number": "ANTHRO17", "name": "Police Violence in Global Perspective"},
  {"catalog_number": "ANTHRO1", "name": "Intro to Cultural & Social Anthropology"},
  {"catalog_number": "ARTSTUDI166", "name": "Plein Air Painting"},
  {"catalog_number": "ARTSTUDI177", "name": "Cell Phone Media Art"},
  {"catalog_number": "ARTSTUDI199", "name": "The Art of the Hand Puppet"},
  {"catalog_number": "BIO109A", "name": "The Emergence of Digital Biology and Precision Health"},
  {"catalog_number": "BIO11", "name": "Microbiology: Human Health & Society"},
  {"catalog_number": "BIO15", "name": "Biology in the News"},
  {"catalog_number": "BIO30", "name": "The Molecular Basis of Disease"},
  {"catalog_number": "BIO32", "name": "Introduction to Biotechnology: Detecting and Treating Disease"},
  {"catalog_number": "BIO50", "name": "Introduction to Cancer Biology"},
  {"catalog_number": "BIO8", "name": "Introduction to Human Physiology"},
  {"catalog_number": "CEE107", "name": "Understand Energy - Essentials"},
  {"catalog_number": "CEE111I", "name": "Improving Tiny Homes for the Unhoused"},
  {"catalog_number": "CEE111M", "name": "How We Will Build on Mars: Space-Ready Civil Engineering"},
  {"catalog_number": "CEE176A", "name": "Energy Efficient Buildings"},
  {"catalog_number": "CEE176C", "name": "Energy Storage Integration - Vehicles, Renewables, and the Grid"},
  {"catalog_number": "CEE176G", "name": "Sustainability Design Thinking"},
  {"catalog_number": "CHEM121", "name": "Understanding the Natural and Unnatural World through Chemistry"},
  {"catalog_number": "CHEM31A", "name": "Chemical Principles I"},
  {"catalog_number": "CHEM31B", "name": "Chemical Principles II"},
  {"catalog_number": "CHEM33", "name": "Structure and Reactivity of Carbon-Based Molecules"},
  {"catalog_number": "CHINLANG1A", "name": "First-Year Accelerated Chinese, Part 1"},
  {"catalog_number": "CLASSICS14", "name": "Greek and Latin Roots of English"},
  {"catalog_number": "CLASSICS31", "name": "Greek Mythology"},
  {"catalog_number": "CME106", "name": "Introduction to Probability and Statistics for Engineers"},
  {"catalog_number": "COMM112", "name": "Deliberative Polling and AI Governance: Shaping Ethical Parameters for AI"},
  {"catalog_number": "COMM113", "name": "Virtual Reality and Human Behavior"},
  {"catalog_number": "COMM114", "name": "Psychological Effects of Emerging Media & AI"},
  {"catalog_number": "COMPLIT161", "name": "Literature and Belonging"},
  {"catalog_number": "COMPMED182", "name": "How to Avoid the Walking Dead: Understanding Biosafety"},
  {"catalog_number": "COMPMED89S", "name": "The Neurobiology of Pain"},
  {"catalog_number": "CS103", "name": "Mathematical Foundations of Computing"},
  {"catalog_number": "CS106A", "name": "Programming Methodology"},
  {"catalog_number": "CS106B", "name": "Programming Abstractions"},
  {"catalog_number": "CS107", "name": "Computer Organization and Systems"},
  {"catalog_number": "CS109", "name": "Introduction to Probability for Computer Scientists"},
  {"catalog_number": "CS148", "name": "Introduction to Computer Graphics and Imaging"},
  {"catalog_number": "CS161", "name": "Design and Analysis of Algorithms"},
  {"catalog_number": "CS193C", "name": "Client-Side Internet Technologies"},
  {"catalog_number": "CS229", "name": "Machine Learning"},
  {"catalog_number": "CSRE16", "name": "Ghosts, Monsters and Zombies: Exploring Race through Horror"},
  {"catalog_number": "CSRE19", "name": "Music & Race in the United States"},
  {"catalog_number": "CTL53", "name": "Thriving Academically in College"},
  {"catalog_number": "DANCE48", "name": "Ballet I: Introduction to Ballet"},
  {"catalog_number": "DANCE58", "name": "Hip Hop I: Introduction to Hip Hop"},
  {"catalog_number": "DATASCI112", "name": "Principles of Data Science"},
  {"catalog_number": "DESIGN236", "name": "Community Print Shop Studio"},
  {"catalog_number": "ECON1", "name": "Principles of Economics"},
  {"catalog_number": "ECON109", "name": "Economics from Outer Space"},
  {"catalog_number": "ECON40", "name": "Introduction to Experimental and Behavioral Economics"},
  {"catalog_number": "ECON43", "name": "Introduction to Financial Decision-Making"},
  {"catalog_number": "EE101A", "name": "Circuits I"},
  {"catalog_number": "EE261", "name": "The Fourier Transform and Its Applications"},
  {"catalog_number": "EE263", "name": "Introduction to Linear Dynamical Systems"},
  {"catalog_number": "EE364A", "name": "Convex Optimization I"},
  {"catalog_number": "ENGLISH90", "name": "Fiction Writing"},
  {"catalog_number": "ENGLISH90V", "name": "Fiction Writing"},
  {"catalog_number": "ENGLISH91", "name": "Creative Nonfiction"},
  {"catalog_number": "ENGLISH91V", "name": "Creative Nonfiction"},
  {"catalog_number": "ENGLISH92V", "name": "Reading and Writing Poetry"},
  {"catalog_number": "ENGLISH9CV", "name": "Creative Expression in Writing"},
  {"catalog_number": "ENGR10", "name": "Introduction to Engineering Analysis"},
  {"catalog_number": "ENGR145", "name": "Technology Entrepreneurship"},
  {"catalog_number": "ENGR148", "name": "Principled Entrepreneurial Decisions"},
  {"catalog_number": "ENGR40M", "name": "An Intro to Making: What is EE"},
  {"catalog_number": "EPI259", "name": "Introduction to Probability and Statistics for Epidemiology"},
  {"catalog_number": "ESOLLANG689T", "name": "Interacting in California's Vineyard Culture"},
  {"catalog_number": "ESOLLANG691", "name": "Oral Presentation"},
  {"catalog_number": "ESOLLANG698A", "name": "Writing Academic English"},
  {"catalog_number": "FEMGEN154", "name": "Young Adult Literature and the Global Future"},
  {"catalog_number": "FEMGEN80", "name": "Video Games, Gender, and Sexuality"},
  {"catalog_number": "FILMEDIA4", "name": "Language of Film"},
  {"catalog_number": "FILMPROD106", "name": "Image and Sound: Filmmaking for the Digital Age"},
  {"catalog_number": "HISTORY202C", "name": "Capitalism in Motion: The Global History of Commodities"},
  {"catalog_number": "HISTORY285F", "name": "From Left to Right: Jews and Modern Politics"},
  {"catalog_number": "INTNLREL145", "name": "Genocide and Humanitarian Intervention"},
  {"catalog_number": "INTNLREL160", "name": "United Nations Peacekeeping"},
  {"catalog_number": "JAPANLNG1A", "name": "First-Year Accelerated Japanese, Part 1"},
  {"catalog_number": "LIFE172A", "name": "Introduction to Playful Mindfulness"},
  {"catalog_number": "MATH19", "name": "Calculus"},
  {"catalog_number": "MATH21", "name": "Calculus"},
  {"catalog_number": "ME102", "name": "Foundations of Product Realization"},
  {"catalog_number": "MS&E140", "name": "Accounting for Managers and Entrepreneurs"},
  {"catalog_number": "MS&E180", "name": "Organizations: Theory and Management"},
  {"catalog_number": "MS&E20", "name": "Discrete Probability Concepts And Models"},
  {"catalog_number": "MS&E254", "name": "The Ethical Analyst"},
  {"catalog_number": "MS&E254A", "name": "The Ethical Analyst"},
  {"catalog_number": "MS&E288", "name": "Managing Innovation and Driving Adoption of Frontier Technologies"},
  {"catalog_number": "MS&E75", "name": "Redefining Creativity: Designing Human Connections in an AI World"},
  {"catalog_number": "MTL10", "name": "Race, Migration, Empire: Law as Technology"},
  {"catalog_number": "MTL11", "name": "Caste and Gender in Bollywood and Beyond"},
  {"catalog_number": "MUSIC160", "name": "Stanford Summer Symphony"},
  {"catalog_number": "MUSIC167", "name": "Summer Chorus"},
  {"catalog_number": "MUSIC20AY", "name": "Exploring Soundscapes: Music-Making as a tool for Mental Wellbeing"},
  {"catalog_number": "MUSIC65A", "name": "Voice Class 1: Beginning Voice, Level 1 (Group)"},
  {"catalog_number": "MUSIC65B", "name": "Voice Class 2: Beginning Voice, Level 2 (Group)"},
  {"catalog_number": "ORALCOMM118", "name": "Public Speaking: Romancing the Room"},
  {"catalog_number": "PHIL35", "name": "Plato and Punishment"},
  {"catalog_number": "PHIL36", "name": "Equality: For and Against"},
  {"catalog_number": "PHIL41", "name": "What Should I Believe and Who Can I Trust?"},
  {"catalog_number": "PHIL60", "name": "Introduction to Philosophy of Science"},
  {"catalog_number": "PHYSICS15", "name": "Stars and Planets in a Habitable Universe"},
  {"catalog_number": "PHYSICS16", "name": "The Origin and Development of the Cosmos"},
  {"catalog_number": "PHYSWELL20", "name": "Badminton: Beginning"},
  {"catalog_number": "PHYSWELL21", "name": "Badminton: Intermediate"},
  {"catalog_number": "PHYSWELL26", "name": "Tennis: Beginning"},
  {"catalog_number": "PHYSWELL27", "name": "Tennis: Advanced Beginning"},
  {"catalog_number": "PHYSWELL28", "name": "Tennis: Intermediate"},
  {"catalog_number": "PHYSWELL50", "name": "Swimming: Beginning"},
  {"catalog_number": "PHYSWELL51", "name": "Swimming: Advanced Beginning"},
  {"catalog_number": "PHYSWELL52", "name": "Swimming: Intermediate"},
  {"catalog_number": "PHYSWELL71", "name": "Taiji Quan (Tai Chi)"},
  {"catalog_number": "PHYSWELL81", "name": "Yoga: Beginning"},
  {"catalog_number": "POLISCI1", "name": "The Science of Politics"},
  {"catalog_number": "POLISCI101", "name": "Introduction to International Relations"},
  {"catalog_number": "POLISCI103", "name": "Justice"},
  {"catalog_number": "POLISCI133", "name": "Ethics and Politics of Public Service"},
  {"catalog_number": "PSYC10", "name": "Unlocking the Mind: An Overview of Modern Psychotherapy Approaches"},
  {"catalog_number": "PWR1D", "name": "Writing Academic Arguments: The Art of the Essay"},
  {"catalog_number": "RELIGST23", "name": "The Devil Through the Ages"},
  {"catalog_number": "SOC130D", "name": "Games, Competition, and Play"},
  {"catalog_number": "SOC137D", "name": "How We Live and Die: The Social Context of Health and Health Care"},
  {"catalog_number": "SPANLANG1A", "name": "First-Year Accelerated Spanish, Part 1"},
  {"catalog_number": "STATS110", "name": "Introduction to Statistics for Engineering and the Sciences"},
  {"catalog_number": "STATS117", "name": "Introduction to Probability Theory"},
  {"catalog_number": "STATS118", "name": "Probability Theory for Statistical Inference"},
  {"catalog_number": "STATS141", "name": "Introduction to Statistics for Biology"},
  {"catalog_number": "STATS191", "name": "Introduction to Applied Statistics"},
  {"catalog_number": "STATS200", "name": "Introduction to Theoretical Statistics"},
  {"catalog_number": "STATS202", "name": "Statistical Learning and Data Science"},
  {"catalog_number": "STATS217", "name": "Introduction to Stochastic Processes I"},
  {"catalog_number": "STATS60", "name": "Introduction to Statistical Methods: Precalculus"},
  {"catalog_number": "STS103", "name": "How Do Machines Become (Im)Moral? Rethinking the Ethics of Artificial Intelligence"},
  {"catalog_number": "SYMSYS1", "name": "Minds and Machines"},
  {"catalog_number": "SYMSYS123", "name": "Neuroscience and Artificial Intelligence"},
  {"catalog_number": "TAPS20", "name": "Acting for Beginners"},
  {"catalog_number": "WELLNESS162", "name": "Digital Wellbeing - Healthy Relationships with Technology"}
];

export default function CoursesStep({
  formData,
  setFormData,
}: CoursesStepProps) {
  const [courseInput, setCourseInput] = useState("");
  const popularCourses = [
    { code: "CS229", name: "Machine Learning" },
    { code: "ENGR145", name: "Technology Entrepreneurship" },
    { code: "MS&E75", name: "Redefining Creativity: Designing Human Connections in an AI World" },
    { code: "MS&E288", name: "Managing Innovation and Driving Adoption of Frontier Technologies" },
    { code: "SYMSYS1", name: "Minds and Machines" },
  ];
  const suggestions = useMemo(() => {
    const q = courseInput.trim().toLowerCase();
    if (!q) return popularCourses;
    return ALL_COURSES.filter(
      (c) =>
        c.catalog_number.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [courseInput]);

  const addCourse = () => {
    const trimmedInput = courseInput.trim().toUpperCase();
    if (trimmedInput && !formData.courses.includes(trimmedInput)) {
      setFormData((prev) => ({
        ...prev,
        courses: [...prev.courses, trimmedInput],
      }));
      setCourseInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        const s = suggestions[0];
        const code = 'code' in s ? s.code : s.catalog_number;
        if (!formData.courses.includes(code)) {
          setFormData((prev) => ({
            ...prev,
            courses: [...prev.courses, code],
          }));
        }
        setCourseInput("");
      } else {
        addCourse();
      }
    }
  };

  const removeCourse = (courseToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course !== courseToRemove),
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-6 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
          What courses are you taking?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base px-2 leading-relaxed">
          Type a course code or name (like CS229 or "Machine Learning") to search and add it. Popular courses will appear as you type.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center min-h-0">
        <div className="w-full max-w-2xl px-2 space-y-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter course code or name"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full text-lg py-4 pr-14"
              autoFocus
              autocomplete="off"
            />
            {courseInput.trim() && suggestions.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.code || s.catalog_number}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-gray-900 text-sm flex flex-col"
                    onClick={() => {
                      const code = s.code || s.catalog_number;
                      if (!formData.courses.includes(code)) {
                        setFormData((prev) => ({
                          ...prev,
                          courses: [...prev.courses, code],
                        }));
                      }
                      setCourseInput("");
                    }}
                    disabled={formData.courses.includes(s.code || s.catalog_number)}
                  >
                    <span className="font-medium text-base">{s.name}</span>
                    <span className="text-gray-500 text-xs mt-0.5">{s.code || s.catalog_number}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {formData.courses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 text-center">
                Added Courses ({formData.courses.length})
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {formData.courses.map((course, index) => {
                  const courseObj = ALL_COURSES.find(
                    (c) => c.catalog_number === course
                  );
                  return (
                    <Button
                      key={course}
                      type="button"
                      variant="outline"
                      className="border-gray-300 bg-white hover:bg-red-50 text-gray-800 px-3 py-1 rounded-md text-sm shadow-sm transition flex items-center"
                      onClick={() => removeCourse(course)}
                    >
                      <span className="font-bold">{courseObj ? courseObj.catalog_number : course}</span>
                      <span className="font-semibold">
                        {courseObj ? courseObj.name : course}
                      </span>
                      <X className="w-3 h-3 ml-1" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          
          {formData.courses.length === 0 && (
            <p className="text-gray-500 text-sm text-center italic">
              No courses added yet. Start by entering a course code above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}