export type DependencyType = 'npm' | 'pip';

export interface Dependency {
    name: string;
    version: string;
    type: DependencyType;
} 