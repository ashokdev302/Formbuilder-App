import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormElement as GroupElement, FormGroup as FieldGroup } from '../../services/form-group.service';
import { TextareaModule } from 'primeng/textarea';
import { FormGroupService } from '../../services/form-group.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-element-editor',
  templateUrl: './element-editor.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    DrawerModule,
    DropdownModule,
    FileUploadModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
    RadioButtonModule,
    TitleCasePipe
  ]
})
export class ElementEditorComponent {
  visible = input(false);
  element = input<GroupElement | null>(null);
  group = input<FieldGroup | null>(null);
  visibleChange = output<boolean>();
  cancel = output<void>();

  selectionOptions = signal<Array<{label: string, value: string}>>([]);
  newOption = signal<{label: string, value: string}>({ label: '', value: '' });
  today = new Date();

  elementForm:any;
  formGroup:any;
  isSubmitted = signal(false);

  constructor(
    private fb: FormBuilder,
    private formGroupService: FormGroupService
  ) {
    this.elementForm = this.fb.group({
      label: ['', Validators.required],
      required: [false],
      placeholder: [''],
      defaultValue: [null]
    });

    this.formGroup = this.fb.group({
      groupName: [this.group()?.name, Validators.required],
      groupDescription: [this.group()?.description]
    });

    effect(() => {
      const currentElement = this.element();
      if (currentElement) {
        this.elementForm.patchValue({
          label: currentElement.label,
          required: currentElement.required,
          placeholder: currentElement.placeholder || '',
          defaultValue: currentElement.defaultValue || null
        });
        if (currentElement.type === 'dropdown') {
          this.selectionOptions.set((currentElement.options || []).map(opt => ({
            label: opt,
            value: opt
          })));
        } else {
          this.selectionOptions.set((currentElement.options || []).map(opt => ({
            label: opt,
            value: opt
          })));
        }
      }

      const currentGroup = this.group();
      if (currentGroup) {
        this.formGroup.patchValue({
          groupName: currentGroup.name,
          groupDescription: currentGroup.description || ''
        });
      }
    });
  }

  onVisibleChange(isVisible: boolean): void {
    this.visibleChange.emit(isVisible);
    if (!isVisible) {
      this.onCancel();
    }
  }

  onOptionLabelInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newOption.update(current => ({ ...current, label: input.value }));
  }

  onOptionValueInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newOption.update(current => ({ ...current, value: input.value }));
  }

  addOption(): void {
    const currentOption = this.newOption();
    if (currentOption.label.trim() && currentOption.value.trim()) {
      const newOption = {
        label: currentOption.label.trim(),
        value: currentOption.value.trim()
      };
      this.selectionOptions.update(options => [...options, newOption]);
      this.newOption.set({ label: '', value: '' });

      if (this.element()?.type === 'dropdown') {
        this.elementForm.patchValue({
          defaultValue: newOption.value
        });
      }
    }
  }

  removeOption(index: number): void {
    this.selectionOptions.update(options => {
      const newOptions = options.filter((_, i) => i !== index);

      const removedOption = options[index];
      if (this.elementForm.get('defaultValue').value === removedOption.value) {
        this.elementForm.patchValue({
          defaultValue: null
        });
      }

      return newOptions;
    });
  }

  async onSave(): Promise<void> {
    if(this.group()){
      if(this.formGroup.valid){
        const updatedGroup: FieldGroup = {
          ...this.group()!,
          name: this.formGroup.value.groupName,
          description: this.formGroup.value.groupDescription
        };
        console.log('Calling updateGroup with:', updatedGroup);
        this.formGroupService.updateGroup(updatedGroup);
        this.visibleChange.emit(false);
      }
      this.isSubmitted.set(true);
      return;
    }

    if (this.elementForm.valid && this.element()) {
      try {
        const formValue = this.elementForm.value;
        console.log('Form value:', formValue);

        const currentElement = this.element()!;
        console.log('Current element:', currentElement);

        const updatedElement: GroupElement = {
          ...currentElement,
          label: formValue.label,
          required: formValue.required,
          placeholder: formValue.placeholder || '',
          defaultValue: formValue.defaultValue,
          options: currentElement.type === 'dropdown' || currentElement.type.includes('selection')
            ? this.selectionOptions().map(opt => opt.value)
            : undefined
        };
        console.log('Updated element:', updatedElement);

        const currentGroup = await firstValueFrom(this.formGroupService.selectedGroup$);
        if (currentGroup) {
          console.log('Current group:', currentGroup);

          const updatedElements = currentGroup.elements.map(element => {
            if (element.id === updatedElement.id) {
              console.log('Found matching element to update:', element);
              return updatedElement;
            }
            return element;
          });

          const updatedGroup: FieldGroup = {
            ...currentGroup,
            elements: updatedElements
          };

          console.log('Final updated group:', updatedGroup);
          console.log('Calling updateGroup with:', updatedGroup);

          this.formGroupService.updateGroup(updatedGroup);
        } else {
          console.log('No current group found in service');
        }

        this.visibleChange.emit(false);
      } catch (error) {
        console.error('Error saving element:', error);
      }
    } else {
      console.log('Conditions not met for element update');
    }
  }

  onCancel(): void {
    this.elementForm.reset();
    this.selectionOptions.set([]);
    this.newOption.set({ label: '', value: '' });
    this.cancel.emit();
  }
}
