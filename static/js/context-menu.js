/**
 * Context Menu.
 *
 * A menu of functions to perform on a Thing.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';

const API = require('./api');
const page = require('./lib/page');
const Utils = require('./utils');

// eslint-disable-next-line no-unused-vars
const ContextMenu = {

  /**
   * Initialise Add Thing Screen.
   */
  init: function() {
    this.element = document.getElementById('context-menu');
    this.editContent = document.getElementById('context-menu-content-edit');
    this.removeContent = document.getElementById('context-menu-content-remove');
    this.backButton = document.getElementById('context-menu-back-button');
    this.headingIcon = document.getElementById('context-menu-heading-icon');
    this.headingText = document.getElementById('context-menu-heading-text');
    this.saveButton = document.getElementById('edit-thing-save-button');
    this.thingIcon = document.getElementById('edit-thing-icon');
    this.nameInput = document.getElementById('edit-thing-name');
    this.thingType = document.getElementById('edit-thing-type');
    this.customIcon = document.getElementById('edit-thing-custom-icon');
    this.customIconLabel =
      document.getElementById('edit-thing-custom-icon-label');
    this.label = document.getElementById('edit-thing-label');
    this.removeButton = document.getElementById('remove-thing-button');
    this.logoutForm = document.getElementById('logout');
    this.thingUrl = '';

    // Add event listeners
    window.addEventListener('_contextmenu', this.show.bind(this));
    this.backButton.addEventListener('click', this.hide.bind(this));
    this.saveButton.addEventListener('click', this.handleEdit.bind(this));
    this.removeButton.addEventListener('click', this.handleRemove.bind(this));
    this.logoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      API.logout().then(() => {
        window.location.href = '/login';
      });
    });
    this.thingType.addEventListener('change', this.handleTypeChange.bind(this));
    this.customIcon.addEventListener('change',
                                     this.handleIconUpload.bind(this));
  },

  /**
   * Show Context Menu.
   */
  show: function(e) {
    this.iconData = null;
    this.headingIcon.src = e.detail.thingIcon;
    this.headingText.textContent = e.detail.thingName;
    this.thingUrl = e.detail.thingUrl;
    this.element.classList.remove('hidden');

    this.editContent.classList.add('hidden');
    this.removeContent.classList.add('hidden');

    switch (e.detail.action) {
      case 'edit': {
        this.customIconLabel.classList.add('hidden');
        this.nameInput.value = e.detail.thingName;
        this.thingType.innerHTML = '';
        this.thingIcon.style.backgroundImage = `url("${e.detail.thingIcon}")`;

        const capabilities = Utils.sortCapabilities(e.detail.capabilities);
        capabilities.push('Custom');

        for (const capability of capabilities) {
          const option = document.createElement('option');
          option.value = capability;

          if (e.detail.selectedCapability === capability) {
            option.selected = true;
            if (capability === 'Custom') {
              this.customIconLabel.classList.remove('hidden');
            }
          }

          switch (capability) {
            case 'OnOffSwitch':
              option.innerText = 'On/Off Switch';
              break;
            case 'MultiLevelSwitch':
              option.innerText = 'Multi Level Switch';
              break;
            case 'ColorControl':
              option.innerText = 'Color Control';
              break;
            case 'EnergyMonitor':
              option.innerText = 'Energy Monitor';
              break;
            case 'BinarySensor':
              option.innerText = 'Binary Sensor';
              break;
            case 'MultiLevelSensor':
              option.innerText = 'Multi Level Sensor';
              break;
            case 'SmartPlug':
              option.innerText = 'Smart Plug';
              break;
            case 'Light':
              option.innerText = 'Light';
              break;
            case 'Custom':
              option.innerText = 'Custom Thing';
              break;
            default:
              option.innerText = capability;
              break;
          }

          this.thingType.appendChild(option);
        }

        this.editContent.classList.remove('hidden');
        break;
      }
      case 'remove':
        this.removeContent.classList.remove('hidden');
        break;
    }
  },

  /**
   * Hide Context Menu.
   */
  hide: function() {
    this.element.classList.add('hidden');
    this.headingIcon.src = '#';
    this.headingText.textContent = '';
    this.thingUrl = '';
  },

  handleTypeChange: function() {
    const capability =
      this.thingType.options[this.thingType.selectedIndex].value;

    this.customIconLabel.classList.add('hidden');
    let image = '/optimized-images/thing-icons/thing.png';
    switch (capability) {
      case 'OnOffSwitch':
        image = '/optimized-images/thing-icons/on_off_switch.svg';
        break;
      case 'MultiLevelSwitch':
        image = '/optimized-images/thing-icons/multi_level_switch.svg';
        break;
      case 'ColorControl':
        image = '/optimized-images/thing-icons/color_control.svg';
        break;
      case 'EnergyMonitor':
        image = '/optimized-images/thing-icons/energy_monitor.svg';
        break;
      case 'BinarySensor':
        image = '/optimized-images/thing-icons/binary_sensor.svg';
        break;
      case 'MultiLevelSensor':
        image = '/optimized-images/thing-icons/multi_level_sensor.svg';
        break;
      case 'SmartPlug':
        image = '/optimized-images/thing-icons/smart_plug.svg';
        break;
      case 'Light':
        image = '/optimized-images/thing-icons/light.svg';
        break;
      case 'Custom':
        this.customIconLabel.classList.remove('hidden');
        break;
      default:
        break;
    }

    this.thingIcon.style.backgroundImage = `url("${image}")`;
  },

  handleIconUpload: function() {
    this.label.classList.add('hidden');

    if (this.customIcon.files.length === 0) {
      return;
    }

    const file = this.customIcon.files[0];
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      this.label.innerText = 'Invalid file.';
      this.label.classList.add('error');
      this.label.classList.remove('hidden');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (e.target.error) {
        console.error(e.target.error);
        this.label.innerText = 'Failed to read file.';
        this.label.classList.add('error');
        this.label.classList.remove('hidden');
        this.saveButton.disabled = false;
        return;
      }

      this.iconData = {
        mime: file.type,
        data: btoa(e.target.result),
      };
      this.saveButton.disabled = false;
    };

    this.saveButton.disabled = true;
    reader.readAsBinaryString(file);
  },

  /**
   * Handle click on edit option.
   */
  handleEdit: function() {
    this.saveButton.disabled = true;

    const name = this.nameInput.value.trim();
    if (name.length === 0) {
      return;
    }

    let capability;
    if (this.thingType.options.length > 0) {
      capability = this.thingType.options[this.thingType.selectedIndex].value;
    }

    const body = {name, selectedCapability: capability};

    if (capability === 'Custom' && this.iconData) {
      body.iconData = this.iconData;
    }

    fetch(this.thingUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${API.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((response) => {
      if (response.ok) {
        // reload the page to pick up capability changes
        window.location.reload();
        this.hide();
      } else {
        throw new Error(response.statusText);
      }
    }).catch((error) => {
      console.error(`Error updating thing: ${error}`);
      this.label.innerText = 'Failed to save.';
      this.label.classList.add('error');
      this.label.classList.remove('hidden');
      this.saveButton.disabled = false;
    });
  },

  /**
   * Handle click on remove option.
   */
  handleRemove: function() {
    fetch(this.thingUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${API.jwt}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (response.ok) {
        page('/things');
      } else {
        console.error(`Error removing thing: ${response.statusText}`);
      }
      this.hide();
    }).catch((error) => {
      console.error(`Error removing thing: ${error}`);
      this.hide();
    });
  },
};

module.exports = ContextMenu;
