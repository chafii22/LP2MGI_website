'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Compass, FolderKanban, GraduationCap, Layers3, Users } from 'lucide-react';
import styles from './TeamDetail.module.css';

type MemberRole = 'Professor' | 'PhD Student' | 'Engineer' | 'Master Student';

type TeamMember = {
	id: string;
	name: string;
	role: MemberRole;
	expertise: string;
	isLeader?: boolean;
};

type Publication = {
	id: string;
	title: string;
	venue: string;
	year: number;
};

type TeamProject = {
	id: string;
	title: string;
	status: 'Active' | 'Completed';
	summary: string;
};

type TeamDetail = {
	id: string;
	title: string;
	subtitle: string;
	domain: string;
	lead: string;
	overview: string;
	axes: string[];
	members: TeamMember[];
	publications: Publication[];
	projects: TeamProject[];
};

const TEAM_DETAILS: Record<string, TeamDetail> = {
	'data-intelligence': {
		id: 'data-intelligence',
		title: 'Data Intelligence Team',
		subtitle: 'Research Unit',
		domain: 'Machine Learning and Explainable AI',
		lead: 'Prof. A. El Idrissi',
		overview:
			'The Data Intelligence Team develops predictive and interpretable models for decision support in healthcare, education, and industrial optimization. The team combines statistical learning, deep learning, and trustworthy AI approaches to deliver reliable scientific and applied outcomes.',
		axes: [
			'Explainable machine learning for high-stakes decisions',
			'Time-series modeling for forecasting and anomaly detection',
			'Computer vision for quality control and smart monitoring',
			'Responsible AI benchmarking and validation',
		],
		members: [
			{ id: 'di-m1', name: 'Prof. A. El Idrissi', role: 'Professor', expertise: 'Trustworthy AI and model interpretability', isLeader: true },
			{ id: 'di-m2', name: 'Dr. Y. Benomar', role: 'Professor', expertise: 'Statistical learning and probabilistic models' },
			{ id: 'di-m3', name: 'M. El Mansouri', role: 'PhD Student', expertise: 'Multimodal deep learning' },
			{ id: 'di-m4', name: 'S. Chraibi', role: 'Engineer', expertise: 'MLOps and data pipelines' },
			{ id: 'di-m5', name: 'N. Ait Lahcen', role: 'Master Student', expertise: 'Visualization and dashboard analytics' },
		],
		publications: [
			{ id: 'di-pub-1', title: 'Interpretable Hybrid Models for Clinical Forecasting', venue: 'IEEE Access', year: 2025 },
			{ id: 'di-pub-2', title: 'Explainability Metrics for Multiclass Predictions', venue: 'ESANN', year: 2024 },
			{ id: 'di-pub-3', title: 'Robust Drift Detection in Real-World Data Streams', venue: 'Pattern Recognition Letters', year: 2023 },
		],
		projects: [
			{
				id: 'di-proj-1',
				title: 'Smart Health Risk Scoring',
				status: 'Active',
				summary: 'Clinical risk prediction pipeline with explainability reports for medical staff.',
			},
			{
				id: 'di-proj-2',
				title: 'Campus Energy Forecasting',
				status: 'Completed',
				summary: 'Forecasting framework for energy optimization across university buildings.',
			},
		],
	},
	'software-systems': {
		id: 'software-systems',
		title: 'Software Systems Team',
		subtitle: 'Research Unit',
		domain: 'Distributed Systems and Software Architecture',
		lead: 'Prof. M. Chafii',
		overview:
			'The Software Systems Team focuses on resilient and scalable software architecture for modern applications. Its work spans cloud-native design, service reliability, and engineering methods that improve maintainability and system quality in production settings.',
		axes: [
			'Microservice architecture and observability',
			'Software quality metrics and automated testing',
			'Secure software lifecycle and threat-aware design',
			'High-availability orchestration and deployment patterns',
		],
		members: [
			{ id: 'ss-m1', name: 'Prof. M. Chafii', role: 'Professor', expertise: 'Software architecture and reliability', isLeader: true },
			{ id: 'ss-m2', name: 'Dr. H. Laghmari', role: 'Professor', expertise: 'Formal methods and verification' },
			{ id: 'ss-m3', name: 'R. Fassi', role: 'Engineer', expertise: 'Cloud-native DevOps and CI/CD' },
			{ id: 'ss-m4', name: 'I. Tahiri', role: 'PhD Student', expertise: 'Performance analysis and profiling' },
			{ id: 'ss-m5', name: 'W. Zniber', role: 'Master Student', expertise: 'API testing automation' },
		],
		publications: [
			{ id: 'ss-pub-1', title: 'Self-Healing Strategies for Service-Based Platforms', venue: 'Future Generation Computer Systems', year: 2025 },
			{ id: 'ss-pub-2', title: 'A Practical Taxonomy of Reliability Anti-Patterns', venue: 'ICSA Workshops', year: 2024 },
		],
		projects: [
			{
				id: 'ss-proj-1',
				title: 'ResearchOps Platform',
				status: 'Active',
				summary: 'Unified platform for experiment tracking, benchmarking, and reproducibility.',
			},
			{
				id: 'ss-proj-2',
				title: 'API Governance Toolkit',
				status: 'Completed',
				summary: 'Toolchain for contract validation, versioning policy, and service quality checks.',
			},
		],
	},
	'smart-networks': {
		id: 'smart-networks',
		title: 'Smart Networks Team',
		subtitle: 'Research Unit',
		domain: 'IoT, Smart Infrastructure, and Edge Systems',
		lead: 'Prof. N. Bensalah',
		overview:
			'The Smart Networks Team designs connected systems for intelligent environments, including campuses and smart city contexts. The team builds robust sensing, communication, and analytics layers to transform raw signals into actionable services.',
		axes: [
			'Edge intelligence for low-latency IoT use cases',
			'Wireless sensor network optimization',
			'Smart mobility and urban monitoring platforms',
			'Cybersecurity for constrained connected devices',
		],
		members: [
			{ id: 'sn-m1', name: 'Prof. N. Bensalah', role: 'Professor', expertise: 'IoT architecture and edge analytics', isLeader: true },
			{ id: 'sn-m2', name: 'Dr. L. Ouhsine', role: 'Professor', expertise: 'Wireless communication protocols' },
			{ id: 'sn-m3', name: 'K. El Hamdani', role: 'Engineer', expertise: 'Embedded systems integration' },
			{ id: 'sn-m4', name: 'A. Doukkali', role: 'PhD Student', expertise: 'Edge ML for anomaly detection' },
			{ id: 'sn-m5', name: 'F. Chentouf', role: 'Master Student', expertise: 'IoT dashboard and telemetry UX' },
		],
		publications: [
			{ id: 'sn-pub-1', title: 'Adaptive Routing in Dense IoT Deployments', venue: 'Sensors', year: 2025 },
			{ id: 'sn-pub-2', title: 'Edge-Centric Detection for Urban Air Monitoring', venue: 'IEEE Internet of Things Journal', year: 2024 },
		],
		projects: [
			{
				id: 'sn-proj-1',
				title: 'Smart Campus Monitoring Grid',
				status: 'Active',
				summary: 'Distributed sensing and alerting platform for environment and safety indicators.',
			},
			{
				id: 'sn-proj-2',
				title: 'Connected Parking Guidance',
				status: 'Completed',
				summary: 'Real-time occupancy detection and routing assistance for campus parking areas.',
			},
		],
	},
};

