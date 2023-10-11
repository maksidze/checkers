let reverse = false;
let words = reverse ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].reverse() : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
let nums = reverse ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['1', '2', '3', '4', '5', '6', '7', '8'].reverse();
let highlight = [];
let players = [["player_w", "king_w"], ["player_b", "king_b"]];

let player_is = players.at(1);
let player_enemy = players.at(0);
let selected_check;
let enemy_list = [false, false, false, false];
let nowPlayer = true;

let stepStarted = false;

const FRONT_LEFT = 0;
const FRONT_RIGHT = 1;
const BACK_LEFT = 2;
const BACK_RIGHT = 3;

let step_list = [];
let have_enemies = false;
let next_step = false;

let start_pos = {
    "white": [
        "B1",
        "D1",
        "F1",
        "H1",
        "A2",
        "C2",
        "E2",
        "G2",
        "B3",
        "D3",
        "F3",
        "H3"
    ],
    "black": [
        "A6",
        "C6",
        "E6",
        "G6",
        "B7",
        "D7",
        "F7",
        "H7",
        "A8",
        "C8",
        "E8",
        "G8"
    ]
}

function switchCommand() {
    if (nowPlayer) {
        player_is = players.at(0);
        player_enemy = players.at(1);
        console.log("white");
    } else {
        player_is = players.at(1);
        player_enemy = players.at(0);
        console.log("black");
    }
    nowPlayer = !nowPlayer;
    showInfo();
    showSteps();
    let data = analyzeCommand();
    highlightIsHaveEnemies(data);
    qwe(true);
}

function gen() {
    let map = document.getElementById("map");
    map.innerHTML = "";
    for (let i = 0; i < 10; i++) {
        if (i === 0 || i === 9) {
            let el = document.createElement("div");
            el.classList.add("col-2");
            map.append(el);
            for (let j = 0; j < 8; j++) {
                let el = document.createElement("div");
                el.innerText = words[j];
                el.classList.add("col-1");
                el.classList.add("map_word_num");
                map.append(el);
            }
            el = document.createElement("div");
            el.classList.add("col-2");
            map.append(el);
        } else {
            let el = document.createElement("div");
            el.classList.add("col-1");
            map.append(el);
            el = document.createElement("div");
            el.classList.add("col-1");
            el.innerText = nums[i - 1];
            map.append(el);
            for (let j = 0; j < 8; j++) {
                let el = document.createElement("div");
                el.classList.add("col-1");
                let wb = ((((i - 1) % 2) + (j % 2)) % 2);
                el.classList.add(wb ? "map_white" : "map_black");
                el.id = words[j] + nums[i - 1];
                el.addEventListener("click", makeStep, false);
                map.append(el);
            }
            el = document.createElement("div");
            el.classList.add("col-1");
            el.innerText = nums[i - 1];
            map.append(el);
            el = document.createElement("div");
            el.classList.add("col-1");
            map.append(el);
        }
    }
    //document.getElementById("C2").classList.add("player_w");
    //document.getElementById("D7").classList.add("player_w");
    //document.getElementById("F5").classList.add("player_w");

    //document.getElementById("C6").classList.add("player_w");
    //document.getElementById("D5").classList.add("player_w");
    //document.getElementById("B7").classList.add("king_b");

    //document.getElementById("E6").classList.add("player_w");
    //document.getElementById("E2").classList.add("player_w");
    initPos();
}

function initPos() {
    for (let i = 0; i < start_pos.white.length; i++) {
        document.getElementById(start_pos.white[i]).classList.add("player_w");
    }
    for (let i = 0; i < start_pos.black.length; i++) {
        document.getElementById(start_pos.black[i]).classList.add("player_b");
    }
}

function cellFree(position) {
    if (!position) return false;
    return !(document.getElementById(position).classList.contains(players[0][0]) ||
             document.getElementById(position).classList.contains(players[0][1]) ||
             document.getElementById(position).classList.contains(players[1][0]) ||
             document.getElementById(position).classList.contains(players[1][1]));
}

function cellHasEnemy(position) {
    if (!position) return false;
    return document.getElementById(position).classList.contains(player_enemy[0]) ||
           document.getElementById(position).classList.contains(player_enemy[1]);
}

