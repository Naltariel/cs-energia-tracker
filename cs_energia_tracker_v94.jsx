import { useState, useEffect } from "react";

const STORAGE_KEY = "cs_energia_reports_v65";
const WORKER_URL = "https://cs-energia-proxy.roberta-esposito.workers.dev";
const PWD_KEY = "cs_energia_pwd";
const PWD_TS_KEY = "cs_energia_pwd_ts";
const PWD_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 ore

// Recupera password salvata, se non scaduta
function getStoredPassword() {
  try {
    const pwd = localStorage.getItem(PWD_KEY);
    const ts = parseInt(localStorage.getItem(PWD_TS_KEY) || "0", 10);
    if (!pwd || !ts) return null;
    if (Date.now() - ts > PWD_VALIDITY_MS) {
      localStorage.removeItem(PWD_KEY);
      localStorage.removeItem(PWD_TS_KEY);
      return null;
    }
    return pwd;
  } catch(e) { return null; }
}
function setStoredPassword(pwd) {
  try {
    localStorage.setItem(PWD_KEY, pwd);
    localStorage.setItem(PWD_TS_KEY, String(Date.now()));
  } catch(e) {}
}
function clearStoredPassword() {
  try {
    localStorage.removeItem(PWD_KEY);
    localStorage.removeItem(PWD_TS_KEY);
  } catch(e) {}
}

// ── Worker KV API helpers ──
// Ritornano { ok: true, data: ... } o { ok: false, error: "motivo", unauthorized: bool }

async function kvCheckPassword(pwd) {
  try {
    const res = await fetch(WORKER_URL + "/checkPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: "{}"
    });
    return res.status === 200;
  } catch(e) { return false; }
}

async function kvGetRecords() {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/records", {
      method: "GET",
      headers: { "X-App-Password": pwd }
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    const data = await res.json();
    return { ok: true, records: data.records || [] };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvSaveRecord(record) {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/saveRecord", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: JSON.stringify({ record })
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    return { ok: true };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvSaveAllRecords(records) {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/saveAllRecords", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: JSON.stringify({ records })
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    return { ok: true };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvDeleteRecord(date) {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/deleteRecord", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: JSON.stringify({ date })
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    return { ok: true };
  } catch(e) { return { ok: false, error: "network" }; }
}

// ── KV RECORD SETTIMANALI ──
async function kvGetRecordsSett() {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/recordsSett", {
      method: "GET",
      headers: { "X-App-Password": pwd }
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    const data = await res.json();
    return { ok: true, records: data.records || [] };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvSaveRecordSett(record) {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/saveRecordSett", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: JSON.stringify({ record })
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    return { ok: true };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvDeleteRecordSett(id) {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/deleteRecordSett", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: JSON.stringify({ id })
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    return { ok: true };
  } catch(e) { return { ok: false, error: "network" }; }
}

// ── KV TO BE SABATI ──
async function kvGetTobeSabato() {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/tobeSabato", {
      method: "GET",
      headers: { "X-App-Password": pwd }
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    const data = await res.json();
    return { ok: true, items: data.items || [] };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvSaveTobeSabato(date, lead, ore) {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/saveTobeSabato", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: JSON.stringify({ date, lead, ore })
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    return { ok: true };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvGetPbi() {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/getPbi", {
      method: "GET",
      headers: { "X-App-Password": pwd }
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    const data = await res.json();
    return { ok: true, pbi: data.pbi };
  } catch(e) { return { ok: false, error: "network" }; }
}

async function kvSavePbi(pbi) {
  const pwd = getStoredPassword();
  if (!pwd) return { ok: false, error: "no_password", unauthorized: true };
  try {
    const res = await fetch(WORKER_URL + "/savePbi", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-App-Password": pwd },
      body: JSON.stringify({ pbi })
    });
    if (res.status === 401) { clearStoredPassword(); return { ok: false, error: "unauthorized", unauthorized: true }; }
    if (!res.ok) return { ok: false, error: "http_" + res.status };
    return { ok: true };
  } catch(e) { return { ok: false, error: "network" }; }
}

const HOURLY_18 = [
  { ora:2,  leads:1,   leadsU:1,   vend:null, press:"2,00", cont:"100,0", timing:null },
  { ora:7,  leads:13,  leadsU:6,   vend:null, press:"2,22", cont:"77,8",  timing:null },
  { ora:8,  leads:10,  leadsU:4,   vend:null, press:"2,33", cont:"66,7",  timing:13   },
  { ora:9,  leads:159, leadsU:82,  vend:22,   press:"2,26", cont:"72,1",  timing:97   },
  { ora:10, leads:287, leadsU:164, vend:28,   press:"2,27", cont:"70,3",  timing:86   },
  { ora:11, leads:328, leadsU:191, vend:39,   press:"2,08", cont:"68,5",  timing:98   },
  { ora:12, leads:302, leadsU:181, vend:29,   press:"1,97", cont:"67,6",  timing:99   },
  { ora:13, leads:277, leadsU:154, vend:31,   press:"2,09", cont:"60,2",  timing:100  },
  { ora:14, leads:283, leadsU:154, vend:34,   press:"2,00", cont:"64,2",  timing:100  },
  { ora:15, leads:289, leadsU:152, vend:33,   press:"2,02", cont:"62,7",  timing:93   },
  { ora:16, leads:253, leadsU:143, vend:25,   press:"1,86", cont:"63,8",  timing:100  },
  { ora:17, leads:268, leadsU:150, vend:30,   press:"1,47", cont:"62,2",  timing:86   },
  { ora:18, leads:246, leadsU:126, vend:14,   press:"1,52", cont:"57,8",  timing:85   },
  { ora:19, leads:156, leadsU:90,  vend:13,   press:"1,09", cont:"59,9",  timing:92   },
  { ora:20, leads:59,  leadsU:15,  vend:1,    press:"0,75", cont:"29,1",  timing:48   },
  { ora:21, leads:5,   leadsU:null,vend:null, press:"0,33", cont:null,    timing:null },
  { ora:22, leads:4,   leadsU:1,   vend:null, press:"1,00", cont:"33,3",  timing:null },
];
const HOURLY_19 = [
  { ora:2,  leads:1,   leadsU:1,   vend:null, press:"2,00", cont:"100,0", timing:null },
  { ora:7,  leads:13,  leadsU:6,   vend:null, press:"2,22", cont:"77,8",  timing:null },
  { ora:8,  leads:9,   leadsU:3,   vend:null, press:"2,50", cont:"62,5",  timing:13   },
  { ora:9,  leads:134, leadsU:64,  vend:17,   press:"2,41", cont:"66,4",  timing:97   },
  { ora:10, leads:224, leadsU:107, vend:13,   press:"2,48", cont:"61,6",  timing:86   },
  { ora:11, leads:243, leadsU:115, vend:21,   press:"2,38", cont:"56,2",  timing:98   },
  { ora:12, leads:227, leadsU:119, vend:21,   press:"2,19", cont:"57,3",  timing:99   },
  { ora:13, leads:236, leadsU:116, vend:26,   press:"2,27", cont:"53,2",  timing:100  },
  { ora:14, leads:228, leadsU:107, vend:14,   press:"2,22", cont:"55,6",  timing:100  },
  { ora:15, leads:227, leadsU:102, vend:27,   press:"2,28", cont:"51,0",  timing:93   },
  { ora:16, leads:197, leadsU:94,  vend:20,   press:"2,09", cont:"52,9",  timing:100  },
  { ora:17, leads:190, leadsU:76,  vend:21,   press:"1,63", cont:"45,7",  timing:86   },
  { ora:18, leads:207, leadsU:95,  vend:11,   press:"1,61", cont:"50,0",  timing:85   },
  { ora:19, leads:118, leadsU:56,  vend:9,    press:"1,10", cont:"45,2",  timing:92   },
  { ora:20, leads:48,  leadsU:6,   vend:null, press:"0,64", cont:"13,6",  timing:45   },
  { ora:21, leads:3,   leadsU:null,vend:null, press:"0,33", cont:null,    timing:null },
  { ora:22, leads:4,   leadsU:1,   vend:null, press:"1,00", cont:"33,3",  timing:null },
];

const HOURLY_17 = [
  { ora:0,  leads:2,   leadsU:1,   vend:null, press:"4,00", cont:"100,0", timing:null },
  { ora:6,  leads:1,   leadsU:null,vend:null, press:"4,00", cont:null,    timing:null },
  { ora:7,  leads:12,  leadsU:5,   vend:null, press:"3,33", cont:"55,6",  timing:null },
  { ora:8,  leads:8,   leadsU:4,   vend:null, press:"3,25", cont:"62,5",  timing:38   },
  { ora:9,  leads:125, leadsU:67,  vend:9,    press:"2,83", cont:"60,5",  timing:94   },
  { ora:10, leads:238, leadsU:107, vend:18,   press:"2,86", cont:"52,6",  timing:93   },
  { ora:11, leads:242, leadsU:113, vend:40,   press:"2,79", cont:"55,6",  timing:100  },
  { ora:12, leads:256, leadsU:129, vend:31,   press:"2,85", cont:"54,2",  timing:100  },
  { ora:13, leads:250, leadsU:144, vend:36,   press:"3,15", cont:"63,8",  timing:96   },
  { ora:14, leads:294, leadsU:133, vend:24,   press:"2,82", cont:"64,5",  timing:99   },
  { ora:15, leads:283, leadsU:132, vend:25,   press:"2,88", cont:"55,1",  timing:90   },
  { ora:16, leads:231, leadsU:118, vend:23,   press:"2,66", cont:"55,9",  timing:98   },
  { ora:17, leads:311, leadsU:142, vend:32,   press:"2,60", cont:"50,2",  timing:79   },
  { ora:18, leads:183, leadsU:87,  vend:11,   press:"2,78", cont:"64,3",  timing:95   },
  { ora:19, leads:140, leadsU:60,  vend:16,   press:"2,73", cont:"60,6",  timing:91   },
  { ora:20, leads:37,  leadsU:16,  vend:2,    press:"2,66", cont:"45,7",  timing:91   },
  { ora:21, leads:3,   leadsU:2,   vend:1,    press:"4,00", cont:"100,0", timing:null },
  { ora:22, leads:4,   leadsU:2,   vend:null, press:"1,75", cont:"50,0",  timing:null },
  { ora:23, leads:2,   leadsU:1,   vend:null, press:"2,00", cont:"50,0",  timing:null },
];

const HOURLY_16 = [
  { ora:0,  leads:1,   leadsU:1,   vend:null, press:"16,00",cont:"100,0", timing:null },
  { ora:6,  leads:1,   leadsU:null,vend:null, press:"4,00", cont:"100,0", timing:null },
  { ora:7,  leads:2,   leadsU:null,vend:null, press:null,   cont:null,    timing:null },
  { ora:8,  leads:4,   leadsU:3,   vend:null, press:"5,75", cont:"100,0", timing:25   },
  { ora:9,  leads:126, leadsU:60,  vend:10,   press:"3,94", cont:"64,9",  timing:95   },
  { ora:10, leads:221, leadsU:115, vend:22,   press:"3,78", cont:"71,0",  timing:90   },
  { ora:11, leads:253, leadsU:138, vend:30,   press:"3,24", cont:"67,7",  timing:93   },
  { ora:12, leads:349, leadsU:191, vend:39,   press:"3,20", cont:"62,7",  timing:97   },
  { ora:13, leads:325, leadsU:158, vend:32,   press:"3,56", cont:"60,1",  timing:89   },
  { ora:14, leads:297, leadsU:157, vend:35,   press:"3,27", cont:"68,4",  timing:95   },
  { ora:15, leads:261, leadsU:131, vend:25,   press:"3,55", cont:"66,0",  timing:94   },
  { ora:16, leads:253, leadsU:129, vend:44,   press:"3,46", cont:"55,7",  timing:97   },
  { ora:17, leads:231, leadsU:122, vend:24,   press:"3,33", cont:"63,3",  timing:96   },
  { ora:18, leads:203, leadsU:103, vend:23,   press:"3,18", cont:"72,8",  timing:80   },
  { ora:19, leads:189, leadsU:84,  vend:15,   press:"3,29", cont:"64,7",  timing:84   },
  { ora:20, leads:54,  leadsU:23,  vend:5,    press:"3,70", cont:"66,0",  timing:60   },
  { ora:21, leads:7,   leadsU:3,   vend:null, press:"2,67", cont:"66,7",  timing:50   },
  { ora:22, leads:2,   leadsU:1,   vend:null, press:"3,00", cont:"100,0", timing:null },
  { ora:23, leads:4,   leadsU:3,   vend:null, press:"4,75", cont:"75,0",  timing:null },
];

const HOURLY_20 = [
  { ora:0,  leads:2,   leadsU:null, press:"3,00", cont:null,    timing:null },
  { ora:4,  leads:1,   leadsU:null, press:"3,00", cont:null,    timing:null },
  { ora:5,  leads:5,   leadsU:1,    press:"2,80", cont:"40,0",  timing:null },
  { ora:6,  leads:3,   leadsU:2,    press:"3,00", cont:"66,7",  timing:null },
  { ora:7,  leads:13,  leadsU:5,    press:"3,00", cont:"58,3",  timing:null },
  { ora:8,  leads:39,  leadsU:15,   press:"2,66", cont:"71,9",  timing:3   },
  { ora:9,  leads:166, leadsU:87,   press:"2,58", cont:"73,5",  timing:94  },
  { ora:10, leads:252, leadsU:156,  press:"2,25", cont:"81,7",  timing:81  },
  { ora:11, leads:327, leadsU:187,  press:"2,28", cont:"68,3",  timing:96  },
  { ora:12, leads:275, leadsU:184,  press:"2,04", cont:"71,0",  timing:99  },
  { ora:13, leads:266, leadsU:152,  press:"2,21", cont:"62,1",  timing:89  },
  { ora:14, leads:259, leadsU:142,  press:"2,05", cont:"61,5",  timing:99  },
  { ora:15, leads:268, leadsU:149,  press:"2,05", cont:"63,4",  timing:97  },
  { ora:16, leads:266, leadsU:145,  press:"1,91", cont:"64,9",  timing:100 },
  { ora:17, leads:268, leadsU:151,  press:"1,73", cont:"70,5",  timing:91  },
  { ora:18, leads:206, leadsU:98,   press:"1,86", cont:"69,5",  timing:72  },
  { ora:19, leads:115, leadsU:57,   press:"1,71", cont:"60,2",  timing:81  },
  { ora:20, leads:44,  leadsU:18,   press:"1,40", cont:"59,5",  timing:80  },
  { ora:21, leads:8,   leadsU:4,    press:"1,75", cont:"50,0",  timing:null },
  { ora:22, leads:4,   leadsU:1,    press:"1,67", cont:"33,3",  timing:null },
  { ora:23, leads:3,   leadsU:null, press:"2,00", cont:null,    timing:null },
];

const HOURLY_23 = [
  { ora:1,  leads:1,   leadsU:null, press:"2,00", cont:null,    timing:null, dur:null   },
  { ora:5,  leads:1,   leadsU:null, press:"3,00", cont:"100,0", timing:null, dur:"3,60" },
  { ora:7,  leads:4,   leadsU:null, press:null,   cont:null,    timing:null, dur:null   },
  { ora:8,  leads:17,  leadsU:7,    press:"1,79", cont:"71,4",  timing:17,   dur:"9,60" },
  { ora:9,  leads:109, leadsU:56,   press:"1,72", cont:"68,4",  timing:97,   dur:"9,01" },
  { ora:10, leads:300, leadsU:157,  press:"1,84", cont:"70,9",  timing:73,   dur:"9,97" },
  { ora:11, leads:281, leadsU:164,  press:"1,62", cont:"62,6",  timing:99,   dur:"9,46" },
  { ora:12, leads:352, leadsU:208,  press:"1,64", cont:"66,4",  timing:94,   dur:"9,31" },
  { ora:13, leads:295, leadsU:138,  press:"1,68", cont:"55,0",  timing:94,   dur:"13,06"},
  { ora:14, leads:307, leadsU:155,  press:"1,64", cont:"57,3",  timing:93,   dur:"11,35"},
  { ora:15, leads:257, leadsU:145,  press:"1,56", cont:"65,9",  timing:97,   dur:"13,40"},
  { ora:16, leads:231, leadsU:128,  press:"1,60", cont:"65,2",  timing:100,  dur:"9,91" },
  { ora:17, leads:270, leadsU:155,  press:"1,57", cont:"64,8",  timing:96,   dur:"12,64"},
  { ora:18, leads:222, leadsU:100,  press:"1,13", cont:"52,0",  timing:82,   dur:"15,69"},
  { ora:19, leads:115, leadsU:48,   press:"1,05", cont:"51,0",  timing:81,   dur:"11,96"},
  { ora:20, leads:42,  leadsU:18,   press:"0,97", cont:"50,0",  timing:94,   dur:"6,21" },
  { ora:21, leads:4,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:22, leads:3,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:1,   leadsU:null, press:null,   cont:null,    timing:null, dur:null   },
];


const HOURLY_27 = [
  { ora:0,  leads:10,  leadsU:6,    press:"3,33", cont:"88,9",  timing:null, dur:"5,79" },
  { ora:1,  leads:2,   leadsU:1,    press:"2,50", cont:"50,0",  timing:null, dur:"1,72" },
  { ora:2,  leads:9,   leadsU:6,    press:"3,38", cont:"100,0", timing:null, dur:"1,60" },
  { ora:3,  leads:7,   leadsU:2,    press:"3,33", cont:"33,3",  timing:null, dur:"11,19"},
  { ora:4,  leads:2,   leadsU:2,    press:"6,50", cont:"100,0", timing:null, dur:"0,99" },
  { ora:5,  leads:2,   leadsU:1,    press:"4,00", cont:"100,0", timing:null, dur:"48,02"},
  { ora:6,  leads:17,  leadsU:6,    press:"3,59", cont:"76,5",  timing:null, dur:"3,62" },
  { ora:7,  leads:16,  leadsU:3,    press:"3,77", cont:"46,2",  timing:null, dur:"13,73"},
  { ora:8,  leads:23,  leadsU:9,    press:"3,48", cont:"85,7",  timing:24,   dur:"2,33" },
  { ora:9,  leads:104, leadsU:51,   press:"3,24", cont:"73,7",  timing:100,  dur:"6,42" },
  { ora:10, leads:168, leadsU:104,  press:"2,91", cont:"77,1",  timing:93,   dur:"9,22" },
  { ora:11, leads:304, leadsU:195,  press:"2,84", cont:"83,8",  timing:98,   dur:"7,56" },
  { ora:12, leads:282, leadsU:181,  press:"2,87", cont:"79,6",  timing:93,   dur:"8,39" },
  { ora:13, leads:212, leadsU:119,  press:"3,18", cont:"72,0",  timing:99,   dur:"6,93" },
  { ora:14, leads:268, leadsU:145,  press:"3,17", cont:"69,3",  timing:99,   dur:"7,91" },
  { ora:15, leads:225, leadsU:138,  press:"3,14", cont:"63,8",  timing:99,   dur:"8,06" },
  { ora:16, leads:238, leadsU:143,  press:"2,67", cont:"63,6",  timing:97,   dur:"10,27"},
  { ora:17, leads:254, leadsU:145,  press:"2,76", cont:"69,2",  timing:87,   dur:"9,38" },
  { ora:18, leads:211, leadsU:127,  press:"2,70", cont:"73,7",  timing:99,   dur:"5,42" },
  { ora:19, leads:134, leadsU:77,   press:"2,75", cont:"75,4",  timing:95,   dur:"7,48" },
  { ora:20, leads:71,  leadsU:31,   press:"2,98", cont:"63,8",  timing:29,   dur:"7,92" },
  { ora:21, leads:4,   leadsU:2,    press:"4,00", cont:"75,0",  timing:null, dur:"1,87" },
  { ora:22, leads:6,   leadsU:3,    press:"4,25", cont:"75,0",  timing:null, dur:"0,30" },
];

const HOURLY_26 = [
  { ora:3,  leads:1,   leadsU:null, press:"5,00", cont:null,    timing:null, dur:null   },
  { ora:5,  leads:2,   leadsU:1,    press:"5,00", cont:"100,0", timing:null, dur:"8,08" },
  { ora:7,  leads:2,   leadsU:null, press:null,   cont:null,    timing:null, dur:null   },
  { ora:8,  leads:14,  leadsU:8,    press:"3,46", cont:"84,6",  timing:null, dur:"10,98"},
  { ora:9,  leads:95,  leadsU:51,   press:"4,28", cont:"66,3",  timing:79,   dur:"7,47" },
  { ora:10, leads:194, leadsU:102,  press:"3,33", cont:"75,9",  timing:53,   dur:"5,52" },
  { ora:11, leads:204, leadsU:95,   press:"3,48", cont:"62,8",  timing:89,   dur:"5,89" },
  { ora:12, leads:164, leadsU:83,   press:"3,75", cont:"56,8",  timing:100,  dur:"5,88" },
  { ora:13, leads:167, leadsU:92,   press:"3,17", cont:"59,9",  timing:92,   dur:"5,74" },
  { ora:14, leads:176, leadsU:85,   press:"3,44", cont:"60,0",  timing:100,  dur:"10,08"},
  { ora:15, leads:179, leadsU:90,   press:"2,97", cont:"53,9",  timing:100,  dur:"8,57" },
  { ora:16, leads:189, leadsU:88,   press:"3,46", cont:"61,2",  timing:99,   dur:"7,27" },
  { ora:17, leads:198, leadsU:102,  press:"3,46", cont:"67,9",  timing:100,  dur:"5,67" },
  { ora:18, leads:187, leadsU:86,   press:"3,77", cont:"64,5",  timing:87,   dur:"3,53" },
  { ora:19, leads:120, leadsU:56,   press:"3,35", cont:"74,1",  timing:87,   dur:"7,91" },
  { ora:20, leads:84,  leadsU:29,   press:"3,41", cont:"63,5",  timing:55,   dur:"2,53" },
  { ora:21, leads:34,  leadsU:14,   press:"3,61", cont:"75,8",  timing:null, dur:"1,44" },
  { ora:22, leads:18,  leadsU:6,    press:"4,00", cont:"83,3",  timing:null, dur:"1,40" },
  { ora:23, leads:16,  leadsU:7,    press:"3,06", cont:"68,8",  timing:null, dur:"2,22" },
];

const HOURLY_25 = [
  { ora:0,  leads:4,   leadsU:null, press:"4,50", cont:null,    timing:null, dur:null   },
  { ora:2,  leads:1,   leadsU:null, press:"5,00", cont:null,    timing:null, dur:null   },
  { ora:4,  leads:1,   leadsU:null, press:"5,00", cont:null,    timing:null, dur:null   },
  { ora:7,  leads:6,   leadsU:3,    press:"5,00", cont:"100,0", timing:null, dur:"0,41" },
  { ora:8,  leads:14,  leadsU:7,    press:"3,82", cont:"81,8",  timing:10,   dur:"4,04" },
  { ora:9,  leads:106, leadsU:58,   press:"3,27", cont:"78,4",  timing:93,   dur:"8,15" },
  { ora:10, leads:242, leadsU:160,  press:"2,85", cont:"84,1",  timing:85,   dur:"7,03" },
  { ora:11, leads:361, leadsU:244,  press:"2,90", cont:"78,4",  timing:87,   dur:"8,11" },
  { ora:12, leads:294, leadsU:210,  press:"2,45", cont:"80,3",  timing:99,   dur:"7,85" },
  { ora:13, leads:260, leadsU:167,  press:"2,97", cont:"71,4",  timing:100,  dur:"8,34" },
  { ora:14, leads:245, leadsU:155,  press:"3,05", cont:"65,7",  timing:99,   dur:"10,88"},
  { ora:15, leads:226, leadsU:130,  press:"3,12", cont:"67,3",  timing:99,   dur:"8,27" },
  { ora:16, leads:233, leadsU:126,  press:"2,81", cont:"60,6",  timing:99,   dur:"9,31" },
  { ora:17, leads:252, leadsU:151,  press:"2,77", cont:"74,0",  timing:90,   dur:"9,93" },
  { ora:18, leads:204, leadsU:108,  press:"2,81", cont:"75,5",  timing:89,   dur:"5,88" },
  { ora:19, leads:121, leadsU:72,   press:"3,45", cont:"76,7",  timing:97,   dur:"5,29" },
  { ora:20, leads:44,  leadsU:22,   press:"2,98", cont:"73,8",  timing:70,   dur:"5,09" },
  { ora:21, leads:4,   leadsU:2,    press:"5,50", cont:"75,0",  timing:null, dur:"1,82" },
  { ora:23, leads:2,   leadsU:null, press:"5,00", cont:null,    timing:null, dur:null   },
];

const HOURLY_24 = [
  { ora:0,  leads:1,   leadsU:null, press:"4,00", cont:"100,0", timing:null, dur:null   },
  { ora:6,  leads:2,   leadsU:null, press:"3,00", cont:null,    timing:null, dur:null   },
  { ora:7,  leads:7,   leadsU:1,    press:"1,50", cont:"100,0", timing:null, dur:"3,09" },
  { ora:8,  leads:26,  leadsU:12,   press:"2,40", cont:"88,0",  timing:18,   dur:"6,95" },
  { ora:9,  leads:99,  leadsU:55,   press:"2,10", cont:"75,0",  timing:97,   dur:"8,97" },
  { ora:10, leads:234, leadsU:134,  press:"2,01", cont:"75,3",  timing:96,   dur:"7,20" },
  { ora:11, leads:355, leadsU:210,  press:"2,00", cont:"77,8",  timing:92,   dur:"8,17" },
  { ora:12, leads:337, leadsU:206,  press:"2,01", cont:"70,9",  timing:96,   dur:"9,30" },
  { ora:13, leads:211, leadsU:119,  press:"2,03", cont:"65,4",  timing:96,   dur:"11,29"},
  { ora:14, leads:243, leadsU:151,  press:"2,01", cont:"68,8",  timing:96,   dur:"10,55"},
  { ora:15, leads:284, leadsU:171,  press:"1,91", cont:"66,5",  timing:94,   dur:"12,09"},
  { ora:16, leads:290, leadsU:180,  press:"1,73", cont:"70,6",  timing:94,   dur:"11,41"},
  { ora:17, leads:268, leadsU:143,  press:"1,52", cont:"62,5",  timing:98,   dur:"10,82"},
  { ora:18, leads:301, leadsU:148,  press:"1,07", cont:"54,6",  timing:73,   dur:"11,61"},
  { ora:19, leads:126, leadsU:55,   press:"0,98", cont:"52,7",  timing:83,   dur:"13,98"},
  { ora:20, leads:60,  leadsU:16,   press:"1,04", cont:"35,2",  timing:71,   dur:"14,18"},
  { ora:21, leads:8,   leadsU:null, press:"0,14", cont:null,    timing:14,   dur:null   },
  { ora:22, leads:4,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:3,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
];
const HOURLY_0304 = [
  { ora:1,  leads:2,   leadsU:1,    press:"3,00", cont:"100,0", timing:null, dur:"4,07" },
  { ora:3,  leads:1,   leadsU:null, press:"3,00", cont:null,    timing:null, dur:null   },
  { ora:4,  leads:1,   leadsU:null, press:"5,00", cont:null,    timing:null, dur:null   },
  { ora:6,  leads:1,   leadsU:1,    press:"1,00", cont:"100,0", timing:null, dur:"6,77" },
  { ora:7,  leads:5,   leadsU:2,    press:"3,80", cont:"60,0",  timing:40,   dur:"15,55"},
  { ora:8,  leads:21,  leadsU:11,   press:"3,05", cont:"75,0",  timing:4,    dur:"2,01" },
  { ora:9,  leads:99,  leadsU:56,   press:"3,13", cont:"68,5",  timing:88,   dur:"7,80" },
  { ora:10, leads:164, leadsU:98,   press:"2,64", cont:"68,9",  timing:86,   dur:"11,15"},
  { ora:11, leads:213, leadsU:133,  press:"2,36", cont:"72,4",  timing:98,   dur:"8,70" },
  { ora:12, leads:219, leadsU:141,  press:"2,16", cont:"67,8",  timing:98,   dur:"9,54" },
  { ora:13, leads:195, leadsU:125,  press:"2,55", cont:"75,3",  timing:95,   dur:"10,66"},
  { ora:14, leads:247, leadsU:127,  press:"2,62", cont:"58,5",  timing:97,   dur:"10,59"},
  { ora:15, leads:242, leadsU:145,  press:"2,36", cont:"73,0",  timing:92,   dur:"12,20"},
  { ora:16, leads:213, leadsU:141,  press:"2,32", cont:"73,2",  timing:99,   dur:"10,50"},
  { ora:17, leads:219, leadsU:141,  press:"1,98", cont:"70,8",  timing:99,   dur:"10,52"},
  { ora:18, leads:194, leadsU:103,  press:"2,29", cont:"72,8",  timing:94,   dur:"6,67" },
  { ora:19, leads:127, leadsU:62,   press:"2,00", cont:"61,5",  timing:84,   dur:"8,64" },
  { ora:20, leads:32,  leadsU:20,   press:"2,07", cont:"80,0",  timing:100,  dur:"7,69" },
  { ora:21, leads:5,   leadsU:null, press:"1,75", cont:"25,0",  timing:null, dur:"0,58" },
  { ora:22, leads:2,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:5,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
];

const HOURLY_0204 = [
  { ora:5,  leads:1,   leadsU:null, press:null,   cont:null,    timing:null, dur:null   },
  { ora:7,  leads:2,   leadsU:1,    press:"3,00", cont:"50,0",  timing:null, dur:"19,63"},
  { ora:8,  leads:17,  leadsU:7,    press:"3,57", cont:"64,3",  timing:29,   dur:"3,73" },
  { ora:9,  leads:103, leadsU:54,   press:"2,96", cont:"70,3",  timing:90,   dur:"9,78" },
  { ora:10, leads:187, leadsU:112,  press:"2,48", cont:"80,5",  timing:96,   dur:"9,54" },
  { ora:11, leads:292, leadsU:192,  press:"2,28", cont:"75,9",  timing:94,   dur:"9,39" },
  { ora:12, leads:237, leadsU:151,  press:"2,27", cont:"73,8",  timing:99,   dur:"9,03" },
  { ora:13, leads:256, leadsU:133,  press:"2,57", cont:"60,2",  timing:92,   dur:"8,49" },
  { ora:14, leads:241, leadsU:145,  press:"2,31", cont:"71,1",  timing:99,   dur:"9,23" },
  { ora:15, leads:278, leadsU:149,  press:"2,35", cont:"65,5",  timing:99,   dur:"13,83"},
  { ora:16, leads:225, leadsU:121,  press:"2,25", cont:"61,7",  timing:100,  dur:"9,04" },
  { ora:17, leads:236, leadsU:122,  press:"1,94", cont:"59,3",  timing:99,   dur:"12,18"},
  { ora:18, leads:254, leadsU:115,  press:"1,94", cont:"54,8",  timing:84,   dur:"9,14" },
  { ora:19, leads:137, leadsU:56,   press:"1,63", cont:"47,5",  timing:97,   dur:"10,79"},
  { ora:20, leads:32,  leadsU:14,   press:"1,26", cont:"54,8",  timing:95,   dur:"14,44"},
  { ora:21, leads:4,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:22, leads:5,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:1,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
];

const HOURLY_0104 = [
  { ora:3,  leads:1,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:4,  leads:1,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:7,  leads:7,   leadsU:null, press:"3,50", cont:"16,7",  timing:null, dur:"3,42" },
  { ora:8,  leads:31,  leadsU:9,    press:"3,27", cont:"59,1",  timing:5,    dur:"1,20" },
  { ora:9,  leads:119, leadsU:67,   press:"2,46", cont:"73,9",  timing:94,   dur:"6,21" },
  { ora:10, leads:203, leadsU:121,  press:"2,47", cont:"72,3",  timing:71,   dur:"9,76" },
  { ora:11, leads:218, leadsU:136,  press:"2,45", cont:"77,1",  timing:80,   dur:"5,44" },
  { ora:12, leads:206, leadsU:125,  press:"2,27", cont:"71,1",  timing:100,  dur:"9,12" },
  { ora:13, leads:177, leadsU:96,   press:"2,54", cont:"62,3",  timing:99,   dur:"10,13"},
  { ora:14, leads:192, leadsU:107,  press:"2,38", cont:"66,7",  timing:100,  dur:"12,71"},
  { ora:15, leads:233, leadsU:142,  press:"2,37", cont:"71,0",  timing:95,   dur:"10,06"},
  { ora:16, leads:229, leadsU:137,  press:"2,13", cont:"65,7",  timing:99,   dur:"14,68"},
  { ora:17, leads:244, leadsU:142,  press:"1,73", cont:"67,4",  timing:96,   dur:"10,28"},
  { ora:18, leads:219, leadsU:132,  press:"1,96", cont:"65,9",  timing:99,   dur:"10,47"},
  { ora:19, leads:128, leadsU:66,   press:"1,55", cont:"61,7",  timing:95,   dur:"8,72" },
  { ora:20, leads:36,  leadsU:16,   press:"1,00", cont:"71,0",  timing:70,   dur:"9,47" },
  { ora:21, leads:2,   leadsU:1,    press:"1,00", cont:"50,0",  timing:100,  dur:"0,73" },
  { ora:22, leads:1,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:10,  leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
];

const HOURLY_31 = [
  { ora:0,  leads:1,   leadsU:null, press:null,   cont:null,    timing:null, dur:null    },
  { ora:3,  leads:1,   leadsU:null, press:null,   cont:null,    timing:null, dur:null    },
  { ora:5,  leads:1,   leadsU:null, press:null,   cont:null,    timing:null, dur:null    },
  { ora:7,  leads:9,   leadsU:3,    press:"3,50", cont:"50,0",  timing:null, dur:"4,67"  },
  { ora:8,  leads:28,  leadsU:13,   press:"2,67", cont:"66,7",  timing:8,    dur:"11,15" },
  { ora:9,  leads:111, leadsU:60,   press:"2,30", cont:"84,0",  timing:81,   dur:"7,83"  },
  { ora:10, leads:140, leadsU:82,   press:"2,11", cont:"70,2",  timing:99,   dur:"5,90"  },
  { ora:11, leads:267, leadsU:150,  press:"2,02", cont:"64,8",  timing:99,   dur:"7,15"  },
  { ora:12, leads:276, leadsU:170,  press:"1,88", cont:"68,3",  timing:100,  dur:"6,13"  },
  { ora:13, leads:241, leadsU:138,  press:"2,10", cont:"59,2",  timing:91,   dur:"8,93"  },
  { ora:14, leads:278, leadsU:130,  press:"2,16", cont:"52,0",  timing:57,   dur:"8,39"  },
  { ora:15, leads:242, leadsU:125,  press:"1,62", cont:"58,4",  timing:95,   dur:"12,98" },
  { ora:16, leads:227, leadsU:118,  press:"1,57", cont:"59,6",  timing:99,   dur:"8,56"  },
  { ora:17, leads:238, leadsU:118,  press:"1,27", cont:"56,3",  timing:98,   dur:"11,05" },
  { ora:18, leads:242, leadsU:119,  press:"1,09", cont:"54,7",  timing:75,   dur:"11,54" },
  { ora:19, leads:121, leadsU:59,   press:"1,02", cont:"55,9",  timing:59,   dur:"10,11" },
  { ora:20, leads:32,  leadsU:14,   press:"0,93", cont:"53,6",  timing:70,   dur:"10,12" },
  { ora:21, leads:1,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null    },
  { ora:22, leads:4,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null    },
];

const HOURLY_30 = [
  { ora:0,  leads:1,   leadsU:null, press:"3,00", cont:"100,0", timing:null, dur:"2,02" },
  { ora:6,  leads:1,   leadsU:null, press:"3,00", cont:null,    timing:null, dur:null   },
  { ora:7,  leads:1,   leadsU:null, press:null,   cont:null,    timing:null, dur:null   },
  { ora:8,  leads:17,  leadsU:8,    press:"2,21", cont:"64,3",  timing:23,   dur:"8,06" },
  { ora:9,  leads:100, leadsU:52,   press:"2,36", cont:"67,4",  timing:98,   dur:"6,90" },
  { ora:10, leads:237, leadsU:134,  press:"2,12", cont:"67,6",  timing:78,   dur:"8,16" },
  { ora:11, leads:252, leadsU:179,  press:"1,97", cont:"76,4",  timing:83,   dur:"9,63" },
  { ora:12, leads:259, leadsU:143,  press:"2,22", cont:"62,1",  timing:98,   dur:"8,96" },
  { ora:13, leads:232, leadsU:134,  press:"1,99", cont:"66,5",  timing:95,   dur:"9,89" },
  { ora:14, leads:256, leadsU:155,  press:"1,95", cont:"71,4",  timing:95,   dur:"10,48"},
  { ora:15, leads:242, leadsU:135,  press:"1,84", cont:"64,4",  timing:91,   dur:"10,77"},
  { ora:16, leads:249, leadsU:150,  press:"1,53", cont:"70,0",  timing:98,   dur:"10,42"},
  { ora:17, leads:255, leadsU:138,  press:"1,19", cont:"61,8",  timing:93,   dur:"11,24"},
  { ora:18, leads:225, leadsU:107,  press:"1,09", cont:"56,6",  timing:83,   dur:"10,62"},
  { ora:19, leads:123, leadsU:61,   press:"0,94", cont:"57,8",  timing:83,   dur:"12,77"},
  { ora:20, leads:49,  leadsU:19,   press:"0,87", cont:"55,6",  timing:45,   dur:"9,42" },
  { ora:21, leads:12,  leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:22, leads:2,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:1,   leadsU:null, press:"0,00", cont:null,    timing:null, dur:null   },
];

// TO BE per macrofornitore — storico pianificazioni
// "from" = data di entrata in vigore (GG/MM), il sistema usa il piano più recente <= data record
const HOURLY_0904 = [
  { ora:8,  leads:17,  leadsU:5,   press:"2,64", cont:"57,1",  timing:15,  dur:"2,28"  },
  { ora:9,  leads:132, leadsU:54,  press:"2,25", cont:"65,8",  timing:88,  dur:"9,39"  },
  { ora:10, leads:217, leadsU:123, press:"1,84", cont:"76,4",  timing:95,  dur:"7,64"  },
  { ora:11, leads:297, leadsU:174, press:"1,92", cont:"69,6",  timing:97,  dur:"10,79" },
  { ora:12, leads:276, leadsU:165, press:"1,69", cont:"64,1",  timing:88,  dur:"9,55"  },
  { ora:13, leads:226, leadsU:125, press:"1,70", cont:"58,4",  timing:90,  dur:"7,83"  },
  { ora:14, leads:243, leadsU:129, press:"1,63", cont:"63,1",  timing:98,  dur:"10,60" },
  { ora:15, leads:274, leadsU:147, press:"1,66", cont:"63,2",  timing:85,  dur:"10,64" },
  { ora:16, leads:278, leadsU:143, press:"1,65", cont:"57,4",  timing:83,  dur:"8,00"  },
  { ora:17, leads:249, leadsU:135, press:"1,56", cont:"63,6",  timing:93,  dur:"9,58"  },
  { ora:18, leads:159, leadsU:85,  press:"1,51", cont:"60,7",  timing:95,  dur:"13,18" },
  { ora:19, leads:76,  leadsU:46,  press:"1,45", cont:"63,0",  timing:100, dur:"11,53" },
  { ora:20, leads:31,  leadsU:14,  press:"1,41", cont:"55,2",  timing:56,  dur:"13,57" },
  { ora:21, leads:3,   leadsU:null,press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:22, leads:5,   leadsU:null,press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:1,   leadsU:null,press:"0,00", cont:null,    timing:null, dur:null   },
];

const HOURLY_0804 = [
  { ora:7,  leads:9,   leadsU:6,   press:"1,88", cont:"87,5",  timing:null, dur:"1,31"  },
  { ora:8,  leads:23,  leadsU:13,  press:"2,00", cont:"76,2",  timing:null, dur:"5,23"  },
  { ora:9,  leads:123, leadsU:50,  press:"2,27", cont:"62,8",  timing:64,   dur:"6,95"  },
  { ora:10, leads:138, leadsU:55,  press:"2,17", cont:"60,8",  timing:93,   dur:"7,79"  },
  { ora:11, leads:211, leadsU:101, press:"2,14", cont:"69,3",  timing:85,   dur:"8,45"  },
  { ora:12, leads:188, leadsU:102, press:"1,97", cont:"73,1",  timing:92,   dur:"6,91"  },
  { ora:13, leads:206, leadsU:93,  press:"2,09", cont:"66,7",  timing:94,   dur:"6,32"  },
  { ora:14, leads:180, leadsU:80,  press:"1,85", cont:"49,7",  timing:99,   dur:"10,76" },
  { ora:15, leads:239, leadsU:107, press:"1,80", cont:"48,6",  timing:93,   dur:"13,48" },
  { ora:16, leads:174, leadsU:74,  press:"1,69", cont:"46,6",  timing:100,  dur:"11,59" },
  { ora:17, leads:140, leadsU:71,  press:"1,63", cont:"56,8",  timing:94,   dur:"9,22"  },
  { ora:18, leads:95,  leadsU:33,  press:"1,61", cont:"41,5",  timing:94,   dur:"9,55"  },
  { ora:19, leads:74,  leadsU:27,  press:"1,79", cont:"42,4",  timing:82,   dur:"5,23"  },
  { ora:20, leads:28,  leadsU:11,  press:"1,48", cont:"40,0",  timing:60,   dur:"8,85"  },
  { ora:21, leads:5,   leadsU:null,press:"0,00", cont:null,    timing:null, dur:null    },
  { ora:22, leads:1,   leadsU:null,press:"0,00", cont:null,    timing:null, dur:null    },
];

const HOURLY_0704 = [
  { ora:8,  leads:11,  leadsU:1,   press:"2,56", cont:"44,4",  timing:44,  dur:"1,68"  },
  { ora:9,  leads:65,  leadsU:34,  press:"2,11", cont:"70,5",  timing:90,  dur:"3,64"  },
  { ora:10, leads:127, leadsU:62,  press:"2,03", cont:"68,4",  timing:77,  dur:"7,11"  },
  { ora:11, leads:219, leadsU:104, press:"2,08", cont:"73,0",  timing:84,  dur:"6,76"  },
  { ora:12, leads:186, leadsU:100, press:"1,89", cont:"72,6",  timing:96,  dur:"8,47"  },
  { ora:13, leads:183, leadsU:74,  press:"1,98", cont:"56,9",  timing:95,  dur:"7,34"  },
  { ora:14, leads:197, leadsU:97,  press:"1,78", cont:"53,6",  timing:97,  dur:"10,49" },
  { ora:15, leads:215, leadsU:97,  press:"1,70", cont:"48,8",  timing:84,  dur:"10,11" },
  { ora:16, leads:190, leadsU:97,  press:"1,77", cont:"56,7",  timing:91,  dur:"7,99"  },
  { ora:17, leads:179, leadsU:71,  press:"1,70", cont:"44,0",  timing:81,  dur:"10,44" },
  { ora:18, leads:166, leadsU:57,  press:"1,21", cont:"37,5",  timing:89,  dur:"9,31"  },
  { ora:19, leads:83,  leadsU:32,  press:"1,12", cont:"41,0",  timing:94,  dur:"10,03" },
  { ora:20, leads:25,  leadsU:7,   press:"1,24", cont:"38,1",  timing:76,  dur:"17,04" },
  { ora:21, leads:4,   leadsU:null,press:"0,50", cont:null,    timing:null, dur:null   },
  { ora:22, leads:4,   leadsU:null,press:"0,00", cont:null,    timing:null, dur:null   },
  { ora:23, leads:1,   leadsU:null,press:"0,00", cont:null,    timing:null, dur:null   },
];

const HOURLY_1004 = [
  { ora:7,  leads:13,  leadsU:6,   press:"3,00", cont:"66,7",  timing:null, dur:"4,60"  },
  { ora:8,  leads:30,  leadsU:10,  press:"2,93", cont:"59,3",  timing:16,   dur:"6,47"  },
  { ora:9,  leads:110, leadsU:60,  press:"2,61", cont:"69,9",  timing:83,   dur:"6,37"  },
  { ora:10, leads:172, leadsU:89,  press:"2,29", cont:"73,3",  timing:75,   dur:"7,08"  },
  { ora:11, leads:225, leadsU:141, press:"2,28", cont:"78,3",  timing:99,   dur:"8,46"  },
  { ora:12, leads:246, leadsU:148, press:"2,11", cont:"70,7",  timing:98,   dur:"9,04"  },
  { ora:13, leads:245, leadsU:151, press:"2,10", cont:"72,2",  timing:94,   dur:"10,92" },
  { ora:14, leads:238, leadsU:135, press:"2,14", cont:"64,4",  timing:99,   dur:"11,08" },
  { ora:15, leads:236, leadsU:146, press:"2,09", cont:"68,8",  timing:88,   dur:"9,14"  },
  { ora:16, leads:231, leadsU:131, press:"1,81", cont:"67,9",  timing:78,   dur:"12,00" },
  { ora:17, leads:190, leadsU:106, press:"1,63", cont:"64,0",  timing:83,   dur:"9,36"  },
  { ora:18, leads:106, leadsU:70,  press:"1,68", cont:"73,5",  timing:100,  dur:"10,28" },
  { ora:19, leads:76,  leadsU:48,  press:"1,88", cont:"78,0",  timing:72,   dur:"7,99"  },
  { ora:20, leads:23,  leadsU:13,  press:"1,81", cont:"76,2",  timing:75,   dur:"3,19"  },
  { ora:21, leads:4,   leadsU:null,press:"2,50", cont:"25,0",  timing:null, dur:null    },
  { ora:22, leads:9,   leadsU:2,   press:"1,88", cont:"25,0",  timing:null, dur:"1,53"  },
  { ora:23, leads:1,   leadsU:null,press:"2,00", cont:null,    timing:null, dur:null    },
];

const HOURLY_1304 = [
  { ora:0,  leads:2,   leadsU:null, press:"1,00", cont:null,   timing:null, dur:null   },
  { ora:1,  leads:1,   leadsU:1,    press:"2,00", cont:"100,0",timing:null, dur:"1,07" },
  { ora:7,  leads:1,   leadsU:null, press:null,   cont:null,   timing:null, dur:null   },
  { ora:8,  leads:10,  leadsU:3,    press:"2,13", cont:"62,5", timing:null, dur:"3,05" },
  { ora:9,  leads:104, leadsU:48,   press:"2,06", cont:"61,5", timing:61,   dur:"7,41" },
  { ora:10, leads:106, leadsU:48,   press:"1,94", cont:"69,1", timing:99,   dur:"6,13" },
  { ora:11, leads:203, leadsU:93,   press:"2,18", cont:"67,9", timing:89,   dur:"8,49" },
  { ora:12, leads:233, leadsU:84,   press:"2,00", cont:"66,8", timing:76,   dur:"6,38" },
  { ora:13, leads:182, leadsU:79,   press:"1,96", cont:"62,7", timing:85,   dur:"8,97" },
  { ora:14, leads:196, leadsU:82,   press:"1,81", cont:"50,0", timing:87,   dur:"7,66" },
  { ora:15, leads:177, leadsU:80,   press:"1,68", cont:"48,8", timing:91,   dur:"10,19"},
  { ora:16, leads:198, leadsU:75,   press:"1,10", cont:"41,8", timing:92,   dur:"13,89"},
  { ora:17, leads:210, leadsU:74,   press:"1,10", cont:"39,8", timing:75,   dur:"11,18"},
  { ora:18, leads:134, leadsU:38,   press:"1,02", cont:"30,2", timing:83,   dur:"11,69"},
  { ora:19, leads:66,  leadsU:24,   press:"1,07", cont:"38,6", timing:72,   dur:"5,34" },
  { ora:20, leads:12,  leadsU:6,    press:"1,00", cont:"54,5", timing:91,   dur:"15,49"},
  { ora:21, leads:7,   leadsU:null, press:null,   cont:null,   timing:null, dur:null   },
  { ora:23, leads:3,   leadsU:null, press:null,   cont:null,   timing:null, dur:null   },
];

const HOURLY_1104 = [
  { ora:0,  leads:2,   leadsU:null, press:"3,50", cont:"100,0", timing:null, dur:"0,14"  },
  { ora:1,  leads:1,   leadsU:1,    press:"1,00", cont:"100,0", timing:null, dur:"33,02" },
  { ora:2,  leads:1,   leadsU:1,    press:"1,00", cont:"100,0", timing:null, dur:"3,83"  },
  { ora:5,  leads:1,   leadsU:null, press:"2,00", cont:null,    timing:null, dur:null    },
  { ora:7,  leads:1,   leadsU:null, press:"2,00", cont:null,    timing:null, dur:null    },
  { ora:8,  leads:5,   leadsU:3,    press:"2,00", cont:"80,0",  timing:null, dur:"1,10"  },
  { ora:9,  leads:51,  leadsU:25,   press:"3,15", cont:"76,6",  timing:50,   dur:"4,58"  },
  { ora:10, leads:162, leadsU:89,   press:"2,44", cont:"73,0",  timing:97,   dur:"6,19"  },
  { ora:11, leads:222, leadsU:133,  press:"2,24", cont:"69,7",  timing:98,   dur:"7,88"  },
  { ora:12, leads:192, leadsU:100,  press:"1,90", cont:"58,4",  timing:97,   dur:"11,15" },
  { ora:13, leads:121, leadsU:64,   press:"1,86", cont:"59,3",  timing:97,   dur:"10,19" },
  { ora:14, leads:72,  leadsU:40,   press:"2,28", cont:"73,3",  timing:98,   dur:"6,61"  },
  { ora:15, leads:9,   leadsU:3,    press:"2,00", cont:"66,7",  timing:25,   dur:"4,06"  },
  { ora:16, leads:6,   leadsU:3,    press:"2,00", cont:"80,0",  timing:null, dur:"1,95"  },
  { ora:17, leads:4,   leadsU:1,    press:"0,33", cont:"33,3",  timing:null, dur:"2,05"  },
  { ora:18, leads:1,   leadsU:null, press:"1,67", cont:null,    timing:null, dur:"0,18"  },
  { ora:19, leads:3,   leadsU:1,    press:"1,67", cont:"66,7",  timing:null, dur:"2,59"  },
  { ora:20, leads:3,   leadsU:null, press:"1,67", cont:"33,3",  timing:null, dur:"0,22"  },
  { ora:21, leads:3,   leadsU:2,    press:"2,00", cont:"100,0", timing:null, dur:"28,53" },
];

const HOURLY_1404 = [
  { ora:0,  leads:1,   leadsU:null, press:null,   cont:null,   timing:null, dur:null   },
  { ora:5,  leads:1,   leadsU:1,    press:"7,00", cont:"100,0",timing:null, dur:"10,58"},
  { ora:7,  leads:4,   leadsU:1,    press:"2,00", cont:"50,0", timing:null, dur:"1,09" },
  { ora:8,  leads:19,  leadsU:8,    press:"2,00", cont:"75,0", timing:null, dur:"4,49" },
  { ora:9,  leads:99,  leadsU:47,   press:"2,04", cont:"65,6", timing:85,   dur:"6,88" },
  { ora:10, leads:107, leadsU:50,   press:"2,07", cont:"62,7", timing:97,   dur:"7,20" },
  { ora:11, leads:206, leadsU:90,   press:"1,93", cont:"54,8", timing:89,   dur:"8,41" },
  { ora:12, leads:166, leadsU:75,   press:"1,79", cont:"48,4", timing:97,   dur:"10,17"},
  { ora:13, leads:154, leadsU:68,   press:"1,81", cont:"50,3", timing:90,   dur:"12,99"},
  { ora:14, leads:158, leadsU:73,   press:"1,76", cont:"53,6", timing:93,   dur:"8,18" },
  { ora:15, leads:196, leadsU:79,   press:"1,70", cont:"46,4", timing:94,   dur:"14,67"},
  { ora:16, leads:167, leadsU:75,   press:"1,79", cont:"51,7", timing:96,   dur:"9,15" },
  { ora:17, leads:120, leadsU:49,   press:"1,66", cont:"45,0", timing:88,   dur:"12,50"},
  { ora:18, leads:127, leadsU:52,   press:"1,23", cont:"47,3", timing:70,   dur:"13,65"},
  { ora:19, leads:71,  leadsU:23,   press:"1,05", cont:"35,9", timing:86,   dur:"10,53"},
  { ora:20, leads:20,  leadsU:3,    press:"0,60", cont:"15,0", timing:55,   dur:"3,39" },
  { ora:21, leads:7,   leadsU:3,    press:"0,86", cont:"42,9", timing:43,   dur:"6,05" },
  { ora:22, leads:1,   leadsU:null, press:null,   cont:null,   timing:null, dur:null   },
  { ora:23, leads:1,   leadsU:null, press:null,   cont:null,   timing:null, dur:null   },
];

const MACRO_TOBE_SCHEDULE = [
  {
    from: "27/03",
    tobe: {
      "SPINUP SOCIAL":       750,
      "GALANO GOOGLE CALDE": 723,
      "GALANO GOOGLE CTC":   680,
      "GALANO SOCIAL":       250,
      "PAOLO SOCIAL":        150,
      "ETC":                 133,
    }
  },
  {
    from: "01/04",
    tobe: {
      "SPINUP SOCIAL":       750,
      "GALANO GOOGLE CALDE": 781,
      "GALANO GOOGLE CTC":   723,
      "GALANO SOCIAL":       250,
      "PAOLO SOCIAL":        174,
      "ETC":                 151,
    }
  }
];

// TO BE orario per fascia — storico pianificazioni
const HOURLY_TOBE_SCHEDULE = [
  {
    from: "27/03",
    tobe: { 8:5, 9:118, 10:211, 11:357, 12:345, 13:288, 14:315, 15:261, 16:268, 17:229, 18:156, 19:103, 20:38 }
  },
  {
    from: "01/04",
    tobe: { 8:5, 9:111, 10:192, 11:321, 12:342, 13:319, 14:364, 15:296, 16:299, 17:266, 18:195, 19:137, 20:48 }
  },
  {
    from: "07/04",
    tobe: { 9:88, 10:157, 11:290, 12:334, 13:293, 14:262, 15:266, 16:298, 17:254, 18:165, 19:103, 20:22 }
  }
];

// Schedule TO BE dinamico (hardcoded + storage)
let _dynamicTobeSchedule = null;
async function loadDynamicTobeSchedule() {
  try {
    const res = await window.storage.get(STORAGE_KEY + "_tobe_schedule", true);
    if (res?.value) _dynamicTobeSchedule = JSON.parse(res.value);
  } catch(e) {}
}

function getHourlyToBe(date) {
  if (!date) return null;
  const dk = date.split("/").reverse().join("");
  // Combina schedule hardcoded + dinamico da storage
  const combined = [...HOURLY_TOBE_SCHEDULE, ...(_dynamicTobeSchedule || [])];
  const sorted = combined.sort((a,b) => b.from.split("/").reverse().join("").localeCompare(a.from.split("/").reverse().join("")));
  const applicable = sorted.find(s => s.from.split("/").reverse().join("") <= dk);
  return applicable ? applicable.tobe : null;
}

function getMacroToBe(date) {
  if (!date) return null;
  const dk = date.split("/").reverse().join(""); // "27/03" → "0327"
  const sorted = [...MACRO_TOBE_SCHEDULE].sort((a,b) => {
    const ka = a.from.split("/").reverse().join("");
    const kb = b.from.split("/").reverse().join("");
    return kb.localeCompare(ka);
  });
  const applicable = sorted.find(s => {
    const sk = s.from.split("/").reverse().join("");
    return sk <= dk;
  });
  return applicable ? applicable.tobe : null;
}

const SEED_DATA = [
  {
    id:"14/04_seed", date:"14/04",
    pressione:"1,73", leadGen:"2287", leadToBe:"2532",
    ore:"938,5", oreDich:"1055", lavOra:"2,4",
    red:"19,2", resa:"0,47", ctc:"28,82", trabocco:"1,09",
    timing:"83", cpl:"11,2", cpa:"93",
    contattab:"50,9", durMedia:"10,12",
    lavOraMese:"2,5", redMese:"17,0", resaMese:"0,42",
    timingMese:"88", cplMese:"12,4", cpaMese:"110", ctcMese:"25,36",
    contattabMese:"61,2",
    hourly: HOURLY_1404,
    hourlyMese: { 9:75, 10:87, 11:90, 12:93, 13:93, 14:96, 15:90, 16:92, 17:89, 18:88, 19:87, 20:69 },
    macrofontiMese: [
      { name:"GALANO GOOGLE CALDE", leads:7212, pct:"31,45", cpl:"15,7", cpa:"114", red:"18,5" },
      { name:"SPINUP SOCIAL",       leads:5526, pct:"24,09", cpl:"10,3", cpa:"134", red:"11,5" },
      { name:"GALANO GOOGLE CTC",   leads:4872, pct:"21,24", cpl:"14,3", cpa:"108", red:"21,8" },
      { name:"GALANO SOCIAL",       leads:2085, pct:"9,09",  cpl:"10,6", cpa:"128", red:"12,8" },
      { name:"PAOLO SOCIAL",        leads:1298, pct:"5,66",  cpl:"11,1", cpa:"163", red:"10,5" },
      { name:"ETC",                 leads:998,  pct:"4,35",  cpl:"4,5",  cpa:"32",  red:"31,6" },
      { name:"TRABOCCO A&R",        leads:581,  pct:"2,53",  cpl:"—",    cpa:"48",  red:"18,8" },
      { name:"TRABOCCO TLC",        leads:363,  pct:"1,58",  cpl:"8,7",  cpa:"133", red:"12,9" },
    ],
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:736,  pct:"32,18", cpl:"14,5", cpa:"101", red:"20,0" },
      { name:"GALANO GOOGLE CTC",   leads:498,  pct:"21,78", cpl:"13,5", cpa:"94",  red:"24,9" },
      { name:"SPINUP SOCIAL",       leads:391,  pct:"17,10", cpl:"10,3", cpa:"106", red:"13,8" },
      { name:"GALANO SOCIAL",       leads:255,  pct:"11,15", cpl:"10,5", cpa:"144", red:"11,4" },
      { name:"ETC",                 leads:136,  pct:"5,95",  cpl:"5,2",  cpa:"36",  red:"26,5" },
      { name:"TRABOCCO A&R",        leads:136,  pct:"5,95",  cpl:"—",    cpa:"42",  red:"24,3" },
      { name:"PAOLO SOCIAL",        leads:108,  pct:"4,72",  cpl:"6,8",  cpa:"127", red:"10,2" },
      { name:"TRABOCCO TLC",        leads:25,   pct:"1,09",  cpl:"8,6",  cpa:"100", red:"16,0" },
    ],
  },
  {
    id:"13/04_seed", date:"13/04",
    pressione:"1,64", leadGen:"2463", leadToBe:"2532",
    ore:"946,5", oreDich:"1055", lavOra:"2,6",
    red:"20,1", resa:"0,52", ctc:"25,05", trabocco:"2,44",
    timing:"83", cpl:"11,6", cpa:"91",
    contattab:"52,9", durMedia:"8,82",
    lavOraMese:"2,5", redMese:"17,2", resaMese:"0,42",
    timingMese:"88", cplMese:"12,5", cpaMese:"109", ctcMese:"24,98",
    contattabMese:"60,9",
    hourly: HOURLY_1304,
    hourlyMese: { 9:74, 10:86, 11:90, 12:93, 13:93, 14:96, 15:90, 16:92, 17:89, 18:90, 19:87, 20:71 },
    macrofontiMese: [
      { name:"GALANO GOOGLE CALDE", leads:6476, pct:"31,36", cpl:"15,9", cpa:"113", red:"18,8" },
      { name:"SPINUP SOCIAL",       leads:5135, pct:"24,87", cpl:"10,3", cpa:"134", red:"11,5" },
      { name:"GALANO GOOGLE CTC",   leads:4374, pct:"21,18", cpl:"14,4", cpa:"106", red:"22,3" },
      { name:"GALANO SOCIAL",       leads:1830, pct:"8,86",  cpl:"10,6", cpa:"122", red:"13,3" },
      { name:"PAOLO SOCIAL",        leads:1190, pct:"5,76",  cpl:"11,4", cpa:"167", red:"10,5" },
      { name:"ETC",                 leads:862,  pct:"4,17",  cpl:"4,2",  cpa:"31",  red:"32,5" },
      { name:"TRABOCCO A&R",        leads:445,  pct:"2,16",  cpl:"—",    cpa:"50",  red:"17,5" },
      { name:"TRABOCCO TLC",        leads:338,  pct:"1,64",  cpl:"8,8",  cpa:"133", red:"13,0" },
    ],
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:851, pct:"34,55", cpl:"15,4", cpa:"97",  red:"21,6" },
      { name:"GALANO GOOGLE CTC",   leads:501, pct:"20,34", cpl:"13,5", cpa:"83",  red:"28,5" },
      { name:"SPINUP SOCIAL",       leads:448, pct:"18,19", cpl:"8,0",  cpa:"98",  red:"12,9" },
      { name:"GALANO SOCIAL",       leads:303, pct:"12,30", cpl:"10,0", cpa:"105", red:"15,2" },
      { name:"ETC",                 leads:159, pct:"6,46",  cpl:"4,9",  cpa:"55",  red:"22,0" },
      { name:"PAOLO SOCIAL",        leads:85,  pct:"3,45",  cpl:"7,9",  cpa:"116", red:"10,6" },
      { name:"TRABOCCO TLC",        leads:60,  pct:"2,44",  cpl:"10,7", cpa:"192", red:"10,0" },
      { name:"TRABOCCO A&R",        leads:56,  pct:"2,27",  cpl:"—",    cpa:"49",  red:"23,2" },
    ],
  },
  {
    id:"11/04_seed", date:"11/04",
    pressione:"2,18", leadGen:"860", leadToBe:"—",
    ore:"358", oreDich:"400", lavOra:"2,4",
    red:"16,3", resa:"0,40", ctc:"26,40", trabocco:"1,63",
    timing:"88", cpl:"12,7", cpa:"116",
    contattab:"55,1", durMedia:"8,11",
    lavOraMese:"2,5", redMese:"16,8", resaMese:"0,40",
    timingMese:"89", cplMese:"12,7", cpaMese:"113", ctcMese:"25,00",
    contattabMese:"62,1",
    hourly: HOURLY_1104,
    hourlyMese: null,
    macrofontiMese: [
      { name:"GALANO GOOGLE CALDE", leads:5625, pct:"30,98", cpl:"16,0", cpa:"117", red:"18,2" },
      { name:"SPINUP SOCIAL",       leads:4687, pct:"25,82", cpl:"10,5", cpa:"138", red:"11,3" },
      { name:"GALANO GOOGLE CTC",   leads:3870, pct:"21,32", cpl:"14,5", cpa:"110", red:"21,4" },
      { name:"GALANO SOCIAL",       leads:1509, pct:"8,31",  cpl:"10,9", cpa:"125", red:"13,2" },
      { name:"PAOLO SOCIAL",        leads:1105, pct:"6,09",  cpl:"11,7", cpa:"171", red:"10,4" },
      { name:"ETC",                 leads:693,  pct:"3,82",  cpl:"4,2",  cpa:"27",  red:"35,2" },
      { name:"TRABOCCO A&R",        leads:389,  pct:"2,14",  cpl:"—",    cpa:"51",  red:"16,5" },
      { name:"TRABOCCO TLC",        leads:278,  pct:"1,53",  cpl:"8,3",  cpa:"124", red:"13,7" },
    ],
    macrofonti: [
      { name:"SPINUP SOCIAL",       leads:307, pct:"35,70", cpl:"9,1",  cpa:"135", red:"9,8"  },
      { name:"GALANO GOOGLE CTC",   leads:196, pct:"22,79", cpl:"19,9", cpa:"127", red:"24,0" },
      { name:"GALANO GOOGLE CALDE", leads:177, pct:"20,58", cpl:"15,0", cpa:"94",  red:"21,5" },
      { name:"PAOLO SOCIAL",        leads:70,  pct:"8,14",  cpl:"9,4",  cpa:"150", red:"10,0" },
      { name:"GALANO SOCIAL",       leads:45,  pct:"5,23",  cpl:"12,0", cpa:"189", red:"8,9"  },
      { name:"ETC",                 leads:32,  pct:"3,72",  cpl:"6,0",  cpa:"54",  red:"18,8" },
      { name:"TRABOCCO A&R",        leads:17,  pct:"1,98",  cpl:"—",    cpa:"22",  red:"29,4" },
      { name:"TRABOCCO TLC",        leads:14,  pct:"1,63",  cpl:"10,9", cpa:"126", red:"21,4" },
    ],
  },
  {
    id:"10/04_seed", date:"10/04",
    pressione:"2,08", leadGen:"2161", leadToBe:"2532",
    ore:"925,5", oreDich:"1055", lavOra:"2,3",
    red:"19,1", resa:"0,42", ctc:"25,46", trabocco:"1,06",
    timing:"86", cpl:"11,5", cpa:"95",
    contattab:"59,5", durMedia:"9,41",
    lavOraMese:"2,5", redMese:"17,5", resaMese:"0,40",
    timingMese:"89", cplMese:"12,6", cpaMese:"108", ctcMese:"24,92",
    contattabMese:"62,3",
    hourly: HOURLY_1004,
    hourlyMese: { 9:79, 10:84, 11:90, 12:95, 13:94, 14:98, 15:90, 16:92, 17:92, 18:92, 19:90, 20:72 },
    macrofontiMese: [
      { name:"GALANO GOOGLE CALDE", leads:5448, pct:"31,50", cpl:"16,0", cpa:"113", red:"18,8" },
      { name:"SPINUP SOCIAL",       leads:4380, pct:"25,33", cpl:"10,6", cpa:"133", red:"11,8" },
      { name:"GALANO GOOGLE CTC",   leads:3674, pct:"21,24", cpl:"14,2", cpa:"105", red:"22,3" },
      { name:"GALANO SOCIAL",       leads:1464, pct:"8,47",  cpl:"10,9", cpa:"121", red:"13,7" },
      { name:"PAOLO SOCIAL",        leads:1035, pct:"5,98",  cpl:"11,9", cpa:"160", red:"11,4" },
      { name:"ETC",                 leads:661,  pct:"3,82",  cpl:"3,8",  cpa:"25",  red:"37,4" },
      { name:"TRABOCCO A&R",        leads:369,  pct:"2,13",  cpl:"—",    cpa:"50",  red:"17,1" },
      { name:"TRABOCCO TLC",        leads:264,  pct:"1,53",  cpl:"8,2",  cpa:"124", red:"13,3" },
    ],
    macrofonti: [
      { name:"SPINUP SOCIAL",       leads:594, pct:"27,50", cpl:"11,0", cpa:"121", red:"13,6" },
      { name:"GALANO GOOGLE CALDE", leads:568, pct:"26,30", cpl:"15,6", cpa:"100", red:"20,6" },
      { name:"GALANO GOOGLE CTC",   leads:445, pct:"20,60", cpl:"12,7", cpa:"78",  red:"29,4" },
      { name:"GALANO SOCIAL",       leads:237, pct:"10,97", cpl:"8,7",  cpa:"153", red:"9,3"  },
      { name:"PAOLO SOCIAL",        leads:104, pct:"4,81",  cpl:"10,8", cpa:"154", red:"10,6" },
      { name:"ETC",                 leads:105, pct:"4,86",  cpl:"3,7",  cpa:"37",  red:"26,7" },
      { name:"TRABOCCO A&R",        leads:81,  pct:"3,75",  cpl:"—",    cpa:"51",  red:"19,8" },
      { name:"TRABOCCO TLC",        leads:23,  pct:"1,06",  cpl:"8,5",  cpa:"66",  red:"26,1" },
    ],
  },
  {
    id:"09/04_seed", date:"09/04",
    pressione:"1,71", leadGen:"2489", leadToBe:"2532",
    ore:"993,5", oreDich:"1055", lavOra:"2,5",
    red:"18,4", resa:"0,43", ctc:"22,98", trabocco:"1,45",
    timing:"90", cpl:"11,3", cpa:"95",
    contattab:"52,3", durMedia:"9,70",
    lavOraMese:"2,5", redMese:"17,5", resaMese:"0,40",
    timingMese:"89", cplMese:"12,8", cpaMese:"109", ctcMese:"24,84",
    contattabMese:"60,2",
    hourly: HOURLY_0904,
    hourlyMese: { 9:79, 10:86, 11:88, 12:94, 13:94, 14:98, 15:90, 16:94, 17:93, 18:91, 19:91, 20:72 },
    macrofontiMese: [
      { name:"GALANO GOOGLE CALDE", leads:4880, pct:"32,25", cpl:"16,0", cpa:"113", red:"18,8" },
      { name:"SPINUP SOCIAL",       leads:3786, pct:"25,02", cpl:"10,5", cpa:"132", red:"11,8" },
      { name:"GALANO GOOGLE CTC",   leads:3229, pct:"21,34", cpl:"14,4", cpa:"109", red:"21,8" },
      { name:"GALANO SOCIAL",       leads:1227, pct:"8,11",  cpl:"11,3", cpa:"118", red:"14,2" },
      { name:"PAOLO SOCIAL",        leads:931,  pct:"6,15",  cpl:"12,0", cpa:"159", red:"11,5" },
      { name:"ETC",                 leads:556,  pct:"3,67",  cpl:"3,6",  cpa:"23",  red:"39,9" },
      { name:"TRABOCCO A&R",        leads:288,  pct:"1,90",  cpl:"—",    cpa:"50",  red:"16,7" },
      { name:"TRABOCCO TLC",        leads:241,  pct:"1,59",  cpl:"8,2",  cpa:"138", red:"12,0" },
    ],
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:863, pct:"34,67", cpl:"14,9", cpa:"106", red:"18,5" },
      { name:"SPINUP SOCIAL",       leads:530, pct:"21,29", cpl:"9,7",  cpa:"105", red:"14,0" },
      { name:"GALANO GOOGLE CTC",   leads:456, pct:"18,32", cpl:"12,3", cpa:"88",  red:"25,7" },
      { name:"GALANO SOCIAL",       leads:313, pct:"12,58", cpl:"9,3",  cpa:"100", red:"14,4" },
      { name:"PAOLO SOCIAL",        leads:121, pct:"4,86",  cpl:"10,2", cpa:"162", red:"10,7" },
      { name:"ETC",                 leads:92,  pct:"3,70",  cpl:"2,7",  cpa:"21",  red:"37,0" },
      { name:"TRABOCCO A&R",        leads:79,  pct:"3,17",  cpl:"—",    cpa:"58",  red:"15,2" },
      { name:"TRABOCCO TLC",        leads:36,  pct:"1,45",  cpl:"4,9",  cpa:"180", red:"8,3"  },
    ],
  },
  {
    id:"08/04_seed", date:"08/04",
    pressione:"1,91", leadGen:"2451", leadToBe:"2532",
    ore:"999,5", oreDich:"1055", lavOra:"2,5",
    red:"18,6", resa:"0,43", ctc:"25,20", trabocco:"1,92",
    timing:"89", cpl:"12,4", cpa:"100",
    contattab:"57,5", durMedia:"8,74",
    lavOraMese:"2,5", redMese:"17,8", resaMese:"0,41",
    timingMese:"89", cplMese:"13,1", cpaMese:"109", ctcMese:"25,20",
    contattabMese:"60,4",
    hourly: HOURLY_0804,
    hourlyMese: { 9:76, 10:84, 11:86, 12:95, 13:95, 14:98, 15:91, 16:97, 17:93, 18:90, 19:90, 20:74 },
    macrofontiMese: [
      { name:"GALANO GOOGLE CALDE", leads:4017, pct:"31,77", cpl:"16,3", cpa:"112", red:"19,2" },
      { name:"SPINUP SOCIAL",       leads:3256, pct:"25,75", cpl:"10,6", cpa:"133", red:"11,8" },
      { name:"GALANO GOOGLE CTC",   leads:2773, pct:"21,93", cpl:"14,8", cpa:"109", red:"22,1" },
      { name:"GALANO SOCIAL",       leads:914,  pct:"7,23",  cpl:"11,8", cpa:"123", red:"14,1" },
      { name:"PAOLO SOCIAL",        leads:810,  pct:"6,41",  cpl:"12,2", cpa:"145", red:"12,7" },
      { name:"ETC",                 leads:463,  pct:"3,66",  cpl:"3,6",  cpa:"23",  red:"40,0" },
      { name:"TRABOCCO A&R",        leads:209,  pct:"1,65",  cpl:"—",    cpa:"49",  red:"17,2" },
      { name:"TRABOCCO TLC",        leads:205,  pct:"1,62",  cpl:"8,7",  cpa:"134", red:"12,7" },
    ],
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:822,  pct:"33,58", cpl:"16,6", cpa:"119", red:"18,0" },
      { name:"SPINUP SOCIAL",       leads:564,  pct:"23,04", cpl:"11,7", cpa:"105", red:"16,1" },
      { name:"GALANO GOOGLE CTC",   leads:519,  pct:"21,20", cpl:"12,1", cpa:"87",  red:"24,7" },
      { name:"GALANO SOCIAL",       leads:244,  pct:"9,97",  cpl:"7,9",  cpa:"111", red:"12,3" },
      { name:"PAOLO SOCIAL",        leads:124,  pct:"5,07",  cpl:"9,2",  cpa:"119", red:"13,7" },
      { name:"ETC",                 leads:78,   pct:"3,19",  cpl:"3,5",  cpa:"21",  red:"38,5" },
      { name:"TRABOCCO A&R",        leads:51,   pct:"2,08",  cpl:"—",    cpa:"69",  red:"11,8" },
      { name:"TRABOCCO TLC",        leads:47,   pct:"1,92",  cpl:"9,1",  cpa:"169", red:"10,6" },
    ],
  },
  {
    id:"07/04_seed", date:"07/04",
    pressione:"1,77", leadGen:"2440", leadToBe:"2532",
    ore:"961", oreDich:"1055", lavOra:"2,5",
    red:"17,2", resa:"0,42", ctc:"23,93", trabocco:"1,27",
    timing:"88", cpl:"14,7", cpa:"121",
    contattab:"55,9", durMedia:"8,39",
    lavOraMese:"2,5", redMese:"18,1", resaMese:"0,42",
    timingMese:"90", cplMese:"13,2", cpaMese:"108", ctcMese:"25,20",
    contattabMese:"59,4",
    hourly: HOURLY_0704,
    hourlyMese: null,
    macrofontiMese: null,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:870, pct:"35,66", cpl:"17,6", cpa:"127", red:"17,7" },
      { name:"SPINUP SOCIAL",       leads:577, pct:"23,65", cpl:"11,7", cpa:"171", red:"9,5"  },
      { name:"GALANO GOOGLE CTC",   leads:493, pct:"20,20", cpl:"17,3", cpa:"130", red:"20,5" },
      { name:"PAOLO SOCIAL",        leads:211, pct:"8,65",  cpl:"13,4", cpa:"141", red:"13,7" },
      { name:"GALANO SOCIAL",       leads:122, pct:"5,00",  cpl:"15,5", cpa:"100", red:"21,3" },
      { name:"ETC",                 leads:77,  pct:"3,16",  cpl:"4,3",  cpa:"19",  red:"54,5" },
      { name:"TRABOCCO A&R",        leads:60,  pct:"2,46",  cpl:"—",    cpa:"51",  red:"16,7" },
      { name:"TRABOCCO TLC",        leads:31,  pct:"1,27",  cpl:"6,5",  cpa:"226", red:"6,5"  },
    ],
  },
  {
    id:"03/04_seed", date:"03/04",
    pressione:"2,37", leadGen:"2207", leadToBe:"2895",
    ore:"934", oreDich:"1144", lavOra:"2,4",
    red:"22,0", resa:"0,48", ctc:"26,93", trabocco:"0,73",
    timing:"92", cpl:"13,7", cpa:"93",
    contattab:"57,6", durMedia:"9,78",
    lavOraMese:"2,4", redMese:"19,5", resaMese:"0,43",
    timingMese:"93", cplMese:"12,7", cpaMese:"100", ctcMese:"25,36",
    contattabMese:"60,7",
    hourly: HOURLY_0304,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:633, pct:"28,69", cpl:"16,3", cpa:"88",  red:"24,3" },
      { name:"SPINUP SOCIAL",       leads:579, pct:"26,25", cpl:"10,6", cpa:"102", red:"16,4" },
      { name:"GALANO GOOGLE CTC",   leads:552, pct:"25,02", cpl:"17,0", cpa:"111", red:"24,5" },
      { name:"GALANO SOCIAL",       leads:198, pct:"8,98",  cpl:"12,7", cpa:"100", red:"18,2" },
      { name:"PAOLO SOCIAL",        leads:115, pct:"5,21",  cpl:"12,6", cpa:"108", red:"18,3" },
      { name:"ETC",                 leads:87,  pct:"3,94",  cpl:"3,2",  cpa:"21",  red:"40,2" },
      { name:"TRABOCCO A&R",        leads:26,  pct:"1,18",  cpl:"—",    cpa:"32",  red:"26,9" },
      { name:"TRABOCCO TLC",        leads:16,  pct:"0,73",  cpl:"8,6",  cpa:"95",  red:"18,8" },
    ],
  },
  {
    id:"02/04_seed", date:"02/04",
    pressione:"2,25", leadGen:"2506", leadToBe:"2895",
    ore:"1024", oreDich:"1144", lavOra:"2,5",
    red:"19,7", resa:"0,45", ctc:"22,31", trabocco:"1,32",
    timing:"94", cpl:"11,8", cpa:"93",
    contattab:"55,1", durMedia:"10,04",
    lavOraMese:"2,4", redMese:"19,1", resaMese:"0,42",
    timingMese:"93", cplMese:"12,1", cpaMese:"99", ctcMese:"24,63",
    contattabMese:"58,1",
    hourly: HOURLY_0204,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:742, pct:"29,61", cpl:"14,3", cpa:"88",  red:"22,8" },
      { name:"SPINUP SOCIAL",       leads:720, pct:"28,73", cpl:"9,4",  cpa:"117", red:"12,5" },
      { name:"GALANO GOOGLE CTC",   leads:507, pct:"20,23", cpl:"13,0", cpa:"100", red:"22,7" },
      { name:"PAOLO SOCIAL",        leads:224, pct:"8,94",  cpl:"12,3", cpa:"141", red:"12,9" },
      { name:"GALANO SOCIAL",       leads:166, pct:"6,62",  cpl:"13,9", cpa:"124", red:"16,3" },
      { name:"ETC",                 leads:95,  pct:"3,79",  cpl:"3,1",  cpa:"16",  red:"50,5" },
      { name:"TRABOCCO TLC",        leads:33,  pct:"1,32",  cpl:"6,9",  cpa:"68",  red:"24,2" },
      { name:"TRABOCCO A&R",        leads:19,  pct:"0,76",  cpl:"—",    cpa:"22",  red:"42,1" },
    ],
  },
  {
    id:"01/04_seed", date:"01/04",
    pressione:"2,20", leadGen:"2256", leadToBe:"2895",
    ore:"969", oreDich:"1144", lavOra:"2,3",
    red:"19,1", resa:"0,42", ctc:"27,22", trabocco:"2,66",
    timing:"91", cpl:"12,3", cpa:"102",
    contattab:"56,0", durMedia:"9,79",
    lavOraMese:"2,3", redMese:"19,1", resaMese:"0,42",
    timingMese:"91", cplMese:"12,3", cpaMese:"102", ctcMese:"27,22",
    contattabMese:"56,0",
    hourly: HOURLY_0104,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:771, pct:"34,18", cpl:"15,4", cpa:"108", red:"20,0" },
      { name:"SPINUP SOCIAL",       leads:552, pct:"24,47", cpl:"10,4", cpa:"121", red:"12,5" },
      { name:"GALANO GOOGLE CTC",   leads:514, pct:"22,78", cpl:"12,2", cpa:"91",  red:"25,7" },
      { name:"GALANO SOCIAL",       leads:156, pct:"6,91",  cpl:"11,5", cpa:"138", red:"12,8" },
      { name:"PAOLO SOCIAL",        leads:101, pct:"4,48",  cpl:"13,5", cpa:"211", red:"8,9"  },
      { name:"ETC",                 leads:62,  pct:"2,75",  cpl:"4,3",  cpa:"25",  red:"59,7" },
      { name:"TRABOCCO TLC",        leads:60,  pct:"2,66",  cpl:"8,3",  cpa:"251", red:"6,7"  },
      { name:"TRABOCCO A&R",        leads:40,  pct:"1,77",  cpl:"—",    cpa:"93",  red:"12,5" },
    ],
  },
  {
    id:"04/03_seed", date:"04/03",
    pressione:"3,66", leadGen:"2849", leadToBe:null,
    ore:"1182", oreDich:"1055", lavOra:"2,3",
    red:"19,8", resa:"0,45", ctc:"22,50", trabocco:null,
    timing:"93", cpl:"10,7", cpa:"89",
    contattab:"62,1", durMedia:"7,74",
    lavOraMese:"2,4", redMese:"17,4", resaMese:"0,43",
    timingMese:"90", cplMese:"10,5", cpaMese:"96", ctcMese:"21,03",
    contattabMese:"70,5",
    hourly: HOURLY_0304,
    macrofontiMese: [
      { name:"SPINUP SOCIAL",       leads:3344, pct:"38,62", cpl:"8,9",  cpa:"113", red:"13,1" },
      { name:"GALANO GOOGLE CALDE", leads:2016, pct:"23,28", cpl:"12,9", cpa:"90",  red:"19,9" },
      { name:"GALANO GOOGLE CTC",   leads:1340, pct:"15,48", cpl:"12,1", cpa:"99",  red:"21,0" },
      { name:"GALANO SOCIAL",       leads:628,  pct:"7,25",  cpl:"8,4",  cpa:"94",  red:"16,4" },
      { name:"PAOLO SOCIAL",        leads:459,  pct:"5,30",  cpl:"13,5", cpa:"123", red:"16,3" },
      { name:"ETC",                 leads:391,  pct:"4,52",  cpl:"8,1",  cpa:"33",  red:"40,2" },
      { name:"TRABOCCO TLC",        leads:390,  pct:"4,50",  cpl:"5,3",  cpa:"173", red:"7,7"  },
      { name:"TRABOCCO A&R",        leads:90,   pct:"1,04",  cpl:"13,9", cpa:"109", red:"22,2" },
    ],
    macrofonti: [
      { name:"SPINUP SOCIAL",       leads:966,  pct:"33,91", cpl:"9,0",  cpa:"116", red:"13,4" },
      { name:"GALANO GOOGLE CALDE", leads:764,  pct:"26,82", cpl:"12,9", cpa:"85",  red:"22,1" },
      { name:"GALANO GOOGLE CTC",   leads:467,  pct:"16,39", cpl:"12,1", cpa:"92",  red:"22,9" },
      { name:"GALANO SOCIAL",       leads:234,  pct:"8,21",  cpl:"8,4",  cpa:"94",  red:"16,2" },
      { name:"PAOLO SOCIAL",        leads:159,  pct:"5,58",  cpl:"13,5", cpa:"143", red:"13,2" },
      { name:"TRABOCCO TLC",        leads:148,  pct:"5,19",  cpl:"5,5",  cpa:"175", red:"8,1"  },
      { name:"ETC",                 leads:85,   pct:"2,98",  cpl:"8,1",  cpa:"15",  red:"97,6" },
      { name:"TRABOCCO A&R",        leads:25,   pct:"0,88",  cpl:"16,7", cpa:"185", red:"16,0" },
    ],
  },
  {
    id:"03/03_seed", date:"03/03",
    pressione:"3,66", leadGen:"2810", leadToBe:"2895",
    ore:"1139,5", oreDich:"1055", lavOra:"2,3",
    red:"17,8", resa:"0,43", ctc:"19,68", trabocco:null,
    timing:"93", cpl:"10,6", cpa:"96",
    contattab:"65,8", durMedia:"7,69",
    lavOraMese:"2,5", redMese:"16,2", resaMese:"0,42",
    timingMese:"89", cplMese:"10,4", cpaMese:"101", ctcMese:"20,31",
    contattabMese:"70,5",
    hourly: HOURLY_0304,
    macrofontiMese: [
      { name:"SPINUP SOCIAL",       leads:2378, pct:"40,93", cpl:"8,9",  cpa:"111", red:"13,0" },
      { name:"GALANO GOOGLE CALDE", leads:1252, pct:"21,55", cpl:"12,7", cpa:"95",  red:"18,6" },
      { name:"GALANO GOOGLE CTC",   leads:873,  pct:"15,03", cpl:"12,1", cpa:"103", red:"20,0" },
      { name:"GALANO SOCIAL",       leads:394,  pct:"6,78",  cpl:"9,5",  cpa:"94",  red:"16,5" },
      { name:"ETC",                 leads:306,  pct:"5,27",  cpl:"8,0",  cpa:"53",  red:"24,2" },
      { name:"PAOLO SOCIAL",        leads:300,  pct:"5,16",  cpl:"15,3", cpa:"116", red:"18,0" },
      { name:"TRABOCCO TLC",        leads:242,  pct:"4,17",  cpl:"5,1",  cpa:"172", red:"7,4"  },
      { name:"TRABOCCO A&R",        leads:65,   pct:"1,12",  cpl:"12,8", cpa:"90",  red:"24,6" },
    ],
    macrofonti: [
      { name:"SPINUP SOCIAL",       leads:1174, pct:"41,78", cpl:"9,1",  cpa:"111", red:"13,5" },
      { name:"GALANO GOOGLE CALDE", leads:630,  pct:"22,42", cpl:"12,8", cpa:"92",  red:"19,7" },
      { name:"GALANO GOOGLE CTC",   leads:411,  pct:"14,63", cpl:"13,0", cpa:"96",  red:"23,6" },
      { name:"GALANO SOCIAL",       leads:207,  pct:"7,37",  cpl:"9,6",  cpa:"96",  red:"16,9" },
      { name:"PAOLO SOCIAL",        leads:138,  pct:"4,91",  cpl:"12,0", cpa:"80",  red:"22,5" },
      { name:"TRABOCCO TLC",        leads:109,  pct:"3,88",  cpl:"5,5",  cpa:"157", red:"9,2"  },
      { name:"ETC",                 leads:107,  pct:"3,81",  cpl:"8,0",  cpa:"36",  red:"33,6" },
      { name:"TRABOCCO A&R",        leads:33,   pct:"1,17",  cpl:"12,7", cpa:"84",  red:"27,3" },
    ],
  },
  {
    id:"31/03_seed", date:"31/03",
    pressione:"1,74", leadGen:"2460", leadToBe:"2659",
    ore:"999", oreDich:"1162", lavOra:"2,5",
    red:"16,2", resa:"0,37", ctc:"25,45", trabocco:"1,02",
    timing:"85", cpl:"12,0", cpa:"114",
    contattab:"47,9", durMedia:"8,88",
    sintesi:`Timing — Giornata problematica nella seconda metà. La fascia 12:00 al 100% ha saturato la coda generando effetti a cascata: 14:00 al 57% (-12% vs TO BE 315) e 19:00 al 59% (+18% vs TO BE 103). Le fasce 18-20 in over-generazione rispetto al piano hanno aggravato la coda in chiusura turno. Contattabilità netto CTC al 47,9% — dato più basso del mese, probabilmente correlato alla pressione elevata sugli operatori nel pomeriggio.

Mix fonti — CPA 114€, sopra target di 22€. Giornata penalizzata dalla qualità del Calde.

GALANO GOOGLE CALDE (31,75%): CPA 165€ con RED solo 12% — peggior rendimento del mese per questo fornitore. Pesa 8% oltre TO BE (781 vs 723). Da ridurre.

SPINUP SOCIAL (25,24%): RED 13,5% sotto soglia, -17% vs TO BE. Generazione insufficiente e qualità in calo.

GALANO GOOGLE CTC (21,67%): RED 18,8% buono ma CPL 12,9€ porta CPA a 123€. Sotto del 22% vs TO BE.

TRABOCCO TLC: CPA 75€ positivo, ma volume marginale (1%).`,
    lavOraMese:"2,6", redMese:"16,5", resaMese:"0,39",
    timingMese:"89", cplMese:"11,9", cpaMese:"111", ctcMese:"20,87",
    contattabMese:"62,8",
    hourly: HOURLY_31,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:781, pct:"31,75", cpl:"15,2", cpa:"165", red:"12,0" },
      { name:"SPINUP SOCIAL",       leads:621, pct:"25,24", cpl:"10,7", cpa:"119", red:"13,5" },
      { name:"GALANO GOOGLE CTC",   leads:533, pct:"21,67", cpl:"12,9", cpa:"123", red:"18,8" },
      { name:"GALANO SOCIAL",       leads:179, pct:"7,28",  cpl:"10,0", cpa:"99",  red:"15,6" },
      { name:"PAOLO SOCIAL",        leads:162, pct:"6,59",  cpl:"10,6", cpa:"104", red:"17,3" },
      { name:"ETC",                 leads:91,  pct:"3,70",  cpl:"5,8",  cpa:"26",  red:"42,9" },
      { name:"TRABOCCO A&R",        leads:67,  pct:"2,72",  cpl:"—",    cpa:"33",  red:"31,3" },
      { name:"TRABOCCO TLC",        leads:25,  pct:"1,02",  cpl:"6,1",  cpa:"75",  red:"20,0" },
    ],
  },
  {
    id:"30/03_seed", date:"30/03",
    pressione:"1,73", leadGen:"2514", leadToBe:"2659",
    ore:"1060", oreDich:"1162", lavOra:"2,4",
    red:"19,5", resa:"0,45", ctc:"24,63", trabocco:"1,35",
    timing:"89", cpl:"11,8", cpa:"96",
    contattab:"65,0", durMedia:"9,97",
    contattabMese:"63,3",
    sintesi:`Timing — Nessun picco al 100%, risultato positivo. Anomalia sulle fasce 10:00 (78%) e 11:00 (83%): il volume mattutino ha saturato la capacità in apertura di turno pieno. Fasce 12-17 tutte nel range ottimale (91-98%). Calo atteso a 18-19 (83%) e crollo a 20:00 (45%) per eccesso di lead in chiusura turno. Intervento: ridurre la generazione sulle fasce 9-11 per evitare saturazione mattutina.

Mix fonti — Giornata positiva: CPA 96€ sotto target mensile di 110€.

GALANO GOOGLE CALDE (23,4%): fornitore più efficiente del giorno con RED 23,8% e CPA 84€. Può assorbire quota da fonti meno performanti.

SPINUP SOCIAL (25,9% — peso maggiore): RED 13,2% sotto soglia (target >15,5%). Se il trend si conferma, ridurre il volume in favore del Calde.

GALANO GOOGLE CTC (20,9%): RED 25,9% ottimo ma CPL 15,1€ limita il CPA a 101€. Peso CTC al 24,63% sopra media mese (20,70%): ribilanciare verso 18-20%.

PAOLO SOCIAL (12,65%): RED 11,9% sotto soglia e CPA 121€ — fornitore da ridimensionare.

TRABOCCO TLC: CPA 547€ con RED 2,9% — da sospendere immediatamente.`,
    lavOraMese:"2,6", redMese:"16,6", resaMese:"0,46",
    timingMese:"90", cplMese:"11,9", cpaMese:"110", ctcMese:"20,70",
    hourly: HOURLY_30,
    macrofonti: [
      { name:"SPINUP SOCIAL",       leads:651, pct:"25,91", cpl:"10,0", cpa:"114", red:"13,2" },
      { name:"GALANO GOOGLE CALDE", leads:588, pct:"23,40", cpl:"14,9", cpa:"84",  red:"23,8" },
      { name:"GALANO GOOGLE CTC",   leads:525, pct:"20,89", cpl:"15,1", cpa:"101", red:"25,9" },
      { name:"PAOLO SOCIAL",        leads:318, pct:"12,65", cpl:"9,2",  cpa:"121", red:"11,9" },
      { name:"GALANO SOCIAL",       leads:179, pct:"7,12",  cpl:"11,9", cpa:"119", red:"16,2" },
      { name:"ETC",                 leads:158, pct:"6,29",  cpl:"7,3",  cpa:"54",  red:"27,8" },
      { name:"TRABOCCO A&R",        leads:60,  pct:"2,39",  cpl:"—",    cpa:"38",  red:"26,7" },
      { name:"TRABOCCO TLC",        leads:34,  pct:"1,35",  cpl:"7,7",  cpa:"547", red:"2,9"  },
    ],
  },
  {
    id:"27/03_seed", date:"27/03",
    pressione:"2,95", leadGen:"2571", leadToBe:"2659",
    ore:"1062", oreDich:"1162", lavOra:"2,4",
    red:"15,3", resa:"0,35", ctc:"26,25", trabocco:"0,74",
    timing:"90", cpl:"13,0", cpa:"128",
    contattab:"72,7", durMedia:"7,89",
    contattabMese:"62,6",
    lavOraMese:"2,5", redMese:"16,5", resaMese:"0,46",
    timingMese:"90", cplMese:"11,9", cpaMese:"111", ctcMese:"20,62",
    hourly: HOURLY_27,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:919, pct:"35,74", cpl:"15,0", cpa:"151", red:"13,6" },
      { name:"GALANO GOOGLE CTC",   leads:629, pct:"24,47", cpl:"16,0", cpa:"129", red:"19,9" },
      { name:"SPINUP SOCIAL",       leads:611, pct:"23,77", cpl:"10,5", cpa:"142", red:"11,0" },
      { name:"ETC",                 leads:151, pct:"5,87",  cpl:"5,3",  cpa:"58",  red:"16,6" },
      { name:"GALANO SOCIAL",       leads:147, pct:"5,72",  cpl:"10,5", cpa:"78",  red:"23,1" },
      { name:"PAOLO SOCIAL",        leads:68,  pct:"2,64",  cpl:"12,4", cpa:"157", red:"11,8" },
      { name:"TRABOCCO A&R",        leads:20,  pct:"0,78",  cpl:"—",    cpa:"28",  red:"30,0" },
      { name:"TRABOCCO TLC",        leads:19,  pct:"0,74",  cpl:"7,9",  cpa:"88",  red:"21,1" },
    ],
  },
  {
    id:"26/03_seed", date:"26/03",
    pressione:"3,47", leadGen:"2783", leadToBe:"3136",
    ore:"1052", oreDich:"1368", lavOra:"2,6",
    red:"14,7", resa:"0,42", ctc:"26,55", trabocco:"1,08",
    timing:"85", cpl:"13,5", cpa:"132",
    contattab:"64,2", durMedia:"6,21",
    contattabMese:"62,3",
    lavOraMese:"2,5", redMese:"16,6", resaMese:"0,46",
    timingMese:"90", cplMese:"11,8", cpaMese:"109", ctcMese:"20,09",
    hourly: HOURLY_26,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:1061, pct:"38,12", cpl:"16,6", cpa:"142", red:"15,4" },
      { name:"GALANO GOOGLE CTC",   leads:693,  pct:"24,90", cpl:"14,5", cpa:"130", red:"17,6" },
      { name:"SPINUP SOCIAL",       leads:558,  pct:"20,05", cpl:"10,4", cpa:"113", red:"13,4" },
      { name:"GALANO SOCIAL",       leads:228,  pct:"8,19",  cpl:"8,5",  cpa:"394", red:"3,5"  },
      { name:"PAOLO SOCIAL",        leads:117,  pct:"4,20",  cpl:"13,8", cpa:"199", red:"9,4"  },
      { name:"ETC",                 leads:80,   pct:"2,87",  cpl:"5,1",  cpa:"30",  red:"35,0" },
      { name:"TRABOCCO TLC",        leads:30,   pct:"1,08",  cpl:"7,9",  cpa:"113", red:"6,7"  },
      { name:"TRABOCCO A&R",        leads:14,   pct:"0,50",  cpl:"—",    cpa:"85",  red:"7,1"  },
    ],
  },
  {
    id:"25/03_seed", date:"25/03",
    pressione:"2,91", leadGen:"2619", leadToBe:"3136",
    ore:"1166", oreDich:"1368", lavOra:"2,2",
    red:"17,2", resa:"0,40", ctc:"30,74", trabocco:"0,50",
    timing:"93", cpl:"13,6", cpa:"122",
    contattab:"73,8", durMedia:"8,08",
    contattabMese:"62,0",
    lavOraMese:"2,5", redMese:"16,7", resaMese:"0,46",
    timingMese:"90", cplMese:"11,8", cpaMese:"109", ctcMese:"20,09",
    hourly: HOURLY_25,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:864, pct:"32,99", cpl:"15,7", cpa:"167", red:"13,1" },
      { name:"GALANO GOOGLE CTC",   leads:783, pct:"29,90", cpl:"15,3", cpa:"113", red:"22,1" },
      { name:"SPINUP SOCIAL",       leads:576, pct:"21,99", cpl:"11,2", cpa:"113", red:"16,0" },
      { name:"GALANO SOCIAL",       leads:152, pct:"5,80",  cpl:"11,2", cpa:"107", red:"15,8" },
      { name:"ETC",                 leads:111, pct:"4,24",  cpl:"5,0",  cpa:"48",  red:"25,2" },
      { name:"PAOLO SOCIAL",        leads:111, pct:"4,24",  cpl:"12,0", cpa:"108", red:"16,2" },
      { name:"TRABOCCO TLC",        leads:13,  pct:"0,50",  cpl:"10,7", cpa:"113", red:"15,4" },
      { name:"TRABOCCO A&R",        leads:9,   pct:"0,34",  cpl:"—",    cpa:"79",  red:"11,1" },
    ],
  },
  {
    id:"24/03_seed", date:"24/03",
    pressione:"1,76", leadGen:"2858", leadToBe:"3136",
    ore:"1146", oreDich:"1368", lavOra:"2,5",
    red:"18,5", resa:"0,47", ctc:"28,10", trabocco:"1,40",
    timing:"90", cpl:"12,2", cpa:"104",
    contattab:"54,3", durMedia:"10,19",
    contattabMese:"62,4",
    sintesi:`Timing — Giornata positiva nelle ore centrali (90–98%, nessun picco al 100%). Problema concentrato sulla fascia 18:00 dove 301 lead in ingresso hanno saturato la capacità finale del turno (timing 73%). Intervento: ridurre il volume programmato in fascia 17–19.

Mix fonti — Due interventi prioritari:

Ridurre GALANO GOOGLE CALDE dal 30% al 22–24%. RED al 15,8% sotto soglia con quel peso trascina il CPA dell'intera giornata a 130€ — è la singola leva con più impatto.

Aumentare SPINUP SOCIAL dal 21% al 27–28%. CPL 8€, CPA 80€, qualità accettabile — è il fornitore dove spostare il budget liberato dal Calde.

GALANO SOCIAL può assorbire un incremento marginale (10% → 13–14%) sfruttando lo stesso interlocutore Galano per una rinegoziazione interna del mix.

GALANO GOOGLE CTC: RED 20,7% positivo ma CPL 14,1€ elevato ha contribuito a CPA 119€ — l'alto costo per lead ha limitato il ritorno nonostante la qualità della conversione.

TRABOCCO TLC TIM da sospendere — CPA 255€ con RED al 5,9% non è difendibile a nessun volume.`,
    lavOraMese:"2,6", redMese:"17,1", resaMese:"0,50",
    timingMese:"90", cplMese:"11,7", cpaMese:"106", ctcMese:"19,59",
    hourly: HOURLY_24,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:861, pct:"30,13", cpl:"15,3", cpa:"130", red:"15,8" },
      { name:"GALANO GOOGLE CTC",   leads:730, pct:"25,54", cpl:"14,1", cpa:"119", red:"20,7" },
      { name:"SPINUP SOCIAL",       leads:598, pct:"20,92", cpl:"8,0",  cpa:"80",  red:"17,2" },
      { name:"GALANO SOCIAL",       leads:293, pct:"10,25", cpl:"10,0", cpa:"79",  red:"21,8" },
      { name:"PAOLO SOCIAL",        leads:158, pct:"5,53",  cpl:"12,9", cpa:"121", red:"14,6" },
      { name:"ETC",                 leads:146, pct:"5,11",  cpl:"6,1",  cpa:"40",  red:"28,8" },
      { name:"TRABOCCO TLC",        leads:40,  pct:"1,40",  cpl:"16,7", cpa:"109", red:"22,5" },
      { name:"TRABOCCO TLC TIM",    leads:17,  pct:"0,59",  cpl:"5,0",  cpa:"255", red:"5,9"  },
    ],
  },
  {
    id:"23/03_seed", date:"23/03",
    pressione:"1,57", leadGen:"2812", leadToBe:"3136",
    ore:"1128", oreDich:"1368", lavOra:"2,5",
    red:"18,6", resa:"0,50", ctc:"21,27", trabocco:"1,42",
    timing:"91", cpl:"12,1", cpa:"103",
    contattab:"62,0", durMedia:"9,50",
    contattabMese:"60,7",
    lavOraMese:"2,6", redMese:"17,2", resaMese:"0,50",
    timingMese:"90", cplMese:"11,7", cpaMese:"106", ctcMese:"19,13",
    hourly: HOURLY_23,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE",  leads:949, pct:"33,75", cpl:"17,0", cpa:"129", red:"17,3" },
      { name:"SPINUP SOCIAL",        leads:663, pct:"23,58", cpl:"8,2",  cpa:"112", red:"12,4" },
      { name:"GALANO GOOGLE CTC",    leads:498, pct:"17,71", cpl:"11,2", cpa:"98",  red:"22,9" },
      { name:"GALANO SOCIAL",        leads:242, pct:"8,61",  cpl:"10,5", cpa:"88",  red:"21,9" },
      { name:"ETC",                  leads:186, pct:"6,61",  cpl:"7,5",  cpa:"41",  red:"33,9" },
      { name:"PAOLO SOCIAL",         leads:176, pct:"6,26",  cpl:"14,6", cpa:"130", red:"15,9" },
      { name:"TRABOCCO TLC",         leads:40,  pct:"1,42",  cpl:"10,6", cpa:"132", red:"15,0" },
      { name:"TRABOCCO TLC TIM",     leads:40,  pct:"1,42",  cpl:"—",    cpa:"78",  red:"15,0" },
      { name:"TRABOCCO A&R",         leads:20,  pct:"0,71",  cpl:"—",    cpa:"40",  red:"35,0" },
    ],
  },
  {
    id:"20/03_seed", date:"20/03",
    pressione:"2,07", leadGen:"2790", leadToBe:"3136",
    ore:"1113", oreDich:"1368", lavOra:"2,5",
    red:"18,8", resa:"0,50", ctc:"22,94", trabocco:"2,04",
    timing:"88", cpl:"13,0", cpa:"105",
    contattab:"60,4", durMedia:"8,22", contattabMese:"60,0",
    lavOraMese:"2,6", redMese:"17,3", resaMese:"0,51",
    timingMese:"90", cplMese:"11,6", cpaMese:"104", ctcMese:"19,14",
    hourly: HOURLY_20,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:815,  pct:"29,21", cpl:"16,6", cpa:"110", red:"20,6" },
      { name:"SPINUP SOCIAL",       leads:810,  pct:"29,03", cpl:"10,5", cpa:"125", red:"12,7" },
      { name:"GALANO GOOGLE CTC",   leads:570,  pct:"20,43", cpl:"14,1", cpa:"83",  red:"29,5" },
      { name:"GALANO SOCIAL",       leads:257,  pct:"9,21",  cpl:"10,4", cpa:"103", red:"16,3" },
      { name:"ETC",                 leads:132,  pct:"4,73",  cpl:"6,6",  cpa:"86",  red:"12,9" },
      { name:"PAOLO SOCIAL",        leads:131,  pct:"4,70",  cpl:"15,9", cpa:"147", red:"15,3" },
      { name:"TRABOCCO TLC",        leads:57,   pct:"2,04",  cpl:"8,9",  cpa:"202", red:"8,8"  },
      { name:"TRABOCCO A&R",        leads:11,   pct:"0,39",  cpl:"—",    cpa:"110", red:"—"    },
    ],
  },
  {
    id:"19/03_seed", date:"19/03",
    pressione:"1,88", leadGen:"2940", leadToBe:"3136",
    ore:"1160", oreDich:"1368", lavOra:"2,5",
    red:"17,9", resa:"0,48", ctc:"21,39", trabocco:"2,18",
    timing:"92", cpl:"13,2", cpa:"110",
    contattab:"60,5", durMedia:"8,22", contattabMese:"60,0",
    lavOraMese:"2,6", redMese:"17,4", resaMese:"0,51",
    timingMese:"90", cplMese:"11,5", cpaMese:"103", ctcMese:"18,91",
    hourly: HOURLY_19,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:986,  pct:"33,54", cpl:"17,0", cpa:"115", red:"19,6" },
      { name:"SPINUP SOCIAL",       leads:780,  pct:"26,53", cpl:"10,0", cpa:"117", red:"14,2" },
      { name:"GALANO GOOGLE CTC",   leads:553,  pct:"18,81", cpl:"13,9", cpa:"92",  red:"25,5" },
      { name:"GALANO SOCIAL",       leads:288,  pct:"9,80",  cpl:"11,5", cpa:"131", red:"13,5" },
      { name:"ETC",                 leads:138,  pct:"4,69",  cpl:"5,7",  cpa:"59",  red:"17,4" },
      { name:"PAOLO SOCIAL",        leads:119,  pct:"4,05",  cpl:"15,0", cpa:"164", red:"12,6" },
      { name:"TRABOCCO TLC",        leads:64,   pct:"2,18",  cpl:"8,8",  cpa:"180", red:"9,4"  },
      { name:"TRABOCCO A&R",        leads:12,   pct:"0,41",  cpl:"—",    cpa:"51",  red:"—"    },
    ],
  },
  {
    id:"18/03_seed", date:"18/03",
    pressione:"1,75", leadGen:"3141", leadToBe:"3136",
    ore:"1187", oreDich:"1368", lavOra:"2,7",
    red:"17,9", resa:"0,51", ctc:"20,53", trabocco:"2,10",
    timing:"91", cpl:"11,8", cpa:"101",
    contattab:"61,1", durMedia:"8,22", contattabMese:"60,1",
    lavOraMese:"2,6", redMese:"17,4", resaMese:"0,51",
    timingMese:"90", cplMese:"11,4", cpaMese:"103", ctcMese:"18,74",
    hourly: HOURLY_18,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:1154, pct:"36,74", cpl:"15,3", cpa:"111", red:"18,5" },
      { name:"SPINUP SOCIAL",       leads:888,  pct:"28,27", cpl:"9,5",  cpa:"105", red:"14,2" },
      { name:"GALANO GOOGLE CTC",   leads:556,  pct:"17,70", cpl:"12,4", cpa:"88",  red:"25,5" },
      { name:"GALANO SOCIAL",       leads:214,  pct:"6,81",  cpl:"9,3",  cpa:"160", red:"9,3"  },
      { name:"ETC",                 leads:116,  pct:"3,69",  cpl:"4,3",  cpa:"30",  red:"31,9" },
      { name:"PAOLO SOCIAL",        leads:125,  pct:"3,98",  cpl:"9,5",  cpa:"117", red:"12,8" },
      { name:"TRABOCCO TLC",        leads:66,   pct:"2,10",  cpl:"6,5",  cpa:"240", red:"6,1"  },
      { name:"TRABOCCO A&R",        leads:23,   pct:"0,73",  cpl:"—",    cpa:"51",  red:"17,4" },
    ],
  },
  {
    id:"17/03_seed", date:"17/03",
    pressione:"2,82", leadGen:"3199", leadToBe:"3136",
    ore:"1201", oreDich:"1368", lavOra:"2,7",
    red:"18,1", resa:"0,52", ctc:"18,01", trabocco:"1,50",
    timing:"93", cpl:"12,3", cpa:"106",
    contattab:"61,5", durMedia:"8,22", contattabMese:"60,2",
    lavOraMese:"2,6", redMese:"17,3", resaMese:"0,51",
    timingMese:"90", cplMese:"11,3", cpaMese:"103", ctcMese:"18,59",
    hourly: HOURLY_17,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:1182, pct:"36,95", cpl:"15,0", cpa:"109", red:"19,0" },
      { name:"SPINUP SOCIAL",       leads:809,  pct:"25,29", cpl:"10,5", cpa:"116", red:"14,3" },
      { name:"GALANO GOOGLE CTC",   leads:506,  pct:"15,82", cpl:"13,7", cpa:"110", red:"21,9" },
      { name:"GALANO SOCIAL",       leads:373,  pct:"11,66", cpl:"8,8",  cpa:"97",  red:"16,9" },
      { name:"ETC",                 leads:139,  pct:"4,35",  cpl:"5,2",  cpa:"44",  red:"24,5" },
      { name:"PAOLO SOCIAL",        leads:121,  pct:"3,78",  cpl:"13,6", cpa:"114", red:"12,4" },
      { name:"TRABOCCO TLC",        leads:48,   pct:"1,50",  cpl:"8,9",  cpa:"419", red:"4,2"  },
      { name:"TRABOCCO A&R",        leads:22,   pct:"0,69",  cpl:"—",    cpa:"—",   red:"—"    },
    ],
  },
  {
    id:"16/03_seed", date:"16/03",
    pressione:"3,17", leadGen:"3367", leadToBe:"3136",
    ore:"1198", oreDich:"1368", lavOra:"2,8",
    red:"14,6", resa:"0,47", ctc:"17,32", trabocco:"3,50",
    timing:"91", cpl:"11,5", cpa:"118",
    contattab:"60,1", durMedia:"8,22", contattabMese:"60,1",
    lavOraMese:"2,5", redMese:"17,3", resaMese:"0,51",
    timingMese:"90", cplMese:"11,3", cpaMese:"103", ctcMese:"18,65",
    hourly: HOURLY_16,
    macrofonti: [
      { name:"GALANO GOOGLE CALDE", leads:1238, pct:"36,77", cpl:"14,1", cpa:"123", red:"14,6" },
      { name:"SPINUP SOCIAL",       leads:974,  pct:"28,93", cpl:"10,1", cpa:"116", red:"12,3" },
      { name:"GALANO GOOGLE CTC",   leads:452,  pct:"13,42", cpl:"13,3", cpa:"125", red:"16,8" },
      { name:"GALANO SOCIAL",       leads:253,  pct:"7,51",  cpl:"8,1",  cpa:"100", red:"13,4" },
      { name:"ETC",                 leads:164,  pct:"4,87",  cpl:"6,1",  cpa:"54",  red:"23,8" },
      { name:"PAOLO SOCIAL",        leads:155,  pct:"4,60",  cpl:"9,8",  cpa:"122", red:"11,0" },
      { name:"TRABOCCO TLC",        leads:118,  pct:"3,50",  cpl:"7,1",  cpa:"172", red:"7,6"  },
      { name:"TRABOCCO A&R",        leads:13,   pct:"0,39",  cpl:"—",    cpa:"—",   red:"—"    },
    ],
  },
];

const METRICS = [
  {key:"pressione",label:"PRESSIONE",          unit:"",  ph:"es. 1,75"},
  {key:"leadGen",  label:"LEAD GENERATE",       unit:"",  ph:"es. 3141"},
  {key:"leadToBe", label:"LEAD TO BE",          unit:"",  ph:"es. 3136"},
  {key:"ore",      label:"ORE effettive",       unit:"",  ph:"es. 1187"},
  {key:"oreDich",  label:"ORE dichiarate",      unit:"",  ph:"es. 1368"},
  {key:"lavOra",   label:"LAV/ORA",             unit:"",  ph:"es. 2,7"},
  {key:"red",      label:"RED",                 unit:"%", ph:"es. 17,9"},
  {key:"resa",     label:"RESA",                unit:"",  ph:"es. 0,51"},
  {key:"ctc",      label:"% CTC",               unit:"%", ph:"es. 20,53"},
  {key:"trabocco", label:"Trabocco TLC",         unit:"%", ph:"es. 2,10"},
  {key:"timing",   label:"TIMING 1-5min",       unit:"%", ph:"es. 91"},
  {key:"contattab",label:"CONTATTAB. netto CTC",unit:"%", ph:"es. 65,0"},
  {key:"cpl",      label:"CPL",                 unit:"€", ph:"es. 11,8"},
  {key:"cpa",      label:"CPA",                 unit:"€", ph:"es. 101"},
];
const METRICS_MESE = [
  {key:"lavOraMese",    label:"LAV/ORA media mese",          ph:"es. 2,6"},
  {key:"redMese",       label:"RED media mese",              ph:"es. 17,4", unit:"%"},
  {key:"resaMese",      label:"RESA media mese",             ph:"es. 0,51"},
  {key:"ctcMese",       label:"% CTC media mese",            ph:"es. 18,65", unit:"%"},
  {key:"timingMese",    label:"TIMING media mese",           ph:"es. 90",   unit:"%"},
  {key:"contattabMese", label:"CONTATTAB. netto CTC media mese", ph:"es. 63,0", unit:"%"},
  {key:"cplMese",       label:"CPL media mese",              ph:"es. 11,4", unit:"€"},
  {key:"cpaMese",       label:"CPA media mese",              ph:"es. 103",  unit:"€"},
];

// ── Utils ──
function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return String(d.getDate()).padStart(2,"0") + "/" + String(d.getMonth()+1).padStart(2,"0");
}
// Fonde i record dello Sheet con i seed hardcodati (priorità allo Sheet per date in comune)
function mergeWithSeed(sheetRecords) {
  const sheetDates = new Set(sheetRecords.map(r => r.date));
  const seedOnly = SEED_DATA.filter(s => !sheetDates.has(s.date));
  const merged = [...sheetRecords, ...seedOnly].sort((a,b) => sortKey(b.date).localeCompare(sortKey(a.date)));
  return enrichWithInheritedTobe(merged);
}

function sortKey(s) {
  if (!s || !s.includes("/")) return "0000";
  const parts = s.split("/");
  return parts[1] + parts[0];
}
function fromISO(s) {
  if (!s) return "";
  const p = s.split("-");
  return p[2] + "/" + p[1];
}

// ── Ereditarietà TO BE: se un record ha leadToBe o oreDich nullo/vuoto/—,
//    eredita il valore dal record precedente più recente con il campo valorizzato.
//    I flag _leadToBeInherited / _oreDichInherited permettono alla UI di mostrare l'asterisco.
//    Il dato nel KV non viene toccato: l'ereditarietà è solo in memoria, per visualizzazione e calcoli.
function isMissingTobe(v) {
  if (v == null) return true;
  const s = String(v).trim();
  return s === "" || s === "—" || s === "-" || s === "null" || s === "undefined";
}
function enrichWithInheritedTobe(records) {
  if (!records || !records.length) return records;
  // Ordino per data crescente (dal più vecchio al più recente)
  const byDateAsc = [...records].sort((a,b) => sortKey(a.date).localeCompare(sortKey(b.date)));
  let lastLeadToBe = null, lastLeadToBeDate = null;
  let lastOreDich = null, lastOreDichDate = null;
  const enrichedById = new Map();
  byDateAsc.forEach(r => {
    const out = { ...r };
    // leadToBe
    if (isMissingTobe(r.leadToBe)) {
      if (lastLeadToBe != null) {
        out.leadToBe = lastLeadToBe;
        out._leadToBeInherited = true;
        out._leadToBeFromDate = lastLeadToBeDate;
      }
    } else {
      lastLeadToBe = r.leadToBe;
      lastLeadToBeDate = r.date;
    }
    // oreDich
    if (isMissingTobe(r.oreDich)) {
      if (lastOreDich != null) {
        out.oreDich = lastOreDich;
        out._oreDichInherited = true;
        out._oreDichFromDate = lastOreDichDate;
      }
    } else {
      lastOreDich = r.oreDich;
      lastOreDichDate = r.date;
    }
    enrichedById.set(r.id || r.date, out);
  });
  // Mantengo l'ordine originale dei record in input
  return records.map(r => enrichedById.get(r.id || r.date) || r);
}

// Ridimensiona immagine lato client prima di inviarla all'API (max 1200px sul lato lungo)
function resizeImage(file, maxPx = 1200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const b64 = canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
        resolve({ name: file.name, b64, mime: "image/jpeg", preview: "data:image/jpeg;base64," + b64 });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function toNum(v) {
  return parseFloat(String(v || "").replace(",", "."));
}
function calcPct(a, b) {
  const na = toNum(a), nb = toNum(b);
  if (isNaN(na) || isNaN(nb) || nb === 0) return null;
  return ((na - nb) / nb * 100).toFixed(2);
}
function avgOf(arr) {
  const valid = arr.map(x => toNum(x)).filter(x => !isNaN(x));
  if (!valid.length) return null;
  return (valid.reduce((s,x) => s+x, 0) / valid.length).toFixed(1);
}
function fv(v) { return (v != null && v !== "") ? String(v) : "—"; }

function buildReport(d) {
  if (!d) return "";
  const d1 = calcPct(d.leadGen, d.leadToBe);
  const d2 = calcPct(d.ore, d.oreDich);
  const s1 = d1 !== null ? "(" + (parseFloat(d1) >= 0 ? "+" : "") + d1 + "%)" : "(—)";
  const s2 = d2 !== null ? "(" + (parseFloat(d2) >= 0 ? "+" : "") + d2 + "%)" : "(—)";
  return [
    "CS Energia", d.date,
    "PRESSIONE: " + fv(d.pressione),
    "LEAD GENERATE: " + fv(d.leadGen) + " vs " + fv(d.leadToBe) + " TO BE " + s1,
    "ORE: " + fv(d.ore) + " vs " + fv(d.oreDich) + " dichiarate " + s2,
    "LAV/ORA: " + fv(d.lavOra) + " (" + fv(d.lavOraMese) + " media mese)",
    "RED: " + fv(d.red) + "% (" + fv(d.redMese) + "% media mese)",
    "RESA: " + fv(d.resa) + " (" + fv(d.resaMese) + " media mese)",
    "% CTC: " + fv(d.ctc) + "% di cui Trabocco TLC " + fv(d.trabocco) + "%",
    "Timing 1-5 min (netto CTC): " + fv(d.timing) + "% (" + fv(d.timingMese) + "% media mese)",
    "CPL: " + fv(d.cpl) + "€ (" + fv(d.cplMese) + "€ media mese)",
    "CPA: " + fv(d.cpa) + "€ (" + fv(d.cpaMese) + "€ media mese)",
  ].join("\n");
}

function emptyForm() {
  const o = { date: yesterday() };
  METRICS.forEach(m => { o[m.key] = ""; });
  METRICS_MESE.forEach(m => { o[m.key] = ""; });
  return o;
}

const HOURLY_AGG_16_19 = [
  { ora:0,  leads:4,    leadsU:3,    timingAvg:null, contAvg:"100,0", pressAvg:"7,33" },
  { ora:2,  leads:2,    leadsU:1,    timingAvg:null, contAvg:"100,0", pressAvg:"2,00" },
  { ora:6,  leads:3,    leadsU:null, timingAvg:null, contAvg:"33,3",  pressAvg:"3,67" },
  { ora:7,  leads:33,   leadsU:13,   timingAvg:null, contAvg:"63,6",  pressAvg:"2,68" },
  { ora:8,  leads:25,   leadsU:12,   timingAvg:24,   contAvg:"70,8",  pressAvg:"3,04" },
  { ora:9,  leads:570,  leadsU:304,  timingAvg:92,   contAvg:"67,6",  pressAvg:"2,85" },
  { ora:10, leads:1102, leadsU:617,  timingAvg:91,   contAvg:"69,2",  pressAvg:"2,70" },
  { ora:11, leads:1223, leadsU:703,  timingAvg:97,   contAvg:"67,6",  pressAvg:"2,54" },
  { ora:12, leads:1407, leadsU:823,  timingAvg:97,   contAvg:"66,6",  pressAvg:"2,54" },
  { ora:13, leads:1249, leadsU:688,  timingAvg:93,   contAvg:"63,5",  pressAvg:"2,77" },
  { ora:14, leads:1295, leadsU:727,  timingAvg:98,   contAvg:"69,7",  pressAvg:"2,55" },
  { ora:15, leads:1303, leadsU:708,  timingAvg:94,   contAvg:"67,1",  pressAvg:"2,60" },
  { ora:16, leads:1224, leadsU:732,  timingAvg:97,   contAvg:"66,7",  pressAvg:"2,51" },
  { ora:17, leads:1319, leadsU:785,  timingAvg:86,   contAvg:"67,3",  pressAvg:"2,38" },
  { ora:18, leads:939,  leadsU:524,  timingAvg:84,   contAvg:"68,4",  pressAvg:"2,40" },
  { ora:19, leads:702,  leadsU:367,  timingAvg:91,   contAvg:"66,8",  pressAvg:"2,45" },
  { ora:20, leads:203,  leadsU:97,   timingAvg:63,   contAvg:"58,3",  pressAvg:"2,47" },
  { ora:21, leads:17,   leadsU:5,    timingAvg:23,   contAvg:"53,8",  pressAvg:"2,85" },
  { ora:22, leads:19,   leadsU:11,   timingAvg:null, contAvg:"81,3",  pressAvg:"1,94" },
  { ora:23, leads:9,    leadsU:5,    timingAvg:null, contAvg:"66,7",  pressAvg:"3,33" },
];

function buildMergedHourly(recs) {
  const rWithData = recs.filter(r => r.hourly && r.hourly.length > 0);
  if (!rWithData.length) return [];
  const dates = rWithData.map(r => r.date).sort();
  if (dates.length === 4 && dates[0] === "16/03" && dates[1] === "17/03" && dates[2] === "18/03" && dates[3] === "19/03") {
    return HOURLY_AGG_16_19.map(h => ({ ...h, timingMin: null, timingMax: null, multiDay: true, dayCount: 4 }));
  }
  const allOras = [...new Set(rWithData.flatMap(r => r.hourly.map(h => h.ora)))].sort((a,b) => a-b);
  return allOras.map(ora => {
    const rows = rWithData.map(r => r.hourly.find(h => h.ora === ora)).filter(Boolean);
    const timings = rows.map(h => h.timing).filter(x => x != null);
    const conts = rows.map(h => h.cont ? toNum(h.cont) : null).filter(x => x != null);
    const presses = rows.map(h => h.press ? toNum(h.press) : null).filter(x => x != null);
    return {
      ora,
      leads: rows.reduce((s,h) => s + (h.leads || 0), 0),
      leadsU: rows.reduce((s,h) => s + (h.leadsU || 0), 0),
      dayCount: rows.length,
      timingAvg: timings.length ? Math.round(timings.reduce((s,x) => s+x,0) / timings.length) : null,
      timingMin: timings.length ? Math.min(...timings) : null,
      timingMax: timings.length ? Math.max(...timings) : null,
      contAvg: conts.length ? (conts.reduce((s,x) => s+x,0) / conts.length).toFixed(1) : null,
      pressAvg: presses.length ? (presses.reduce((s,x) => s+x,0) / presses.length).toFixed(2) : null,
      multiDay: rWithData.length > 1,
    };
  });
}

// ── Design tokens ──
const P = "#664CCD";
const O = "#FD6F3B";
const BG = "#0d0b1e";
const CARD = "#1a1540";
const CARD2 = "#120f30";
const BD = "#664CCD30";
const TX = "#f0eeff";
const MU = "#9b8fc4";
const FF = "Verdana, Geneva, sans-serif";

const cardCss = { background: CARD, border: "1px solid " + BD, borderRadius: "12px", padding: "22px 24px", marginBottom: "18px" };
const inpCss = { width: "100%", background: CARD2, border: "1px solid " + BD, borderRadius: "7px", color: TX, padding: "10px 13px", fontFamily: FF, fontSize: "14px", outline: "none", boxSizing: "border-box" };
const lblCss = { fontSize: "11px", letterSpacing: "1.5px", color: MU, textTransform: "uppercase", marginBottom: "7px", display: "block", fontFamily: FF };
const secCss = { fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "18px", fontFamily: FF, fontWeight: "bold" };

// ── Sub-components ──
function Chip({ val }) {
  if (val === null) return <span style={{ color: "#555" }}>—</span>;
  const pos = parseFloat(val) >= 0;
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px", borderRadius: "5px",
      fontSize: "12px", fontFamily: FF, fontWeight: "bold",
      background: pos ? "#1a7a4025" : "#c0392b25",
      color: pos ? "#4caf50" : "#ff5c5c",
      border: "1px solid " + (pos ? "#1a7a4060" : "#c0392b60"),
    }}>
      {pos ? "+" : ""}{val}%
    </span>
  );
}

function TimingBadge({ val, min, max, multi }) {
  if (val == null) return <span style={{ color: "#555", fontFamily: FF }}>—</span>;
  let bg = "#664CCD22", color = MU;
  if (val >= 98) { bg = "#1a7a4030"; color = "#4caf50"; }
  else if (val < 90) { bg = "#c0392b30"; color = "#ff5c5c"; }
  return (
    <span style={{ fontWeight: "bold", fontFamily: FF, color, background: bg, padding: "2px 7px", borderRadius: "4px", fontSize: "13px" }}>
      {val}%
      {multi && min != null && (
        <span style={{ fontSize: "11px", color: MU, marginLeft: "4px" }}>({min}–{max})</span>
      )}
    </span>
  );
}

function NavBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "10px 18px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: FF, fontWeight: "bold", background: active ? P : "transparent", color: active ? "#fff" : MU }}>
      {label}
    </button>
  );
}
function PrimaryBtn({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: P, color: "#fff", border: "none", borderRadius: "8px", padding: "11px 22px", fontSize: "14px", fontFamily: FF, cursor: "pointer", fontWeight: "bold", ...style }}>{children}</button>;
}
function OrangeBtn({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: O, color: "#fff", border: "none", borderRadius: "8px", padding: "11px 22px", fontSize: "14px", fontFamily: FF, cursor: "pointer", fontWeight: "bold", ...style }}>{children}</button>;
}
function OutlineBtn({ children, onClick, style }) {
  return <button onClick={onClick} style={{ background: "transparent", color: P, border: "2px solid " + P, borderRadius: "8px", padding: "11px 22px", fontSize: "14px", fontFamily: FF, cursor: "pointer", fontWeight: "bold", ...style }}>{children}</button>;
}

const SUGGESTED = [
  "Quali sono i fornitori con CPA più alto rispetto al target di 103€ e cosa mi suggerisci per ottimizzarli?",
  "Il timing 1-5 min è sotto target in alcune fasce orarie: come impatta sulla resa e cosa posso fare?",
  "Analizza il trend di lead generate e CPL degli ultimi giorni: siamo in linea con gli obiettivi mensili?",
  "Quali macro fonti stanno performando meglio in termini di RED e quali richiedono interventi urgenti?",
  "Le ore effettive sono inferiori a quelle dichiarate: qual è l'impatto sui lead generati e come recuperare?",
];

function buildSystemPrompt(context) {
  return `Sei l'assistente AI del Direttore Marketing di ComparaSemplice.it (Innova Semplice S.p.A.), piattaforma italiana di comparazione energia e lead generation. \nHai accesso ai dati di performance del call center e delle campagne marketing.\nRispondi sempre in italiano, in modo conciso e operativo. Usa numeri concreti quando disponibili.\nContesto dati corrente:\n${context}`;
}

function buildReportCtx(r, fv, calcPct) {
  if (!r) return "Nessun dato disponibile.";
  return [
    "DATA: " + fv(r.date),
    "LEAD GENERATE: " + fv(r.leadGen) + " (TO BE: " + fv(r.leadToBe) + ", Delta: " + (calcPct(r.leadGen,r.leadToBe)||"—") + "%)",
    "ORE: " + fv(r.ore) + " (dichiarate: " + fv(r.oreDich) + ", Delta: " + (calcPct(r.ore,r.oreDich)||"—") + "%)",
    "LAV/ORA: " + fv(r.lavOra) + " (media mese: " + fv(r.lavOraMese) + ")",
    "PRESSIONE: " + fv(r.pressione),
    "RED: " + fv(r.red) + "% (media mese: " + fv(r.redMese) + "%)",
    "RESA: " + fv(r.resa) + " (media mese: " + fv(r.resaMese) + ")",
    "% CTC: " + fv(r.ctc) + "% (media mese: " + fv(r.ctcMese) + "%)",
    "TIMING 1-5 min: " + fv(r.timing) + "% (media mese: " + fv(r.timingMese) + "%)",
    "CPL: " + fv(r.cpl) + "€ (media mese: " + fv(r.cplMese) + "€)",
    "CPA: " + fv(r.cpa) + "€ (media mese: " + fv(r.cpaMese) + "€)",
    r.macrofonti ? "\nMACROFONTI:\n" + r.macrofonti.map(mf => mf.name + ": " + mf.leads + " lead, RED " + mf.red + "%, CPL " + mf.cpl + "€, CPA " + mf.cpa + "€").join("\n") : "",
  ].join("\n");
}

function AiChat({ context }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleAttach = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(f => new Promise(res => {
      resizeImage(f).then(img => res(img));
    }))).then(imgs => setAttachments(prev => [...prev, ...imgs]));
    e.target.value = "";
  };

  const send = async (text) => {
    const hasContent = (text && text.trim()) || attachments.length > 0;
    if (!hasContent || loading) return;
    let userContent;
    if (attachments.length > 0) {
      userContent = [
        ...attachments.map(a => ({ type: "image", source: { type: "base64", media_type: a.mime, data: a.b64 } })),
        { type: "text", text: (text && text.trim()) ? text.trim() : "Analizza questo screenshot nel contesto dei dati." },
      ];
    } else {
      userContent = text.trim();
    }
    const displayMsg = { role: "user", content: userContent, displayText: (text && text.trim()) ? text.trim() : "", previews: attachments.map(a => a.preview), apiContent: userContent };
    const prevApiMsgs = msgs.map(m => ({ role: m.role, content: m.apiContent || m.content }));
    const newApiMsgs = [...prevApiMsgs, { role: "user", content: userContent }];
    const newMsgs = [...msgs, displayMsg];
    setMsgs(newMsgs);
    setInput("");
    setAttachments([]);
    setLoading(true);
    try {
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(context), messages: newApiMsgs }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Errore nella risposta.";
      setMsgs([...newMsgs, { role: "assistant", content: reply, apiContent: reply }]);
    } catch (e) {
      setMsgs([...newMsgs, { role: "assistant", content: "Errore di connessione. Riprova.", apiContent: "Errore." }]);
    }
    setLoading(false);
  };

  const canSend = ((input && input.trim()) || attachments.length > 0) && !loading;

  return (
    <div style={{ marginTop: "32px", background: "#1a1540", border: "1px solid #664CCD44", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(135deg,#664CCD33,#0d0b1e)", padding: "16px 22px", borderBottom: "1px solid #664CCD33", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#664CCD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🤖</div>
        <div>
          <div style={{ color: "#fff", fontWeight: "bold", fontSize: "15px", fontFamily: FF }}>AI Marketing Analyst</div>
          <div style={{ color: "#9b8fc4", fontSize: "12px", fontFamily: FF }}>Fai domande · Allega screenshot 📎 · Powered by Claude</div>
        </div>
      </div>
      {msgs.length === 0 && (
        <div style={{ padding: "18px 22px 0" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#9b8fc4", fontFamily: FF, marginBottom: "12px", textTransform: "uppercase" }}>Domande suggerite</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {SUGGESTED.map((q, i) => (
              <button key={i} onClick={() => send(q)} style={{ background: "#664CCD18", border: "1px solid #664CCD44", borderRadius: "8px", padding: "10px 14px", color: "#c4b8ff", fontSize: "13px", fontFamily: FF, cursor: "pointer", textAlign: "left", lineHeight: "1.4" }}>
                💬 {q}
              </button>
            ))}
          </div>
          <div style={{ height: "18px" }} />
        </div>
      )}
      {msgs.length > 0 && (
        <div style={{ padding: "18px 22px", maxHeight: "420px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: m.role === "user" ? "#FD6F3B" : "#664CCD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                {m.role === "user" ? "👤" : "🤖"}
              </div>
              <div style={{ background: m.role === "user" ? "#FD6F3B22" : "#664CCD22", border: "1px solid " + (m.role === "user" ? "#FD6F3B33" : "#664CCD33"), borderRadius: "10px", padding: "10px 14px", maxWidth: "80%", fontSize: "14px", fontFamily: FF, color: "#f0eeff", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                {m.previews && m.previews.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: m.displayText ? "8px" : "0" }}>
                    {m.previews.map((p, pi) => (
                      <img key={pi} src={p} alt="" style={{ height: "80px", borderRadius: "6px", border: "1px solid #FD6F3B44", objectFit: "cover", maxWidth: "200px" }} />
                    ))}
                  </div>
                )}
                {m.displayText || (typeof m.content === "string" ? m.content : "")}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#664CCD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🤖</div>
              <div style={{ background: "#664CCD22", border: "1px solid #664CCD33", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", fontFamily: FF, color: "#9b8fc4" }}>Sto analizzando…</div>
            </div>
          )}
        </div>
      )}
      {attachments.length > 0 && (
        <div style={{ padding: "10px 22px 0", display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid #664CCD22" }}>
          {attachments.map((a, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={a.preview} alt={a.name} style={{ height: "56px", borderRadius: "6px", border: "1px solid #664CCD55", objectFit: "cover", maxWidth: "120px" }} />
              <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ff5c5c", border: "none", borderRadius: "50%", width: "16px", height: "16px", color: "#fff", fontSize: "10px", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: "12px 22px 14px", borderTop: "1px solid #664CCD22", marginTop: attachments.length > 0 ? "10px" : "0", display: "flex", gap: "8px", alignItems: "center" }}>
        {msgs.length > 0 && (
          <button onClick={() => { setMsgs([]); setAttachments([]); }} style={{ background: "transparent", border: "1px solid #664CCD30", borderRadius: "7px", color: "#9b8fc4", padding: "9px 10px", fontSize: "12px", fontFamily: FF, cursor: "pointer" }} title="Reset chat">↺</button>
        )}
        <label style={{ cursor: "pointer", flexShrink: 0 }} title="Allega screenshot">
          <div style={{ background: attachments.length > 0 ? "#664CCD44" : "#664CCD1a", border: "1px solid #664CCD55", borderRadius: "7px", padding: "9px 11px", fontSize: "16px", lineHeight: 1 }}>📎</div>
          <input type="file" accept="image/*" multiple onChange={handleAttach} style={{ display: "none" }} />
        </label>
        <input
          style={{ flex: 1, background: "#120f30", border: "1px solid #664CCD44", borderRadius: "7px", color: "#f0eeff", padding: "10px 13px", fontFamily: FF, fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && canSend) send(input); }}
          placeholder={attachments.length > 0 ? "Aggiungi un commento (opzionale)…" : "Scrivi una domanda o allega uno screenshot…"}
        />
        <button onClick={() => send(input)} disabled={!canSend}
          style={{ background: canSend ? "#664CCD" : "#664CCD55", border: "none", borderRadius: "7px", color: "#fff", padding: "10px 18px", fontSize: "14px", fontFamily: FF, cursor: canSend ? "pointer" : "default", fontWeight: "bold", flexShrink: 0 }}>
          Invia →
        </button>
      </div>
    </div>
  );
}

function ReportRecapBtn({ r }) {
  const [lines, setLines] = useState([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const plain = (t) => ({ text: t, color: null });
    let result = [];
    if (r.sintesi) {
      r.sintesi.split("\n").forEach(line => result.push(plain(line)));
    } else {
      result.push(plain("⚠️ Sintesi operativa non ancora generata. Genera prima la sintesi AI."));
    }
    setLines(result);
  };

  const copy = () => {
    const plainText = lines.map(l => l.text).join("\n");
    try {
      const el = document.createElement("textarea");
      el.value = plainText; el.style.position = "fixed"; el.style.opacity = "0";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      navigator.clipboard?.writeText(plainText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
      {!r.sintesi && (
        <div style={{ fontSize: "12px", fontFamily: FF, color: "#f5a623", background: "#f5a62318", border: "1px solid #f5a62344", borderRadius: "7px", padding: "7px 12px", textAlign: "right" }}>
          ⚠️ Prima genera la Sintesi Operativa AI
        </div>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={generate} style={{ background: "#FD6F3B", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: "pointer" }}>📋 Genera Recap</button>
        {lines.length > 0 && <button onClick={copy} style={{ background: copied ? "#664CCD" : "#664CCD33", border: "1px solid #664CCD", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: copied ? "#fff" : "#c4b8ff", cursor: "pointer" }}>{copied ? "✓ Copiato!" : "Copia testo"}</button>}
        {lines.length > 0 && <button onClick={() => setLines([])} style={{ background: "transparent", border: "1px solid #2a2248", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", fontFamily: FF, color: "#7a6fa8", cursor: "pointer" }}>✕</button>}
      </div>
      {lines.length > 0 && (
        <pre style={{ background: "#0f0c1e", border: "1px solid #664CCD44", borderRadius: "10px", padding: "16px 18px", fontSize: "13px", fontFamily: "'IBM Plex Mono','Courier New',monospace", lineHeight: "1.7", whiteSpace: "pre-wrap", margin: "0", maxWidth: "600px", textAlign: "left" }}>
          {lines.map((l, i) => (
            <span key={i} style={{ color: l.color || "#e8e2ff", display: "block" }}>{l.text}</span>
          ))}
        </pre>
      )}
    </div>
  );
}

function SintesiBox({ r, records, onSave }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sintesiScreens, setSintesiScreens] = useState([]);

  const handleSintesiPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItems = Array.from(items).filter(item => item.type.startsWith("image/"));
    if (!imageItems.length) return;
    e.preventDefault();
    imageItems.forEach(item => {
      const file = item.getAsFile();
      if (!file) return;
      resizeImage(file).then(img => setSintesiScreens(prev => [...prev, { base64: img.b64, mediaType: img.mime, name: "paste_" + Date.now() + ".png" }]));
    });
  };

  const loadScreens = (files) => {
    Array.from(files).forEach(file => {
      resizeImage(file).then(img => setSintesiScreens(prev => [...prev, { base64: img.b64, mediaType: img.mime, name: file.name }]));
    });
  };

  const buildImageContent = () => sintesiScreens.map(s => ({
    type: "image",
    source: { type: "base64", media_type: s.mediaType, data: s.base64 }
  }));

  const buildCtx = () => {
    const fv = (v) => (v != null && v !== "") ? String(v) : "—";
    const pct = (a, b) => { const na=parseFloat(String(a).replace(",",".")), nb=parseFloat(String(b).replace(",",".")); if(isNaN(na)||isNaN(nb)||nb===0) return null; return ((na-nb)/nb*100).toFixed(1); };
    const sign = (v) => v === null ? "n.d." : (parseFloat(v)>=0?"+":"")+v+"%";
    const hourlyToBe = getHourlyToBe(r.date);
    const macroToBe = getMacroToBe(r.date);

    // ── SEZIONE 1: KPI base ──
    const lavNum = parseFloat((r.lavOra||"").replace(",","."));
    const oreNum = parseFloat((r.ore||"").replace(",","."));
    const leadGenNum = parseFloat((r.leadGen||"").replace(",","."));
    const leadEff = (!isNaN(lavNum)&&!isNaN(oreNum)) ? Math.round(lavNum*oreNum) : null;
    const deltaEff = (leadEff&&!isNaN(leadGenNum)) ? ((leadEff-leadGenNum)/leadGenNum*100).toFixed(2) : null;

    const kpi = [
      "DATA: " + fv(r.date) + "/2026",
      "LEAD: " + fv(r.leadGen) + " vs " + fv(r.leadToBe) + " TO BE (delta " + sign(pct(r.leadGen,r.leadToBe)) + ")",
      "LEAD_EFFETTIVE: " + (leadEff||"—") + " (" + (deltaEff!==null?(parseFloat(deltaEff)>=0?"+":"")+deltaEff+"%":"—") + " vs lead generate)",
      "ORE: " + fv(r.ore) + " vs " + fv(r.oreDich) + " TO BE (delta " + sign(pct(r.ore,r.oreDich)) + ")",
      "LAV/ORA: " + fv(r.lavOra) + " mese=" + fv(r.lavOraMese) + " delta=" + sign(pct(r.lavOra,r.lavOraMese)),
      "RED: " + fv(r.red) + "% mese=" + fv(r.redMese) + "% delta=" + sign(pct(r.red,r.redMese)),
      "RESA: " + fv(r.resa) + " mese=" + fv(r.resaMese) + " delta=" + sign(pct(r.resa,r.resaMese)),
      "CTC: " + fv(r.ctc) + "% trabocco=" + fv(r.trabocco) + "% mese=" + fv(r.ctcMese) + "% delta=" + sign(pct(r.ctc,r.ctcMese)),
      "TIMING: " + fv(r.timing) + "% mese=" + fv(r.timingMese) + "% delta=" + sign(pct(r.timing,r.timingMese)),
      "CONTATTAB: " + fv(r.contattab) + "% mese=" + fv(r.contattabMese) + "% delta=" + sign(pct(r.contattab,r.contattabMese)),
      "CPL: " + fv(r.cpl) + "€ mese=" + fv(r.cplMese) + "€ delta=" + sign(pct(r.cpl,r.cplMese)),
      "CPA: " + fv(r.cpa) + "€ mese=" + fv(r.cpaMese) + "€ delta=" + sign(pct(r.cpa,r.cpaMese)),
    ];

    // Miglior CPA del mese (feriali)
    const allRecs = typeof records !== "undefined" ? records : [];
    const sameMonthFeriali = allRecs.filter(rec => {
      if (!rec.date||!rec.cpa||rec.cpa==="—") return false;
      const rp=rec.date.split("/"), cp=(r.date||"").split("/");
      if(rp[1]!==cp[1]) return false;
      const d=new Date(2026,parseInt(rp[1])-1,parseInt(rp[0]));
      return d.getDay()!==0&&d.getDay()!==6;
    });
    const bestCpa = sameMonthFeriali.length>0 ? sameMonthFeriali.reduce((a,b)=>parseFloat(a.cpa)<parseFloat(b.cpa)?a:b) : null;
    const isBestCpa = bestCpa && bestCpa.date===r.date;
    if(isBestCpa) kpi.push("★ MIGLIOR_CPA_MESE: SÌ (€" + r.cpa + " il " + r.date + ")");
    else if(bestCpa) kpi.push("MIGLIOR_CPA_MESE: " + bestCpa.date + " con €" + bestCpa.cpa);

    // ── SEZIONE 2: Classificazione fasce ──
    const fasce = { NON_ALIMENTATA: [], OVER_GENERAZIONE: [], CAUSA_SALA: [] };
    (r.hourly||[]).filter(h=>h.leads>0&&h.ora>=9&&h.ora<=19&&h.timing!=null).forEach(h => {
      const tb = hourlyToBe ? hourlyToBe[h.ora] : null;
      const deltaLead = tb ? ((h.leads-tb)/tb*100) : null;
      if(h.timing>=98) { if(deltaLead===null||deltaLead<0) fasce.NON_ALIMENTATA.push(h.ora+":00"); }
      else if(h.timing<90) {
        if(deltaLead!==null&&deltaLead>0) fasce.OVER_GENERAZIONE.push(h.ora+":00");
        else fasce.CAUSA_SALA.push(h.ora+":00");
      }
    });

    const fasceLines = [
      "FASCE_TIMING (classificazione precalcolata dal codice, usa questi dati senza rielaborare):",
      fasce.NON_ALIMENTATA.length>0 ? "NON_ALIMENTATA (timing≥98%, lead<TO BE): " + fasce.NON_ALIMENTATA.join(", ") : "NON_ALIMENTATA: nessuna",
      fasce.OVER_GENERAZIONE.length>0 ? "OVER_GENERAZIONE (timing<90%, lead>TO BE): " + fasce.OVER_GENERAZIONE.join(", ") : "OVER_GENERAZIONE: nessuna",
      fasce.CAUSA_SALA.length>0 ? "CAUSA_SALA (timing<90%, lead≤TO BE): " + fasce.CAUSA_SALA.join(", ") : "CAUSA_SALA: nessuna",
    ];

    // Dati orari compatti per elenco fasce fuori range
    const hourlyLines = (r.hourly||[]).filter(h=>h.leads>0&&h.ora>=9&&h.ora<=19&&h.timing!=null&&(h.timing<90||h.timing>=98)).map(h => {
      const tb = hourlyToBe ? hourlyToBe[h.ora] : null;
      const d = tb ? (((h.leads-tb)/tb)*100).toFixed(0) : null;
      const emoji = h.timing<90 ? "🟠" : "🔴";
      return emoji + " " + h.ora + ":00 → " + h.timing + "% (" + (d!==null?(parseFloat(d)>=0?"+":"")+d+"% vs TO BE":"—") + ")";
    });

    // ── SEZIONE 3: Pattern mese precalcolato ──
    // Nuove soglie (v84):
    // - timing_mese < 85% → over-generazione cronica sulla fascia (generazione eccessiva, operatori in coda)
    // - timing_mese ≥ 98% → under-generazione cronica (pochi lead, operatori liberi)
    // - tra 85% e 98% → marginale, non segnalato
    const patternOver = [];  // fasce < 85% (over-generazione)
    const patternUnder = []; // fasce >= 98% (under-generazione)
    if(r.hourlyMese) {
      [9,10,11,12,13,14,15,16,17,18,19].forEach(h => {
        const v = r.hourlyMese[h];
        if(v==null) return;
        if(v<85) {
          patternOver.push({ h, v });
        } else if(v>=98) {
          patternUnder.push({ h, v });
        }
      });
    }
    const patternActions = [];
    if (patternOver.length > 0) {
      patternActions.push("OVER_GENERAZIONE_CRONICA (ridurre generazione mensile): " + patternOver.map(x => x.h + ":00 (" + x.v + "%)").join(", "));
    }
    if (patternUnder.length > 0) {
      patternActions.push("UNDER_GENERAZIONE_CRONICA (aumentare generazione mensile): " + patternUnder.map(x => x.h + ":00 (" + x.v + "%)").join(", "));
    }
    const patternLines = patternActions.length>0
      ? ["PATTERN_MESE (precalcolato — fasce con timing mese strutturalmente fuori range. Non classificare cause, usa testo sotto):"].concat(patternActions)
      : ["PATTERN_MESE: nessuna fascia strutturalmente fuori range nel mese"];

    // ── SEZIONE 4: Ranking macrofornitori precalcolato ──
    const CPA_TARGET = 100;
    const RED_CRIT_GOOGLE = 15.5, RED_WARN_GOOGLE = 19.5;
    const RED_CRIT_SOCIAL = 12.5, RED_WARN_SOCIAL = 15.5;

    const isGoogle = n => n.includes("GOOGLE");
    const redAlert = (name, red) => {
      const v=parseFloat(red); if(isNaN(v)) return "";
      if(isGoogle(name)) return v<RED_CRIT_GOOGLE?"CRITICO":v<RED_WARN_GOOGLE?"WARNING":"OK";
      return v<RED_CRIT_SOCIAL?"CRITICO":v<RED_WARN_SOCIAL?"WARNING":"OK";
    };

    const fornitori5 = ["GALANO GOOGLE CALDE","SPINUP SOCIAL","GALANO GOOGLE CTC","GALANO SOCIAL","PAOLO SOCIAL"];
    const macroMeseMap = {};
    (r.macrofontiMese||[]).forEach(m => { macroMeseMap[m.name]=m; });
    const macroGiornoMap = {};
    (r.macrofonti||[]).forEach(m => { macroGiornoMap[m.name]=m; });

    // Ranking fornitori: ordinati per CPA mese DAL PIÙ BASSO (migliore) AL PIÙ ALTO (peggiore).
    // I primi 2 sono i migliori ("primi2"); dal 3° in poi sono i non-migliori.
    const ranked = fornitori5
      .filter(n => macroMeseMap[n])
      .sort((a,b) => parseFloat(macroMeseMap[a].cpa)-parseFloat(macroMeseMap[b].cpa));

    const macroRankLines = ["MACROFORNITORI_RANKING (precalcolato, usa senza rielaborare):"];
    const azioniPerFornitore = {}; // Raccogliamo le azioni assegnate per il calcolo della riallocazione
    ranked.forEach((name, i) => {
      const m = macroMeseMap[name];
      const g = macroGiornoMap[name];
      const tb = macroToBe ? macroToBe[name] : null;
      const deltaVsTobe = g&&tb ? (((g.leads-tb)/tb)*100).toFixed(1) : null;
      const cpaMeseNum = parseFloat(m.cpa);
      const cpaGiornoNum = g ? parseFloat(g.cpa) : null;
      // Nota: la logica "cappato" è implicita nel ramo "i>=2 + sotto TO BE" dello switch azione.

      // Trend 3 giorni: ordine cronologico vecchio→intermedio→recente
      const prevRecords = allRecs
        .filter(rec => rec.date !== r.date)
        .sort((a,b) => sortKey(b.date).localeCompare(sortKey(a.date)))
        .slice(0,2);
      const trend3 = [...prevRecords, r].sort((a,b) => sortKey(a.date).localeCompare(sortKey(b.date)));
      const trend3Cpa = trend3.map(rec => {
        const mf = (rec.macrofonti||[]).find(x=>x.name===name);
        return mf ? { date: rec.date, cpa: parseFloat(mf.cpa) } : null;
      }).filter(Boolean);

      // Trend CPA 3 giorni: POSITIVO (in calo monotono) / NEGATIVO (in salita monotona) / STABILE (tutti gli altri casi)
      let trendDir = "STABILE";
      if (trend3Cpa.length >= 3) {
        const c0 = trend3Cpa[0].cpa, c1 = trend3Cpa[1].cpa, c2 = trend3Cpa[2].cpa;
        if (c0 > c1 && c1 > c2) trendDir = "POSITIVO";
        else if (c0 < c1 && c1 < c2) trendDir = "NEGATIVO";
        else trendDir = "STABILE";
      } else if (trend3Cpa.length === 2) {
        // Con solo 2 giorni: uso soglia 5% per decidere
        const c0 = trend3Cpa[0].cpa, c1 = trend3Cpa[1].cpa;
        const v = ((c1 - c0) / c0) * 100;
        if (v < -5) trendDir = "POSITIVO";
        else if (v > 5) trendDir = "NEGATIVO";
        else trendDir = "STABILE";
      }
      const trendLabel = " TREND_3GG=" + trendDir;

      // Media CPA 3 giorni per fornitore (usata per riallocazione)
      const mediaCpa3gg = trend3Cpa.length > 0
        ? Math.round(trend3Cpa.reduce((s,x)=>s+x.cpa,0) / trend3Cpa.length)
        : null;

      // Miglior CPA del fornitore nel mese (tra tutti i giorni disponibili del mese per questo fornitore)
      const fornitoreCpaStorici = allRecs
        .filter(rec => rec.date && rec.macrofonti)
        .map(rec => {
          const mf = (rec.macrofonti||[]).find(x=>x.name===name);
          return mf && mf.cpa && mf.cpa!=="—" ? { date: rec.date, cpa: parseFloat(mf.cpa) } : null;
        })
        .filter(Boolean);
      const bestCpaFornitore = fornitoreCpaStorici.length>0
        ? fornitoreCpaStorici.reduce((a,b)=>a.cpa<b.cpa?a:b)
        : null;
      const isBestCpaFornitore = cpaGiornoNum!==null && bestCpaFornitore && bestCpaFornitore.date === r.date;

      // ── LOGICA AZIONE ──
      // ── LOGICA AZIONE (nuova regole per posizione in ranking + trend) ──
      // Ranking è già ordinato per CPA mese ASCENDENTE (primi 2 = migliori).
      // i è l'indice (0-based) del fornitore nel ranking.
      //
      // Regole:
      //   Primi 2 (i<2)
      //     + sotto TO BE + trend POSITIVO/STABILE → AUMENTARE_al_TO_BE
      //     + sotto TO BE + trend NEGATIVO          → MONITORARE_STOP_AUMENTO
      //     + a/sopra TO BE                          → MANTENERE
      //   Dal 3° (i>=2)
      //     + sotto TO BE + trend POSITIVO           → SCAPPOTTARE (aumentare progressivo)
      //     + sotto TO BE + trend NEGATIVO           → RIDURRE_CAP (-20% volume)
      //     + sotto TO BE + trend STABILE            → MANTENERE_CAP
      //     + a/sopra TO BE + CPA critico (>100) + trend POSITIVO → MONITORARE_TREND_OK
      //     + a/sopra TO BE + CPA critico + trend NEGATIVO/STABILE → RIDURRE (10/20/30% del volume)
      //     + a/sopra TO BE + CPA ottimale (≤100) → MANTENERE
      const TARGET_CPA = 100;
      const deltaVolNum = deltaVsTobe !== null ? parseFloat(deltaVsTobe) : null;
      const isTopTwo = i < 2;
      const sottoToBe = deltaVolNum !== null && deltaVolNum < 0;
      const leadsGiornoNum = g ? parseInt(g.leads) : 0;
      const tobeVal = tb ? tb : 0;
      let azione;
      let leadsDelta = null; // quantità assoluta di lead da aggiungere (+) o togliere (-)

      if (isTopTwo) {
        if (sottoToBe) {
          if (trendDir === "NEGATIVO") {
            azione = "MONITORARE_STOP_AUMENTO [trend_CPA_in_peggioramento]";
          } else {
            // POSITIVO o STABILE → aumentare al TO BE
            azione = "AUMENTARE_al_TO_BE";
            leadsDelta = Math.max(0, tobeVal - leadsGiornoNum); // gap da colmare
          }
        } else {
          azione = "MANTENERE";
        }
      } else {
        // i >= 2, fornitore non-migliore
        if (sottoToBe) {
          if (trendDir === "POSITIVO") {
            // Scappottare: +20% del gap verso TO BE, max +50 lead/gg
            const gap = Math.max(0, tobeVal - leadsGiornoNum);
            const aumentoLead = Math.min(50, Math.round(gap * 0.20));
            azione = "SCAPPOTTARE [trend_CPA_in_miglioramento]";
            leadsDelta = aumentoLead;
          } else if (trendDir === "NEGATIVO") {
            // Riduci ulteriormente il cap: -20% del volume attuale
            const riduzione = Math.round(leadsGiornoNum * 0.20);
            azione = "RIDURRE_CAP [trend_CPA_in_peggioramento]";
            leadsDelta = -riduzione;
          } else {
            // STABILE: mantieni cap
            azione = "MANTENERE_CAP [trend_stabile]";
          }
        } else {
          // A o sopra TO BE
          if (cpaMeseNum > TARGET_CPA) {
            if (trendDir === "POSITIVO") {
              azione = "MONITORARE_TREND_OK [trend_CPA_in_miglioramento]";
            } else {
              // NEGATIVO o STABILE: riduci in base a CPA
              let percentRiduzione;
              if (cpaMeseNum > 130) percentRiduzione = 30;
              else if (cpaMeseNum > 115) percentRiduzione = 20;
              else percentRiduzione = 10;
              const riduzione = Math.round(leadsGiornoNum * (percentRiduzione / 100));
              azione = "RIDURRE_" + percentRiduzione + "PCT";
              leadsDelta = -riduzione;
            }
          } else {
            // CPA ottimale: mantieni
            azione = "MANTENERE";
          }
        }
      }

      // Segnale giornaliero
      let segnaleGiorno = "";
      if(g && cpaGiornoNum!==null && !isNaN(cpaGiornoNum)) {
        const diff = cpaGiornoNum - cpaMeseNum;
        if(diff<=-10) segnaleGiorno=" ★GIORNO_MOLTO_MEGLIO(CPA_giorno=€" + g.cpa + "_vs_mese=€" + m.cpa + ")";
        else if(diff<=-5) segnaleGiorno=" ↑giorno_migliore(CPA_giorno=€" + g.cpa + "_vs_mese=€" + m.cpa + ")";
      }

      const redMeseAlert = redAlert(name, m.red);
      const mediaLabel = mediaCpa3gg !== null ? " MEDIA_CPA_3GG=€" + mediaCpa3gg : "";
      const bestForLabel = isBestCpaFornitore ? " ★MIGLIOR_CPA_FORNITORE_MESE" : "";
      const deltaLabel = leadsDelta !== null ? " LEADS_DELTA=" + (leadsDelta>=0?"+":"") + leadsDelta : "";
      azioniPerFornitore[name] = { azione, leadsDelta };
      macroRankLines.push(
        "#" + (i+1) + "_" + name +
        ": CPA_mese=€" + m.cpa + " RED_mese=" + m.red + "%[" + redMeseAlert + "] CPL_mese=€" + m.cpl +
        (g ? " | GIORNO: leads=" + g.leads + (deltaVsTobe?" delta="+(parseFloat(deltaVsTobe)>=0?"+":"")+deltaVsTobe+"%_vs_TO_BE":"") + " CPL_giorno=€" + g.cpl + " CPA_giorno=€" + g.cpa + " RED_giorno=" + g.red + "%[" + redAlert(name,g.red) + "]" : "") +
        segnaleGiorno + trendLabel + mediaLabel + bestForLabel + deltaLabel +
        " → AZIONE: " + azione
      );
      // Salvo la media 3gg per il ranking di riallocazione
      if (mediaCpa3gg !== null) {
        macroMeseMap[name]._media3gg = mediaCpa3gg;
      }
    });

    // Trabocchi — aggiunti con stessi dati giornalieri dei fornitori principali
    const traboccoNames = ["TRABOCCO TLC", "TRABOCCO A&R"];
    traboccoNames.forEach(tName => {
      const tMese = (r.macrofontiMese||[]).find(m=>m.name===tName);
      const tGiorno = (r.macrofonti||[]).find(m=>m.name===tName);
      if(!tMese && !tGiorno) return;
      const tb = macroToBe ? macroToBe[tName] : null;
      const deltaT = tGiorno&&tb ? (((tGiorno.leads-tb)/tb)*100).toFixed(1) : null;
      macroRankLines.push(
        "TRABOCCO_" + tName +
        (tMese ? ": CPA_mese=€" + tMese.cpa + " RED_mese=" + tMese.red + "%" : "") +
        (tGiorno ? " | GIORNO: leads=" + tGiorno.leads + (deltaT?" delta="+(parseFloat(deltaT)>=0?"+":"")+deltaT+"%_vs_TO_BE":"") + " CPL_giorno=€" + tGiorno.cpl + " CPA_giorno=€" + tGiorno.cpa + " RED_giorno=" + tGiorno.red + "%[" + redAlert(tName,tGiorno.red) + "]" : "") +
        " → SOLO_MONITORAGGIO (no azioni)"
      );
    });

    // Fascia 9:00 lead medie mensili per calcolo riduzione
    const h9mese = r.hourlyMese?.[9];
    const fascia9Info = h9mese ? "\nFASCIA_9_LEAD_MEDIO_MESE=" + h9mese + "_timing_mese (15% da ridurre = " + Math.round(h9mese*0.15) + " unità su timing)" : "";

    // ── RIALLOCAZIONE ──
    // Regola: quando un fornitore viene ridotto (RIDURRE_XPCT o RIDURRE_CAP), i lead tolti
    // vengono SEMPRE riallocati sui primi 2 del ranking per CPA mese (metà ciascuno).
    // I destinatari sono sempre gli stessi indipendentemente dalla loro azione.
    const destinatari = ranked.slice(0, 2); // primi 2 nomi
    // Per ogni fornitore ridotto, calcolo quanto va a ciascun destinatario
    const fornitoriRidotti = ranked.filter(n => {
      const az = azioniPerFornitore[n]?.azione || "";
      return az.startsWith("RIDURRE"); // RIDURRE_CAP o RIDURRE_XPCT
    });
    // Contributi totali ricevuti da ciascun destinatario: { nomeDest: [ {from, amount}, ...] }
    const contributiPerDestinatario = {};
    destinatari.forEach(d => { contributiPerDestinatario[d] = []; });
    fornitoriRidotti.forEach(nRid => {
      const leadsTolti = Math.abs(azioniPerFornitore[nRid].leadsDelta || 0);
      if (leadsTolti <= 0 || destinatari.length === 0) return;
      const perDest = Math.round(leadsTolti / destinatari.length);
      destinatari.forEach(d => {
        contributiPerDestinatario[d].push({ from: nRid, amount: perDest });
      });
    });
    // Stringa riepilogativa per il prompt AI
    const riallocLines = ["\nRIALLOCAZIONE (destinatari: primi 2 ranking CPA mese):"];
    if (destinatari.length === 0) {
      riallocLines.push("  nessun destinatario disponibile");
    } else {
      destinatari.forEach(d => {
        const contrib = contributiPerDestinatario[d];
        if (contrib.length === 0) {
          riallocLines.push("  " + d + ": 0 lead riallocati (nessun fornitore ridotto oggi)");
        } else {
          const totale = contrib.reduce((s, x) => s + x.amount, 0);
          const dettaglio = contrib.map(x => x.amount + " da " + x.from).join(" + ");
          riallocLines.push("  " + d + ": riceve " + dettaglio + " = totale +" + totale + " lead/gg riallocati");
        }
      });
    }
    const riallocLine = riallocLines.join("\n");

    return [...kpi, "", ...fasceLines, "", "FASCE_FUORI_RANGE_ELENCO:", ...hourlyLines, "", ...patternLines, "", ...macroRankLines, fascia9Info + riallocLine].join("\n");
  };

  const generate = async () => {
    setLoading(true);
    const datiKpi = buildCtx();
    const textPrompt = `Sei l'assistente AI del Direttore Marketing di ComparaSemplice.it.
I dati sono GIA' CLASSIFICATI dal codice. Usa i valori forniti senza rielaborare. Output: plain text, no markdown, no titoli sezione. MAI "oggi" — usa "ieri" o la data.

SEZIONE 1 — scrivi queste righe nell'ordine con i valori dai dati:
CS Energia
[DATA]/2026
LEAD GENERATE: [LEAD] su [LEAD_TO_BE] TO BE ([delta]%)
LEAD DA GENERARE EFFETTIVE: [LEAD_EFFETTIVE] — trascrivi ESATTAMENTE la riga LEAD_EFFETTIVE dai DATI
ORE: [ORE] — trascrivi ESATTAMENTE la riga ORE dai DATI incluso il confronto con le ore dichiarate e il delta
LAV/ORA: [lavOra] ([lavOraMese] media mese) [delta]
RED: [red]% ([redMese]% media mese) [delta]
RESA: [resa] ([resaMese] media mese) [delta]
% CTC: [ctc]% di cui Trabocco TLC [trabocco]% ([ctcMese]% media mese) [delta]
Timing 1-5 min (netto CTC): [timing]% ([timingMese]% media mese) [delta]
Contattab (netto CTC): [contattab]% ([contattabMese]% media mese) [delta]
CPL: [cpl]€ ([cplMese]€ media mese) [delta]
CPA: [cpa]€ ([cpaMese]€ media mese) [delta]
REGOLA TASSATIVA — SE nei DATI trovi una riga che inizia ESATTAMENTE con "★ MIGLIOR_CPA_MESE: SÌ" DEVI aggiungere subito dopo la riga CPA una riga nuova con scritto "★ Miglior CPA del mese". Non omettere mai questa riga se la riga "★ MIGLIOR_CPA_MESE: SÌ" è presente nei dati. Non rielaborare, copia testualmente.

SEZIONE 2 — TIMING:
Intestazione fissa: — TIMING 1-5 MIN — FASCE FUORI RANGE —
Elenca righe da FASCE_FUORI_RANGE_ELENCO.
Sintesi: usa ESATTAMENTE FASCE_TIMING dal codice:
- NON_ALIMENTATA → "fascia/fasce X → operatori non alimentati"
- OVER_GENERAZIONE → "fascia/fasce X → over-generazione"
- CAUSA_SALA → "fasce X Y → timing basso anche se generazione sotto TO BE (cause non imputabili alla generazione leads)"
Ometti gruppi con "nessuna". Separa con punto e virgola.
Pattern mese: se in PATTERN_MESE c'è "nessuna fascia strutturalmente fuori range nel mese" → NON scrivere alcuna riga Pattern mese (ometti). Altrimenti scrivi una singola riga combinando gli elementi così:
- Se c'è OVER_GENERAZIONE_CRONICA → "fasce [elenco] in over-generazione (ridurre)"
- Se c'è UNDER_GENERAZIONE_CRONICA → "fasce [elenco] in under-generazione (aumentare)"
- Unisci le due parti con punto e virgola se entrambe presenti
- Prefisso fisso: "Pattern mese: "
Esempi:
  "Pattern mese: fasce 9:00 (75%), 10:00 (83%) in over-generazione (ridurre)."
  "Pattern mese: fasce 12:00 (99%), 17:00 (98%) in under-generazione (aumentare)."
  "Pattern mese: fasce 9:00 (75%) in over-generazione (ridurre); fasce 12:00 (99%) in under-generazione (aumentare)."

SEZIONE 3 — MACROFORNITORI:
Intestazione fissa: — MACROFORNITORI —
Mostra i fornitori in QUESTO ORDINE FISSO: GALANO GOOGLE CTC, GALANO GOOGLE CALDE, SPINUP SOCIAL, GALANO SOCIAL, PAOLO SOCIAL, TRABOCCO TLC, TRABOCCO A&R.
Per ogni fornitore in MACROFORNITORI_RANKING e per ogni TRABOCCO_: usa SOLO dati GIORNO per leads/delta/CPL/RED/CPA. Solo dati e alert, no azioni.
Formato: [NOME]: [leads_giorno] lead ([delta_vs_TO_BE] vs TO BE) · CPL €[CPL_GIORNO] · RED ieri [X]% [alert_RED] · CPA ieri €X [alert_CPA]

ATTENZIONE: usa SEMPRE il campo CPL_giorno=€X (NON CPL_mese=€X) per il valore CPL in questa sezione. Stesso per RED_giorno e CPA_giorno.

ALERT CPA (aggiungere dopo €X del CPA giorno):
- se CPA giorno ≤ €100 → aggiungi "(CPA ottimale)"
- se CPA giorno tra €101 e €115 → aggiungi "(CPA in zona accettabile)"
- se CPA giorno > €115 → aggiungi "(CPA sopra target, critico)"
- se CPA giorno = 0 o "—" → NON aggiungere nulla

Per i TRABOCCO_: includi stessi dati ma aggiungi "(monitoraggio)" alla fine. NO ETC.
IMPORTANTE: NON aggiungere mai "Trabocco TLC da monitorare" come nota ai fornitori principali.

SEZIONE 4 — AZIONI CORRETTIVE:
Intestazione fissa: Azioni correttive

REGOLA FONDAMENTALE:
- Scrivi un paragrafo SOLO per i fornitori principali (NON TRABOCCO, NON ETC) il cui tag AZIONE nei DATI inizia con: RIDURRE, AUMENTARE, MONITORARE, SCAPPOTTARE, MANTENERE_CAP.
- Se il tag AZIONE è "MANTENERE" (senza altro): NON scrivere nulla per quel fornitore, saltalo completamente.
- Mai scrivere paragrafi per TRABOCCO_ o ETC.

PARAGRAFI PER TAG (usa ESATTAMENTE questi testi, non inventare):

TAG=AUMENTARE_al_TO_BE:
Caso base (nessun lead riallocato dagli altri): "[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: [DIREZIONE_LEGGIBILE], media €[MEDIA_CPA_3GG]. Azione: portare la generazione al TO BE (+[LEADS_DELTA] lead/gg)."
Caso con riallocazione ricevuta (vedi RIALLOCAZIONE nei dati, riga di questo fornitore): "[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: [DIREZIONE_LEGGIBILE], media €[MEDIA_CPA_3GG]. Azione: portare la generazione al TO BE (+[LEADS_DELTA] lead/gg) + [dettaglio riallocazione, es. '27 lead da GALANO SOCIAL + 15 lead da PAOLO SOCIAL'] = totale +[LEADS_DELTA + totale_riallocati] lead/gg."

TAG=MONITORARE_STOP_AUMENTO [trend_CPA_in_peggioramento]:
"[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: in peggioramento, media €[MEDIA_CPA_3GG]. Azione: fermare l'aumento di volume, ottimizzare le campagne e monitorare."

TAG=SCAPPOTTARE [trend_CPA_in_miglioramento]:
Caso base: "[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: in miglioramento, media €[MEDIA_CPA_3GG]. Volume ridotto [delta_vol] vs TO BE (cappato dal marketing). Azione: aumentare progressivamente il volume (+[LEADS_DELTA] lead/gg) dato il trend positivo."
Nota: SCAPPOTTARE NON riceve riallocazione (i destinatari sono solo i primi 2 del ranking).

TAG=RIDURRE_CAP [trend_CPA_in_peggioramento]:
Calcola la distribuzione riallocata: [LEADS_DELTA_ABS] lead totali divisi per 2 destinatari = metà ciascuno.
"[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: in peggioramento, media €[MEDIA_CPA_3GG]. Volume ridotto [delta_vol] vs TO BE (cappato dal marketing). Azione: ridurre ulteriormente il volume di circa [LEADS_DELTA_ABS] lead/gg (-20% attuale) dato il trend negativo. Riallocare [metà] lead su [TOP1_RIALLOC] e [metà] lead su [TOP2_RIALLOC]."

TAG=MANTENERE_CAP [trend_stabile]:
"[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: stabile, media €[MEDIA_CPA_3GG]. Volume ridotto [delta_vol] vs TO BE (cappato dal marketing). Azione: mantenere il cap attuale, monitorare."

TAG=MONITORARE_TREND_OK [trend_CPA_in_miglioramento]:
"[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: in miglioramento, media €[MEDIA_CPA_3GG]. Azione: non ridurre, il trend CPA è in miglioramento. Monitorare."

TAG=RIDURRE_XPCT (dove X=10, 20 o 30):
Calcola la distribuzione riallocata: [LEADS_DELTA_ABS] lead totali divisi per 2 destinatari = metà ciascuno.
"[NOME]: ieri ha registrato [DICHIARAZIONE_CPA]. Trend CPA ultimi 3 giorni: [DIREZIONE_LEGGIBILE], media €[MEDIA_CPA_3GG]. Azione: ridurre il volume di circa [LEADS_DELTA_ABS] lead/gg (-[X]%). Riallocare [metà] lead su [TOP1_RIALLOC] e [metà] lead su [TOP2_RIALLOC]."

REGOLE DI COMPILAZIONE:

DICHIARAZIONE_CPA (si applica a tutti i paragrafi):
- Se il fornitore ha tag ★MIGLIOR_CPA_FORNITORE_MESE nei dati → "il CPA migliore del mese (CPA giorno €[X] vs CPA mese €[Y])"
- Altrimenti se CPA giorno > €115 → "un CPA di €[X] sopra target del [delta]% (critico)" dove delta = round(((CPA_giorno - 100) / 100) * 100). Es: CPA=122 → "sopra target del 22%". Usa SEMPRE target fisso €100, mai altri riferimenti.
- Altrimenti se CPA giorno tra €101 e €115 → "un CPA di €[X] in zona accettabile"
- Altrimenti CPA giorno ≤ €100 → "un CPA di €[X] ottimale"

DIREZIONE_LEGGIBILE da TREND_3GG:
- POSITIVO → "in miglioramento"
- NEGATIVO → "in peggioramento"
- STABILE → "stabile"

MEDIA_CPA_3GG: leggi MEDIA_CPA_3GG=€X dalla riga fornitore nei DATI.

LEADS_DELTA: leggi LEADS_DELTA=±X dalla riga fornitore nei DATI. È il numero di lead/gg da aggiungere (se positivo, per AUMENTARE e SCAPPOTTARE) o togliere (se negativo).
LEADS_DELTA_ABS: stesso valore ma senza segno (per testi "ridurre di X"). Es: se LEADS_DELTA=-54, allora LEADS_DELTA_ABS=54.

delta_vol: leggi dal campo "delta=[X]%_vs_TO_BE" nella riga fornitore nei DATI GIORNO. Es: delta=-35.2%_vs_TO_BE → scrivi "-35,2%".

TOP1_RIALLOC e TOP2_RIALLOC: leggi i nomi dei fornitori destinatari dal blocco RIALLOCAZIONE nei DATI (sono sempre i primi 2 del ranking CPA mese). Usa i 2 nomi. Se ce n'è solo 1 nel blocco, usa solo quello.

Per i paragrafi AUMENTARE_al_TO_BE o SCAPPOTTARE che ricevono lead riallocati: nel blocco RIALLOCAZIONE trovi riga "NOME_FORNITORE: riceve X da FORN_A + Y da FORN_B = totale +Z lead/gg riallocati". Usa questi valori per compilare il caso "con riallocazione ricevuta" del paragrafo AUMENTARE_al_TO_BE, SOLO se il totale riallocato >0. Se il totale è 0, usa il caso base senza riallocazione.

REGOLE AGGIUNTIVE:
- NON inventare motivi non presenti nei tag. Usa SOLO le formulazioni fornite sopra.
- NON scrivere "media sotto target" o frasi non presenti nelle regole.
- Il Pattern mese è GIÀ gestito nella Sezione 2 (Timing) — NON duplicarlo dopo le azioni correttive.
- NON aggiungere frasi esterne tipo "Ecco l'analisi", "Riepilogo", ecc.

DATI:
${datiKpi}
${sintesiScreens.length > 0 ? "\nHai accesso a screenshot: usali per correggere discrepanze." : ""}`;
    const imgContent = buildImageContent();
    const msgContent = imgContent.length > 0
      ? [...imgContent, { type: "text", text: textPrompt }]
      : textPrompt;
    try {
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-7", max_tokens: 2500, messages: [{ role: "user", content: msgContent }] }),
      });
      const data = await res.json();
      const sintesi = data.content?.[0]?.text?.trim() || "";
      if (sintesi) { onSave(sintesi); setMsg(""); }
      else setMsg("⚠️ Nessuna risposta. Riprova.");
    } catch (e) { setMsg("⚠️ Errore di connessione."); }
    setLoading(false);
  };

    const sendChat = async (text) => {
    if (!text.trim() || chatLoading) return;
    const imgContent = buildImageContent();
    const userContent = imgContent.length > 0
      ? [...imgContent, { type: "text", text: text.trim() }]
      : text.trim();
    const userMsg = { role: "user", content: userContent };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs); setChatInput(""); setChatLoading(true);
    try {
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 800,
          system: systemPrompt(),
          messages: newMsgs,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text?.trim() || "Errore nella risposta.";
      setChatMsgs([...newMsgs, { role: "assistant", content: reply }]);
      if (reply.startsWith("[SINTESI_AGGIORNATA]")) {
        const updated = reply.replace("[SINTESI_AGGIORNATA]", "").trim();
        onSave(updated);
      }
    } catch (e) {
      setChatMsgs([...newMsgs, { role: "assistant", content: "Errore di connessione." }]);
    }
    setChatLoading(false);
  };

  const displayReply = (text) => text.startsWith("[SINTESI_AGGIORNATA]")
    ? "✅ Sintesi aggiornata:\n\n" + text.replace("[SINTESI_AGGIORNATA]", "").trim()
    : text;

  return (
    <div onPaste={handleSintesiPaste} style={{ background: CARD2, border: "2px solid " + P + "66", borderRadius: "12px", overflow: "hidden", marginTop: "20px", marginBottom: "8px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg," + P + "44,#1a1540)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ color: "#c4b8ff", fontWeight: "bold", fontSize: "13px", fontFamily: FF }}>📋 Sintesi Operativa</div>
          {r.date && <div style={{ color: MU, fontSize: "11px", fontFamily: FF, marginTop: "2px" }}>{r.date}</div>}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {!r.sintesi && (
            <button onClick={generate} disabled={loading} style={{ background: loading ? P+"55" : P, border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: loading ? "default" : "pointer" }}>
              {loading ? "⏳ Generando…" : "🤖 Genera Sintesi AI"}
            </button>
          )}
          {r.sintesi && (
            <button onClick={generate} disabled={loading} style={{ background: "transparent", border: "1px solid " + P, borderRadius: "8px", padding: "9px 14px", fontSize: "12px", fontFamily: FF, color: "#c4b8ff", cursor: loading ? "default" : "pointer" }}>
              {loading ? "⏳" : "↺ Rigenera"}
            </button>
          )}
          <button onClick={() => setChatOpen(o => !o)} style={{ background: chatOpen ? P : P+"33", border: "1px solid " + P, borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: chatOpen ? "#fff" : "#c4b8ff", cursor: "pointer" }}>
            {chatOpen ? "✕ Chiudi chat" : "💬 Chat AI"}
          </button>
          {msg && <span style={{ fontSize: "12px", color: "#f5a623", fontFamily: FF }}>{msg}</span>}
        </div>
      </div>

      {/* Thumbnail strip */}
      {sintesiScreens.length > 0 && (
        <div style={{ padding: "10px 22px", background: P+"0f", borderBottom: "1px solid " + P+"22", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: MU, fontFamily: FF, marginRight: "4px" }}>📎 Screen allegati:</span>
          {sintesiScreens.map((s, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={"data:" + s.mediaType + ";base64," + s.base64} alt={s.name}
                style={{ height: "44px", borderRadius: "5px", border: "1px solid " + P+"44", objectFit: "cover" }} />
              <button onClick={() => setSintesiScreens(prev => prev.filter((_,j) => j !== i))}
                style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ff5c5c", border: "none", borderRadius: "50%", width: "16px", height: "16px", fontSize: "9px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>✕</button>
            </div>
          ))}
          <span style={{ fontSize: "11px", color: "#c4b8ff", fontFamily: FF, fontStyle: "italic" }}>
            {r.sintesi ? "Usati nella prossima rigenerazione o chat" : "Usati nella generazione"}
          </span>
        </div>
      )}

      {/* Sintesi testo */}
      {r.sintesi ? (
        <div style={{ padding: "18px 22px", borderBottom: chatOpen ? "1px solid " + P + "33" : "none" }}>
          {r.sintesi.split("\n").map((line, i) => (
            <div key={i} style={{ color: line === "" ? "transparent" : TX, fontSize: "13px", fontFamily: FF, lineHeight: "1.7", marginBottom: line === "" ? "6px" : "0" }}>
              {line || "\u00a0"}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "16px 22px", color: MU, fontSize: "13px", fontFamily: FF, fontStyle: "italic" }}>
          Nessuna sintesi disponibile — clicca "Genera Sintesi AI" per crearla.
        </div>
      )}

      {/* Chat di revisione */}
      {chatOpen && (
        <div>
          {/* Messaggi */}
          {chatMsgs.length > 0 && (
            <div style={{ padding: "16px 22px", maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {chatMsgs.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: m.role === "user" ? O : P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>
                    {m.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div style={{ background: m.role === "user" ? O+"22" : P+"22", border: "1px solid " + (m.role === "user" ? O+"33" : P+"33"), borderRadius: "10px", padding: "10px 14px", maxWidth: "82%", fontSize: "13px", fontFamily: FF, color: TX, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {m.role === "assistant" ? displayReply(m.content) : m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>🤖</div>
                  <div style={{ background: P+"22", border: "1px solid " + P+"33", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", fontFamily: FF, color: MU }}>Sto rielaborando…</div>
                </div>
              )}
            </div>
          )}
          {chatMsgs.length === 0 && (
            <div style={{ padding: "14px 22px 6px" }}>
              <div style={{ fontSize: "11px", color: MU, fontFamily: FF, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                {r.sintesi ? "Suggerimenti rapidi" : "Linee guida per la generazione"}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(r.sintesi ? [
                  "Aggiungi un commento sul GOOGLE CTC",
                  "Rimuovi il dettaglio sui trabocchi",
                  "Rendi il tono più sintetico",
                  "Aggiungi il dato sulla contattabilità",
                ] : [
                  "Focalizzati su timing e fasce critiche",
                  "Sii più sintetico, max 5 righe",
                  "Metti in evidenza i fornitori con CPA fuori target",
                  "Includi le azioni correttive concrete",
                ]).map((q, i) => (
                  <button key={i} onClick={() => { if (!r.sintesi) { setChatInput(q); } else { sendChat(q); } }}
                    style={{ background: P+"18", border: "1px solid " + P+"44", borderRadius: "7px", padding: "8px 12px", color: "#c4b8ff", fontSize: "12px", fontFamily: FF, cursor: "pointer" }}>
                    {r.sintesi ? q : "📌 " + q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Input */}
          <div style={{ padding: "12px 22px 16px", borderTop: "1px solid " + P+"22" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              {chatMsgs.length > 0 && (
                <button onClick={() => setChatMsgs([])} style={{ background: "transparent", border: "1px solid " + BD, borderRadius: "7px", color: MU, padding: "9px 10px", fontSize: "12px", fontFamily: FF, cursor: "pointer", flexShrink: 0, alignSelf: "flex-end" }} title="Reset chat">↺</button>
              )}
              <textarea
                style={{ flex: 1, background: "#0d0b1e", border: "1px solid " + P+"44", borderRadius: "7px", color: TX, padding: "10px 13px", fontFamily: FF, fontSize: "13px", outline: "none", boxSizing: "border-box", resize: "none", minHeight: "80px", lineHeight: "1.5" }}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && chatInput.trim() && !chatLoading) { e.preventDefault(); sendChat(chatInput); } }}
                placeholder={"Es. aggiungi un commento su GOOGLE CTC, rimuovi il trabocco TIM… (Invio per inviare, Shift+Invio per andare a capo)"}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                <label title="Allega screenshot (o Ctrl+V)" style={{ cursor: "pointer" }}>
                  <div style={{ background: sintesiScreens.length > 0 ? P : P+"22", border: "1px solid " + P+"55", borderRadius: "7px", padding: "9px 11px", fontSize: "15px", lineHeight: 1, textAlign: "center" }}>📎{sintesiScreens.length > 0 ? " "+sintesiScreens.length : ""}</div>
                  <input type="file" accept="image/*" multiple onChange={e => loadScreens(e.target.files)} style={{ display: "none" }} />
                </label>
                <button onClick={() => sendChat(chatInput)} disabled={!chatInput.trim() || chatLoading}
                  style={{ background: chatInput.trim() && !chatLoading ? P : P+"55", border: "none", borderRadius: "7px", color: "#fff", padding: "10px 14px", fontSize: "13px", fontFamily: FF, cursor: chatInput.trim() && !chatLoading ? "pointer" : "default", fontWeight: "bold" }}>
                  Invia →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickInsert({ onSaved, onExtracted }) {
  const [screens, setScreens] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [msg, setMsg] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const buildChatContext = () => {
    if (!extracted) return "";
    const fields = [
      ["DATA", extracted.date], ["LEAD GENERATE", extracted.leadGen], ["LEAD TO BE", extracted.leadToBe],
      ["ORE effettive", extracted.ore], ["ORE dichiarate", extracted.oreDich], ["LAV/ORA", extracted.lavOra],
      ["RED %", extracted.red], ["RESA", extracted.resa], ["CTC %", extracted.ctc],
      ["TIMING %", extracted.timing], ["CONTATTAB %", extracted.contattab],
      ["CPL €", extracted.cpl], ["CPA €", extracted.cpa],
      ["CPL mese €", extracted.cplMese], ["CPA mese €", extracted.cpaMese],
      ["RED mese %", extracted.redMese], ["TIMING mese %", extracted.timingMese],
      ["CONTATTAB mese %", extracted.contattabMese],
    ];
    const filled = fields.filter(([,v]) => v != null && v !== "").map(([k,v]) => k+": "+v).join(" | ");
    const empty = fields.filter(([,v]) => v == null || v === "").map(([k]) => k).join(", ");
    const macro = extracted.macrofonti?.length ? extracted.macrofonti.map(m => m.name+" leads="+m.leads+" RED="+m.red+"% CPL="+m.cpl+"€ CPA="+m.cpa+"€").join(" | ") : "nessuno";
    return "DATI ESTRATTI:\n"+filled+"\nCAMPI VUOTI: "+(empty||"nessuno")+"\nMACROFORNITORI: "+macro;
  };

  const CHAT_SYSTEM = `Sei l'assistente AI del tracker CS Energia di ComparaSemplice.it. Hai due compiti:
1. CORREGGERE i campi estratti: se l'utente dice "il timing è 89" o "contattab mese è 70,5", rispondi con un JSON di aggiornamento nel formato [AGGIORNA]{"campo":"valore"}[/AGGIORNA] seguito da una breve conferma in italiano. I nomi dei campi sono: date, leadGen, leadToBe, ore, oreDich, lavOra, red, resa, ctc, timing, contattab, cpl, cpa, cplMese, cpaMese, redMese, timingMese, contattabMese, pressione, durMedia.
2. SPIEGARE perché un campo è vuoto e da quale screen/dashboard recuperarlo. Regole fonti:
- leadGen, red, cpl, cpa, macrofonti → Economics Recap CPL Operations, filtro giorno singolo, riga Total
- ctc → Economics Recap CPL, tabella Macro Fonte, riga GOOGLE CLICK, colonna % lead sul totale
- ore → Pianificazione Leads Ore, pagina Ore Leads per Area, riga Totale, colonna del giorno
- lavOra → Pianificazione Leads Ore, pagina Leads/ora e PDA, riga Totale, colonna del giorno
- resa → Resa per Area, Resa Net con Cross, riga Totale, colonna del giorno
- timing, pressione, durMedia → Dashboard Marketing Tabella riassuntiva, cluster_progetti=Tutte, giorno singolo
- contattab → Dashboard Marketing Tabella riassuntiva, cluster_progetti=Selezioni multiple (screen con Leads Gen più basso), riga Totale colonna Contattab
- timingMese → Dashboard Marketing, cluster_progetti=Tutte, periodo mese
- contattabMese → Dashboard Marketing, cluster_progetti=Selezioni multiple, periodo mese
- cplMese, cpaMese, redMese → Economics Recap CPL, filtro periodo mese
Rispondi sempre in italiano, in modo conciso e operativo.`;

  const sendChat = async (text) => {
    if (!text.trim() || chatLoading) return;
    const userMsg = { role: "user", content: text.trim() };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: CHAT_SYSTEM + "\n\nSTATO ATTUALE CAMPI:\n" + buildChatContext(),
          messages: newMsgs,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text?.trim() || "Errore nella risposta.";
      setChatMsgs([...newMsgs, { role: "assistant", content: reply }]);
      const match = reply.match(/\[AGGIORNA\]([\s\S]*?)\[\/AGGIORNA\]/);
      if (match) {
        try {
          const updates = JSON.parse(match[1].trim());
          setExtracted(prev => ({ ...prev, ...updates }));
        } catch(e) {}
      }
    } catch(e) {
      setChatMsgs([...newMsgs, { role: "assistant", content: "Errore di connessione." }]);
    }
    setChatLoading(false);
  };

  const loadScreens = (files) => {
    Promise.all(Array.from(files).map(f => resizeImage(f)))
      .then(imgs => setScreens(prev => [...prev, ...imgs]));
  };

  const extract = async () => {
    if (!screens.length) return;
    setExtracting(true); setMsg("Sto analizzando gli screen...");
    try {
      const imgContent = screens.map(s => ({ type: "image", source: { type: "base64", media_type: s.mime, data: s.b64 } }));
      imgContent.push({ type: "text", text: `Estrai i KPI di ComparaSemplice.it (CS Energia) dagli screenshot Power BI.

══════ FORMATO NUMERI ══════
Power BI usa il PUNTO come separatore decimale. "€ 11.3" = 11,3 euro (NON 113). "20.3%" = 20,3% (NON 203). Restituisci SEMPRE con la virgola: "11,3", "20,3".
Range plausibili (valori fuori range = errore di lettura):
  CPL 2-30 · CPA 30-400 · RED 5-50% · CTC 10-40% · contattab/timing 0-100% · resa 0,2-0,8 · lavOra 1,5-4 · ore giorno 200-1500 · leadGen giorno 500-5000

══════ SCREEN PER TIPO ══════

TIPO 1 — Economics "Recap CPL Operations"
Contiene tabella "Macro Fonte" (4 righe: SOCIAL, GOOGLE LEADS, GOOGLE CLICK, ETC) e tabella "Macro Fornitore" (7-8 righe fornitori).
CRITICO: estrai SOLO dalla tabella "Macro Fornitore" riga "Total" (quella in basso, non il grafico laterale "Generazione Macro Fonte %"). "GOOGLE CLICK" è una riga di "Macro Fonte" da cui si prende ctc.
Distingui giorno/mese dal filtro Date in alto:
- Date UGUALI (es. "4/15/2026 → 4/15/2026") = GIORNO → usa per: leadGen (riga Total colonna Leads), red, cpl, cpa (colonna "CPA Totale New"), ctc (GOOGLE CLICK % lead sul totale), trabocco (TRABOCCO TLC % lead sul totale), macrofonti
- Date DIVERSE (es. "4/1/2026 → 4/15/2026") = MESE → usa per: redMese, cplMese, cpaMese, ctcMese, macrofontiMese

ESTRAZIONE MACROFONTI (giorno) e MACROFONTI_MESE: per OGNI fornitore nella tabella Macro Fornitore estrai:
- name: nome esatto del fornitore (es. "GALANO GOOGLE CALDE", "TRABOCCO A&R")
- leads: colonna "Leads" (intero)
- pct: colonna "% lead sul totale" (es. "31,39")
- cpl: colonna "CPL" (es. "14,5"). Se la cella è vuota/bianca, usa "—" (trattino)
- cpa: colonna "CPA Totale New" (es. "76", "130"). Questa colonna è SEMPRE presente per ogni riga, ANCHE se CPL è vuoto. Esempio TRABOCCO A&R: CPL vuoto, CPA Totale New = 73 → cpa = "73" (NON 0, NON "—")
- red: colonna "RED" (es. "27,0")
REGOLA CRITICA: MAI mettere "0" per una cella che sembra vuota. Se la cella è davvero vuota usa "—". Se il valore è leggibile (es. €73) usa quello. CPA Totale New è quasi sempre valorizzato anche quando altre colonne (CPL, CPA Adv) sono vuote.

TIPO 2 — Dashboard Marketing "Tabella riassuntiva Drive" (KPI per data)
Tabella con ore (0-23) sulle righe, colonne: Leads Gen, %Utilizzo, Leads Utilizzate, Vendite, Red, Pressione, Contattab, Tentativo in 5min, Durata Media Chiamata.
IMPORTANTE: identifica la variante guardando il filtro "cluster_progetti" (seconda riga filtri, al centro):
- Se "cluster_progetti = Tutte" → variante TUTTE
- Se "cluster_progetti = Selezioni multiple" → variante SELEZIONI MULTIPLE (quella con Leads Gen più basso perché esclude cluster CTC)
NON usare il filtro "lead_type" (prima riga a sinistra) per distinguere, mostra sempre "Selezioni multiple" in entrambe.

Distingui GIORNO da MESE dal filtro Date in alto:
- Date UGUALI (es. "15/04/2026 - 15/04/2026") = GIORNO
- Date DIVERSE (es. "01/04/2026 - 15/04/2026") = MESE

Mappatura riga Totale (ultima riga in basso della tabella KPI per data):
- GIORNO + TUTTE → timing (col. Tentativo in 5min), pressione (col. Pressione), durMedia (col. Durata Media)
- GIORNO + SELEZIONI MULTIPLE → contattab (col. Contattab)
- MESE + TUTTE → timingMese (col. Tentativo in 5min)
- MESE + SELEZIONI MULTIPLE → contattabMese (col. Contattab)

Esempio reale giorno TUTTE (15/04): riga Totale = Leads Gen 2265, Pressione 2,09, Contattab 71,0%, Tent. 5min 90%, Durata Media 8,97 → timing = 90, pressione = 2,09, durMedia = 8,97
Esempio reale giorno SELEZIONI MULTIPLE (15/04): riga Totale = Leads Gen 1672, Pressione 2,30, Contattab 60,8%, Tent. 5min 90% → contattab = 60,8 (MAI prendere pressione=2,30 da qui, sbagliato!)
Esempio reale mese TUTTE (01-15/04): riga Totale = Leads Gen 25208, Pressione 3,00, Contattab 72,4%, Tent. 5min 88% → timingMese = 88
Esempio reale mese SELEZIONI MULTIPLE (01-15/04): riga Totale = Leads Gen 18782, Pressione 3,37, Contattab 62,9%, Tent. 5min 88% → contattabMese = 62,9

CRITICO: "Tent. 5min" e "Contattab" sono DUE COLONNE DIVERSE. "Tent. 5min" tipicamente 85-100. "Contattab" tipicamente 50-80. Non scambiarle.
CRITICO: il "Leads Gen" della tabella KPI per data (es. 1672, 2265, 18782) è DIVERSO dal "leadGen" del record (quello va estratto dalla tabella Macro Fornitore di Economics TIPO 1). Non confonderli.

TIPO 3 — Pianificazione "Ore per Area/Team" (con colonne giornaliere)
Tabella con righe: Sardegna, Novara-Roma, Esterni, Totale. Colonne: 01/04, 02/04, ... 15/04, Totale (ultima colonna).
CRITICO: la colonna "Totale" (ultima) è la SOMMA del periodo. Il valore GIORNALIERO è nella colonna del giorno specifico.
- ore (giornaliero) → riga Totale, colonna del giorno (es. "15/04/2026"). NON colonna "Totale".
- Esempio reale: se vedi "Totale ... 946,5 938,5 968,0 10244,5" dove l'ultima prima di "10244,5" è 15/04, allora ore = 968,0.

TIPO 4 — Pianificazione "Leads/Ora per Area/Team"
Stessa struttura tipo 3 ma per Leads/Ora.
- lavOra (giornaliero) → riga Totale, colonna del giorno (es. "15/04/2026"). Valore tipico 2-3.
- lavOraMese → riga Totale, colonna "Totale" (ultima colonna).
Esempio reale: "Totale 2,3 2,5 2,4 3,0 2,5 2,5 2,5 2,3 2,4 2,6 2,4 2,3 2,5" dove il penultimo è 15/04=2,3 e l'ultimo è "Totale"=2,5. lavOra=2,3, lavOraMese=2,5.

TIPO 5 — Pianificazione "Resa per Area" (Resa Net con Cross)
Tabella con righe: Esterni, Novara-Roma, Sardegna, Totale. Colonne per ciascun giorno + Totale finale.
- resa (giornaliero) → riga Totale (Resa Net con Cross), colonna del giorno (es. "15/04/2026"). Formato "0,48".
- resaMese → riga Totale (Resa Net con Cross), colonna "Totale" (ultima). Formato "0,42".
NOTA: ci sono 2 tabelle (Resa Net No Cross e Resa Net con Cross). Usa SEMPRE "Resa Net con Cross" (quella in basso).

══════ TABELLA ORARIA (campo "hourly") ══════
Dallo screen TIPO 2 GIORNO variante TUTTE (es. timing1504.png, il giornaliero con Leads Gen più alto), estrai anche la TABELLA ORA-PER-ORA come array di oggetti nel campo "hourly".
Ogni riga della tabella rappresenta un'ora (colonna "Ora di creazione lead": 0, 7, 8, 9... 23). Per ogni riga crea un oggetto con:
{"ora": <int>, "leads": <int Leads Gen>, "leadsU": <int Leads Utilizzate o null>, "vend": <int Vendite o null>, "red": "<stringa Red % es. '16,1'>", "press": "<stringa Pressione es. '2,32'>", "cont": "<stringa Contattab % es. '75,0'>", "timing": <int Tent. 5min senza % o null>, "dur": "<stringa Durata Media es. '8,03'>"}
Includi SOLO le ore con Leads Gen > 0 (ignora righe vuote). NON includere la riga Totale.
Esempio reale dal timing1504.png (15/04, variante Tutte):
[{"ora":0,"leads":5,"leadsU":null,"vend":null,"red":null,"press":"3,00","cont":"50,0","timing":null,"dur":"0,15"},{"ora":9,"leads":113,"leadsU":60,"vend":10,"red":"8,8","press":"2,32","cont":"75,0","timing":73,"dur":"8,03"},...]
Se non hai screen TIPO 2 GIORNO variante TUTTE, metti hourly = [] (array vuoto).

══════ TABELLA ORARIA MESE (campo "hourlyMese") — OBBLIGATORIO SE SCREEN DISPONIBILE ══════
È una delle 9 categorie di screen più comuni: riconoscilo dalla struttura.
Caratteristiche:
- Filtro Date con DUE DATE DIVERSE (es. "01/04/2026 - 15/04/2026")
- Filtro "cluster_progetti = Tutte"
- Tabella "KPI per data" con righe (ore 0-23) e colonne (Leads Gen, %Utilizzo, Leads Utilizzate, Vendite, Red, Pressione, Contattab, Tentativo in 5min, Durata Media)
- Riga Totale in basso con Leads Gen alto (es. 25208, 30000+)

Se trovi questo screen, ESTRAI OBBLIGATORIAMENTE il campo "hourlyMese" come oggetto {ora_int: percentuale_tent5min_int}:
- Chiave: ora come stringa ("9", "10", ...)
- Valore: percentuale Tent. 5min per quell'ora, arrotondata a intero (senza %)
- Includi solo fasce 9-20. NON includere ora 0,1,2,3,4,5,6,7,8,21,22,23 e NON la riga Totale.

Esempio reale dal timing1_1504.png (01-15/04, cluster=Tutte, Leads Gen Totale 25208):
{"9":75,"10":86,"11":91,"12":93,"13":92,"14":96,"15":91,"16":92,"17":90,"18":89,"19":88,"20":67}

CRITICO: hourlyMese NON è lo stesso di hourly. hourly è l'array di OGGETTI per il GIORNO (da screen date uguali). hourlyMese è un oggetto {ora: valore} per il MESE (da screen date diverse). Se hai entrambi i tipi di screen, estrai ENTRAMBI i campi.

Se NON hai screen TIPO 2 MESE variante Tutte, metti hourlyMese = null.

══════ REGOLA ESTRAZIONE MACROFONTI — CELLE VUOTE ══════
Nella tabella Macro Fornitore di Economics, alcune colonne possono essere VUOTE (tipicamente CPL o CPA Adv per i TRABOCCO).
REGOLE TASSATIVE per celle vuote:
- Se il CPL è VUOTO (cella bianca, niente numero): scrivi "cpl": "—" (trattino, NON "0")
- Se il CPA Adv è vuoto: ignoralo, usa SEMPRE "CPA Totale New" come CPA
- Il CPA Totale New è SEMPRE PRESENTE per ogni riga (anche quando CPL è vuoto): estrailo come numero
Esempio reale TRABOCCO A&R dal 15/04: Leads 75, pct 3,31%, CPL vuoto, OK 12, RED 16,0%, CPA Totale New €73 → {"name":"TRABOCCO A&R","leads":75,"pct":"3,31","cpl":"—","cpa":"73","red":"16,0"}
MAI "cpa":"0" o "cpl":"0" se la cella è vuota — usa "—" per CPL e il valore vero da "CPA Totale New" per CPA.

══════ DATA DEL RECORD ══════
"date" = data dal filtro degli screen GIORNO (es. "4/15/2026 → 4/15/2026" → "15/04"). Se tutti screen sono mese, null.

══════ PROCEDIMENTO ══════
1. Per ogni screen, identifica TIPO (1/2/3/4/5) e se è GIORNO o MESE (dal filtro Date).
2. Per ogni campo del JSON, trova lo screen giusto e leggi il valore nella posizione giusta.
3. Verifica ogni valore contro i range plausibili. Se fuori range → rileggi (forse hai confuso punto decimale).
4. Se uno screen richiesto manca, metti null per quei campi.

══════ CAMPI ATTESI ══════
leadGen, red, cpl, cpa, ctc, trabocco, macrofonti → da Economics GIORNO
redMese, cplMese, cpaMese, ctcMese, macrofontiMese → da Economics MESE
timing, pressione, durMedia → da Tabella riassuntiva GIORNO variante Tutte
contattab → da Tabella riassuntiva GIORNO variante Selezioni multiple
timingMese → da Tabella riassuntiva MESE variante Tutte
contattabMese → da Tabella riassuntiva MESE variante Selezioni multiple
ore → da Ore per Area, colonna del giorno
lavOra → da Leads/Ora per Area, colonna del giorno
lavOraMese → da Leads/Ora per Area, colonna Totale
resa → da Resa Net con Cross, colonna del giorno
resaMese → da Resa Net con Cross, colonna Totale
leadToBe, oreDich → null (gestiti dall'app)

Restituisci SOLO questo JSON (null per dati effettivamente assenti dagli screenshot):
{"date":"GG/MM","pressione":null,"leadGen":null,"leadToBe":null,"ore":null,"oreDich":null,"lavOra":null,"red":null,"resa":null,"ctc":null,"trabocco":null,"timing":null,"cpl":null,"cpa":null,"contattab":null,"durMedia":null,"lavOraMese":null,"redMese":null,"resaMese":null,"ctcMese":null,"timingMese":null,"cplMese":null,"cpaMese":null,"contattabMese":null,"hourly":[],"hourlyMese":null,"macrofonti":[{"name":"GALANO GOOGLE CALDE","leads":0,"pct":"0","cpl":"0","cpa":"0","red":"0"}],"macrofontiMese":[{"name":"GALANO GOOGLE CALDE","leads":0,"pct":"0","cpl":"0","cpa":"0","red":"0"}]}
Rispondi SOLO con il JSON, niente altro testo.` });
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-7", max_tokens: 4000, messages: [{ role: "user", content: imgContent }] }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (manualDate.trim()) parsed.date = manualDate.trim();
      // Sanitizzazione macrofonti: CPL o CPA = "0" per TRABOCCO → "—" (trattino = dato mancante)
      // Opus a volte restituisce "0" quando la cella è vuota, ma 0 non è un valore valido per CPL/CPA.
      // Per TRABOCCO il CPL è spesso vuoto: lo marchiamo come "—". Per il CPA serve che l'utente corregga manualmente.
      ["macrofonti", "macrofontiMese"].forEach(key => {
        if (Array.isArray(parsed[key])) {
          parsed[key].forEach(m => {
            if (m.cpl === "0" || m.cpl === 0) m.cpl = "—";
            if (m.cpa === "0" || m.cpa === 0) m.cpa = "—";
          });
        }
      });
      setExtracted(parsed);
      if (onExtracted) onExtracted(parsed);
      setChatMsgs([]);
      setChatOpen(false);
      setMsg("");
    } catch(e) { setMsg("⚠️ Errore nell'estrazione. Riprova o usa l'inserimento manuale."); }
    setExtracting(false);
  };

  const confirm = async () => {
    if (!extracted) return;
    setConfirming(true);
    try {
      const rec = { ...extracted, id: extracted.date + "_" + Date.now() };
      if (!Array.isArray(rec.hourly)) rec.hourly = [];
      // Salva sul Worker KV
      const saveRes = await kvSaveRecord(rec);
      if (!saveRes.ok) {
        if (saveRes.unauthorized) {
          setMsg("⚠️ Sessione scaduta. Ricarica la pagina e rifai login.");
        } else {
          setMsg("⚠️ Server irraggiungibile: salvataggio bloccato. Riprova tra qualche minuto.");
        }
        setConfirming(false);
        return;
      }
      // Aggiorna stato locale
      if (onSaved) {
        const getRes = await kvGetRecords();
        if (getRes.ok && getRes.records && getRes.records.length > 0) {
          const merged = mergeWithSeed(getRes.records);
          onSaved(merged);
        }
      }
      setMsg("✓ Dati del " + extracted.date + " salvati!");
      setExtracted(null);
      setScreens([]);
    } catch(e) { setMsg("⚠️ Errore nel salvataggio."); }
    setConfirming(false);
  };

  return (
    <div
      style={{ background: "#0f0c1e", border: "2px solid #664CCD", borderRadius: "14px", padding: "22px 24px", marginBottom: "20px" }}
    >
      <div style={{ fontSize: "13px", letterSpacing: "3px", color: "#FD6F3B", fontFamily: FF, textTransform: "uppercase", marginBottom: "4px" }}>Inserimento Rapido</div>
      <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fff", fontFamily: FF, marginBottom: "16px" }}>
        📸 Carica gli screen → AI estrae → Salva
      </div>

      {!extracted && (
        <>
          <div
            style={{ border: "2px dashed #664CCD66", borderRadius: "10px", padding: "24px", textAlign: "center", background: "#664CCD08", marginBottom: "14px", position: "relative" }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); loadScreens(e.dataTransfer.files); }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📂</div>
            <div style={{ color: "#fff", fontSize: "14px", fontFamily: FF, fontWeight: "bold", marginBottom: "4px" }}>Trascina o clicca per caricare · oppure incolla con Ctrl+V</div>
            <div style={{ color: "#7a6fa8", fontSize: "12px", fontFamily: FF, marginBottom: "12px" }}>Economics · Pianificazione Ore · Dashboard Marketing · Resa per Area</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <label style={{ background: "#664CCD", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: "pointer" }}>
                📁 Seleziona file
                <input type="file" accept="image/*" multiple onChange={e => loadScreens(e.target.files)} style={{ display: "none" }} />
              </label>
              <div
                contentEditable
                suppressContentEditableWarning
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  const imgs = Array.from(items).filter(it => it.type.startsWith("image/"));
                  if (!imgs.length) return;
                  e.preventDefault();
                  imgs.forEach(it => { const f = it.getAsFile(); if (!f) return; resizeImage(f).then(img => setScreens(prev => [...prev, img])); });
                  e.stopPropagation();
                }}
                style={{ background: "#1a1540", border: "1px solid #664CCD66", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontFamily: FF, color: "#c4b8ff", cursor: "text", minWidth: "140px", outline: "none" }}
              >📋 Clicca qui e Ctrl+V</div>
            </div>
          </div>

          {screens.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
              {screens.map((s, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={"data:" + s.mime + ";base64," + s.b64} alt="" style={{ height: "72px", borderRadius: "6px", border: "1px solid #664CCD44", objectFit: "cover" }} />
                  <button onClick={() => setScreens(prev => prev.filter((_,j)=>j!==i))} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ff5c5c", border: "none", borderRadius: "50%", width: "18px", height: "18px", color: "#fff", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              ))}

            </div>
          )}

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#7a6fa8", fontFamily: FF, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Data (GG/MM)</label>
              <input
                placeholder="es. 15/04"
                value={manualDate}
                onChange={e => setManualDate(e.target.value)}
                style={{ background: "#0f0c1e", border: "1px solid #664CCD66", borderRadius: "7px", color: "#fff", padding: "10px 13px", fontFamily: FF, fontSize: "13px", width: "110px", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "#664CCD"}
                onBlur={e => e.target.style.borderColor = "#664CCD66"}
              />
            </div>
            <button onClick={extract} disabled={!screens.length || extracting}
              style={{ background: screens.length && !extracting ? "#664CCD" : "#664CCD55", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: screens.length && !extracting ? "pointer" : "default", alignSelf: "flex-end" }}>
              {extracting ? "⏳ Analisi in corso..." : "🤖 Estrai dati con AI"}
            </button>
            {msg && <div style={{ fontSize: "13px", fontFamily: FF, color: msg.startsWith("✓") ? "#4caf50" : "#f5a623" }}>{msg}</div>}
          </div>
        </>
      )}

      {extracted && (
        <div style={{ background: "#1a1540", borderRadius: "10px", padding: "18px 20px" }}>
          <div style={{ fontSize: "13px", color: "#c4b8ff", fontFamily: FF, fontWeight: "bold", marginBottom: "14px" }}>
            ✅ Dati estratti per il {extracted.date} — modifica se necessario e conferma:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            {[
              ["Data", "date"],
              ["Lead Generate", "leadGen"],
              ["Lead TO BE", "leadToBe"],
              ["Ore effettive", "ore"],
              ["Ore dichiarate", "oreDich"],
              ["LAV/ORA", "lavOra"],
              ["RED %", "red"],
              ["RESA", "resa"],
              ["CTC %", "ctc"],
              ["Timing %", "timing"],
              ["Contattab %", "contattab"],
              ["CPL €", "cpl"],
              ["CPA €", "cpa"],
              ["CPL mese €", "cplMese"],
              ["CPA mese €", "cpaMese"],
              ["RED mese %", "redMese"],
              ["Timing mese %", "timingMese"],
              ["Contattab mese %", "contattabMese"],
            ].map(([label, key]) => (
              <div key={key} style={{ background: "#0f0c1e", borderRadius: "7px", padding: "8px 10px" }}>
                <div style={{ fontSize: "10px", color: "#7a6fa8", fontFamily: FF, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
                <input
                  value={extracted[key] || ""}
                  onChange={e => setExtracted(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{ background: "transparent", border: "none", borderBottom: "1px solid #664CCD44", color: "#fff", fontFamily: FF, fontSize: "13px", fontWeight: "bold", width: "100%", outline: "none", padding: "2px 0" }}
                />
              </div>
            ))}
          </div>
          {extracted.macrofonti && extracted.macrofonti.length > 0 && (
            <div style={{ fontSize: "12px", color: "#7a6fa8", fontFamily: FF, marginBottom: "14px" }}>
              {extracted.macrofonti.length} macrofornitori estratti · {extracted.macrofonti.map(m => m.name).join(", ")}
            </div>
          )}

          {/* Chat verifica AI */}
          <div style={{ background: "#0d0b1e", border: "1px solid #664CCD44", borderRadius: "10px", marginBottom: "14px", overflow: "hidden" }}>
            <button
              onClick={() => setChatOpen(o => !o)}
              style={{ width: "100%", background: "transparent", border: "none", padding: "11px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: "16px" }}>🤖</span>
              <span style={{ color: "#c4b8ff", fontSize: "13px", fontFamily: FF, fontWeight: "bold", flex: 1 }}>
                Verifica o correggi i dati con AI
              </span>
              <span style={{ color: "#664CCD", fontSize: "12px", fontFamily: FF }}>
                {chatOpen ? "▲ Chiudi" : "▼ Apri"}
              </span>
            </button>
            {chatOpen && (
              <div style={{ borderTop: "1px solid #664CCD33" }}>
                {/* Suggerimenti rapidi */}
                {chatMsgs.length === 0 && (
                  <div style={{ padding: "10px 14px 6px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                      "Quali campi sono vuoti e dove li trovo?",
                      "Il contattab è sbagliato, come mai?",
                      "Spiega come leggere il timing mese",
                    ].map((q, i) => (
                      <button key={i} onClick={() => sendChat(q)}
                        style={{ background: "#664CCD18", border: "1px solid #664CCD44", borderRadius: "6px", padding: "6px 10px", color: "#c4b8ff", fontSize: "11px", fontFamily: FF, cursor: "pointer" }}>
                        💬 {q}
                      </button>
                    ))}
                  </div>
                )}
                {/* Messaggi */}
                {chatMsgs.length > 0 && (
                  <div style={{ padding: "12px 14px", maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {chatMsgs.map((m, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: m.role === "user" ? O : P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>
                          {m.role === "user" ? "👤" : "🤖"}
                        </div>
                        <div style={{ background: m.role === "user" ? O+"22" : P+"22", border: "1px solid "+(m.role==="user"?O+"33":P+"33"), borderRadius: "8px", padding: "8px 12px", maxWidth: "85%", fontSize: "12px", fontFamily: FF, color: TX, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                          {m.content.replace(/\[AGGIORNA\][\s\S]*?\[\/AGGIORNA\]/g, "").trim()}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🤖</div>
                        <div style={{ background: P+"22", border: "1px solid "+P+"33", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontFamily: FF, color: MU }}>Sto analizzando…</div>
                      </div>
                    )}
                  </div>
                )}
                {/* Input */}
                <div style={{ padding: "10px 14px", borderTop: chatMsgs.length > 0 ? "1px solid #664CCD22" : "none", display: "flex", gap: "8px", alignItems: "center" }}>
                  {chatMsgs.length > 0 && (
                    <button onClick={() => setChatMsgs([])} style={{ background: "transparent", border: "1px solid #2a2248", borderRadius: "6px", color: MU, padding: "7px 9px", fontSize: "11px", fontFamily: FF, cursor: "pointer" }} title="Reset">↺</button>
                  )}
                  <input
                    style={{ flex: 1, background: "#1a1540", border: "1px solid #664CCD33", borderRadius: "6px", color: TX, padding: "8px 11px", fontFamily: FF, fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && chatInput.trim() && !chatLoading) sendChat(chatInput); }}
                    placeholder="Es. il contattab è 65,8 · perché timing mese è vuoto? · leadToBe è 2895"
                  />
                  <button onClick={() => sendChat(chatInput)} disabled={!chatInput.trim() || chatLoading}
                    style={{ background: chatInput.trim() && !chatLoading ? P : P+"55", border: "none", borderRadius: "6px", color: "#fff", padding: "8px 14px", fontSize: "12px", fontFamily: FF, cursor: chatInput.trim() && !chatLoading ? "pointer" : "default", fontWeight: "bold", flexShrink: 0 }}>
                    Invia →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={confirm} disabled={confirming}
              style={{ background: confirming ? "#4caf5055" : "#4caf50", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: confirming ? "default" : "pointer" }}>
              {confirming ? "⏳ Salvataggio..." : "✓ Conferma e salva per tutti"}
            </button>
            <button onClick={() => { setExtracted(null); }}
              style={{ background: "transparent", border: "1px solid #2a2248", borderRadius: "8px", padding: "12px 18px", fontSize: "13px", fontFamily: FF, color: "#7a6fa8", cursor: "pointer" }}>
              ✕ Annulla (mantieni screen)
            </button>
          </div>
          {msg && <div style={{ fontSize: "13px", fontFamily: FF, color: msg.startsWith("✓") ? "#4caf50" : "#f5a623", marginTop: "10px" }}>{msg}</div>}
        </div>
      )}
    </div>
  );
}

function TobePlanningUpload({ records, setRecords, persist }) {
  const [tobeScreens, setTobeScreens] = useState([]);
  const [tobeDate, setTobeDate] = useState("");
  const [tobeExtracting, setTobeExtracting] = useState(false);
  const [tobeMsg, setTobeMsg] = useState("");

  const extractTobe = async () => {
    if (!tobeScreens.length || !tobeDate.trim()) return;
    setTobeExtracting(true); setTobeMsg("Sto leggendo la pianificazione...");
    try {
      const imgContent = tobeScreens.map(s => ({ type: "image", source: { type: "base64", media_type: s.mime, data: s.b64 } }));
      imgContent.push({ type: "text", text: `Sei un assistente che legge pianificazioni lead generation da screenshot di Google Sheets.
Analizza questo screenshot e restituisci SOLO un oggetto JSON con questa struttura:
{"oreDich":1055,"lavOra":2.53,"hourlyTobe":{"8":0,"9":88,"10":157,"11":290,"12":334,"13":293,"14":262,"15":266,"16":298,"17":254,"18":165,"19":103,"20":22}}
Dove:
- "oreDich": somma totale della colonna "# ore" (riga "totale")
- "lavOra": valore LAV/ORA mostrato in cima (es. 2,53)
- "hourlyTobe": chiave = ora di inizio fascia (intero), valore = "tot leads" per quella fascia
  Fascia "8:00-9:00" → chiave 8, "9:00-10:00" → chiave 9, ecc.
Rispondi SOLO con il JSON.` });
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-7", max_tokens: 500, messages: [{ role: "user", content: imgContent }] }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/\`\`\`json|\`\`\`/g, "").trim());
      const dateKey = tobeDate.trim();
      const newEntry = { from: dateKey, tobe: parsed.hourlyTobe };
      let scheduleData = [];
      try {
        const res2 = await window.storage.get(STORAGE_KEY + "_tobe_schedule", true);
        if (res2?.value) scheduleData = JSON.parse(res2.value);
      } catch(e) {}
      scheduleData = scheduleData.filter(e => e.from !== dateKey);
      scheduleData.push(newEntry);
      scheduleData.sort((a,b) => sortKey(a.from).localeCompare(sortKey(b.from)));
      await window.storage.set(STORAGE_KEY + "_tobe_schedule", JSON.stringify(scheduleData), true);
      await loadDynamicTobeSchedule();
      const updatedRecords = enrichWithInheritedTobe(records.map(r => {
        if (sortKey(r.date) >= sortKey(dateKey)) return { ...r, oreDich: String(parsed.oreDich) };
        return r;
      }));
      setRecords(updatedRecords);
      await persist(updatedRecords);
      const totLead = Object.values(parsed.hourlyTobe).reduce((s,v)=>s+v,0);
      setTobeMsg("✓ Pianificazione aggiornata dal " + dateKey + " — TO BE: " + totLead + " lead · " + parsed.oreDich + " ore · LAV/ORA " + parsed.lavOra);
      setTobeScreens([]);
    } catch(e) {
      setTobeMsg("⚠️ Errore nell'estrazione. Controlla lo screenshot e riprova.");
    }
    setTobeExtracting(false);
  };

  return (
    <div style={{ ...cardCss, borderColor: P + "66", borderWidth: "2px", marginTop: "0" }}>
      <div style={{ ...secCss, color: P, marginBottom: "12px" }}>📐 Aggiorna pianificazione TO BE</div>
      <div style={{ fontSize: "13px", color: MU, fontFamily: FF, marginBottom: "16px", lineHeight: "1.6" }}>
        Carica uno screenshot della pianificazione (Google Sheets) per aggiornare il TO BE orario e le ore dichiarate dalla data indicata.
      </div>
      <label style={{ display: "block", border: "2px dashed " + P + "66", borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: P + "08", marginBottom: "14px" }}>
        <div style={{ fontSize: "24px", marginBottom: "6px" }}>📂</div>
        <div style={{ color: "#fff", fontSize: "13px", fontFamily: FF, fontWeight: "bold", marginBottom: "3px" }}>Carica screenshot pianificazione</div>
        <div style={{ color: MU, fontSize: "11px", fontFamily: FF }}>PNG o JPG del Google Sheets con tot leads e # ore per fascia</div>
        <input type="file" accept="image/*" onChange={e => {
          const f = e.target.files[0]; if (!f) return;
          resizeImage(f).then(img => setTobeScreens([{ b64: img.b64, mime: img.mime, name: f.name }]));
        }} style={{ display: "none" }} />
      </label>
      {tobeScreens.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", alignItems: "center" }}>
          <img src={"data:" + tobeScreens[0].mime + ";base64," + tobeScreens[0].b64} alt="preview"
            style={{ height: "60px", borderRadius: "6px", border: "1px solid " + P + "44", objectFit: "cover" }} />
          <button onClick={() => setTobeScreens([])} style={{ background: "transparent", border: "1px solid " + BD, borderRadius: "6px", color: MU, padding: "5px 9px", fontSize: "12px", fontFamily: FF, cursor: "pointer" }}>✕</button>
        </div>
      )}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "14px" }}>
        <div>
          <label style={lblCss}>Data entrata in vigore (GG/MM)</label>
          <input style={{ ...inpCss, width: "160px" }} value={tobeDate} onChange={e => setTobeDate(e.target.value)}
            placeholder="es. 14/04"
            onFocus={e => e.target.style.borderColor = P} onBlur={e => e.target.style.borderColor = BD} />
        </div>
        <button onClick={extractTobe} disabled={!tobeScreens.length || !tobeDate.trim() || tobeExtracting}
          style={{ background: tobeScreens.length && tobeDate.trim() && !tobeExtracting ? P : P + "55", border: "none", borderRadius: "8px", padding: "11px 22px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: tobeScreens.length && tobeDate.trim() && !tobeExtracting ? "pointer" : "default" }}>
          {tobeExtracting ? "⏳ Lettura in corso..." : "🤖 Estrai e aggiorna TO BE"}
        </button>
      </div>
      {tobeMsg && <div style={{ fontSize: "13px", fontFamily: FF, color: tobeMsg.startsWith("✓") ? "#4caf50" : "#f5a623" }}>{tobeMsg}</div>}
    </div>
  );
}

function MeseSintesiSection({ filtered, records }) {
  const [sintesi, setSintesi] = useState("");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!sintesi) return;
    try {
      const el = document.createElement("textarea");
      el.value = sintesi; el.style.position = "fixed"; el.style.opacity = "0";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      navigator.clipboard?.writeText(sintesi).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };

  return (
    <div>
      <WeeklySintesiBox filtered={filtered} records={records} onSintesiChange={setSintesi} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
        {!sintesi && (
          <div style={{ fontSize: "12px", fontFamily: FF, color: "#f5a623", background: "#f5a62318", border: "1px solid #f5a62344", borderRadius: "7px", padding: "7px 12px" }}>
            ⚠️ Prima genera la Sintesi Operativa AI
          </div>
        )}
        <button onClick={copy} disabled={!sintesi} style={{ background: !sintesi ? "#FD6F3B55" : copied ? "#664CCD" : "#FD6F3B", border: "none", borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: sintesi ? "pointer" : "default" }}>
          {copied ? "✓ Copiato!" : "📋 Genera Recap"}
        </button>
      </div>
    </div>
  );
}

function WeeklySintesiBox({ filtered, records, onSintesiChange }) {
  const [sintesi, setSintesi] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [weekScreens, setWeekScreens] = useState([]);

  const loadWeekScreens = (files) => {
    Array.from(files).forEach(file => {
      resizeImage(file).then(img => setWeekScreens(prev => [...prev, { base64: img.b64, mediaType: img.mime, name: file.name }]));
    });
  };

  const buildImgContent = () => weekScreens.map(s => ({
    type: "image", source: { type: "base64", media_type: s.mediaType, data: s.base64 }
  }));

  const buildWeekCtx = () => {
    if (!filtered.length) return "Nessun dato nel periodo selezionato.";
    const sorted = [...filtered].sort((a,b) => sortKey(a.date).localeCompare(sortKey(b.date)));
    const lat = sorted[sorted.length - 1]; // record più recente = fonte valori *Mese

    // Media lun-ven (escludi sabato = giorno con ore < 500 o leadGen < 500)
    const weekdays = sorted.filter(r => {
      const parts = r.date.split("/");
      const d = new Date(2026, parseInt(parts[1])-1, parseInt(parts[0]));
      return d.getDay() !== 0 && d.getDay() !== 6;
    });
    const saturdays = sorted.filter(r => {
      const parts = r.date.split("/");
      const d = new Date(2026, parseInt(parts[1])-1, parseInt(parts[0]));
      return d.getDay() === 6;
    });
    const avgLeads = weekdays.length ? Math.round(weekdays.reduce((s,r)=>s+(parseFloat(r.leadGen)||0),0)/weekdays.length) : null;
    const avgOre = weekdays.length ? Math.round(weekdays.reduce((s,r)=>s+(parseFloat(r.ore)||0),0)/weekdays.length) : null;
    const deltaLead = avgLeads && lat.leadToBe ? (((avgLeads - parseFloat(lat.leadToBe))/parseFloat(lat.leadToBe))*100).toFixed(2) : null;
    const deltaOre = avgOre && lat.oreDich ? (((avgOre - parseFloat(lat.oreDich))/parseFloat(lat.oreDich))*100).toFixed(2) : null;
    const deltaLavOra = lat.lavOraMese && lat.lavOraMese !== "—" ? (((parseFloat(lat.lavOraMese)-2.53)/2.53)*100).toFixed(1) : null;
    const deltaResa = lat.resaMese && lat.resaMese !== "—" ? (((parseFloat(lat.resaMese)-0.45)/0.45)*100).toFixed(1) : null;
    const deltaTiming = lat.timingMese && lat.timingMese !== "—" ? (((parseFloat(lat.timingMese)-95)/95)*100).toFixed(1) : null;
    const deltaCpl = lat.cplMese && lat.cplMese !== "—" ? (((parseFloat(lat.cplMese)-12.5)/12.5)*100).toFixed(1) : null;

    // Pattern mese da hourlyMese del record più recente
    const hm = lat.hourlyMese;
    const patternLines = [];
    if (hm) {
      [9,10,11,12,13,14,15,16,17,18,19].forEach(h => {
        const v = hm[h];
        if (v == null) return;
        if (v < 80) patternLines.push(h + ":00=" + v + "% (SOTTO SOGLIA — ridurre generazione)");
        else if (v >= 98) patternLines.push(h + ":00=" + v + "% (SOPRA SOGLIA — aumentare generazione)");
      });
    }

    // Macrofonti mese dal record più recente + delta vs MACRO_TOBE
    const macroToBe = getMacroToBe(lat.date);
    const macroMeseLines = (lat.macrofontiMese || []).map(m => {
      const tb = macroToBe ? macroToBe[m.name] : null;
      const dailyLeads = parseFloat(m.leads) / weekdays.length;
      const delta = tb ? (((dailyLeads - tb) / tb) * 100).toFixed(1) : null;
      return m.name + ": leads/gg " + (dailyLeads ? Math.round(dailyLeads) : "—") + (delta !== null ? " (delta " + (parseFloat(delta)>=0?"+":"") + delta + "% vs TO BE)" : "") + " · RED mese " + m.red + "% · CPL mese " + m.cpl + "€ · CPA mese " + m.cpa + "€";
    });

    return [
      "PERIODO: " + sorted[0].date + "/2026 – " + lat.date + "/2026 (" + sorted.length + " giorni, " + weekdays.length + " lun-ven)",
      "DATA REPORT: al " + lat.date + "/2026",
      "GIORNI LUN-VEN: " + weekdays.map(r=>r.date).join(", "),
      "",
      "KPI MESE (dal record più recente: " + lat.date + "):",
      "LEAD GENERATE media/gg lun-ven: " + (avgLeads||"—") + " vs " + (lat.leadToBe||"—") + " TO BE (" + (deltaLead!==null?(parseFloat(deltaLead)>=0?"+":"")+deltaLead+"%":"—") + ")",
      "ORE media/gg lun-ven: " + (avgOre||"—") + " vs " + (lat.oreDich||"—") + " dichiarate (" + (deltaOre!==null?(parseFloat(deltaOre)>=0?"+":"")+deltaOre+"%":"—") + ")",
      "LAV/ORA: " + (lat.lavOraMese||"—") + " (2,53 target; delta " + (deltaLavOra!==null?(parseFloat(deltaLavOra)>=0?"+":"")+deltaLavOra+"%" : "n.d.") + ")",
      "RED: " + (lat.redMese||"—") + "% (17,6% target)",
      "RESA: " + (lat.resaMese||"—") + " (0,45 target; delta " + (deltaResa!==null?(parseFloat(deltaResa)>=0?"+":"")+deltaResa+"%" : "n.d.") + ")",
      "% CTC: " + (lat.ctcMese||"—") + "%",
      "Timing 1-5 min (netto CTC): " + (lat.timingMese||"—") + "% (target range 90-97,99%; benchmark 95%" + (deltaTiming!==null?"; "+(parseFloat(deltaTiming)>=0?"+":"")+deltaTiming+"%":"") + ")",
      "Contattab (netto CTC): " + (lat.contattabMese||"—") + "%",
      "CPL: " + (lat.cplMese||"—") + "€ (12,5€ target" + (deltaCpl!==null?"; "+(parseFloat(deltaCpl)>=0?"+":"")+deltaCpl+"%":"") + ")",
      "CPA: " + (lat.cpaMese||"—") + "€ (100€ target)",
      "",
      patternLines.length > 0 ? "PATTERN TIMING MESE (fasce strutturalmente fuori range):\n" + patternLines.join("\n") : "PATTERN TIMING MESE: nessuna fascia strutturalmente fuori range.",
      "",
      "MACROFORNITORI MESE (ranking CPA mese dal peggiore al migliore):",
      ...[...(lat.macrofontiMese||[])].filter(m=>!m.name.includes("TRABOCCO")&&m.name!=="ETC").sort((a,b)=>parseFloat(b.cpa)-parseFloat(a.cpa)).map(m => {
        const tb = macroToBe ? macroToBe[m.name] : null;
        const dailyLeads = weekdays.length ? Math.round(parseFloat(m.leads) / weekdays.length) : null;
        const delta = tb && dailyLeads ? (((dailyLeads - tb) / tb) * 100).toFixed(1) : null;
        return m.name + ": " + (dailyLeads||"—") + " lead/gg" + (delta!==null?" (delta "+(parseFloat(delta)>=0?"+":"")+delta+"% vs TO BE)":"") + " · RED mese " + m.red + "% · CPL mese " + m.cpl + "€ · CPA mese " + m.cpa + "€";
      }),
      "",
      "TRABOCCHI:",
      ...(lat.macrofontiMese||[]).filter(m=>m.name.includes("TRABOCCO")).map(m => m.name + ": CPA mese " + m.cpa + "€ · RED mese " + m.red + "%"),
    ].join("\n");
  };

  const systemPrompt = `Sei l'assistente AI del Direttore Marketing di ComparaSemplice.it.
Produci la SINTESI OPERATIVA MENSILE per il periodo indicato.
OUTPUT: testo plain, nessun markdown. NON scrivere intestazioni di sezione. Inizia direttamente con il contenuto.
MAI usare "oggi" — usa sempre la data o "nel periodo".

FORMATO OBBLIGATORIO (in quest'ordine, senza titoli di sezione):

CS Energia
al [DATA REPORT dai dati]

LEAD GENERATE: [media lun-ven] vs [TO BE] TO BE ([delta]%)
ORE: [media lun-ven] vs [ore dichiarate] dichiarate ([delta]%)
LAV/ORA: [valore] ([target]; [delta precalcolato dai dati])
RED: [valore]% ([target]% target)
RESA: [valore] ([target] target; [delta precalcolato dai dati])
% CTC: [valore]%
Timing 1-5 min (netto CTC): [valore]%
Contattab (netto CTC): [valore]%
CPL: [valore]€ ([target]€ target; [delta precalcolato dai dati])
CPA: [valore]€ ([target]€ target)
[Se sabati presenti: SABATI (N): [data] — lead X · ore Y/Z dich. · LAV/ORA W · RED V% · CPA U€]
[Se il giorno del report è il miglior CPA del mese: ★ Giorno con miglior CPA del mese]

— TIMING 1-5 MIN — FASCE FUORI RANGE —
Pattern mese: [per ogni fascia strutturalmente fuori range con intervento ≥10%: "Fascia X:00 ha timing sistematicamente [sotto/sopra] soglia nel mese (Y%) → [ridurre/aumentare] la generazione del Z%."]

Azioni correttive
[3-4 paragrafi operativi]

REGOLE KPI:
- Usa ESATTAMENTE i valori dai DATI forniti. Non ricalcolare nulla.
- SABATI: i dati dei sabati sono forniti separatamente. NON includerli nelle medie feriali. Se presenti, aggiungi dopo i KPI feriali una riga: "SABATI (N): [data] — lead X · ore Y/Z dich. · LAV/ORA W · RED V% · CPA U€" senza confronto vs TO BE feriale.
- Per il Pattern mese: segnala SOLO fasce con intervento ≥10% (timing <80% o ≥98%). Fasce 90-97%: non segnalare.
- MAI "spostare volume da fascia X a fascia Y" — le lead si generano ora per ora.
- Ogni fascia trattata in modo indipendente.

REGOLE AZIONI CORRETTIVE MACROFORNITORI:
Fornitori principali: GALANO GOOGLE CALDE, SPINUP SOCIAL, GALANO GOOGLE CTC, GALANO SOCIAL, PAOLO SOCIAL. ETC e Trabocchi esclusi.
Usa il ranking CPA mese (già ordinato nei dati, dal peggiore al migliore).
- RIDURRE: ultimi 1-2 del ranking. Formato: "Ridurre la generazione di X lead/giorno su [FORNITORE] (da Y a Y-X lead)."
  - CPA mese 110-120€ → 15-20 lead/giorno; CPA 120-140€ → 25-35 lead/giorno; CPA >140€ → 35-50 lead/giorno
  - Se delta vs TO BE ≤ -20% e CPA alto → cappatura già in atto: segnalare con "volumi già ridotti". Riduzione ulteriore più contenuta.
  - Volume ridotto distribuito su fonti migliori, mai una sola. Nomina i fornitori destinatari con le lead.
  - MAI "ridurre il budget del X%"
- AUMENTARE: primi 1-2 del ranking con RED mese sopra soglia. Max 40 lead/giorno aggiuntive su un fornitore.
- MANTENERE: fornitori intermedi. Non ridurre se ci sono peggiori.
- Per fornitori con CPA buono + delta negativo → causa esterna, non cappatura marketing.
- Per distribuzione oraria: "ridurre/aumentare di X lead/ora in fascia Y:00".`;

  const generate = async () => {
    setLoading(true);
    const imgs = buildImgContent();
    const textContent = systemPrompt + "\n\nDATI:\n" + buildWeekCtx() + "\n\nRispondi SOLO con la sintesi.";
    const msgContent = imgs.length > 0 ? [...imgs, { type: "text", text: textContent }] : textContent;
    try {
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800,
          messages: [{ role: "user", content: msgContent }]
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim() || "";
      if (text) { setSintesi(text); if (onSintesiChange) onSintesiChange(text); }
    } catch (e) {}
    setLoading(false);
  };

  const sendChat = async (text) => {
    if ((!text.trim() && weekScreens.length === 0) || chatLoading) return;
    const imgs = buildImgContent();
    const userContent = imgs.length > 0
      ? [...imgs, { type: "text", text: text.trim() || "Analizza questi screenshot e aggiorna la sintesi." }]
      : text.trim();
    const userMsg = { role: "user", content: userContent };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs); setChatInput(""); setWeekScreens([]); setChatLoading(true);
    const sys = systemPrompt + "\n\nDATI SETTIMANA:\n" + buildWeekCtx() + (sintesi ? "\n\nSINTESI CORRENTE:\n" + sintesi : "") +
      "\n\nSe chiedi una modifica alla sintesi, inizia la risposta con [SINTESI_AGGIORNATA] seguito dal testo aggiornato completo.";
    try {
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, system: sys, messages: newMsgs }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text?.trim() || "Errore.";
      setChatMsgs([...newMsgs, { role: "assistant", content: reply }]);
      if (reply.startsWith("[SINTESI_AGGIORNATA]")) { const upd = reply.replace("[SINTESI_AGGIORNATA]","").trim(); setSintesi(upd); if (onSintesiChange) onSintesiChange(upd); }
    } catch (e) { setChatMsgs([...newMsgs, { role: "assistant", content: "Errore di connessione." }]); }
    setChatLoading(false);
  };

  if (!filtered.length) return null;
  const canSend = (chatInput.trim() || weekScreens.length > 0) && !chatLoading;

  return (
    <div style={{ background: CARD2, border: "2px solid " + P + "66", borderRadius: "12px", overflow: "hidden", marginTop: "22px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg," + P + "44,#1a1540)", padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ color: "#c4b8ff", fontWeight: "bold", fontSize: "13px", fontFamily: FF }}>📋 Sintesi Operativa Mensile</div>
          <div style={{ color: MU, fontSize: "11px", fontFamily: FF, marginTop: "2px" }}>{filtered.length} giorni · alert KPI · confronto settimana precedente · azioni correttive</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Screenshot */}
          <label title="Allega screenshot (o incolla con Ctrl+V)" style={{ cursor: "pointer" }}>
            <div style={{ background: "#ffffff11", border: "1px solid "+P+"55", borderRadius: "7px", padding: "7px 12px", fontSize: "12px", fontFamily: FF, color: weekScreens.length > 0 ? "#c4b8ff" : MU, display: "flex", alignItems: "center", gap: "6px" }}>
              📎 {weekScreens.length > 0 ? weekScreens.length + " screen" : "Screen (o Ctrl+V)"}
            </div>
            <input type="file" accept="image/*" multiple onChange={e => loadWeekScreens(e.target.files)} style={{ display: "none" }} />
          </label>
          {weekScreens.length > 0 && <button onClick={() => setWeekScreens([])} style={{ background:"transparent", border:"1px solid "+BD, borderRadius:"7px", color:MU, padding:"7px 9px", fontSize:"11px", fontFamily:FF, cursor:"pointer" }}>✕</button>}
          {!sintesi && <button onClick={generate} disabled={loading} style={{ background: loading?P+"55":P, border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: loading?"default":"pointer" }}>{loading ? "⏳ Generando…" : "🤖 Genera Sintesi"}</button>}
          {sintesi && <button onClick={generate} disabled={loading} style={{ background: "transparent", border: "1px solid "+P, borderRadius: "8px", padding: "9px 14px", fontSize: "12px", fontFamily: FF, color: "#c4b8ff", cursor: "pointer" }}>{loading?"⏳":"↺ Rigenera"}</button>}
          <button onClick={() => setChatOpen(o=>!o)} style={{ background: chatOpen?P:P+"33", border: "1px solid "+P, borderRadius: "8px", padding: "9px 16px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: chatOpen?"#fff":"#c4b8ff", cursor: "pointer" }}>{chatOpen ? "✕ Chiudi" : "💬 Chat AI"}</button>
        </div>
      </div>

      {/* Thumbnails screen */}
      {weekScreens.length > 0 && (
        <div style={{ padding: "10px 22px", background: P+"0f", borderBottom: "1px solid "+P+"22", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: MU, fontFamily: FF }}>📎 Screen allegati:</span>
          {weekScreens.map((s, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={"data:"+s.mediaType+";base64,"+s.base64} alt={s.name} style={{ height: "40px", borderRadius: "5px", border: "1px solid "+P+"44", objectFit: "cover" }} />
              <button onClick={() => setWeekScreens(prev => prev.filter((_,j)=>j!==i))} style={{ position:"absolute", top:"-5px", right:"-5px", background:"#ff5c5c", border:"none", borderRadius:"50%", width:"15px", height:"15px", fontSize:"8px", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
          ))}
          <span style={{ fontSize: "11px", color: "#c4b8ff", fontFamily: FF, fontStyle: "italic" }}>usati nella prossima azione</span>
        </div>
      )}

      {/* Sintesi testo */}
      {sintesi ? (
        <div style={{ padding: "18px 22px", borderBottom: chatOpen ? "1px solid "+P+"33" : "none" }}>
          {sintesi.split("\n").map((line, i) => (
            <div key={i} style={{ color: line.match(/^[0-9]+\./) ? "#c4b8ff" : line.includes("⚠️")||line.includes("🔴") ? "#ff5c5c" : TX, fontSize: "13px", fontFamily: FF, lineHeight: "1.7", fontWeight: line.match(/^[0-9]+\./) ? "bold" : "normal", marginBottom: line === "" ? "6px" : "0" }}>
              {line || "\u00a0"}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "16px 22px", color: MU, fontSize: "13px", fontFamily: FF, fontStyle: "italic" }}>
          {chatOpen ? "Puoi dare linee guida prima di generare, poi clicca 'Genera Sintesi'." : "Seleziona un periodo e clicca \"Genera Sintesi\" per l'analisi settimanale."}
        </div>
      )}

      {/* Chat */}
      {chatOpen && (
        <div>
          {chatMsgs.length > 0 && (
            <div style={{ padding: "14px 22px", maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatMsgs.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexDirection: m.role==="user"?"row-reverse":"row" }}>
                  <div style={{ width:"26px",height:"26px",borderRadius:"50%",background:m.role==="user"?O:P,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",flexShrink:0 }}>{m.role==="user"?"👤":"🤖"}</div>
                  <div style={{ background:m.role==="user"?O+"22":P+"22",border:"1px solid "+(m.role==="user"?O+"33":P+"33"),borderRadius:"10px",padding:"9px 13px",maxWidth:"85%",fontSize:"13px",fontFamily:FF,color:TX,lineHeight:"1.6",whiteSpace:"pre-wrap" }}>
                    {typeof m.content === "string"
                      ? (m.content.startsWith("[SINTESI_AGGIORNATA]") ? "✅ Sintesi aggiornata:\n\n"+m.content.replace("[SINTESI_AGGIORNATA]","").trim() : m.content)
                      : m.content.filter(b=>b.type==="text").map(b=>b.text).join("")}
                  </div>
                </div>
              ))}
              {chatLoading && <div style={{display:"flex",gap:"8px"}}><div style={{width:"26px",height:"26px",borderRadius:"50%",background:P,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px"}}>🤖</div><div style={{background:P+"22",border:"1px solid "+P+"33",borderRadius:"10px",padding:"9px 13px",fontSize:"13px",fontFamily:FF,color:MU}}>Sto elaborando…</div></div>}
            </div>
          )}
          {chatMsgs.length === 0 && (
            <div style={{ padding: "12px 22px 6px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(sintesi
                ? ["Approfondisci i macrofornitori critici","Quali azioni prioritizzare per il CPA?","Confronta con la settimana precedente","Aggiungi commento sul timing"]
                : ["Focalizzati sul CPA e RED","Sii più sintetico, max 5 righe","Metti in evidenza i fornitori critici","Includi le azioni correttive concrete"]
              ).map((q,i)=>(
                <button key={i} onClick={()=>{ if(!sintesi){ setChatInput(q); } else { sendChat(q); }}} style={{background:P+"18",border:"1px solid "+P+"44",borderRadius:"7px",padding:"7px 12px",color:"#c4b8ff",fontSize:"12px",fontFamily:FF,cursor:"pointer"}}>💬 {q}</button>
              ))}
            </div>
          )}
          <div style={{ padding: "10px 22px 14px", display: "flex", gap: "8px", alignItems: "center", borderTop: "1px solid "+P+"22" }}>
            {chatMsgs.length>0 && <button onClick={()=>{setChatMsgs([]);}} style={{background:"transparent",border:"1px solid "+BD,borderRadius:"7px",color:MU,padding:"8px 10px",fontSize:"12px",fontFamily:FF,cursor:"pointer"}}>↺</button>}
            {/* Attach */}
            <label title="Allega screenshot" style={{ cursor: "pointer", flexShrink: 0 }}>
              <div style={{ background: P+"22", border: "1px solid "+P+"55", borderRadius: "7px", padding: "9px 11px", fontSize: "15px", lineHeight: 1 }}>📎</div>
              <input type="file" accept="image/*" multiple onChange={e => loadWeekScreens(e.target.files)} style={{ display: "none" }} />
            </label>
            <input style={{flex:1,background:"#0d0b1e",border:"1px solid "+P+"44",borderRadius:"7px",color:TX,padding:"9px 13px",fontFamily:FF,fontSize:"13px",outline:"none",boxSizing:"border-box"}}
              value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&canSend)sendChat(chatInput);}}
              onPaste={e=>{
                const items = e.clipboardData?.items;
                if (!items) return;
                const imgs2 = Array.from(items).filter(it=>it.type.startsWith("image/"));
                if (!imgs2.length) return;
                e.preventDefault();
                imgs2.forEach(it=>{ const file=it.getAsFile(); if(!file) return; resizeImage(file).then(img=>setWeekScreens(prev=>[...prev,{base64:img.b64,mediaType:img.mime,name:"paste.png"}])); });
              }}
              placeholder={sintesi ? "Es. aggiungi alert su GALANO SOCIAL, rimuovi sezione confronto…" : "Es. focalizzati sul CPA, metti in evidenza i fornitori critici…"} />
            <button onClick={()=>sendChat(chatInput)} disabled={!canSend} style={{background:canSend?P:P+"55",border:"none",borderRadius:"7px",color:"#fff",padding:"9px 16px",fontSize:"13px",fontFamily:FF,cursor:canSend?"pointer":"default",fontWeight:"bold",flexShrink:0}}>Invia →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecapBox({ buildFn, recs, title }) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const generate = () => setText(buildFn(recs));
  const copy = () => {
    try {
      const el = document.createElement("textarea");
      el.value = text; el.style.position = "fixed"; el.style.opacity = "0";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };
  return (
    <div style={{ background: CARD, border: "2px solid " + O + "66", borderRadius: "12px", padding: "22px 24px", marginBottom: "18px", marginTop: "22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: text ? "18px" : "0" }}>
        <div>
          <div style={{ ...secCss, color: O, marginBottom: "4px" }}>📋 {title}</div>
          <div style={{ fontSize: "13px", color: MU, fontFamily: FF }}>Genera il testo del recap per il periodo selezionato ({recs.length} {recs.length===1?"giorno":"giorni"})</div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={generate} style={{ background: O, border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: "#fff", cursor: "pointer" }}>Genera Recap</button>
          {text && <button onClick={copy} style={{ background: copied ? P : P+"33", border: "1px solid "+P, borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontFamily: FF, fontWeight: "bold", color: copied ? "#fff" : "#c4b8ff", cursor: "pointer" }}>{copied ? "✓ Copiato!" : "Copia testo"}</button>}
          {text && <button onClick={() => setText("")} style={{ background: "transparent", border: "1px solid #2a2248", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", fontFamily: FF, color: MU, cursor: "pointer" }}>✕</button>}
        </div>
      </div>
      {text && (
        <pre style={{ background: CARD2, border: "1px solid "+P+"44", borderRadius: "10px", padding: "18px 20px", fontSize: "14px", fontFamily: "'IBM Plex Mono','Courier New',monospace", color: TX, lineHeight: "1.7", whiteSpace: "pre-wrap", margin: "0" }}>
          {text}
        </pre>
      )}
    </div>
  );
}

// ── MAIN APP ──

// ═══════════════════════════════════════════════════════════════
// ── WEEKLY LOAD FORM: form per caricare dati settimanali ──
// ═══════════════════════════════════════════════════════════════
function WeeklyLoadForm({ weekOptions, defaultWeekId, tobeSabati, recordsSett, records, onClose, onSaved }) {
  const [weekId, setWeekId] = useState(defaultWeekId);
  const selectedWeek = weekOptions.find(w => w.id === weekId) || weekOptions[0];
  const satDate = (() => {
    if (!selectedWeek) return "";
    const g = String(selectedWeek.sat.getDate()).padStart(2, "0");
    const m = String(selectedWeek.sat.getMonth() + 1).padStart(2, "0");
    return g + "/" + m + "/" + selectedWeek.sat.getFullYear();
  })();

  const existingSabato = tobeSabati.find(t => t.date === satDate);
  const lastArpu = (recordsSett.slice(-1)[0] || {}).arpu || 145;

  const [tobeSatLead, setTobeSatLead] = useState(existingSabato ? String(existingSabato.lead) : "");
  const [tobeSatOre, setTobeSatOre] = useState(existingSabato ? String(existingSabato.ore) : "");
  const [arpu, setArpu] = useState(String(lastArpu));
  const [screens, setScreens] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState("");

  // Reset quando cambia settimana
  useEffect(() => {
    const sabato = tobeSabati.find(t => t.date === satDate);
    if (sabato) {
      setTobeSatLead(String(sabato.lead));
      setTobeSatOre(String(sabato.ore));
    } else {
      setTobeSatLead("");
      setTobeSatOre("");
    }
  }, [weekId, satDate]);

  const handleFilesUpload = (files) => {
    const newScreens = [];
    let processed = 0;
    [...files].forEach((file, idx) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        newScreens.push({ name: file.name, data: e.target.result });
        processed++;
        if (processed === files.length) {
          setScreens(prev => [...prev, ...newScreens]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleExtract = async () => {
    if (screens.length === 0) {
      setExtractMsg("⚠️ Carica almeno uno screenshot prima di estrarre.");
      return;
    }
    if (!tobeSatLead || !tobeSatOre) {
      setExtractMsg("⚠️ Inserisci TO BE sabato (lead e ore).");
      return;
    }
    if (!arpu) {
      setExtractMsg("⚠️ Inserisci ARPU.");
      return;
    }

    setExtracting(true);
    setExtractMsg("Estrazione AI in corso con Opus...");

    // Costruisci il prompt per Opus (adattato al settimanale)
    const imgContent = screens.map(s => ({
      type: "image",
      source: { type: "base64", media_type: s.data.split(";")[0].split(":")[1], data: s.data.split(",")[1] }
    }));

    const textPrompt = "Estrai i dati dalla tabella Power BI per un range SETTIMANALE. Restituisci SOLO un JSON valido senza testo aggiuntivo.\n\n" +
      "Struttura richiesta:\n" +
      "{\n" +
      '  "kpi": {\n' +
      '    "red": numero (es. 15.6),\n' +
      '    "resa": numero (es. 0.38),\n' +
      '    "ctc": numero (es. 20.14),\n' +
      '    "trabocco": numero (% Trabocco TLC sul totale CTC),\n' +
      '    "timing": numero intero (timing 1-5min, es. 87),\n' +
      '    "contattab": numero (contattabilità netto CTC, es. 72.8),\n' +
      '    "cpl": numero (es. 12.5),\n' +
      '    "cpa": numero (es. 119),\n' +
      '    "lavOra": numero\n' +
      "  },\n" +
      '  "hourlySett": { "9": 74, "10": 81, ..., "19": 88 } (timing medio settimana per fascia, da tabella Timing Chiamate),\n' +
      '  "macrofonti": [\n' +
      '    { "name": "GALANO GOOGLE CTC", "leads": numero (lead totali settimana), "pct": "22.5", "cpl": "12.3", "cpa": "88", "red": "23.1" },\n' +
      '    ... (tutti i fornitori inclusi TRABOCCO TLC, TRABOCCO A&R, ETC)\n' +
      '  ]\n' +
      "}\n\n" +
      "REGOLE CRITICHE — dove trovare OGNI valore:\n\n" +
      "1. CPA settimanale (kpi.cpa): dalla tabella 'Macro Fornitore' dettagliata della Dashboard Economics Marketing & Campaigns — Recap CPL Operations, riga 'Total'. ATTENZIONE: la tabella ha DUE colonne CPA diverse:\n" +
      "   • 'CPA Adv' — NON USARE questa colonna, contiene il costo advertising puro (es. €79,74 sbagliato)\n" +
      "   • 'CPA Totale New' — USA QUESTA, è il CPA totale corretto (es. €119)\n" +
      "   Devi leggere esclusivamente 'CPA Totale New' riga 'Total'. Se la tabella non è visibile, metti null — non inventare.\n" +
      "2. CPL settimanale (kpi.cpl): tabella 'Macro Fornitore' riga 'Total', colonna 'CPL'.\n" +
      "3. RED settimanale (kpi.red): tabella 'Macro Fornitore' riga 'Total', colonna 'RED'.\n" +
      "4. TIMING 1-5min (kpi.timing): dalla tabella Dashboard Marketing — Tabella riassuntiva Drill-down, screenshot con filtro cluster_progetti='Tutte' (NON 'Selezioni multiple'). Riga 'Totale', colonna 'Tentativo in 5min'. Per distinguere lo screenshot giusto: guarda il valore 'Totale Leads Gen' — quello con cluster='Tutte' ha Leads Gen più ALTO (es. 10497), quello con 'Selezioni multiple' più basso (es. 7934). Usa quello con Leads Gen più alto. Valore tipico 85-95%.\n" +
      "5. CONTATTAB NETTO CTC (kpi.contattab): ATTENZIONE — due screenshot simili possono essere presenti. Devi identificare quello con filtro cluster_progetti='Selezioni multiple' (visibile nel dropdown in alto 'cluster_progetti'). NON usare quello con cluster_progetti='Tutte'. Riga 'Totale', colonna 'Contattab'. Valore tipico 60-70%.\n" +
      "   - Per distinguere: il totale Leads Gen sarà PIÙ BASSO nel cluster 'Selezioni multiple' perché esclude i lead CTC. Se vedi due tabelle con Leads Gen diversi (es. 10497 e 7934), il valore CONTATTAB va dal secondo (più basso).\n" +
      "   - Esempi valore Contattab atteso: cluster Tutte = 72,8% (NON USARE per kpi.contattab); cluster Selezioni multiple = 64,1% (USA QUESTO).\n" +
      "6. % CTC (kpi.ctc): dalla tabella Macro Fonte PICCOLA della Dashboard Economics — Recap CPL Operations (quella con SOCIAL, GOOGLE LEADS, GOOGLE CLICK, ETC). Prendi ESCLUSIVAMENTE la % della riga 'GOOGLE CLICK', colonna '% lead sul totale'. Es: se GOOGLE CLICK = 24,36%, allora kpi.ctc = 24.36. NON sommare Trabocco TLC né altre voci.\n" +
      "7. RESA, lavOra: da tabelle standard della dashboard.\n" +
      "8. hourlySett: dalla tabella Timing Chiamate, timing medio per fascia. Chiavi da 9 a 19.\n" +
      "9. macrofonti[].cpa (CRITICO — stessa regola della regola 1): per OGNI fornitore nella tabella 'Macro Fornitore' dettagliata, il campo 'cpa' dell'oggetto JSON deve essere ESCLUSIVAMENTE il valore della colonna 'CPA Totale New'. NON usare MAI la colonna 'CPA Adv' per singolo fornitore, anche se è la prima colonna CPA che vedi.\n\n" +
      "   ESEMPI CONCRETI per aiutarti:\n" +
      "   - GALANO GOOGLE CALDE: CPA Adv = €97,55 (da ignorare) · CPA Totale New = €128 → usa 128\n" +
      "   - SPINUP SOCIAL: CPA Adv = €97,07 (ignora) · CPA Totale New = €144 → usa 144\n" +
      "   - GALANO GOOGLE CTC: CPA Adv = €68,47 (ignora) · CPA Totale New = €111 → usa 111\n" +
      "   - PAOLO SOCIAL: CPA Adv = €114,23 (ignora) · CPA Totale New = €179 → usa 179\n\n" +
      "   La colonna 'CPA Totale New' è tipicamente 40-60% più alta di 'CPA Adv'. Se vedi un CPA fornitore < €90 o < colonna CPL × RED, probabilmente hai preso 'CPA Adv' per errore — rileggi.\n\n" +
      "10. macrofonti[].leads, macrofonti[].pct, macrofonti[].cpl, macrofonti[].red: dalle altre colonne della stessa tabella Macro Fornitore. Valori tipici sono: Leads in migliaia (es. 3300 settimanali), pct come stringa con decimali (es. '31.45'), cpl in € (es. 16.2), red in % (es. 16.6).\n\n" +
      "Regole generali:\n" +
      "- LEAD GENERATE e ORE giornaliere NON vengono estratte (sono calcolate dai record giornalieri).\n" +
      "- Se un valore non è presente o è '—' o vuoto, usa null.\n" +
      "- Nessuna classificazione, solo numeri grezzi.\n" +
      "- NON inventare valori. Se uno screenshot non contiene un KPI, metti null.";

    try {
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-opus-4-7",
          max_tokens: 3000,
          messages: [{ role: "user", content: [...imgContent, { type: "text", text: textPrompt }] }]
        })
      });
      const data = await res.json();
      let raw = data.content?.[0]?.text?.trim() || "";
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(raw);

      // Costruisci il record settimanale
      const newRecord = {
        id: selectedWeek.id,
        dateFrom: (() => {
          const g = String(selectedWeek.mon.getDate()).padStart(2, "0");
          const m = String(selectedWeek.mon.getMonth() + 1).padStart(2, "0");
          return g + "/" + m + "/" + selectedWeek.mon.getFullYear();
        })(),
        dateTo: satDate,
        arpu: parseFloat(arpu),
        kpi: parsed.kpi || {},
        hourlySett: parsed.hourlySett || null,
        macrofonti: parsed.macrofonti || [],
        createdAt: new Date().toISOString()
      };

      // Salva record settimanale
      const saveRes = await kvSaveRecordSett(newRecord);
      if (!saveRes.ok) {
        setExtractMsg("⚠️ Errore salvataggio: " + (saveRes.error || "sconosciuto"));
        setExtracting(false);
        return;
      }

      // Salva tobeSabato
      const newSabato = { date: satDate, lead: parseInt(tobeSatLead), ore: parseInt(tobeSatOre) };
      const saveTsRes = await kvSaveTobeSabato(satDate, newSabato.lead, newSabato.ore);
      if (!saveTsRes.ok) {
        setExtractMsg("⚠️ Record salvato ma errore TO BE sabato.");
      }

      setExtractMsg("✓ Dati settimanali salvati.");
      setExtracting(false);
      setTimeout(() => onSaved(newRecord, newSabato), 500);
    } catch (e) {
      setExtractMsg("⚠️ Errore: " + e.message);
      setExtracting(false);
    }
  };

  return (
    <div style={{
      padding: "20px",
      background: "rgba(253,111,59,0.08)",
      border: "1px solid rgba(253,111,59,0.3)",
      borderRadius: "8px",
      marginBottom: "20px"
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "1.5px", color: O, marginBottom: "14px" }}>CARICA DATI SETTIMANALI</div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", fontSize: "10px", letterSpacing: "1px", color: O, marginBottom: "4px" }}>SETTIMANA</label>
          <select value={weekId} onChange={e => setWeekId(e.target.value)} style={{
            width: "100%", padding: "8px 10px", background: "#1a1232", border: "1px solid " + BD, color: "#fff", borderRadius: "4px", fontSize: "13px"
          }}>
            {weekOptions.map(w => {
              const label = String(w.mon.getDate()).padStart(2, "0") + "/" + String(w.mon.getMonth() + 1).padStart(2, "0") + "-" +
                            String(w.sat.getDate()).padStart(2, "0") + "/" + String(w.sat.getMonth() + 1).padStart(2, "0");
              return <option key={w.id} value={w.id}>{label}</option>;
            })}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={{ display: "block", fontSize: "10px", letterSpacing: "1px", color: O, marginBottom: "4px" }}>TO BE SABATO — LEAD</label>
          <input type="number" value={tobeSatLead} onChange={e => setTobeSatLead(e.target.value)} placeholder="es. 1200" style={{
            width: "100%", padding: "8px 10px", background: "#1a1232", border: "1px solid " + BD, color: "#fff", borderRadius: "4px", fontSize: "13px"
          }} />
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={{ display: "block", fontSize: "10px", letterSpacing: "1px", color: O, marginBottom: "4px" }}>TO BE SABATO — ORE</label>
          <input type="number" value={tobeSatOre} onChange={e => setTobeSatOre(e.target.value)} placeholder="es. 400" style={{
            width: "100%", padding: "8px 10px", background: "#1a1232", border: "1px solid " + BD, color: "#fff", borderRadius: "4px", fontSize: "13px"
          }} />
        </div>
        <div style={{ flex: 1, minWidth: "140px" }}>
          <label style={{ display: "block", fontSize: "10px", letterSpacing: "1px", color: O, marginBottom: "4px" }}>ARPU (€)</label>
          <input type="number" value={arpu} onChange={e => setArpu(e.target.value)} placeholder="es. 145" style={{
            width: "100%", padding: "8px 10px", background: "#1a1232", border: "1px solid " + BD, color: "#fff", borderRadius: "4px", fontSize: "13px"
          }} />
          <div style={{ fontSize: "11px", color: "#8a7ca8", marginTop: "4px", fontStyle: "italic" }}>
            Ultimo usato: €{lastArpu}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={e => handleFilesUpload(e.target.files)}
          style={{ display: "none" }}
          id="weekly-upload-input"
        />
        <label htmlFor="weekly-upload-input" style={{
          display: "block",
          padding: "24px",
          textAlign: "center",
          background: "#1a1232",
          border: "2px dashed " + BD,
          borderRadius: "6px",
          color: "#8a7ca8",
          cursor: "pointer",
          fontSize: "12px"
        }}>
          📷 Clicca per selezionare screenshot Power BI (filtro settimanale)
        </label>
        {screens.length > 0 && (
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#c4b8e3" }}>
            {screens.length} screenshot caricati: {screens.map(s => s.name).join(", ")}
          </div>
        )}
      </div>

      {extractMsg && (
        <div style={{
          padding: "10px",
          marginBottom: "10px",
          background: extractMsg.startsWith("✓") ? "rgba(76,175,80,0.1)" : extractMsg.startsWith("⚠️") ? "rgba(224,62,62,0.1)" : "rgba(102,76,205,0.1)",
          color: extractMsg.startsWith("✓") ? "#6bcf5e" : extractMsg.startsWith("⚠️") ? "#ff6b6b" : "#c4b8e3",
          borderRadius: "4px",
          fontSize: "12px"
        }}>{extractMsg}</div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleExtract}
          disabled={extracting}
          style={{
            padding: "10px 20px",
            background: extracting ? "#8a7ca8" : O,
            border: "none",
            color: "#fff",
            borderRadius: "6px",
            cursor: extracting ? "not-allowed" : "pointer",
            fontSize: "13px"
          }}>
          {extracting ? "Estrazione..." : "Estrai e Salva"}
        </button>
        <button
          onClick={onClose}
          disabled={extracting}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid " + BD,
            color: "#c4b8e3",
            borderRadius: "6px",
            cursor: extracting ? "not-allowed" : "pointer",
            fontSize: "13px"
          }}>
          Annulla
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── WEEKLY VIEW: visualizzazione dati settimana caricata ──
// ═══════════════════════════════════════════════════════════════
function WeeklyView({ record, tobeSabati, records, activeWeek }) {
  // Calcolo Lead/gg e Ore/gg dalla media dei record giornalieri SOLO lun-ven
  // Il sabato è gestito separatamente in una sezione a parte
  const fmtDDMM = (d) => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");

  // Chiavi giorni: 5 lun-ven e 1 sabato
  const lunVenKeys = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(activeWeek.mon);
    d.setDate(activeWeek.mon.getDate() + i);
    lunVenKeys.push(fmtDDMM(d));
  }
  const satKey = fmtDDMM(activeWeek.sat);

  const lunVenRecords = records.filter(r => lunVenKeys.includes(r.date));
  const satRecord = records.find(r => r.date === satKey);

  // Media lun-ven
  const avgLeadGg = lunVenRecords.length > 0
    ? Math.round(lunVenRecords.reduce((s, r) => s + (parseInt(r.leadGen) || 0), 0) / lunVenRecords.length)
    : null;
  const avgOreGg = lunVenRecords.length > 0
    ? Math.round(lunVenRecords.reduce((s, r) => s + (parseFloat(r.ore) || 0), 0) / lunVenRecords.length)
    : null;

  // TO BE lun-ven medio
  const tobeLunVenLead = lunVenRecords.reduce((s, r) => s + (parseInt(r.leadToBe) || 0), 0);
  const tobeLunVenOre = lunVenRecords.reduce((s, r) => s + (parseFloat(r.oreDich) || 0), 0);
  const avgTobeLeadGg = lunVenRecords.length > 0 && tobeLunVenLead > 0 ? Math.round(tobeLunVenLead / lunVenRecords.length) : null;
  const avgTobeOreGg = lunVenRecords.length > 0 && tobeLunVenOre > 0 ? Math.round(tobeLunVenOre / lunVenRecords.length) : null;

  // TO BE sabato (già memorizzato in tobeSabati con formato GG/MM/YYYY)
  const satStr = String(activeWeek.sat.getDate()).padStart(2, "0") + "/" + String(activeWeek.sat.getMonth() + 1).padStart(2, "0") + "/" + activeWeek.sat.getFullYear();
  const sabato = tobeSabati.find(t => t.date === satStr);

  // Dati effettivi sabato (dal record giornaliero)
  const satLeadEff = satRecord ? parseInt(satRecord.leadGen) || null : null;
  const satOreEff = satRecord ? parseFloat(satRecord.ore) || null : null;

  const k = record.kpi || {};

  // ── CALCOLO MACROFORNITORI LUN-VEN ──
  // Per ogni fornitore: media lead/gg, TO BE/gg, delta — tutto dai record giornalieri lun-ven
  const macroAggregates = {};
  if (record.macrofonti && record.macrofonti.length > 0) {
    record.macrofonti.forEach(m => {
      macroAggregates[m.name] = {
        name: m.name,
        leadsSum: 0,   // somma lead giornalieri lun-ven
        daysWithData: 0,
        tobeSum: 0,    // somma TO BE giornalieri lun-ven
        daysWithTobe: 0,
        cpl: m.cpl,
        red: m.red,
        cpa: m.cpa,
        pctRaw: parseFloat((m.pct || "0").replace(",", ".")) || 0
      };
    });
  }

  // Accumulo dai record lun-ven
  lunVenRecords.forEach(r => {
    // Leads giornalieri da macrofonti del record
    if (r.macrofonti && Array.isArray(r.macrofonti)) {
      r.macrofonti.forEach(mf => {
        if (macroAggregates[mf.name]) {
          const leads = parseInt(mf.leads) || 0;
          if (leads > 0) {
            macroAggregates[mf.name].leadsSum += leads;
            macroAggregates[mf.name].daysWithData += 1;
          }
        }
      });
    }
    // TO BE giornalieri da getMacroToBe
    const macroToBe = getMacroToBe(r.date);
    if (macroToBe) {
      Object.keys(macroToBe).forEach(name => {
        if (macroAggregates[name]) {
          macroAggregates[name].tobeSum += macroToBe[name];
          macroAggregates[name].daysWithTobe += 1;
        }
      });
    }
  });

  // Calcolo medie e % ricalibrata
  const macroRows = Object.values(macroAggregates).map(agg => {
    const avgLead = agg.daysWithData > 0 ? Math.round(agg.leadsSum / agg.daysWithData) : null;
    const avgTobe = agg.daysWithTobe > 0 ? Math.round(agg.tobeSum / agg.daysWithTobe) : null;
    const delta = (avgLead !== null && avgTobe !== null && avgTobe > 0)
      ? ((avgLead - avgTobe) / avgTobe) * 100
      : null;
    return { ...agg, avgLead, avgTobe, delta };
  });

  // Ricalcolo % sul totale lun-ven (somma lead/gg di tutti i fornitori principali)
  const totalAvgLead = macroRows.reduce((s, r) => s + (r.avgLead || 0), 0);
  macroRows.forEach(r => {
    r.pctLunVen = totalAvgLead > 0 && r.avgLead !== null
      ? ((r.avgLead / totalAvgLead) * 100)
      : null;
  });

  // Helper: formatta delta con segno e colore
  const fmtDelta = (actual, target) => {
    if (actual == null || target == null || target === 0) return { text: "—", color: "#8a7ca8" };
    const pct = ((actual - target) / target) * 100;
    const color = pct >= 0 ? "#6bcf5e" : "#ff6b6b";
    const sign = pct >= 0 ? "+" : "";
    return { text: sign + pct.toFixed(1) + "%", color };
  };
  const deltaLead = fmtDelta(avgLeadGg, avgTobeLeadGg);
  const deltaOre = fmtDelta(avgOreGg, avgTobeOreGg);
  const deltaLav = k.lavOra != null ? fmtDelta(k.lavOra, 2.53) : { text: "—", color: "#8a7ca8" };
  const deltaRed = k.red != null ? fmtDelta(k.red, 17) : { text: "—", color: "#8a7ca8" };
  const deltaResa = k.resa != null ? fmtDelta(k.resa, 0.45) : { text: "—", color: "#8a7ca8" };
  const deltaCtc = k.ctc != null ? fmtDelta(k.ctc, 25) : { text: "—", color: "#8a7ca8" };
  const deltaCpl = k.cpl != null ? { ...fmtDelta(k.cpl, 12.5), color: k.cpl <= 12.5 ? "#6bcf5e" : "#ff6b6b" } : { text: "—", color: "#8a7ca8" };
  const deltaCpa = k.cpa != null ? { ...fmtDelta(k.cpa, 100), color: k.cpa <= 100 ? "#6bcf5e" : "#ff6b6b" } : { text: "—", color: "#8a7ca8" };
  const deltaContattab = k.contattab != null ? fmtDelta(k.contattab, 60) : { text: "—", color: "#8a7ca8" };
  const deltaTiming = k.timing != null
    ? (k.timing >= 90 && k.timing <= 97.99 ? { text: "in range", color: "#6bcf5e" } : { text: k.timing + "% fuori", color: "#ff6b6b" })
    : { text: "—", color: "#8a7ca8" };



  return (
    <>
      <div style={{ display: "flex", gap: "18px", marginBottom: "18px", alignItems: "stretch" }}>
        <div style={{ ...cardCss, marginBottom: 0, flex: "1 1 65%" }}>
          <div style={{ ...secCss, color: P, marginBottom: "12px" }}>
            KPI Settimana {fmtDDMM(activeWeek.mon)}-{fmtDDMM(activeWeek.sat)} (lun-ven)
          </div>
          <div style={{ fontSize: "11px", color: "#8a7ca8", marginBottom: "12px" }}>
            Lead/Ore = media giornaliera lun-ven · Altri KPI da screenshot settimanale · ARPU: €{record.arpu}
          </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid " + BD }}>
              <th style={{ textAlign: "left", padding: "5px 8px", fontSize: "9px", color: "#8a7ca8", textTransform: "uppercase", letterSpacing: "1px" }}>KPI</th>
              <th style={{ textAlign: "left", padding: "5px 8px", fontSize: "9px", color: "#8a7ca8", textTransform: "uppercase", letterSpacing: "1px" }}>Valore settimana</th>
              <th style={{ textAlign: "left", padding: "5px 8px", fontSize: "9px", color: "#8a7ca8", textTransform: "uppercase", letterSpacing: "1px" }}>Target</th>
              <th style={{ textAlign: "right", padding: "5px 8px", fontSize: "9px", color: "#8a7ca8", textTransform: "uppercase", letterSpacing: "1px" }}>Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>LEAD GENERATE / gg</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{avgLeadGg !== null ? avgLeadGg.toLocaleString() : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>{avgTobeLeadGg !== null ? avgTobeLeadGg.toLocaleString() + " TO BE" : "—"}</td>
                <td style={{ padding: "5px 8px", color: deltaLead.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaLead.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>ORE / gg</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{avgOreGg !== null ? avgOreGg.toLocaleString() : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>{avgTobeOreGg !== null ? avgTobeOreGg + " TO BE" : "—"}</td>
                <td style={{ padding: "5px 8px", color: deltaOre.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaOre.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>LAV/ORA</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.lavOra ?? "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>2,53 target</td>
                <td style={{ padding: "5px 8px", color: deltaLav.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaLav.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>RED</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.red != null ? k.red + "%" : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>17,0% target</td>
                <td style={{ padding: "5px 8px", color: deltaRed.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaRed.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>RESA</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.resa ?? "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>0,45 target</td>
                <td style={{ padding: "5px 8px", color: deltaResa.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaResa.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>% CTC</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.ctc != null ? k.ctc + "%" : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>≥25% target</td>
                <td style={{ padding: "5px 8px", color: deltaCtc.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaCtc.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>TIMING 1-5min</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.timing != null ? k.timing + "%" : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>90-97,99% range</td>
                <td style={{ padding: "5px 8px", color: deltaTiming.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaTiming.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>CONTATTAB. NETTO CTC</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.contattab != null ? k.contattab + "%" : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>60% target</td>
                <td style={{ padding: "5px 8px", color: deltaContattab.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaContattab.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>CPL</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.cpl != null ? k.cpl + "€" : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>12,5€ target</td>
                <td style={{ padding: "5px 8px", color: deltaCpl.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaCpl.text}</td></tr>
            <tr><td style={{ padding: "5px 8px", color: O, fontWeight: 500, fontSize: "12px" }}>CPA</td>
                <td style={{ padding: "5px 8px", color: "#fff", fontWeight: 600, fontSize: "13px" }}>{k.cpa != null ? k.cpa + "€" : "—"}</td>
                <td style={{ padding: "5px 8px", color: "#8a7ca8", fontSize: "11px" }}>100€ target</td>
                <td style={{ padding: "5px 8px", color: deltaCpa.color, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaCpa.text}</td></tr>
          </tbody>
        </table>
        </div>

        {/* BOX SABATO */}
        <div style={{ ...cardCss, marginBottom: 0, flex: "1 1 32%", background: "rgba(253,111,59,0.05)", borderColor: "rgba(253,111,59,0.25)" }}>
          <div style={{ ...secCss, color: O, marginBottom: "12px" }}>
            Sabato {fmtDDMM(activeWeek.sat)}
          </div>
          <div style={{ fontSize: "11px", color: "#8a7ca8", marginBottom: "14px" }}>
            Gestito separatamente per ore ridotte
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 4px", color: O, fontSize: "12px", fontWeight: 500 }}>LEAD</td>
                <td style={{ padding: "8px 4px", color: "#fff", fontSize: "14px", fontWeight: 600, textAlign: "right" }}>
                  {satLeadEff !== null ? satLeadEff.toLocaleString() : "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px", color: "#8a7ca8", fontSize: "11px" }}>TO BE</td>
                <td style={{ padding: "4px", color: "#8a7ca8", fontSize: "11px", textAlign: "right" }}>
                  {sabato ? sabato.lead.toLocaleString() : "non impostato"}
                </td>
              </tr>
              <tr><td colSpan="2" style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}></td></tr>
              <tr>
                <td style={{ padding: "8px 4px", color: O, fontSize: "12px", fontWeight: 500 }}>ORE</td>
                <td style={{ padding: "8px 4px", color: "#fff", fontSize: "14px", fontWeight: 600, textAlign: "right" }}>
                  {satOreEff !== null ? satOreEff.toLocaleString() : "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px", color: "#8a7ca8", fontSize: "11px" }}>TO BE</td>
                <td style={{ padding: "4px", color: "#8a7ca8", fontSize: "11px", textAlign: "right" }}>
                  {sabato ? sabato.ore.toLocaleString() : "non impostato"}
                </td>
              </tr>
              {sabato && satLeadEff !== null && (
                <tr>
                  <td colSpan="2" style={{ paddingTop: "12px", fontSize: "11px", color: "#8a7ca8", textAlign: "center" }}>
                    Delta lead: <span style={{ color: satLeadEff >= sabato.lead ? "#6bcf5e" : "#ff6b6b" }}>
                      {satLeadEff >= sabato.lead ? "+" : ""}{(((satLeadEff - sabato.lead) / sabato.lead) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={cardCss}>
        <div style={{ ...secCss, color: O, marginBottom: "12px" }}>— Macrofornitori settimana (media lun-ven) —</div>
        {macroRows.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid " + BD }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>Fornitore</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>Lead/gg</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>TO BE/gg</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>Δ vs TO BE</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>% tot</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>CPL</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>RED</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "10px", color: "#8a7ca8" }}>CPA</th>
              </tr>
            </thead>
            <tbody>
              {macroRows.map((m, idx) => {
                const deltaColor = m.delta === null ? "#8a7ca8" : (m.delta >= 0 ? "#6bcf5e" : "#ff6b6b");
                const deltaTxt = m.delta === null ? "—" : ((m.delta >= 0 ? "+" : "") + m.delta.toFixed(1) + "%");
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "7px 8px", color: "#fff", fontSize: "12px" }}>{m.name}</td>
                    <td style={{ padding: "7px 8px", color: "#fff", fontSize: "12px", textAlign: "right" }}>{m.avgLead !== null ? m.avgLead.toLocaleString() : "—"}</td>
                    <td style={{ padding: "7px 8px", color: "#8a7ca8", fontSize: "12px", textAlign: "right" }}>{m.avgTobe !== null ? m.avgTobe.toLocaleString() : "—"}</td>
                    <td style={{ padding: "7px 8px", color: deltaColor, fontSize: "12px", textAlign: "right", fontWeight: 500 }}>{deltaTxt}</td>
                    <td style={{ padding: "7px 8px", color: "#fff", fontSize: "12px", textAlign: "right" }}>{m.pctLunVen !== null ? m.pctLunVen.toFixed(1) + "%" : "—"}</td>
                    <td style={{ padding: "7px 8px", color: "#fff", fontSize: "12px", textAlign: "right" }}>{m.cpl ? "€" + m.cpl : "—"}</td>
                    <td style={{ padding: "7px 8px", color: "#fff", fontSize: "12px", textAlign: "right" }}>{m.red ? m.red + "%" : "—"}</td>
                    <td style={{ padding: "7px 8px", color: "#fff", fontSize: "12px", textAlign: "right" }}>{m.cpa ? "€" + m.cpa : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div style={{ padding: "20px", textAlign: "center", color: "#8a7ca8", fontSize: "12px" }}>Nessun macrofornitore estratto</div>}
      </div>

      <div style={{
        padding: "14px",
        background: "rgba(102,76,205,0.08)",
        border: "1px solid rgba(102,76,205,0.25)",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#c4b8e3",
        lineHeight: "1.6"
      }}>
        <strong style={{color: O}}>Fase 2 completata</strong> — Dati caricati e salvati. Le prossime fasi attiveranno:<br/>
        • Sezione Timing con fasce fuori range (Fase 3)<br/>
        • Tabella Azioni correttive con Marg./lead e Indicazione (Fase 4)<br/>
        • Confronto discorsivo tra settimane (Fase 5)
      </div>
    </>
  );
}

export default function App() {
  const SEED_SORTED = [...SEED_DATA].sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));
  const [records, setRecords] = useState(SEED_SORTED);
  const [form, setForm] = useState(emptyForm());
  const [view, setView] = useState("form");
  const [saved, setSaved] = useState(false);
  const [activeReport, setActiveReport] = useState(SEED_SORTED[0]);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [screens, setScreens] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState("");
  const [pbiScreens, setPbiScreens] = useState([]);
  const [pbiExtracting, setPbiExtracting] = useState(false);
  const [pbiExtractMsg, setPbiExtractMsg] = useState("");
  const [pbiPeriods, setPbiPeriods] = useState(null);
  // ── STATO SETTIMANE ──
  const [recordsSett, setRecordsSett] = useState([]);
  const [tobeSabati, setTobeSabati] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  const [formChatMsgs, setFormChatMsgs] = useState([]);
  const [formChatInput, setFormChatInput] = useState("");
  const [formChatLoading, setFormChatLoading] = useState(false);
  const [formChatScreens, setFormChatScreens] = useState([]);
  const [importMsg, setImportMsg] = useState("");
  const [selectedMese, setSelectedMese] = useState("");

  const PBI_SEED = {
    "16/03-20/03": {
      label: "Settimana 16/03 – 20/03",
      total: { leads: 15437, red: "17,0", cpl: "12,3", cpa: "110" },
      fornitori: [
        { name:"GALANO GOOGLE CALDE", leads:5377, pct:"34,83", red:"18,1", cpl:"15,5", cpa:"115" },
        { name:"SPINUP SOCIAL",       leads:4261, pct:"27,60", red:"13,0", cpl:"10,1", cpa:"119" },
        { name:"GALANO GOOGLE CTC",   leads:2637, pct:"17,08", red:"23,7", cpl:"13,5", cpa:"97"  },
        { name:"GALANO SOCIAL",       leads:1385, pct:"8,97",  red:"14,2", cpl:"9,6",  cpa:"113" },
        { name:"ETC",                 leads:689,  pct:"4,46",  red:"21,8", cpl:"5,6",  cpa:"51"  },
        { name:"PAOLO SOCIAL",        leads:651,  pct:"4,22",  red:"13,5", cpl:"12,6", cpa:"137" },
        { name:"TRABOCCO TLC",        leads:353,  pct:"2,29",  red:"6,8",  cpl:"7,8",  cpa:"231" },
        { name:"TRABOCCO A&R",        leads:81,   pct:"0,52",  red:"14,8", cpl:"—",    cpa:"72"  },
      ],
    },
  };

  // Worker KV è il database centrale

  // ── STATO LOGIN E CONNESSIONE ──
  const [loginOk, setLoginOk] = useState(false);
  const [loginPwd, setLoginPwd] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [connError, setConnError] = useState(""); // errore globale connessione
  const [migrationMsg, setMigrationMsg] = useState("");

  // Tenta auto-login con password salvata
  useEffect(() => {
    (async () => {
      const stored = getStoredPassword();
      if (stored) {
        const valid = await kvCheckPassword(stored);
        if (valid) {
          setLoginOk(true);
        } else {
          clearStoredPassword();
        }
      }
      setBootLoading(false);
    })();
  }, []);

  const handleLogin = async () => {
    setLoginErr("");
    setLoginLoading(true);
    const pwd = loginPwd.trim();
    if (!pwd) { setLoginErr("Inserisci la password"); setLoginLoading(false); return; }
    const valid = await kvCheckPassword(pwd);
    if (valid) {
      setStoredPassword(pwd);
      setLoginOk(true);
      setLoginPwd("");
    } else {
      setLoginErr("Password errata o server irraggiungibile");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    clearStoredPassword();
    setLoginOk(false);
  };

  // Caricamento dati dopo login OK
  useEffect(() => {
    if (!loginOk) return;
    (async () => {
      setConnError("");
      // 1. Prova a leggere dal KV
      const getRes = await kvGetRecords();
      if (!getRes.ok) {
        if (getRes.unauthorized) {
          setLoginOk(false);
          return;
        }
        setConnError("Impossibile contattare il server. Riprova tra qualche minuto (Ctrl+R).");
        return;
      }
      let kvRecords = getRes.records;

      // 2. Se KV vuoto → migra da localStorage (Opzione A)
      if (!kvRecords || kvRecords.length === 0) {
        try {
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            const toMigrate = Array.isArray(parsed) ? parsed.filter(r => !r.id?.endsWith("_seed")) : [];
            if (toMigrate.length > 0) {
              setMigrationMsg("Migrazione di " + toMigrate.length + " record dal browser al database...");
              const migRes = await kvSaveAllRecords(toMigrate);
              if (migRes.ok) {
                setMigrationMsg("✓ Migrati " + toMigrate.length + " record al database.");
                setTimeout(() => setMigrationMsg(""), 5000);
                kvRecords = toMigrate;
              } else {
                setMigrationMsg("⚠️ Migrazione fallita. I dati locali sono ancora nel browser.");
              }
            }
          }
        } catch(e) {}
      }

      const final = kvRecords && kvRecords.length > 0 ? mergeWithSeed(kvRecords) : mergeWithSeed([]);
      setRecords(final);
      setActiveReport(final[0]);

      // PBI
      const pbiRes = await kvGetPbi();
      if (pbiRes.ok) {
        setPbiPeriods(pbiRes.pbi && Object.keys(pbiRes.pbi).length > 0 ? pbiRes.pbi : PBI_SEED);
      } else {
        setPbiPeriods(PBI_SEED);
      }
      await loadDynamicTobeSchedule();

      // Record settimanali
      const settRes = await kvGetRecordsSett();
      if (settRes.ok) setRecordsSett(settRes.records);

      // TO BE sabati
      const tsRes = await kvGetTobeSabato();
      if (tsRes.ok) setTobeSabati(tsRes.items);
    })();
  }, [loginOk]);

  // Paste handler per la tab Inserisci
  const handleFormPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItems = Array.from(items).filter(item => item.type.startsWith("image/"));
    if (!imageItems.length) return;
    e.preventDefault();
    imageItems.forEach(item => {
      const file = item.getAsFile();
      if (!file) return;
      resizeImage(file).then(img => setScreens(prev => [...prev, { name: "paste_" + Date.now() + ".png", b64: img.b64, mime: img.mime }]));
    });
  };

  // Rimuove i flag di ereditarietà e i valori ereditati prima del salvataggio nel KV.
  // Solo valori effettivamente inseriti dall'utente devono essere persistiti.
  const sanitizeForPersist = (record) => {
    if (!record) return record;
    const clean = { ...record };
    if (clean._leadToBeInherited) { clean.leadToBe = null; }
    if (clean._oreDichInherited)  { clean.oreDich  = null; }
    delete clean._leadToBeInherited;
    delete clean._leadToBeFromDate;
    delete clean._oreDichInherited;
    delete clean._oreDichFromDate;
    return clean;
  };

  const persist = async (upd) => {
    const filtered = upd.filter(r => !r.id?.endsWith("_seed")).map(sanitizeForPersist);
    const res = await kvSaveAllRecords(filtered);
    if (!res.ok) {
      if (res.unauthorized) {
        setLoginOk(false);
      } else {
        setConnError("⚠️ Salvataggio fallito: server irraggiungibile. Riprova (Ctrl+R).");
      }
      return false;
    }
    return true;
  };
  const persistPbi = async (upd) => {
    const res = await kvSavePbi(upd);
    if (!res.ok) {
      if (res.unauthorized) {
        setLoginOk(false);
      } else {
        setConnError("⚠️ Salvataggio PBI fallito: server irraggiungibile. Riprova (Ctrl+R).");
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    const rec = { ...form, id: form.date + "_" + Date.now() };
    if (!Array.isArray(rec.hourly)) rec.hourly = [];
    const idx = records.findIndex(r => r.date === form.date);
    let upd = idx >= 0 ? records.map((r, i) => i === idx ? rec : r) : [rec, ...records];
    upd = upd.sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));
    upd = enrichWithInheritedTobe(upd);
    setRecords(upd);
    await persist(upd);
    const recEnriched = upd.find(x => x.id === rec.id) || rec;
    setActiveReport(recEnriched);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setView("report");
  };

  const filtered = records.filter(r => {
    const k = sortKey(r.date);
    const kf = rangeFrom ? sortKey(fromISO(rangeFrom)) : null;
    const kt = rangeTo ? sortKey(fromISO(rangeTo)) : null;
    if (kf && k < kf) return false;
    if (kt && k > kt) return false;
    return true;
  });

  const mergedHourly = buildMergedHourly(filtered);

  let periodAvg = null;
  if (filtered.length > 0) {
    periodAvg = {
      leads:    Math.round(filtered.reduce((s, r) => s + (toNum(r.leadGen) || 0), 0) / filtered.length),
      ore:      Math.round(filtered.reduce((s, r) => s + (toNum(r.ore) || 0), 0) / filtered.length),
      lavOra:   avgOf(filtered.map(r => r.lavOra)),
      pressione:avgOf(filtered.map(r => r.pressione)),
      timing:   avgOf(filtered.map(r => r.timing)),
      cpl:      avgOf(filtered.map(r => r.cpl)),
      cpa:      avgOf(filtered.map(r => r.cpa)),
      red:      avgOf(filtered.map(r => r.red)),
      resa:     avgOf(filtered.map(r => r.resa)),
      deltaLead:avgOf(filtered.map(r => { const v = calcPct(r.leadGen, r.leadToBe); return v ? v : null; })),
      deltaOre: avgOf(filtered.map(r => { const v = calcPct(r.ore, r.oreDich); return v ? v : null; })),
    };
  }

  const buildReportContext = (r) => buildReportCtx(r, fv, calcPct);
  const buildHistoryContext = (recs) => {
    if (!recs.length) return "Nessun dato nel periodo selezionato.";
    return "PERIODO: " + recs[recs.length-1].date + " → " + recs[0].date + "\n\n" +
      recs.map(r => buildReportCtx(r, fv, calcPct)).join("\n\n---\n\n");
  };

  const buildStoricRecap = (recs) => {
    if (!recs.length) return "";
    const n = recs.length;
    const avg = (key) => { const vals = recs.map(r => toNum(r[key])).filter(x => !isNaN(x)); return vals.length ? (vals.reduce((s,x)=>s+x,0)/vals.length) : null; };
    const avgLead = Math.round(recs.reduce((s,r)=>s+(toNum(r.leadGen)||0),0)/n);
    const avgOre  = Math.round(recs.reduce((s,r)=>s+(toNum(r.ore)||0),0)/n);
    const toBe    = recs[0].leadToBe || "3136";
    const oreDich = recs[0].oreDich  || "1368";
    const d1 = calcPct(avgLead, toNum(toBe));
    const d2 = calcPct(avgOre,  toNum(oreDich));
    const s1 = d1 !== null ? "(" + (parseFloat(d1)>=0?"+":"") + d1 + "%)" : "";
    const s2 = d2 !== null ? "(" + (parseFloat(d2)>=0?"+":"") + d2 + "%)" : "";
    const label = n === 1 ? recs[0].date : recs[n-1].date + " – " + recs[0].date;
    return [
      "CS Energia", n > 1 ? "Settimana " + label : label, "",
      "LEAD GENERATE: " + fv(avgLead) + " vs " + fv(toBe) + " TO BE " + s1,
      "ORE: " + fv(avgOre) + " vs " + fv(oreDich) + " dichiarate " + s2,
      "LAV/ORA: " + (avg("lavOra")?.toFixed(1)||"—") + " (" + fv(recs[0].lavOraMese) + " media mese)",
      "RED: " + (avg("red")?.toFixed(1)||"—") + "% (" + fv(recs[0].redMese) + "% media mese)",
      "RESA: " + (avg("resa")?.toFixed(2)||"—") + " (" + fv(recs[0].resaMese) + " media mese)",
      "% CTC: " + (avg("ctc")?.toFixed(1)||"—") + "% (" + fv(recs[0].ctcMese) + "% media mese)",
      "Timing 1-5 min (netto CTC): " + (avg("timing")?.toFixed(0)||"—") + "% (" + fv(recs[0].timingMese) + "% media mese)",
      "Contattab (netto CTC): " + (avg("contattab")?.toFixed(1)||"—") + "% (" + fv(recs[0].contattabMese) + "% media mese)",
      "CPL: " + (avg("cpl")?.toFixed(1)||"—") + "€ (" + fv(recs[0].cplMese) + "€ media mese)",
      "CPA: " + (avg("cpa")?.toFixed(0)||"—") + "€ (" + fv(recs[0].cpaMese) + "€ media mese)",
    ].join("\n");
  };

  const getPeriodKey = (recs) => {
    if (!recs.length) return null;
    const sorted = [...recs].sort((a,b) => sortKey(a.date).localeCompare(sortKey(b.date)));
    return sorted[0].date + "-" + sorted[sorted.length-1].date;
  };

  const buildMacroRecap = (recs) => {
    if (!recs.length) return "";
    const key = getPeriodKey(recs);
    const pbi = key ? (pbiPeriods || {})[key] : null;
    if (pbi) {
      const lines = ["CS Energia — Macrofornitori", pbi.label, ""];
      pbi.fornitori.forEach(mf => {
        lines.push(mf.name);
        lines.push("Leads: " + mf.leads.toLocaleString("it-IT") + " (" + mf.pct + "%) · RED: " + mf.red + "% · CPL: " + (mf.cpl !== "—" ? mf.cpl + "€" : "—") + " · CPA: " + mf.cpa + "€");
        lines.push("");
      });
      lines.push("TOTAL");
      lines.push("Leads: " + pbi.total.leads.toLocaleString("it-IT") + " · RED: " + pbi.total.red + "% · CPL: " + pbi.total.cpl + "€ · CPA: " + pbi.total.cpa + "€");
      lines.push("", "⚠️ Dati aggregati da Power BI — " + pbi.label);
      return lines.join("\n");
    }
    const recsWithM = recs.filter(r => r.macrofonti?.length > 0);
    if (!recsWithM.length) return "";
    const n = recsWithM.length;
    const label = n === 1 ? recs[0].date : recs[recs.length-1].date + " – " + recs[0].date;
    const lines = ["CS Energia — Macrofornitori", (n > 1 ? "Settimana " : "") + label, ...(n > 1 ? ["", "⚠️ Dati stimati — fornire screen PBI per valori esatti", ""] : [""])];
    const NAMES = ["GALANO GOOGLE CALDE","SPINUP SOCIAL","GALANO GOOGLE CTC","GALANO SOCIAL","ETC","PAOLO SOCIAL","TRABOCCO TLC","TRABOCCO A&R"];
    NAMES.forEach(name => {
      const rows = recsWithM.map(r => r.macrofonti.find(m => m.name.toUpperCase() === name)).filter(Boolean);
      if (!rows.length) return;
      const avgV = (key) => { const v=rows.map(r=>parseFloat((r[key]||"").replace(",","."))).filter(x=>!isNaN(x)); return v.length?(v.reduce((s,x)=>s+x,0)/v.length).toFixed(1):"—"; };
      const avgLeads = Math.round(rows.reduce((s,r)=>s+(r.leads||0),0)/rows.length);
      lines.push(name);
      lines.push("Leads: " + avgLeads + " · RED: " + avgV("red") + "% · CPL: " + avgV("cpl") + "€ · CPA: " + avgV("cpa") + "€");
      lines.push("");
    });
    const totLeads = Math.round(recs.reduce((s,r)=>s+(toNum(r.leadGen)||0),0)/recs.length);
    const totRed = (recs.map(r=>toNum(r.red)).filter(x=>!isNaN(x)).reduce((s,x)=>s+x,0)/recs.length).toFixed(1);
    const totCpl = (recs.map(r=>toNum(r.cpl)).filter(x=>!isNaN(x)).reduce((s,x)=>s+x,0)/recs.length).toFixed(1);
    const totCpa = (recs.map(r=>toNum(r.cpa)).filter(x=>!isNaN(x)).reduce((s,x)=>s+x,0)/recs.length).toFixed(0);
    lines.push("TOTAL");
    lines.push("Leads: " + totLeads + " · RED: " + totRed + "% · CPL: " + totCpl + "€ · CPA: " + totCpa + "€");
    return lines.join("\n");
  };

  const FORNITORE_NAMES = ["GALANO GOOGLE CALDE","SPINUP SOCIAL","GALANO GOOGLE CTC","GALANO SOCIAL","ETC","PAOLO SOCIAL","TRABOCCO TLC","TRABOCCO TLC TIM","TRABOCCO A&R"];

  const extractFromScreens = async () => {
    if (!screens.length) return;
    setExtracting(true); setExtractMsg("Sto analizzando gli screen…");
    try {
      const imgContent = screens.map(s => ({ type: "image", source: { type: "base64", media_type: s.mime, data: s.b64 } }));
      imgContent.push({ type: "text", text: `Sei un assistente che estrae dati KPI da screenshot di dashboard Power BI e Google Sheets per ComparaSemplice.\nAnalizza questi screenshot e restituisci SOLO un oggetto JSON con i seguenti campi (usa null se non trovato):\n{"date":"GG/MM","pressione":"es. 1,88","leadGen":"es. 3141","leadToBe":"es. 3136","ore":"es. 1187","oreDich":"es. 1368","lavOra":"es. 2,7","red":"es. 17,9","resa":"es. 0,51","ctc":"es. 20,53","trabocco":"es. 2,10","timing":"es. 91","cpl":"es. 11,8","cpa":"es. 101","lavOraMese":"es. 2,6","redMese":"es. 17,4","resaMese":"es. 0,51","ctcMese":"es. 18,65","timingMese":"es. 90","cplMese":"es. 11,4","cpaMese":"es. 103","macrofonti":[{"name":"GALANO GOOGLE CALDE","leads":1154,"pct":"36,74","cpl":"15,3","cpa":"111","red":"18,5"}]}\nRispondi SOLO con il JSON.` });
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-7", max_tokens: 1000, messages: [{ role: "user", content: imgContent }] }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setForm(f => { const updated = { ...f }; Object.keys(parsed).forEach(k => { if (k !== "macrofonti" && parsed[k] != null) updated[k] = String(parsed[k]); }); return updated; });
      setExtractMsg("✓ Campi compilati automaticamente! Verifica e correggi se necessario.");
    } catch (e) { setExtractMsg("⚠️ Errore nell'estrazione. Compila i campi manualmente."); }
    setExtracting(false);
  };

  const extractPbiFromScreens = async () => {
    if (!pbiScreens.length) return;
    setPbiExtracting(true); setPbiExtractMsg("Sto analizzando lo screen PBI…");
    try {
      const imgContent = pbiScreens.map(s => ({ type: "image", source: { type: "base64", media_type: s.mime, data: s.b64 } }));
      imgContent.push({ type: "text", text: `Analizza questo screenshot Power BI della dashboard "Recap CPL Operations" di ComparaSemplice.\nEstrai i dati della tabella Macro Fornitore e restituisci SOLO un oggetto JSON:\n{"dateFrom":"GG/MM","dateTo":"GG/MM","total":{"leads":15437,"red":"17,0","cpl":"12,3","cpa":"110"},"fornitori":[{"name":"GALANO GOOGLE CALDE","leads":5377,"pct":"34,83","red":"18,1","cpl":"15,5","cpa":"115"}]}\nRispondi SOLO con il JSON.` });
      const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-opus-4-7", max_tokens: 1000, messages: [{ role: "user", content: imgContent }] }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const key = parsed.dateFrom + "-" + parsed.dateTo;
      const label = parsed.dateFrom === parsed.dateTo ? parsed.dateFrom : "Settimana " + parsed.dateFrom + " – " + parsed.dateTo;
      const newEntry = { label, total: parsed.total, fornitori: parsed.fornitori };
      const updated = { ...(pbiPeriods || PBI_SEED), [key]: newEntry };
      setPbiPeriods(updated);
      await persistPbi(updated);
      setPbiScreens([]);
      setPbiExtractMsg("✓ Dati PBI salvati per il periodo " + label + "!");
    } catch (e) { setPbiExtractMsg("⚠️ Errore nell'estrazione. Riprova o inserisci i dati manualmente."); }
    setPbiExtracting(false);
  };

  // ── VIEWS ──
  const renderNav = () => {
    const exportJSON = () => {
      const payload = {
        exportedAt: new Date().toISOString(),
        storageKey: STORAGE_KEY,
        records: records,
        pbiPeriods: pbiPeriods || {},
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cs_energia_tracker_" + new Date().toISOString().slice(0,10) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
    <div style={{ background: "linear-gradient(135deg,#1a1540,#0d0b1e)", borderBottom: "3px solid " + P, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
      <div style={{ padding: "20px 0 18px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: O, fontFamily: FF, textTransform: "uppercase", marginBottom: "4px" }}>ComparaSemplice · Marketing</div>
        <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fff", fontFamily: FF }}>CS ENERGIA <span style={{ color: O }}>—</span> Report Tracker</div>
      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "4px", padding: "6px", background: "#0d0b1e", borderRadius: "10px" }}>
          <NavBtn label="＋ Inserisci" active={view === "form"} onClick={() => setView("form")} />
          <NavBtn label="Report Giorno" active={view === "report"} onClick={() => setView("report")} />
          <NavBtn label="Report Settimana" active={view === "history"} onClick={() => setView("history")} />
          <NavBtn label="Report Mese" active={view === "mese"} onClick={() => setView("mese")} />
          <NavBtn label="Storico Macrofonti" active={view === "macro"} onClick={() => setView("macro")} />
        </div>
        <button onClick={exportJSON} title={"Esporta tutti i " + records.length + " giorni come JSON per ricreare il tracker in un'altra chat"} style={{ background: "transparent", border: "1px solid " + P + "88", borderRadius: "8px", padding: "9px 14px", fontSize: "12px", fontFamily: FF, color: "#c4b8ff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          ⬇ Esporta JSON <span style={{ fontSize: "10px", color: MU }}>({records.length} giorni)</span>
        </button>
      </div>
    </div>
    );
  };

  const renderForm = () => (
    <div onPaste={(e) => { handleFormPaste(e); }} style={{ padding: "28px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ ...secCss, color: P, marginBottom: 0 }}>▌ Inserisci dati — giorno precedente</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <PrimaryBtn onClick={handleSubmit}>{saved ? "✓ Salvato!" : "Salva & Genera Report"}</PrimaryBtn>
          <OutlineBtn onClick={() => setForm(emptyForm())}>Reset</OutlineBtn>
        </div>
      </div>

      <QuickInsert
        onSaved={(updated) => { setRecords(updated); setActiveReport(updated[0]); }}
        onExtracted={(parsed) => {
          // Quando l'AI estrae i dati, popolo il form principale con i dati estratti.
          // Così se l'utente clicca "Salva & Genera Report" (pulsante form), salva i dati giusti e non un record vuoto con la data sbagliata.
          setForm(f => {
            const updated = { ...f };
            if (parsed.date) updated.date = parsed.date;
            // Copio tutti i campi scalari estratti
            Object.keys(parsed).forEach(k => {
              if (k === "macrofonti" || k === "macrofontiMese") return;
              if (parsed[k] != null && parsed[k] !== "") updated[k] = String(parsed[k]);
            });
            // Macrofonti/macrofontiMese sono array, li copio interi se presenti
            if (Array.isArray(parsed.macrofonti) && parsed.macrofonti.length > 0) {
              updated.macrofonti = parsed.macrofonti;
            }
            if (Array.isArray(parsed.macrofontiMese) && parsed.macrofontiMese.length > 0) {
              updated.macrofontiMese = parsed.macrofontiMese;
            }
            // hourly (tabella oraria) — array di oggetti ora-per-ora
            if (Array.isArray(parsed.hourly) && parsed.hourly.length > 0) {
              updated.hourly = parsed.hourly;
            }
            // hourlyMese (oggetto {ora: timing%} mese)
            if (parsed.hourlyMese && typeof parsed.hourlyMese === "object") {
              updated.hourlyMese = parsed.hourlyMese;
            }
            return updated;
          });
        }}
      />
      {/* TO BE UPLOAD */}
      <TobePlanningUpload records={records} setRecords={setRecords} persist={persist} />
      {/* FORM CHAT — verifica dati */}
      {(() => {
        const buildFormContext = () => {
          const filled = METRICS.filter(m => form[m.key] && form[m.key] !== "").map(m => m.label + ": " + form[m.key]);
          const empty  = METRICS.filter(m => !form[m.key] || form[m.key] === "").map(m => m.label);
          const filledM = METRICS_MESE.filter(m => form[m.key] && form[m.key] !== "").map(m => m.label + ": " + form[m.key]);
          const emptyM  = METRICS_MESE.filter(m => !form[m.key] || form[m.key] === "").map(m => m.label);
          const existing = records.find(r => r.date === form.date);
          return [
            "GIORNO IN INSERIMENTO: " + (form.date || "non specificato"),
            existing ? "⚠️ Questo giorno è già presente nel tracker." : "Giorno non ancora salvato.",
            "",
            "CAMPI COMPILATI (" + filled.length + "/" + METRICS.length + "):",
            filled.length > 0 ? filled.join(" | ") : "— nessuno —",
            "",
            "CAMPI VUOTI: " + (empty.length > 0 ? empty.join(", ") : "nessuno"),
            "",
            "MEDIA MESE compilata (" + filledM.length + "/" + METRICS_MESE.length + "):",
            filledM.length > 0 ? filledM.join(" | ") : "— nessuno —",
            "",
            "MEDIA MESE vuota: " + (emptyM.length > 0 ? emptyM.join(", ") : "nessuno"),
            "",
            "MACROFONTI: " + (form.macrofonti && form.macrofonti.length > 0 ? form.macrofonti.length + " fornitori caricati" : "non caricate"),
          ].join("\n");
        };

        const systemPrompt = `Sei l'assistente AI del Direttore Marketing di ComparaSemplice.it.
Stai aiutando a verificare i dati in fase di inserimento nel CS Energia Report Tracker.

I dati richiesti per ogni giorno sono:
- KPI giornalieri: PRESSIONE, LEAD GENERATE, LEAD TO BE, ORE effettive, ORE dichiarate, LAV/ORA, RED, RESA, % CTC, Trabocco TLC, TIMING 1-5min, CPL, CPA
- Media mese: LAV/ORA, RED, RESA, % CTC, TIMING, CPL, CPA
- Macrofonti: almeno i principali fornitori (Galano Google Calde, Galano Google CTC, Spinup Social, Galano Social, ETC, Paolo Social)

Le fonti standard per i dati sono:
- PRESSIONE, LEAD GENERATE, RED, CPL, CPA, Macrofonti → Dashboard Economics / Recap CPL Operations (Power BI)
- ORE effettive → Pianificazione Leads Ore (Power BI)
- LAV/ORA → Leads/ora e PDA per Area (Power BI)
- RESA → Resa per Area (Power BI)
- TIMING, CONTATTABILITÀ, DURATA MEDIA → Dashboard Marketing (Power BI) / Tabella riassuntiva
- LEAD TO BE, ORE dichiarate → Google Sheets Curva Generazione

Stato attuale del form:
${buildFormContext()}

Rispondi in italiano, in modo diretto e operativo. Se mancano dati, indica esattamente quali e da quale dashboard recuperarli.`;

        const loadFormChatScreens = (files) => {
          Array.from(files).forEach(file => {
            resizeImage(file).then(img => setFormChatScreens(prev => [...prev, { b64: img.b64, mime: img.mime, name: file.name }]));
          });
        };

        const sendFormChat = async (text) => {
          if (!text.trim() || formChatLoading) return;
          const imgContent = formChatScreens.map(s => ({
            type: "image", source: { type: "base64", media_type: s.mime, data: s.b64 }
          }));
          const userContent = imgContent.length > 0
            ? [...imgContent, { type: "text", text: text.trim() }]
            : text.trim();
          const userMsg = { role: "user", content: userContent };
          const newMsgs = [...formChatMsgs, userMsg];
          setFormChatMsgs(newMsgs); setFormChatInput(""); setFormChatScreens([]); setFormChatLoading(true);
          try {
            const res = await fetch("https://cs-energia-proxy.roberta-esposito.workers.dev", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514", max_tokens: 600,
                system: systemPrompt,
                messages: newMsgs,
              }),
            });
            const data = await res.json();
            const reply = data.content?.[0]?.text?.trim() || "Errore nella risposta.";
            setFormChatMsgs([...newMsgs, { role: "assistant", content: reply }]);
          } catch (e) {
            setFormChatMsgs([...newMsgs, { role: "assistant", content: "Errore di connessione." }]);
          }
          setFormChatLoading(false);
        };

        const canSend = (formChatInput.trim() || formChatScreens.length > 0) && !formChatLoading;
        const quickQuestions = [
          "Sono completi i dati per " + (form.date || "questo giorno") + "?",
          "Cosa mi manca rispetto ai dati standard?",
          "Da quale dashboard recupero i dati mancanti?",
        ];

        return (
          <div style={{ ...cardCss, borderColor: P + "66", borderWidth: "2px", marginTop: "0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🤖</div>
              <div>
                <div style={{ ...secCss, color: P, marginBottom: "2px" }}>Verifica dati con AI</div>
                <div style={{ fontSize: "12px", color: MU, fontFamily: FF }}>Chiedi se i dati caricati sono completi, cosa manca, da dove recuperarli</div>
              </div>
            </div>

            {/* Messaggi */}
            {formChatMsgs.length > 0 && (
              <div style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px", padding: "4px 0" }}>
                {formChatMsgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: m.role === "user" ? O : P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>
                      {m.role === "user" ? "👤" : "🤖"}
                    </div>
                    <div style={{ background: m.role === "user" ? O+"22" : P+"22", border: "1px solid "+(m.role==="user"?O+"33":P+"33"), borderRadius: "10px", padding: "9px 13px", maxWidth: "85%", fontSize: "13px", fontFamily: FF, color: TX, lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                      {typeof m.content === "string" ? m.content : m.content.filter(b=>b.type==="text").map(b=>b.text).join("")}
                    </div>
                  </div>
                ))}
                {formChatLoading && (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: P, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🤖</div>
                    <div style={{ background: P+"22", border: "1px solid "+P+"33", borderRadius: "10px", padding: "9px 13px", fontSize: "13px", fontFamily: FF, color: MU }}>Sto verificando…</div>
                  </div>
                )}
              </div>
            )}

            {/* Quick questions */}
            {formChatMsgs.length === 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                {quickQuestions.map((q, i) => (
                  <button key={i} onClick={() => sendFormChat(q)}
                    style={{ background: P+"18", border: "1px solid "+P+"44", borderRadius: "7px", padding: "8px 12px", color: "#c4b8ff", fontSize: "12px", fontFamily: FF, cursor: "pointer", textAlign: "left" }}>
                    💬 {q}
                  </button>
                ))}
              </div>
            )}

            {/* Thumbnail allegati */}
            {formChatScreens.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px", padding: "8px 10px", background: P+"0f", borderRadius: "8px", border: "1px solid "+P+"22" }}>
                {formChatScreens.map((s, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={"data:"+s.mime+";base64,"+s.b64} alt={s.name}
                      style={{ height: "40px", borderRadius: "5px", border: "1px solid "+P+"44", objectFit: "cover" }} />
                    <button onClick={() => setFormChatScreens(prev => prev.filter((_,j)=>j!==i))}
                      style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ff5c5c", border: "none", borderRadius: "50%", width: "15px", height: "15px", fontSize: "8px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                ))}
                <span style={{ fontSize: "11px", color: MU, fontFamily: FF, alignSelf: "center", fontStyle: "italic" }}>allegati al prossimo messaggio</span>
              </div>
            )}

            {/* Input */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {formChatMsgs.length > 0 && (
                <button onClick={() => { setFormChatMsgs([]); setFormChatScreens([]); }} style={{ background: "transparent", border: "1px solid "+BD, borderRadius: "7px", color: MU, padding: "9px 10px", fontSize: "12px", fontFamily: FF, cursor: "pointer" }} title="Reset">↺</button>
              )}
              {/* Attach button */}
              <label title="Allega screenshot (o incolla con Ctrl+V)" style={{ cursor: "pointer", flexShrink: 0 }}>
                <div style={{ background: P+"22", border: "1px solid "+P+"55", borderRadius: "7px", padding: "9px 11px", fontSize: "15px", lineHeight: 1 }}>📎</div>
                <input type="file" accept="image/*" multiple onChange={e => loadFormChatScreens(e.target.files)} style={{ display: "none" }} />
              </label>
              <input
                style={{ flex: 1, background: CARD2, border: "1px solid "+P+"44", borderRadius: "7px", color: TX, padding: "9px 13px", fontFamily: FF, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                value={formChatInput}
                onChange={e => setFormChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && canSend) sendFormChat(formChatInput); }}
                onPaste={e => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  const imgs = Array.from(items).filter(it => it.type.startsWith("image/"));
                  if (!imgs.length) return;
                  e.preventDefault();
                  imgs.forEach(it => { const file = it.getAsFile(); if (!file) return; resizeImage(file).then(img => setFormChatScreens(prev => [...prev, {b64:img.b64, mime:img.mime, name:"paste.png"}])); });
                }}
                placeholder={"Es. ho caricato tutti i dati del " + (form.date || "giorno") + "?"}
              />
              <button onClick={() => sendFormChat(formChatInput)} disabled={!canSend}
                style={{ background: canSend ? P : P+"55", border: "none", borderRadius: "7px", color: "#fff", padding: "9px 16px", fontSize: "13px", fontFamily: FF, cursor: canSend ? "pointer" : "default", fontWeight: "bold", flexShrink: 0 }}>
                Invia →
              </button>
            </div>
          </div>
        );
      })()}

      {/* DATE */}
      <div style={cardCss}>
        <label style={lblCss}>Data (GG/MM)</label>
        <input style={{ ...inpCss, width: "180px" }} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} placeholder="es. 20/03"
          onFocus={e => { e.target.style.borderColor = P; }} onBlur={e => { e.target.style.borderColor = BD; }} />
        <div style={{ fontSize: "12px", color: MU, marginTop: "8px", fontFamily: FF }}>Default: ieri ({yesterday()})</div>
      </div>

      {/* METRICS */}
      <div style={cardCss}>
        <div style={{ ...secCss, color: P }}>Metriche giornaliere</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {METRICS.map(m => (
            <div key={m.key}>
              <label style={lblCss}>{m.label}{m.unit ? " (" + m.unit + ")" : ""}</label>
              <input style={inpCss} value={form[m.key]} onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))} placeholder={m.ph}
                onFocus={e => { e.target.style.borderColor = P; }} onBlur={e => { e.target.style.borderColor = BD; }} />
            </div>
          ))}
        </div>
      </div>

      {/* MEDIA MESE */}
      <div style={cardCss}>
        <div style={{ ...secCss, color: O }}>Media mese</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {METRICS_MESE.map(m => (
            <div key={m.key}>
              <label style={lblCss}>{m.label}</label>
              <input style={inpCss} value={form[m.key]} onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))} placeholder={m.ph}
                onFocus={e => { e.target.style.borderColor = O; }} onBlur={e => { e.target.style.borderColor = BD; }} />
            </div>
          ))}
        </div>
      </div>

      {/* IMPORT JSON */}
      <div style={{ ...cardCss, borderColor: "#4caf5044", borderWidth: "1px", background: "#0f1a12" }}>
        <div style={{ ...secCss, color: "#4caf50", marginBottom: "10px" }}>📥 Importa JSON (ripristino storico)</div>
        <div style={{ fontSize: "12px", color: MU, fontFamily: FF, marginBottom: "14px", lineHeight: "1.6" }}>
          Carica un file JSON esportato in precedenza per ripristinare lo storico completo in questo tracker.
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ cursor: "pointer" }}>
            <div style={{ background: "#4caf5022", border: "1px solid #4caf5055", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", fontFamily: FF, color: "#4caf50", fontWeight: "bold" }}>
              📂 Seleziona file .json
            </div>
            <input type="file" accept=".json,application/json" onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = async (ev) => {
                try {
                  const payload = JSON.parse(ev.target.result);
                  if (!payload.records || !Array.isArray(payload.records)) throw new Error("Formato non valido");
                  const imported = payload.records;
                  // Merge per DATA (non per id):
                  // - Se la data esiste già nell'artefatto → tieni il record dell'artefatto (non sovrascrivere)
                  // - Se la data non esiste → aggiungi dal JSON importato
                  const existingDates = new Set(records.map(r => r.date));
                  const newRecs = imported.filter(r => !existingDates.has(r.date));
                  let merged = [...records, ...newRecs].sort((a,b) => sortKey(b.date).localeCompare(sortKey(a.date)));
                  merged = enrichWithInheritedTobe(merged);
                  setRecords(merged);
                  await persist(merged);
                  if (payload.pbiPeriods && Object.keys(payload.pbiPeriods).length > 0) {
                    const mergedPbi = { ...(pbiPeriods||{}), ...payload.pbiPeriods };
                    setPbiPeriods(mergedPbi);
                    await persistPbi(mergedPbi);
                  }
                  setImportMsg("✓ Importati " + newRecs.length + " nuovi giorni (" + imported.length + " nel file). " + (imported.length - newRecs.length) + " date già presenti mantenute.");
                } catch (err) {
                  setImportMsg("⚠️ Errore: " + err.message);
                }
                e.target.value = "";
              };
              reader.readAsText(file);
            }} style={{ display: "none" }} />
          </label>
          {importMsg && <div style={{ fontSize: "13px", fontFamily: FF, color: importMsg.startsWith("✓") ? "#4caf50" : "#f5a623" }}>{importMsg}</div>}
        </div>
      </div>

    </div>
  );

  const renderReport = () => {
    const r = activeReport;
    if (!r) return <div style={{ textAlign: "center", padding: "80px 24px", color: MU, fontFamily: FF, fontSize: "12px" }}>📋 Inserisci i dati o seleziona un giorno dallo storico.</div>;

    const redColorFn = (name, v) => {
      if (v === "—") return MU;
      const val = parseFloat((v||"").replace(",","."));
      const n = (name||"").toUpperCase();
      if (n === "GALANO GOOGLE CALDE" || n === "GALANO GOOGLE CTC") {
        if (val > 22) return "#1db954"; if (val > 19.5) return "#4caf50"; if (val >= 15.5) return "#f5a623"; return "#ff5c5c";
      }
      if (n === "SPINUP SOCIAL" || n === "GALANO SOCIAL" || n === "PAOLO SOCIAL" || n === "TRABOCCO TLC") {
        if (val > 15.5) return "#4caf50"; if (val >= 12.5) return "#f5a623"; return "#ff5c5c";
      }
      return "#c4b8ff";
    };

    return (
      <div style={{ padding: "28px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ ...secCss, color: P, marginBottom: 0 }}>▌ Report {r.date}</div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select onChange={e => { const found = records.find(x => x.id === e.target.value); if (found) setActiveReport(found); }} value={r.id}
              style={{ ...inpCss, width: "auto", padding: "9px 13px", fontSize: "10px" }}>
              {records.map(x => <option key={x.id} value={x.id}>{x.date}</option>)}
            </select>
            <OutlineBtn onClick={() => { setForm({ ...r }); setView("form"); }}>✏️ Modifica</OutlineBtn>
            <ReportRecapBtn r={r} />
          </div>
        </div>

        <div style={{ background: CARD2, border: "2px solid " + P, borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ background: "linear-gradient(135deg," + P + ",#4a35a0)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#fff", fontWeight: "bold", fontSize: "12px", fontFamily: FF }}>CS Energia</span>
            <span style={{ color: "#EDE8FA", fontSize: "8px", fontFamily: FF, fontWeight: "bold" }}>{r.date}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", background: P + "33", padding: "10px 20px", borderBottom: "2px solid " + P + "44" }}>
            {["KPI", "ACTUAL", "TO BE", "DELTA"].map((h, i) => (
              <span key={h} style={{ color: "#c4b8ff", fontSize: "7px", fontFamily: FF, fontWeight: "bold", letterSpacing: "2px", textAlign: i > 0 ? "center" : "left" }}>{h}</span>
            ))}
          </div>
          {(() => {
            const leadInh = r._leadToBeInherited;
            const oreInh = r._oreDichInherited;
            const leadStar = leadInh ? "*" : "";
            const oreStar = oreInh ? "*" : "";
            const leadTitle = leadInh ? "Ereditato dal " + r._leadToBeFromDate : "";
            const oreTitle = oreInh ? "Ereditato dal " + r._oreDichFromDate : "";
            return [
            { label:"PRESSIONE",    actual:fv(r.pressione),        tobe:"—",                            delta:null,                             rule:"neutral" },
            { label:"LEAD GENERATE",actual:fv(r.leadGen),          tobe:(<span title={leadTitle}>{fv(r.leadToBe)+leadStar+" TO BE"}</span>),        delta:calcPct(r.leadGen,r.leadToBe),    rule:"standard" },
            { label:"ORE",          actual:fv(r.ore),              tobe:(<span title={oreTitle}>{fv(r.oreDich)+oreStar+" TO BE"}</span>),          delta:calcPct(r.ore,r.oreDich),         rule:"standard" },
            { label:"LAV/ORA",      actual:fv(r.lavOra),           tobe:fv(r.lavOraMese)+" media mese", delta:calcPct(r.lavOra,r.lavOraMese),   rule:"lavora" },
            { label:"RED",          actual:fv(r.red)+"%",          tobe:fv(r.redMese)+"% media mese",   delta:calcPct(r.red,r.redMese),         rule:"standard" },
            { label:"RESA",         actual:fv(r.resa),             tobe:fv(r.resaMese)+" media mese",   delta:calcPct(r.resa,r.resaMese),       rule:"standard" },
            { label:"% CTC", actual:fv(r.ctc)+"%", tobe:r.ctcMese ? fv(r.ctcMese)+"% media mese" : "—", delta:null, rule:"ctc", ctcVal:toNum(r.ctc),
              sub: (() => {
                const tim = r.macrofonti?.find(m => m.name.toUpperCase() === "TRABOCCO TLC TIM");
                const timPct = tim ? tim.pct : null;
                return (
                  <span>
                    di cui Trabocco TLC {fv(r.trabocco)}%
                    {timPct && <span> · TLC TIM {timPct}%</span>}
                  </span>
                );
              })()
            },
            { label:"TIMING 1-5 min",actual:fv(r.timing)+"%",     tobe:fv(r.timingMese)+"% media mese",delta:null, rule:"timing", timingVal:toNum(r.timing) },
            { label:"CONTATTAB. NETTO CTC", actual: r.contattab ? fv(r.contattab)+"%" : "—", tobe: r.contattabMese ? fv(r.contattabMese)+"% media mese" : "—", delta: r.contattab && r.contattabMese ? calcPct(r.contattab, r.contattabMese) : null, rule:"standard",
              sub:"Tabella riassuntiva Drive → KPI per data (cluster CTC escluso)" },
            { label:"CPL",          actual:fv(r.cpl)+"€",          tobe:fv(r.cplMese)+"€ media mese",   delta:calcPct(r.cpl,r.cplMese),         rule:"inverse" },
            { label:"CPA",          actual:fv(r.cpa)+"€",          tobe:fv(r.cpaMese)+"€ media mese",   delta:calcPct(r.cpa,r.cpaMese),         rule:"inverse" },
          ];
          })().map((row, i) => {
            let deltaEl = <span style={{ color: "#555", fontSize: "11px", fontFamily: FF }}>—</span>;
            if (row.rule === "ctc") {
              const cv = row.ctcVal;
              // CTC: per aprile almeno 25%, per marzo 18-25%
              const recDate = r && r.date ? r.date : ""; const isMarch = recDate.includes("/03"); const cMin2 = isMarch ? 18 : 25; const cMax2 = isMarch ? 25 : 999;
              const ok = !isNaN(cv) && cv >= cMin2 && cv <= cMax2;
              const c = ok ? "#4caf50" : "#ff5c5c";
              const bg = ok ? "#1a7a4018" : "#c0392b18";
              const lbl = ok ? "✓ IN RANGE" : (cv < cMin2 ? "▼ SOTTO TARGET" : "▲ SOPRA TARGET");
              deltaEl = <span style={{ display:"inline-block", padding:"4px 10px", borderRadius:"6px", fontSize:"10px", fontFamily:FF, fontWeight:"bold", color:c, background:bg, border:"1px solid "+c+"44" }}>{lbl}</span>;
            } else if (row.rule === "timing") {
              const tv = row.timingVal;
              const ok = !isNaN(tv) && tv >= 90 && tv < 98;
              const c = ok ? "#4caf50" : "#ff5c5c";
              const bg = ok ? "#1a7a4018" : "#c0392b18";
              deltaEl = <span style={{ display:"inline-block", padding:"4px 10px", borderRadius:"6px", fontSize:"11px", fontFamily:FF, fontWeight:"bold", color:c, background:bg, border:"1px solid "+c+"44" }}>{isNaN(tv) ? "—" : tv+"%"}</span>;
            } else if (row.delta !== null && row.rule !== "neutral") {
              const d = parseFloat(row.delta);
              let c, bg, icon;
              if (row.rule === "standard") {
                if (d <= -10) { c="#ff5c5c"; bg="#c0392b18"; icon="▼ "; }
                else if (d < 0) { c="#f5a623"; bg="#f5a62318"; icon="▼ "; }
                else if (d <= 9.99) { c="#4caf50"; bg="#1a7a4018"; icon="▲ "; }
                else { c="#1db954"; bg="#0d5c2818"; icon="▲ "; }
              } else if (row.rule === "lavora") {
                if (d >= 10) { c="#ff5c5c"; bg="#c0392b18"; icon="▲ "; }
                else if (d < 0) { c="#f5a623"; bg="#f5a62318"; icon="▼ "; }
                else { c="#4caf50"; bg="#1a7a4018"; icon="▲ "; }
              } else if (row.rule === "inverse") {
                if (d >= 10) { c="#ff5c5c"; bg="#c0392b18"; icon="▲ "; }
                else if (d > 0) { c="#f5a623"; bg="#f5a62318"; icon="▲ "; }
                else if (d >= -9.99) { c="#4caf50"; bg="#1a7a4018"; icon="▼ "; }
                else { c="#1db954"; bg="#0d5c2818"; icon="▼ "; }
              }
              deltaEl = <span style={{ display:"inline-block", padding:"4px 10px", borderRadius:"6px", fontSize:"11px", fontFamily:FF, fontWeight:"bold", color:c, background:bg, border:"1px solid "+c+"44" }}>{icon}{d>=0?"+":""}{row.delta}%</span>;
            }
            return (
              <div key={row.label} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"12px 20px", borderBottom:i<10?"1px solid "+BD:"none", background:i%2===0?"transparent":"#ffffff04", alignItems:"center" }}>
                <div>
                  <div style={{ color:"#b8a8ff", fontSize:"12px", fontFamily:FF, fontWeight:"bold" }}>{row.label}</div>
                  {row.sub && <div style={{ color:MU, fontSize:"10px", fontFamily:FF, marginTop:"2px", lineHeight:"1.6" }}>{row.sub}</div>}
                </div>
                <div style={{ textAlign:"center", color:"#fff", fontSize:"14px", fontFamily:FF, fontWeight:"bold" }}>{row.actual}</div>
                <div style={{ textAlign:"center", color:MU, fontSize:"11px", fontFamily:FF }}>{row.tobe}</div>
                <div style={{ textAlign:"center" }}>{deltaEl}</div>
              </div>
            );
          })}
        </div>

        {/* MACROFONTI */}
        {r.macrofonti && r.macrofonti.length > 0 && (() => {
          const macroToBe = getMacroToBe(r.date);
          const cols = "2fr 70px 70px 70px 80px 70px 70px 70px";
          return (
          <div style={{ background: CARD2, border: "2px solid " + O, borderRadius: "12px", overflow: "hidden", marginTop: "20px" }}>
            <div style={{ background: "linear-gradient(135deg,#8B3A0A,#c45510)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontWeight: "bold", fontSize: "13px", fontFamily: FF }}>MACROFORNITORI - KPI</span>
              <span style={{ color: "#FFD0B5", fontSize: "10px", fontFamily: FF }}>{r.date}{macroToBe ? " · TO BE da 27/03" : " · TO BE n.d."}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: cols, background: O+"33", padding: "9px 20px", borderBottom: "2px solid "+O+"44", overflowX:"auto" }}>
              {["FORNITORE","LEADS","% TOT.","TO BE","Δ LEAD","RED","CPL","CPA NEW"].map((h, i) => (
                <span key={h} style={{ color: "#FFD0B5", fontSize: "8px", fontFamily: FF, fontWeight: "bold", letterSpacing: "1.2px", textAlign: i > 0 ? "center" : "left" }}>{h}</span>
              ))}
            </div>
            {r.macrofonti.map((mf, i) => {
              const nm = mf.name.toUpperCase();
              const tobe = macroToBe ? (macroToBe[mf.name] || null) : null;
              const deltaLeads = tobe && mf.leads ? ((mf.leads - tobe) / tobe * 100).toFixed(1) : null;
              const deltaColor = deltaLeads === null ? MU : parseFloat(deltaLeads) >= -5 && parseFloat(deltaLeads) <= 10 ? "#4caf50" : parseFloat(deltaLeads) < -5 ? "#ff5c5c" : "#f5a623";
              return (
                <div key={mf.name} style={{ display: "grid", gridTemplateColumns: cols, padding: "10px 20px", borderBottom: i < r.macrofonti.length - 1 ? "1px solid "+BD : "none", background: i%2===0?"transparent":"#ffffff04", alignItems: "center" }}>
                  <span style={{ color: "#FFD0B5", fontSize: "10px", fontFamily: FF, fontWeight: "bold" }}>{mf.name}</span>
                  <span style={{ textAlign: "center", color: "#fff", fontSize: "11px", fontFamily: FF, fontWeight: "bold" }}>{mf.leads.toLocaleString("it-IT")}</span>
                  <span style={{ textAlign: "center", color: MU, fontSize: "10px", fontFamily: FF }}>{mf.pct}%</span>
                  <span style={{ textAlign: "center", color: MU, fontSize: "10px", fontFamily: FF }}>{tobe ? tobe.toLocaleString("it-IT") : "—"}</span>
                  <span style={{ textAlign: "center", fontSize: "10px", fontFamily: FF, fontWeight: "bold", color: deltaColor }}>
                    {deltaLeads !== null ? (parseFloat(deltaLeads) >= 0 ? "+" : "") + deltaLeads + "%" : "—"}
                  </span>
                  <span style={{ textAlign: "center", fontSize: "10px", fontFamily: FF, fontWeight: "bold", color: redColorFn(mf.name, mf.red) }}>{mf.red !== "—" ? mf.red+"%" : "—"}</span>
                  <span style={{ textAlign: "center", color: "#fff", fontSize: "10px", fontFamily: FF }}>{mf.cpl !== "—" ? mf.cpl+"€" : "—"}</span>
                  <span style={{ textAlign: "center", fontSize: "10px", fontFamily: FF, fontWeight: "bold", color: mf.cpa !== "—" ? (parseFloat(mf.cpa)>110?"#ff5c5c":parseFloat(mf.cpa)>92?"#f5a623":"#4caf50") : MU }}>{mf.cpa !== "—" ? mf.cpa+"€" : "—"}</span>
                </div>
              );
            })}
            <div style={{ display: "grid", gridTemplateColumns: cols, padding: "11px 20px", background: O+"18", borderTop: "2px solid "+O+"44", alignItems: "center" }}>
              <span style={{ color: O, fontSize: "9px", fontFamily: FF, fontWeight: "bold", letterSpacing: "1px" }}>TOTAL</span>
              <span style={{ textAlign: "center", color: "#fff", fontSize: "11px", fontFamily: FF, fontWeight: "bold" }}>{fv(r.leadGen)}</span>
              <span style={{ textAlign: "center", color: MU, fontSize: "10px", fontFamily: FF }}>100%</span>
              <span style={{ textAlign: "center", color: MU, fontSize: "10px", fontFamily: FF }}>{macroToBe ? Object.values(macroToBe).reduce((s,x)=>s+x,0).toLocaleString("it-IT") : "—"}</span>
              <span style={{ textAlign: "center", color: MU, fontSize: "10px", fontFamily: FF }}>—</span>
              <span style={{ textAlign: "center", color: "#c4b8ff", fontSize: "10px", fontFamily: FF, fontWeight: "bold" }}>{fv(r.red)}%</span>
              <span style={{ textAlign: "center", color: "#fff", fontSize: "10px", fontFamily: FF, fontWeight: "bold" }}>{fv(r.cpl)}€</span>
              <span style={{ textAlign: "center", color: "#fff", fontSize: "10px", fontFamily: FF, fontWeight: "bold" }}>{fv(r.cpa)}€</span>
            </div>
          </div>
          );
        })()}

        {/* TABELLA ORARIA */}
        {r.hourly && r.hourly.length > 0 && (() => {
          const hRows = r.hourly.filter(h => h.leads > 0);
          const totLeads = parseInt(r.leadGen) || 0;
          const totLeadsU = hRows.reduce((s,h)=>s+(h.leadsU||0),0);
          const totPct = totLeads > 0 ? (totLeadsU/totLeads*100).toFixed(1) : "—";
          const totTiming = r.timing ? parseInt(r.timing) : null;
          const totPress = r.pressione || "—";
          const totCont = r.contattab || (() => { const rows = hRows.filter(h=>h.cont); return rows.length ? (rows.reduce((s,h)=>s+parseFloat(h.cont.replace(",",".")),0)/rows.length).toFixed(1) : "—"; })();
          const durRows = hRows.filter(h=>h.dur);
          const totDur = r.durMedia || (durRows.length ? (durRows.reduce((s,h)=>s+parseFloat((h.dur||"0").replace(",",".")),0)/durRows.length).toFixed(2) : "—");
          const hourlyToBe = getHourlyToBe(r.date);
          const hdrCols = ["ORA","LEADS GEN","LEAD TO BE","Δ LEAD","% UTILIZZO","PRESSIONE","CONTATTAB","TIMING 5'","DURATA MEDIA"];
          const hdrTpl = "55px 75px 75px 70px 80px 80px 80px 90px 90px";
          const minW = "800px";
          const cBase = { padding:"8px 10px", fontSize:"9px", fontFamily:FF, textAlign:"center" };
          const timingColor = (v) => { if (v == null) return MU; return v >= 90 && v < 98 ? "#4caf50" : "#ff5c5c"; };
          const deltaLeadColor = (actual, tobe) => { if (!tobe) return MU; const d = ((actual-tobe)/tobe*100); return d > 10 ? "#f5a623" : d < -10 ? "#ff5c5c" : "#4caf50"; };
          return (
            <div style={{ background:CARD2, border:"2px solid #664CCD44", borderRadius:"12px", overflow:"hidden", marginTop:"20px", marginBottom:"20px" }}>
              <div style={{ background:"linear-gradient(135deg,#2a1f5e,#1a1540)", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:"#c4b8ff", fontWeight:"bold", fontSize:"12px", fontFamily:FF }}>📞 KPI per Fascia Oraria</span>
                <span style={{ color:MU, fontSize:"9px", fontFamily:FF }}>{r.date} · {hRows.length} fasce{hourlyToBe ? " · TO BE da 27/03" : ""}</span>
              </div>
              <div style={{ overflowX:"auto" }}>
                <div style={{ display:"grid", gridTemplateColumns:hdrTpl, gap:"4px", padding:"9px 14px", background:P+"22", minWidth:minW }}>
                  {hdrCols.map(h => <span key={h} style={{ color:"#c4b8ff", fontSize:"8px", fontFamily:FF, fontWeight:"bold", letterSpacing:"1.2px", textAlign:"center", textTransform:"uppercase" }}>{h}</span>)}
                </div>
                {hRows.map((h, i) => {
                  const pct = h.leadsU != null && h.leads > 0 ? (h.leadsU/h.leads*100).toFixed(1) : "—";
                  const tb = hourlyToBe ? (hourlyToBe[h.ora] || null) : null;
                  const dLead = tb ? ((h.leads - tb) / tb * 100).toFixed(1) : null;
                  return (
                    <div key={h.ora} style={{ display:"grid", gridTemplateColumns:hdrTpl, gap:"4px", padding:"8px 14px", background: i%2===0?"transparent":"#ffffff04", borderBottom:"1px solid "+BD+"22", minWidth:minW, alignItems:"center" }}>
                      <span style={{ ...cBase, color:O, fontWeight:"bold" }}>{h.ora}:00</span>
                      <span style={{ ...cBase, color:TX }}>{h.leads}</span>
                      <span style={{ ...cBase, color:MU }}>{tb || "—"}</span>
                      <span style={{ ...cBase, fontWeight:"bold", color: dLead !== null ? deltaLeadColor(h.leads, tb) : MU }}>
                        {dLead !== null ? (parseFloat(dLead)>=0?"+":"")+dLead+"%" : "—"}
                      </span>
                      <span style={{ ...cBase, color:MU }}>{pct !== "—" ? pct+"%" : "—"}</span>
                      <span style={{ ...cBase, color:TX }}>{h.press || "—"}</span>
                      <span style={{ ...cBase, color:TX }}>{h.cont ? h.cont+"%" : "—"}</span>
                      <span style={{ ...cBase, fontWeight:"bold", color: h.timing != null ? timingColor(h.timing) : MU }}>{h.timing != null ? h.timing+"%" : "—"}</span>
                      <span style={{ ...cBase, color:TX }}>{h.dur ? h.dur+"'" : "—"}</span>
                    </div>
                  );
                })}
                <div style={{ display:"grid", gridTemplateColumns:hdrTpl, gap:"4px", padding:"9px 14px", background:"linear-gradient(90deg,"+O+"20,"+P+"18)", borderTop:"2px solid "+O+"44", minWidth:minW, alignItems:"center" }}>
                  <span style={{ ...cBase, color:O, fontWeight:"bold", fontSize:"8px", letterSpacing:"1px" }}>TOTALE</span>
                  <span style={{ ...cBase, color:"#fff", fontWeight:"bold" }}>{totLeads}</span>
                  <span style={{ ...cBase, color:MU, fontWeight:"bold" }}>{hourlyToBe ? Object.values(hourlyToBe).reduce((s,x)=>s+x,0) : "—"}</span>
                  <span style={{ ...cBase, color:MU, fontWeight:"bold" }}>
                    {hourlyToBe ? (() => { const tb=Object.values(hourlyToBe).reduce((s,x)=>s+x,0); const d=((totLeads-tb)/tb*100).toFixed(1); return (parseFloat(d)>=0?"+":"")+d+"%"; })() : "—"}
                  </span>
                  <span style={{ ...cBase, color:MU, fontWeight:"bold" }}>{totPct !== "—" ? totPct+"%" : "—"}</span>
                  <span style={{ ...cBase, color:"#fff", fontWeight:"bold" }}>{totPress}</span>
                  <span style={{ ...cBase, color:"#fff", fontWeight:"bold" }}>{totCont !== "—" ? totCont+"%" : "—"}</span>
                  <span style={{ ...cBase, fontWeight:"bold", color: totTiming != null ? timingColor(totTiming) : MU }}>{totTiming != null ? totTiming+"%" : "—"}</span>
                  <span style={{ ...cBase, color:"#fff", fontWeight:"bold" }}>{totDur !== "—" ? totDur+"'" : "—"}</span>
                </div>
              </div>
            </div>
          );
        })()}

        <SintesiBox r={r} records={records} onSave={async (sintesi) => {
          const updated = records.map(x => x.id === r.id ? { ...x, sintesi } : x);
          setRecords(updated);
          setActiveReport({ ...r, sintesi });
          await persist(updated);
        }} />
        <AiChat context={buildReportContext(r)} />
      </div>
    );
  };

  const renderHistory = () => {
    // ── Helper: calcola numero settimana ISO ──
    const getISOWeek = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return { year: d.getUTCFullYear(), week: weekNum };
    };

    // ── Helper: calcola range settimana dato un lunedì ──
    const getWeekRange = (mon) => {
      const sat = new Date(mon);
      sat.setDate(mon.getDate() + 5);
      const iso = getISOWeek(mon);
      const id = iso.year + "-W" + String(iso.week).padStart(2, "0");
      return { mon, sat, id };
    };

    // ── Helper formato data ──
    const fmtDD = (d) => {
      const g = String(d.getDate()).padStart(2, "0");
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return g + "/" + m;
    };
    const fmtDDMMYYYY = (d) => {
      const g = String(d.getDate()).padStart(2, "0");
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return g + "/" + m + "/" + d.getFullYear();
    };

    // ── Calcolo settimane disponibili ──
    const today = new Date();
    const dow = today.getDay();
    const daysToMon = dow === 0 ? 6 : dow - 1;
    const thisMon = new Date(today);
    thisMon.setDate(today.getDate() - daysToMon);
    thisMon.setHours(0, 0, 0, 0);

    const currentWeek = getWeekRange(thisMon);
    const weekOptions = [];
    for (let w = 1; w <= 5; w++) {
      const mon = new Date(thisMon);
      mon.setDate(thisMon.getDate() - (w * 7));
      weekOptions.push(getWeekRange(mon));
    }

    // Default: prima settimana completa selezionata
    const activeWeekId = selectedWeekId || (weekOptions[0] && weekOptions[0].id);
    const activeWeek = [currentWeek, ...weekOptions].find(w => w.id === activeWeekId) || weekOptions[0];

    // Cerca record settimanale se esiste
    const settRecord = recordsSett.find(r => r.id === activeWeekId);

    return (
      <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ ...secCss, color: P }}>▌ Report Settimanale</div>

        {/* SELETTORE SETTIMANA */}
        <div style={cardCss}>
          <div style={{ ...secCss, color: O, marginBottom: "12px" }}>Seleziona settimana</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setSelectedWeekId(currentWeek.id)}
              style={{
                padding: "8px 14px",
                background: activeWeekId === currentWeek.id ? P : "transparent",
                border: "1px solid " + (activeWeekId === currentWeek.id ? P : BD),
                color: activeWeekId === currentWeek.id ? "#fff" : "#c4b8e3",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer"
              }}>
              Sett. corrente {fmtDD(currentWeek.mon) + "-" + fmtDD(currentWeek.sat)} (parziale)
            </button>
            {weekOptions.map((w, idx) => {
              const hasData = recordsSett.find(r => r.id === w.id);
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeekId(w.id)}
                  style={{
                    padding: "8px 14px",
                    background: activeWeekId === w.id ? P : "transparent",
                    border: "1px solid " + (activeWeekId === w.id ? P : BD),
                    color: activeWeekId === w.id ? "#fff" : "#c4b8e3",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                    position: "relative"
                  }}>
                  {fmtDD(w.mon) + "-" + fmtDD(w.sat)}{idx === 0 ? " (ultima completa)" : ""}
                  {hasData && <span style={{ marginLeft: "6px", color: "#6bcf5e", fontSize: "11px" }}>●</span>}
                </button>
              );
            })}
            <button
              onClick={() => setShowWeeklyForm(true)}
              style={{
                padding: "8px 14px",
                background: O,
                border: "none",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                marginLeft: "auto"
              }}>+ Carica settimana</button>
          </div>
        </div>

        {/* FORM CARICAMENTO */}
        {showWeeklyForm && (
          <WeeklyLoadForm
            weekOptions={[currentWeek, ...weekOptions]}
            defaultWeekId={activeWeekId}
            tobeSabati={tobeSabati}
            recordsSett={recordsSett}
            records={records}
            onClose={() => setShowWeeklyForm(false)}
            onSaved={(newRecord, newSabato) => {
              setRecordsSett(prev => {
                const filtered = prev.filter(r => r.id !== newRecord.id);
                return [...filtered, newRecord];
              });
              if (newSabato) {
                setTobeSabati(prev => {
                  const filtered = prev.filter(t => t.date !== newSabato.date);
                  return [...filtered, newSabato];
                });
              }
              setSelectedWeekId(newRecord.id);
              setShowWeeklyForm(false);
            }}
          />
        )}

        {/* CONTENUTO SETTIMANA */}
        {settRecord ? (
          <WeeklyView record={settRecord} tobeSabati={tobeSabati} records={records} activeWeek={activeWeek} />
        ) : (
          <>
            <div style={{
              padding: "14px",
              background: "rgba(102,76,205,0.08)",
              border: "1px solid rgba(102,76,205,0.25)",
              borderRadius: "6px",
              marginBottom: "20px",
              fontSize: "12px",
              color: "#c4b8e3",
              lineHeight: "1.6"
            }}>
              <strong style={{color: O}}>Nessun dato per questa settimana</strong><br/>
              Premi <strong style={{color: O}}>+ Carica settimana</strong> per estrarre i dati dagli screenshot Power BI.
            </div>
            <div style={cardCss}>
              <div style={{ ...secCss, color: P, marginBottom: "12px" }}>KPI Settimana {fmtDD(activeWeek.mon) + "-" + fmtDD(activeWeek.sat)}</div>
              <div style={{ padding: "40px", textAlign: "center", color: "#8a7ca8", fontSize: "13px" }}>Dati da caricare</div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMacro = () => {
    const recs = filtered.length > 0 ? filtered : records;
    const recsWithMacro = recs.filter(r => r.macrofonti && r.macrofonti.length > 0);
    const agg = {};
    FORNITORE_NAMES.forEach(name => { agg[name] = { leads:[], pct:[], red:[], cpl:[], cpa:[] }; });
    recsWithMacro.forEach(r => {
      r.macrofonti.forEach(mf => {
        const n = mf.name.toUpperCase();
        if (agg[n]) {
          if (mf.leads) agg[n].leads.push(mf.leads);
          if (mf.pct && mf.pct !== "—") agg[n].pct.push(parseFloat(mf.pct.replace(",",".")));
          if (mf.red && mf.red !== "—") agg[n].red.push(parseFloat(mf.red.replace(",",".")));
          if (mf.cpl && mf.cpl !== "—") agg[n].cpl.push(parseFloat(mf.cpl.replace(",",".")));
          if (mf.cpa && mf.cpa !== "—") agg[n].cpa.push(parseFloat(mf.cpa.replace(",",".")));
        }
      });
    });

    const cpaColor3 = (v) => { const n = parseFloat(v); if (isNaN(n)) return MU; return n > 110 ? "#ff5c5c" : n > 103 ? "#f5a623" : "#4caf50"; };
    const redColor3 = (name, v) => {
      const n = parseFloat(v); if (isNaN(n)) return MU;
      const nm = (name||"").toUpperCase();
      if (nm==="GALANO GOOGLE CALDE"||nm==="GALANO GOOGLE CTC") return n>22?"#1db954":n>19.5?"#4caf50":n>=15.5?"#f5a623":"#ff5c5c";
      if (nm==="SPINUP SOCIAL"||nm==="GALANO SOCIAL"||nm==="PAOLO SOCIAL"||nm==="TRABOCCO TLC") return n>15.5?"#4caf50":n>=12.5?"#f5a623":"#ff5c5c";
      return "#c4b8ff";
    };

    const tblHead = { background: "linear-gradient(135deg," + P + ",#4a35a0)", padding: "10px 18px", fontSize: "11px", fontFamily: FF, fontWeight: "bold", color: "#fff", letterSpacing: "1.5px", textTransform: "uppercase" };
    const cellBase = { padding: "9px 12px", fontSize: "13px", fontFamily: FF, borderBottom: "1px solid " + BD };

    return (
      <div style={{ padding: "28px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ ...secCss, color: P }}>▌ Storico Macrofonti</div>

        {/* PBI UPLOAD */}
        <div style={{ ...cardCss, borderColor: "#4caf5066", borderWidth:"2px", marginBottom:"22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"#1a7a4022", border:"1px solid #4caf5044", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>📊</div>
            <div>
              <div style={{ ...secCss, color:"#4caf50", marginBottom:"2px" }}>Aggiorna dati PBI verificati</div>
              <div style={{ fontSize:"12px", color:MU, fontFamily:FF }}>Carica uno screen Power BI (Recap CPL Operations) — i dati vengono estratti e salvati automaticamente</div>
            </div>
          </div>
          <label style={{ display:"block", border:"2px dashed #4caf5055", borderRadius:"10px", padding:"18px", textAlign:"center", cursor:"pointer", background:"#1a7a4008", marginBottom:"12px" }}>
            <div style={{ fontSize:"24px", marginBottom:"6px" }}>📂</div>
            <div style={{ color:"#fff", fontSize:"13px", fontFamily:FF, fontWeight:"bold", marginBottom:"3px" }}>Clicca per caricare lo screenshot PBI</div>
            <div style={{ color:MU, fontSize:"11px", fontFamily:FF }}>PNG o JPG · tabella Macro Fornitore con filtro date visibile</div>
            <input type="file" accept="image/*" multiple onChange={e => {
              const files = Array.from(e.target.files);
              Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onload = () => res({ name:f.name, b64:r.result.split(",")[1], mime:f.type }); r.readAsDataURL(f); }))).then(imgs => setPbiScreens(prev => [...prev, ...imgs]));
            }} style={{ display:"none" }} />
          </label>
          {pbiScreens.length > 0 && (
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" }}>
              {pbiScreens.map((s,i) => (
                <div key={i} style={{ position:"relative" }}>
                  <img src={"data:"+s.mime+";base64,"+s.b64} alt={s.name} style={{ height:"64px", borderRadius:"6px", border:"1px solid #4caf5044", objectFit:"cover" }} />
                  <button onClick={() => setPbiScreens(prev => prev.filter((_,j)=>j!==i))} style={{ position:"absolute", top:"-6px", right:"-6px", background:"#ff5c5c", border:"none", borderRadius:"50%", width:"16px", height:"16px", color:"#fff", fontSize:"10px", cursor:"pointer", lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
            <button onClick={extractPbiFromScreens} disabled={!pbiScreens.length || pbiExtracting}
              style={{ background: pbiScreens.length && !pbiExtracting ? "#4caf50" : "#4caf5055", border:"none", borderRadius:"8px", padding:"10px 20px", fontSize:"13px", fontFamily:FF, fontWeight:"bold", color:"#fff", cursor: pbiScreens.length && !pbiExtracting ? "pointer":"default" }}>
              {pbiExtracting ? "⏳ Estrazione in corso…" : "🤖 Estrai e salva dati PBI"}
            </button>
            {pbiScreens.length > 0 && !pbiExtracting && (
              <button onClick={() => { setPbiScreens([]); setPbiExtractMsg(""); }} style={{ background:"transparent", border:"1px solid "+BD, borderRadius:"8px", padding:"9px 14px", fontSize:"12px", fontFamily:FF, color:MU, cursor:"pointer" }}>Rimuovi tutti</button>
            )}
            {pbiExtractMsg && <span style={{ fontSize:"13px", fontFamily:FF, color: pbiExtractMsg.startsWith("✓") ? "#4caf50" : "#f5a623" }}>{pbiExtractMsg}</span>}
          </div>
          {pbiPeriods && Object.keys(pbiPeriods).length > 0 && (
            <div style={{ marginTop:"14px", paddingTop:"14px", borderTop:"1px solid "+BD }}>
              <div style={{ fontSize:"11px", color:MU, fontFamily:FF, letterSpacing:"1px", textTransform:"uppercase", marginBottom:"8px" }}>Periodi verificati disponibili</div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                {Object.entries(pbiPeriods).map(([key, val]) => (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:"6px", background:"#1a7a4018", border:"1px solid #4caf5044", borderRadius:"6px", padding:"4px 10px" }}>
                    <span style={{ fontSize:"12px", color:"#4caf50", fontFamily:FF, fontWeight:"bold" }}>{val.label}</span>
                    <button onClick={async () => { const updated = { ...pbiPeriods }; delete updated[key]; setPbiPeriods(updated); await persistPbi(updated); }} style={{ background:"transparent", border:"none", color:"#ff5c5c66", cursor:"pointer", fontSize:"12px", padding:"0", lineHeight:1 }} title="Rimuovi">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FILTRO PERIODO */}
        <div style={cardCss}>
          <div style={{ ...secCss, color: O }}>Filtra periodo</div>
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div><label style={lblCss}>Da</label><input type="date" style={{ ...inpCss, width: "170px" }} value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} onFocus={e => { e.target.style.borderColor = O; }} onBlur={e => { e.target.style.borderColor = BD; }} /></div>
            <div><label style={lblCss}>A</label><input type="date" style={{ ...inpCss, width: "170px" }} value={rangeTo} onChange={e => setRangeTo(e.target.value)} onFocus={e => { e.target.style.borderColor = O; }} onBlur={e => { e.target.style.borderColor = BD; }} /></div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { const t=new Date(),y=new Date();y.setDate(y.getDate()-1);setRangeFrom(`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-01`);setRangeTo(`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,"0")}-${String(y.getDate()).padStart(2,"0")}`); }}
                style={{ background:"transparent",color:O,border:"2px solid "+O,borderRadius:"7px",padding:"9px 14px",fontSize:"13px",fontFamily:FF,cursor:"pointer",fontWeight:"bold" }}>Mese corrente</button>
              <button onClick={() => { setRangeFrom(""); setRangeTo(""); }} style={{ background:"transparent",color:MU,border:"1px solid "+BD,borderRadius:"7px",padding:"9px 14px",fontSize:"13px",fontFamily:FF,cursor:"pointer" }}>Reset</button>
            </div>
          </div>
        </div>

        {recsWithMacro.length === 0 ? (
          <div style={{ ...cardCss, textAlign:"center", padding:"50px", color:MU, fontSize:"16px" }}>Nessun dato macrofonti nel periodo selezionato.</div>
        ) : (() => {
          const periodKey = getPeriodKey(recsWithMacro);
          const pbi = periodKey ? (pbiPeriods || {})[periodKey] : null;
          const tableRows = pbi ? pbi.fornitori : FORNITORE_NAMES.map(name => {
            const a = agg[name];
            return {
              name,
              leads: a.leads.length ? Math.round(a.leads.reduce((s,x)=>s+x,0) / recsWithMacro.length) : "—",
              pct:   a.pct.length   ? (a.pct.reduce((s,x)=>s+x,0)/a.pct.length).toFixed(2) : "—",
              red:   a.red.length   ? (a.red.reduce((s,x)=>s+x,0)/a.red.length).toFixed(1)  : "—",
              cpl:   a.cpl.length   ? (a.cpl.reduce((s,x)=>s+x,0)/a.cpl.length).toFixed(1)  : "—",
              cpa:   a.cpa.length   ? (a.cpa.reduce((s,x)=>s+x,0)/a.cpa.length).toFixed(0)  : "—",
            };
          });
          const totalRow = pbi ? pbi.total : {
            leads: Math.round(recsWithMacro.reduce((s,r)=>s+(toNum(r.leadGen)||0),0)/recsWithMacro.length),
            red:   (recsWithMacro.map(r=>toNum(r.red)).filter(x=>!isNaN(x)).reduce((s,x)=>s+x,0)/recsWithMacro.length).toFixed(1),
            cpl:   (recsWithMacro.map(r=>toNum(r.cpl)).filter(x=>!isNaN(x)).reduce((s,x)=>s+x,0)/recsWithMacro.length).toFixed(1),
            cpa:   (recsWithMacro.map(r=>toNum(r.cpa)).filter(x=>!isNaN(x)).reduce((s,x)=>s+x,0)/recsWithMacro.length).toFixed(0),
          };

          return (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
                <div style={{ ...secCss, color:O, marginBottom:0 }}>
                  {pbi ? "KPI Aggregati per Fornitore — " + pbi.label : "Media KPI per Fornitore (stime giornaliere)"}
                </div>
                {pbi
                  ? <span style={{ fontSize:"12px", color:"#4caf50", fontFamily:FF, background:"#1a7a4018", padding:"4px 10px", borderRadius:"6px", border:"1px solid #4caf5044" }}>✓ Dati PBI verificati</span>
                  : recsWithMacro.length === 1
                    ? <span style={{ fontSize:"12px", color:"#4caf50", fontFamily:FF, background:"#1a7a4018", padding:"4px 10px", borderRadius:"6px", border:"1px solid #4caf5044" }}>✓ Dati giornalieri da PBI</span>
                    : <span style={{ fontSize:"12px", color:"#f5a623", fontFamily:FF, background:"#f5a62318", padding:"4px 10px", borderRadius:"6px", border:"1px solid #f5a62344" }}>⚠️ Stime — fornire screen PBI per valori esatti</span>
                }
              </div>
              <div style={{ borderRadius:"10px", overflow:"auto", border:"1px solid "+BD, marginBottom:"28px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 80px 80px 80px", ...tblHead }}>
                  {["FORNITORE","LEADS","MEDIA/GG","% TOT.","RED","CPL","CPA NEW"].map((h,i) => (
                    <span key={h} style={{ textAlign: i>0?"center":"left" }}>{h}</span>
                  ))}
                </div>
                {tableRows.map((row, i) => (
                  <div key={row.name} style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 80px 80px 80px", background: i%2===0?CARD:"#150e38", borderBottom:"1px solid "+BD }}>
                    <span style={{ ...cellBase, color:"#FFD0B5", fontWeight:"bold" }}>{row.name}</span>
                    <span style={{ ...cellBase, color:TX, textAlign:"center" }}>{typeof row.leads === "number" ? row.leads.toLocaleString("it-IT") : row.leads}</span>
                    <span style={{ ...cellBase, color:MU, textAlign:"center" }}>{typeof row.leads === "number" ? Math.round(row.leads / recsWithMacro.length) : "—"}</span>
                    <span style={{ ...cellBase, color:MU, textAlign:"center" }}>{row.pct !== "—" ? row.pct+"%" : "—"}</span>
                    <span style={{ ...cellBase, color:redColor3(row.name, row.red), fontWeight:"bold", textAlign:"center" }}>{row.red !== "—" ? row.red+"%" : "—"}</span>
                    <span style={{ ...cellBase, color:TX, textAlign:"center" }}>{row.cpl !== "—" ? row.cpl+"€" : "—"}</span>
                    <span style={{ ...cellBase, color:cpaColor3(row.cpa), fontWeight:"bold", textAlign:"center" }}>{row.cpa !== "—" ? row.cpa+"€" : "—"}</span>
                  </div>
                ))}
                <div style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 80px 80px 80px", background:"linear-gradient(90deg,"+O+"25,"+P+"20)", borderTop:"2px solid "+O }}>
                  <span style={{ ...cellBase, color:O, fontWeight:"bold", fontSize:"12px", letterSpacing:"1px" }}>TOTAL</span>
                  <span style={{ ...cellBase, color:"#fff", fontWeight:"bold", textAlign:"center" }}>{typeof totalRow.leads === "number" ? totalRow.leads.toLocaleString("it-IT") : totalRow.leads}</span>
                  <span style={{ ...cellBase, color:MU, fontWeight:"bold", textAlign:"center" }}>{typeof totalRow.leads === "number" ? Math.round(totalRow.leads / recsWithMacro.length) : "—"}</span>
                  <span style={{ ...cellBase, color:MU, textAlign:"center" }}>100%</span>
                  <span style={{ ...cellBase, color:"#c4b8ff", fontWeight:"bold", textAlign:"center" }}>{totalRow.red}%</span>
                  <span style={{ ...cellBase, color:"#fff", fontWeight:"bold", textAlign:"center" }}>{totalRow.cpl}€</span>
                  <span style={{ ...cellBase, color:"#fff", fontWeight:"bold", textAlign:"center" }}>{totalRow.cpa}€</span>
                </div>
              </div>

              {/* TREND PER FORNITORE */}
              <div style={{ ...secCss, color: O, marginBottom:"14px" }}>Trend per Fornitore — dettaglio giornaliero</div>
              {FORNITORE_NAMES.map(name => {
                const rows = [...recsWithMacro].sort((a,b) => sortKey(a.date).localeCompare(sortKey(b.date))).map(r => ({
                  date: r.date,
                  mf: r.macrofonti.find(m => m.name.toUpperCase() === name)
                })).filter(x => x.mf);
                if (!rows.length) return null;
                const tplDays = "80px " + rows.map(()=>"1fr").join(" ");
                return (
                  <div key={name} style={{ borderRadius:"10px", overflow:"auto", border:"1px solid "+BD, marginBottom:"16px" }}>
                    <div style={{ background:"linear-gradient(90deg,#8B3A0A,#c45510)", padding:"10px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ color:"#fff", fontWeight:"bold", fontSize:"14px", fontFamily:FF }}>{name}</span>
                      <span style={{ color:"#FFD0B5", fontSize:"12px", fontFamily:FF }}>{rows.length} giorni</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:tplDays, background:O+"22", padding:"8px 14px", fontSize:"11px", fontFamily:FF, fontWeight:"bold", color:"#FFD0B5", letterSpacing:"1px" }}>
                      <span>KPI</span>
                      {rows.map(x => <span key={x.date} style={{ textAlign:"center" }}>{x.date}</span>)}
                    </div>
                    {[
                      { key:"leads", label:"Leads",    render:(mf)=><span style={{color:TX}}>{mf.leads}</span> },
                      { key:"pct",   label:"% Totale", render:(mf)=><span style={{color:MU}}>{mf.pct}%</span> },
                      { key:"red",   label:"RED",      render:(mf)=><span style={{color:redColor3(name,mf.red),fontWeight:"bold"}}>{mf.red !== "—" ? mf.red+"%" : "—"}</span> },
                      { key:"cpl",   label:"CPL",      render:(mf)=><span style={{color:TX}}>{mf.cpl !== "—" ? mf.cpl+"€" : "—"}</span> },
                      { key:"cpa",   label:"CPA NEW",  render:(mf)=><span style={{color:cpaColor3(mf.cpa),fontWeight:"bold"}}>{mf.cpa !== "—" ? mf.cpa+"€" : "—"}</span> },
                    ].map((kpi, ki) => (
                      <div key={kpi.key} style={{ display:"grid", gridTemplateColumns:tplDays, padding:"8px 14px", background: ki%2===0?CARD:CARD2, borderBottom:"1px solid "+BD+"22", fontSize:"13px", fontFamily:FF, alignItems:"center" }}>
                        <span style={{ color:"#b8a8ff", fontWeight:"bold" }}>{kpi.label}</span>
                        {rows.map(x => <span key={x.date} style={{ textAlign:"center" }}>{kpi.render(x.mf)}</span>)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          );
        })()}
        {recsWithMacro.length > 0 && <RecapBox buildFn={buildMacroRecap} recs={[...recsWithMacro].reverse()} title="Recap Macrofornitori — testo" />}
        {recsWithMacro.length > 0 && <AiChat context={buildHistoryContext(recsWithMacro)} />}
      </div>
    );
  };

  // ── MONTHLY TARGETS (marzo 2026) ──
  const MONTHLY_TARGETS = {
    "03": { cpa: 92,  lavOra: 2.5,  timingMin: 90, timingMax: 97, ctcMin: 18, ctcMax: 25, contattab: 62, cpl: 11.5, resa: 0.50 },
    "04": { cpa: 100, lavOra: 2.53, timingMin: 90, timingMax: 97, ctcMin: 25, ctcMax: 100, contattab: 60, cpl: 12.5, resa: 0.45 }
  };

  const renderMese = () => {
    // Build months map: { "03": [rec, rec, ...], ... }
    const monthsMap = {};
    records.forEach(r => {
      if (!r.date || !r.date.includes("/")) return;
      const mm = r.date.split("/")[1];
      if (!monthsMap[mm]) monthsMap[mm] = [];
      monthsMap[mm].push(r);
    });
    const months = Object.keys(monthsMap).sort().reverse();
    const curMM = selectedMese || months[0] || "";
    if (!curMM) return <div style={{padding:"60px",textAlign:"center",color:MU,fontFamily:FF}}>Nessun dato disponibile.</div>;

    const monthRecs = (monthsMap[curMM]||[]).sort((a,b)=>sortKey(a.date).localeCompare(sortKey(b.date)));
    const latestRec = monthRecs[monthRecs.length - 1]; // most recent = best *Mese values
    const targets = MONTHLY_TARGETS[curMM] || {};

    const MONTH_NAMES = {"01":"Gennaio","02":"Febbraio","03":"Marzo","04":"Aprile","05":"Maggio","06":"Giugno","07":"Luglio","08":"Agosto","09":"Settembre","10":"Ottobre","11":"Novembre","12":"Dicembre"};
    const monthLabel = MONTH_NAMES[curMM] || curMM;

    // Average of daily values
    const dailyAvg = (key) => {
      const v = monthRecs.map(r=>toNum(r[key])).filter(x=>!isNaN(x));
      return v.length ? (v.reduce((s,x)=>s+x,0)/v.length).toFixed(1) : null;
    };
    const dailyAvgI = (key) => {
      const v = monthRecs.map(r=>toNum(r[key])).filter(x=>!isNaN(x));
      return v.length ? Math.round(v.reduce((s,x)=>s+x,0)/v.length) : null;
    };

    // Missing data check: fields that are empty across all records
    const missingFields = [];
    if (!latestRec.contattabMese) missingFields.push("Contattabilità netto CTC media mese");
    const hasAllDays = monthRecs.filter(r=>r.leadGen&&r.cpa&&r.red&&r.macrofonti?.length>0).length;
    const daysWithMacro = monthRecs.filter(r=>r.macrofonti?.length>0).length;

    // Macrofonti aggregate
    const macroNames = ["GALANO GOOGLE CALDE","GALANO GOOGLE CTC","SPINUP SOCIAL","GALANO SOCIAL","PAOLO SOCIAL","ETC","TRABOCCO TLC","TRABOCCO TLC TIM","TRABOCCO A&R"];
    const macroAgg = {}; macroNames.forEach(n2=>{macroAgg[n2]={leads:[],pct:[],red:[],cpl:[],cpa:[]};});
    monthRecs.forEach(r=>(r.macrofonti||[]).forEach(mf=>{
      const nm=mf.name.toUpperCase(); if(!macroAgg[nm]) return;
      if(mf.leads) macroAgg[nm].leads.push(mf.leads);
      if(mf.pct&&mf.pct!=="—") macroAgg[nm].pct.push(parseFloat(mf.pct.replace(",",".")));
      if(mf.red&&mf.red!=="—") macroAgg[nm].red.push(parseFloat(mf.red.replace(",",".")));
      if(mf.cpl&&mf.cpl!=="—") macroAgg[nm].cpl.push(parseFloat(mf.cpl.replace(",",".")));
      if(mf.cpa&&mf.cpa!=="—") macroAgg[nm].cpa.push(parseFloat(mf.cpa.replace(",",".")));
    }));

    const redColorFn = (name, v) => { const num=parseFloat(v); if(isNaN(num)) return MU; const nm=name.toUpperCase(); if(nm==="GALANO GOOGLE CALDE"||nm==="GALANO GOOGLE CTC") return num>22?"#1db954":num>19.5?"#4caf50":num>=15.5?"#f5a623":"#ff5c5c"; if(nm==="SPINUP SOCIAL"||nm==="GALANO SOCIAL"||nm==="PAOLO SOCIAL"||nm==="TRABOCCO TLC") return num>15.5?"#4caf50":num>=12.5?"#f5a623":"#ff5c5c"; return "#c4b8ff"; };
    const cpaColorFn = (v) => { const n=parseFloat(v); return isNaN(n)?MU:n>110?"#ff5c5c":n>92?"#f5a623":"#4caf50"; };

    // KPI rows
    const kpiRows = [
      { label:"LEAD GENERATE / GG", actual: dailyAvgI("leadGen") ? dailyAvgI("leadGen").toLocaleString("it-IT") : "—", tobe: latestRec.leadToBe ? latestRec.leadToBe+" TO BE" : "—", delta: dailyAvgI("leadGen") && latestRec.leadToBe ? calcPct(dailyAvgI("leadGen"), toNum(latestRec.leadToBe)) : null, rule:"standard" },
      { label:"ORE / GG", actual: dailyAvgI("ore") ? dailyAvgI("ore").toLocaleString("it-IT") : "—", tobe: latestRec.oreDich ? latestRec.oreDich+" TO BE" : "—", delta: dailyAvgI("ore") && latestRec.oreDich ? calcPct(dailyAvgI("ore"), toNum(latestRec.oreDich)) : null, rule:"standard" },
      { label:"LAV/ORA", actual: latestRec.lavOraMese ? latestRec.lavOraMese : "—", tobe: (targets.lavOra||2.5)+" target", delta: latestRec.lavOraMese ? calcPct(latestRec.lavOraMese, targets.lavOra||2.5) : null, rule:"lavora" },
      { label:"RED", actual: latestRec.redMese ? latestRec.redMese+"%" : "—", tobe: "17,0% target", delta: latestRec.redMese ? calcPct(latestRec.redMese, 17.0) : null, rule:"standard" },
      { label:"RESA", actual: latestRec.resaMese ? latestRec.resaMese : "—", tobe: (targets.resa||0.50)+" target", delta: latestRec.resaMese ? calcPct(latestRec.resaMese, targets.resa||0.50) : null, rule:"standard" },
      { label:"% CTC", actual: latestRec.ctcMese ? latestRec.ctcMese+"%" : "—", tobe: (targets.ctcMax>=100 ? "≥"+targets.ctcMin+"%" : (targets.ctcMin||18)+"-"+(targets.ctcMax||25)+"%")+" target", delta: null, rule:"ctc", ctcVal: toNum(latestRec.ctcMese), ctcMin: targets.ctcMin||18, ctcMax: targets.ctcMax||25 },
      { label:"TIMING 1-5min", actual: latestRec.timingMese ? latestRec.timingMese+"%" : "—", tobe: (targets.timingMin||90)+"-97,99% range", delta: null, rule:"timing", timingVal: toNum(latestRec.timingMese), timingNote:"(range ottimale 90-97,99%)" },
      { label:"CONTATTAB. NETTO CTC", actual: latestRec.contattabMese ? latestRec.contattabMese+"%" : "—", tobe: (targets.contattab||62)+"% target", delta: latestRec.contattabMese ? calcPct(latestRec.contattabMese, targets.contattab||62) : null, rule:"standard",
        sub:"Da Tabella riassuntiva Drive · KPI per data (cluster CTC escluso) · intero mese" },
      { label:"CPL", actual: latestRec.cplMese ? latestRec.cplMese+"€" : "—", tobe: (targets.cpl||11.5)+"€ target", delta: latestRec.cplMese ? calcPct(latestRec.cplMese, targets.cpl||11.5) : null, rule:"inverse" },
      { label:"CPA", actual: latestRec.cpaMese ? latestRec.cpaMese+"€" : "—", tobe: (targets.cpa||92)+"€ target", delta: latestRec.cpaMese ? calcPct(latestRec.cpaMese, targets.cpa||92) : null, rule:"inverse" },
    ];

    return (
      <div style={{ padding:"28px", maxWidth:"960px", margin:"0 auto" }}>

        {/* Month selector */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"22px", flexWrap:"wrap", gap:"12px" }}>
          <div style={{ ...secCss, color:P, marginBottom:0 }}>▌ Report Mensile</div>
          <div style={{ display:"flex", gap:"8px" }}>
            {months.map(mm => (
              <button key={mm} onClick={()=>setSelectedMese(mm)}
                style={{ background: (curMM===mm)?P:"transparent", color:(curMM===mm)?"#fff":P, border:"2px solid "+P, borderRadius:"8px", padding:"9px 20px", fontSize:"13px", fontFamily:FF, fontWeight:"bold", cursor:"pointer" }}>
                {MONTH_NAMES[mm]||mm} {new Date().getFullYear()}
              </button>
            ))}
          </div>
        </div>

        {/* Coverage card */}
        <div style={{ ...cardCss, borderColor: O+"66", borderWidth:"2px", marginBottom:"20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"12px" }}>
            <div>
              <div style={{ ...secCss, color:O, marginBottom:"8px" }}>📅 Giorni con dati — {monthLabel}</div>
              <div style={{ fontSize:"12px", color:MU, fontFamily:FF, marginBottom:"14px" }}>
                {monthRecs.length} giorni lavorativi inseriti · {daysWithMacro} con macrofonti · KPI mese da record più recente: <span style={{color:O,fontWeight:"bold"}}>{latestRec.date}</span>
              </div>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {monthRecs.map(r => {
                  const complete = r.leadGen && r.cpa && r.red && r.macrofonti?.length > 0 && r.contattab;
                  const partial = r.leadGen && r.cpa && !r.contattab;
                  return (
                    <button key={r.date} onClick={()=>{setActiveReport(r);setView("report");}}
                      title={complete?"Dati completi":partial?"Contattab. mancante":"Dati parziali"}
                      style={{ background: complete?"#1a7a4022":partial?"#f5a62322":"#c0392b22", border:"1px solid "+(complete?"#4caf5055":partial?"#f5a62355":"#ff5c5c55"), borderRadius:"7px", padding:"7px 12px", fontSize:"13px", fontFamily:FF, fontWeight:"bold", color:complete?"#4caf50":partial?"#f5a623":"#ff5c5c", cursor:"pointer" }}>
                      {r.date.split("/")[0]} {complete?"✓":partial?"⚡":"⚠️"}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Missing data alert */}
            {(missingFields.length > 0 || monthRecs.some(r=>!r.contattab)) && (
              <div style={{ background:"#f5a62310", border:"1px solid #f5a62344", borderRadius:"10px", padding:"14px 18px", maxWidth:"320px" }}>
                <div style={{ fontSize:"12px", fontWeight:"bold", color:"#f5a623", fontFamily:FF, marginBottom:"8px" }}>⚠️ Dati mancanti o incompleti</div>
                {monthRecs.filter(r=>!r.contattab).length > 0 && (
                  <div style={{ fontSize:"12px", color:MU, fontFamily:FF, marginBottom:"4px" }}>
                    • Contattab. netto CTC assente in: {monthRecs.filter(r=>!r.contattab).map(r=>r.date).join(", ")}
                  </div>
                )}
                {monthRecs.filter(r=>!r.contattabMese).length > 0 && (
                  <div style={{ fontSize:"12px", color:MU, fontFamily:FF, marginBottom:"4px" }}>
                    • Contattab. mese media assente in: {monthRecs.filter(r=>!r.contattabMese).map(r=>r.date).join(", ")}
                  </div>
                )}
                {monthRecs.filter(r=>!r.macrofonti?.length).length > 0 && (
                  <div style={{ fontSize:"12px", color:MU, fontFamily:FF }}>
                    • Macrofonti assenti in: {monthRecs.filter(r=>!r.macrofonti?.length).map(r=>r.date).join(", ")}
                  </div>
                )}
                <div style={{ fontSize:"11px", color:"#f5a623", fontFamily:FF, marginTop:"10px", fontStyle:"italic" }}>
                  Fonte: Tabella riassuntiva Drive → deseleziona CTC in cluster_progetti
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPI Table */}
        <div style={{ background:CARD2, border:"2px solid "+P, borderRadius:"12px", overflow:"hidden", marginBottom:"20px" }}>
          <div style={{ background:"linear-gradient(135deg,"+P+",#4a35a0)", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ color:"#fff", fontWeight:"bold", fontSize:"13px", fontFamily:FF }}>KPI {monthLabel} 2026</span>
            <span style={{ color:"#EDE8FA", fontSize:"11px", fontFamily:FF }}>Fonte: valori *Mese da {latestRec.date} · {monthRecs.length} giorni</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", background:P+"33", padding:"10px 20px", borderBottom:"2px solid "+P+"44" }}>
            {["KPI","VALORE MESE","TARGET / RANGE","DELTA"].map((h,i)=>(
              <span key={h} style={{ color:"#c4b8ff", fontSize:"7px", fontFamily:FF, fontWeight:"bold", letterSpacing:"2px", textAlign:i>0?"center":"left" }}>{h}</span>
            ))}
          </div>
          {kpiRows.map((row, i) => {
            let deltaEl = <span style={{color:"#555",fontSize:"11px",fontFamily:FF}}>—</span>;
            if (row.rule==="ctc") {
              const cv=row.ctcVal; const cMin=row.ctcMin||18; const cMax=row.ctcMax||25; const ok=!isNaN(cv)&&cv>=cMin&&(cMax>=100?true:cv<=cMax); const c=ok?"#4caf50":"#ff5c5c"; const bg=ok?"#1a7a4018":"#c0392b18";
              deltaEl = <span style={{display:"inline-block",padding:"4px 10px",borderRadius:"6px",fontSize:"10px",fontFamily:FF,fontWeight:"bold",color:c,background:bg,border:"1px solid "+c+"44"}}>{ok?"✓ IN RANGE":cv<cMin?"▼ SOTTO TARGET":"▲ SOPRA TARGET"}</span>;
            } else if (row.rule==="timing") {
              const tv=row.timingVal; const ok=!isNaN(tv)&&tv>=90&&tv<98; const c=ok?"#4caf50":"#ff5c5c"; const bg=ok?"#1a7a4018":"#c0392b18";
              deltaEl = <span style={{display:"inline-block",padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontFamily:FF,fontWeight:"bold",color:c,background:bg,border:"1px solid "+c+"44"}}>{isNaN(tv)?"—":tv+"%"}</span>;
            } else if (row.delta!==null && row.delta!==undefined) {
              const d=parseFloat(row.delta); let c,bg,icon;
              if (row.rule==="standard"||row.rule==="lavora") { if(d<=-5){c="#ff5c5c";bg="#c0392b18";icon="▼ ";}else if(d<0){c="#f5a623";bg="#f5a62318";icon="▼ ";}else if(d<=5){c="#4caf50";bg="#1a7a4018";icon="▲ ";}else{c="#1db954";bg="#0d5c2818";icon="▲ ";} }
              else if (row.rule==="inverse") { if(d>=10){c="#ff5c5c";bg="#c0392b18";icon="▲ ";}else if(d>0){c="#f5a623";bg="#f5a62318";icon="▲ ";}else if(d>=-5){c="#4caf50";bg="#1a7a4018";icon="▼ ";}else{c="#1db954";bg="#0d5c2818";icon="▼ ";} }
              deltaEl = <span style={{display:"inline-block",padding:"4px 10px",borderRadius:"6px",fontSize:"11px",fontFamily:FF,fontWeight:"bold",color:c,background:bg,border:"1px solid "+c+"44"}}>{icon}{d>=0?"+":""}{parseFloat(row.delta).toFixed(1)}%</span>;
            }
            return (
              <div key={row.label} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", padding:"12px 20px", borderBottom:i<kpiRows.length-1?"1px solid "+BD:"none", background:i%2===0?"transparent":"#ffffff04", alignItems:"center" }}>
                <div>
                  <div style={{color:"#b8a8ff",fontSize:"12px",fontFamily:FF,fontWeight:"bold"}}>{row.label}</div>
                  {row.sub&&<div style={{color:MU,fontSize:"10px",fontFamily:FF,marginTop:"2px"}}>{row.sub}</div>}
                </div>
                <div style={{textAlign:"center",color:"#fff",fontSize:"14px",fontFamily:FF,fontWeight:"bold"}}>{row.actual}</div>
                <div style={{textAlign:"center",color:MU,fontSize:"11px",fontFamily:FF}}>{row.tobe}</div>
                <div style={{textAlign:"center"}}>{deltaEl}</div>
              </div>
            );
          })}
        </div>

        {/* Macrofonti aggregate */}
        {daysWithMacro > 0 && (
          <div style={{ background:CARD2, border:"2px solid "+O, borderRadius:"12px", overflow:"hidden", marginBottom:"20px" }}>
            <div style={{ background:"linear-gradient(135deg,#8B3A0A,#c45510)", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color:"#fff", fontWeight:"bold", fontSize:"13px", fontFamily:FF }}>MACROFORNITORI — Media {monthLabel}</span>
              <span style={{ color:"#FFD0B5", fontSize:"10px", fontFamily:FF }}>{daysWithMacro} giorni con dati</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 80px 80px", background:O+"33", padding:"9px 20px", borderBottom:"2px solid "+O+"44" }}>
              {["FORNITORE","LEADS/GG","% TOT.","RED","CPL","CPA"].map((h,i)=>(
                <span key={h} style={{ color:"#FFD0B5", fontSize:"8px", fontFamily:FF, fontWeight:"bold", letterSpacing:"1.5px", textAlign:i>0?"center":"left" }}>{h}</span>
              ))}
            </div>
            {macroNames.map((nm,i) => {
              const a=macroAgg[nm]; if(!a.leads.length) return null;
              const avgL = Math.round(a.leads.reduce((s,x)=>s+x,0)/a.leads.length);
              const avgPct = a.pct.length?(a.pct.reduce((s,x)=>s+x,0)/a.pct.length).toFixed(1):"—";
              const avgR = a.red.length?(a.red.reduce((s,x)=>s+x,0)/a.red.length).toFixed(1):"—";
              const avgC = a.cpl.length?(a.cpl.reduce((s,x)=>s+x,0)/a.cpl.length).toFixed(1):"—";
              const avgA = a.cpa.length?Math.round(a.cpa.reduce((s,x)=>s+x,0)/a.cpa.length).toString():"—";
              return (
                <div key={nm} style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 80px 80px", padding:"10px 20px", borderBottom:"1px solid "+BD, background:i%2===0?"transparent":"#ffffff04", alignItems:"center" }}>
                  <span style={{color:"#FFD0B5",fontSize:"10px",fontFamily:FF,fontWeight:"bold"}}>{nm}</span>
                  <span style={{textAlign:"center",color:"#fff",fontSize:"11px",fontFamily:FF,fontWeight:"bold"}}>{avgL}</span>
                  <span style={{textAlign:"center",color:MU,fontSize:"10px",fontFamily:FF}}>{avgPct !== "—" ? avgPct+"%" : "—"}</span>
                  <span style={{textAlign:"center",fontSize:"10px",fontFamily:FF,fontWeight:"bold",color:redColorFn(nm,avgR)}}>{avgR !== "—" ? avgR+"%" : "—"}</span>
                  <span style={{textAlign:"center",color:"#fff",fontSize:"10px",fontFamily:FF}}>{avgC !== "—" ? avgC+"€" : "—"}</span>
                  <span style={{textAlign:"center",fontSize:"10px",fontFamily:FF,fontWeight:"bold",color:cpaColorFn(avgA)}}>{avgA !== "—" ? avgA+"€" : "—"}</span>
                </div>
              );
            })}
            {/* Total row */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 80px 80px 80px 80px 80px", padding:"10px 20px", background:O+"18", borderTop:"2px solid "+O+"44", alignItems:"center" }}>
              <span style={{color:O,fontSize:"9px",fontFamily:FF,fontWeight:"bold",letterSpacing:"1px"}}>MEDIA MESE</span>
              <span style={{textAlign:"center",color:"#fff",fontSize:"11px",fontFamily:FF,fontWeight:"bold"}}>{dailyAvgI("leadGen")}</span>
              <span style={{textAlign:"center",color:MU,fontSize:"10px",fontFamily:FF}}>100%</span>
              <span style={{textAlign:"center",color:"#c4b8ff",fontSize:"10px",fontFamily:FF,fontWeight:"bold"}}>{latestRec.redMese ? latestRec.redMese+"%" : "—"}</span>
              <span style={{textAlign:"center",color:"#fff",fontSize:"10px",fontFamily:FF,fontWeight:"bold"}}>{latestRec.cplMese ? latestRec.cplMese+"€" : "—"}</span>
              <span style={{textAlign:"center",color:"#fff",fontSize:"10px",fontFamily:FF,fontWeight:"bold"}}>{latestRec.cpaMese ? latestRec.cpaMese+"€" : "—"}</span>
            </div>
          </div>
        )}

        <MeseSintesiSection filtered={monthRecs} records={records} />
      </div>
    );
  };

  // ── Schermata login ──
  const renderLogin = () => (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#0f0c1e", border: "2px solid #664CCD", borderRadius: "16px", padding: "40px 44px", maxWidth: "440px", width: "100%", boxShadow: "0 10px 40px rgba(102,76,205,0.25)" }}>
        <div style={{ fontSize: "13px", letterSpacing: "3px", color: "#FD6F3B", textTransform: "uppercase", marginBottom: "8px" }}>Accesso riservato</div>
        <div style={{ fontSize: "26px", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>CS Energia Tracker</div>
        <div style={{ fontSize: "14px", color: "#9d93c2", marginBottom: "28px" }}>Inserisci la password del team per accedere.</div>
        <input
          type="password"
          value={loginPwd}
          onChange={(e) => setLoginPwd(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
          placeholder="Password"
          autoFocus
          style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", fontSize: "15px", fontFamily: FF, border: "1px solid #2a2248", background: "#0a0814", color: "#fff", borderRadius: "10px", marginBottom: "14px", outline: "none" }}
        />
        {loginErr && (
          <div style={{ fontSize: "13px", color: "#ff6b6b", marginBottom: "14px", padding: "10px 12px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "8px" }}>
            {loginErr}
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={loginLoading}
          style={{ width: "100%", padding: "13px", fontSize: "14px", fontFamily: FF, fontWeight: "bold", color: "#fff", background: "#664CCD", border: "none", borderRadius: "10px", cursor: loginLoading ? "wait" : "pointer", opacity: loginLoading ? 0.6 : 1 }}
        >
          {loginLoading ? "Verifica in corso..." : "Accedi"}
        </button>
        <div style={{ fontSize: "12px", color: "#6b6591", marginTop: "20px", textAlign: "center" }}>
          La password resta attiva 24 ore su questo browser.
        </div>
      </div>
    </div>
  );

  // ── Schermata boot ──
  if (bootLoading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9d93c2", fontSize: "14px" }}>Caricamento...</div>
      </div>
    );
  }

  // Non loggato → mostra login
  if (!loginOk) {
    return renderLogin();
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: FF }}>
      {/* Banner errore connessione */}
      {connError && (
        <div style={{ background: "#3a1515", borderBottom: "1px solid #ff6b6b", color: "#ff9a9a", padding: "10px 20px", fontSize: "13px", fontFamily: FF, textAlign: "center" }}>
          {connError} <button onClick={() => window.location.reload()} style={{ marginLeft: "12px", background: "transparent", border: "1px solid #ff9a9a", color: "#ff9a9a", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Ricarica</button>
        </div>
      )}
      {/* Banner migrazione */}
      {migrationMsg && (
        <div style={{ background: "#132a1f", borderBottom: "1px solid #4caf50", color: "#a5d6a7", padding: "10px 20px", fontSize: "13px", fontFamily: FF, textAlign: "center" }}>
          {migrationMsg}
        </div>
      )}
      {/* Pulsante logout in alto a destra */}
      <div style={{ position: "fixed", top: "10px", right: "14px", zIndex: 1000 }}>
        <button
          onClick={handleLogout}
          title="Esci e richiedi di nuovo la password"
          style={{ background: "transparent", border: "1px solid #2a2248", color: "#9d93c2", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontFamily: FF }}
        >
          Logout
        </button>
      </div>
      {renderNav()}
      {view === "form" && renderForm()}
      {view === "report" && renderReport()}
      {view === "mese" && renderMese()}
      {view === "history" && renderHistory()}
      {view === "macro" && renderMacro()}
    </div>
  );
}
