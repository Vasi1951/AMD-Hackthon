const initSql = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(process.env.DB_PATH || './db/swasthai.sqlite');
let db;

async function initDatabase() {
  const SQL = await initSql();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // ── Schema ──────────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    age INTEGER,
    weight REAL,
    height REAL,
    blood_group TEXT,
    city TEXT DEFAULT 'New Delhi',
    gender TEXT,
    onboarded INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS health_metrics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    heart_rate INTEGER,
    sleep_hours REAL,
    steps INTEGER,
    mood INTEGER,
    stress INTEGER,
    hydration INTEGER,
    health_score INTEGER,
    recorded_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    risk_level TEXT,
    confidence INTEGER,
    sources TEXT,
    emotional_tone TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS symptom_scans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    symptoms_text TEXT NOT NULL,
    category TEXT,
    risk_level TEXT,
    confidence INTEGER,
    recommendations TEXT,
    when_to_seek TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS mood_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mood_value INTEGER NOT NULL,
    mood_label TEXT,
    stress_value INTEGER,
    sleep_hours REAL,
    heart_rate INTEGER,
    notes TEXT,
    logged_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS food_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    description TEXT NOT NULL,
    ai_rating TEXT,
    ai_feedback TEXT,
    calories_estimate INTEGER,
    protein_g REAL,
    carbs_g REAL,
    fat_g REAL,
    health_score INTEGER,
    logged_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS water_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_ml INTEGER NOT NULL,
    logged_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS streaks (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_log_date TEXT,
    total_logs INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge_key TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    description TEXT,
    earned_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS daily_tips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tip TEXT NOT NULL,
    category TEXT,
    date TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sentiment TEXT,
    sentiment_score REAL,
    ai_feedback TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'medication',
    time TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS city_health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL DEFAULT 'New Delhi',
    health_index INTEGER NOT NULL DEFAULT 82,
    trend TEXT NOT NULL DEFAULT 'stable',
    zone_data TEXT NOT NULL,
    category_trends TEXT NOT NULL,
    alerts TEXT NOT NULL,
    chart_data TEXT NOT NULL,
    updated_at DATETIME DEFAULT (datetime('now'))
  )`);

  // Seed city data if empty
  const cityRow = db.exec("SELECT COUNT(*) as cnt FROM city_health");
  const cnt = cityRow[0]?.values[0][0];
  if (!cnt || cnt === 0) {
    db.run(`INSERT INTO city_health (city, health_index, trend, zone_data, category_trends, alerts, chart_data) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      'New Delhi', 82, 'stable',
      JSON.stringify([
        { zone: 'North', risk: 'medium', cases: 342 },
        { zone: 'South', risk: 'low', cases: 187 },
        { zone: 'East', risk: 'high', cases: 456 },
        { zone: 'West', risk: 'low', cases: 203 },
        { zone: 'Central', risk: 'medium', cases: 298 }
      ]),
      JSON.stringify([
        { category: 'Respiratory', cases: 245, change: 12 },
        { category: 'Digestive', cases: 156, change: -5 },
        { category: 'Fever', cases: 189, change: 8 },
        { category: 'Allergies', cases: 134, change: -3 },
        { category: 'General', cases: 98, change: 2 }
      ]),
      JSON.stringify([{ id: 1, title: 'Active Health Alert', message: 'Increased flu activity in North/East zones. Take preventive measures.', severity: 'warning', updated: '2 hours ago' }]),
      JSON.stringify([
        { date: 'Feb 19', cases: 245 }, { date: 'Feb 20', cases: 289 },
        { date: 'Feb 21', cases: 312 }, { date: 'Feb 22', cases: 298 },
        { date: 'Feb 23', cases: 285 }, { date: 'Feb 24', cases: 271 },
        { date: 'Feb 25', cases: 263 }
      ])
    ]);
  }

  persist();
  console.log(`✅ Database initialized: ${DB_PATH}`);
  return db;
}

function persist() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (e) {
    console.error('DB persist error:', e.message);
  }
}

// ── Helper API ─────────────────────────────────────────────────────────────────
function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

function get(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result || result.length === 0) return null;
  const cols = result[0].columns;
  const row = result[0].values[0];
  if (!row) return null;
  const obj = {};
  cols.forEach((c, i) => obj[c] = row[i]);
  return obj;
}

function all(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result || result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
}

module.exports = { initDatabase, run, get, all, persist };
