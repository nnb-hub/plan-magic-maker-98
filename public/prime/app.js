const STORAGE_KEY = "neet-prep-dashboard-v1";
const NOTIFICATION_SETTINGS_KEY = "medmission-notification-settings-v1";
const SYNC_META_KEY = "medmission-sync-meta-v1";

const firebaseConfig = {
  apiKey: "AIzaSyBavBJ8U8bqlexJko5u8hY8cC85aJUwjCM",
  authDomain: "medmission-alpha.firebaseapp.com",
  projectId: "medmission-alpha",
  storageBucket: "medmission-alpha.firebasestorage.app",
  messagingSenderId: "950492865776",
  appId: "1:950492865776:web:344c7928b341c8a6cdce35",
  measurementId: "G-D5SQBGSWGK"
};

const isFirebaseConfigured = !Object.values(firebaseConfig).some((value) => String(value).startsWith("PASTE_"));

const defaultState = {
  missionStartDate: "2026-06-01",
  examDate: "2027-05-02",
  goals: [
    { id: crypto.randomUUID(), text: "Complete 80 Biology MCQs", done: false, date: todayKey() },
    { id: crypto.randomUUID(), text: "Revise error notes from last mock", done: false, date: todayKey() }
  ],
  subjects: {
    Physics: { done: 12, total: 29 },
    Chemistry: { done: 15, total: 30 },
    Botany: { done: 18, total: 28 },
    Zoology: { done: 17, total: 27 }
  },
  sessions: [],
  liveSession: {
    date: todayKey(),
    status: "idle",
    elapsedMs: 0,
    startedAt: "",
    breakMs: 0,
    breakStartedAt: "",
    breaks: []
  },
  mocks: [
    { id: crypto.randomUUID(), score: 520, total: 720, mistakes: 42, mistakeType: "Mixed mistakes", weakArea: "Full syllabus", date: todayKey(-14) },
    { id: crypto.randomUUID(), score: 548, total: 720, mistakes: 35, mistakeType: "Mixed mistakes", weakArea: "Full syllabus", date: todayKey(-7) }
  ],
  revisions: [
    { id: crypto.randomUUID(), text: "Human Physiology formulas", date: todayKey(1) },
    { id: crypto.randomUUID(), text: "Chemical Bonding NCERT lines", date: todayKey(2) }
  ],
  timetable: [
    { id: crypto.randomUUID(), date: todayKey(), time: "06:00", subject: "Physics", task: "Concepts + 40 MCQs", done: false, login: "", logoff: "" },
    { id: crypto.randomUUID(), date: todayKey(), time: "19:00", subject: "Biology", task: "NCERT active recall", done: false, login: "", logoff: "" },
    { id: crypto.randomUUID(), date: todayKey(1), time: "09:00", subject: "Mock Test", task: "Full syllabus test + analysis", done: false, login: "", logoff: "" }
  ],
  focusDays: [],
  manualBacklogCount: null,
  weakTopics: [
    { id: crypto.randomUUID(), subject: "Physics", topic: "Rotational Motion", priority: "High", action: "Redo marked questions" }
  ],
  resolvedWeakTopics: [],
  celebratedDates: [],
  dailyReports: [],
  syllabusDone: {},
  doctorPath: {
    targetScore: "700",
    targetCollege: "MBBS 2027",
    note: "Learn Deeply. Heal Faithfully. Serve Globally."
  },
  predictor: { category: "General", route: "Both" }
};

const syllabusUnits = [
  { id: "phy-measurement", subject: "Physics", title: "Physics and Measurement" },
  { id: "phy-kinematics", subject: "Physics", title: "Kinematics" },
  { id: "phy-laws", subject: "Physics", title: "Laws of Motion" },
  { id: "phy-work", subject: "Physics", title: "Work, Energy and Power" },
  { id: "phy-rotation", subject: "Physics", title: "Rotational Motion" },
  { id: "phy-gravitation", subject: "Physics", title: "Gravitation" },
  { id: "phy-solids-fluids", subject: "Physics", title: "Properties of Solids and Fluids" },
  { id: "phy-thermo", subject: "Physics", title: "Thermodynamics" },
  { id: "phy-kinetic", subject: "Physics", title: "Kinetic Theory of Gases" },
  { id: "phy-oscillations", subject: "Physics", title: "Oscillations and Waves" },
  { id: "phy-electrostatics", subject: "Physics", title: "Electrostatics" },
  { id: "phy-current", subject: "Physics", title: "Current Electricity" },
  { id: "phy-magnetism", subject: "Physics", title: "Magnetic Effects of Current and Magnetism" },
  { id: "phy-emi", subject: "Physics", title: "Electromagnetic Induction and Alternating Currents" },
  { id: "phy-emwaves", subject: "Physics", title: "Electromagnetic Waves" },
  { id: "phy-optics", subject: "Physics", title: "Optics" },
  { id: "phy-modern", subject: "Physics", title: "Dual Nature, Atoms and Nuclei" },
  { id: "phy-electronics", subject: "Physics", title: "Electronic Devices" },
  { id: "chem-basic", subject: "Chemistry", title: "Basic Concepts in Chemistry" },
  { id: "chem-atom", subject: "Chemistry", title: "Atomic Structure" },
  { id: "chem-periodic", subject: "Chemistry", title: "Periodicity" },
  { id: "chem-bonding", subject: "Chemistry", title: "Chemical Bonding and Molecular Structure" },
  { id: "chem-thermo", subject: "Chemistry", title: "Chemical Thermodynamics" },
  { id: "chem-equilibrium", subject: "Chemistry", title: "Equilibrium" },
  { id: "chem-redox", subject: "Chemistry", title: "Redox Reactions and Electrochemistry" },
  { id: "chem-kinetics", subject: "Chemistry", title: "Chemical Kinetics" },
  { id: "chem-solutions", subject: "Chemistry", title: "Solutions" },
  { id: "chem-organic-basic", subject: "Chemistry", title: "Organic Chemistry Basic Principles" },
  { id: "chem-hydrocarbons", subject: "Chemistry", title: "Hydrocarbons" },
  { id: "chem-halo", subject: "Chemistry", title: "Haloalkanes and Haloarenes" },
  { id: "chem-oxygen", subject: "Chemistry", title: "Alcohols, Phenols, Ethers and Carbonyls" },
  { id: "chem-nitrogen", subject: "Chemistry", title: "Organic Compounds Containing Nitrogen" },
  { id: "chem-biomolecules", subject: "Chemistry", title: "Biomolecules" },
  { id: "chem-inorganic", subject: "Chemistry", title: "p, d and f Block Elements" },
  { id: "chem-coordination", subject: "Chemistry", title: "Coordination Compounds" },
  { id: "bio-diversity", subject: "Biology", title: "Diversity in Living World" },
  { id: "bio-structure", subject: "Biology", title: "Structural Organisation in Animals and Plants" },
  { id: "bio-cell", subject: "Biology", title: "Cell Structure and Function" },
  { id: "bio-plant", subject: "Biology", title: "Plant Physiology" },
  { id: "bio-human", subject: "Biology", title: "Human Physiology" },
  { id: "bio-reproduction", subject: "Biology", title: "Reproduction" },
  { id: "bio-genetics", subject: "Biology", title: "Genetics and Evolution" },
  { id: "bio-welfare", subject: "Biology", title: "Biology and Human Welfare" },
  { id: "bio-biotech", subject: "Biology", title: "Biotechnology and Its Applications" },
  { id: "bio-ecology", subject: "Biology", title: "Ecology and Environment" }
];

const motivationQuotes = [
  "One honest day of study beats ten imaginary perfect plans.",
  "NCERT, mistakes, revision: boring on purpose, powerful in result.",
  "Your rank improves in the quiet minutes nobody sees.",
  "A weak topic is not a weakness. It is a marked target.",
  "Do the next right question. Momentum will come after action."
];

const defaultNotificationSettings = {
  enabled: false,
  reminderMinutes: [30, 15, 0],
  quietStart: "22:30",
  quietEnd: "05:30",
  dailyMissionTime: "07:00",
  lastDailyMissionDate: ""
};

const breakReasonOptions = ["Washroom", "Burnout", "Water", "Meal", "Stretch", "Other"];
const breakDurationOptions = [5, 10, 15, 20, 30];
const activityTypes = ["Class", "Study", "Question Practice", "Mock Test"];
const cancelReasonOptions = ["Burnout", "Sick", "Family", "Emergency", "Reschedule", "Other"];
const revisionSchedule = [
  { offset: 1, stage: "D1" },
  { offset: 3, stage: "D3" },
  { offset: 7, stage: "D7" },
  { offset: 15, stage: "D15" },
  { offset: 30, stage: "D30" }
];

let state = loadState();
let syncMeta = loadSyncMeta();
let lastStateFingerprint = stateFingerprint(state);

const els = {
  sidebarToggle: document.querySelector("#sidebarToggle"),
  examDate: document.querySelector("#examDate"),
  googleSignInBtn: document.querySelector("#googleSignInBtn"),
  googleSignOutBtn: document.querySelector("#googleSignOutBtn"),
  accountName: document.querySelector("#accountName"),
  cloudSyncStatus: document.querySelector("#cloudSyncStatus"),
  networkStatus: document.querySelector("#networkStatus"),
  cloudSyncMessage: document.querySelector("#cloudSyncMessage"),
  themeToggle: document.querySelector("#themeToggle"),
  notificationsEnabled: document.querySelector("#notificationsEnabled"),
  reminderMinutes: document.querySelector("#reminderMinutes"),
  quietStart: document.querySelector("#quietStart"),
  quietEnd: document.querySelector("#quietEnd"),
  notificationStatus: document.querySelector("#notificationStatus"),
  testNotificationBtn: document.querySelector("#testNotificationBtn"),
  installAppBtn: document.querySelector("#installAppBtn"),
  daysToExam: document.querySelector("#daysToExam"),
  todayHours: document.querySelector("#todayHours"),
  weekHours: document.querySelector("#weekHours"),
  streak: document.querySelector("#streak"),
  avgMock: document.querySelector("#avgMock"),
  motivationStreak: document.querySelector("#motivationStreak"),
  readinessScore: document.querySelector("#readinessScore"),
  dashboardMissionDay: document.querySelector("#dashboardMissionDay"),
  dashboardBacklogCount: document.querySelector("#dashboardBacklogCount"),
  backlogCoveredBtn: document.querySelector("#backlogCoveredBtn"),
  editBacklogBtn: document.querySelector("#editBacklogBtn"),
  dashboardDailyCompletion: document.querySelector("#dashboardDailyCompletion"),
  dashboardCurrentFocus: document.querySelector("#dashboardCurrentFocus"),
  dashboardMainSubject: document.querySelector("#dashboardMainSubject"),
  hqClassToday: document.querySelector("#hqClassToday"),
  hqStudyToday: document.querySelector("#hqStudyToday"),
  hqQuestionPracticeToday: document.querySelector("#hqQuestionPracticeToday"),
  hqMockTestToday: document.querySelector("#hqMockTestToday"),
  hqTotalProductiveToday: document.querySelector("#hqTotalProductiveToday"),
  hqBreakToday: document.querySelector("#hqBreakToday"),
  hqProductivity: document.querySelector("#hqProductivity"),
  missionDay: document.querySelector("#missionDay"),
  missionTodayPriority: document.querySelector("#missionTodayPriority"),
  priorityTask: document.querySelector("#priorityTask"),
  priorityMeta: document.querySelector("#priorityMeta"),
  priorityFocusBtn: document.querySelector("#priorityFocusBtn"),
  focusModeBtn: document.querySelector("#focusModeBtn"),
  exitFocusModeBtn: document.querySelector("#exitFocusModeBtn"),
  focusDeck: document.querySelector("#focusDeck"),
  focusDeckSubject: document.querySelector("#focusDeckSubject"),
  focusDeckTask: document.querySelector("#focusDeckTask"),
  focusDeckTimer: document.querySelector("#focusDeckTimer"),
  focusDeckStatus: document.querySelector("#focusDeckStatus"),
  focusDeckStartBtn: document.querySelector("#focusDeckStartBtn"),
  focusDeckPauseBtn: document.querySelector("#focusDeckPauseBtn"),
  celebration: document.querySelector("#celebration"),
  celebrationCloseBtn: document.querySelector("#celebrationCloseBtn"),
  weeklyMissionGrade: document.querySelector("#weeklyMissionGrade"),
  weeklyReportGrid: document.querySelector("#weeklyReportGrid"),
  weeklyReportAction: document.querySelector("#weeklyReportAction"),
  missionMainChapter: document.querySelector("#missionMainChapter"),
  missionRevisionTarget: document.querySelector("#missionRevisionTarget"),
  missionMcqGoal: document.querySelector("#missionMcqGoal"),
  missionHoursTarget: document.querySelector("#missionHoursTarget"),
  sessionTimerDisplay: document.querySelector("#sessionTimerDisplay"),
  sessionStatus: document.querySelector("#sessionStatus"),
  startSessionBtn: document.querySelector("#startSessionBtn"),
  pauseSessionBtn: document.querySelector("#pauseSessionBtn"),
  resumeSessionBtn: document.querySelector("#resumeSessionBtn"),
  totalStudyTime: document.querySelector("#totalStudyTime"),
  totalBreakTime: document.querySelector("#totalBreakTime"),
  breakCount: document.querySelector("#breakCount"),
  pauseModal: document.querySelector("#pauseModal"),
  editMissionBtn: document.querySelector("#editMissionBtn"),
  mentorGreeting: document.querySelector("#mentorGreeting"),
  mentorYesterdayHours: document.querySelector("#mentorYesterdayHours"),
  mentorCurrentStreak: document.querySelector("#mentorCurrentStreak"),
  mentorRecoveryStatus: document.querySelector("#mentorRecoveryStatus"),
  mentorReadiness: document.querySelector("#mentorReadiness"),
  mentorTodayBattle: document.querySelector("#mentorTodayBattle"),
  mentorFocusList: document.querySelector("#mentorFocusList"),
  mentorNote: document.querySelector("#mentorNote"),
  doctorReadiness: document.querySelector("#doctorReadiness"),
  doctorStreak: document.querySelector("#doctorStreak"),
  doctorTargetScore: document.querySelector("#doctorTargetScore"),
  doctorTargetCollege: document.querySelector("#doctorTargetCollege"),
  doctorPathForm: document.querySelector("#doctorPathForm"),
  doctorTargetScoreInput: document.querySelector("#doctorTargetScoreInput"),
  doctorTargetCollegeInput: document.querySelector("#doctorTargetCollegeInput"),
  doctorPathNoteInput: document.querySelector("#doctorPathNoteInput"),
  doctorPathNote: document.querySelector("#doctorPathNote"),
  dailyLine: document.querySelector("#dailyLine"),
  topbarMotivation: document.querySelector("#topbarMotivation"),
  consistencyHeatmap: document.querySelector("#consistencyHeatmap"),
  consistencySummary: document.querySelector("#consistencySummary"),
  goalForm: document.querySelector("#goalForm"),
  goalInput: document.querySelector("#goalInput"),
  goalList: document.querySelector("#goalList"),
  goalSevenDayStats: document.querySelector("#goalSevenDayStats"),
  goalHistory: document.querySelector("#goalHistory"),
  toggleGoalHistoryBtn: document.querySelector("#toggleGoalHistoryBtn"),
  subjectGrid: document.querySelector("#subjectGrid"),
  sessionForm: document.querySelector("#sessionForm"),
  sessionSubject: document.querySelector("#sessionSubject"),
  sessionHours: document.querySelector("#sessionHours"),
  sessionFocus: document.querySelector("#sessionFocus"),
  sessionList: document.querySelector("#sessionList"),
  mockForm: document.querySelector("#mockForm"),
  mockTotal: document.querySelector("#mockTotal"),
  mockCustomTotal: document.querySelector("#mockCustomTotal"),
  mockScore: document.querySelector("#mockScore"),
  mockMistakes: document.querySelector("#mockMistakes"),
  mockMistakeType: document.querySelector("#mockMistakeType"),
  mockWeakArea: document.querySelector("#mockWeakArea"),
  mockName: document.querySelector("#mockName"),
  mockDate: document.querySelector("#mockDate"),
  mockPhysicsScore: document.querySelector("#mockPhysicsScore"),
  mockPhysicsTotal: document.querySelector("#mockPhysicsTotal"),
  mockChemistryScore: document.querySelector("#mockChemistryScore"),
  mockChemistryTotal: document.querySelector("#mockChemistryTotal"),
  mockBotanyScore: document.querySelector("#mockBotanyScore"),
  mockBotanyTotal: document.querySelector("#mockBotanyTotal"),
  mockZoologyScore: document.querySelector("#mockZoologyScore"),
  mockZoologyTotal: document.querySelector("#mockZoologyTotal"),
  mockChart: document.querySelector("#mockChart"),
  mockInsights: document.querySelector("#mockInsights"),
  mockSubjectInsights: document.querySelector("#mockSubjectInsights"),
  rankPredictorForm: document.querySelector("#rankPredictorForm"),
  predictorCategory: document.querySelector("#predictorCategory"),
  predictorRoute: document.querySelector("#predictorRoute"),
  rankPredictorResult: document.querySelector("#rankPredictorResult"),
  mockList: document.querySelector("#mockList"),
  revisionForm: document.querySelector("#revisionForm"),
  revisionInput: document.querySelector("#revisionInput"),
  revisionList: document.querySelector("#revisionList"),
  timetableForm: document.querySelector("#timetableForm"),
  planDate: document.querySelector("#planDate"),
  planTime: document.querySelector("#planTime"),
  planSubject: document.querySelector("#planSubject"),
  planTask: document.querySelector("#planTask"),
  planSubmitBtn: document.querySelector("#planSubmitBtn"),
  planCancelBtn: document.querySelector("#planCancelBtn"),
  timetableList: document.querySelector("#timetableList"),
  todayViewBtn: document.querySelector("#todayViewBtn"),
  weekViewBtn: document.querySelector("#weekViewBtn"),
  viewDate: document.querySelector("#viewDate"),
  tomorrowBtn: document.querySelector("#tomorrowBtn"),
  dailySummary: document.querySelector("#dailySummary"),
  motivationQuote: document.querySelector("#motivationQuote"),
  focusDoneBtn: document.querySelector("#focusDoneBtn"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataBtn: document.querySelector("#importDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  focusStatus: document.querySelector("#focusStatus"),
  syllabusFilter: document.querySelector("#syllabusFilter"),
  syllabusSummary: document.querySelector("#syllabusSummary"),
  syllabusList: document.querySelector("#syllabusList"),
  weakForm: document.querySelector("#weakForm"),
  weakSubject: document.querySelector("#weakSubject"),
  weakTopic: document.querySelector("#weakTopic"),
  weakPriority: document.querySelector("#weakPriority"),
  weakAction: document.querySelector("#weakAction"),
  weakList: document.querySelector("#weakList"),
  resolvedWeakList: document.querySelector("#resolvedWeakList")
};

let timetableView = "today";
let editingPlanId = null;
let goalHistoryVisible = false;
let darkMode = localStorage.getItem("neet-prep-theme") === "dark";
let sidebarCollapsed = localStorage.getItem("medmission-sidebar") === "collapsed";
let notificationSettings = loadNotificationSettings();
let notificationTimers = [];
let notificationScheduleCount = 0;
let deferredInstallPrompt = null;
let firebaseApp = null;
let auth = null;
let db = null;
let firebaseSdk = null;
let currentUser = null;
let unsubscribeCloudState = null;
let cloudSaveTimer = null;
let isApplyingRemoteState = false;
let lastCloudStatus = isFirebaseConfigured ? "Ready" : "Setup needed";
let lastCloudError = "";
let activeMissionPlanId = null;
let liveSessionTicker = null;
let subjectUndo = null;

function todayKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return normalizeState(defaultState);

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return normalizeState(defaultState);
  }
}

