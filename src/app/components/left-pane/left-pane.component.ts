import { Component, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { FormGroupService } from '../../services/form-group.service';
import { AsyncPipe } from '@angular/common';
import type { FormGroup } from '../../services/form-group.service';
import { firstValueFrom } from 'rxjs';

export type FormElementType =
  // Text Fields
  'single-line-text' |
  'multi-line-text' |
  // Date/Time Fields
  'date' |
  'time' |
  'datetime' |
  // Selection Fields
  'dropdown' |
  'single-selection' |
  'multi-selection' |
  // Media Fields
  'upload';

export interface FormElement {
  id: number;
  type: FormElementType;
  label: string;
  required: boolean;
  options?: string[]; // For selection fields
}

@Component({
  selector: 'app-left-pane',
  imports: [DialogModule, ButtonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  standalone: true,
  templateUrl: './left-pane.component.html',
  styleUrl: './left-pane.component.css'
})
export class LeftPaneComponent {
  private fb = inject(FormBuilder);
  private formGroupService = inject(FormGroupService);

  formGroups$ = this.formGroupService.formGroups$;
  selectedGroup$ = this.formGroupService.selectedGroup$;

  visible = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  dialogTitle = signal<string>('Add Field Group');

  newFormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  selectGroup(group: FormGroup) {
    this.formGroupService.selectGroup(group);
  }

  editGroup(group: FormGroup, event: Event) {
    event.stopPropagation();
    this.isEditing.set(true);
    this.dialogTitle.set('Edit Field Group');
    this.visible.set(true);
    this.newFormGroup.patchValue({
      name: group.name,
      description: group.description
    });
    this.formGroupService.selectGroup(group);
  }

  deleteGroup(group: FormGroup, event: Event) {
    event.stopPropagation();
    this.formGroupService.deleteGroup(group.id);
  }

  async saveFormGroup() {
    this.isSubmitted.set(true);
    if (this.newFormGroup.valid) {
      const formValue = this.newFormGroup.value;

      if (this.isEditing()) {
        const currentSelectedGroup = await firstValueFrom(this.selectedGroup$);
        if (currentSelectedGroup) {
          this.formGroupService.updateGroup({
            ...currentSelectedGroup,
            name: formValue.name as string,
            description: formValue.description as string
          });
        }
      } else {
        this.formGroupService.addGroup({
          name: formValue.name as string,
          description: formValue.description as string,
          elements: []
        });
      }

      this.resetForm();
    }
  }

  cancelFormGroup() {
    this.resetForm();
  }

  private resetForm() {
    this.visible.set(false);
    this.newFormGroup.reset();
    this.isSubmitted.set(false);
    this.isEditing.set(false);
    this.dialogTitle.set('Add Field Group');
  }

  // Method to add element to selected group
  async addElementToSelectedGroup(element: FormElement) {
    const currentSelectedGroup = await firstValueFrom(this.selectedGroup$);
    if (currentSelectedGroup) {
      this.formGroupService.addElementToGroup(currentSelectedGroup.id, element);
    }
  }
}
