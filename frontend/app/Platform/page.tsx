import { Beaker, Cpu, Database, FlaskConical, Gauge, MonitorCog, Thermometer, Wrench } from 'lucide-react';
import styles from './Platform.module.css';

type ResourceCard = {
    title: string;
    description: string;
    features: string[];
    icon: 'beaker' | 'gauge' | 'thermo' | 'cpu' | 'database' | 'flask';
};

type ResourceSection = {
    id: string;
    subtitle: string;
    title: string;
    icon: 'flask' | 'wrench' | 'monitor';
    cards: ResourceCard[];
};

const resourceSections: ResourceSection[] = [
    {
        id: 'experimental-platforms',
        subtitle: 'Research Resources',
        title: 'Experimental Platforms',
        icon: 'flask',
        cards: [
            {
                title: 'Materials Characterization Platform',
                description:
                    'Advanced analytical instrumentation for structural, morphological, and physicochemical assessment.',
                features: [
                    'High-resolution scanning electron microscopy',
                    'X-ray diffraction for phase identification',
                    'Infrared spectroscopy (FTIR)',
                    'Surface and microstructure analysis workflows',
                ],
                icon: 'flask',
            },
            {
                title: 'Chemical Synthesis Platform',
                description:
                    'Dedicated synthesis environment for nanomaterials, composites, and functional advanced materials.',
                features: [
                    'Controlled synthesis and reaction systems',
                    'Catalysis and formulation benches',
                    'Thermal processing and stabilization tools',
                    'Safety-driven material preparation protocols',
                ],
                icon: 'beaker',
            },
        ],
    },
    {
        id: 'test-benches',
        subtitle: 'Validation Infrastructure',
        title: 'Test Benches',
        icon: 'wrench',
        cards: [
            {
                title: 'Mechanical Test Bench',
                description:
                    'Comprehensive mechanical characterization for material and component performance evaluation.',
                features: [
                    'Tensile, compression, and flexural testing',
                    'Elastic and plastic behavior measurement',
                    'Failure mode and durability assessment',
                    'Standardized procedure-based campaigns',
                ],
                icon: 'gauge',
            },
            {
                title: 'Thermal Test Bench',
                description:
                    'Thermal behavior analysis for materials and energy systems under controlled conditions.',
                features: [
                    'Conductivity and heat transfer studies',
                    'Thermal resistance and cycling tests',
                    'Performance monitoring across ranges',
                    'Material stability under thermal stress',
                ],
                icon: 'thermo',
            },
        ],
    },
    {
        id: 'digital-resources',
        subtitle: 'Computational Resources',
        title: 'Software and Digital Resources',
        icon: 'monitor',
        cards: [
            {
                title: 'Numerical Simulation Suite',
                description:
                    'Modeling and simulation toolchains supporting advanced scientific and engineering workflows.',
                features: [
                    'Multiphysics and finite element environments',
                    'Data processing and scientific scripting tools',
                    'Optimization and parametric analysis pipelines',
                    'Reproducible simulation project templates',
                ],
                icon: 'cpu',
            },
            {
                title: 'Computation Infrastructure',
                description:
                    'Dedicated computing resources designed for intensive numerical workloads and data-heavy studies.',
                features: [
                    'High-performance compute nodes',
                    'Centralized storage and backup workflows',
                    'Batch execution and scheduling support',
                    'Scalable environments for collaborative projects',
                ],
                icon: 'database',
            },
        ],
    },
];

function SectionIcon({ icon }: { icon: ResourceSection['icon'] }) {
    if (icon === 'flask') {
        return <FlaskConical size={20} aria-hidden="true" />;
    }

    if (icon === 'wrench') {
        return <Wrench size={20} aria-hidden="true" />;
    }

    return <MonitorCog size={20} aria-hidden="true" />;
}

function CardIcon({ icon }: { icon: ResourceCard['icon'] }) {
    if (icon === 'beaker') {
        return <Beaker size={40} aria-hidden="true" />;
    }

    if (icon === 'gauge') {
        return <Gauge size={40} aria-hidden="true" />;
    }

    if (icon === 'thermo') {
        return <Thermometer size={40} aria-hidden="true" />;
    }

    if (icon === 'cpu') {
        return <Cpu size={40} aria-hidden="true" />;
    }

    if (icon === 'database') {
        return <Database size={40} aria-hidden="true" />;
    }

    return <FlaskConical size={40} aria-hidden="true" />;
}

export default function PlatformPage() {
    return (
        <main className={styles.mainContainer}>
            <section className={styles.headerSection}>
                <div className={styles.headerContent}>
                    <header className={styles.header}>
                        <p className={styles.subtitle}>Resources</p>
                        <h1 className={styles.title}>Platforms and Equipment</h1>
                        <p className={styles.description}>
                            Discover LP2MGI&apos;s research infrastructure, from experimental platforms and test benches to
                            digital resources supporting advanced scientific work.
                        </p>
                    </header>
                </div>
            </section>

            {resourceSections.map((section, index) => (
                <section
                    key={section.id}
                    className={`${styles.resourceSection} ${index % 2 === 1 ? styles.resourceSectionMuted : ''}`}
                >
                    <div className={styles.sectionInner}>
                        <header className={styles.sectionHeader}>
                            <span className={styles.sectionIcon}>
                                <SectionIcon icon={section.icon} />
                            </span>
                            <h2 className={styles.sectionTitle}>{section.title}</h2>
                        </header>

                        <div className={styles.cardsGrid}>
                            {section.cards.map((card) => (
                                <article key={card.title} className={styles.resourceCard}>
                                    <div className={styles.cardTop}>
                                        <span className={styles.cardIcon}>
                                            <CardIcon icon={card.icon} />
                                        </span>
                                        <p className={styles.cardSubtitle}>{section.subtitle}</p>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h3 className={styles.cardTitle}>{card.title}</h3>
                                        <p className={styles.cardDescription}>{card.description}</p>

                                        <ul className={styles.featureList}>
                                            {card.features.map((feature) => (
                                                <li key={feature} className={styles.featureItem}>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            ))}
        </main>
    );
}