function getAllowedPositions(position, pos_command, is_king, is_black) {
    let x = words.indexOf(position.charAt(0));
    let y = nums.indexOf(position.charAt(1));
    let res = [[], [], [], []];
    let l_pos_f = false, r_pos_f = false, l_pos_b = false, r_pos_b = false;
    let last_l_pos_f, last_r_pos_f, last_l_pos_b, last_r_pos_b;
    let layer = 1;
    let hasEnemyOnLine = [false, false, false, false];
    let hasCheckOnLine = [0, 0, 0, 0];
    enemy_list = [false, false, false, false];
    do {
        //console.log(layer);
        last_l_pos_f = l_pos_f;
        last_r_pos_f = r_pos_f;
        last_l_pos_b = l_pos_b;
        last_r_pos_b = r_pos_b;

        if (is_black && !is_king) {
            r_pos_b = !hasCheckOnLine[FRONT_LEFT] ? ((!!words[x - layer] && !!nums[y - layer]) ? words[x - layer] + nums[y - layer] : false) : false;
            l_pos_b = !hasCheckOnLine[FRONT_RIGHT] ? ((!!words[x + layer] && !!nums[y - layer]) ? words[x + layer] + nums[y - layer] : false) : false;
            r_pos_f = !hasCheckOnLine[BACK_LEFT] ? ((!!words[x - layer] && !!nums[y + layer]) ? words[x - layer] + nums[y + layer] : false) : false;
            l_pos_f = !hasCheckOnLine[BACK_RIGHT] ? ((!!words[x + layer] && !!nums[y + layer]) ? words[x + layer] + nums[y + layer] : false) : false;
        } else {
            l_pos_f = hasCheckOnLine[FRONT_LEFT] < 2 ? ((!!words[x - layer] && !!nums[y - layer]) ? words[x - layer] + nums[y - layer] : false) : false;
            r_pos_f = hasCheckOnLine[FRONT_RIGHT] < 2 ? ((!!words[x + layer] && !!nums[y - layer]) ? words[x + layer] + nums[y - layer] : false) : false;
            l_pos_b = hasCheckOnLine[BACK_LEFT] < 2 ? ((!!words[x - layer] && !!nums[y + layer]) ? words[x - layer] + nums[y + layer] : false) : false;
            r_pos_b = hasCheckOnLine[BACK_RIGHT] < 2 ? ((!!words[x + layer] && !!nums[y + layer]) ? words[x + layer] + nums[y + layer] : false) : false;
        }

        //console.log("isking " + is_king);
        if (is_king) {
            if (cellFree(l_pos_f)) {
                if (hasCheckOnLine[FRONT_LEFT] < 2) {
                    if (cellHasEnemy(last_l_pos_f)) {
                        enemy_list[FRONT_LEFT] = {"target" : last_l_pos_f};
                        hasEnemyOnLine[FRONT_LEFT] = true;
                        res[FRONT_LEFT] = [];
                    }
                    res[FRONT_LEFT].push(l_pos_f);
                }
            } else {
                //if (!cellHasEnemy(l_pos_f)) {
                    hasCheckOnLine[FRONT_LEFT] += 1;
                //}
            }
            if (cellFree(r_pos_f)) {
                if (hasCheckOnLine[FRONT_RIGHT] < 2) {
                    if (cellHasEnemy(last_r_pos_f)) {
                        enemy_list[FRONT_RIGHT] = {"target" : last_r_pos_f};
                        hasEnemyOnLine[FRONT_RIGHT] = true;
                        res[FRONT_RIGHT] = [];
                    }
                    res[FRONT_RIGHT].push(r_pos_f);
                }
            } else {
                //if (!cellHasEnemy(r_pos_f)) {
                    hasCheckOnLine[FRONT_RIGHT] += 1;
                //}
            }
            if (cellFree(l_pos_b)) {
                if (hasCheckOnLine[BACK_LEFT] < 2) {
                    if (cellHasEnemy(last_l_pos_b)) {
                        enemy_list[BACK_LEFT] = {"target" : last_l_pos_b};
                        hasEnemyOnLine[BACK_LEFT] = true;
                        res[BACK_LEFT] = [];
                    }
                    res[BACK_LEFT].push(l_pos_b);
                }
            } else {
                //if (!cellHasEnemy(l_pos_b)) {
                    hasCheckOnLine[BACK_LEFT] += 1;
                //}
            }
            if (cellFree(r_pos_b)) {
                if (hasCheckOnLine[BACK_RIGHT] < 2) {
                    if (cellHasEnemy(last_r_pos_b)) {
                        enemy_list[BACK_RIGHT] = {"target" : last_r_pos_b};
                        hasEnemyOnLine[BACK_RIGHT] = true;
                        res[BACK_RIGHT] = [];
                    }
                    res[BACK_RIGHT].push(r_pos_b);
                }
            } else {
                //if (!cellHasEnemy(r_pos_b)) {
                    hasCheckOnLine[BACK_RIGHT] += 1;
                //}
            }

        } else {
            if (layer === 2) {
                if (cellHasEnemy(last_l_pos_f)) if (!cellFree(last_l_pos_f) && cellFree(l_pos_f)) {
                    enemy_list[FRONT_LEFT] = {"target" : last_l_pos_f};
                    res[FRONT_LEFT].push(l_pos_f);
                    hasEnemyOnLine[FRONT_LEFT] = true;
                }
                if (cellHasEnemy(last_r_pos_f)) if (!cellFree(last_r_pos_f) && cellFree(r_pos_f)) {
                    enemy_list[FRONT_RIGHT] = {"target" : last_r_pos_f};
                    res[FRONT_RIGHT].push(r_pos_f);
                    hasEnemyOnLine[FRONT_RIGHT] = true;
                }

                if (cellHasEnemy(last_l_pos_b)) if (!cellFree(last_l_pos_b) && cellFree(l_pos_b)) {
                    enemy_list[BACK_LEFT] = {"target" : last_l_pos_b};
                    res[BACK_LEFT].push(l_pos_b);
                    hasEnemyOnLine[BACK_LEFT] = true;
                }
                if (cellHasEnemy(last_r_pos_b)) if (!cellFree(last_r_pos_b) && cellFree(r_pos_b)) {
                    enemy_list[BACK_RIGHT] = {"target" : last_r_pos_b};
                    res[BACK_RIGHT].push(r_pos_b);
                    hasEnemyOnLine[BACK_RIGHT] = true;
                }
                break;
            } else {
                if (cellFree(l_pos_f)) res[FRONT_LEFT].push(l_pos_f);
                if (cellFree(r_pos_f)) res[FRONT_RIGHT].push(r_pos_f);
            }
        }

        if (!hasCheckOnLine[FRONT_LEFT])
            hasCheckOnLine[FRONT_LEFT] = !cellFree(l_pos_f) && (hasEnemyOnLine[FRONT_LEFT]);
        if (!hasCheckOnLine[FRONT_RIGHT])
            hasCheckOnLine[FRONT_RIGHT] = !cellFree(r_pos_f) && (hasEnemyOnLine[FRONT_RIGHT]);
        if (!hasCheckOnLine[BACK_LEFT])
            hasCheckOnLine[BACK_LEFT] = !cellFree(l_pos_b) && (hasEnemyOnLine[BACK_LEFT]);
        if (!hasCheckOnLine[BACK_RIGHT])
            hasCheckOnLine[BACK_RIGHT] = !cellFree(r_pos_b) && (hasEnemyOnLine[BACK_RIGHT]);

        layer += 1;
    } while (l_pos_f || r_pos_f || l_pos_b || r_pos_b || last_l_pos_f || last_r_pos_f || last_l_pos_b || last_r_pos_b);

    let hasAnyLineEnemy = (hasEnemyOnLine[FRONT_LEFT] ||
        hasEnemyOnLine[FRONT_RIGHT] ||
        hasEnemyOnLine[BACK_LEFT] ||
        hasEnemyOnLine[BACK_RIGHT]);
    let resAll = [];
    if (hasAnyLineEnemy) {
        if (hasEnemyOnLine[FRONT_LEFT]) {
            resAll = resAll.concat(res[FRONT_LEFT]);
            enemy_list[FRONT_LEFT]["maps"] = res[FRONT_LEFT];
        }
        if (hasEnemyOnLine[FRONT_RIGHT]) {
            resAll = resAll.concat(res[FRONT_RIGHT]);
            enemy_list[FRONT_RIGHT]["maps"] = res[FRONT_RIGHT];
        }
        if (hasEnemyOnLine[BACK_LEFT]) {
            resAll = resAll.concat(res[BACK_LEFT]);
            enemy_list[BACK_LEFT]["maps"] = res[BACK_LEFT];
        }
        if (hasEnemyOnLine[BACK_RIGHT]) {
            resAll = resAll.concat(res[BACK_RIGHT]);
            enemy_list[BACK_RIGHT]["maps"] = res[BACK_RIGHT];
        }
    } else {
        resAll = resAll.concat(res[FRONT_LEFT]);
        resAll = resAll.concat(res[FRONT_RIGHT]);
        resAll = resAll.concat(res[BACK_LEFT]);
        resAll = resAll.concat(res[BACK_RIGHT]);
    }
    //console.log(resAll);
    return resAll;
}

