import type { DatabaseBackup, Person, Department, Assignment } from '../../types';

// UUID v4 regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isValidUUID = (value: unknown): value is string => {
  return typeof value === 'string' && UUID_REGEX.test(value);
};

const isValidDate = (value: unknown): boolean => {
  if (!(value instanceof Date)) {
    if (typeof value === 'string') {
      return !isNaN(Date.parse(value));
    }
    return false;
  }
  return !isNaN(value.getTime());
};

const isValidPerson = (person: unknown): person is Person => {
  if (typeof person !== 'object' || person === null) return false;

  const p = person as Record<string, unknown>;

  return (
    isValidUUID(p.id) &&
    typeof p.name === 'string' &&
    p.name.trim().length > 0 &&
    typeof p.role === 'string' &&
    isValidDate(p.createdAt) &&
    isValidDate(p.updatedAt)
  );
};

const isValidDepartment = (dept: unknown): dept is Department => {
  if (typeof dept !== 'object' || dept === null) return false;

  const d = dept as Record<string, unknown>;
  const position = d.position as Record<string, unknown>;
  const size = d.size as Record<string, unknown>;

  return (
    isValidUUID(d.id) &&
    typeof d.name === 'string' &&
    d.name.trim().length > 0 &&
    position &&
    typeof position.x === 'number' &&
    typeof position.y === 'number' &&
    size &&
    typeof size.width === 'number' &&
    typeof size.height === 'number' &&
    isValidDate(d.createdAt) &&
    isValidDate(d.updatedAt)
  );
};

const isValidAssignment = (
  assignment: unknown,
  validPersonIds: Set<string>,
  validDepartmentIds: Set<string>
): assignment is Assignment => {
  if (typeof assignment !== 'object' || assignment === null) return false;

  const a = assignment as Record<string, unknown>;

  return (
    isValidUUID(a.id) &&
    typeof a.personId === 'string' &&
    validPersonIds.has(a.personId) &&
    typeof a.departmentId === 'string' &&
    validDepartmentIds.has(a.departmentId) &&
    isValidDate(a.createdAt)
  );
};

export const validateBackup = (data: unknown): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Invalid backup file format'] };
  }

  const backup = data as Record<string, unknown>;

  // Validate structure
  if (!backup.version || typeof backup.version !== 'string') {
    errors.push('Missing or invalid version field');
  }

  if (!backup.exportedAt || typeof backup.exportedAt !== 'string') {
    errors.push('Missing or invalid exportedAt field');
  }

  if (!backup.data || typeof backup.data !== 'object') {
    errors.push('Missing data field');
    return { valid: false, errors };
  }

  const backupData = backup.data as Record<string, unknown>;

  // Validate persons
  if (!Array.isArray(backupData.persons)) {
    errors.push('persons must be an array');
  } else {
    backupData.persons.forEach((person, idx) => {
      if (!isValidPerson(person)) {
        errors.push(`Invalid person at index ${idx}`);
      }
    });
  }

  // Validate departments
  if (!Array.isArray(backupData.departments)) {
    errors.push('departments must be an array');
  } else {
    backupData.departments.forEach((dept, idx) => {
      if (!isValidDepartment(dept)) {
        errors.push(`Invalid department at index ${idx}`);
      }
    });
  }

  // Validate assignments
  if (!Array.isArray(backupData.assignments)) {
    errors.push('assignments must be an array');
  } else {
    const validPersonIds = new Set(
      (Array.isArray(backupData.persons) ? backupData.persons : [])
        .filter(isValidPerson)
        .map(p => p.id)
    );
    const validDepartmentIds = new Set(
      (Array.isArray(backupData.departments) ? backupData.departments : [])
        .filter(isValidDepartment)
        .map(d => d.id)
    );

    backupData.assignments.forEach((assignment, idx) => {
      if (!isValidAssignment(assignment, validPersonIds, validDepartmentIds)) {
        errors.push(`Invalid assignment at index ${idx}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