const ROLE_FILTERS = ['All', 'Professor', 'PhD Student', 'Engineer', 'Master Student'] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

export default function TeamDetailPage() {
	const params = useParams<{ TeamId: string }>();
	const teamId = Array.isArray(params?.TeamId) ? params.TeamId[0] : params?.TeamId;
	const team = teamId ? TEAM_DETAILS[teamId] : undefined;
	const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');

	const filteredMembers = useMemo(() => {
		if (!team) {
			return [];
		}

		if (roleFilter === 'All') {
			return team.members;
		}

		return team.members.filter((member) => member.role === roleFilter);
	}, [roleFilter, team]);

	const getInitials = (name: string) =>
		name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');

	if (!team) {
		return (
			<main className={styles.mainContainer}>
				<section className={styles.headerSection}>
					<div className={styles.sectionInner}>
						<nav className={styles.breadcrumb} aria-label="Breadcrumb">
							<Link href="/">Home</Link>
							<span>/</span>
							<Link href="/Teams">Teams</Link>
							<span>/</span>
							<span className={styles.currentPath}>Unknown Team</span>
						</nav>
						<p className={styles.subtitle}>Research Unit</p>
						<h1 className={styles.title}>Team Not Found</h1>
						<p className={styles.headerDescription}>The team you requested does not exist or is not available yet.</p>
					</div>
				</section>
			</main>
		);
	}

	const stats = [
		{ label: 'Lead', value: team.lead, icon: GraduationCap },
		{ label: 'Members', value: String(team.members.length), icon: Users },
		{ label: 'Projects', value: String(team.projects.length), icon: FolderKanban },
		{ label: 'Domain', value: team.domain, icon: Compass },
	];

	return (
		<main className={styles.mainContainer}>
			<section className={styles.headerSection}>
				<div className={styles.sectionInner}>
					<nav className={styles.breadcrumb} aria-label="Breadcrumb">
						<Link href="/">Home</Link>
						<span>/</span>
						<Link href="/Teams">Teams</Link>
						<span>/</span>
						<span className={styles.currentPath}>{team.title}</span>
					</nav>

					<p className={styles.subtitle}>{team.subtitle}</p>
					<h1 className={styles.title}>{team.title}</h1>
				</div>
			</section>

			<section className={styles.overviewSection}>
				<div className={`${styles.sectionInner} ${styles.overviewGrid}`}>
					<div className={styles.overviewTextBlock}>
						<p className={styles.sectionSubtitle}>Team Snapshot</p>
						<h2 className={styles.sectionTitle}>Overview</h2>
						<p className={styles.overviewText}>{team.overview}</p>
					</div>

					<aside className={styles.statsCard}>
						<h3 className={styles.statsTitle}>Team Keys</h3>
						<ul className={styles.statsList}>
							{stats.map((item) => {
								const Icon = item.icon;
								return (
									<li key={item.label} className={styles.statsItem}>
										<span className={styles.statsIcon}>
											<Icon size={17} strokeWidth={2.2} />
										</span>
										<div>
											<p className={styles.statsLabel}>{item.label}</p>
											<p className={styles.statsValue}>{item.value}</p>
										</div>
									</li>
								);
							})}
						</ul>
					</aside>
				</div>
			</section>

			<section className={styles.axesSection}>
				<div className={styles.sectionInner}>
					<h2 className={styles.sectionTitle}>Research Axes</h2>
					<div className={styles.axesGrid}>
						{team.axes.map((axis) => (
							<article key={axis} className={styles.axisCard}>
								<Layers3 size={18} className={styles.axisIcon} />
								<p>{axis}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className={styles.membersSection}>
				<div className={styles.sectionInner}>
					<div className={styles.membersHeader}>
						<h2 className={styles.sectionTitle}>Team Members</h2>
						<div className={styles.filterGroup} role="tablist" aria-label="Filter members by role">
							{ROLE_FILTERS.map((role) => (
								<button
									key={role}
									type="button"
									className={`${styles.filterButton} ${roleFilter === role ? styles.filterButtonActive : ''}`}
									onClick={() => setRoleFilter(role)}
								>
									{role}
								</button>
							))}
						</div>
					</div>

					<div className={styles.membersGrid}>
						{filteredMembers.map((member) => (
							<article key={member.id} className={styles.memberCard}>
								<div className={styles.memberInitials}>{getInitials(member.name)}</div>
								<div className={styles.memberContent}>
									<div className={styles.memberTop}>
										<h3 className={styles.memberName}>{member.name}</h3>
										{member.isLeader && <span className={styles.leaderTag}>Leader</span>}
									</div>
									<p className={styles.memberRole}>{member.role}</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className={styles.outputsSection}>
				<div className={`${styles.sectionInner} ${styles.outputsGrid}`}>
					<div className={styles.outputsColumn}>
						<h2 className={styles.sectionTitle}>Publications</h2>
						<div className={styles.outputList}>
							{team.publications.map((publication) => (
								<article key={publication.id} className={styles.outputCard}>
									<h3>{publication.title}</h3>
									<p>
										{publication.venue} - {publication.year}
									</p>
								</article>
							))}
						</div>
					</div>

					<div className={styles.outputsColumn}>
						<h2 className={styles.sectionTitle}>Projects</h2>
						<div className={styles.outputList}>
							{team.projects.map((project) => (
								<article key={project.id} className={styles.outputCard}>
									<div className={styles.projectTop}>
										<h3>{project.title}</h3>
										<span className={styles.projectStatus}>{project.status}</span>
									</div>
									<p>{project.summary}</p>
								</article>
							))}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
