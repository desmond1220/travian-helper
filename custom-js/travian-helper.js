const style = document.createElement("style");
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
  }
  
  #console .flex {
    flex: 1 1 auto;
  }
  
  #console .ml-5 {
    margin-left: 5px;
  }
  
  #console .mr-5 {
    margin-right: 5px;
  }
  
  #console button {
    border: 1px solid black;
    border-radius: 3px;
  }
`;
document.head.append(style);

const PENDING_BUILD_LIST_STATE = "pendingBuildState";
const ENABLE_AUTO_BUILD_KEY = "enableAutoBuild";
const BUILDING_ALERT_SENT_KEY = "buildingAlertSent";
const VILLAGE_ID_KEY = "villageId";
const BUILDING_PAGE = "Building";
const TOWN_PAGE = "Town";
const RESOURCE_FIELD_PAGE = "Resource fields";
const GID_MAP = {
  1: "Woodcutter",
  2: "Clay Pit",
  3: "Iron Mine",
  4: "Cropland",
  5: "Sawmill",
  6: "Brickyard",
  7: "Iron Foundry",
  8: "Grain Mill",
  9: "Bakery",
  10: "Warehouse",
  11: "Granary",
  13: "Smithy",
  14: "Tournament Square",
  15: "Main Building",
  16: "Rally Point",
  17: "Marketplace",
  18: "Embassy",
  19: "Barracks",
  21: "Workshop",
  23: "Cranny",
  24: "Town Hall",
  25: "Residence",
  26: "Palace",
  27: "Treasury",
  28: "Trade Office",
  29: "Great Barracks",
  31: "City Wall",
  32: "Earth Wall",
  33: "Palisade",
  34: "Stonemason's Lodge",
  35: "Brewery",
  36: "Trapper",
  37: "Hero's Mansion",
  38: "Great Warehouse",
  39: "Great Granary",
  41: "Horse Drinking Trough",
  42: "Stone Wall",
  43: "Makeshift Wall",
  44: "Command Center",
  45: "Waterworks",
  20: "Stable",
  22: "Academy",
  30: "Great Stable",
  40: "Wonder of the World",
};

const VILLAGES_LIST = [
  {
    "id": "9739",
    "selector": "#sidebarBoxVillagelist > div.content > div.villageList > div:nth-child(1) > div > a"
  }, 
  {
    "id": "13110",
    "selector": "#sidebarBoxVillagelist > div.content > div.villageList > div:nth-child(2) > div > a"
  }
]
const villageChangeTimeout = randInt(5*60*1000, 15*60*1000)

const TELEGRAM_BOT_TOKEN = "5646454243:AAFZ6-njSBN2yzhFx1z7kYBJLf5o64bTjIw"
const TELEGRAM_CHAT_ID = "1146597167"

$("#footer").before(`
  <div id="console"/>
`);

// Random integer in range [x, y]
function randInt(x, y) {
  return Math.floor(Math.random() * (y - x + 1) + x);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getState(key, defaultValue) {
  const item = localStorage.getItem(key);
  if (item === null) return defaultValue;
  else return JSON.parse(item);
}

function setState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function parseIntIgnoreSep(s) {
  return parseInt(s.replace(".", "").replace(",", ""));
}

function sendTelegramAlert(message) {
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}`)
}

function addCurrentBuildingToPending() {
  let pendingBuildState = getState(PENDING_BUILD_LIST_STATE, {});
  let villageId = getState(VILLAGE_ID_KEY, "")

  let params = new URLSearchParams(window.location.search);
  let id = params.get("id");
  let gid = params.get("gid");

  if (!id || !gid) {
    return;
  }

  let resourceRequirementEle = $("#contract .value");
  if (!resourceRequirementEle.length) {
    return;
  }

  let woodReq = parseIntIgnoreSep(resourceRequirementEle[0].innerText);
  let brickReq = parseIntIgnoreSep(resourceRequirementEle[1].innerText);
  let metalReq = parseIntIgnoreSep(resourceRequirementEle[2].innerText);
  let grassReq = parseIntIgnoreSep(resourceRequirementEle[3].innerText);

  const pendingBuildList = pendingBuildState[villageId] || []
  pendingBuildList.push({
    id,
    gid,
    woodReq,
    brickReq,
    metalReq,
    grassReq,
  });

  pendingBuildState[villageId] = pendingBuildList
  setState(PENDING_BUILD_LIST_STATE, pendingBuildState);
  render();
}