function clearHighlight() {
    for (let i = 0; i < highlight.length; i++) {
        let eh = document.getElementById(highlight[i]);
        eh.classList.remove("map_highlight");
        eh.classList.add("map_black");
    }
    highlight = [];
}

function makeHighlight() {
    //console.log(highlight);
    for (let i = 0; i < highlight.length; i++) {
        let eh = document.getElementById(highlight[i]);
        eh.classList.remove("map_black");
        eh.classList.add("map_highlight");
    }
}

function isMyCheck(el) {
    return el.classList.contains(player_is[0]) || el.classList.contains(player_is[1]);
}

function getCheckType(el) {
    if (el.classList.contains(player_is[0])) return player_is[0];
    if (el.classList.contains(player_is[1])) return player_is[1];
    return false;
}

function isKing(checkType) {
    return checkType.includes("king");
}

function checkMakeKing(el) {
    let y = el.id.charAt(1);
    if (el.classList.contains(players[0][0])) {
        if (y === "8") {
            el.classList.remove(players[0][0]);
            el.classList.add(players[0][1]);
        }
        return;
    }
    if (el.classList.contains(players[1][0])) {
        if (y === "1") {
            el.classList.remove(players[1][0]);
            el.classList.add(players[1][1]);
        }
    }
}

function haveEnemies() {
    return enemy_list[FRONT_LEFT] || enemy_list[FRONT_RIGHT] || enemy_list[BACK_LEFT] || enemy_list[BACK_RIGHT];
}

