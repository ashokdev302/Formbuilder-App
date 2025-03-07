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
  private formGroups = new BehaviorSubject<FormGroup[]>([
    {id: 1, name: "Group 1", description: "Description 1", elements: []},
    {id: 2, name: "Group 2", description: "Description 2", elements: []},
    {id: 3, name: "Group 3", description: "Description 3", elements: []}
  ]);

  private selectedGroup = new BehaviorSubject<FormGroup | null>(null);

  formGroups$ = this.formGroups.asObservable();
  selectedGroup$ = this.selectedGroup.asObservable();

  selectGroup(group: FormGroup) {
    this.selectedGroup.next(group);
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

    // Update selected group if it's the one being modified
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

    // Update selected group if it's the one being modified
    if (this.selectedGroup.value?.id === groupId) {
      const updatedGroup = updatedGroups.find(g => g.id === groupId);
      if (updatedGroup) {
        this.selectedGroup.next(updatedGroup);
      }
    }
  }

  editGroup(group: FormGroup) {
    // This is just a signal to the left-pane component to open its dialog
    // The actual update will be done through updateGroup
    this.selectGroup(group);
  }
}