function removeFromPending(i, rerender) {
  let pendingBuildState = getState(PENDING_BUILD_LIST_STATE, {});
  let villageId = getState(VILLAGE_ID_KEY, "")
  const pendingBuildList = pendingBuildState[villageId] || []

  pendingBuildList.splice(i, 1);
  pendingBuildState[villageId] = pendingBuildList
  setState(PENDING_BUILD_LIST_STATE, pendingBuildState);
  if (rerender) render();
}

function toggleAutoBuild() {
  let enableAutoBuild = getState(ENABLE_AUTO_BUILD_KEY, false);
  setState(ENABLE_AUTO_BUILD_KEY, !enableAutoBuild);
  render();
}

async function tryBuild(buildingList, wood, brick, metal, grass) {
  let pendingBuildState = getState(PENDING_BUILD_LIST_STATE, {});
  let villageId = getState(VILLAGE_ID_KEY, "")
  let pendingBuildList = pendingBuildState[villageId] || []
  if (!pendingBuildList.length) return;

  let type = getCurrentPageType();

  if (
    (type === RESOURCE_FIELD_PAGE || type === TOWN_PAGE) &&
    buildingList.length < 2
  ) {
    let id = pendingBuildList[0].id;
    let gid = pendingBuildList[0].gid;
    let woodReq = pendingBuildList[0].woodReq;
    let brickReq = pendingBuildList[0].brickReq;
    let metalReq = pendingBuildList[0].metalReq;
    let grassReq = pendingBuildList[0].grassReq;

    if (
      wood < woodReq ||
      brick < brickReq ||
      metal < metalReq ||
      grass < grassReq
    )
      return;

    await sleep(randInt(1000, 5000));
    if (parseInt(id) <= 18) {
      if (type === RESOURCE_FIELD_PAGE)
        $(`a[href="/build.php?id=${id}"]`)[0].click();
      else $(".village.resourceView")[0].click();
    } else {
      if (type === TOWN_PAGE) {
        if (id === "40")
          $(
            "#villageContent > div.buildingSlot.a40.g33.top.gaul > svg > g.hoverShape > path"
          ).click();
          
        else $(`a[href="/build.php?id=${id}&gid=${gid}"]`)[0].click();
      } else {
        $(".village.buildingView")[0].click();
      }
    }
  }

  // Wrong building
  let params = new URLSearchParams(window.location.search);
  if (
    pendingBuildList[0].id !== params.get("id") ||
    pendingBuildList[0].gid !== params.get("gid")
  ) {
    return;
  }

  // Cannot find requirement
  let resourceRequirementEle = $("#contract .value");
  if (!resourceRequirementEle.length) {
    return;
  }

  let woodReq = parseIntIgnoreSep(resourceRequirementEle[0].innerText);
  let brickReq = parseIntIgnoreSep(resourceRequirementEle[1].innerText);
  let metalReq = parseIntIgnoreSep(resourceRequirementEle[2].innerText);
  let grassReq = parseIntIgnoreSep(resourceRequirementEle[3].innerText);

  let bulidButton = $(".section1 > button.green");
  if (
    wood >= woodReq &&
    brick >= brickReq &&
    metal >= metalReq &&
    grass >= grassReq &&
    bulidButton.length
  ) {
    await sleep(randInt(1000, 5000));
    removeFromPending(0, false);
    bulidButton.click();
  }
}

function getCurrentPageType() {
  let loc = window.location.href;
  if (loc.includes("dorf1.php")) return RESOURCE_FIELD_PAGE;
  if (loc.includes("dorf2.php")) return TOWN_PAGE;
  if (loc.includes("build.php")) return BUILDING_PAGE;
}