function saveState() {
  const nextFingerprint = stateFingerprint(state);
  const hasStateChanged = nextFingerprint !== lastStateFingerprint;

  if (!isApplyingRemoteState && hasStateChanged) {
    state.updatedAt = new Date().toISOString();
    lastStateFingerprint = stateFingerprint(state);
  } else {
    lastStateFingerprint = nextFingerprint;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!isApplyingRemoteState && hasStateChanged) scheduleCloudSave();
}

function normalizeState(value = {}) {
  const parsed = value || {};
  const subjects = Object.fromEntries(
    Object.entries({ ...defaultState.subjects, ...(parsed.subjects || {}) })
      .map(([name, subject]) => [name, normalizeSubjectProgress(subject)])
  );
  return {
    ...defaultState,
    ...parsed,
    missionStartDate: parsed.missionStartDate || defaultState.missionStartDate,
    subjects,
    goals: parsed.goals || defaultState.goals,
    sessions: parsed.sessions || defaultState.sessions,
    liveSession: normalizeLiveSession(parsed.liveSession),
    mocks: (parsed.mocks || defaultState.mocks).map(normalizeMock),
    revisions: (parsed.revisions || defaultState.revisions).map(normalizeRevision),
    focusDays: parsed.focusDays || defaultState.focusDays,
    celebratedDates: Array.isArray(parsed.celebratedDates) ? parsed.celebratedDates : [],
    manualBacklogCount: Number.isFinite(Number(parsed.manualBacklogCount)) ? Math.max(0, Math.round(Number(parsed.manualBacklogCount))) : null,
    weakTopics: parsed.weakTopics || defaultState.weakTopics,
    resolvedWeakTopics: parsed.resolvedWeakTopics || defaultState.resolvedWeakTopics,
    dailyReports: Array.isArray(parsed.dailyReports) ? parsed.dailyReports : [],
    timetable: normalizeTimetable(parsed.timetable || defaultState.timetable),
    syllabusDone: { ...defaultState.syllabusDone, ...(parsed.syllabusDone || {}) },
    doctorPath: { ...defaultState.doctorPath, ...(parsed.doctorPath || {}) },
    predictor: { ...defaultState.predictor, ...(parsed.predictor || {}) },
    updatedAt: parsed.updatedAt || new Date().toISOString()
  };
}

function normalizeTimetable(plans = []) {
  const legacyScheduleKeys = ["auto" + "Rescheduled", "rescheduled" + "From", "rescheduled" + "To"];
  return plans
    .filter((plan) => !plan[legacyScheduleKeys[1]])
    .map((plan) => {
      const wasLegacySchedule = Boolean(plan[legacyScheduleKeys[0]] || plan[legacyScheduleKeys[2]]);
      const cleanPlan = Object.fromEntries(
        Object.entries(plan).filter(([key]) => !legacyScheduleKeys.includes(key))
      );
      const time = normalizePlanTime(plan.time || plan.startTime);
      const topic = normalizePlanTask(plan.topic || plan.task, time);
      return {
        done: false,
        login: "",
        logoff: "",
        archived: false,
        canceled: false,
        cancelReason: "",
        breaks: [],
        sessionLogs: [],
        ...cleanPlan,
        activityType: activityTypes.includes(cleanPlan.activityType) ? cleanPlan.activityType : "Study",
        topic,
        task: topic,
        startTime: cleanPlan.startTime || time,
        endTime: cleanPlan.endTime || cleanPlan.logoff || "",
        totalDuration: Math.max(0, Number(cleanPlan.totalDuration) || 0),
        sessionLogs: Array.isArray(cleanPlan.sessionLogs) ? cleanPlan.sessionLogs : [],
        canceled: wasLegacySchedule ? false : Boolean(cleanPlan.canceled),
        cancelReason: wasLegacySchedule ? "" : (cleanPlan.cancelReason || ""),
        breaks: Array.isArray(plan.breaks) ? plan.breaks : [],
        date: plan.date || dateForWeekday(plan.day),
        time
      };
    });
}

function normalizeMock(mock = {}) {
  const suppliedTotal = Number(mock.total);
  const total = Number.isFinite(suppliedTotal) && suppliedTotal > 0 ? Math.min(2000, Math.round(suppliedTotal)) : 720;
  return {
    ...mock,
    total,
    score: Math.max(0, Math.min(total, Number(mock.score || 0))),
    mistakes: Math.max(0, Number(mock.mistakes || 0)),
    mistakeType: mock.mistakeType || "Mixed mistakes",
    weakArea: mock.weakArea || "",
    name: mock.name || "",
    date: mock.date || todayKey(),
    subjectBreakdown: normalizeSubjectBreakdown(mock.subjectBreakdown)
  };
}

function normalizeSubjectBreakdown(breakdown = {}) {
  return ["Physics", "Chemistry", "Botany", "Zoology"].reduce((result, subject) => {
    const entry = breakdown[subject] || {};
    const total = Number(entry.total);
    const score = Number(entry.score);
    if (Number.isFinite(total) && total > 0 && Number.isFinite(score) && score >= 0) {
      result[subject] = { score: Math.min(Math.round(score), Math.round(total)), total: Math.round(total) };
    }
    return result;
  }, {});
}

function normalizeRevision(revision = {}) {
  return {
    ...revision,
    text: revision.text || "Revision",
    date: revision.date || todayKey(),
    stage: revision.stage || "",
    source: revision.source || "manual"
  };
}

function normalizeSubjectProgress(subject = {}) {
  const total = toWholeNumber(subject.total || subject.theoryTotal || 0);
  const done = toWholeNumber(subject.done || subject.theoryDone || 0);
  const theoryTotal = toWholeNumber(subject.theoryTotal ?? total);
  const questionTotal = toWholeNumber(subject.questionTotal ?? subject.questionsTotal ?? total);
  const revisionTotal = toWholeNumber(subject.revisionTotal ?? Math.ceil(total * 0.6));
  const theoryDone = clamp(toWholeNumber(subject.theoryDone ?? done), 0, theoryTotal);
  const questionDone = clamp(toWholeNumber(subject.questionDone ?? subject.questionsDone ?? Math.round(done * 0.7)), 0, questionTotal);
  const revisionDone = clamp(toWholeNumber(subject.revisionDone ?? Math.round(done * 0.45)), 0, revisionTotal);

  return {
    ...subject,
    done: theoryDone,
    total: theoryTotal,
    theoryDone,
    theoryTotal,
    questionDone,
    questionTotal,
    revisionDone,
    revisionTotal
  };
}

function toWholeNumber(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function normalizeLiveSession(value = {}) {
  const today = todayKey();
  const session = {
    ...defaultState.liveSession,
    ...(value || {}),
    breaks: Array.isArray(value?.breaks) ? value.breaks : []
  };

  if (session.date !== today) {
    return {
      ...defaultState.liveSession,
      date: today
    };
  }

  return {
    ...session,
    status: ["idle", "running", "paused"].includes(session.status) ? session.status : "idle",
    elapsedMs: Math.max(0, Number(session.elapsedMs) || 0),
    breakMs: Math.max(0, Number(session.breakMs) || 0),
    startedAt: session.startedAt || "",
    breakStartedAt: session.breakStartedAt || ""
  };
}

function loadSyncMeta() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_META_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSyncMeta() {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(syncMeta));
}

function stateFingerprint(value) {
  const { updatedAt, ...studyState } = value || {};
  return JSON.stringify(studyState);
}

function loadNotificationSettings() {
  try {
    return { ...defaultNotificationSettings, ...JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || "{}") };
  } catch {
    return defaultNotificationSettings;
  }
}

function saveNotificationSettings() {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(notificationSettings));
}

function createGoogleProvider() {
  const provider = new firebaseSdk.GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

function getFirebaseErrorDetails(error) {
  const details = {
    code: error?.code || "unknown",
    message: error?.message || String(error || "Unknown Firebase error"),
    email: error?.customData?.email || "",
    authDomain: firebaseConfig.authDomain,
    currentOrigin: window.location.origin,
    popupBlocked: error?.code === "auth/popup-blocked",
    popupClosed: error?.code === "auth/popup-closed-by-user",
    cancelledPopup: error?.code === "auth/cancelled-popup-request",
    networkFailed: error?.code === "auth/network-request-failed",
    unauthorizedDomain: error?.code === "auth/unauthorized-domain"
  };

  return details;
}

function logFirebaseAuthError(context, error) {
  const details = getFirebaseErrorDetails(error);
  console.error(`[Firebase Auth] ${context} failed`, details, error);
  return details;
}

function describeFirebaseAuthError(details) {
  const hints = [];

  if (details.unauthorizedDomain) {
    hints.push(`Add ${window.location.hostname} to Firebase Authentication > Settings > Authorized domains.`);
  }

  if (details.popupBlocked) {
    hints.push("Allow popups for this site or use redirect sign-in.");
  }

  if (details.popupClosed || details.cancelledPopup) {
    hints.push("The Google popup closed before Firebase received the sign-in result.");
  }

  if (details.networkFailed) {
    hints.push("Check the internet connection, VPN, firewall, or browser privacy extensions.");
  }

  return `${details.code}: ${details.message}${hints.length ? ` ${hints.join(" ")}` : ""}`;
}

function shouldRetryWithRedirect(details, elapsedMs) {
  return details.popupBlocked
    || details.cancelledPopup
    || (details.popupClosed && elapsedMs < 2500);
}

async function initializeCloudSync() {
  renderSyncStatus();
  if (!isFirebaseConfigured) return;

  try {
    firebaseSdk = await loadFirebaseSdk();
    firebaseApp = firebaseSdk.initializeApp(firebaseConfig);
    auth = firebaseSdk.getAuth(firebaseApp);
    db = firebaseSdk.getFirestore(firebaseApp);
    await firebaseSdk.setPersistence(auth, firebaseSdk.browserLocalPersistence);
    firebaseSdk.enableIndexedDbPersistence(db).catch(() => {
      lastCloudStatus = "Offline cache limited";
      renderSyncStatus();
    });

    firebaseSdk.getRedirectResult(auth).catch((error) => {
      const details = logFirebaseAuthError("Google redirect sign-in", error);
      lastCloudStatus = "Sign in failed";
      lastCloudError = describeFirebaseAuthError(details);
      renderSyncStatus();
    });

    firebaseSdk.onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      if (unsubscribeCloudState) unsubscribeCloudState();
      unsubscribeCloudState = null;
      lastCloudError = "";

      if (!user) {
        lastCloudStatus = "Not connected";
        renderSyncStatus();
        return;
      }

      lastCloudStatus = "Connecting";
      renderSyncStatus();
      const cloudState = await hydrateCloudState(user);
      subscribeToCloudState(user);
      if (cloudState.safeToCreate) scheduleCloudSave(50);
    });
  } catch (error) {
    logFirebaseAuthError("Firebase initialization", error);
    lastCloudStatus = "Setup error";
    lastCloudError = error?.message || "Firebase setup failed. Check the browser console for details.";
    renderSyncStatus();
  }
}

async function loadFirebaseSdk() {
  if (firebaseSdk) return firebaseSdk;
  const [appModule, authModule, firestoreModule] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);
  return { ...appModule, ...authModule, ...firestoreModule };
}

function userStateDoc(user = currentUser) {
  if (!db || !user) return null;
  return firebaseSdk.doc(db, "users", user.uid, "medmission", "state");
}

async function hydrateCloudState(user) {
  const stateDoc = userStateDoc(user);
  if (!stateDoc) return { safeToCreate: false };

  try {
    const snapshot = await firebaseSdk.getDoc(stateDoc);
    if (!snapshot.exists()) {
      lastCloudStatus = navigator.onLine ? "Creating backup" : "Waiting for internet";
      return { safeToCreate: navigator.onLine };
    }

    const remoteState = normalizeState(snapshot.data().state || {});
    // The account backup is the source of truth as soon as it connects.
    applyRemoteState(remoteState);
    lastCloudStatus = navigator.onLine ? "Synced" : "Offline ready";
    return { safeToCreate: false };
  } catch {
    lastCloudStatus = navigator.onLine ? "Sync check failed" : "Waiting for internet";
    return { safeToCreate: false };
  } finally {
    renderSyncStatus();
  }
}

function subscribeToCloudState(user) {
  const stateDoc = userStateDoc(user);
  if (!stateDoc) return;

  unsubscribeCloudState = firebaseSdk.onSnapshot(stateDoc, { includeMetadataChanges: true }, (snapshot) => {
    const fromCache = snapshot.metadata.fromCache;
    const pendingWrites = snapshot.metadata.hasPendingWrites;
    lastCloudStatus = pendingWrites ? "Saving" : fromCache ? "Offline ready" : "Synced";

    if (snapshot.exists() && !pendingWrites) {
      const remoteState = normalizeState(snapshot.data().state || {});
      if (isRemoteNewer(remoteState, state)) {
        applyRemoteState(remoteState);
      }
    }

    renderSyncStatus();
  }, () => {
    lastCloudStatus = navigator.onLine ? "Sync error" : "Waiting for internet";
    renderSyncStatus();
  });
}

