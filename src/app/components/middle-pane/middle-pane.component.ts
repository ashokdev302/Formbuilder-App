import { Component, inject, signal } from '@angular/core';
import { FormGroupService, type FormElement, type FormGroup } from '../../services/form-group.service';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ElementEditorComponent } from '../element-editor/element-editor.component';
import { PreviewComponent } from '../preview/preview.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-middle-pane',
  standalone: true,
  imports: [
    AsyncPipe,
    TitleCasePipe,
    ButtonModule,
    DialogModule,
    ElementEditorComponent,
    PreviewComponent
  ],
  providers: [DialogService, MessageService],
  templateUrl: './middle-pane.component.html'
})
export class MiddlePaneComponent {
  formGroupService = inject(FormGroupService);
  messageService = inject(MessageService);

  private draggedElement: FormElement | null = null;
  draggedOverElement: FormElement | null = null;
  showEditor = false;
  selectedGroup = signal<FormGroup | null>(null);
  confirmDialogVisible = false;
  itemToDelete: { groupId: number; elementId?: number } | null = null;
  currentElement: FormElement | null = null;
  isPreviewMode = signal(false);

  togglePreview() {
    this.isPreviewMode.update(mode => !mode);
  }

  editGroup(group: FormGroup) {
    this.formGroupService.selectGroup(group);
    this.showEditor = true;
    this.selectedGroup.set(group);
  }

  async duplicateGroup(group: FormGroup) {
    const newGroup: FormGroup = {
      ...group,
      id: Date.now(),
      name: `${group.name} (Copy)`,
      elements: group.elements.map(element => ({
        ...element,
        id: Date.now() + Math.floor(Math.random() * 1000)
      }))
    };
    this.formGroupService.addGroup(newGroup);
  }

  deleteGroup(group: FormGroup) {
    this.itemToDelete = { groupId: group.id };
    this.confirmDialogVisible = true;
  }

  editElement(groupId: number, element: FormElement) {
    this.currentElement = element;
    this.showEditor = true;
  }

  deleteElement(groupId: number, elementId: number) {
    this.itemToDelete = { groupId, elementId };
    this.confirmDialogVisible = true;
  }

  confirmDelete() {
    if (this.itemToDelete) {
      if (this.itemToDelete.elementId) {
        this.formGroupService.deleteElementFromGroup(
          this.itemToDelete.groupId,
          this.itemToDelete.elementId
        );

        firstValueFrom(this.formGroupService.formGroups$).then(groups => {
          const group = groups.find(g => g.id === this.itemToDelete?.groupId);
          if (group) {
            this.formGroupService.selectGroup(group);
          }
        });
      } else {
        this.formGroupService.deleteGroup(this.itemToDelete.groupId);
      }
    }
    this.confirmDialogVisible = false;
    this.itemToDelete = null;
  }

  cancelDelete() {
    this.confirmDialogVisible = false;
    this.itemToDelete = null;
  }

  onDragOver(event: DragEvent) {
    if (this.isPreviewMode()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
  }

  async onDrop(event: DragEvent) {
    if (this.isPreviewMode()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    if (!event.dataTransfer) return;

    try {
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      const selectedGroup = await firstValueFrom(this.formGroupService.selectedGroup$);

      if (selectedGroup) {
        const newElement: FormElement = {
          id: Date.now(),
          type: data.type,
          label: data.label,
          required: false
        };

        this.formGroupService.addElementToGroup(selectedGroup.id, newElement);
      }
    } catch (error) {
      console.error('Error processing dropped element:', error);
    }
  }

  onElementDragStart(event: DragEvent, element: FormElement) {
    if (this.isPreviewMode()) {
      event.preventDefault();
      return;
    }
    this.draggedElement = element;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', element.id.toString());
    }
  }

  onElementDragEnter(event: DragEvent, element: FormElement) {
    if (this.isPreviewMode()) {
      event.preventDefault();
      return;
    }
    if (this.draggedElement?.id !== element.id) {
      this.draggedOverElement = element;
    }
  }

  onElementDragOver(event: DragEvent) {
    if (this.isPreviewMode()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  onElementDragLeave(event: DragEvent) {
    if (this.isPreviewMode()) {
      event.preventDefault();
      return;
    }
    const target = event.target as HTMLElement;
    if (!target.contains(event.relatedTarget as Node)) {
      this.draggedOverElement = null;
    }
  }

  async onElementDrop(event: DragEvent, targetElement: FormElement) {
    if (this.isPreviewMode()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.draggedOverElement = null;

    if (!this.draggedElement || this.draggedElement.id === targetElement.id) return;

    const selectedGroup = await firstValueFrom(this.formGroupService.selectedGroup$);
    if (!selectedGroup) return;

    const elements = [...selectedGroup.elements];
    const draggedIndex = elements.findIndex(e => e.id === this.draggedElement?.id);
    const targetIndex = elements.findIndex(e => e.id === targetElement.id);

    elements.splice(draggedIndex, 1);
    elements.splice(targetIndex, 0, this.draggedElement);

    this.formGroupService.updateGroup({
      ...selectedGroup,
      elements
    });

    const updatedGroup = (await firstValueFrom(this.formGroupService.formGroups$))
      .find(g => g.id === selectedGroup.id);

    if (updatedGroup) {
      this.formGroupService.selectGroup(updatedGroup);
    }

    this.draggedElement = null;
  }

  async exportConfiguration() {
    try {
      const formGroups = await firstValueFrom(this.formGroupService.formGroups$);
      const configuration = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        formGroups
      };

      const blob = new Blob([JSON.stringify(configuration, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-configuration-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Form configuration exported successfully'
      });
    } catch (error) {
      console.error('Error exporting configuration:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to export form configuration'
      });
    }
  }

  importConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const configuration = JSON.parse(e.target?.result as string);

            // Validate configuration format
            if (!configuration.version || !configuration.formGroups || !Array.isArray(configuration.formGroups)) {
              throw new Error('Invalid configuration format');
            }

            // Update form groups
            this.formGroupService.updateFormGroups(configuration.formGroups);

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Form configuration imported successfully'
            });
          } catch (error) {
            console.error('Error parsing configuration:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Invalid configuration file format'
            });
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Error reading file:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to read configuration file'
        });
      }
    };
    input.click();
  }
}
