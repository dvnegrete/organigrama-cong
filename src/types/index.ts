export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface Person {
  id: string;
  workspaceId: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  workspaceId: string;
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
  workspaceId: string;
  personId: string;
  departmentId: string;
  order: number;
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
