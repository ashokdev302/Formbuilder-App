import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroupService, type FormElement, type FormGroup as FieldGroup } from '../../services/form-group.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    CheckboxModule,
    RadioButtonModule,
    FileUploadModule,
    TextareaModule,
    ButtonModule
  ],
  providers: [MessageService],
  template: `
    <div class="p-4">
      @if (selectedGroup$ | async; as group) {
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold">{{ group.name }}</h2>
            @if (group.description) {
              <p class="text-gray-600 mt-1">{{ group.description }}</p>
            }
          </div>

          <form [formGroup]="previewForm" class="space-y-4">
            @for (element of group.elements; track element.id) {
              <div class="space-y-2">
                <label [for]="'field-' + element.id" class="block font-medium text-sm">
                  {{ element.label }}
                  @if (element.required) {
                    <span class="text-red-500">*</span>
                  }
                </label>

                @switch (element.type) {
                  @case ('single-line-text') {
                    <input
                      pInputText
                      [id]="'field-' + element.id"
                      [formControlName]="'field-' + element.id"
                      [placeholder]="element.placeholder || ''"
                      class="w-full"
                    />
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                    @if (previewForm.get('field-' + element.id)?.errors?.['email'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">Please enter a valid email address</small>
                    }
                  }
                  @case ('multi-line-text') {
                    <textarea
                      pInputTextarea
                      [id]="'field-' + element.id"
                      [formControlName]="'field-' + element.id"
                      [placeholder]="element.placeholder || ''"
                      class="w-full"
                    ></textarea>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('integer') {
                    <p-inputNumber
                      [id]="'field-' + element.id"
                      [formControlName]="'field-' + element.id"
                      [placeholder]="element.placeholder || ''"
                      class="w-full"
                    ></p-inputNumber>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('date') {
                    <p-calendar
                      [id]="'field-' + element.id"
                      [formControlName]="'field-' + element.id"
                      [placeholder]="element.placeholder || ''"
                      class="w-full"
                    ></p-calendar>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('time') {
                    <p-calendar
                      [id]="'field-' + element.id"
                      [formControlName]="'field-' + element.id"
                      [showTime]="true"
                      [showSeconds]="false"
                      [placeholder]="element.placeholder || ''"
                      class="w-full"
                    ></p-calendar>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('datetime') {
                    <p-calendar
                      [id]="'field-' + element.id"
                      [formControlName]="'field-' + element.id"
                      [showTime]="true"
                      [showSeconds]="true"
                      [placeholder]="element.placeholder || ''"
                      class="w-full"
                    ></p-calendar>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('dropdown') {
                    <p-dropdown
                      [id]="'field-' + element.id"
                      [formControlName]="'field-' + element.id"
                      [options]="element.options || []"
                      [placeholder]="element.placeholder || 'Select an option'"
                      class="w-full"
                    ></p-dropdown>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('single-selection') {
                    <div class="space-y-2">
                      @for (option of element.options || []; track option) {
                        <div class="flex items-center">
                          <p-radioButton
                            [id]="'field-' + element.id + '-' + option"
                            [formControlName]="'field-' + element.id"
                            [value]="option"
                          ></p-radioButton>
                          <label [for]="'field-' + element.id + '-' + option" class="ml-2">
                            {{ option }}
                          </label>
                        </div>
                      }
                    </div>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('multi-selection') {
                    <div class="space-y-2">
                      @for (option of element.options || []; track option) {
                        <div class="flex items-center">
                          <p-checkbox
                            [id]="'field-' + element.id + '-' + option"
                            [formControlName]="'field-' + element.id"
                            [value]="option"
                          ></p-checkbox>
                          <label [for]="'field-' + element.id + '-' + option" class="ml-2">
                            {{ option }}
                          </label>
                        </div>
                      }
                    </div>
                    @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                      <small class="text-red-500 text-xs">This field is required</small>
                    }
                  }
                  @case ('upload') {
                    <div class="space-y-2">
                      <p-fileUpload
                        [id]="'field-' + element.id"
                        mode="basic"
                        [name]="'file-' + element.id"
                        accept="image/*"
                        [maxFileSize]="1000000"
                        [auto]="true"
                        [chooseLabel]="element.placeholder || 'Browse'"
                        (onSelect)="onFileSelect($event, element.id)"
                        class="w-full"
                      ></p-fileUpload>

                      @if (previewForm.get('field-' + element.id)?.value) {
                        <div class="mt-2 relative">
                          <img
                            [src]="getImagePreview(element.id)"
                            alt="Preview"
                            class="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            (click)="clearImage(element.id)"
                          >
                            <i class="bi bi-x"></i>
                          </button>
                        </div>
                      }
                      @if (previewForm.get('field-' + element.id)?.errors?.['required'] && previewForm.get('field-' + element.id)?.touched) {
                        <small class="text-red-500 text-xs">This field is required</small>
                      }
                    </div>
                  }
                }
              </div>
            }

            <div class="flex justify-end">
              <p-button
                label="Submit"
                (click)="onSubmit()"
                [disabled]="!previewForm.valid"
              ></p-button>
            </div>
          </form>
        </div>
      } @else {
        <div class="text-center text-gray-500 py-8">
          Select a form group to preview
        </div>
      }
    </div>
  `
})
export class PreviewComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private formGroupService = inject(FormGroupService);
  private messageService = inject(MessageService);
  private http = inject(HttpClient);

  selectedGroup$ = this.formGroupService.selectedGroup$;
  previewForm: FormGroup;
  private previewUrls: { [key: string]: string } = {};

  constructor() {
    this.previewForm = this.fb.group({});
  }

  ngOnInit() {
    this.selectedGroup$.subscribe(group => {
      if (group) {
        this.createForm(group);
      }
    });
  }

  onFileSelect(event: any, elementId: number) {
    console.log('File selected:', event);
    const file = event.files[0];
    if (file) {
      if (this.previewUrls[elementId]) {
        URL.revokeObjectURL(this.previewUrls[elementId]);
      }

      this.previewUrls[elementId] = URL.createObjectURL(file);

      this.previewForm.patchValue({
        ['field-' + elementId]: file
      });
      console.log('Form value after selection:', this.previewForm.value);
    }
  }

  getImagePreview(elementId: number): string {
    return this.previewUrls[elementId] || '';
  }

  ngOnDestroy() {
    Object.values(this.previewUrls).forEach(url => {
      URL.revokeObjectURL(url);
    });
  }

  private createForm(group: FieldGroup) {
    const formControls: { [key: string]: any } = {};

    group.elements.forEach(element => {
      const validators = element.required ? [Validators.required] : [];

      // Add email validation if the placeholder contains 'email' or 'e-mail'
      if (element.placeholder?.toLowerCase().includes('email') ||
          element.placeholder?.toLowerCase().includes('e-mail') ||
          element.label?.toLowerCase().includes('email') ||
          element.label?.toLowerCase().includes('e-mail')) {
        validators.push(Validators.email);
      }

      let defaultValue: any = null;

      switch (element.type) {
        case 'multi-selection':
          defaultValue = [];
          break;
        case 'integer':
          defaultValue = null;
          break;
        case 'date':
        case 'time':
        case 'datetime':
          defaultValue = null;
          break;
        case 'upload':
          defaultValue = null;
          break;
        default:
          defaultValue = '';
      }

      formControls['field-' + element.id] = [defaultValue, validators];
    });

    this.previewForm = this.fb.group(formControls);
  }

  onSubmit() {
    if (this.previewForm.valid) {
      console.log('Form submitted:', this.previewForm.value);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Form submitted successfully'
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.previewForm.controls).forEach(key => {
        const control = this.previewForm.get(key);
        control?.markAsTouched();
      });

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields correctly'
      });
    }
  }

  clearImage(elementId: number) {
    if (this.previewUrls[elementId]) {
      URL.revokeObjectURL(this.previewUrls[elementId]);
      delete this.previewUrls[elementId];
    }

    this.previewForm.patchValue({
      ['field-' + elementId]: null
    });
  }
}