function showInfo() {
    let sc = document.getElementById("step_command");
    sc.innerText = "ХОД: " + ((nowPlayer) ? "Черные" : "Белые");
}

function showSteps() {
    let el = document.getElementById("steps");
    el.innerHTML = "";

    for (let i = 0; i < step_list.length; i++) {
        console.log(el);
        let ne = document.createElement("p");
        ne.innerHTML = (step_list[i].command ? "&#9899; " : "&#9898; ") + step_list[i].from + " - " + step_list[i].to;
        el.appendChild(ne);
    }
}

function analyzeCommand() {
    let res = {"pos": []}
    let allPos = document.querySelectorAll("." + player_is[0] + ", " + "." + player_is[1]);
    for (let i = 0; i < allPos.length; i++) {
        let cid = allPos[i].id;
        let allow_steps = getAllowedPositions(cid, player_is, isKing(getCheckType(allPos[i])), nowPlayer);
        let he = haveEnemies();
        if (allow_steps.length > 0)
            res.pos.push({"id": cid, "allow_steps": allow_steps, "haveEnemies": he});
    }
    return res;
}

function clearEnemyHighlight() {
    let oldHighlight = document.querySelectorAll(".map_have_enemy");
    for (let i = 0; i < oldHighlight.length; i++) {
        oldHighlight[i].classList.remove("map_have_enemy");
    }
}

