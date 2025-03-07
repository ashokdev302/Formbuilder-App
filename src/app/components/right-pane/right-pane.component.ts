import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ElementCategory {
  name: string;
  elements: {
    type: string;
    label: string;
    description: string;
    icon: string;
  }[];
}

@Component({
  selector: 'app-right-pane',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './right-pane.component.html',
  styleUrl: './right-pane.component.css'
})
export class RightPaneComponent {
  searchQuery = signal('');

  categories: ElementCategory[] = [
    {
      name: 'TEXT',
      elements: [
        {
          type: 'single-line-text',
          label: 'Single Line Text',
          description: 'Single text area',
          icon: 'bi bi-input-cursor-text'
        },
        {
          type: 'multi-line-text',
          label: 'Multi Line Text',
          description: 'Multi text area',
          icon: 'bi bi-text-paragraph'
        },
        {
          type: 'integer',
          label: 'Integer',
          description: 'Integer type area',
          icon: 'bi bi-123'
        }
      ]
    },
    {
      name: 'DATE',
      elements: [
        {
          type: 'date',
          label: 'Date',
          description: 'Select date from datepicker',
          icon: 'bi bi-calendar'
        },
        {
          type: 'time',
          label: 'Time',
          description: 'Select time from timepicker',
          icon: 'bi bi-clock'
        },
        {
          type: 'datetime',
          label: 'Date & Time',
          description: 'Select date & time from picker',
          icon: 'bi bi-calendar-clock'
        }
      ]
    },
    {
      name: 'MULTI',
      elements: [
        {
          type: 'single-selection',
          label: 'Single Selection',
          description: 'Select single option',
          icon: 'bi bi-record-circle'
        },
        {
          type: 'multi-selection',
          label: 'Multi Selection',
          description: 'Select multiple options',
          icon: 'bi bi-check-square'
        },
        {
          type: 'dropdown',
          label: 'Dropdown',
          description: 'Select options from dropdown',
          icon: 'bi bi-chevron-down'
        }
      ]
    },
    {
      name: 'MEDIA',
      elements: [
        {
          type: 'upload',
          label: 'Upload',
          description: 'Upload documents/media files',
          icon: 'bi bi-upload'
        }
      ]
    }
  ];

  filteredCategories = computed(() => {
    if (!this.searchQuery()) return this.categories;

    const query = this.searchQuery().toLowerCase();
    return this.categories
      .map(category => ({
        ...category,
        elements: category.elements.filter(element =>
          element.label.toLowerCase().includes(query) ||
          element.description.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.elements.length > 0);
  });

  onDragStart(event: DragEvent, element: { type: string; label: string }) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(element));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}
