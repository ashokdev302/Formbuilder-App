import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FormElement {
  id: number;
  type: FormElementType;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: any;
}

export type FormElementType =
  | 'single-line-text'
  | 'multi-line-text'
  | 'integer'
  | 'date'
  | 'time'
  | 'datetime'
  | 'dropdown'
  | 'single-selection'
  | 'multi-selection'
  | 'upload';

export interface FormGroup {
  name: string;
  description: string;
  elements: FormElement[];
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormGroupService {
  private readonly STORAGE_KEY = 'formGroups';
  private readonly SELECTED_GROUP_KEY = 'selectedGroup';
  private formGroups = new BehaviorSubject<FormGroup[]>(this.loadFromStorage());
  private selectedGroup = new BehaviorSubject<FormGroup | null>(this.loadSelectedGroup());

  private loadFromStorage(): FormGroup[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  private saveToStorage(groups: FormGroup[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
  }

  private loadSelectedGroup(): FormGroup | null {
    const stored = localStorage.getItem(this.SELECTED_GROUP_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private saveSelectedGroup(group: FormGroup | null) {
    if (group) {
      localStorage.setItem(this.SELECTED_GROUP_KEY, JSON.stringify(group));
    } else {
      localStorage.removeItem(this.SELECTED_GROUP_KEY);
    }
  }

  formGroups$ = this.formGroups.asObservable();
  selectedGroup$ = this.selectedGroup.asObservable();

  constructor() {
    this.formGroups$.subscribe(groups => {
      this.saveToStorage(groups);
      const selectedGroup = this.selectedGroup.value;
      if (selectedGroup) {
        const updatedGroup = groups.find(g => g.id === selectedGroup.id);
        if (updatedGroup) {
          this.selectGroup(updatedGroup);
        } else {
          this.selectGroup(null);
        }
      }
    });
  }

  selectGroup(group: FormGroup | null) {
    this.selectedGroup.next(group);
    this.saveSelectedGroup(group);
  }

  addGroup(group: Omit<FormGroup, 'id'>) {
    const currentGroups = this.formGroups.value;
    const newGroup = {
      ...group,
      id: currentGroups.length + 1
    };
    this.formGroups.next([...currentGroups, newGroup]);
  }

  updateElement(groupId: number, updatedElement: FormElement) {
    const currentGroups = this.formGroups.value;
    this.formGroups.next(
      currentGroups.map(group =>
        group.id === groupId
          ? {
              ...group,
              elements: group.elements.map(element =>
                element.id === updatedElement.id ? updatedElement : element
              )
            }
          : group
      )
    );
  }

  updateGroup(updatedGroup: FormGroup) {
    const currentGroups = this.formGroups.value;

    const updatedGroups = currentGroups.map(group =>
      group.id === updatedGroup.id ? updatedGroup : group
    );

    this.formGroups.next(updatedGroups);

    if (this.selectedGroup.value?.id === updatedGroup.id) {
      this.selectedGroup.next(updatedGroup);
    }
  }

  updateFormGroups(newGroups: FormGroup[]) {
    if (!Array.isArray(newGroups)) {
      throw new Error('Invalid form groups data');
    }
    this.formGroups.next(newGroups);
    this.selectedGroup.next(null);
  }

  deleteGroup(groupId: number) {
    const currentGroups = this.formGroups.value;
    this.formGroups.next(currentGroups.filter(group => group.id !== groupId));

    if (this.selectedGroup.value?.id === groupId) {
      this.selectedGroup.next(null);
    }
  }

  addElementToGroup(groupId: number, element: FormElement) {
    const currentGroups = this.formGroups.value;
    const updatedGroups = currentGroups.map(group =>
      group.id === groupId
        ? { ...group, elements: [...group.elements, element] }
        : group
    );

    this.formGroups.next(updatedGroups);

    if (this.selectedGroup.value?.id === groupId) {
      const updatedGroup = updatedGroups.find(g => g.id === groupId);
      if (updatedGroup) {
        this.selectedGroup.next(updatedGroup);
      }
    }
  }

  deleteElementFromGroup(groupId: number, elementId: number) {
    const currentGroups = this.formGroups.value;
    const updatedGroups = currentGroups.map(group =>
      group.id === groupId
        ? { ...group, elements: group.elements.filter(e => e.id !== elementId) }
        : group
    );

    this.formGroups.next(updatedGroups);

    if (this.selectedGroup.value?.id === groupId) {
      const updatedGroup = updatedGroups.find(g => g.id === groupId);
      if (updatedGroup) {
        this.selectedGroup.next(updatedGroup);
      }
    }
  }

  editGroup(group: FormGroup) {

    this.selectGroup(group);
  }
}
