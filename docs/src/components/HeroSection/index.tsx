import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@site/src/components/Terminal';

const heroLines = [
  {type: 'command' as const, text: 'npx blacksmith init', arg: 'my-app'},
  {type: 'output' as const, text: '\nScaffolding Django + React project...'},
  {type: 'output' as const, text: 'Installing 60+ UI components, 75+ hooks...'},
  {type: 'output' as const, text: 'Configuring auth flow & OpenAPI sync...\n'},
  {type: 'success' as const, text: 'Done. Run cd my-app && blacksmith dev'},
];

export default function HeroSection(): ReactNode {
  return (
    <section className="bs-hero">
      <div className="bs-hero__inner">
        <p className="bs-hero__eyebrow">Blacksmith CLI</p>
        <h1 className="bs-hero__title">
          Ship fullstack apps 10x faster without cutting corners
        </h1>
        <p className="bs-hero__subtitle">
          Blacksmith CLI eliminates 90% of the setup and boilerplate in fullstack
          development. Get a production-grade Django + React application with 60+
          components, 75+ hooks, complete auth, and AI-powered tooling in a single command.
        </p>
        <div className="bs-hero__actions">
          <Link className="bs-btn bs-btn--primary" to="/docs/getting-started/installation">
            Get started
          </Link>
          <Link className="bs-btn bs-btn--ghost" to="/docs/">
            Documentation
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        <div className="bs-hero__code">
          <CodeBlock title="Terminal" lines={heroLines} />
        </div>
      </div>
    </section>
  );
}