function applyRemoteState(remoteState) {
  isApplyingRemoteState = true;
  state = remoteState;
  lastStateFingerprint = stateFingerprint(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
  scheduleStudyNotifications();
  isApplyingRemoteState = false;
}

function scheduleCloudSave(delay = 600) {
  clearTimeout(cloudSaveTimer);
  if (!currentUser || !db || !isFirebaseConfigured) return;
  cloudSaveTimer = setTimeout(saveCloudState, delay);
}

async function saveCloudState() {
  const stateDoc = userStateDoc();
  if (!stateDoc) return;

  try {
    lastCloudStatus = navigator.onLine ? "Saving" : "Queued offline";
    renderSyncStatus();
    await firebaseSdk.setDoc(stateDoc, {
      state,
      updatedAt: state.updatedAt,
      user: {
        uid: currentUser.uid,
        name: currentUser.displayName || "",
        email: currentUser.email || ""
      },
      savedAt: firebaseSdk.serverTimestamp()
    }, { merge: true });
    syncMeta.lastSyncedAt = new Date().toISOString();
    saveSyncMeta();
    lastCloudStatus = navigator.onLine ? "Synced" : "Queued offline";
  } catch {
    lastCloudStatus = navigator.onLine ? "Save failed" : "Waiting for internet";
  } finally {
    renderSyncStatus();
  }
}
function isRemoteNewer(remoteState, localState) {
  return new Date(remoteState.updatedAt || 0).getTime() > new Date(localState.updatedAt || 0).getTime();
}

function renderSyncStatus() {
  if (!els.googleSignInBtn || !els.googleSignOutBtn || !els.accountName || !els.cloudSyncStatus || !els.networkStatus || !els.cloudSyncMessage) return;
  els.googleSignInBtn.disabled = !isFirebaseConfigured;
  els.googleSignInBtn.classList.toggle("hidden", Boolean(currentUser));
  els.googleSignOutBtn.classList.toggle("hidden", !currentUser);
  els.accountName.textContent = currentUser
    ? (currentUser.displayName || currentUser.email || "Google account")
    : "Local backup only";
  els.cloudSyncStatus.textContent = lastCloudStatus;
  els.networkStatus.textContent = navigator.onLine ? "Online" : "Offline";

  if (!isFirebaseConfigured) {
    els.cloudSyncMessage.textContent = "Add your Firebase project settings in app.js to enable Google Sign In and Firestore sync.";
    return;
  }

  if (lastCloudError) {
    els.cloudSyncMessage.textContent = lastCloudError;
    return;
  }

  if (!currentUser) {
    els.cloudSyncMessage.textContent = "Sign in to keep study data synced across devices. Local storage remains as backup.";
    return;
  }

  const synced = syncMeta.lastSyncedAt ? ` Last saved: ${new Date(syncMeta.lastSyncedAt).toLocaleString()}.` : "";
  els.cloudSyncMessage.textContent = navigator.onLine
    ? `Automatic cloud sync is active.${synced}`
    : "Offline changes are being saved locally and will sync when internet returns.";
}

function formatHours(hours) {
  if (!hours) return "0h";
  return `${Number(hours.toFixed(2))}h`;
}

function render() {
  renderTheme();
  renderNotificationSettings();
  renderSyncStatus();
  els.planDate.value ||= todayKey();
  els.viewDate.value ||= todayKey();
  els.mockDate.value ||= todayKey();
  saveState();
  renderExam();
  renderStats();
  renderMissionControl();
  renderDailyCommandCenter();
  renderGoals();
  renderSubjects();
  renderSessions();
  renderMocks();
  renderRankPredictor();
  renderRevisions();
  renderTimetable();
  renderMotivation();
  renderSyllabus();
  renderWeakTopics();
  renderCircular();
}

function renderNotificationSettings() {
  els.notificationsEnabled.checked = notificationsAreReady();
  els.reminderMinutes.value = notificationSettings.reminderMinutes.join(",");
  els.quietStart.value = notificationSettings.quietStart;
  els.quietEnd.value = notificationSettings.quietEnd;
  updateNotificationStatus();
}

function renderTheme() {
  document.body.classList.toggle("dark-mode", darkMode);
  document.body.classList.toggle("sidebar-collapsed", sidebarCollapsed);
  if (els.themeToggle) els.themeToggle.textContent = darkMode ? "Light Mode" : "Premium Dark";
  localStorage.setItem("neet-prep-theme", darkMode ? "dark" : "light");
  localStorage.setItem("medmission-sidebar", sidebarCollapsed ? "collapsed" : "expanded");
}

function renderExam() {
  els.examDate.value = state.examDate;
  const today = new Date(todayKey());
  const exam = new Date(state.examDate);
  const diff = Math.ceil((exam - today) / 86400000);
  els.daysToExam.textContent = Number.isFinite(diff) ? Math.max(diff, 0) : "--";
}

function renderStats() {
  const today = todayKey();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const todayAnalytics = getActivityAnalytics([today]);
  const todayStudyMs = todayAnalytics.total;
  // "Break Time Today" is a timetable metric: it starts only after the
  // user presses a Break button for one of today's timetable entries.
  const todayBreakMs = getTimetableBreakMs(today);
  const todayHours = todayStudyMs / 3600000;
  const weekAnalytics = getActivityAnalytics(getNextDates(7, todayKey(-6)));
  const weekHours = weekAnalytics.total / 3600000;
  const streak = getGoalStreak();

  const avg = state.mocks.length
    ? Math.round(state.mocks.reduce((sum, mock) => sum + getMockProjectedScore(mock), 0) / state.mocks.length)
    : 0;

  els.todayHours.textContent = formatHours(todayHours);
  els.weekHours.textContent = formatHours(weekHours);
  els.streak.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
  els.avgMock.textContent = avg;
  const focusStreak = getFocusStreak();
  els.motivationStreak.textContent = `${focusStreak} ${focusStreak === 1 ? "day" : "days"}`;
  const readiness = getReadinessScore(avg, focusStreak);
  if (els.readinessScore) els.readinessScore.textContent = `${readiness}%`;
  if (els.doctorReadiness) els.doctorReadiness.textContent = `${readiness}%`;
  if (els.doctorStreak) els.doctorStreak.textContent = `${Math.max(streak, focusStreak)} ${Math.max(streak, focusStreak) === 1 ? "day" : "days"}`;
  if (els.mentorReadiness) els.mentorReadiness.textContent = `${readiness}%`;
  const productivity = todayStudyMs + todayBreakMs ? Math.round((todayStudyMs / (todayStudyMs + todayBreakMs)) * 100) : 0;
  if (els.hqClassToday) els.hqClassToday.textContent = formatDuration(todayAnalytics.Class);
  if (els.hqStudyToday) els.hqStudyToday.textContent = formatDuration(todayAnalytics.Study);
  if (els.hqQuestionPracticeToday) els.hqQuestionPracticeToday.textContent = formatDuration(todayAnalytics["Question Practice"]);
  if (els.hqMockTestToday) els.hqMockTestToday.textContent = formatDuration(todayAnalytics["Mock Test"]);
  if (els.hqTotalProductiveToday) els.hqTotalProductiveToday.textContent = formatDuration(todayAnalytics.total);
  if (els.hqBreakToday) els.hqBreakToday.textContent = formatDuration(todayBreakMs);
  if (els.hqProductivity) els.hqProductivity.textContent = `${productivity}%`;
  const todayPlans = state.timetable.filter((plan) => plan.date === today && !plan.archived && !plan.canceled);
  const activePlan = todayPlans.find((plan) => !plan.done) || todayPlans[0];
  const dailyCompletion = getDailyCompletionPercent(today);
  const backlogCount = getBacklogCount();
  const missionDay = getMissionDay();
  if (els.dashboardMissionDay) els.dashboardMissionDay.textContent = missionDay;
  if (els.dashboardBacklogCount) els.dashboardBacklogCount.textContent = backlogCount;
  if (els.backlogCoveredBtn) els.backlogCoveredBtn.disabled = backlogCount <= 0;
  if (els.dashboardDailyCompletion) els.dashboardDailyCompletion.textContent = `${dailyCompletion}%`;
  if (els.dashboardCurrentFocus) els.dashboardCurrentFocus.textContent = activePlan ? `${activePlan.activityType || "Study"} � ${activePlan.subject}` : "Set mission";
  if (els.dashboardMainSubject) els.dashboardMainSubject.textContent = activePlan?.topic || activePlan?.task || "Not set";
  if (els.missionDay) els.missionDay.textContent = missionDay;
  if (els.missionTodayPriority) els.missionTodayPriority.textContent = activePlan ? `${activePlan.subject}: ${activePlan.task}` : "No timetable yet. Create today's battle plan.";
  renderWeeklyReport();
  renderLiveSession();
  renderFocusDeck();
}

function renderDailyCommandCenter() {
  const todayPlans = state.timetable
    .filter((plan) => plan.date === todayKey() && !plan.archived && !plan.canceled)
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextPlan = todayPlans.find((plan) => !plan.done) || todayPlans.at(-1);
  if (els.priorityTask) els.priorityTask.textContent = nextPlan?.task || "Set your first task";
  if (els.priorityMeta) {
    els.priorityMeta.textContent = nextPlan
      ? `${nextPlan.subject} · ${nextPlan.time}${nextPlan.done ? " · Completed—choose tomorrow’s first task." : " · Your next clear action."}`
      : "Add a task to the timetable and it will appear here.";
  }
}

function getMissionDay() {
  const start = new Date(`${state.missionStartDate || defaultState.missionStartDate}T00:00:00`);
  const today = new Date(`${todayKey()}T00:00:00`);
  const diff = Math.floor((today - start) / 86400000) + 1;
  return Number.isFinite(diff) ? Math.max(diff, 1) : 1;
}

function getBacklogCount() {
  if (Number.isFinite(Number(state.manualBacklogCount))) {
    return Math.max(0, Math.round(Number(state.manualBacklogCount)));
  }
  return getAutoBacklogCount();
}

function getAutoBacklogCount() {
  return state.timetable.filter((plan) => !plan.archived && !plan.canceled && !plan.done && plan.date < todayKey()).length;
}

function getDailyCompletionPercent(date = todayKey()) {
  const plans = state.timetable.filter((plan) => !plan.archived && !plan.canceled && plan.date === date);
  if (!plans.length) return 0;
  return Math.round((plans.filter((plan) => plan.done).length / plans.length) * 100);
}

function renderLiveSession() {
  if (!els.sessionTimerDisplay) return;
  const statusLabel = {
    idle: "Ready",
    running: "In Progress",
    paused: "Paused"
  }[state.liveSession.status] || "Ready";

  els.sessionTimerDisplay.textContent = formatClock(getLiveStudyMs());
  els.sessionStatus.textContent = statusLabel;
  els.startSessionBtn.disabled = state.liveSession.status === "running";
  if (els.pauseSessionBtn) els.pauseSessionBtn.disabled = state.liveSession.status !== "running";
  els.resumeSessionBtn.classList.toggle("hidden", state.liveSession.status !== "paused");
  els.pauseSessionBtn?.classList.toggle("hidden", state.liveSession.status === "paused");
  els.totalStudyTime.textContent = formatDuration(getLiveStudyMs());
  els.totalBreakTime.textContent = formatDuration(getLiveBreakMs());
  els.breakCount.textContent = state.liveSession.breaks.length;
}

function renderFocusDeck() {
  if (!els.focusDeckTimer) return;
  const todayPlans = state.timetable
    .filter((plan) => plan.date === todayKey() && !plan.archived && !plan.canceled)
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextPlan = todayPlans.find((plan) => !plan.done) || todayPlans.at(-1);
  const status = state.liveSession.status === "running" ? "In deep work" : state.liveSession.status === "paused" ? "Paused—return when ready." : "Ready when you are.";
  els.focusDeckSubject.textContent = nextPlan?.subject || "Your next task";
  els.focusDeckTask.textContent = nextPlan?.task || "Choose one clear action and begin.";
  els.focusDeckTimer.textContent = formatClock(getLiveStudyMs());
  els.focusDeckStatus.textContent = status;
  els.focusDeckStartBtn.disabled = state.liveSession.status === "running";
  els.focusDeckStartBtn.textContent = state.liveSession.status === "paused" ? "Resume Timer" : "Start Timer";
  els.focusDeckPauseBtn.disabled = state.liveSession.status !== "running";
}

function getLiveStudyMs(now = Date.now()) {
  const session = state.liveSession;
  const startedAt = Date.parse(session.startedAt);
  if (session.status === "running" && Number.isFinite(startedAt)) {
    return session.elapsedMs + Math.max(0, now - startedAt);
  }
  return session.elapsedMs;
}

function getActivityAnalytics(dates = []) {
  const includedDates = new Set(dates);
  const summary = Object.fromEntries(activityTypes.map((type) => [type, 0]));

  state.sessions
    .filter((session) => includedDates.has(session.date) && !session.canceled)
    .forEach((session) => {
      const type = activityTypes.includes(session.activityType) ? session.activityType : "Study";
      summary[type] += Math.max(0, Number(session.hours) || 0) * 3600000;
    });

  if (includedDates.has(todayKey()) && state.liveSession.date === todayKey()) {
    summary.Study += getLiveStudyMs();
  }

  summary.total = activityTypes.reduce((total, type) => total + summary[type], 0);
  return summary;
}
function getLiveBreakMs(now = Date.now()) {
  const session = state.liveSession;
  const breakStartedAt = Date.parse(session.breakStartedAt);
  if (session.status === "paused" && Number.isFinite(breakStartedAt)) {
    return session.breakMs + Math.max(0, now - breakStartedAt);
  }
  return session.breakMs;
}

function getTimetableBreakMs(date = todayKey(), now = Date.now()) {
  return state.timetable
    .filter((plan) => plan.date === date && !plan.archived && !plan.canceled)
    .flatMap((plan) => Array.isArray(plan.breaks) ? plan.breaks : [])
    .reduce((total, planBreak) => {
      const startedAt = Date.parse(planBreak.startedAt);
      if (!Number.isFinite(startedAt)) return total;

      const endedAt = Date.parse(planBreak.endedAt);
      const finishAt = Number.isFinite(endedAt) ? endedAt : now;
      return total + Math.max(0, finishAt - startedAt);
    }, 0);
}

function formatClock(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

function renderMissionControl() {
  if (!els.missionMainChapter || !els.missionRevisionTarget || !els.missionMcqGoal || !els.missionHoursTarget || !els.mentorGreeting || !els.mentorYesterdayHours || !els.mentorFocusList) return;
  const todayPlans = state.timetable
    .filter((plan) => plan.date === todayKey() && !plan.archived && !plan.canceled)
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextPlan = todayPlans.find((plan) => !plan.done) || todayPlans[0];
  activeMissionPlanId = nextPlan?.id || null;
  const revisionTarget = state.revisions[0]?.text || "Error notes revision";
  const subjectFocus = buildMentorFocus(todayPlans, revisionTarget);
  const snapshot = getMentorSnapshot(todayPlans, revisionTarget);

  els.missionMainChapter.textContent = nextPlan?.task || "Human Physiology";
  els.missionRevisionTarget.textContent = revisionTarget;
  els.missionMcqGoal.textContent = getMcqGoal();
  els.missionHoursTarget.textContent = snapshot.studyTarget;
  els.mentorGreeting.textContent = getDailyGreeting();
  els.mentorYesterdayHours.textContent = formatHours(snapshot.yesterdayHours);
  if (els.mentorCurrentStreak) els.mentorCurrentStreak.textContent = `${snapshot.streak} ${snapshot.streak === 1 ? "Day" : "Days"}`;
  if (els.mentorRecoveryStatus) els.mentorRecoveryStatus.textContent = snapshot.recoveryStatus;
  if (els.mentorTodayBattle) els.mentorTodayBattle.textContent = snapshot.todayBattle;
  if (els.mentorNote) els.mentorNote.textContent = getMentorMessage(snapshot, todayPlans);
  els.mentorFocusList.innerHTML = subjectFocus.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  renderDoctorPath();
}

function renderDoctorPath() {
  if (!els.doctorTargetScore || !els.doctorTargetCollege || !els.doctorPathNote) return;
  els.doctorTargetScore.textContent = state.doctorPath.targetScore || defaultState.doctorPath.targetScore;
  els.doctorTargetCollege.textContent = state.doctorPath.targetCollege || defaultState.doctorPath.targetCollege;
  els.doctorPathNote.textContent = state.doctorPath.note || defaultState.doctorPath.note;
  if (els.doctorTargetScoreInput) els.doctorTargetScoreInput.value = state.doctorPath.targetScore || "";
  if (els.doctorTargetCollegeInput) els.doctorTargetCollegeInput.value = state.doctorPath.targetCollege || "";
  if (els.doctorPathNoteInput) els.doctorPathNoteInput.value = state.doctorPath.note || "";
}

function getHoursForDate(date) {
  return state.sessions
    .filter((session) => session.date === date && !session.canceled)
    .reduce((sum, session) => sum + Number(session.hours), 0);
}

function getMcqGoal() {
  const mockMistakes = state.mocks.at(-1)?.mistakes || 0;
  return Math.max(80, Math.min(160, 100 + Math.round(mockMistakes / 2)));
}

function buildMentorFocus(todayPlans, revisionTarget) {
  const planFocus = todayPlans
    .map((plan) => plan.subject === "Mock Test" ? plan.task : `${plan.time} ${plan.subject}: ${plan.task}`)
    .filter(Boolean);
  if (planFocus.length) return [...new Set(planFocus)].slice(0, 4);
  return ["Add today's slots in Timetable Planner"];
}

function getMentorSnapshot(todayPlans = state.timetable.filter((plan) => plan.date === todayKey()), revisionTarget = state.revisions[0]?.text || "Error notes revision") {
  const avg = state.mocks.length
    ? Math.round(state.mocks.reduce((sum, mock) => sum + Number(mock.score), 0) / state.mocks.length)
    : 0;
  const streak = Math.max(getGoalStreak(), getFocusStreak());
  const readiness = getReadinessScore(avg, getFocusStreak());
  return {
    yesterdayHours: getHoursForDate(todayKey(-1)),
    streak,
    readiness,
    todayBattle: getTodayBattle(todayPlans, revisionTarget),
    recoveryStatus: getRecoveryStatus(todayPlans),
    studyTarget: getStudyTarget(todayPlans)
  };
}

function getMentorMessage(snapshot, todayPlans) {
  const allDone = todayPlans.length > 0 && todayPlans.every((plan) => plan.done);
  if (allDone) return "Mission accomplished. Prepare for tomorrow.";
  if (snapshot.yesterdayHours === 0) return "Headquarters requests a fresh restart today.";
  if (snapshot.streak > 7) return "Excellent consistency. Keep building momentum.";
  if (todayPlans.length === 0) return "Set one mission before starting. Headquarters is ready.";
  return "Choose the next clear action and execute it calmly.";
}

function getTodayBattle(todayPlans, revisionTarget) {
  const activePlan = todayPlans.find((plan) => !plan.done) || todayPlans[0];
  if (!activePlan) return "Add today's battle in Timetable Planner";
  return `According to your willingness: ${activePlan.subject} - ${activePlan.task}`;
}

function getRecoveryStatus(todayPlans) {
  const yesterdayHours = getHoursForDate(todayKey(-1));
  const missedToday = todayPlans.filter((plan) => getPlanTimingClass(plan) === "missed").length;
  const doneToday = todayPlans.filter((plan) => plan.done).length;
  if (yesterdayHours >= 8 && missedToday === 0) return "On Track";
  if (doneToday > 0 || yesterdayHours >= 5) return "Recovering";
  return "Needs Push";
}

function getStudyTarget(todayPlans) {
  const plannedMinutes = todayPlans.reduce((sum, plan) => sum + getPlanDurationMinutes(plan), 0);
  if (plannedMinutes >= 60) return formatHours(plannedMinutes / 60);
  return "10 Hours";
}

function getDailyGreeting() {
  const hour = new Date().getHours();
  return `${hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"} Noel`;
}

function getReadinessScore(avgMock, focusStreak) {
  const subjectTotals = Object.values(state.subjects);
  const chapterPercent = subjectTotals.length
    ? subjectTotals.reduce((sum, subject) => {
      const theory = getProgressRatio(subject.theoryDone, subject.theoryTotal);
      const questions = getProgressRatio(subject.questionDone, subject.questionTotal);
      const revision = getProgressRatio(subject.revisionDone, subject.revisionTotal);
      return sum + ((theory + questions + revision) / 3);
    }, 0) / subjectTotals.length
    : 0;
  const syllabusPercent = syllabusUnits.length
    ? Object.values(state.syllabusDone).filter(Boolean).length / syllabusUnits.length
    : 0;
  const mockPercent = Math.min(avgMock / 720, 1);
  const streakPercent = Math.min(focusStreak / 21, 1);
  return Math.round(((chapterPercent * 0.4) + (syllabusPercent * 0.25) + (mockPercent * 0.25) + (streakPercent * 0.1)) * 100);
}

function getProgressRatio(done, total) {
  const normalizedTotal = toWholeNumber(total);
  if (!normalizedTotal) return 0;
  return clamp(toWholeNumber(done), 0, normalizedTotal) / normalizedTotal;
}

function renderGoals() {
  const todaysGoals = state.goals.filter((goal) => goal.date === todayKey());
  els.goalList.innerHTML = todaysGoals.length
    ? todaysGoals.map((goal) => `
      <label class="goal-item ${goal.done ? "done" : ""}">
        <input type="checkbox" data-goal-toggle="${goal.id}" ${goal.done ? "checked" : ""} />
        <span>${escapeHtml(goal.text)}</span>
        <button class="text-button" type="button" data-goal-delete="${goal.id}">Remove</button>
      </label>
    `).join("")
    : `<div class="mini-item"><span>No goals today. Set one mission before starting.</span></div>`;

  renderGoalWeekStats();
  renderGoalHistory();
}

function renderGoalWeekStats() {
  if (!els.goalSevenDayStats) return;
  const dates = getNextDates(7, todayKey(-6));
  const goals = state.goals.filter((goal) => dates.includes(goal.date));
  const completed = goals.filter((goal) => goal.done).length;
  const missed = goals.filter((goal) => !goal.done && goal.date < todayKey()).length;
  const completion = goals.length ? Math.round((completed / goals.length) * 100) : 0;
  els.goalSevenDayStats.innerHTML = [
    ["Completed Goals", completed],
    ["Missed Goals", missed],
    ["Completion", `${completion}%`]
  ].map(([label, value]) => `
    <div>
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderGoalHistory() {
  els.goalHistory.classList.toggle("hidden", !goalHistoryVisible);
  els.toggleGoalHistoryBtn.textContent = goalHistoryVisible ? "Hide Goal History" : "Show Goal History";

  const byDate = state.goals.reduce((groups, goal) => {
    groups[goal.date] = groups[goal.date] || [];
    groups[goal.date].push(goal);
    return groups;
  }, {});

  const dates = Object.keys(byDate).sort().reverse().slice(0, 7);
  els.goalHistory.innerHTML = dates.length
    ? dates.map((date) => {
      const goals = byDate[date];
      const doneCount = goals.filter((goal) => goal.done).length;
      return `
        <section class="history-day">
          <strong><span>${date === todayKey() ? "Today" : date}</span><span>${doneCount}/${goals.length}</span></strong>
          <ul>
            ${goals.map((goal) => `<li class="${goal.done ? "done" : ""}">${escapeHtml(goal.text)}</li>`).join("")}
          </ul>
        </section>
      `;
    }).join("")
    : `<div class="mini-item"><span>No goal history yet. Complete one mission to begin the record.</span></div>`;
}

function renderSubjects() {
  els.subjectGrid.innerHTML = Object.entries(state.subjects).map(([name, subject]) => {
    const metrics = getSubjectMetrics(subject);
    const subjectPercent = getSubjectPercent(metrics);
    return `
      <article class="subject-card">
        <div class="subject-title">
          <strong>${name}</strong>
          <span>${subjectPercent}%</span>
        </div>
        <div class="subject-progress-list">
          ${metrics.map(([label, done, total, type]) => {
            const percent = Math.round(getProgressRatio(done, total) * 100);
            const undoVisible = subjectUndo?.subject === name && subjectUndo?.track === type;
            return `
              <div class="subject-progress-row">
                <div class="subject-progress-header">
                  <span>${label}</span>
                  <button class="subject-total-button" type="button" data-subject-total="${name}" data-subject-track="${type}" title="Edit total">${done}/${total} Edit</button>
                </div>
                <div class="progress-track" aria-label="${label} ${percent}%"><div class="progress-fill" style="width:${percent}%"></div></div>
                <div class="subject-stepper" aria-label="${label} controls">
                  <button type="button" data-subject-delta="-1" data-subject-name="${name}" data-subject-track="${type}" ${done <= 0 ? "disabled" : ""}>-</button>
                  <strong>${done}</strong>
                  <button type="button" data-subject-delta="1" data-subject-name="${name}" data-subject-track="${type}" ${done >= total ? "disabled" : ""}>+</button>
                  <button class="subject-undo ${undoVisible ? "" : "hidden"}" type="button" data-subject-undo="${name}" data-subject-track="${type}">Undo</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function getSubjectMetrics(subject) {
  return [
    ["Theory", subject.theoryDone, subject.theoryTotal, "theory"],
    ["Questions", subject.questionDone, subject.questionTotal, "question"],
    ["Revision", subject.revisionDone, subject.revisionTotal, "revision"]
  ];
}

function getSubjectPercent(metrics) {
  if (!metrics.length) return 0;
  return Math.round(metrics.reduce((sum, [, done, total]) => sum + getProgressRatio(done, total), 0) / metrics.length * 100);
}

function renderSessions() {
  const latest = [...state.sessions].slice(-4).reverse();
  els.sessionList.innerHTML = latest.length
    ? latest.map((session) => `
      <div class="mini-item ${session.canceled ? "canceled" : ""}">
        <span>
          ${escapeHtml(session.subject)}: ${formatHours(Number(session.hours))}
          <small>${session.canceled ? `Canceled - ${escapeHtml(session.cancelReason || "No reason saved")}` : `${escapeHtml(session.focus || "Focused study")} - ${session.date}`}</small>
        </span>
        <button class="text-button danger-button" type="button" data-session-cancel="${session.id}" ${session.canceled ? "disabled" : ""}>${session.canceled ? "Canceled" : "Cancel Session"}</button>
      </div>
    `).join("")
    : `<div class="mini-item"><span>No sessions saved yet.</span></div>`;
}

function renderMocks() {
  const latest = [...state.mocks].slice(-6);
  els.mockChart.innerHTML = latest.length
    ? latest.map((mock) => {
      const percent = getMockPercent(mock);
      const height = Math.max(8, percent);
      return `<div class="bar" style="height:${height}%"><span>${percent}%</span></div>`;
    }).join("")
    : `<span>No scores yet</span>`;

  renderMockInsights();
  renderMockSubjectInsights();
  els.mockList.innerHTML = [...state.mocks].slice(-5).reverse().map((mock) => `
    <div class="mini-item">
      <span>
        ${escapeHtml(mock.name || "Test")} · ${mock.score}/${mock.total || 720} - ${getMockPercent(mock)}%
        <small>${getMockProjectedScore(mock)}/720 equivalent - ${mock.mistakes || 0} mistakes - ${escapeHtml(mock.mistakeType || "Mixed mistakes")} - ${escapeHtml(mock.weakArea || "No weak area saved")} - ${formatMockDate(mock.date)}${formatSubjectBreakdown(mock)}</small>
      </span>
      <button class="text-button" type="button" data-mock-delete="${mock.id}">Remove</button>
    </div>
  `).join("");
}

function renderMockSubjectInsights() {
  if (!els.mockSubjectInsights) return;
  const subjects = ["Physics", "Chemistry", "Botany", "Zoology"];
  const subjectData = subjects.map((subject) => {
    const entries = state.mocks
      .map((mock) => ({ ...mock.subjectBreakdown?.[subject], date: mock.date }))
      .filter((entry) => entry.total > 0);
    const average = entries.length ? Math.round(entries.reduce((sum, entry) => sum + ((entry.score / entry.total) * 100), 0) / entries.length) : null;
    const latest = entries.at(-1);
    const previous = entries.length > 1 ? entries.at(-2) : null;
    const trend = latest && previous ? Math.round(((latest.score / latest.total) - (previous.score / previous.total)) * 100) : null;
    return { subject, entries, average, trend };
  });
  const tracked = subjectData.filter((item) => item.average !== null);
  if (!tracked.length) {
    els.mockSubjectInsights.innerHTML = `<div class="subject-analysis-empty">Add subject-wise scores in your next test to reveal strengths, weak subjects, and individual trends.</div>`;
    return;
  }
  const strongest = [...tracked].sort((a, b) => b.average - a.average)[0];
  const focus = [...tracked].sort((a, b) => a.average - b.average)[0];
  els.mockSubjectInsights.innerHTML = `
    <div class="subject-analysis-header"><div><p class="eyebrow">Subject Analysis</p><h3>Where to push next</h3></div><span>Strongest: ${strongest.subject} · Focus: ${focus.subject}</span></div>
    <div class="subject-analysis-grid">
      ${subjectData.map((item) => item.average === null
        ? `<div class="subject-analysis-card muted"><strong>${item.subject}</strong><span>No split logged yet</span></div>`
        : `<div class="subject-analysis-card"><strong>${item.subject}</strong><b>${item.average}%</b><span>${item.entries.length} test${item.entries.length === 1 ? "" : "s"} · ${item.trend === null ? "Add another for trend" : `${item.trend > 0 ? "+" : ""}${item.trend}% vs last`}</span><div class="subject-analysis-track"><i style="width:${item.average}%"></i></div></div>`
      ).join("")}
    </div>
    <p class="subject-analysis-action">${focus.subject} is your current focus subject. Review its latest errors, then plan a short targeted practice block before the next test.</p>
  `;
}

function formatSubjectBreakdown(mock) {
  const entries = Object.entries(mock.subjectBreakdown || {});
  if (!entries.length) return "";
  return ` · ${entries.map(([subject, item]) => `${subject.slice(0, 3)} ${item.score}/${item.total}`).join(" · ")}`;
}

function renderMockInsights() {
  const tests = state.mocks;
  if (!tests.length) {
    els.mockInsights.innerHTML = `<div class="mock-insight-main"><strong>Add your first test</strong><span>Every score is normalized to percentage, so part-tests and full tests can be compared fairly.</span></div>`;
    return;
  }

  const percentages = tests.map(getMockPercent);
  const average = Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length);
  const best = Math.max(...percentages);
  const recent = percentages.slice(-3);
  const previous = percentages.slice(-6, -3);
  const recentAverage = Math.round(recent.reduce((sum, value) => sum + value, 0) / recent.length);
  const previousAverage = previous.length ? Math.round(previous.reduce((sum, value) => sum + value, 0) / previous.length) : null;
  const trend = previousAverage === null ? "Build your baseline" : recentAverage - previousAverage;
  const averageMistakes = (tests.reduce((sum, test) => sum + Number(test.mistakes || 0), 0) / tests.length).toFixed(1);
  const spread = Math.round(percentages.reduce((sum, value) => sum + Math.abs(value - average), 0) / percentages.length);
  const mistakeCounts = tests.reduce((counts, test) => {
    const type = test.mistakeType || "Mixed mistakes";
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const recurringError = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Mixed mistakes";
  const latest = tests.at(-1);
  const targetScore = Number(state.doctorPath?.targetScore) || 650;
  const targetPercent = Math.round((targetScore / 720) * 100);
  const targetGap = Math.max(0, targetPercent - getMockPercent(latest));
  const trendText = typeof trend === "number" ? `${trend > 0 ? "+" : ""}${trend}% vs previous 3` : trend;
  const nextAction = latest.weakArea
    ? `Next move: repair ${latest.weakArea} and review ${recurringError.toLowerCase()} errors before the next test.`
    : `Next move: review ${recurringError.toLowerCase()} errors before the next test.`;

  els.mockInsights.innerHTML = `
    <div class="mock-metric"><span>Average</span><strong>${average}%</strong><small>${getMockProjectedScore({ score: average, total: 100 })}/720 equivalent</small></div>
    <div class="mock-metric"><span>Best</span><strong>${best}%</strong><small>${tests.length} test${tests.length === 1 ? "" : "s"} logged</small></div>
    <div class="mock-metric"><span>Trend</span><strong class="${trend > 0 ? "positive" : trend < 0 ? "negative" : ""}">${trendText}</strong><small>${spread <= 5 ? "Consistent performance" : "Scores are variable"}</small></div>
    <div class="mock-insight-main"><strong>${nextAction}</strong><span>Average reported mistakes: ${averageMistakes}. Your latest test is ${targetGap ? `${targetGap}% below` : "at or above"} the ${targetScore}/720 target pace.</span></div>
  `;
}

function formatMockDate(date) {
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getMockPercent(mock) {
  const total = Number(mock.total || 720);
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((Number(mock.score || 0) / total) * 100)));
}

function getMockProjectedScore(mock) {
  return Math.round((getMockPercent(mock) / 100) * 720);
}

const neet2026RankAnchors = [
  { score: 715, rank: 1 },
  { score: 700, rank: 19 },
  { score: 690, rank: 138 },
  { score: 650, rank: 1492 },
  { score: 600, rank: 10160 },
  { score: 500, rank: 90780 },
  { score: 213, rank: 996935 },
  { score: 177, rank: 1121185 }
];

function renderRankPredictor() {
  if (!els.rankPredictorResult) return;
  els.predictorCategory.value = state.predictor.category || "General";
  els.predictorRoute.value = state.predictor.route || "Both";
  const scoreData = getPredictorScore();
  if (!scoreData) {
    els.rankPredictorResult.innerHTML = `<div class="predictor-empty">Add a test in Test Analysis to unlock your automatic rank and college-path estimate.</div>`;
    return;
  }
  const result = estimateNeet2026Rank(scoreData.score, state.predictor.category);
  const path = getCollegePath(result.estimate, state.predictor.category, state.predictor.route, result.eligible);
  els.rankPredictorResult.innerHTML = `
    <div class="rank-result-main"><span>Estimated All India Rank</span><strong>${result.displayRank}</strong><small>Current NEET level: ${scoreData.score}/720 - ${scoreData.label}</small></div>
    <div class="rank-result-card"><span>2026 eligibility</span><strong>${result.eligible ? "Eligible" : "Below qualifying range"}</strong><small>${result.cutoffNote}</small></div>
    <div class="rank-result-card"><span>College path</span><strong>${path.title}</strong><small>${path.detail}</small></div>
    <div class="rank-result-action"><strong>Best next step</strong><span>${path.action}</span></div>
  `;
}

function getPredictorScore() {
  if (!state.mocks.length) return null;
  const latest = state.mocks.at(-1);
  const latestEquivalent = getMockProjectedScore(latest);
  const recent = state.mocks.slice(-3).map(getMockProjectedScore);
  const recentAverage = Math.round(recent.reduce((sum, score) => sum + score, 0) / recent.length);
  const score = recent.length === 1 ? latestEquivalent : Math.round((latestEquivalent * 0.6) + (recentAverage * 0.4));
  const label = recent.length === 1
    ? `based on your latest test (${latest.score}/${latest.total})`
    : `60% latest test + 40% recent ${recent.length}-test average`;
  return { score, label };
}

function estimateNeet2026Rank(rawScore, category) {
  const score = Math.max(0, Math.min(720, Math.round(rawScore)));
  const cutoff = ["General", "EWS"].includes(category) ? 213 : 177;
  const eligible = score >= cutoff;
  const lowerAnchor = neet2026RankAnchors.find((anchor) => score >= anchor.score);
  const upperIndex = lowerAnchor ? neet2026RankAnchors.indexOf(lowerAnchor) - 1 : neet2026RankAnchors.length - 1;
  const upperAnchor = upperIndex >= 0 ? neet2026RankAnchors[upperIndex] : null;
  let estimate;
  if (upperAnchor && lowerAnchor) {
    const ratio = (upperAnchor.score - score) / (upperAnchor.score - lowerAnchor.score);
    estimate = Math.round(upperAnchor.rank + ((lowerAnchor.rank - upperAnchor.rank) * ratio));
  } else if (lowerAnchor) {
    estimate = lowerAnchor.rank;
  } else {
    estimate = 1450000 + Math.round((177 - score) * 8000);
  }
  const uncertainty = score >= 650 ? 0.12 : score >= 600 ? 0.18 : score >= 500 ? 0.28 : score >= cutoff ? 0.42 : 0.55;
  const low = Math.max(1, Math.round(estimate * (1 - uncertainty)));
  const high = Math.round(estimate * (1 + uncertainty));
  return {
    estimate,
    low,
    high,
    displayRank: `AIR ~${formatRank(estimate)}`,
    confidence: score >= 650 ? "Higher" : score >= 500 ? "Moderate" : "Lower",
    eligible,
    cutoffNote: ["General", "EWS"].includes(category) ? "UR/EWS 2026 qualifying mark: 213" : "OBC-NCL/SC/ST 2026 qualifying mark: 177"
  };
}

function getCollegePath(rank, category, route, eligible) {
  if (!eligible) return { title: "Build score first", detail: "This score is below the 2026 qualifying band for the selected category.", action: "Focus on a safe qualifying target first; college forecasting begins only after eligibility." };
  const routeText = route === "AIQ" ? "AIQ" : route === "State" ? "state-quota" : "AIQ and state-quota";
  if (rank <= 500) return { title: "Elite government MBBS range", detail: `Very competitive ${routeText} choices; individual college outcomes still depend on category and round.`, action: "Build a ranked choice list of top government and central institutes when counselling opens." };
  if (rank <= 2000) return { title: "Strong government MBBS range", detail: `Government MBBS through ${routeText} is a realistic target, but top colleges remain highly competitive.`, action: "Keep both ambitious AIQ choices and safer government options in your list." };
  if (rank <= 10000) return { title: "Government MBBS opportunity", detail: `Government MBBS is possible through ${routeText}; domicile and category can shift outcomes significantly.`, action: "Track your state counselling bulletin alongside MCC round-wise closing ranks." };
  if (rank <= 30000) return { title: "State government MBBS focus", detail: `State quota is likely more important than AIQ at this range, especially for ${category}.`, action: "Prioritise state government colleges and keep BDS as an informed backup." };
  if (rank <= 90000) return { title: "Selective government / BDS / AYUSH range", detail: "Government MBBS depends heavily on state, category and seat movement; allied routes become important options.", action: "Create a counselling list with government BDS and AYUSH alternatives, then update it with published closing ranks." };
  return { title: "Counselling options need careful planning", detail: "Private, BDS and AYUSH options may be more realistic; eligibility alone does not indicate an MBBS seat.", action: "Use official state and MCC seat matrices and set a higher score target for the next attempt." };
}

function formatRank(rank) {
  return new Intl.NumberFormat("en-IN").format(Math.max(1, Math.round(rank)));
}

function renderRevisions() {
  const revisions = [...state.revisions].sort((a, b) => a.date.localeCompare(b.date));
  els.revisionList.innerHTML = revisions.length
    ? revisions.map((revision) => `
      <div class="revision-item">
        <div class="revision-main">
          <strong>${escapeHtml(revision.text)}</strong>
          <small>${revision.stage ? `Stage ${escapeHtml(revision.stage)} - ` : ""}Queued ${revision.date}</small>
        </div>
        ${revision.stage ? `<span class="revision-stage">${escapeHtml(revision.stage)}</span>` : ""}
        <div class="revision-actions">
          <button class="secondary-button" type="button" data-revision-done="${revision.id}">Done</button>
          <button class="text-button danger-button" type="button" data-revision-delete="${revision.id}">Delete</button>
        </div>
      </div>
    `).join("")
    : `<div class="mini-item"><span>Revision queue is clear.</span></div>`;
}

function getActivityIcon(activityType) {
  return {
    Class: String.fromCodePoint(127891),
    Study: String.fromCodePoint(128218),
    "Question Practice": String.fromCodePoint(9997),
    "Mock Test": String.fromCodePoint(128221)
  }[activityType] || String.fromCodePoint(128218);
}

function getPlanIcon(subject) {
  return {
    Physics: "⚛",
    Chemistry: "⚗",
    Botany: "🌿",
    Zoology: "🧬",
    Revision: "↻",
    "Mock Test": "📝"
  }[subject] || "•";
}

function renderPlanActions(row) {
  return `
    <button class="text-button" type="button" data-plan-login="${row.id}" ${row.canceled ? "disabled" : ""}>${row.login ? "Update In" : "Log In"}</button>
    <button class="text-button" type="button" data-plan-logoff="${row.id}" ${row.canceled ? "disabled" : ""}>${row.logoff ? "Update Out" : "Log Off"}</button>
    <button class="text-button" type="button" data-plan-break="${row.id}" ${row.canceled || hasActivePlanBreak(row) ? "disabled" : ""}>Break</button>
    ${hasActivePlanBreak(row) ? `<button class="text-button early-break-button" type="button" data-plan-end-break="${row.id}">${getBreakFinishLabel(row)}</button>` : ""}
    <button class="text-button danger-button" type="button" data-plan-cancel="${row.id}" ${row.canceled ? "disabled" : ""}>Cancel Session</button>
  `;
}

function renderDailySummary(date) {
  const rows = state.timetable.filter((row) => row.date === date);
  const activeRows = rows.filter((row) => !row.canceled);
  const completed = activeRows.filter((row) => row.done).length;
  const late = rows.filter((row) => getPlanTimingClass(row) === "late").length;
  const missed = rows.filter((row) => getPlanTimingClass(row) === "missed").length;
  const minutes = activeRows.reduce((sum, row) => sum + getPlanDurationMinutes(row), 0);

  els.dailySummary.innerHTML = [
    ["Planned", activeRows.length],
    ["Completed", completed],
    ["Late", late],
    ["Missed", missed],
    ["Canceled", rows.length - activeRows.length],
    ["Logged", formatMinutes(minutes)]
  ].map(([label, value]) => `
    <div class="summary-chip">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderWeeklyReport() {
  if (!els.weeklyReportGrid || !els.weeklyMissionGrade) return;
  const dates = getNextDates(7, todayKey(-6));
  const sessions = state.sessions.filter((session) => dates.includes(session.date) && !session.canceled);
  const plans = state.timetable.filter((plan) => !plan.archived && !plan.canceled && dates.includes(plan.date));
  const completedPlans = plans.filter((plan) => plan.done);
  const goals = state.goals.filter((goal) => dates.includes(goal.date));
  const completedGoals = goals.filter((goal) => goal.done).length;
  const weakResolved = (state.resolvedWeakTopics || []).filter((topic) => dates.includes((topic.resolvedAt || "").slice(0, 10))).length;
  const weeklyAnalytics = getActivityAnalytics(dates);
  const studyHours = weeklyAnalytics.total / 3600000;
  const subjectHours = ["Physics", "Chemistry", "Biology"].reduce((summary, subject) => {
    summary[subject] = sessions
      .filter((session) => normalizeSubjectName(session.subject) === subject)
      .reduce((sum, session) => sum + Number(session.hours), 0);
    return summary;
  }, {});
  const questionsSolved = completedPlans.reduce((sum, plan) => sum + extractNumber(plan.task, /(mcq|question|questions|q\b)/i), 0);
  const lecturesCompleted = completedPlans.filter((plan) => /lecture|class|video/i.test(plan.task)).length;
  const backlogsCleared = completedPlans.filter((plan) => plan.date < todayKey()).length;
  const consistency = Math.round((dates.filter((date) => getDailyCompletionPercent(date) > 0 || getHoursForDate(date) > 0).length / dates.length) * 100);
  const completion = plans.length ? Math.round((completedPlans.length / plans.length) * 100) : 0;
  const goalRate = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;
  const gradeScore = Math.round((completion * 0.45) + (consistency * 0.35) + (goalRate * 0.2));
  const grade = gradeScore >= 90 ? "A+" : gradeScore >= 80 ? "A" : gradeScore >= 70 ? "B+" : gradeScore >= 60 ? "B" : gradeScore >= 45 ? "C" : "Build";

  els.weeklyMissionGrade.textContent = grade;
  els.weeklyReportGrid.innerHTML = [
    ["Study Hours", formatHours(studyHours)],
    ["Physics", formatHours(subjectHours.Physics)],
    ["Chemistry", formatHours(subjectHours.Chemistry)],
    ["Biology", formatHours(subjectHours.Biology)],
    ["Questions Solved", questionsSolved],
    ["Lectures Completed", lecturesCompleted],
    ["Backlogs Cleared", backlogsCleared],
    ["Weak Topics Resolved", weakResolved],
    ["Consistency", `${consistency}%`]
  ].map(([label, value]) => `
    <div>
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
  if (els.weeklyReportAction) {
    els.weeklyReportAction.textContent = consistency < 50
      ? "Recommendation: protect one non-negotiable study block each day next week."
      : completion < 70
        ? "Recommendation: reduce tomorrow’s plan slightly and finish every listed task."
        : weakResolved === 0
          ? "Recommendation: turn one repeated weak area into a revision task this week."
          : "Recommendation: you are building steady momentum—keep the same rhythm next week.";
  }
}

function normalizeSubjectName(subject = "") {
  return ["Botany", "Zoology"].includes(subject) ? "Biology" : subject;
}

function extractNumber(text = "", keywordPattern) {
  const value = String(text);
  if (!keywordPattern.test(value)) return 0;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function formatMinutes(minutes) {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const extra = minutes % 60;
  return extra ? `${hours}h ${extra}m` : `${hours}h`;
}

function getNextDates(count, startDate = todayKey()) {
  return Array.from({ length: count }, (_, index) => addDays(startDate, index));
}

function addDays(dateValue, offset) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function findBestAvailableSlot(plan = {}) {
  const preferredTimes = ["06:00", "09:00", "14:45", "17:00", "19:45", "22:05"];
  const searchStart = plan.preferredDate || (plan.date > todayKey() ? plan.date : todayKey());

  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const date = addDays(searchStart, dayOffset);
    for (const time of preferredTimes) {
      const candidate = { date, time };
      const candidateMs = new Date(`${date}T${time}:00`).getTime();
      if (candidateMs <= Date.now() + (45 * 60000)) continue;
      if (isSlotAvailable(candidate, plan.id)) return candidate;
    }
  }

  return { date: addDays(searchStart, 14), time: "06:00" };
}

function isSlotAvailable(candidate, ignoredId = "") {
  const candidateMinutes = timeToMinutes(candidate.time);
  return !state.timetable.some((plan) => {
    if (plan.id === ignoredId || plan.canceled || plan.archived) return false;
    if (plan.date !== candidate.date) return false;
    return Math.abs(timeToMinutes(plan.time) - candidateMinutes) < 90;
  });
}

function formatPlanDate(date) {
  const label = date === todayKey() ? "Today" : new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
  return `${label} (${date})`;
}

function dateForWeekday(day) {
  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const target = dayOrder.indexOf(day);
  if (target < 0) return todayKey();
  const now = new Date();
  const diff = (target - now.getDay() + 7) % 7;
  return todayKey(diff);
}

function normalizePlanTime(time) {
  if (time === "14:00") return "14:45";
  if (time === "19:00") return "19:45";
  return time;
}

function normalizePlanTask(task, time) {
  const value = String(task || "");
  const lower = value.toLowerCase();
  if (lower === "cell seep pahuja") return "SROFP SEEP PAHUJA";
  if ((time === "19:00" || time === "19:45") && lower === "biomolecules") return "CBT SEEP PAHUJA";
  if (time === "22:05" && lower === "cbt seep pahuja") return "Biomolecules";
  return value;
}

function getPlanTimingClass(row) {
  if (row.canceled) return "";
  if (isMissedPlan(row)) return "missed";
  if (isLatePendingPlan(row)) return "late";
  if (!row.login) return "";
  return timeToMinutes(row.login) <= timeToMinutes(row.time) ? "on-time" : "late";
}

function getPlanStateLabel(row) {
  if (row.canceled) return "🔴 Mission Aborted";
  if (hasActivePlanBreak(row)) return "🟡 Mission Paused";
  if (row.done) return "🟢 Mission Accomplished";
  const timingClass = getPlanTimingClass(row);
  if (timingClass === "missed") return "⚪ Mission Missed";
  if (timingClass === "late") return "🟠 Mission Active";
  if (timingClass === "on-time") return "🟢 Mission Active";
  return "🔵 Mission Planned";
}

function getPlanTimingText(row) {
  if (row.canceled) return `Canceled - ${row.cancelReason || "No reason saved"}`;
  if (isMissedPlan(row)) return "Missed - no log in";
  if (isLatePendingPlan(row)) return "Late - log in now";
  const breakText = getPlanBreakText(row);
  if (!row.login && !row.logoff) return breakText ? `No log in yet | ${breakText}` : "No log in yet";
  const status = getPlanTimingClass(row) === "late" ? "Late" : "On time";
  const duration = getPlanDuration(row);
  return `${status} - In: ${row.login || "--"} | Out: ${row.logoff || "--"}${duration ? ` | ${duration}` : ""}${breakText ? ` | ${breakText}` : ""}`;
}

function isMissedPlan(row) {
  if (row.canceled || row.done || row.login || row.date !== todayKey()) return false;
  return timeToMinutes(currentTimeValue()) > timeToMinutes(row.time) + 30;
}

function isLatePendingPlan(row) {
  if (row.canceled || row.done || row.login || row.date !== todayKey()) return false;
  const lateBy = timeToMinutes(currentTimeValue()) - timeToMinutes(row.time);
  return lateBy > 0 && lateBy <= 30;
}

function getPlanBreakText(row) {
  const breaks = Array.isArray(row.breaks) ? row.breaks : [];
  if (!breaks.length) return "";
  const latest = breaks.at(-1);
  const duration = latest.duration ? ` (${latest.duration} min)` : "";
  const ended = latest.endedAt ? `, ended ${latest.endedTime || ""}${latest.finishedEarly ? " early" : ""}` : ", running";
  return `${breaks.length} break${breaks.length === 1 ? "" : "s"}: ${latest.time} ${latest.reason}${duration}${ended}`;
}

function hasActivePlanBreak(row) {
  const latest = Array.isArray(row.breaks) ? row.breaks.at(-1) : null;
  return Boolean(latest && !latest.endedAt);
}

function getBreakFinishLabel(row) {
  const latest = Array.isArray(row.breaks) ? row.breaks.at(-1) : null;
  if (!latest?.startedAt || !latest.duration) return "Finish Break";
  const plannedEnd = Date.parse(latest.startedAt) + (Number(latest.duration) * 60000);
  return Date.now() < plannedEnd ? "Finish Early" : "Finish Break";
}

function currentTimeValue() {
  return new Date().toTimeString().slice(0, 5);
}

function dateTimeForPlan(plan, offsetMinutes = 0) {
  return new Date(`${plan.date}T${plan.time}:00`).getTime() - (offsetMinutes * 60000);
}

function getPlanDuration(row) {
  if (!row.login || !row.logoff) return "";
  const minutes = getPlanDurationMinutes(row);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const extraMinutes = minutes % 60;
  return extraMinutes ? `${hours}h ${extraMinutes}min` : `${hours}h`;
}

function getPlanDurationMinutes(row) {
  if (!row.login || !row.logoff) return 0;
  let minutes = timeToMinutes(row.logoff) - timeToMinutes(row.login);
  if (minutes < 0) minutes += 24 * 60;
  return minutes;
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  return (hours * 60) + minutes;
}

function isInQuietHours(date = new Date()) {
  const now = (date.getHours() * 60) + date.getMinutes();
  const start = timeToMinutes(notificationSettings.quietStart);
  const end = timeToMinutes(notificationSettings.quietEnd);
  if (start === end) return false;
  if (start < end) return now >= start && now < end;
  return now >= start || now < end;
}

function reminderText(plan, minutes) {
  const subject = plan.subject === "Revision" ? `${plan.task} revision` : plan.subject;
  if (minutes === 0) return "Your study session begins now.";
  return `${subject} starts in ${minutes} minutes.`;
}

function notificationTitle(plan, minutes) {
  if (minutes === 0) return `${getDailyGreeting()} - Study session begins now`;
  return `${getDailyGreeting()} - ${plan.subject} reminder`;
}

function notificationsAreSupported() {
  return "Notification" in window;
}

function notificationsAreReady() {
  return notificationsAreSupported() && notificationSettings.enabled && Notification.permission === "granted";
}

async function deliverNotification(title, options = {}) {
  if (!notificationsAreReady()) return false;
  try {
    if ("serviceWorker" in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Service worker not ready")), 1500))
      ]);
      await registration.showNotification(title, options);
      return true;
    }
  } catch {
    // Fall back to the page notification API when the service worker is unavailable.
  }

  new Notification(title, options);
  return true;
}

async function showStudyNotification(plan, minutes) {
  if (!notificationsAreReady() || isInQuietHours()) return;
  const options = {
    body: reminderText(plan, minutes),
    icon: "assets/icon-192.png",
    badge: "assets/icon-192.png",
    tag: `plan-${plan.id}-${minutes}`,
    data: { planId: plan.id, date: plan.date }
  };

  deliverNotification(notificationTitle(plan, minutes), options);
}

function clearNotificationTimers() {
  notificationTimers.forEach((timer) => clearTimeout(timer));
  notificationTimers = [];
  notificationScheduleCount = 0;
}

function scheduleStudyNotifications() {
  clearNotificationTimers();
  if (!notificationsAreReady()) {
    updateNotificationStatus();
    return;
  }

  const now = Date.now();
  const maxDelay = 7 * 24 * 60 * 60 * 1000;
  state.timetable.forEach((plan) => {
    if (plan.done) return;
    notificationSettings.reminderMinutes.forEach((minutes) => {
      const triggerAt = dateTimeForPlan(plan, minutes);
      const delay = triggerAt - now;
      if (delay < 0 || delay > maxDelay) return;
      notificationTimers.push(setTimeout(() => showStudyNotification(plan, minutes), delay));
      notificationScheduleCount += 1;
    });
  });

  scheduleDailyMissionNotification();
  updateNotificationStatus();
}

function buildDailyMissionBody() {
  const todayPlans = state.timetable.filter((plan) => plan.date === todayKey());
  const snapshot = getMentorSnapshot(todayPlans);
  const revisionsDue = state.revisions.length;
  const mainChapter = todayPlans[0]?.task || state.revisions[0]?.text || "NCERT revision";
  return [
    "Mentor Study Planner:",
    "",
    `Yesterday: ${formatHours(snapshot.yesterdayHours)}`,
    `Current Streak: ${snapshot.streak} ${snapshot.streak === 1 ? "Day" : "Days"}`,
    `Today's Battle: ${snapshot.todayBattle}`,
    `Recovery Status: ${snapshot.recoveryStatus}`,
    `Future Doctor Readiness: ${snapshot.readiness}%`,
    "",
    `Study Goal: ${snapshot.studyTarget}`,
    `Revisions Due: ${revisionsDue}`,
    `Main Chapter: ${mainChapter}`,
    "",
    "Stay consistent."
  ].join("\n");
}

function scheduleDailyMissionNotification() {
  if (notificationSettings.lastDailyMissionDate === todayKey()) return;
  const triggerAt = new Date(`${todayKey()}T${notificationSettings.dailyMissionTime}:00`).getTime();
  const delay = triggerAt - Date.now();

  if (delay <= 0) {
    showDailyMissionNotification();
    return;
  }

  notificationTimers.push(setTimeout(showDailyMissionNotification, delay));
  notificationScheduleCount += 1;
}

function showDailyMissionNotification() {
  if (!notificationsAreReady() || isInQuietHours()) return;
  if (notificationSettings.lastDailyMissionDate === todayKey()) return;

  notificationSettings.lastDailyMissionDate = todayKey();
  saveNotificationSettings();

  const options = {
    body: buildDailyMissionBody(),
    icon: "assets/icon-192.png",
    badge: "assets/icon-192.png",
    tag: `daily-mission-${todayKey()}`
  };

  deliverNotification(getDailyGreeting(), options);
  return;

  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title: getDailyGreeting(),
      options
    });
    return;
  }

  new Notification(getDailyGreeting(), options);
}

function parseReminderMinutes(value) {
  const minutes = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0 && item <= 180);
  return [...new Set(minutes)].sort((a, b) => b - a);
}

function updateNotificationStatus() {
  if (!notificationsAreSupported()) {
    els.notificationStatus.textContent = "Notifications are not supported in this browser.";
    return;
  }
  if (!notificationSettings.enabled) {
    els.notificationStatus.textContent = "Notifications are off.";
    return;
  }
  if (Notification.permission !== "granted") {
    els.notificationStatus.textContent = `Notifications need browser permission. Current status: ${Notification.permission}.`;
    return;
  }
  const scheduledText = notificationScheduleCount === 1
    ? "1 reminder is scheduled"
    : `${notificationScheduleCount} reminders are scheduled`;
  els.notificationStatus.textContent = `Notifications on. ${scheduledText} while this app stays open. Reminders: ${notificationSettings.reminderMinutes.join(", ")} minutes. Quiet: ${notificationSettings.quietStart}-${notificationSettings.quietEnd}.`;
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register("sw.js");
    registration.update();
  } catch {
    els.notificationStatus.textContent = "Offline mode could not start in this browser.";
  }
}

function renderMotivation() {
  const quoteIndex = new Date(todayKey()).getDate() % motivationQuotes.length;
  const focusedToday = state.focusDays.includes(todayKey());
  els.dailyLine.textContent = motivationQuotes[quoteIndex];
  if (els.topbarMotivation) els.topbarMotivation.textContent = motivationQuotes[quoteIndex];
  els.motivationQuote.textContent = motivationQuotes[quoteIndex];
  els.focusDoneBtn.disabled = focusedToday;
  els.focusDoneBtn.textContent = focusedToday ? "Today Marked" : "Mark Today Focused";
  els.focusStatus.textContent = focusedToday
    ? "Nice. Your focused day is counted."
    : "Mark it after one real focused study block.";
  renderConsistencyHeatmap();
}

function renderConsistencyHeatmap() {
  if (!els.consistencyHeatmap || !els.consistencySummary) return;
  const days = Array.from({ length: 28 }, (_, index) => todayKey(index - 27));
  const activeDays = days.filter((date) => isActiveStudyDay(date));
  els.consistencySummary.textContent = `${activeDays.length}/28 active days`;
  els.consistencyHeatmap.innerHTML = days.map((date) => {
    const level = getActivityLevel(date);
    const label = new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `<span class="heat-day level-${level}" title="${label}: ${level ? "study activity" : "rest day"}" aria-label="${label}: ${level ? "study activity" : "rest day"}"></span>`;
  }).join("");
}

function isActiveStudyDay(date) {
  return getActivityLevel(date) > 0;
}

function getActivityLevel(date) {
  const hours = getHoursForDate(date);
  const completedPlans = state.timetable.filter((plan) => plan.date === date && plan.done && !plan.canceled).length;
  const completedGoals = state.goals.filter((goal) => goal.date === date && goal.done).length;
  const focused = state.focusDays.includes(date);
  const points = hours + (completedPlans * 0.75) + (completedGoals * 0.5) + (focused ? 1 : 0);
  return points >= 5 ? 4 : points >= 3 ? 3 : points >= 1.5 ? 2 : points > 0 ? 1 : 0;
}

function renderSyllabus() {
  const filter = els.syllabusFilter.value;
  const visibleUnits = syllabusUnits.filter((unit) => filter === "All" || unit.subject === filter);
  const doneCount = syllabusUnits.filter((unit) => state.syllabusDone[unit.id]).length;
  const visibleDone = visibleUnits.filter((unit) => state.syllabusDone[unit.id]).length;

  els.syllabusSummary.textContent = `${doneCount}/${syllabusUnits.length} units complete overall. Showing ${visibleDone}/${visibleUnits.length}.`;
  els.syllabusList.innerHTML = visibleUnits.map((unit) => `
    <label class="check-row ${state.syllabusDone[unit.id] ? "done" : ""}">
      <input type="checkbox" data-syllabus-toggle="${unit.id}" ${state.syllabusDone[unit.id] ? "checked" : ""} />
      <span>${escapeHtml(unit.title)}</span>
      <span class="pill">${unit.subject}</span>
    </label>
  `).join("");
}

function renderWeakTopics() {
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const topics = [...state.weakTopics].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const resolvedTopics = [...(state.resolvedWeakTopics || [])]
    .sort((a, b) => String(b.resolvedAt || "").localeCompare(String(a.resolvedAt || "")))
    .slice(0, 8);

  els.weakList.innerHTML = topics.length
    ? topics.map((topic) => `
      <div class="mini-item">
        <span>
          ${escapeHtml(topic.topic)}
          <small>${escapeHtml(topic.subject)} - ${escapeHtml(topic.action || "Practice and revise")}</small>
        </span>
        <span class="pill priority-${topic.priority.toLowerCase()}">${topic.priority}</span>
        <button class="text-button" type="button" data-weak-resolve="${topic.id}">Mark Resolved</button>
      </div>
    `).join("")
    : `<div class="mini-item"><span>No weak topics. Excellent work.</span></div>`;

  if (!els.resolvedWeakList) return;
  els.resolvedWeakList.innerHTML = resolvedTopics.length
    ? resolvedTopics.map((topic) => `
      <div class="mini-item">
        <span>
          ${escapeHtml(topic.topic)}
          <small>${escapeHtml(topic.subject)} - Resolved ${formatResolvedDate(topic.resolvedAt)}</small>
        </span>
      </div>
    `).join("")
    : `<div class="mini-item"><span>Resolved history will appear here after topics are marked resolved.</span></div>`;
}

function formatResolvedDate(value) {
  return value ? value.slice(0, 10) : todayKey();
}

function getGoalStreak() {
  const completedDates = new Set(
    state.goals
      .filter((goal) => goal.done)
      .map((goal) => goal.date)
  );

  let streak = 0;
  for (let offset = 0; offset > -365; offset -= 1) {
    if (!completedDates.has(todayKey(offset))) break;
    streak += 1;
  }
  return streak;
}

function getFocusStreak() {
  const days = new Set(state.focusDays);
  let streak = 0;
  for (let offset = 0; offset > -365; offset -= 1) {
    if (!days.has(todayKey(offset))) break;
    streak += 1;
  }
  return streak;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function startLiveSession() {
  const now = new Date().toISOString();
  state.liveSession = {
    date: todayKey(),
    status: "running",
    elapsedMs: 0,
    startedAt: now,
    breakMs: 0,
    breakStartedAt: "",
    breaks: []
  };
  closePauseModal();
  saveState();
  renderStats();
}

function enterFocusMode() {
  document.body.classList.add("focus-mode");
  els.focusDeck?.classList.remove("hidden");
  renderFocusDeck();
  els.focusDeck?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function exitFocusMode() {
  document.body.classList.remove("focus-mode");
  els.focusDeck?.classList.add("hidden");
}

function triggerDailyCelebrationIfReady() {
  const todayPlans = state.timetable.filter((plan) => plan.date === todayKey() && !plan.archived && !plan.canceled);
  if (!todayPlans.length || !todayPlans.every((plan) => plan.done) || state.celebratedDates.includes(todayKey())) return;
  state.celebratedDates.push(todayKey());
  saveState();
  els.celebration?.classList.remove("hidden");
}

function pauseLiveSession() {
  if (state.liveSession.status !== "running") return;
  const now = new Date().toISOString();
  state.liveSession = {
    ...state.liveSession,
    status: "paused",
    elapsedMs: getLiveStudyMs(),
    startedAt: "",
    breakStartedAt: now,
    breaks: [
      ...state.liveSession.breaks,
      { id: crypto.randomUUID(), reason: "", startedAt: now, endedAt: "" }
    ]
  };
  saveState();
  renderStats();
  openPauseModal();
}

function setBreakReason(reason) {
  const latestBreak = state.liveSession.breaks.at(-1);
  if (!latestBreak || latestBreak.reason) return;
  latestBreak.reason = reason;
  saveState();
  closePauseModal();
  renderStats();
}

function resumeLiveSession() {
  if (state.liveSession.status !== "paused") return;
  const now = new Date().toISOString();
  const breaks = [...state.liveSession.breaks];
  const latestBreak = breaks.at(-1);
  if (latestBreak && !latestBreak.endedAt) latestBreak.endedAt = now;
  state.liveSession = {
    ...state.liveSession,
    status: "running",
    startedAt: now,
    breakMs: getLiveBreakMs(),
    breakStartedAt: "",
    breaks
  };
  closePauseModal();
  saveState();
  renderStats();
}

function openPauseModal() {
  els.pauseModal?.classList.remove("hidden");
}

function closePauseModal() {
  els.pauseModal?.classList.add("hidden");
}

function startLiveSessionTicker() {
  clearInterval(liveSessionTicker);
  liveSessionTicker = setInterval(() => {
    if (state.liveSession.status === "idle") return;
    renderStats();
  }, 1000);
}

els.examDate.addEventListener("change", () => {
  state.examDate = els.examDate.value;
  render();
});

els.startSessionBtn?.addEventListener("click", startLiveSession);
els.focusModeBtn?.addEventListener("click", enterFocusMode);
els.priorityFocusBtn?.addEventListener("click", enterFocusMode);
els.exitFocusModeBtn?.addEventListener("click", exitFocusMode);
els.focusDeckStartBtn?.addEventListener("click", () => {
  if (state.liveSession.status === "paused") resumeLiveSession();
  else startLiveSession();
});
els.focusDeckPauseBtn?.addEventListener("click", pauseLiveSession);
els.celebrationCloseBtn?.addEventListener("click", () => els.celebration?.classList.add("hidden"));
els.pauseSessionBtn?.addEventListener("click", pauseLiveSession);
els.resumeSessionBtn?.addEventListener("click", resumeLiveSession);
els.pauseModal?.addEventListener("click", (event) => {
  const reason = event.target.dataset.breakReason;
  if (!reason) return;
  setBreakReason(reason);
});

els.themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  renderTheme();
});

els.sidebarToggle?.addEventListener("click", () => {
  sidebarCollapsed = !sidebarCollapsed;
  renderTheme();
});

els.notificationsEnabled.addEventListener("change", async () => {
  if (els.notificationsEnabled.checked) {
    if (!notificationsAreSupported()) {
      els.notificationsEnabled.checked = false;
      updateNotificationStatus();
      return;
    }
    const permission = await Notification.requestPermission();
    notificationSettings.enabled = permission === "granted";
    els.notificationsEnabled.checked = notificationSettings.enabled;
  } else {
    notificationSettings.enabled = false;
    clearNotificationTimers();
  }
  saveNotificationSettings();
  scheduleStudyNotifications();
  updateNotificationStatus();
});

els.testNotificationBtn?.addEventListener("click", async () => {
  if (!notificationsAreSupported()) {
    notificationSettings.enabled = false;
    saveNotificationSettings();
    renderNotificationSettings();
    return;
  }

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    notificationSettings.enabled = permission === "granted";
  } else {
    notificationSettings.enabled = true;
  }

  saveNotificationSettings();
  scheduleStudyNotifications();
  renderNotificationSettings();

  if (!notificationsAreReady()) return;
  const delivered = await deliverNotification("Project Prime notification test", {
    body: "If you see this, study reminders can reach this browser while the app is open.",
    icon: "assets/icon-192.png",
    badge: "assets/icon-192.png",
    tag: "notification-test"
  });
  els.notificationStatus.textContent = delivered
    ? "Test notification sent. Keep this app open for scheduled study reminders."
    : "Test notification could not be sent by this browser.";
});

els.reminderMinutes.addEventListener("change", () => {
  const minutes = parseReminderMinutes(els.reminderMinutes.value);
  notificationSettings.reminderMinutes = minutes.length ? minutes : defaultNotificationSettings.reminderMinutes;
  saveNotificationSettings();
  renderNotificationSettings();
  scheduleStudyNotifications();
});

els.quietStart.addEventListener("change", () => {
  notificationSettings.quietStart = els.quietStart.value || defaultNotificationSettings.quietStart;
  saveNotificationSettings();
  scheduleStudyNotifications();
});

els.quietEnd.addEventListener("change", () => {
  notificationSettings.quietEnd = els.quietEnd.value || defaultNotificationSettings.quietEnd;
  saveNotificationSettings();
  scheduleStudyNotifications();
});

els.installAppBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  els.installAppBtn.classList.add("hidden");
});

