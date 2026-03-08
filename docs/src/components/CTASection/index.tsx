import type {ReactNode} from 'react';

export default function CTASection(): ReactNode {
  return (
    <section className="bs-cta">
      <div className="bs-cta__inner">
        <h2 className="bs-cta__title">Stop writing boilerplate. Start shipping product.</h2>
        <p className="bs-cta__desc">
          Join developers who are building fullstack applications 10x faster
          with Blacksmith CLI. One command, under 60 seconds.
        </p>
        <div className="bs-cta__command">
          <span className="prompt">$</span>
          npx blacksmith init my-app
        </div>
      </div>
    </section>
  );
}
