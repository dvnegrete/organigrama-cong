export interface Person {
  id: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  personId: string;
  departmentId: string;
  createdAt: Date;
}

export interface PersonWithDepartments extends Person {
  departmentIds: string[];
  isAssigned: boolean;
}

export interface DepartmentWithPeople extends Department {
  people: Person[];
  personCount: number;
}

export type DragItem =
  | { type: 'person'; person: Person }
  | { type: 'department'; department: Department };
