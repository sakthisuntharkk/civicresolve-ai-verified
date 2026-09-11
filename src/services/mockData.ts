import type {
  AnalyticsData,
  Category,
  Issue,
  IssueStatus,
  Priority,
  TimelineEvent,
  TimelineKey,
  Ward,
} from "@/types";

import potholeBefore from "@/assets/pothole-before.jpg";
import potholeAfter from "@/assets/pothole-after.jpg";
import garbageBefore from "@/assets/garbage-before.jpg";
import garbageAfter from "@/assets/garbage-after.jpg";
import streetlightBefore from "@/assets/streetlight-before.jpg";
import waterBefore from "@/assets/water-before.jpg";
import drainBefore from "@/assets/drain-before.jpg";
import drainAfter from "@/assets/drain-after.jpg";

/** Fixed "now" so SSR and client render identical relative times. */
export const NOW = new Date("2026-09-11T04:30:00Z");

export const CURRENT_USER = { id: "u-citizen", name: "Sakthi" };

export const PHOTOS = {
  potholeBefore,
  potholeAfter,
  garbageBefore,
  garbageAfter,
  streetlightBefore,
  waterBefore,
  drainBefore,
  drainAfter,
} as const;

export const CATEGORY_PHOTO: Record<Category, string> = {
  road: potholeBefore,
  sanitation: garbageBefore,
  lighting: streetlightBefore,
  water: waterBefore,
  drainage: drainBefore,
};

export const WARDS: Ward[] = [
  { id: "W-01", name: "Anna Nagar", zone: "North" },
  { id: "W-04", name: "T. Nagar", zone: "Central" },
  { id: "W-07", name: "Velachery", zone: "South" },
  { id: "W-09", name: "Adyar", zone: "South" },
  { id: "W-12", name: "Kodambakkam", zone: "Central" },
  { id: "W-15", name: "Perambur", zone: "North" },
];

export const DEPARTMENTS: Record<Category, string> = {
  road: "Roads & Infrastructure",
  sanitation: "Solid Waste Management",
  lighting: "Electrical & Street Lighting",
  water: "Water Supply Board",
  drainage: "Storm Water & Drainage",
};

export const TEAMS: Record<Category, string[]> = {
  road: ["Road Crew North", "Road Crew South", "Asphalt Unit 3"],
  sanitation: ["SWM Zone 4 Crew", "SWM Zone 7 Crew"],
  lighting: ["Electrical Unit B", "Electrical Unit D"],
  water: ["Pipeline Repair Team 2", "Pipeline Repair Team 5"],
  drainage: ["Drainage Crew Central", "Drainage Crew South"],
};

const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);
const daysFromNow = (d: number) => new Date(NOW.getTime() + d * 86_400_000).toISOString();

const TIMELINE_LABELS: Record<TimelineKey, string> = {
  reported: "Reported",
  ai_analyzed: "AI Analyzed",
  assigned: "Assigned",
  work_started: "Work Started",
  resolution_submitted: "Resolution Submitted",
  ai_verification: "AI Verification",
  citizen_confirmation: "Citizen Confirmation",
  resolved: "Resolved",
};

const TIMELINE_ACTORS: Record<TimelineKey, TimelineEvent["actor"]> = {
  reported: "citizen",
  ai_analyzed: "ai",
  assigned: "authority",
  work_started: "authority",
  resolution_submitted: "authority",
  ai_verification: "ai",
  citizen_confirmation: "citizen",
  resolved: "system",
};

const ORDER: TimelineKey[] = [
  "reported",
  "ai_analyzed",
  "assigned",
  "work_started",
  "resolution_submitted",
  "ai_verification",
  "citizen_confirmation",
  "resolved",
];

const STATUS_STEP: Record<IssueStatus, number> = {
  reported: 0,
  ai_analyzed: 1,
  assigned: 2,
  in_progress: 3,
  resolution_submitted: 4,
  ai_verification: 5,
  awaiting_citizen: 6,
  resolved: 7,
  reopened: 3,
};

export const STATUS_PROGRESS: Record<IssueStatus, number> = {
  reported: 8,
  ai_analyzed: 18,
  assigned: 32,
  in_progress: 50,
  resolution_submitted: 66,
  ai_verification: 78,
  awaiting_citizen: 90,
  resolved: 100,
  reopened: 45,
};

/**
 * Builds a full 8-step timeline for an issue given its status and known timestamps.
 */