els.googleSignInBtn?.addEventListener("click", async () => {
  if (!auth || !isFirebaseConfigured) return;
  const startedAt = Date.now();

  try {
    lastCloudStatus = "Signing in";
    lastCloudError = "";
    renderSyncStatus();

    console.info("[Firebase Auth] Starting Google popup sign-in", {
      providerId: firebaseSdk.GoogleAuthProvider.PROVIDER_ID,
      authDomain: firebaseConfig.authDomain,
      currentOrigin: window.location.origin
    });

    await firebaseSdk.signInWithPopup(auth, createGoogleProvider());
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    const details = logFirebaseAuthError("Google popup sign-in", error);
    lastCloudStatus = "Sign in failed";
    lastCloudError = describeFirebaseAuthError(details);
    renderSyncStatus();

    if (shouldRetryWithRedirect(details, elapsedMs)) {
      try {
        console.info("[Firebase Auth] Popup did not complete; retrying with redirect sign-in", { elapsedMs, code: details.code });
        lastCloudStatus = "Redirecting";
        lastCloudError = "Popup closed before sign-in completed. Opening Google sign-in in this tab instead...";
        renderSyncStatus();
        await firebaseSdk.signInWithRedirect(auth, createGoogleProvider());
      } catch (redirectError) {
        const redirectDetails = logFirebaseAuthError("Google redirect sign-in start", redirectError);
        lastCloudStatus = "Sign in failed";
        lastCloudError = describeFirebaseAuthError(redirectDetails);
        renderSyncStatus();
      }
    }
  }
});

