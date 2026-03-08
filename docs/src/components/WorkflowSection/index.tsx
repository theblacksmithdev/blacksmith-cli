import type {ReactNode} from 'react';

const steps = [
  {
    label: 'Step 01',
    title: 'Initialize in under 60 seconds',
    desc: (
      <>
        Run <code>blacksmith init</code> to scaffold a complete project with Django, React, Vite,
        60+ components, 75+ hooks, and auth — fully configured and ready to develop.
      </>
    ),
  },
  {
    label: 'Step 02',
    title: 'Generate full CRUD instantly',
    desc: (
      <>
        Use <code>blacksmith make:resource</code> to create models, serializers, viewsets,
        pages, and hooks in one pass. A day's work in 30 seconds.
      </>
    ),
  },
  {
    label: 'Step 03',
    title: 'Develop with zero friction',
    desc: (
      <>
        Run <code>blacksmith dev</code> to start both servers with hot reload, real-time
        type synchronization, and AI-powered development context.
      </>
    ),
  },
];

export default function WorkflowSection(): ReactNode {
  return (
    <section className="bs-section">
      <div className="container">
        <div className="bs-section__header">
          <h2 className="bs-section__title">
            Three commands. Production-ready fullstack app.
          </h2>
          <p className="bs-section__desc">
            What typically takes a team 1-2 weeks of configuration and boilerplate,
            Blacksmith CLI does in minutes. No shortcuts on quality.
          </p>
        </div>
        <div className="bs-workflow">
          {steps.map((step) => (
            <div key={step.label} className="bs-workflow__step">
              <div className="bs-workflow__num">{step.label}</div>
              <h3 className="bs-workflow__title">{step.title}</h3>
              <p className="bs-workflow__desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