function getCurrentVillageId() {
  const params = new URLSearchParams(window.location.search);
  const villageId = params.get("newdid");

  if (villageId) {
    setState(VILLAGE_ID_KEY, villageId)
  }

  return getState(VILLAGE_ID_KEY);
}

function checkIncomingAttack() {
  if ($("#movements > tbody").find(".att1").length > 1) {
    sendTelegramAlert(`INCOMING ATTACK ${new Date()})`)
  }
}

async function render() {
  let pageType = getCurrentPageType();
  let villageId = getCurrentVillageId();
  let pendingBuildState = getState(PENDING_BUILD_LIST_STATE, {});
  let pendingBuildList = pendingBuildState[villageId] || []
  // let buildingAlertSent = getState(BUILDING_ALERT_SENT_KEY, false);

  let enableAutoBuild = getState(ENABLE_AUTO_BUILD_KEY, false);

  let wood = parseIntIgnoreSep($("#l1")[0].innerText);
  let brick = parseIntIgnoreSep($("#l2")[0].innerText);
  let metal = parseIntIgnoreSep($("#l3")[0].innerText);
  let grass = parseIntIgnoreSep($("#l4")[0].innerText);
  let buildingListEle = $(".buildingList > ul > li");
  let buildingList = [];

  for (let i = 0; i < buildingListEle.length; i++) {
    buildingList.push({
      name: $(buildingListEle[i]).find(".name").text(),
      time: $(buildingListEle[i]).find(".buildDuration > .timer").text(),
    });
  }

  if (enableAutoBuild) {
    await tryBuild(buildingList, wood, brick, metal, grass);
  }

  checkIncomingAttack()

  // if (pageType && buildingList.length < 2 && pendingBuildList.length === 0) {
  //   if (!buildingAlertSent) {
  //     sendTelegramAlert("[EU1] Build finished")
  //     setState(BUILDING_ALERT_SENT_KEY, true)
  //   }
  // } else {
  //   setState(BUILDING_ALERT_SENT_KEY, false)
  // }

  $("#console").html(`
    <h4>Console</h4>
    <div class="flex-row">
      <div class="flex">
        <h5>Summary</h5>
        <br />
        <div>Current: ${pageType || "Unknown"} (${new Date()})</div>
        <div>Village ID: ${villageId || "Unknown"}</div>
        <div>Wood: ${wood} Brick: ${brick} Metal: ${metal} Grass: ${grass}</div>
        <br />
        <div>Will change village after ${villageChangeTimeout/1000/60}mins</div>
        <br />
        ${buildingList.map((e) => `<div>${e.name} ${e.time}</div>`).join("")}
      </div>
      <div class="flex">
        <div class="flex-row">
          <h5>Pending List</h5>
          ${
            pageType === BUILDING_PAGE
              ? `<button class="ml-5" onClick="addCurrentBuildingToPending(${villageId})">Add Current</button>`
              : ""
          }
          <input class="ml-5" type="checkbox" ${
            enableAutoBuild ? "checked" : ""
          } onChange="toggleAutoBuild()" /> Enable auto build
        </div>
        ${pendingBuildList
          .map(
            (e, i) =>
              `<div><span>Position: ${e.id}</span> <span>${
                GID_MAP[e.gid]
              }</span> <button onClick="removeFromPending(${i}, true)">x</button></div>`
          )
          .join("")}
      </div>
    </div>
  `);
}

const changeVillage = () => {
  let enableAutoBuild = getState(ENABLE_AUTO_BUILD_KEY, false);
  let currentVillage = getState(VILLAGE_ID_KEY, undefined);

  if (enableAutoBuild && currentVillage) {
    const villageSelector = $(VILLAGES_LIST.find(v => v.id !== currentVillage).selector)
    villageSelector[0].click()
  }
}

render();
setInterval(render, 30000);

setTimeout(changeVillage, villageChangeTimeout)