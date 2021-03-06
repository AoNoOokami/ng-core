/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// import * as map from 'lodash-es/Map';
import cloneDeep from 'lodash.clonedeep';
import { addClasses, inArray } from 'angular6-json-schema-form';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit
  } from '@angular/core';
import { JsonSchemaFormService } from 'angular6-json-schema-form';

import { buildFormGroup, getLayoutNode, JsonPointer } from 'angular6-json-schema-form';
import { FormArray } from '@angular/forms';

/**
 * Bootstrap 4 framework for Angular JSON Schema Form.
 *
 */
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'bootstrap-4-framework',
  templateUrl: './bootstrap4-framework.component.html',
  styleUrls: ['./bootstrap4-framework.component.scss']
})
export class Bootstrap4FrameworkComponent implements OnInit, OnChanges {
  frameworkInitialized = false;
  widgetOptions: any; // Options passed to child widget
  widgetLayoutNode: any; // layoutNode passed to child widget
  options: any; // Options used in this framework
  formControl: any = null;
  debugOutput: any = '';
  debug: any = '';
  parentArray: any = null;
  isOrderable = false;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    public changeDetector: ChangeDetectorRef,
    public jsf: JsonSchemaFormService
  ) { }

  get showRemoveButton(): boolean {
    if (!this.options.removable || this.options.readonly ||
      this.layoutNode.type === '$ref'
    ) { return false; }
    if (this.layoutNode.recursiveReference) { return true; }
    if (!this.layoutNode.arrayItem || !this.parentArray) { return false; }
    // If array length <= minItems, don't allow removing any items
    return this.parentArray.items.length - 1 <= this.parentArray.options.minItems ? false :
      // For removable list items, allow removing any item
      this.layoutNode.arrayItemType === 'list' ? true :
        // For removable tuple items, only allow removing last item in list
        this.layoutIndex[this.layoutIndex.length - 1] === this.parentArray.items.length - 2;
  }

  ngOnInit() {
    this.initializeFramework();
    if (this.layoutNode.arrayItem && this.layoutNode.type !== '$ref') {
      this.parentArray = this.jsf.getParentNode(this);
      if (this.parentArray) {
        this.isOrderable = this.layoutNode.arrayItemType === 'list' &&
          !this.options.readonly && this.parentArray.options.orderable;
      }
    }
  }

  public get show() {
    if (!('show' in this.layoutNode.options) || this.layoutNode.options.show === true) {
      return true;
    }
    return false;
  }

  ngOnChanges() {
    if (!this.frameworkInitialized) { this.initializeFramework(); }
  }

  initializeFramework() {
    if (this.layoutNode) {
      this.options = cloneDeep(this.layoutNode.options);
      this.widgetLayoutNode = {
        ...this.layoutNode,
        options: cloneDeep(this.layoutNode.options)
      };
      this.widgetOptions = this.widgetLayoutNode.options;
      this.formControl = this.jsf.getFormControl(this);

      this.options.isInputWidget = inArray(this.layoutNode.type, [
        'button', 'checkbox', 'checkboxes-inline', 'checkboxes', 'color',
        'date', 'datetime-local', 'datetime', 'email', 'file', 'hidden',
        'image', 'integer', 'month', 'number', 'password', 'radio',
        'radiobuttons', 'radios-inline', 'radios', 'range', 'reset', 'search',
        'select', 'submit', 'tel', 'text', 'textarea', 'time', 'url', 'week'
      ]);

      this.options.title = this.setTitle();

      this.options.htmlClass =
        addClasses(this.options.htmlClass, 'schema-form-' + this.layoutNode.type);
      this.options.htmlClass =
        this.layoutNode.type === 'array' ?
          addClasses(this.options.htmlClass, 'list-group') :
          this.layoutNode.arrayItem && this.layoutNode.type !== '$ref' ?
            addClasses(this.options.htmlClass, 'list-group-item') :
            addClasses(this.options.htmlClass, 'form-group');
      this.widgetOptions.htmlClass = '';
      this.options.labelHtmlClass =
        addClasses(this.options.labelHtmlClass, 'control-label');
      this.widgetOptions.activeClass =
        addClasses(this.widgetOptions.activeClass, 'active');
      this.options.fieldAddonLeft =
        this.options.fieldAddonLeft || this.options.prepend;
      this.options.fieldAddonRight =
        this.options.fieldAddonRight || this.options.append;

      // Add asterisk to titles if required
      if (this.options.title && this.layoutNode.type !== 'tab' &&
        !this.options.notitle && this.options.required  &&
        !this.options.title.includes('*')
      ) {
        this.options.title += ' <strong class="text-danger">*</strong>';
      }
      // Set miscelaneous styles and settings for each control type
      switch (this.layoutNode.type) {
        // Checkbox controls
        case 'checkbox': case 'checkboxes':
        this.widgetOptions.htmlClass = addClasses(
          this.widgetOptions.htmlClass, 'checkbox');
        break;
        case 'checkboxes-inline':
          this.widgetOptions.htmlClass = addClasses(
            this.widgetOptions.htmlClass, 'checkbox');
          this.widgetOptions.itemLabelHtmlClass = addClasses(
            this.widgetOptions.itemLabelHtmlClass, 'checkbox-inline');
          break;
        // Radio controls
        case 'radio': case 'radios':
        this.widgetOptions.htmlClass = addClasses(
          this.widgetOptions.htmlClass, 'radio');
        break;
        case 'radios-inline':
          this.widgetOptions.htmlClass = addClasses(
            this.widgetOptions.htmlClass, 'radio');
          this.widgetOptions.itemLabelHtmlClass = addClasses(
            this.widgetOptions.itemLabelHtmlClass, 'radio-inline');
          break;
        // Button sets - checkboxbuttons and radiobuttons
        case 'checkboxbuttons': case 'radiobuttons':
          this.widgetOptions.htmlClass = addClasses(
            this.widgetOptions.htmlClass, 'btn-group');
          this.widgetOptions.itemLabelHtmlClass = addClasses(
            this.widgetOptions.itemLabelHtmlClass, 'btn');
          this.widgetOptions.itemLabelHtmlClass = addClasses(
            this.widgetOptions.itemLabelHtmlClass, this.options.style || 'btn-default');
          this.widgetOptions.fieldHtmlClass = addClasses(
            this.widgetOptions.fieldHtmlClass, 'sr-only');
          break;
        // Single button controls
        case 'button': case 'submit':
          this.widgetOptions.fieldHtmlClass = addClasses(
            this.widgetOptions.fieldHtmlClass, 'btn');
          this.widgetOptions.fieldHtmlClass = addClasses(
            this.widgetOptions.fieldHtmlClass, this.options.style || 'btn-info');
          break;
        // Containers - arrays and fieldsets
        case 'array': case 'fieldset': case 'section': case 'conditional':
        case 'advancedfieldset': case 'authfieldset':
        case 'selectfieldset': case 'optionfieldset':
          this.options.messageLocation = 'top';
          break;
        case 'tabarray': case 'tabs':
          this.widgetOptions.htmlClass = addClasses(
            this.widgetOptions.htmlClass, 'tab-content');
          this.widgetOptions.fieldHtmlClass = addClasses(
            this.widgetOptions.fieldHtmlClass, 'tab-pane');
          this.widgetOptions.labelHtmlClass = addClasses(
            this.widgetOptions.labelHtmlClass, 'nav nav-tabs');
          break;
        // 'Add' buttons - references
        case '$ref':
          this.widgetOptions.fieldHtmlClass = addClasses(
            this.widgetOptions.fieldHtmlClass, 'btn pull-right');
          this.widgetOptions.fieldHtmlClass = addClasses(
            this.widgetOptions.fieldHtmlClass, this.options.style || 'btn-default');
          this.options.icon = 'glyphicon glyphicon-plus';
          break;
        // Default - including regular inputs
        default:
          this.widgetOptions.fieldHtmlClass = addClasses(
            this.widgetOptions.fieldHtmlClass, 'form-control');
      }

      if (this.formControl) {
        this.updateHelpBlock(this.formControl.status);
        this.formControl.statusChanges.subscribe(status => this.updateHelpBlock(status));

        // if (this.options.debug) {
        //   const vars: any[] = [];
        //   this.debugOutput = map(vars, thisVar => JSON.stringify(thisVar, null, 2)).join('\n');
        // }
      }
      this.frameworkInitialized = true;
    }

  }

  updateHelpBlock(status) {
    this.options.helpBlock = status === 'INVALID' &&
      this.options.enableErrorState && this.formControl.errors &&
      (this.formControl.dirty || this.options.feedbackOnRender) ?
        this.jsf.formatErrors(this.formControl.errors, this.options.validationMessages) :
        this.options.description || this.options.help || null;
  }

  setTitle(): string {
    switch (this.layoutNode.type) {
      case 'button': case 'checkbox': case 'section': case 'help': case 'msg':
      case 'submit': case 'message': case 'tabarray': case 'tabs': case '$ref':
        return null;
      case 'advancedfieldset':
        this.widgetOptions.expandable = true;
        this.widgetOptions.title = 'Advanced options';
        return null;
      case 'authfieldset':
        this.widgetOptions.expandable = true;
        this.widgetOptions.title = 'Authentication settings';
        return null;
      case 'fieldset':
        this.widgetOptions.title = this.options.title;
        return null;
      default:
        this.widgetOptions.title = null;
        return this.jsf.setItemTitle(this);
    }
  }

  removeItem(event) {
    event.preventDefault();
    this.jsf.removeItem(this);
  }

  get canAddItem(): boolean {
    const parent = this.jsf.getParentNode(this);
    return parent.type === 'array' && parent.items.length < parent.options.maxItems + 1;
  }

  addItem(event) {
    event.preventDefault();
    const newFormGroup = buildFormGroup(this.jsf.templateRefLibrary[this.layoutNode.dataPointer]);

    // Add the new form control to the parent formArray or formGroup
    if (!this.layoutNode.arrayItem) { // Add new array item to formArray
      return false;
    }
    const parentFormArray = (this.jsf.getFormControlGroup(this) as FormArray);
    parentFormArray.push(newFormGroup);

    // // Copy a new layoutNode from layoutRefLibrary
    const refNode = {$ref: this.layoutNode.dataPointer};
    const newLayoutNode = getLayoutNode(refNode, this.jsf);
    newLayoutNode.arrayItem = this.layoutNode.arrayItem;
    if (this.layoutNode.arrayItemType) {
      newLayoutNode.arrayItemType = this.layoutNode.arrayItemType;
    } else {
      delete newLayoutNode.arrayItemType;
    }
    // Add the new layoutNode to the form layout at the end
    const layoutIndex =  Object.assign([], this.layoutIndex);
    layoutIndex[layoutIndex.length - 1] = parentFormArray.length - 1;
    const index = '/' + layoutIndex.join('/items/');
    JsonPointer.insert(this.jsf.layout, index, newLayoutNode);
    return true;
  }
}
