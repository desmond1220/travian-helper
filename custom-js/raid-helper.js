"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
// @ts-ignore
const BUILD_TIME = "2022/10/16 11:53:12";
const RUN_INTERVAL = 10000;
const GID_NAME_MAP = {
    "-1": "Unknown",
    "1": "Woodcutter",
    "2": "Clay Pit",
    "3": "Iron Mine",
    "4": "Cropland",
    "5": "Sawmill",
    "6": "Brickyard",
    "7": "Iron Foundry",
    "8": "Grain Mill",
    "9": "Bakery",
    "10": "Warehouse",
    "11": "Granary",
    "13": "Smithy",
    "14": "Tournament Square",
    "15": "Main Building",
    "16": "Rally Point",
    "17": "Marketplace",
    "18": "Embassy",
    "19": "Barracks",
    "21": "Workshop",
    "23": "Cranny",
    "24": "Town Hall",
    "25": "Residence",
    "26": "Palace",
    "27": "Treasury",
    "28": "Trade Office",
    "29": "Great Barracks",
    "31": "City Wall",
    "32": "Earth Wall",
    "33": "Palisade",
    "34": "Stonemason's Lodge",
    "35": "Brewery",
    "36": "Trapper",
    "37": "Hero's Mansion",
    "38": "Great Warehouse",
    "39": "Great Granary",
    "41": "Horse Drinking Trough",
    "42": "Stone Wall",
    "43": "Makeshift Wall",
    "44": "Command Center",
    "45": "Waterworks",
    "20": "Stable",
    "22": "Academy",
    "30": "Great Stable",
    "40": "Wonder of the World",
    "46": "Hospital"
};
var CurrentPageEnum;
(function (CurrentPageEnum) {
    CurrentPageEnum["LOGIN"] = "LOGIN";
    CurrentPageEnum["FIELDS"] = "FIELDS";
    CurrentPageEnum["TOWN"] = "TOWN";
    CurrentPageEnum["BUILDING"] = "BUILDING";
    CurrentPageEnum["REPORT"] = "REPORT";
    CurrentPageEnum["OFF_REPORT"] = "OFF_REPORT";
    CurrentPageEnum["SCOUT_REPORT"] = "SCOUT_REPORT";
    CurrentPageEnum["UNKNOWN"] = "UNKNOWN";
})(CurrentPageEnum || (CurrentPageEnum = {}));
var CurrentActionEnum;
(function (CurrentActionEnum) {
    CurrentActionEnum["IDLE"] = "IDLE";
    CurrentActionEnum["BUILD"] = "BUILD";
    CurrentActionEnum["NAVIGATE_TO_FIELDS"] = "NAVIGATE_TO_FIELDS";
    CurrentActionEnum["SCOUT"] = "SCOUT";
    CurrentActionEnum["FARM"] = "FARM";
    CurrentActionEnum["CUSTOM_FARM"] = "CUSTOM_FARM";
})(CurrentActionEnum || (CurrentActionEnum = {}));
class StateHandler {
    constructor() {
        this.parseState = (prop) => {
            let item = localStorage.getItem(prop);
            if (item === null)
                return StateHandler.INITIAL_STATE[prop];
            else
                return JSON.parse(item);
        };
        this.get = (obj, prop) => {
            return this.state[prop];
        };
        this.set = (obj, prop, value) => {
            localStorage.setItem(prop, JSON.stringify(value));
            //@ts-ignore
            this.state[prop] = value;
            this.callback && this.callback();
            return true;
        };
        this.setCallback = (callback) => {
            this.callback = callback;
        };
        this.state = Object.fromEntries(Object.keys(StateHandler.INITIAL_STATE)
            .map(k => [k, this.parseState(k)]));
    }
}
StateHandler.INITIAL_STATE = {
    currentAction: CurrentActionEnum.IDLE,
    currentPage: CurrentPageEnum.LOGIN,
    currentVillageId: '',
    villages: {},
    feature: {
        autoLogin: false,
        autoScan: false,
        autoBuild: false,
        alertAttack: false,
        alertEmptyBuildQueue: false,
        alertResourceCapacityFull: false,
        autoScout: false,
        autoFarm: false,
        autoCustomFarm: false,
        debug: false
    },
    nextFarmTime: new Date(),
    nextCheckReportTime: new Date(),
    alertedPlusIncomingAttack: false,
    telegramChatId: '',
    telegramToken: '',
    username: '',
    password: ''
};
class Utils {
}
_a = Utils;
Utils.parseIntIgnoreNonNumeric = (text) => {
    return parseInt(text.replace(/[^0-9]/g, ''));
};
Utils.randInt = (x, y) => {
    return Math.floor(Math.random() * (y - x + 1) + x);
};
Utils.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
Utils.delayClick = () => __awaiter(void 0, void 0, void 0, function* () {
    yield Utils.sleep(Utils.randInt(1000, 5000));
});
Utils.addToDate = (date, hour, minute, second) => {
    return new Date(date.getTime() + hour * 60 * 60 * 1000 + minute * 60 * 1000 + second * 1000);
};
Utils.leftPadZero = (value, length) => {
    return String(value).padStart(length, '0');
};
Utils.formatDate = (dateInput) => {
    if (!dateInput) {
        return 'N/A';
    }
    const date = new Date(dateInput);
    return `${date.getFullYear()}/${Utils.leftPadZero(date.getMonth() + 1, 2)}/${Utils.leftPadZero(date.getDate(), 2)} ${Utils.leftPadZero(date.getHours(), 2)}:${Utils.leftPadZero(date.getMinutes(), 2)}:${Utils.leftPadZero(date.getSeconds(), 2)}`;
};
Utils.isSufficientResources = (required, own) => {
    return required.lumber <= own.lumber && required.clay <= own.clay && required.iron <= own.iron && required.crop <= own.crop;
};
class Navigation {
}
_b = Navigation;
Navigation.goToVillage = (state, id, action) => __awaiter(void 0, void 0, void 0, function* () {
    yield Utils.delayClick();
    state.currentAction = action;
    state.feature.debug && console.log(`Go to village - [${id}]${state.villages[id].name}`);
    $(`.listEntry[data-did="${id}"] > a`)[0].click();
    return true;
});
Navigation.goToBuilding = (state, aid, gid, action) => __awaiter(void 0, void 0, void 0, function* () {
    if (aid <= 18 && state.currentPage === CurrentPageEnum.FIELDS) {
        yield Utils.delayClick();
        state.currentAction = action;
        state.feature.debug && console.log(`Go to building - [aid=${aid},gid=${gid}]${GID_NAME_MAP[gid]}`);
        $(`a[href="/build.php?id=${aid}"]`)[0].click();
        return true;
    }
    else if (aid > 18 && state.currentPage === CurrentPageEnum.TOWN) {
        yield Utils.delayClick();
        state.currentAction = action;
        state.feature.debug && console.log(`Go to building - [aid=${aid},gid=${gid}]${GID_NAME_MAP[gid]}`);
        if (aid === 40) { // Special case for wall
            $('#villageContent > div.buildingSlot.a40.top > svg > g.hoverShape > path').trigger('click');
        }
        else {
            $(`a[href="/build.php?id=${aid}&gid=${gid}"]`)[0].click();
        }
        return true;
    }
    else {
        state.feature.debug && console.log(`Cannot go to building - [aid=${aid},gid=${gid}]${GID_NAME_MAP[gid]}`);
        return false;
    }
});
Navigation.goToFields = (state, action) => __awaiter(void 0, void 0, void 0, function* () {
    yield Utils.delayClick();
    state.currentAction = action;
    state.feature.debug && console.log('Go to fields');
    $('.village.resourceView')[0].click();
    return true;
});
Navigation.goToTown = (state, action) => __awaiter(void 0, void 0, void 0, function* () {
    yield Utils.delayClick();
    state.currentAction = action;
    state.feature.debug && console.log('Go to town');
    $('.village.buildingView')[0].click();
    return true;
});
Navigation.goToReport = (state, action) => __awaiter(void 0, void 0, void 0, function* () {
    yield Utils.delayClick();
    state.currentAction = action;
    state.feature.debug && console.log('Go to report');
    $('.reports')[0].click();
    return true;
});
var TroopMovementType;
(function (TroopMovementType) {
    TroopMovementType["REINFORCE"] = "REINFORCE";
    TroopMovementType["ATTACK"] = "ATTACK";
    TroopMovementType["ADVENTURE"] = "ADVENTURE";
})(TroopMovementType || (TroopMovementType = {}));
const createStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
        #console {
            background: white; 
            margin: 0 20px; 
            border-radius: 10px; 
            padding: 5px; 
        }
        
        #console .flex-row {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }
        
        #console .village-container {
            flex: 0 1 33%;
            margin-top: 10px
        }
        
        #console .ml-5 {
            margin-left: 5px;
        }
        
        #console .mr-5 {
            margin-right: 5px;
        }
        
        .tjs-btn, #console button {
            border: 1px solid black;
            border-radius: 3px;
        }

        .tjs-pending {
            background: lightblue;
        }
    `;
    document.head.append(style);
};
const createContainer = () => {
    $('#footer').before(`
      <div id="console"/>
    `);
};
const updateCurrentPage = (state) => {
    let pathname = window.location.pathname;
    switch (pathname) {
        case '/dorf1.php': {
            state.currentPage = CurrentPageEnum.FIELDS;
            break;
        }
        case '/dorf2.php': {
            state.currentPage = CurrentPageEnum.TOWN;
            break;
        }
        case '/build.php': {
            state.currentPage = CurrentPageEnum.BUILDING;
            break;
        }
        case '/report':
        case '/report/overview': {
            state.currentPage = CurrentPageEnum.REPORT;
            break;
        }
        case '/report/offensive': {
            state.currentPage = CurrentPageEnum.OFF_REPORT;
            break;
        }
        case '/report/scouting': {
            state.currentPage = CurrentPageEnum.SCOUT_REPORT;
            break;
        }
        case '/': {
            state.currentPage = CurrentPageEnum.LOGIN;
            break;
        }
        default: {
            state.currentPage = CurrentPageEnum.UNKNOWN;
            break;
        }
    }
};
const farm = (state) => __awaiter(void 0, void 0, void 0, function* () {
    if (new Date(state.nextFarmTime) < new Date()) {
        const params = new URLSearchParams(window.location.search);
        if (state.currentPage === CurrentPageEnum.REPORT) {
            yield Utils.delayClick();
            $('a[href="/report/offensive"]')[0].click();
            return;
        }
        else if (state.currentPage === CurrentPageEnum.OFF_REPORT) {
            const unreadReports = $("#overview > tbody").find(".messageStatusUnread");
            state.feature.debug && console.log("Unread report: " + unreadReports.length);
            if (unreadReports.length > 0) {
                const feature = state.feature;
                feature.autoFarm = false;
                state.feature = feature;
                fetch(`https://api.telegram.org/bot${state.telegramToken}/sendMessage?chat_id=${state.telegramChatId}&text=Losses occurred, please check the offensive report`);
            }
            state.nextCheckReportTime = Utils.addToDate(new Date(), 0, 1, 0);
            yield Navigation.goToTown(state, CurrentActionEnum.FARM);
            return;
        }
        else if (state.currentPage === CurrentPageEnum.BUILDING && params.get('id') === '39' && params.get('gid') === '16' && params.get('tt') === '99') {
            const startButtonEle = $('.startButton[value=Start]').filter((_, button) => {
                return $(button).parent().parent().find('.listName').find('span').text() !== "Scout";
            });
            for (let i = 0; i < startButtonEle.length; i++) {
                yield Utils.delayClick();
                startButtonEle[i].click();
            }
            state.nextFarmTime = Utils.addToDate(new Date(), 0, Utils.randInt(2, 3), Utils.randInt(0, 59));
            yield Navigation.goToFields(state, CurrentActionEnum.IDLE);
            return;
        }
        else if (state.currentPage === CurrentPageEnum.BUILDING && params.get('id') === '39' && params.get('gid') === '16' && params.get('tt') !== '99') {
            yield Utils.delayClick();
            $('a[href="/build.php?id=39&gid=16&tt=99"]')[0].click();
            return;
        }
        else if (state.currentPage === CurrentPageEnum.TOWN) {
            if (new Date(state.nextCheckReportTime) < new Date()) {
                yield Navigation.goToReport(state, CurrentActionEnum.FARM);
            }
            else {
                yield Navigation.goToBuilding(state, 39, 16, CurrentActionEnum.FARM);
            }
            return;
        }
        else {
            if (new Date(state.nextCheckReportTime) < new Date()) {
                yield Navigation.goToReport(state, CurrentActionEnum.FARM);
            }
            else {
                yield Navigation.goToTown(state, CurrentActionEnum.FARM);
            }
            return;
        }
    }
});
const handleFeatureToggle = (selector, state, key) => {
    $(selector).on('click', () => {
        const feature = state.feature;
        feature[key] = !feature[key];
        state.feature = feature;
    });
};
const render = (state) => {
    if (state.currentPage === CurrentPageEnum.BUILDING) {
        const btn = '<button id="addCurrentToPendingInBuilding" class="tjs-btn addCurrentToPending">Add to queue</button>';
        if ($('#addCurrentToPendingInBuilding').length === 0)
            $('.upgradeBuilding').after(btn);
        else
            $('#addCurrentToPendingInBuilding').replaceWith(btn);
    }
    const villages = state.villages;
    const currentVillage = villages[state.currentVillageId];
    const params = new URLSearchParams(window.location.search);
    if (currentVillage && [CurrentPageEnum.FIELDS, CurrentPageEnum.TOWN].includes(state.currentPage)) {
        const records = currentVillage.pendingBuildTasks.reduce((group, task) => {
            group[task.aid] = group[task.aid] || 0;
            group[task.aid]++;
            return group;
        }, {});
        const classNamePrefix = state.currentPage === CurrentPageEnum.FIELDS ? "buildingSlot" : "aid";
        $('.tjs-pending').remove();
        Object.entries(records).forEach(([id, count]) => {
            const div = `<div class="tjs-pending">+${count}</div>`;
            if ($(`.${classNamePrefix}${id} .tjs-pending`).length === 0) {
                $(`.${classNamePrefix}${id} .labelLayer`).after(div);
            }
            else {
                $(`.${classNamePrefix}${id} .tjs-pending`).replaceWith(div);
            }
        });
    }
    if (state.currentPage === CurrentPageEnum.REPORT) {
        const resourcesFromReport = {};
        resourcesFromReport.lumber = Utils.parseIntIgnoreNonNumeric($($('.resources').find('span.value')[0]).text());
        resourcesFromReport.clay = Utils.parseIntIgnoreNonNumeric($($('.resources').find('span.value')[1]).text());
        resourcesFromReport.iron = Utils.parseIntIgnoreNonNumeric($($('.resources').find('span.value')[2]).text());
        resourcesFromReport.crop = Utils.parseIntIgnoreNonNumeric($($('.resources').find('span.value')[3]).text());
        const sum = resourcesFromReport.lumber + resourcesFromReport.clay + resourcesFromReport.iron + resourcesFromReport.crop;
        const cranny = Utils.parseIntIgnoreNonNumeric($('.rArea').text());
        const troops70 = `<div id="troops-required-70">Troops Required: ${Math.ceil((sum - cranny * 4) / 70)} | ${Math.ceil((sum - (cranny * 0.85) * 4) / 70)} with hero (70 per troop)</div>`;
        if ($('#troops-required-70').length === 0)
            $(".additionalInformation").after(troops70);
        else
            $('#troops-required-70').replaceWith(troops70);
        const troops50 = `<div id="troops-required-50">Troops Required: ${Math.ceil((sum - cranny * 4) / 50)} | ${Math.ceil((sum - (cranny * 0.85) * 4) / 50)} with hero (50 per troop)</div>`;
        if ($('#troops-required-50').length === 0)
            $(".additionalInformation").after(troops50);
        else
            $('#troops-required-50').replaceWith(troops50);
    }
    $('#console').html(`
        <div class="flex-row">
            <h4>Console</h4>
            <input id="toggleAutoFarm" class="ml-5" type="checkbox" ${state.feature.autoFarm ? 'checked' : ''}/> Auto farm
            <input id="toggleDebug" class="ml-5" type="checkbox" ${state.feature.debug ? 'checked' : ''}/> Debug
        </div>
        <div>
            <h4>Summary (Build: ${BUILD_TIME})</h4>
            <div>Current Page: ${state.currentPage} (Last render: ${Utils.formatDate(new Date())})</div>
            <div>Current Action: ${state.currentAction}</div>
            <div>Next farm: ${Utils.formatDate(state.nextFarmTime)}</div>
            <div>Next check report: ${Utils.formatDate(state.nextCheckReportTime)}</div>
        </div>
    `);
    handleFeatureToggle('#toggleAutoFarm', state, 'autoFarm');
    handleFeatureToggle('#toggleDebug', state, 'debug');
};
const run = (state) => __awaiter(void 0, void 0, void 0, function* () {
    while (true) {
        updateCurrentPage(state);
        if ([CurrentActionEnum.IDLE, CurrentActionEnum.FARM].includes(state.currentAction)) {
            if (state.feature.autoFarm) {
                state.feature.debug && console.log("Attempting farm");
                yield farm(state);
            }
            else {
                state.currentAction = CurrentActionEnum.IDLE;
            }
        }
        state.feature.debug && console.log(`Awaiting ${RUN_INTERVAL}ms`);
        yield Utils.sleep(RUN_INTERVAL);
    }
});
const initialize = () => {
    const handler = new StateHandler();
    const state = new Proxy(StateHandler.INITIAL_STATE, handler);
    handler.setCallback(() => render(state));
    createStyle();
    createContainer();
    render(state);
    run(state);
};
initialize();
