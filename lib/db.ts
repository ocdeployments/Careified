import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false }
});

// Column allowlist to prevent SQL injection
const CAREGIVER_COLUMNS = new Set([
  'id', 'user_id', 'first_name', 'last_name', 'email', 'phone', 'status',
  'is_verified', 'created_at', 'updated_at', 'photo_url', 'bio', 'languages',
  'years_experience', 'hourly_rate', 'service_areas', 'travel_radius',
  'specializations', 'certifications', 'availability', 'personality_profile',
  'aggregate_score', 'trust_score', 'personality_score', 'credential_score',
  'reference_score', 'availability_score', 'experience_score'
]);

function validateColumn(key: string): void {
  if (!CAREGIVER_COLUMNS.has(key)) {
    throw new Error(`Invalid column name: ${key}`);
  }
}

export const prisma = {
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [where.id]);
      return result.rows[0];
    },
    findFirst: async ({ where }: { where: { userId?: string } }) => {
      const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [where.userId]);
      return result.rows[0];
    },
    create: async ({ data }: { data: any }) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    },
    update: async ({ where, data }: { where: { id: string }, data: any }) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const result = await pool.query(
        `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, where.id]
      );
      return result.rows[0];
    },
  },
  caregiver: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      const result = await pool.query('SELECT * FROM caregivers WHERE id = $1', [where.id]);
      return result.rows[0];
    },
    findFirst: async ({ where }: { where: { userId?: string } }) => {
      const result = await pool.query('SELECT * FROM caregivers WHERE user_id = $1 LIMIT 1', [where.userId]);
      return result.rows[0];
    },
    findMany: async ({ where }: { where?: any }) => {
      let query = 'SELECT * FROM caregivers';
      const values: any[] = [];
      if (where) {
        // Validate all column names against allowlist
        Object.keys(where).forEach(k => validateColumn(k));
        const conditions = Object.keys(where).map((k, i) => {
          values.push(where[k]);
          return `${k} = $${i + 1}`;
        });
        query += ' WHERE ' + conditions.join(' AND ');
      }
      const result = await pool.query(query, values);
      return result.rows;
    },
    create: async ({ data }: { data: any }) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO caregivers (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    },
    update: async ({ where, data }: { where: { id: string }, data: any }) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const result = await pool.query(
        `UPDATE caregivers SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, where.id]
      );
      return result.rows[0];
    },
  },
  caregiverCertification: {
    findMany: async ({ where }: { where: { caregiverId: string } }) => {
      const result = await pool.query('SELECT * FROM caregiver_certifications WHERE caregiver_id = $1', [where.caregiverId]);
      return result.rows;
    },
    count: async ({ where }: { where: { caregiverId: string } }) => {
      const result = await pool.query('SELECT COUNT(*) as count FROM caregiver_certifications WHERE caregiver_id = $1', [where.caregiverId]);
      return parseInt(result.rows[0]?.count || '0', 10);
    },
    deleteMany: async ({ where }: { where: { caregiverId: string } }) => {
      await pool.query('DELETE FROM caregiver_certifications WHERE caregiver_id = $1', [where.caregiverId]);
    },
    createMany: async ({ data }: { data: any[] }) => {
      for (const item of data) {
        const keys = Object.keys(item);
        const values = Object.values(item);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await pool.query(`INSERT INTO caregiver_certifications (${keys.join(', ')}) VALUES (${placeholders})`, values);
      }
    },
  },
  caregiverReference: {
    findMany: async ({ where }: { where: { caregiverId: string } }) => {
      const result = await pool.query('SELECT * FROM caregiver_references WHERE caregiver_id = $1', [where.caregiverId]);
      return result.rows;
    },
    count: async ({ where }: { where: { caregiverId: string } }) => {
      const result = await pool.query('SELECT COUNT(*) as count FROM caregiver_references WHERE caregiver_id = $1', [where.caregiverId]);
      return parseInt(result.rows[0]?.count || '0', 10);
    },
    deleteMany: async ({ where }: { where: { caregiverId: string } }) => {
      await pool.query('DELETE FROM caregiver_references WHERE caregiver_id = $1', [where.caregiverId]);
    },
    createMany: async ({ data }: { data: any[] }) => {
      for (const item of data) {
        const keys = Object.keys(item);
        const values = Object.values(item);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await pool.query(`INSERT INTO caregiver_references (${keys.join(', ')}) VALUES (${placeholders})`, values);
      }
    },
  },
};

export { pool };
