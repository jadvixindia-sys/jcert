import type { Certificate } from './types';

/** Split a single CSV line honoring double-quoted fields with embedded commas. */
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

type CsvCertificate = {
  candidateName: string;
  courseName: string;
  designation: string;
  completionDate: string;
  expiryDate?: string;
  level?: string;
  rollNumber: string;
  gender?: string;
  photoUrl?: string;
  institutionName?: string;
  duration?: string;
  status?: string;
};

/**
 * Parse a certificate CSV. Headers are matched loosely (case/space-insensitive).
 *
 * NOTE: any Order ID column is deliberately ignored — the server issues a fresh
 * Order ID for every imported row, so re-importing an export never collides
 * with the original records. It stays editable afterwards.
 */
export function parseCertificateCsv(text: string): CsvCertificate[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));

  const pick = (values: string[], keys: string[], exclude: string[] = []) => {
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i];
      if (exclude.some((e) => h.includes(e))) continue;
      if (keys.some((k) => h.includes(k))) return values[i] ?? '';
    }
    return '';
  };

  return lines
    .slice(1)
    .map((line) => {
      const v = splitLine(line);
      return {
        candidateName: pick(v, ['candidate', 'name'], ['course', 'institut', 'roll']),
        courseName: pick(v, ['course']),
        designation: pick(v, ['designation']),
        // "completion" wins; plain "date" also accepted but never the expiry column.
        completionDate: pick(v, ['completion'], []) || pick(v, ['date'], ['expiry', 'expire']),
        expiryDate: pick(v, ['expiry', 'expire']) || undefined,
        level: pick(v, ['level']) || undefined,
        rollNumber: pick(v, ['roll']),
        gender: pick(v, ['gender']) || undefined,
        photoUrl: pick(v, ['photo']) || undefined,
        institutionName: pick(v, ['institution', 'institute']) || undefined,
        duration: pick(v, ['duration']) || undefined,
        status: pick(v, ['status']) || undefined,
      };
    })
    .filter((c) => c.candidateName && c.courseName && c.rollNumber);
}

const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function toCsv(rows: Certificate[]): string {
  const headers = [
    'Candidate Name',
    'Course Name',
    'Designation',
    'Completion Date',
    'Expiry Date',
    'Level',
    'Roll Number',
    'Gender',
    'Photo URL',
    'Institution',
    'Duration',
    'Status',
    'Order ID',
  ];
  const body = rows.map((c) =>
    [
      c.candidateName,
      c.courseName,
      c.designation,
      c.completionDate?.slice(0, 10),
      c.expiryDate ? c.expiryDate.slice(0, 10) : '',
      c.level,
      c.rollNumber,
      c.gender ?? '',
      c.photoUrl ?? '',
      c.institutionName,
      c.duration,
      c.status,
      c.orderId,
    ]
      .map(esc)
      .join(',')
  );
  return [headers.join(','), ...body].join('\n');
}
