import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import HeroSection from '@site/src/components/HeroSection';
import StatsSection from '@site/src/components/StatsSection';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import WorkflowSection from '@site/src/components/WorkflowSection';
import ShowcaseSection from '@site/src/components/ShowcaseSection';
import CTASection from '@site/src/components/CTASection';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Fullstack Django + React Framework"
      description="Blacksmith CLI helps developers ship fullstack Django + React applications 10x faster. 60+ components, 75+ hooks, complete auth, AI-powered skills — production-ready in under 60 seconds.">
      <HeroSection />
      <main>
        <StatsSection />
        <HomepageFeatures />
        <WorkflowSection />
        <ShowcaseSection />
        <CTASection />
      </main>
    </Layout>
  );
}
