import type {ReactNode} from 'react';
import CodeBlock from '@site/src/components/Terminal';

const syncLines = [
  {type: 'command' as const, text: 'blacksmith sync'},
  {type: 'output' as const, text: '\nExtracting OpenAPI schema...'},
  {type: 'output' as const, text: 'Generating TypeScript types...'},
  {type: 'output' as const, text: 'Creating API client hooks...\n'},
  {type: 'success' as const, text: 'Generated 12 types, 8 hooks'},
  {type: 'success' as const, text: 'All types synchronized'},
];

const typeSyncPoints = [
  'Eliminates 100% of manual type duplication between backend and frontend',
  'Type-safe React Query hooks generated for every API endpoint',
  'Real-time sync on file changes — catch mismatches before they hit production',
];

const aiLines = [
  {type: 'command' as const, text: 'blacksmith setup:ai'},
  {type: 'output' as const, text: '\nGenerating CLAUDE.md...'},
  {type: 'output' as const, text: 'Creating project skills...'},
  {type: 'output' as const, text: 'Mapping architecture conventions...\n'},
  {type: 'success' as const, text: 'AI context files ready'},
];

const aiPoints = [
  'Curated skills give AI models 40% more architectural context about your project',
  'Project-aware CLAUDE.md maps conventions, patterns, and file structure',
  'Smarter code generation, fewer hallucinations, faster review cycles',
];

export default function ShowcaseSection(): ReactNode {
  return (
    <>
      <section className="bs-section bs-section--alt">
        <div className="container">
          <div className="bs-showcase">
            <div>
              <h2 className="bs-showcase__title">
                Zero type drift between Python and TypeScript
              </h2>
              <p className="bs-showcase__desc">
                Teams lose hours every week tracking down type mismatches between backend and frontend.
                Blacksmith CLI eliminates this entirely. Your Django serializers are the single source
                of truth — TypeScript interfaces and API hooks are always in sync.
              </p>
              <ul className="bs-showcase__list">
                {typeSyncPoints.map((point) => (
                  <li key={point}>
                    <span className="bs-showcase__check">{'\u2713'}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <CodeBlock title="blacksmith sync" lines={syncLines} />
            </div>
          </div>
        </div>
      </section>
      <section className="bs-section">
        <div className="container">
          <div className="bs-showcase bs-showcase--reverse">
            <div>
              <CodeBlock title="blacksmith setup:ai" lines={aiLines} />
            </div>
            <div>
              <h2 className="bs-showcase__title">
                AI-assisted development that actually works
              </h2>
              <p className="bs-showcase__desc">
                Most AI coding tools lack context about your specific project. Blacksmith CLI
                generates advanced skill files that make AI assistants dramatically smarter about
                your codebase — leading to higher-quality suggestions and fewer back-and-forth corrections.
              </p>
              <ul className="bs-showcase__list">
                {aiPoints.map((point) => (
                  <li key={point}>
                    <span className="bs-showcase__check">{'\u2713'}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