function highlightIsHaveEnemies(data, onlyCheck = false) {
    have_enemies = false;
    clearEnemyHighlight();
    for (let i = 0; i < data.pos.length; i++) {
        if (data.pos[i].haveEnemies) {
            if (onlyCheck) return true;
            document.getElementById(data.pos[i].id).classList.add("map_have_enemy");
            have_enemies = true;
        }
    }
    return false;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function auto_qwe() {
    setInterval(qwe, 100);
}


function qwe(command = nowPlayer) {
    if (nowPlayer !== command) return false;
    let data = analyzeCommand();

    if (data.pos.length === 0) {
        nowPlayer = true;
        step_list = [];
        gen();
        switchCommand();
        return false;
    }

    let AllHaveEnemies = highlightIsHaveEnemies(data, true);
    let sel = {"id": false, "allow_steps": [], "haveEnemies": false};

    if (!selected_check) {
        do {
            if (!data.pos.length) return false;
            let rand1 = getRandomInt(data.pos.length);
            sel = data.pos.at(rand1);
            data.pos.splice(rand1, 1);
            console.log("steps " + AllHaveEnemies ? sel.haveEnemies : sel.allow_steps.length > 0);
        } while (AllHaveEnemies ? !sel.haveEnemies : sel.allow_steps.length < 1);
    } else {
        if (stepStarted) {
            sel.id = selected_check;
            let els = document.querySelectorAll(".map_highlight");
            for (let i = 0; i < els.length; i++) sel.allow_steps.push(els[i].id);
        }
    }
    selected_check = sel.id;
    highlight = getAllowedPositions(document.getElementById(selected_check).id, player_is, isKing(getCheckType(document.getElementById(selected_check))), nowPlayer);

    next_step = sel.allow_steps[getRandomInt(sel.allow_steps.length)];
    makeHighlight();
    makeStep({"target": document.getElementById(next_step)});
    qwe(true);
    return true;
}

function makeStep(el) {
    if (selected_check && el.target.classList.contains("map_highlight")) {
        step_list.push({"from": selected_check, "to": el.target.id, "command": nowPlayer});
        let checkType = getCheckType(document.getElementById(selected_check));
        document.getElementById(selected_check).classList.remove(checkType);
        el.target.classList.add(checkType);
        checkMakeKing(el.target);

        if (haveEnemies()) {
            if (enemy_list[FRONT_LEFT])
                if (enemy_list[FRONT_LEFT]["maps"].includes(el.target.id)) {
                    document.getElementById(enemy_list[FRONT_LEFT]["target"]).classList.remove(player_enemy[0]);
                    document.getElementById(enemy_list[FRONT_LEFT]["target"]).classList.remove(player_enemy[1]);
                }
            if (enemy_list[FRONT_RIGHT])
                if (enemy_list[FRONT_RIGHT]["maps"].includes(el.target.id)) {
                    document.getElementById(enemy_list[FRONT_RIGHT]["target"]).classList.remove(player_enemy[0]);
                    document.getElementById(enemy_list[FRONT_RIGHT]["target"]).classList.remove(player_enemy[1]);
                }
            if (enemy_list[BACK_LEFT])
                if (enemy_list[BACK_LEFT]["maps"].includes(el.target.id)) {
                    document.getElementById(enemy_list[BACK_LEFT]["target"]).classList.remove(player_enemy[0]);
                    document.getElementById(enemy_list[BACK_LEFT]["target"]).classList.remove(player_enemy[1]);
                }
            if (enemy_list[BACK_RIGHT])
                if (enemy_list[BACK_RIGHT]["maps"].includes(el.target.id)) {
                    document.getElementById(enemy_list[BACK_RIGHT]["target"]).classList.remove(player_enemy[0]);
                    document.getElementById(enemy_list[BACK_RIGHT]["target"]).classList.remove(player_enemy[1]);
                }
            clearHighlight();
            highlight = getAllowedPositions(el.target.id, player_is, isKing(getCheckType(el.target)), nowPlayer);
            console.log(haveEnemies());
            if (haveEnemies()) {
                stepStarted = selected_check;
                selected_check = el.target.id;
                makeHighlight();
                clearEnemyHighlight();
            } else {
                stepStarted = false;
                selected_check = false;
                clearHighlight();
                switchCommand();
            }
        } else {
            stepStarted = false;
            selected_check = false;
            clearHighlight();
            switchCommand();
        }
        return;
    }

    clearHighlight();
    if (!isMyCheck(el.target)) return;
    if (have_enemies && !el.target.classList.contains("map_have_enemy")) return;
    console.log(el.target);
    let click_id = el.target.id;
    selected_check = click_id;
    highlight = getAllowedPositions(click_id, player_is, isKing(getCheckType(el.target)), nowPlayer);
    makeHighlight();
}

window.onload = () => {
    console.log("page is fully loaded");
    gen();
    switchCommand();
    console.log(analyzeCommand());
};