els.googleSignOutBtn?.addEventListener("click", async () => {
  if (!auth) return;
  try {
    lastCloudError = "";
    await firebaseSdk.signOut(auth);
  } catch (error) {
    logFirebaseAuthError("Google sign-out", error);
    lastCloudStatus = "Sign out failed";
    lastCloudError = error?.message || "Google sign-out failed. Check the browser console for details.";
    renderSyncStatus();
  }
});

els.editMissionBtn?.addEventListener("click", () => {
  if (activeMissionPlanId) {
    startEditingPlan(activeMissionPlanId);
  } else {
    stopEditingPlan();
    els.planDate.value = todayKey();
    els.viewDate.value = todayKey();
  }
  document.querySelector("#timetable")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.backlogCoveredBtn?.addEventListener("click", () => {
  const currentBacklog = getBacklogCount();
  state.manualBacklogCount = Math.max(0, currentBacklog - 1);
  render();
});

els.editBacklogBtn?.addEventListener("click", () => {
  const currentBacklog = getBacklogCount();
  const nextValue = window.prompt("Set backlog count", String(currentBacklog));
  if (nextValue === null) return;
  const count = Number(nextValue);
  if (!Number.isFinite(count) || count < 0) return;
  state.manualBacklogCount = Math.round(count);
  render();
});

els.doctorPathForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.doctorPath = {
    targetScore: els.doctorTargetScoreInput.value.trim() || defaultState.doctorPath.targetScore,
    targetCollege: els.doctorTargetCollegeInput.value.trim() || defaultState.doctorPath.targetCollege,
    note: els.doctorPathNoteInput.value.trim() || defaultState.doctorPath.note
  };
  render();
});

