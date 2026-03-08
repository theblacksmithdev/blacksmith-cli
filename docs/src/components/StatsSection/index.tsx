import type {ReactNode} from 'react';

const BLACKSMITH_UI_URL = 'https://oluwatobimaxwell.github.io/libraries-project/';

type Stat = {
  value: string;
  label: string;
  desc: string;
  href?: string;
};

const stats: Stat[] = [
  {
    value: '90%',
    label: 'Less boilerplate',
    desc: 'skip weeks of setup and config',
  },
  {
    value: '60+',
    label: 'UI components',
    desc: 'production-ready from blacksmith-ui',
    href: BLACKSMITH_UI_URL,
  },
  {
    value: '75+',
    label: 'React hooks',
    desc: 'data, forms, auth, and more',
    href: BLACKSMITH_UI_URL,
  },
  {
    value: '10x',
    label: 'Faster scaffolding',
    desc: 'full CRUD in seconds, not hours',
  },
];

export default function StatsSection(): ReactNode {
  return (
    <section className="bs-section">
      <div className="container">
        <div className="bs-section__header">
          <h2 className="bs-section__title">
            Speed up development without compromising on quality
          </h2>
          <p className="bs-section__desc">
            Every hour you spend on boilerplate is an hour you're not spending on your product.
            Blacksmith CLI gives you a professional-grade starting point so you can focus on what matters.
          </p>
        </div>
        <div className="bs-stats">
          {stats.map((stat) => {
            const content = (
              <>
                <div className="bs-stat__value">{stat.value}</div>
                <div className="bs-stat__label">{stat.label}</div>
                <div className="bs-stat__desc">{stat.desc}</div>
              </>
            );

            if (stat.href) {
              return (
                <a
                  key={stat.label}
                  className="bs-stat bs-stat--link"
                  href={stat.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={stat.label} className="bs-stat">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