export function buildTimeline(
  status: IssueStatus,
  stamps: Partial<Record<TimelineKey, string>>,
  descriptions: Partial<Record<TimelineKey, string>> = {},
): TimelineEvent[] {
  const step = STATUS_STEP[status];
  return ORDER.map((key, i) => {
    let state: TimelineEvent["state"] = "pending";
    if (status === "resolved") state = "done";
    else if (i < step) state = "done";
    else if (i === step) state = "active";
    if (status === "reopened" && key === "citizen_confirmation") state = "failed";
    if (status === "reopened" && (key === "resolution_submitted" || key === "ai_verification"))
      state = "done";
    return {
      id: `${key}`,
      key,
      label: TIMELINE_LABELS[key],
      description: descriptions[key],
      timestamp: stamps[key],
      actor: TIMELINE_ACTORS[key],
      state,
    };
  });
}

const ISSUES: Issue[] = [
  {
    id: "CIV-1042",
    title: "Deep pothole cluster near Anna Nagar 2nd Avenue signal",
    description:
      "There is a very deep pothole right before the 2nd Avenue traffic signal. It fills with water when it rains and two-wheelers cannot see it. Yesterday a scooter skidded and the rider fell. This has been here for at least three weeks and is getting bigger every day.",
    aiSummary:
      "Large water-filled pothole (~1.2 m) on a high-traffic arterial approach to a signal. Recent two-wheeler skid reported. Present for 3+ weeks and expanding. Immediate safety hazard for riders.",
    category: "road",
    priority: "critical",
    status: "in_progress",
    department: DEPARTMENTS.road,
    assignedTeam: "Asphalt Unit 3",
    location: {
      address: "2nd Avenue, near Roundtana signal",
      landmark: "Opposite Tower Park gate",
      wardId: "W-01",
      lat: 13.0850,
      lng: 80.2101,
      x: 250,
      y: 150,
    },
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    reportedAt: daysAgo(4),
    slaDueAt: daysFromNow(1),
    beforePhoto: potholeBefore,
    duplicateCount: 7,
    assessment: {
      priorityScore: 92,
      clusterMultiplier: 1.8,
      peopleAffected: 4200,
      durationDays: 25,
      severity: 9,
      safetyRisk: "critical",
      confidence: 0.94,
      reasoning:
        "Severity is driven by depth, water pooling, and a reported skid. Cluster multiplier 1.8x reflects 7 independent reports within 60 m in 4 days. Arterial road with ~4,200 daily two-wheeler movements. Escalated to critical.",
    },
    timeline: buildTimeline(
      "in_progress",
      {
        reported: daysAgo(4),
        ai_analyzed: hoursAgo(95.9),
        assigned: hoursAgo(90),
        work_started: hoursAgo(20),
      },
      {
        ai_analyzed: "Category: Road · Severity 9/10 · 7 duplicates merged",
        assigned: "Routed to Roads & Infrastructure → Asphalt Unit 3",
        work_started: "Crew on site, barricades placed",
      },
    ),
    relatedReports: [
      {
        id: "CIV-1044",
        title: "Pothole at 2nd Ave signal – dangerous",
        reporterName: "Priya R.",
        reportedAt: daysAgo(3.5),
        distanceMeters: 12,
        similarity: 0.96,
      },
      {
        id: "CIV-1047",
        title: "Road caved in near Roundtana",
        reporterName: "Mohammed I.",
        reportedAt: daysAgo(3),
        distanceMeters: 38,
        similarity: 0.91,
      },
      {
        id: "CIV-1051",
        title: "Scooter fell in pothole, please fix",
        reporterName: "Lakshmi V.",
        reportedAt: daysAgo(2),
        distanceMeters: 21,
        similarity: 0.89,
      },
    ],
    progress: STATUS_PROGRESS.in_progress,
  },
  {
    id: "CIV-1038",
    title: "Overflowing garbage bin outside Velachery bus depot",
    description:
      "The big green bin near the bus depot entrance has been overflowing for four days. Bags are piled on the footpath, dogs are tearing them open and the smell is unbearable for people waiting for buses.",
    aiSummary:
      "Municipal bin at a transit hub overflowing for 4 days with spillage on the footpath. Stray animal activity and odour reported. High footfall location.",
    category: "sanitation",
    priority: "high",
    status: "awaiting_citizen",
    department: DEPARTMENTS.sanitation,
    assignedTeam: "SWM Zone 7 Crew",
    location: {
      address: "Velachery Bus Depot, Main Road",
      landmark: "Depot entrance gate",
      wardId: "W-07",
      lat: 12.9791,
      lng: 80.2213,
      x: 610,
      y: 470,
    },
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    reportedAt: daysAgo(6),
    slaDueAt: daysAgo(1),
    beforePhoto: garbageBefore,
    duplicateCount: 3,
    assessment: {
      priorityScore: 74,
      clusterMultiplier: 1.3,
      peopleAffected: 2800,
      durationDays: 6,
      severity: 6,
      safetyRisk: "medium",
      confidence: 0.91,
      reasoning:
        "Public health exposure at a transit hub with ~2,800 daily commuters. 3 corroborating reports. Health risk moderate; no immediate injury hazard.",
    },
    timeline: buildTimeline(
      "awaiting_citizen",
      {
        reported: daysAgo(6),
        ai_analyzed: hoursAgo(143.8),
        assigned: hoursAgo(130),
        work_started: hoursAgo(30),
        resolution_submitted: hoursAgo(6),
        ai_verification: hoursAgo(5.8),
      },
      {
        ai_analyzed: "Category: Sanitation · Severity 6/10",
        assigned: "Routed to SWM Zone 7 Crew",
        resolution_submitted: "After-photo + notes submitted by crew lead",
        ai_verification: "87% confidence · Probably resolved",
        citizen_confirmation: "Waiting for you to confirm",
      },
    ),
    relatedReports: [
      {
        id: "CIV-1040",
        title: "Garbage all over depot footpath",
        reporterName: "Arun K.",
        reportedAt: daysAgo(5),
        distanceMeters: 8,
        similarity: 0.94,
      },
      {
        id: "CIV-1043",
        title: "Bin not cleared, stray dogs",
        reporterName: "Divya S.",
        reportedAt: daysAgo(4),
        distanceMeters: 15,
        similarity: 0.88,
      },
    ],
    resolution: {
      afterPhoto: garbageAfter,
      notes:
        "Bin emptied and footpath swept. Overflow bags removed (approx. 40 kg). Collection frequency for this bin raised to twice daily.",
      submittedBy: "R. Kumar (Crew Lead)",
      team: "SWM Zone 7 Crew",
      submittedAt: hoursAgo(6),
    },
    verification: {
      confidence: 87,
      verdict: "probably_resolved",
      analyzedAt: hoursAgo(5.8),
      checks: [
        {
          id: "location",
          label: "Location consistency",
          passed: true,
          score: 96,
          detail:
            "Same painted wall pattern and depot door frame detected in both photos. GPS delta 4 m.",
        },
        {
          id: "absence",
          label: "Issue absence",
          passed: true,
          score: 84,
          detail:
            "No overflow bags or scattered waste detected on the footpath. Bin lid closed. Minor residual litter (2 small items).",
        },
        {
          id: "evidence",
          label: "Evidence matching",
          passed: true,
          score: 81,
          detail:
            "After-photo timestamp is 3h after crew check-in. Lighting consistent with reported time. No signs of reuse or editing.",
        },
      ],
      reasoning: [
        "Scene match is strong: the blue-green wall band and depot doorway appear in both images at consistent angles.",
        "The primary complaint (overflow and spillage) is not present in the after-photo; the bin is closed and the footpath is clear.",
        "Confidence is capped at 87% because two small litter items remain and the after-photo was taken from a slightly wider angle.",
      ],
    },
    progress: STATUS_PROGRESS.awaiting_citizen,
  },
  {
    id: "CIV-1031",
    title: "Streetlight out on Adyar bridge approach for 3 weeks",
    description:
      "The streetlight on the bridge approach from Adyar side has been off for three weeks. The stretch is completely dark after 7pm and there are many pedestrians and cyclists.",
    aiSummary:
      "Single non-functional streetlight on a bridge approach with pedestrian and cyclist traffic. Outage duration ~3 weeks. Night-time safety concern.",
    category: "lighting",
    priority: "high",
    status: "assigned",
    department: DEPARTMENTS.lighting,
    assignedTeam: "Electrical Unit D",
    location: {
      address: "Adyar Bridge approach, LB Road side",
      landmark: "Before bridge railing",
      wardId: "W-09",
      lat: 13.0067,
      lng: 80.2571,
      x: 790,
      y: 380,
    },
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    reportedAt: daysAgo(2),
    slaDueAt: daysFromNow(3),
    beforePhoto: streetlightBefore,
    duplicateCount: 1,
    assessment: {
      priorityScore: 68,
      clusterMultiplier: 1.0,
      peopleAffected: 1500,
      durationDays: 21,
      severity: 6,
      safetyRisk: "high",
      confidence: 0.88,
      reasoning:
        "Night-time pedestrian safety on a bridge approach raises risk despite a single fixture. Long outage duration (21 days) adds urgency.",
    },
    timeline: buildTimeline(
      "assigned",
      { reported: daysAgo(2), ai_analyzed: hoursAgo(47.9), assigned: hoursAgo(40) },
      {
        ai_analyzed: "Category: Lighting · Severity 6/10",
        assigned: "Routed to Electrical Unit D · Scheduled inspection",
      },
    ),
    relatedReports: [],
    progress: STATUS_PROGRESS.assigned,
  },
  {
    id: "CIV-1027",
    title: "Burst pipeline flooding Kodambakkam residential lane",
    description:
      "A water pipe has burst in our lane and water is gushing out since early morning. The whole lane is flooded and houses are getting water inside. Please send someone urgently.",
    aiSummary:
      "Active pipeline burst with continuous discharge flooding a residential lane. Water entering homes. Ongoing loss of treated water; urgent shutoff required.",
    category: "water",
    priority: "critical",
    status: "in_progress",
    department: DEPARTMENTS.water,
    assignedTeam: "Pipeline Repair Team 2",
    location: {
      address: "3rd Cross Street, Kodambakkam",
      landmark: "Behind Meenakshi College",
      wardId: "W-12",
      lat: 13.0521,
      lng: 80.2255,
      x: 430,
      y: 330,
    },
    reporterId: "u-204",
    reporterName: "Meera J.",
    reportedAt: hoursAgo(9),
    slaDueAt: hoursAgo(1),
    beforePhoto: waterBefore,
    duplicateCount: 4,
    assessment: {
      priorityScore: 95,
      clusterMultiplier: 1.5,
      peopleAffected: 900,
      durationDays: 0.4,
      severity: 10,
      safetyRisk: "critical",
      confidence: 0.97,
      reasoning:
        "Active, ongoing damage with property intrusion. 4 reports in 2 hours from the same lane. Treated-water loss estimated at 40,000 L/hr. Highest urgency tier.",
    },
    timeline: buildTimeline(
      "in_progress",
      {
        reported: hoursAgo(9),
        ai_analyzed: hoursAgo(8.95),
        assigned: hoursAgo(8.5),
        work_started: hoursAgo(5),
      },
      {
        ai_analyzed: "Category: Water · Severity 10/10 · Emergency flag",
        assigned: "Pipeline Repair Team 2 dispatched",
        work_started: "Valve isolated, excavation in progress",
      },
    ),
    relatedReports: [
      {
        id: "CIV-1028",
        title: "Water flooding 3rd cross street!",
        reporterName: "Suresh B.",
        reportedAt: hoursAgo(8.5),
        distanceMeters: 6,
        similarity: 0.97,
      },
      {
        id: "CIV-1029",
        title: "Pipe burst, water in house",
        reporterName: "Kavitha N.",
        reportedAt: hoursAgo(8),
        distanceMeters: 18,
        similarity: 0.93,
      },
    ],
    progress: STATUS_PROGRESS.in_progress,
  },
  {
    id: "CIV-1019",
    title: "Blocked storm drain causing waterlogging at T. Nagar market",
    description:
      "The storm drain near the Ranganathan Street market entrance is fully blocked with plastic. Even light rain floods the road and shopkeepers cannot open their shutters.",
    aiSummary:
      "Storm drain inlet blocked by plastic waste at a dense market entrance. Recurrent waterlogging affecting commerce and pedestrian flow.",
    category: "drainage",
    priority: "high",
    status: "resolution_submitted",
    department: DEPARTMENTS.drainage,
    assignedTeam: "Drainage Crew Central",
    location: {
      address: "Ranganathan Street entrance, T. Nagar",
      landmark: "Near market clock tower",
      wardId: "W-04",
      lat: 13.0418,
      lng: 80.2341,
      x: 520,
      y: 260,
    },
    reporterId: "u-311",
    reporterName: "Ganesh P.",
    reportedAt: daysAgo(8),
    slaDueAt: daysAgo(2),
    beforePhoto: drainBefore,
    duplicateCount: 5,
    assessment: {
      priorityScore: 79,
      clusterMultiplier: 1.6,
      peopleAffected: 6500,
      durationDays: 8,
      severity: 7,
      safetyRisk: "medium",
      confidence: 0.9,
      reasoning:
        "Very high footfall (market entrance). 5 corroborating reports from shopkeepers. Monsoon forecast in next 72h raises time-sensitivity.",
    },
    timeline: buildTimeline(
      "resolution_submitted",
      {
        reported: daysAgo(8),
        ai_analyzed: hoursAgo(191.9),
        assigned: hoursAgo(180),
        work_started: hoursAgo(50),
        resolution_submitted: hoursAgo(2),
      },
      {
        ai_analyzed: "Category: Drainage · Severity 7/10 · 5 duplicates merged",
        assigned: "Routed to Drainage Crew Central",
        resolution_submitted: "Awaiting AI verification",
      },
    ),
    relatedReports: [
      {
        id: "CIV-1021",
        title: "Market road flooded again",
        reporterName: "Ramesh T.",
        reportedAt: daysAgo(7),
        distanceMeters: 22,
        similarity: 0.92,
      },
      {
        id: "CIV-1024",
        title: "Drain full of plastic near clock tower",
        reporterName: "Fathima A.",
        reportedAt: daysAgo(6),
        distanceMeters: 9,
        similarity: 0.95,
      },
    ],
    resolution: {
      afterPhoto: drainAfter,
      notes:
        "Drain inlet desilted, 3 cubic metres of plastic and silt removed. Damaged grate replaced with new cast-iron grate. Downstream flow tested.",
      submittedBy: "S. Velu (Supervisor)",
      team: "Drainage Crew Central",
      submittedAt: hoursAgo(2),
    },
    progress: STATUS_PROGRESS.resolution_submitted,
  },
  {
    id: "CIV-1012",
    title: "Broken footpath slabs near Perambur school",
    description:
      "Several footpath slabs are broken and tilted outside the government school. Children walk on the road instead because the footpath is unsafe.",
    aiSummary:
      "Multiple broken footpath slabs adjacent to a school forcing pedestrians, including children, onto the carriageway.",
    category: "road",
    priority: "medium",
    status: "assigned",
    department: DEPARTMENTS.road,
    assignedTeam: "Road Crew North",
    location: {
      address: "Paper Mills Road, Perambur",
      landmark: "Govt. Higher Secondary School gate",
      wardId: "W-15",
      lat: 13.1143,
      lng: 80.2329,
      x: 560,
      y: 90,
    },
    reporterId: "u-118",
    reporterName: "Anitha M.",
    reportedAt: daysAgo(5),
    slaDueAt: daysFromNow(5),
    beforePhoto: potholeBefore,
    duplicateCount: 2,
    assessment: {
      priorityScore: 58,
      clusterMultiplier: 1.1,
      peopleAffected: 800,
      durationDays: 14,
      severity: 5,
      safetyRisk: "medium",
      confidence: 0.86,
      reasoning:
        "School-adjacent location raises vulnerability weighting. Moderate severity; not an active hazard but displaces children onto the road.",
    },
    timeline: buildTimeline("assigned", {
      reported: daysAgo(5),
      ai_analyzed: hoursAgo(119.9),
      assigned: hoursAgo(100),
    }),
    relatedReports: [],
    progress: STATUS_PROGRESS.assigned,
  },
  {
    id: "CIV-1005",
    title: "Open manhole with missing cover on Anna Nagar 4th Main",
    description:
      "A manhole cover is missing on 4th Main Road. It is open and there is no barricade. Very dangerous at night.",
    aiSummary:
      "Uncovered manhole on a residential main road with no barricading. Severe fall hazard, especially at night.",
    category: "drainage",
    priority: "critical",
    status: "ai_analyzed",
    department: DEPARTMENTS.drainage,
    location: {
      address: "4th Main Road, Anna Nagar West",
      landmark: "Near Shanthi Colony junction",
      wardId: "W-01",
      lat: 13.0878,
      lng: 80.2029,
      x: 180,
      y: 210,
    },
    reporterId: "u-402",
    reporterName: "Vikram S.",
    reportedAt: hoursAgo(1.5),
    slaDueAt: hoursFromNowIso(4),
    beforePhoto: drainBefore,
    duplicateCount: 1,
    assessment: {
      priorityScore: 89,
      clusterMultiplier: 1.0,
      peopleAffected: 1200,
      durationDays: 0.1,
      severity: 9,
      safetyRisk: "critical",
      confidence: 0.93,
      reasoning:
        "Open manholes are a top-tier injury risk regardless of report count. Auto-escalated; awaiting dispatcher assignment within 4h SLA.",
    },
    timeline: buildTimeline(
      "ai_analyzed",
      { reported: hoursAgo(1.5), ai_analyzed: hoursAgo(1.45) },
      { ai_analyzed: "Category: Drainage · Severity 9/10 · Auto-escalated" },
    ),
    relatedReports: [],
    progress: STATUS_PROGRESS.ai_analyzed,
  },
  {
    id: "CIV-0998",
    title: "Illegal dumping on vacant plot, Velachery Bypass",
    description:
      "Construction debris and household waste are being dumped on the vacant plot next to the bypass. It has become a huge pile over the last month.",
    aiSummary:
      "Unauthorised dumping site with mixed construction and household waste accumulating over ~30 days.",
    category: "sanitation",
    priority: "medium",
    status: "in_progress",
    department: DEPARTMENTS.sanitation,
    assignedTeam: "SWM Zone 7 Crew",
    location: {
      address: "Velachery Bypass Road, near Vijayanagar",
      wardId: "W-07",
      lat: 12.9762,
      lng: 80.2159,
      x: 560,
      y: 530,
    },
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    reportedAt: daysAgo(10),
    slaDueAt: daysFromNow(2),
    beforePhoto: garbageBefore,
    duplicateCount: 2,
    assessment: {
      priorityScore: 52,
      clusterMultiplier: 1.1,
      peopleAffected: 600,
      durationDays: 30,
      severity: 5,
      safetyRisk: "low",
      confidence: 0.84,
      reasoning:
        "Environmental nuisance with slow escalation. Low immediate safety risk; requires heavy vehicle clearance and enforcement follow-up.",
    },
    timeline: buildTimeline("in_progress", {
      reported: daysAgo(10),
      ai_analyzed: hoursAgo(239.9),
      assigned: hoursAgo(220),
      work_started: hoursAgo(48),
    }),
    relatedReports: [],
    progress: STATUS_PROGRESS.in_progress,
  },
  {
    id: "CIV-0991",
    title: "Flickering lights in Velachery Lake Park walkway",
    description:
      "Half of the lights on the lake park walkway flicker constantly in the evening. Elderly walkers find it disorienting.",
    aiSummary: "Intermittent flicker across multiple walkway fixtures in a public park, evening hours.",
    category: "lighting",
    priority: "low",
    status: "resolved",
    department: DEPARTMENTS.lighting,
    assignedTeam: "Electrical Unit B",
    location: {
      address: "Velachery Lake Park walkway",
      wardId: "W-07",
      lat: 12.9812,
      lng: 80.2245,
      x: 660,
      y: 500,
    },
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    reportedAt: daysAgo(18),
    slaDueAt: daysAgo(8),
    beforePhoto: streetlightBefore,
    duplicateCount: 1,
    assessment: {
      priorityScore: 34,
      clusterMultiplier: 1.0,
      peopleAffected: 400,
      durationDays: 10,
      severity: 3,
      safetyRisk: "low",
      confidence: 0.87,
      reasoning: "Comfort issue with minor safety implication. Standard SLA.",
    },
    timeline: buildTimeline(
      "resolved",
      {
        reported: daysAgo(18),
        ai_analyzed: hoursAgo(431.9),
        assigned: hoursAgo(420),
        work_started: hoursAgo(300),
        resolution_submitted: hoursAgo(280),
        ai_verification: hoursAgo(279.8),
        citizen_confirmation: hoursAgo(260),
        resolved: hoursAgo(260),
      },
      {
        ai_verification: "91% confidence · Probably resolved",
        citizen_confirmation: "Confirmed fixed by reporter",
      },
    ),
    relatedReports: [],
    resolution: {
      afterPhoto: streetlightBefore,
      notes: "Faulty ballast replaced on 6 fixtures, wiring re-terminated.",
      submittedBy: "D. Mani (Technician)",
      team: "Electrical Unit B",
      submittedAt: hoursAgo(280),
    },
    verification: {
      confidence: 91,
      verdict: "probably_resolved",
      analyzedAt: hoursAgo(279.8),
      checks: [
        { id: "location", label: "Location consistency", passed: true, score: 95, detail: "Walkway geometry matches." },
        { id: "absence", label: "Issue absence", passed: true, score: 88, detail: "Steady illumination across all fixtures in after-video frames." },
        { id: "evidence", label: "Evidence matching", passed: true, score: 90, detail: "Timestamps consistent with work order." },
      ],
      reasoning: ["Illumination uniformity improved from 41% to 94% across sampled frames."],
    },
    citizenConfirmation: { confirmed: true, at: hoursAgo(260) },
    progress: 100,
  },
  {
    id: "CIV-0984",
    title: "Low water pressure in Adyar Indira Nagar block",
    description: "Water pressure has been very low for a week in our block, only a trickle in the mornings.",
    aiSummary: "Reduced supply pressure affecting a residential block for ~7 days.",
    category: "water",
    priority: "low",
    status: "resolved",
    department: DEPARTMENTS.water,
    assignedTeam: "Pipeline Repair Team 5",
    location: {
      address: "Indira Nagar 2nd Avenue, Adyar",
      wardId: "W-09",
      lat: 13.0012,
      lng: 80.2534,
      x: 740,
      y: 430,
    },
    reporterId: "u-509",
    reporterName: "Rahul D.",
    reportedAt: daysAgo(22),
    slaDueAt: daysAgo(12),
    beforePhoto: waterBefore,
    duplicateCount: 3,
    assessment: {
      priorityScore: 41,
      clusterMultiplier: 1.2,
      peopleAffected: 350,
      durationDays: 7,
      severity: 4,
      safetyRisk: "low",
      confidence: 0.82,
      reasoning: "Service quality issue, no safety hazard. Cluster of 3 households.",
    },
    timeline: buildTimeline("resolved", {
      reported: daysAgo(22),
      ai_analyzed: hoursAgo(527.9),
      assigned: hoursAgo(520),
      work_started: hoursAgo(480),
      resolution_submitted: hoursAgo(470),
      ai_verification: hoursAgo(469.8),
      citizen_confirmation: hoursAgo(450),
      resolved: hoursAgo(450),
    }),
    relatedReports: [],
    citizenConfirmation: { confirmed: true, at: hoursAgo(450) },
    progress: 100,
  },
  {
    id: "CIV-0977",
    title: "Road crack widening on Perambur High Road",
    description: "A long crack across the road is widening and the edge is crumbling near the bus stop.",
    aiSummary: "Longitudinal pavement crack with edge deterioration near a bus stop.",
    category: "road",
    priority: "medium",
    status: "reopened",
    department: DEPARTMENTS.road,
    assignedTeam: "Road Crew North",
    location: {
      address: "Perambur High Road, near Bus Stop 12",
      wardId: "W-15",
      lat: 13.1102,
      lng: 80.2418,
      x: 640,
      y: 140,
    },
    reporterId: CURRENT_USER.id,
    reporterName: CURRENT_USER.name,
    reportedAt: daysAgo(15),
    slaDueAt: daysAgo(3),
    beforePhoto: potholeBefore,
    duplicateCount: 1,
    assessment: {
      priorityScore: 55,
      clusterMultiplier: 1.0,
      peopleAffected: 1100,
      durationDays: 15,
      severity: 5,
      safetyRisk: "medium",
      confidence: 0.85,
      reasoning: "Progressive deterioration near a transit stop. Reopened after citizen rejected the patch.",
    },
    timeline: buildTimeline(
      "reopened",
      {
        reported: daysAgo(15),
        ai_analyzed: hoursAgo(359.9),
        assigned: hoursAgo(350),
        work_started: hoursAgo(200),
        resolution_submitted: hoursAgo(120),
        ai_verification: hoursAgo(119.8),
        citizen_confirmation: hoursAgo(96),
      },
      {
        ai_verification: "62% confidence · Uncertain",
        citizen_confirmation: "Reopened: patch already crumbling",
        work_started: "Re-assigned to Road Crew North",
      },
    ),
    relatedReports: [],
    resolution: {
      afterPhoto: potholeAfter,
      notes: "Cold-mix patch applied.",
      submittedBy: "K. Raja",
      team: "Road Crew North",
      submittedAt: hoursAgo(120),
    },
    verification: {
      confidence: 62,
      verdict: "uncertain",
      analyzedAt: hoursAgo(119.8),
      checks: [
        { id: "location", label: "Location consistency", passed: true, score: 90, detail: "Bus stop shelter visible in both photos." },
        { id: "absence", label: "Issue absence", passed: false, score: 48, detail: "Crack edge still visible along the north side of the patch." },
        { id: "evidence", label: "Evidence matching", passed: true, score: 72, detail: "Timestamps consistent." },
      ],
      reasoning: ["Partial repair detected; the crack extends beyond the patched area."],
    },
    citizenConfirmation: {
      confirmed: false,
      reason: "The patch is already crumbling and the crack is still visible on the other side.",
      at: hoursAgo(96),
    },
    progress: STATUS_PROGRESS.reopened,
  },
  {
    id: "CIV-0970",
    title: "Sewage smell from open drain, Kodambakkam Arcot Road",
    description: "Strong sewage smell from the open drain along Arcot Road, worse in the evenings.",
    aiSummary: "Persistent odour from an open drain along a commercial corridor.",
    category: "drainage",
    priority: "medium",
    status: "resolved",
    department: DEPARTMENTS.drainage,
    assignedTeam: "Drainage Crew Central",
    location: {
      address: "Arcot Road, Kodambakkam",
      wardId: "W-12",
      lat: 13.0509,
      lng: 80.2178,
      x: 380,
      y: 290,
    },
    reporterId: "u-620",
    reporterName: "Nithya R.",
    reportedAt: daysAgo(30),
    slaDueAt: daysAgo(20),
    beforePhoto: drainBefore,
    duplicateCount: 2,
    assessment: {
      priorityScore: 47,
      clusterMultiplier: 1.1,
      peopleAffected: 2000,
      durationDays: 12,
      severity: 4,
      safetyRisk: "low",
      confidence: 0.8,
      reasoning: "Nuisance-level public health issue on a commercial corridor.",
    },
    timeline: buildTimeline("resolved", {
      reported: daysAgo(30),
      ai_analyzed: hoursAgo(719.9),
      assigned: hoursAgo(700),
      work_started: hoursAgo(600),
      resolution_submitted: hoursAgo(560),
      ai_verification: hoursAgo(559.8),
      citizen_confirmation: hoursAgo(540),
      resolved: hoursAgo(540),
    }),
    relatedReports: [],
    citizenConfirmation: { confirmed: true, at: hoursAgo(540) },
    progress: 100,
  },
  {
    id: "CIV-0965",
    title: "Garbage not collected for 5 days, T. Nagar Habibullah Road",
    description: "Door-to-door collection has not happened on our street for five days. Waste is piling up outside every house.",
    aiSummary: "Missed door-to-door collection across a residential street for 5 consecutive days.",
    category: "sanitation",
    priority: "high",
    status: "in_progress",
    department: DEPARTMENTS.sanitation,
    assignedTeam: "SWM Zone 4 Crew",
    location: {
      address: "Habibullah Road, T. Nagar",
      wardId: "W-04",
      lat: 13.0452,
      lng: 80.2412,
      x: 590,
      y: 230,
    },
    reporterId: "u-733",
    reporterName: "Balaji K.",
    reportedAt: daysAgo(7),
    slaDueAt: daysAgo(4),
    beforePhoto: garbageBefore,
    duplicateCount: 6,
    assessment: {
      priorityScore: 71,
      clusterMultiplier: 1.7,
      peopleAffected: 1800,
      durationDays: 7,
      severity: 6,
      safetyRisk: "medium",
      confidence: 0.9,
      reasoning: "Street-wide service failure with 6 households reporting. Overdue against SLA by 4 days.",
    },
    timeline: buildTimeline("in_progress", {
      reported: daysAgo(7),
      ai_analyzed: hoursAgo(167.9),
      assigned: hoursAgo(160),
      work_started: hoursAgo(70),
    }),
    relatedReports: [
      { id: "CIV-0966", title: "No garbage pickup this week", reporterName: "Shalini G.", reportedAt: daysAgo(6.5), distanceMeters: 40, similarity: 0.9 },
    ],
    progress: STATUS_PROGRESS.in_progress,
  },
];