els.goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.goals.push({ id: crypto.randomUUID(), text: els.goalInput.value.trim(), done: false, date: todayKey() });
  els.goalInput.value = "";
  render();
});

els.goalList.addEventListener("click", (event) => {
  const toggleId = event.target.dataset.goalToggle;
  const deleteId = event.target.dataset.goalDelete;

  if (toggleId) {
    state.goals = state.goals.map((goal) => goal.id === toggleId ? { ...goal, done: event.target.checked } : goal);
  }

  if (deleteId) {
    state.goals = state.goals.filter((goal) => goal.id !== deleteId);
  }

  render();
});

document.querySelector("#addGoalBtn")?.addEventListener("click", () => {
  const input = document.querySelector("#goalInput");
  input?.focus();
  input?.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#addRevisionBtn")?.addEventListener("click", () => {
  const input = document.querySelector("#revisionInput");
  input?.focus();
  input?.scrollIntoView({ behavior: "smooth", block: "center" });
});

els.toggleGoalHistoryBtn.addEventListener("click", () => {
  goalHistoryVisible = !goalHistoryVisible;
  renderGoalHistory();
});

els.subjectGrid.addEventListener("click", (event) => {
  const subjectName = event.target.dataset.subjectName;
  const delta = Number(event.target.dataset.subjectDelta);
  const totalSubject = event.target.dataset.subjectTotal;
  const undoSubject = event.target.dataset.subjectUndo;
  const track = event.target.dataset.subjectTrack || "theory";

  if (subjectName && Number.isFinite(delta)) {
    updateSubjectCompleted(subjectName, track, delta);
    render();
    return;
  }

  if (totalSubject) {
    editSubjectTotal(totalSubject, track);
    render();
    return;
  }

  if (undoSubject) {
    undoSubjectChange(undoSubject, track);
    render();
  }
});

function updateSubjectCompleted(subjectName, track, delta) {
  const subject = state.subjects[subjectName];
  if (!subject) return;
  const doneKey = `${track}Done`;
  const totalKey = `${track}Total`;
  const previous = { ...subject };
  const nextDone = clamp(toWholeNumber(subject[doneKey]) + delta, 0, toWholeNumber(subject[totalKey]));
  if (nextDone === subject[doneKey]) return;
  subject[doneKey] = nextDone;
  syncSubjectLegacyFields(subject);
  subjectUndo = { subject: subjectName, track, previous };
}

function editSubjectTotal(subjectName, track) {
  const subject = state.subjects[subjectName];
  if (!subject) return;
  const doneKey = `${track}Done`;
  const totalKey = `${track}Total`;
  const currentTotal = toWholeNumber(subject[totalKey]);
  const nextTotal = Number(window.prompt(`Total ${trackLabel(track)} chapters for ${subjectName}`, currentTotal));
  if (!Number.isFinite(nextTotal) || nextTotal < 0) return;
  subject[totalKey] = toWholeNumber(nextTotal);
  subject[doneKey] = clamp(toWholeNumber(subject[doneKey]), 0, subject[totalKey]);
  syncSubjectLegacyFields(subject);
  subjectUndo = null;
}

