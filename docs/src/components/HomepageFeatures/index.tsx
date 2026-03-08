import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'One Command Setup',
    icon: '$ _',
    description: (
      <>
        Scaffold a complete fullstack project with Django backend and React
        frontend in a single command. No boilerplate, no configuration headaches.
      </>
    ),
  },
  {
    title: 'Automatic Type Sync',
    icon: '{ }',
    description: (
      <>
        OpenAPI schema generation keeps your Django serializers and TypeScript
        types in perfect sync. Change your backend, frontend types update
        automatically.
      </>
    ),
  },
  {
    title: 'Full-Stack Scaffolding',
    icon: '+ R',
    description: (
      <>
        Generate complete CRUD resources across both stacks with{' '}
        <code>blacksmith make:resource</code>. Models, serializers, viewsets,
        pages, hooks, and routes — all wired up.
      </>
    ),
  },
  {
    title: 'AI-Ready Development',
    icon: 'AI',
    description: (
      <>
        Generate project-aware CLAUDE.md and skill files that give AI coding
        assistants deep context about your project architecture and conventions.
      </>
    ),
  },
  {
    title: 'Production Ready',
    icon: '>>',
    description: (
      <>
        Built-in authentication, production builds, static file collection, and
        environment management. Your project is deployment-ready from day one.
      </>
    ),
  },
  {
    title: 'Clean Ejection',
    icon: '</>',
    description: (
      <>
        Eject anytime to get a standard Django + React project. No lock-in — all
        generated code is yours to keep and modify.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>
          <span>{icon}</span>
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