function hoursFromNowIso(h: number) {
  return new Date(NOW.getTime() + h * 3_600_000).toISOString();
}

export const SEED_ISSUES = ISSUES;

export const ANALYTICS: AnalyticsData = {
  byCategory: [
    { key: "road", name: "Road", value: 312 },
    { key: "sanitation", name: "Sanitation", value: 268 },
    { key: "drainage", name: "Drainage", value: 194 },
    { key: "water", name: "Water", value: 141 },
    { key: "lighting", name: "Lighting", value: 117 },
  ],
  byPriority: [
    { key: "critical", name: "Critical", value: 86 },
    { key: "high", name: "High", value: 247 },
    { key: "medium", name: "Medium", value: 428 },
    { key: "low", name: "Low", value: 271 },
  ],
  byDepartment: [
    { name: "Roads", open: 74, resolved: 238 },
    { name: "SWM", open: 51, resolved: 217 },
    { name: "Drainage", open: 63, resolved: 131 },
    { name: "Water", open: 29, resolved: 112 },
    { name: "Lighting", open: 18, resolved: 99 },
  ],
  verificationOutcomes: [
    { key: "probably_resolved", name: "Probably resolved", value: 68 },
    { key: "uncertain", name: "Uncertain", value: 22 },
    { key: "not_resolved", name: "Not resolved", value: 10 },
  ],
  citizenConfirmationRate: 84,
  citizenConfirmationTrend: [
    { week: "W28", rate: 71 },
    { week: "W29", rate: 74 },
    { week: "W30", rate: 76 },
    { week: "W31", rate: 79 },
    { week: "W32", rate: 78 },
    { week: "W33", rate: 82 },
    { week: "W34", rate: 83 },
    { week: "W35", rate: 84 },
  ],
  resolutionTrend: [
    { week: "W28", road: 9.8, sanitation: 4.1, lighting: 6.2, water: 3.4, drainage: 8.9 },
    { week: "W29", road: 9.1, sanitation: 3.9, lighting: 5.8, water: 3.1, drainage: 8.2 },
    { week: "W30", road: 8.6, sanitation: 3.6, lighting: 5.5, water: 2.9, drainage: 7.9 },
    { week: "W31", road: 8.2, sanitation: 3.4, lighting: 5.1, water: 2.8, drainage: 7.1 },
    { week: "W32", road: 7.9, sanitation: 3.5, lighting: 4.9, water: 2.6, drainage: 6.8 },
    { week: "W33", road: 7.1, sanitation: 3.2, lighting: 4.6, water: 2.4, drainage: 6.2 },
    { week: "W34", road: 6.8, sanitation: 3.0, lighting: 4.2, water: 2.3, drainage: 5.9 },
    { week: "W35", road: 6.2, sanitation: 2.9, lighting: 4.0, water: 2.1, drainage: 5.4 },
  ],
  insights: [
    {
      title: "Duplicate merging saved 1,140 crew hours",
      body: "Cluster detection merged 38% of incoming reports into existing issues this quarter, so crews were dispatched once per problem instead of once per complaint.",
      tone: "positive",
    },
    {
      title: "Drainage re-open rate is 2.4x the average",
      body: "Citizen rejections after 'resolved' are concentrated in Drainage (W-04, W-12). AI verification flagged 61% of those as 'uncertain' before the citizen did — consider mandatory supervisor review when confidence is under 70%.",
      tone: "warning",
    },
    {
      title: "Road resolution time down 37% in 8 weeks",
      body: "Priority scoring moved arterial-road potholes ahead of low-impact requests; median time-to-fix fell from 9.8 to 6.2 days.",
      tone: "positive",
    },
  ],
};

export const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