function undoSubjectChange(subjectName, track) {
  if (!subjectUndo || subjectUndo.subject !== subjectName || subjectUndo.track !== track) return;
  state.subjects[subjectName] = { ...subjectUndo.previous };
  syncSubjectLegacyFields(state.subjects[subjectName]);
  subjectUndo = null;
}

function syncSubjectLegacyFields(subject) {
  subject.done = toWholeNumber(subject.theoryDone);
  subject.total = toWholeNumber(subject.theoryTotal);
}

function trackLabel(track) {
  return {
    theory: "theory",
    question: "question-practice",
    revision: "revision"
  }[track] || track;
}

els.sessionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.sessions.push({
    id: crypto.randomUUID(),
    subject: els.sessionSubject.value,
    hours: Number(els.sessionHours.value),
    focus: els.sessionFocus.value.trim(),
    date: todayKey(),
    canceled: false,
    cancelReason: ""
  });
  els.sessionFocus.value = "";
  render();
});

els.sessionList.addEventListener("click", async (event) => {
  const id = event.target.dataset.sessionCancel;
  if (!id) return;
  const details = await requestCancelDetails();
  if (!details) return;
  state.sessions = state.sessions.map((session) => session.id === id
    ? { ...session, canceled: true, cancelReason: details.reason, canceledAt: new Date().toISOString() }
    : session);
  render();
});

els.mockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const total = getSelectedMockTotal();
  if (!total) {
    els.mockCustomTotal.focus();
    return;
  }
  const score = Math.max(0, Math.min(total, Number(els.mockScore.value || 0)));
  const subjectBreakdown = getMockSubjectBreakdown();
  state.mocks.push({
    id: crypto.randomUUID(),
    score,
    total,
    mistakes: Number(els.mockMistakes.value || 0),
    mistakeType: els.mockMistakeType.value,
    weakArea: els.mockWeakArea.value.trim(),
    name: els.mockName.value.trim(),
    date: els.mockDate.value || todayKey(),
    subjectBreakdown
  });
  els.mockScore.value = "";
  els.mockMistakes.value = "";
  els.mockWeakArea.value = "";
  els.mockName.value = "";
  els.mockDate.value = todayKey();
  clearMockSubjectInputs();
  render();
});

function getMockSubjectBreakdown() {
  const subjects = [
    ["Physics", els.mockPhysicsScore, els.mockPhysicsTotal],
    ["Chemistry", els.mockChemistryScore, els.mockChemistryTotal],
    ["Botany", els.mockBotanyScore, els.mockBotanyTotal],
    ["Zoology", els.mockZoologyScore, els.mockZoologyTotal]
  ];
  return subjects.reduce((breakdown, [subject, scoreInput, totalInput]) => {
    const score = Number(scoreInput.value);
    const total = Number(totalInput.value);
    if (scoreInput.value !== "" && totalInput.value !== "" && Number.isFinite(score) && score >= 0 && Number.isFinite(total) && total > 0) {
      breakdown[subject] = { score: Math.min(Math.round(score), Math.round(total)), total: Math.round(total) };
    }
    return breakdown;
  }, {});
}

function clearMockSubjectInputs() {
  [els.mockPhysicsScore, els.mockPhysicsTotal, els.mockChemistryScore, els.mockChemistryTotal, els.mockBotanyScore, els.mockBotanyTotal, els.mockZoologyScore, els.mockZoologyTotal]
    .forEach((input) => { input.value = ""; });
}

els.mockTotal?.addEventListener("change", () => {
  const custom = els.mockTotal.value === "custom";
  els.mockCustomTotal.classList.toggle("hidden", !custom);
  els.mockCustomTotal.required = custom;
  const total = custom ? Number(els.mockCustomTotal.value || 0) : Number(els.mockTotal.value || 720);
  els.mockScore.max = String(total);
  els.mockScore.placeholder = total ? `Score / ${total}` : "Score";
});

els.mockCustomTotal?.addEventListener("input", () => {
  const total = getSelectedMockTotal();
  els.mockScore.max = String(total || 2000);
  els.mockScore.placeholder = total ? `Score / ${total}` : "Score";
});

function getSelectedMockTotal() {
  const total = els.mockTotal.value === "custom" ? Number(els.mockCustomTotal.value) : Number(els.mockTotal.value || 720);
  return Number.isFinite(total) && total > 0 ? Math.min(2000, Math.round(total)) : 0;
}

els.mockList.addEventListener("click", (event) => {
  const id = event.target.dataset.mockDelete;
  if (!id) return;
  state.mocks = state.mocks.filter((mock) => mock.id !== id);
  render();
});

els.rankPredictorForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  state.predictor = {
    category: els.predictorCategory.value,
    route: els.predictorRoute.value
  };
  render();
});

els.revisionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addSpacedRevision(els.revisionInput.value.trim());
  els.revisionInput.value = "";
  render();
  scheduleStudyNotifications();
});

els.revisionList.addEventListener("click", (event) => {
  const doneId = event.target.dataset.revisionDone;
  const deleteId = event.target.dataset.revisionDelete;
  if (!doneId && !deleteId) return;

  const id = doneId || deleteId;
  const completedRevision = state.revisions.find((revision) => revision.id === id);
  state.revisions = state.revisions.filter((revision) => revision.id !== id);

  if (doneId) {
    state.timetable = state.timetable.map((plan) => plan.revisionId === id && !plan.canceled ? { ...plan, done: true } : plan);
  } else {
    state.timetable = state.timetable.filter((plan) => plan.revisionId !== id);
  }

  if (doneId) {
  scheduleNextRevision(completedRevision);
  }

  render();
  scheduleStudyNotifications();
});

function addSpacedRevision(text) {
  if (!text) return;
  scheduleRevisionStage(text, revisionSchedule[0]);
}

function scheduleNextRevision(completedRevision) {
  if (!completedRevision?.text) return;
  const currentIndex = revisionSchedule.findIndex((item) => item.stage === completedRevision.stage);
  if (currentIndex < 0) return;
  const nextStage = revisionSchedule[currentIndex + 1];
  if (!nextStage) return;
  scheduleRevisionStage(completedRevision.text, nextStage);
}

function scheduleRevisionStage(text, scheduleItem) {
  if (!text || !scheduleItem) return;
  const alreadyQueued = state.revisions.some((revision) => revision.text === text && revision.stage === scheduleItem.stage);
  const alreadyPlanned = state.timetable.some((plan) => plan.subject === "Revision" && plan.task === `${scheduleItem.stage}: ${text}` && !plan.done && !plan.archived && !plan.canceled);
  if (alreadyQueued || alreadyPlanned) return;

  const date = todayKey(scheduleItem.offset);
  const revisionId = crypto.randomUUID();
  state.revisions.push({
    id: revisionId,
    text,
    date,
    stage: scheduleItem.stage,
    source: "spaced"
  });

  const slot = findBestAvailableSlot({ id: revisionId, date, time: "06:00" });
  state.timetable.push({
    id: crypto.randomUUID(),
    date: slot.date,
    time: slot.time,
    activityType: "Study",
    subject: "Revision",
    task: `${scheduleItem.stage}: ${text}`,
    done: false,
    login: "",
    logoff: "",
    canceled: false,
    cancelReason: "",
    breaks: [],
    revisionId
  });
}

els.timetableForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const planData = {
    date: els.planDate.value,
    time: els.planTime.value,
    activityType: els.planActivityType.value,
    subject: els.planSubject.value,
    topic: els.planTask.value.trim(),
    task: els.planTask.value.trim()
  };

  if (editingPlanId) {
    state.timetable = state.timetable.map((plan) => plan.id === editingPlanId ? { ...plan, ...planData } : plan);
    stopEditingPlan();
  } else {
    state.timetable.push({
      id: crypto.randomUUID(),
      ...planData,
      done: false,
      login: "",
      logoff: "",
      canceled: false,
      cancelReason: "",
      breaks: [],
      sessionLogs: [],
      startTime: planData.time,
      endTime: "",
      totalDuration: 0
    });
    els.planTask.value = "";
  }
  timetableView = "today";
  els.viewDate.value = planData.date;
  // Persist and redraw the planner directly so Add/Save never depends on unrelated dashboard widgets.
  saveState();
  renderTimetable();
  scheduleStudyNotifications();
});

els.planSubmitBtn.addEventListener("click", () => {
  if (els.timetableForm.reportValidity()) els.timetableForm.requestSubmit();
});

els.timetableList.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-plan-toggle], [data-plan-login], [data-plan-logoff], [data-plan-break], [data-plan-end-break], [data-plan-cancel], [data-plan-edit]");
  if (!action) return;
  const toggleId = action.dataset.planToggle;
  const loginId = action.dataset.planLogin;
  const logoffId = action.dataset.planLogoff;
  const breakId = action.dataset.planBreak;
  const endBreakId = action.dataset.planEndBreak;
  const cancelId = action.dataset.planCancel;
  const editId = action.dataset.planEdit;
  if (toggleId) {
    state.timetable = state.timetable.map((plan) => plan.id === toggleId && !plan.canceled ? { ...plan, done: event.target.checked } : plan);
    render();
    triggerDailyCelebrationIfReady();
    scheduleStudyNotifications();
    return;
  }
  if (loginId) {
    state.timetable = state.timetable.map((plan) => plan.id === loginId && !plan.canceled ? { ...plan, login: currentTimeValue() } : plan);
    render();
    return;
  }
  if (logoffId) {
    state.timetable = state.timetable.map((plan) => {
      if (plan.id !== logoffId || plan.canceled) return plan;
      const logoff = currentTimeValue();
      const updatedPlan = { ...plan, logoff, endTime: logoff, done: true, status: "completed" };
      updatedPlan.totalDuration = getPlanDurationMinutes(updatedPlan);
      updatedPlan.sessionLogs = [...(plan.sessionLogs || []), { login: plan.login, logoff, duration: updatedPlan.totalDuration }];
      addTimetableSession(updatedPlan);
      return updatedPlan;
    });
    render();
    scheduleStudyNotifications();
    return;
  }
  if (breakId) {
    await addPlanBreak(breakId);
    return;
  }
  if (endBreakId) {
    finishPlanBreak(endBreakId);
    return;
  }
  if (cancelId) {
    await cancelPlanSession(cancelId);
    return;
  }
  if (editId) {
    startEditingPlan(editId);
    return;
  }
});

async function requestBreakDetails() {
  return showChoiceDialog({
    title: "Break",
    message: "Choose a reason and break duration.",
    reasons: breakReasonOptions,
    durations: breakDurationOptions,
    needsDuration: true
  });
}

async function requestCancelDetails() {
  return showChoiceDialog({
    title: "Cancel Session",
    message: "Choose why this session is being cancelled.",
    reasons: cancelReasonOptions,
    durations: [],
    needsDuration: false
  });
}

function showChoiceDialog({ title, message, reasons, durations, needsDuration }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "choice-modal";
    overlay.innerHTML = `
      <div class="choice-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="choice-header">
          <p class="eyebrow">${escapeHtml(title)}</p>
          <h2>${escapeHtml(message)}</h2>
        </div>
        <div class="choice-section">
          <span>Reason</span>
          <div class="choice-options">
            ${reasons.map((reason) => `<button type="button" data-choice-reason="${escapeHtml(reason)}">${escapeHtml(reason)}</button>`).join("")}
          </div>
        </div>
        ${needsDuration ? `
          <div class="choice-section">
            <span>Break time</span>
            <div class="choice-options">
              ${durations.map((duration) => `<button type="button" data-choice-duration="${duration}">${duration} min</button>`).join("")}
            </div>
          </div>
        ` : ""}
        <label class="choice-custom">
          Details
          <input type="text" maxlength="80" placeholder="Required if Other, optional otherwise" />
        </label>
        <div class="choice-actions">
          <button class="text-button" type="button" data-choice-close>Back</button>
          <button class="secondary-button" type="button" data-choice-save>Save</button>
        </div>
      </div>
    `;

    let selectedReason = "";
    let selectedDuration = needsDuration ? 0 : null;

    const cleanup = (value) => {
      overlay.remove();
      resolve(value);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target.dataset.choiceClose !== undefined) {
        cleanup(null);
        return;
      }

      const reason = event.target.dataset.choiceReason;
      if (reason) {
        selectedReason = reason;
        overlay.querySelectorAll("[data-choice-reason]").forEach((button) => button.classList.toggle("selected", button.dataset.choiceReason === reason));
        overlay.querySelector("input").focus();
        return;
      }

      const duration = event.target.dataset.choiceDuration;
      if (duration) {
        selectedDuration = Number(duration);
        overlay.querySelectorAll("[data-choice-duration]").forEach((button) => button.classList.toggle("selected", button.dataset.choiceDuration === duration));
        return;
      }

      if (event.target.dataset.choiceSave !== undefined) {
        const detail = overlay.querySelector("input").value.trim();
        if (!selectedReason || (needsDuration && !selectedDuration) || (selectedReason === "Other" && !detail)) {
          overlay.querySelector(".choice-dialog").classList.add("needs-input");
          return;
        }
        cleanup({
          reason: selectedReason === "Other" ? detail : detail ? `${selectedReason} - ${detail}` : selectedReason,
          duration: selectedDuration
        });
      }
    });

    document.body.appendChild(overlay);
  });
}

async function addPlanBreak(id) {
  const details = await requestBreakDetails();
  if (!details) return;
  const now = new Date();
  state.timetable = state.timetable.map((plan) => {
    if (plan.id !== id || plan.canceled || hasActivePlanBreak(plan)) return plan;
    return {
      ...plan,
      breaks: [
        ...(Array.isArray(plan.breaks) ? plan.breaks : []),
        {
          id: crypto.randomUUID(),
          reason: details.reason,
          duration: details.duration,
          time: currentTimeValue(),
          date: todayKey(),
          startedAt: now.toISOString(),
          endedAt: "",
          endedTime: "",
          finishedEarly: false
        }
      ]
    };
  });
  render();
}

function finishPlanBreak(id) {
  const now = new Date();
  state.timetable = state.timetable.map((plan) => {
    if (plan.id !== id || !hasActivePlanBreak(plan)) return plan;
    const breaks = [...plan.breaks];
    const latest = { ...breaks.at(-1) };
    const plannedEnd = latest.startedAt && latest.duration
      ? Date.parse(latest.startedAt) + (Number(latest.duration) * 60000)
      : 0;
    latest.endedAt = now.toISOString();
    latest.endedTime = currentTimeValue();
    latest.finishedEarly = plannedEnd ? now.getTime() < plannedEnd : false;
    breaks[breaks.length - 1] = latest;
    return { ...plan, breaks };
  });
  render();
}

async function cancelPlanSession(id) {
  const details = await requestCancelDetails();
  if (!details) return;
  const sessionId = `plan-${id}-${todayKey()}`;
  state.sessions = state.sessions.filter((session) => session.id !== sessionId);
  state.timetable = state.timetable.map((plan) => {
    if (plan.id !== id) return plan;
    return {
      ...plan,
      done: false,
      canceled: true,
      cancelReason: details.reason,
      canceledAt: new Date().toISOString()
    };
  });
  render();
  scheduleStudyNotifications();
}

function startEditingPlan(id) {
  const plan = state.timetable.find((item) => item.id === id);
  if (!plan) return;
  editingPlanId = id;
  els.planDate.value = plan.date;
  els.planTime.value = plan.time;
  els.planActivityType.value = activityTypes.includes(plan.activityType) ? plan.activityType : "Study";
  els.planSubject.value = ["Physics", "Chemistry", "Botany", "Zoology"].includes(plan.subject) ? plan.subject : "Physics";
  els.planTask.value = plan.topic || plan.task;
  els.planSubmitBtn.textContent = "Save";
  els.planCancelBtn.classList.remove("hidden");
  els.timetableForm.scrollIntoView({ behavior: "smooth", block: "center" });
  els.planTask.focus();
}

function stopEditingPlan() {
  editingPlanId = null;
  els.planSubmitBtn.textContent = "Add";
  els.planCancelBtn.classList.add("hidden");
  els.planDate.value = todayKey();
  els.planTime.value = "06:00";
  els.planActivityType.value = "Study";
  els.planSubject.value = "Physics";
  els.planTask.value = "";
}

els.planCancelBtn.addEventListener("click", () => {
  stopEditingPlan();
  renderTimetable();
});

els.todayViewBtn.addEventListener("click", () => {
  timetableView = "today";
  renderTimetable();
});

els.weekViewBtn.addEventListener("click", () => {
  timetableView = "week";
  renderTimetable();
});

els.viewDate.addEventListener("change", () => {
  timetableView = "today";
  els.planDate.value = els.viewDate.value;
  renderTimetable();
});

els.tomorrowBtn.addEventListener("click", () => {
  const tomorrow = todayKey(1);
  timetableView = "today";
  els.viewDate.value = tomorrow;
  els.planDate.value = tomorrow;
  renderTimetable();
});

function addTimetableSession(plan) {
  const minutes = getPlanDurationMinutes(plan);
  if (!minutes) return;

  const sessionId = `plan-${plan.id}-${plan.date || todayKey()}`;
  const hours = Number((minutes / 60).toFixed(2));
  const subject = ["Physics", "Chemistry", "Botany", "Zoology"].includes(plan.subject) ? plan.subject : "Revision";

  state.sessions = state.sessions.filter((session) => session.id !== sessionId);
  state.sessions.push({
    id: sessionId,
    subject,
    activityType: activityTypes.includes(plan.activityType) ? plan.activityType : "Study",
    topic: plan.topic || plan.task,
    hours,
    focus: `${plan.topic || plan.task} (${plan.login}-${plan.logoff})`,
    date: plan.date || todayKey()
  });
}

els.focusDoneBtn.addEventListener("click", () => {
  if (!state.focusDays.includes(todayKey())) {
    state.focusDays.push(todayKey());
  }
  render();
});

