// @ts-nocheck
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { customElement, } from 'https://cdn.skypack.dev/lit/decorators.js';
import { css, html, LitElement } from 'https://cdn.skypack.dev/lit';
function loadCSS(url) {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}
let SilentRemotesCard = class SilentRemotesCard extends LitElement {
    constructor() {
        super();
        this.iconSize = 25;
        this.pathToIcon = '/hacsfiles/silent-remotes-card/icons';
        this.remoteType = 'ac';
        this.acState = {
            fan: 'low',
            mode: 'cool',
            temperature: 23,
        };
    }
    static get properties() {
        return {
            hass: {},
            config: {},
            errorHappned: { type: Boolean },
            fullCommands: {},
            acState: {
                fan: 0,
                mode: 0,
                temperature: 23,
            },
        };
    }
    readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType('application/json');
        rawFile.open('GET', file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status == '200') {
                callback(rawFile.responseText);
            }
        };
        rawFile.send(null);
    }
    setConfig(config) {
        var _a, _b, _c;
        this.validateConfig(config);
        this.config = config;
        this.iconSize = (_a = config === null || config === void 0 ? void 0 : config.iconSize) !== null && _a !== void 0 ? _a : 25;
        this.theme = (_b = config === null || config === void 0 ? void 0 : config.theme) !== null && _b !== void 0 ? _b : 'light';
        this.title = config === null || config === void 0 ? void 0 : config.title;
        this.callServiceProps = config === null || config === void 0 ? void 0 : config.callServiceProps;
        this.remoteType = (_c = config === null || config === void 0 ? void 0 : config.remoteType) !== null && _c !== void 0 ? _c : 'tv';
        this.entity = config === null || config === void 0 ? void 0 : config.entity;
        if (this.remoteType === 'ac') {
            this.readAcFromLocalStorage();
        }
        if (!this.entity) {
            this.readTextFile(this.config.commandsFilePath, (text) => {
                var _a, _b;
                const data = JSON.parse(text);
                this.fullCommands = data === null || data === void 0 ? void 0 : data.commands;
                this.fullCommands['input'] = (_b = (_a = this.fullCommands) === null || _a === void 0 ? void 0 : _a.sources) === null || _b === void 0 ? void 0 : _b.Input;
                this.fullData = data;
                if (this.remoteType === 'ac') {
                    this.acConfig = data;
                }
            });
        }
    }
    validateConfig(config) {
        if (!config.remote && !config.entity) {
            throw new Error('You need to define remote');
        }
        if (!config.commandsFilePath && !config.entity) {
            throw new Error('You need to define commandsFilePath or entity');
        }
        if (config.commandsFilePath && config.entity) {
            throw new Error('You need to define commandsFilePath or entity. not both');
        }
        if (!config.remoteType) {
            throw new Error('You need to define remoteType, for example tv or ac');
        }
        if (config.remoteType !== 'tv' && config.remoteType !== 'ac') {
            throw new Error('You need to define remoteType, for example tv or ac');
        }
        if (config.remoteType === 'ac' && config.iconSize) {
            throw new Error('iconSize currently works only with tv remote');
        }
        if (!config.callServiceProps && !config.entity) {
            throw new Error('You need to define callServiceProps with domain and service');
        }
    }
    sendCommand(requestedCommand, isCustom = false) {
        var _a, _b, _c;
        try {
            let command;
            if (isCustom) {
                command = (_a = this.fullCommands.custom) === null || _a === void 0 ? void 0 : _a.commands[requestedCommand];
            }
            else {
                command = this.fullCommands[requestedCommand];
            }
            if (!isCustom && ((_b = this.fullData) === null || _b === void 0 ? void 0 : _b.commandsEncoding) === 'Base64') {
                command = `b64:${command}`;
            }
            if (isCustom && ((_c = this.fullCommands.custom) === null || _c === void 0 ? void 0 : _c.commandsEncoding) === 'Base64') {
                command = `b64:${command}`;
            }
            // this.hass.callService("remote","send_command", {
            this.hass.callService(this.callServiceProps.domain, this.callServiceProps.service, {
                command,
                entity_id: this.hass.states[this.config.remote].entity_id,
            });
        }
        catch (e) {
            console.log('Error', e);
            this.setError();
        }
    }
    setError() {
        this.errorHappned = true;
        setTimeout(() => {
            this.errorHappned = false;
        }, 2000);
    }
    render() {
        return this.remoteType === 'tv' ? this.renderTv() : this.renderAc();
    }
    renderTv() {
        var _a, _b, _c;
        return html `
      <div class="main">
        <div
          class="remote"
          style="font-size: ${this.iconSize}px; color: ${this.theme === 'dark'
            ? 'white'
            : 'black'}; background : ${this.theme === 'dark'
            ? 'black'
            : 'white'}"
        >
          <div class="title">${this.title}</div>
          <div class="power">
            <img
              class="icon"
              @click="${() => this.sendCommand('on')}"
              style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
              src="${this.pathToIcon}/tvpower.svg"
            />
          </div>
          <div class="vol-and-cha">
            <div class="vol">
              <div class="vol-up">
                <img
                  class="icon"
                  @click="${() => this.sendCommand('volumeUp')}"
                  style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                  src="${this.pathToIcon}/tvplus.svg"
                />
              </div>
              <div>Vol</div>
              <div class="vol-down">
                <img
                  class="icon"
                  @click="${() => this.sendCommand('volumeDown')}"
                  style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                  src="${this.pathToIcon}/tvminus.svg"
                />
              </div>
            </div>
            <div class="mute-and-input">
              <img
                class="icon"
                @click="${() => this.sendCommand('input')}"
                style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                src="${this.pathToIcon}/input.svg"
              />
              <img
                class="icon"
                @click="${() => this.sendCommand('mute')}"
                style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                src="${this.pathToIcon}/tvmute.svg"
              />
            </div>
            <div class="cha">
              <div class="cha-up">
                <img
                  class="icon"
                  @click="${() => this.sendCommand('nextChannel')}"
                  style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                  src="${this.pathToIcon}/tvplus.svg"
                />
              </div>
              <div>CH</div>
              <div class="cha-down">
                <img
                  class="icon"
                  @click="${() => this.sendCommand('previousChannel')}"
                  style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                  src="${this.pathToIcon}/tvminus.svg"
                />
              </div>
            </div>
          </div>

          ${!!this.fullCommands
            ? html ` <div class="custom">
                ${(_c = Object.keys(((_b = (_a = this.fullCommands) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.commands) || [])) === null || _c === void 0 ? void 0 : _c.map((i) => html `<span
                      class="custom-button"
                      style="font-size: ${this.iconSize}px;border-color: ${this
                .theme === 'dark'
                ? 'white'
                : 'black'}"
                      @click="${() => this.sendCommand(i, true)}"
                      >${i}</span
                    >`)}
              </div>`
            : html ``}

          <div></div>

          <div class="error">
            ${this.errorHappned
            ? html `<span>Error, check console</span>`
            : null}
          </div>
        </div>
      </div>
    `;
    }
    renderAc() {
        return html `
      <div class="main-ac">
        <div class="ac-title">${this.title}</div>

        <div class="screen">
          <div class="panel"></div>
          <div class="screen-temp">
            ${this.acState.temperature} <span class="screen__degree">°C</span>
          </div>
          <div class="screen-extra">
            <div class="mode">
              ${this.acState.mode === 'cool'
            ? html ` <img
                    class="icon blue-filter"
                    src="${this.pathToIcon}/snowflex.svg"
                  />`
            : html ` <img
                    class="icon red-filter"
                    src="${this.pathToIcon}/sun.svg"
                  />`}
            </div>
            <div class="fan-level">
              <img class="icon" src="${this.pathToIcon}/fan.svg" />
              <img
                class="icon"
                style="opacity: ${this.acState.fan !== 'low' ? 1 : 0.3} "
                src="${this.pathToIcon}/fan.svg"
              />
              <img
                class="icon"
                style="opacity: ${this.acState.fan === 'high' ? 1 : 0.3} "
                src="${this.pathToIcon}/fan.svg"
              />
            </div>
          </div>
        </div>
        <div class="buttons">
          <div class="first-line">
            <div class="power">
              <img
                class="icon green-filter"
                @click="${() => this.onAc()}"
                src="${this.pathToIcon}/tvpower.svg"
              />
              <img
                class="icon red-filter"
                @click="${() => this.offAc()}"
                src="${this.pathToIcon}/tvpower.svg"
              />
            </div>
          </div>
          <div class="ac-features" [ngClass]="{ disabled: !powerOn }">
            <div class="fan">
              <img
                class="icon"
                @click="${() => this.changeAcFan()}"
                src="${this.pathToIcon}/fan.svg"
              />
            </div>
            <div class="ac-volume">
              <img
                class="icon"
                @click="${() => this.changeAcTempp(-1)}"
                style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                src="${this.pathToIcon}/tvminus.svg"
              />
              <img
                class="icon"
                @click="${() => this.changeAcTempp(1)}"
                style="filter: ${this.theme === 'dark' ? 'invert(1)' : null}"
                src="${this.pathToIcon}/tvplus.svg"
              />
            </div>

            <div class="ac-mode" @click="${() => this.changeAcMode()}">
              mode
            </div>
          </div>
          <div class="error">
            ${this.errorHappned
            ? html `<span>Error, check console</span>`
            : null}
          </div>
        </div>
      </div>
    `;
    }
    saveAcToLocalStorage() {
        window.localStorage.setItem(this.title, JSON.stringify(this.acState));
    }
    readAcFromLocalStorage() {
        const savedConfig = window.localStorage.getItem(this.title);
        if (savedConfig) {
            this.acState = JSON.parse(savedConfig);
        }
    }
    buildAcCommand(customCommand) {
        var _a;
        try {
            let command = customCommand;
            if (!command) {
                const fanExists = this.fullCommands[this.acState.mode][this.acState.fan];
                const commandWithFan = fanExists
                    ? this.fullCommands[this.acState.mode][this.acState.fan]
                    : this.fullCommands[this.acState.mode]['auto'];
                if (commandWithFan['static']) {
                    command = commandWithFan['static'][this.acState.temperature];
                }
                else {
                    command = commandWithFan[this.acState.temperature];
                }
            }
            if (((_a = this.fullData) === null || _a === void 0 ? void 0 : _a.commandsEncoding) === 'Base64') {
                command = `b64:${command}`;
            }
            // this.hass.callService("remote","send_command", {
            this.hass.callService(this.callServiceProps.domain, this.callServiceProps.service, {
                command,
                entity_id: this.hass.states[this.config.remote].entity_id,
            });
            this.saveAcToLocalStorage();
        }
        catch (e) {
            this.setError();
            throw new Error(e);
        }
    }
    changeAcTempp(inc) {
        var _a, _b;
        let newState = { ...this.acState };
        const max = this.entity ? (_a = this.hass.states[this.entity]) === null || _a === void 0 ? void 0 : _a.attributes.max_temp : this.acConfig.maxTemperature;
        const min = this.entity ? (_b = this.hass.states[this.entity]) === null || _b === void 0 ? void 0 : _b.attributes.min_temp : this.acConfig.minTemperature;
        newState.temperature += inc;
        if (newState.temperature > max) {
            newState.temperature = min;
        }
        if (newState.temperature < min) {
            newState.temperature = max;
        }
        this.acState = { ...newState };
        if (this.entity) {
            this.temperatureAcWithEntity();
            return;
        }
        this.buildAcCommand();
    }
    changeAcMode() {
        let newState = { ...this.acState };
        if (this.acState.mode === 'cool') {
            newState.mode = 'heat';
        }
        else {
            newState.mode = 'cool';
        }
        this.acState = { ...newState };
        if (this.entity) {
            this.modeAcWithEntity();
            return;
        }
        this.buildAcCommand();
    }
    onAc() {
        if (this.entity) {
            this.modeAcWithEntity();
            return;
        }
        let newState = { ...this.acState };
        this.buildAcCommand();
    }
    offAc() {
        if (this.entity) {
            this.offAcWithEntity();
            return;
        }
        this.buildAcCommand(this.fullCommands['off']);
    }
    changeAcFan() {
        let newState = { ...this.acState };
        switch (newState.fan) {
            case 'low': {
                newState.fan = 'mid';
                break;
            }
            case 'mid': {
                newState.fan = 'high';
                break;
            }
            case 'high': {
                newState.fan = 'low';
                break;
            }
        }
        this.acState = { ...newState };
        if (this.entity) {
            this.fanAcWithEntity();
            return;
        }
        this.buildAcCommand();
    }
    fanAcWithEntity() {
        const entity = this.hass.states[this.entity];
        //fan_mode: low
        this.hass.callService('climate', 'set_fan_mode', {
            entity_id: this.entity,
            fan_mode: this.acState.fan,
        });
    }
    temperatureAcWithEntity() {
        const entity = this.hass.states[this.entity];
        this.hass.callService('climate', 'set_temperature', {
            entity_id: this.entity,
            temperature: this.acState.temperature,
            hvac_mode: this.acState.mode,
        });
    }
    offAcWithEntity() {
        const entity = this.hass.states[this.entity];
        this.hass.callService('climate', 'set_hvac_mode', {
            entity_id: this.entity,
            hvac_mode: 'off',
        });
    }
    modeAcWithEntity() {
        this.temperatureAcWithEntity();
    }
};
SilentRemotesCard.styles = css `
    :host {
      display: block;
      padding: 16px;
      max-width: 800px;
    }

    .icon {
      width: 1em;
      height: 1em;
      cursor: pointer;
      font-size: 1em;
    }

    .icon:hover {
      filter: invert(57%) sepia(68%) saturate(5215%) hue-rotate(164deg)
        brightness(99%) contrast(101%) !important;
    }

    .remote {
      width: 200px;
      height: auto;
      border: 1px solid black;
      padding: 10px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      border-radius: 15%;
    }

    .cha,
    .vol {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .power {
    }

    .vol-and-cha {
      display: flex;
      justify-content: space-around;
      margin-top: 25px;
      width: inherit;
    }

    .main {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .custom {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 20px;
      gap: 10px;
    }

    .custom-button {
      border: 1px solid black;
      border-radius: 10px;
      padding: 0.2em;
      caret-color: transparent;
    }

    .custom-button:hover {
      cursor: pointer;
      filter: invert(57%) sepia(68%) saturate(5215%) hue-rotate(164deg)
        brightness(99%) contrast(101%) !important;
    }

    .error {
      font-size: 10px;
      color: red;
    }

    .title {
      font-size: 20px;
      margin-bottom: 20px;
      font-style: italic;
    }

    .mute-and-input {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-around;
    }

    .main-ac {
      height: 300px;
      width: 200px;
      border: 1px solid black;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      background: whitesmoke;
      border-radius: 15px;
    }

    .screen {
      border-bottom: 1px solid gray;
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      position: relative;
      font-size: 25px;
      pointer-events: none;

      &__temp {
        font-size: 45px;
        z-index: 1;
        position: relative;
      }

      &__degree {
        font-size: 20px;
        position: absolute;
        top: 35%;
        margin-inline-start: 3px;
        transform: translateY(-50%);
      }

      &__extra {
        margin-top: 10px;
        display: flex;
        align-items: center;
        z-index: 1;
      }
    }

    .panel {
      height: 88%;
      width: 77%;
      background: lightgoldenrodyellow;
      z-index: 1;
      border: 20px solid black;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }

    .off-look {
      opacity: 0.2;
    }

    .screen-off {
      background: lightgrey;
    }

    .buttons {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      font-size: 30px;
      align-items: center;
    }

    .red-filter {
      filter: invert(100%) sepia() saturate(1969%) hue-rotate(17220deg);
    }

    .green-filter {
      filter: invert(100%) sepia() saturate(1969%) hue-rotate(1501deg);
    }

    .blue-filter {
      filter: invert(49%) sepia() saturate(2144%) hue-rotate(17450deg);
    }

    .ac-features {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 90%;
    }

    .ac-mode {
      font-size: 20px;
      color: blue;
      cursor: pointer;
    }

    .ac-volume {
      display: flex;
      width: 100%;
      justify-content: center;
      gap: 5px;
    }

    .fan:hover {
      animation-name: spin;
      animation-duration: 4000ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }

    .screen-temp {
      position: absolute;
      z-index: 1;
      top: 30%;
    }

    .screen-extra {
      position: absolute;
      z-index: 1;
      margin-top: 50px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .mode {
      display: flex;
    }

    .fan-level {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .ac-title {
      text-align: center;
      font-weight: 500;
      font-style: italic;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;
SilentRemotesCard = __decorate([
    customElement('silent-remotes-card')
], SilentRemotesCard);
export { SilentRemotesCard };
//# sourceMappingURL=silent-remotes-card.js.map
