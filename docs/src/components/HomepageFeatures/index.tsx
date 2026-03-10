import type {ReactNode} from 'react';

const BLACKSMITH_UI_URL = 'https://oluwatobimaxwell.github.io/libraries-project/';

type Capability = {
  title: string;
  description: ReactNode;
};

const capabilities: Capability[] = [
  {
    title: '60+ UI components',
    description: (
      <>
        Stop rebuilding buttons, forms, and modals from scratch. {' '}
        <a href={BLACKSMITH_UI_URL} target="_blank" rel="noopener noreferrer">blacksmith-ui</a> gives
        you a complete, themed component library that saves hundreds of hours across a project's lifetime.
      </>
    ),
  },
  {
    title: '75+ React hooks',
    description: (
      <>
        Common patterns like data fetching, form validation, auth state, and pagination are
        already solved in{' '}
        <a href={BLACKSMITH_UI_URL} target="_blank" rel="noopener noreferrer">blacksmith-ui/hooks</a>.
        Less reinventing, more building.
      </>
    ),
  },
  {
    title: 'Auth in minutes, not days',
    description:
      'Login, registration, session management, and route guards wired across Django and React. What typically takes 2-3 days is done before you write your first line of code.',
  },
  {
    title: 'AI that writes better code',
    description:
      'Advanced, curated AI skills give coding assistants 40% more context about your project. Better suggestions, fewer hallucinations, faster iteration.',
  },
  {
    title: 'Zero-drift type sync',
    description:
      'OpenAPI schema generation keeps Django serializers and TypeScript types in lockstep. Eliminates an entire class of bugs that typically costs teams hours per week.',
  },
  {
    title: 'Full CRUD in seconds',
    description:
      'One command generates models, serializers, viewsets, pages, hooks, and routes across both stacks. What used to take a full day now takes under 30 seconds.',
  },
  {
    title: 'Test-ready from day one',
    description:
      'Vitest, React Testing Library, and co-located test utilities are pre-configured. Every generated page and component has a test pattern to follow, so your team writes tests from the start — not as an afterthought.',
  },
  {
    title: 'Professional architecture',
    description:
      'An opinionated, scalable project structure with clear domain separation, shared utilities, and configuration layers. Built the way senior engineers would set it up.',
  },
  {
    title: 'No lock-in, ever',
    description:
      'Eject anytime to a standard Django + React project. Every line of generated code is clean, readable, and yours to keep. No proprietary runtime or hidden dependencies.',
  },
];

export default function HomepageFeatures(): ReactNode {
  return (
    <section className="bs-section bs-section--alt">
      <div className="container">
        <div className="bs-section__header">
          <h2 className="bs-section__title">
            Everything you need to ship faster, nothing that slows you down
          </h2>
          <p className="bs-section__desc">
            Blacksmith CLI is built for developers who value speed and quality equally.
            Every feature exists to remove friction from your workflow.
          </p>
        </div>
        <div className="bs-caps">
          {capabilities.map((cap) => (
            <div key={cap.title} className="bs-cap">
              <h3 className="bs-cap__title">{cap.title}</h3>
              <p className="bs-cap__desc">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