els.exportDataBtn.addEventListener("click", () => {
  const backup = {
    app: "Dr Noel Bille NEET Dashboard",
    exportedAt: new Date().toISOString(),
    data: state
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `neet-prep-backup-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

els.importDataBtn?.addEventListener("click", () => els.importDataInput?.click());

els.importDataInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  try {
    const backup = JSON.parse(await file.text());
    const importedData = backup?.data ?? backup;
    if (!importedData || typeof importedData !== "object" || Array.isArray(importedData)) {
      throw new Error("invalid backup");
    }
    if (!window.confirm("Import this backup? It will replace the records currently shown.")) return;

    state = normalizeState(importedData);
    lastStateFingerprint = "";
    saveState();
    render();
    if (els.focusStatus) els.focusStatus.textContent = "Backup restored successfully.";
  } catch {
    if (els.focusStatus) els.focusStatus.textContent = "That file is not a valid NEET Prep backup.";
  }
});
els.syllabusFilter.addEventListener("change", renderSyllabus);

els.syllabusList.addEventListener("click", (event) => {
  const id = event.target.dataset.syllabusToggle;
  if (!id) return;
  state.syllabusDone[id] = event.target.checked;
  render();
});

els.weakForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.weakTopics.push({
    id: crypto.randomUUID(),
    subject: els.weakSubject.value,
    topic: els.weakTopic.value.trim(),
    priority: els.weakPriority.value,
    action: els.weakAction.value.trim()
  });
  els.weakTopic.value = "";
  els.weakAction.value = "";
  render();
});

els.weakList.addEventListener("click", (event) => {
  const id = event.target.dataset.weakResolve;
  if (!id) return;
  const topic = state.weakTopics.find((item) => item.id === id);
  if (!topic) return;
  state.resolvedWeakTopics = [
    { ...topic, resolvedAt: new Date().toISOString() },
    ...(state.resolvedWeakTopics || [])
  ];
  state.weakTopics = state.weakTopics.filter((item) => item.id !== id);
  render();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  els.installAppBtn.classList.remove("hidden");
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  els.installAppBtn.classList.add("hidden");
});

window.addEventListener("online", () => {
  lastCloudStatus = currentUser ? "Reconnecting" : lastCloudStatus;
  renderSyncStatus();
  scheduleCloudSave(50);
});

window.addEventListener("offline", () => {
  lastCloudStatus = currentUser ? "Offline ready" : lastCloudStatus;
  renderSyncStatus();
});


// ============================================================
// Timetable Planner v3
// Single source of truth: the shared `state` object + saveState().
// One render function, one delegated listener set (bound once).
// ============================================================
let plannerEditingId = null;
let plannerBound = false;
let plannerRange = "day"; // "day" | "week"
let plannerFilter = "all"; // all | pending | done
let plannerError = "";

const PLANNER_SUBJECTS = {
  Physics: { icon: "&#9883;", key: "physics" },
  Chemistry: { icon: "&#129514;", key: "chemistry" },
  Botany: { icon: "&#127807;", key: "botany" },
  Zoology: { icon: "&#128029;", key: "zoology" },
  Revision: { icon: "&#128260;", key: "revision" },
};

function plannerSubjectMeta(subject) {
  return PLANNER_SUBJECTS[subject] || { icon: "&#128218;", key: "physics" };
}

function plannerIcon(activityType) {
  return { Class: "&#127891;", Study: "&#128218;", "Question Practice": "&#9997;", "Mock Test": "&#128221;" }[activityType] || "&#128218;";
}

function plannerHost() {
  return document.querySelector("#plannerRoot") || document.querySelector("#timetable");
}

function plannerSelectedDate() {
  return plannerHost()?.dataset.plannerDate || todayKey();
}

function plannerShiftDate(date, days) {
  const day = new Date(`${date}T00:00:00`);
  day.setDate(day.getDate() + days);
  return day.toISOString().slice(0, 10);
}

function plannerDatesInView(startDate) {
  if (plannerRange === "day") return [startDate];
  return Array.from({ length: 7 }, (_, index) => plannerShiftDate(startDate, index));
}

function plannerPlansForDate(date) {
  return state.timetable
    .filter((plan) => plan.date === date && !plan.archived)
    .filter((plan) => (plannerFilter === "pending" ? !plan.done && !plan.canceled : plannerFilter === "done" ? plan.done : true))
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

function plannerDayLabel(date) {
  const day = new Date(`${date}T00:00:00`);
  const label = day.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
  if (date === todayKey()) return `Today &middot; ${label}`;
  if (date === todayKey(1)) return `Tomorrow &middot; ${label}`;
  return label;
}

function plannerStateKey(plan) {
  if (plan.canceled) return "aborted";
  if (hasActivePlanBreak(plan)) return "paused";
  if (plan.done) return "done";
  if (isMissedPlan(plan)) return "missed";
  if (plan.login) return "active";
  return "planned";
}

function plannerReadForm() {
  const host = plannerHost();
  if (!host) return null;
  const get = (selector) => host.querySelector(selector)?.value ?? "";
  return {
    date: get("[data-v3-date]"),
    time: get("[data-v3-time]"),
    activityType: get("[data-v3-activity]"),
    subject: get("[data-v3-subject]"),
    topic: get("[data-v3-topic]").trim(),
  };
}

function plannerSessionCard(plan) {
  const subject = plannerSubjectMeta(plan.subject);
  const stateKey = plannerStateKey(plan);
  const duration = getPlanDuration(plan);
  return `
    <article class="tp-card tp-${stateKey}" data-subject="${subject.key}">
      <label class="tp-check">
        <input type="checkbox" data-v3-toggle="${plan.id}" ${plan.done ? "checked" : ""} ${plan.canceled ? "disabled" : ""}>
        <span class="sr-only-label">Mark done</span>
      </label>
      <div class="tp-avatar" aria-hidden="true">${subject.icon}</div>
      <div class="tp-body">
        <div class="tp-meta">
          <strong class="tp-time">${escapeHtml(plan.time)}</strong>
          <span class="tp-chip tp-chip-subject">${escapeHtml(plan.subject)}</span>
          <span class="tp-chip tp-chip-activity">${plannerIcon(plan.activityType)} ${escapeHtml(plan.activityType || "Study")}</span>
          <span class="tp-status tp-status-${stateKey}"><i></i>${escapeHtml(getPlanStateLabel(plan).replace(/^\S+\s/, ""))}</span>
          ${duration ? `<span class="tp-chip tp-chip-duration">&#9201; ${escapeHtml(duration)}</span>` : ""}
        </div>
        <h4 class="tp-topic">${escapeHtml(plan.topic || plan.task || "Untitled session")}</h4>
        <p class="tp-timing">${escapeHtml(getPlanTimingText(plan))}</p>
        <div class="tp-actions">
          <button type="button" data-v3-login="${plan.id}" ${plan.canceled ? "disabled" : ""}>${plan.login ? "Update In" : "Log In"}</button>
          <button type="button" data-v3-logoff="${plan.id}" ${plan.canceled ? "disabled" : ""}>${plan.logoff ? "Update Out" : "Log Off"}</button>
          <button type="button" data-v3-break="${plan.id}" ${plan.canceled || plan.done || hasActivePlanBreak(plan) ? "disabled" : ""}>Break</button>
          <button type="button" class="secondary-button" data-v3-cancel-session="${plan.id}" ${plan.canceled ? "disabled" : ""}>Cancel</button>
          <button type="button" class="secondary-button" data-v3-edit="${plan.id}">Edit</button>
          <button type="button" class="text-button danger-button" data-v3-delete="${plan.id}">Remove</button>
        </div>
      </div>
    </article>`;
}

function renderTimetable() {
  const host = plannerHost();
  if (!host) return;
  const selectedDate = plannerSelectedDate();
  host.dataset.plannerDate = selectedDate;
  host.className = "panel planner-v3";

  const editing = plannerEditingId ? state.timetable.find((plan) => plan.id === plannerEditingId) : null;
  const draft = editing || { date: selectedDate, time: "06:00", activityType: "Study", subject: "Physics", topic: "" };
  const dates = plannerDatesInView(selectedDate);
  const plans = dates.flatMap((date) => plannerPlansForDate(date));
  const doneCount = plans.filter((plan) => plan.done).length;
  const activeCount = plans.filter((plan) => plannerStateKey(plan) === "active" || plannerStateKey(plan) === "paused").length;
  const loggedMinutes = plans.reduce((total, plan) => total + (getPlanDurationMinutes(plan) || 0), 0);
  const loggedLabel = loggedMinutes >= 60
    ? `${Math.floor(loggedMinutes / 60)}h ${loggedMinutes % 60 ? `${loggedMinutes % 60}m` : ""}`.trim()
    : `${loggedMinutes}m`;
  const progress = plans.length ? Math.round((doneCount / plans.length) * 100) : 0;

  const listMarkup = plannerRange === "day"
    ? (plans.length
        ? plans.map(plannerSessionCard).join("")
        : `<div class="tp-empty"><strong>No sessions here yet</strong><span>Fill the form above to lock in your first mission for this date.</span></div>`)
    : (dates.map((date) => {
        const dayPlans = plannerPlansForDate(date);
        if (!dayPlans.length) return "";
        return `<section class="tp-day"><header class="tp-day-header"><h3>${plannerDayLabel(date)}</h3><span>${dayPlans.length} session${dayPlans.length === 1 ? "" : "s"}</span></header>${dayPlans.map(plannerSessionCard).join("")}</section>`;
      }).join("") || `<div class="tp-empty"><strong>Next 7 days are empty</strong><span>Plan ahead so momentum never breaks.</span></div>`);

  host.innerHTML = `
    <header class="tp-head">
      <div>
        <p class="eyebrow">Plan</p>
        <h2>Timetable Planner</h2>
        <p class="tp-sub">Build the day, log every mission, keep the streak alive.</p>
      </div>
      <div class="segmented-control" aria-label="Timetable range">
        <button type="button" class="${plannerRange === "day" ? "active" : ""}" data-v3-range="day">Day</button>
        <button type="button" class="${plannerRange === "week" ? "active" : ""}" data-v3-range="week">Next 7 days</button>
      </div>
    </header>

    <div class="tp-stats">
      <div class="tp-stat"><span>Sessions</span><strong>${plans.length}</strong></div>
      <div class="tp-stat"><span>Completed</span><strong>${doneCount}</strong></div>
      <div class="tp-stat"><span>In progress</span><strong>${activeCount}</strong></div>
      <div class="tp-stat"><span>Time logged</span><strong>${loggedLabel}</strong></div>
      <div class="tp-progress" role="img" aria-label="${progress}% complete">
        <div class="tp-progress-bar"><i style="width:${progress}%"></i></div>
        <small>${progress}% of this ${plannerRange === "day" ? "day" : "week"} complete</small>
      </div>
    </div>

    <form class="tp-form" data-v3-form novalidate>
      <label>Date<input data-v3-date type="date" value="${escapeHtml(draft.date || selectedDate)}"></label>
      <label>Start time<input data-v3-time type="time" value="${escapeHtml(draft.time || "06:00")}"></label>
      <label>Activity<select data-v3-activity>
        ${activityTypes.map((type) => `<option value="${type}" ${type === (draft.activityType || "Study") ? "selected" : ""}>${plannerIcon(type)} ${type}</option>`).join("")}
      </select></label>
      <label>Subject<select data-v3-subject>
        ${Object.keys(PLANNER_SUBJECTS).map((subject) => `<option value="${subject}" ${subject === draft.subject ? "selected" : ""}>${plannerSubjectMeta(subject).icon} ${subject}</option>`).join("")}
      </select></label>
      <label class="tp-form-topic">Topic<input data-v3-topic type="text" maxlength="80" placeholder="e.g. Motion in 1D" value="${escapeHtml(draft.topic || draft.task || "")}"></label>
      <div class="tp-form-actions">
        <button type="submit">${editing ? "Save Changes" : "Add to Timetable"}</button>
        ${editing ? '<button type="button" class="secondary-button" data-v3-cancel-edit>Cancel edit</button>' : ""}
      </div>
      <div class="tp-quickadd">
        <span>Quick add</span>
        ${[["06:00", "Physics", "Concept + DPP"], ["14:45", "Chemistry", "Revision + MCQs"], ["19:30", "Botany", "NCERT active recall"]]
          .map(([time, subject, topic]) => `<button type="button" class="text-button" data-v3-quick='${time}|${subject}|${topic}'>${time} ${subject}</button>`).join("")}
      </div>
      ${plannerError ? `<p class="tp-error" role="alert">${escapeHtml(plannerError)}</p>` : ""}
    </form>

    <div class="tp-toolbar">
      <div class="tp-datenav">
        <button type="button" class="text-button" data-v3-step="-1" aria-label="Previous day">&#8249;</button>
        <input data-v3-view-date type="date" value="${escapeHtml(selectedDate)}">
        <button type="button" class="text-button" data-v3-step="1" aria-label="Next day">&#8250;</button>
        <button type="button" class="text-button" data-v3-jump="today">Today</button>
        <button type="button" class="text-button" data-v3-jump="tomorrow">Tomorrow</button>
      </div>
      <div class="segmented-control tp-filter" aria-label="Filter sessions">
        ${[["all", "All"], ["pending", "Pending"], ["done", "Done"]].map(([key, label]) =>
          `<button type="button" class="${plannerFilter === key ? "active" : ""}" data-v3-filter="${key}">${label}</button>`).join("")}
      </div>
    </div>

    <div class="tp-list">${listMarkup}</div>
  `;

  if (plannerBound) return;
  plannerBound = true;

  host.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-v3-form]")) return;
    event.preventDefault();
    plannerSaveFromForm();
  });

  host.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button || !host.contains(button)) return;

    if (button.dataset.v3Range) { plannerRange = button.dataset.v3Range; renderTimetable(); return; }
    if (button.dataset.v3Filter) { plannerFilter = button.dataset.v3Filter; renderTimetable(); return; }
    if (button.dataset.v3Step) {
      plannerEditingId = null;
      host.dataset.plannerDate = plannerShiftDate(plannerSelectedDate(), Number(button.dataset.v3Step) * (plannerRange === "week" ? 7 : 1));
      renderTimetable();
      return;
    }
    if (button.dataset.v3Jump) {
      plannerEditingId = null;
      host.dataset.plannerDate = button.dataset.v3Jump === "tomorrow" ? todayKey(1) : todayKey();
      renderTimetable();
      return;
    }
    if (button.dataset.v3Quick) {
      const [time, subject, topic] = button.dataset.v3Quick.split("|");
      host.querySelector("[data-v3-time]").value = time;
      host.querySelector("[data-v3-subject]").value = subject;
      host.querySelector("[data-v3-topic]").value = topic;
      plannerSaveFromForm();
      return;
    }
    if (button.dataset.v3CancelEdit !== undefined) { plannerEditingId = null; plannerError = ""; renderTimetable(); return; }

    const editId = button.dataset.v3Edit;
    if (editId) {
      plannerEditingId = editId;
      plannerError = "";
      const plan = state.timetable.find((entry) => entry.id === editId);
      if (plan) host.dataset.plannerDate = plan.date;
      renderTimetable();
      host.querySelector("[data-v3-topic]")?.focus();
      return;
    }
    const deleteId = button.dataset.v3Delete;
    if (deleteId) {
      state.timetable = state.timetable.filter((plan) => plan.id !== deleteId);
      if (plannerEditingId === deleteId) plannerEditingId = null;
      saveState();
      render();
      return;
    }
    const loginId = button.dataset.v3Login;
    if (loginId) {
      state.timetable = state.timetable.map((plan) => (plan.id === loginId && !plan.canceled ? { ...plan, login: currentTimeValue(), status: "active" } : plan));
      saveState();
      render();
      return;
    }
    const logoffId = button.dataset.v3Logoff;
    if (logoffId) {
      state.timetable = state.timetable.map((plan) => {
        if (plan.id !== logoffId || plan.canceled) return plan;
        const logoff = currentTimeValue();
        const updated = { ...plan, logoff, endTime: logoff, done: true, status: "completed" };
        updated.totalDuration = getPlanDurationMinutes(updated);
        updated.sessionLogs = [...(plan.sessionLogs || []), { login: plan.login, logoff, duration: updated.totalDuration }];
        addTimetableSession(updated);
        return updated;
      });
      saveState();
      render();
      return;
    }
    const breakId = button.dataset.v3Break;
    if (breakId) { await addPlanBreak(breakId); renderTimetable(); return; }
    const cancelId = button.dataset.v3CancelSession;
    if (cancelId) { await cancelPlanSession(cancelId); renderTimetable(); }
  });

  host.addEventListener("change", (event) => {
    if (event.target.matches("[data-v3-view-date]")) {
      plannerEditingId = null;
      host.dataset.plannerDate = event.target.value || todayKey();
      renderTimetable();
      return;
    }
    const toggleId = event.target.dataset?.v3Toggle;
    if (toggleId) {
      const checked = event.target.checked;
      state.timetable = state.timetable.map((plan) => (plan.id === toggleId && !plan.canceled
        ? { ...plan, done: checked, status: checked ? "completed" : "planned" }
        : plan));
      saveState();
      render();
    }
  });
}

function plannerSaveFromForm() {
  const host = plannerHost();
  const data = plannerReadForm();
  if (!host || !data) return;
  if (!data.date || !data.time || !data.topic) {
    plannerError = "Add a date, a start time and a topic before saving.";
    renderTimetable();
    host.querySelector("[data-v3-topic]")?.focus();
    return;
  }
  plannerError = "";
  const payload = { ...data, task: data.topic, startTime: data.time };
  if (plannerEditingId) {
    state.timetable = state.timetable.map((plan) => (plan.id === plannerEditingId ? { ...plan, ...payload } : plan));
  } else {
    state.timetable = [...state.timetable, {
      id: crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...payload,
      done: false, login: "", logoff: "", canceled: false, cancelReason: "",
      breaks: [], sessionLogs: [], endTime: "", totalDuration: 0, status: "planned",
    }];
  }
  plannerEditingId = null;
  host.dataset.plannerDate = data.date;
  saveState();
  render();
}

initializeCloudSync();
registerServiceWorker().then(scheduleStudyNotifications);
startLiveSessionTicker();
render();
