
const data = window.FESTIVAL_DATA;

const datePills = document.getElementById("date-pills");
const bandList = document.getElementById("band-list");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const listTitle = document.getElementById("list-title");
const tabs = [...document.querySelectorAll(".day-tabs button")];

let activeDay = "all";

// データの読み込み確認
if (!data || !Array.isArray(data.bands)) {
  bandList.innerHTML =
    '<p class="empty">出演者データを読み込めませんでした。data.js の読み込みを確認してください。</p>';
  throw new Error("FESTIVAL_DATA が読み込まれていません。");
}

// 開催日時の個別表示はしない
datePills.replaceChildren();

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function normalize(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[！!。、・「」『』〜～]/g, "");
}

function dayLabel(day) {
  const found = data.event.dates.find(d => d.id === day);
  return found ? found.label : "出演日";
}

function card(b) {
  const img = `images/${encodeURIComponent(b.slug)}.jpg`;

  const songs = Array.isArray(b.songs) && b.songs.length
    ? b.songs.map((s, i) =>
        `<div>${b.songs.length > 1
          ? `<strong>${i + 1}曲目：</strong>`
          : ""}${esc(s)}</div>`
      ).join("")
    : "曲名未登録";

  const members = Array.isArray(b.members) ? b.members : [];

  return `
    <article class="band-card">
      <img
        class="band-photo"
        src="${img}"
        alt="${esc(b.name)}の写真"
        loading="lazy"
        onerror="this.onerror=null;this.outerHTML='<div class=&quot;band-photo photo-placeholder&quot;>PHOTO</div>'"
      >
      <div class="band-content">
        <div class="band-top">
          <h3 class="band-name">${esc(b.name)}</h3>
          <span class="duration">${esc(b.minutes)}分</span>
        </div>
        <p class="meta">出演日・時間：調整中</p>
        <div class="songs">${songs}</div>
        <details class="members">
          <summary>メンバー（${members.length}名）</summary>
          <p>${members.map(esc).join("、")}</p>
        </details>
      </div>
    </article>
  `;
}

function render() {
  const q = normalize(searchInput.value);

  const results = data.bands.filter(b => {
    const matchesDay =
      activeDay === "all" ||
      !b.assignedDay ||
      b.assignedDay === activeDay;

    const haystack = normalize([
      b.name,
      ...(Array.isArray(b.members) ? b.members : []),
      ...(Array.isArray(b.songs) ? b.songs : [])
    ].join(" "));

    return matchesDay && (!q || haystack.includes(q));
  });

  bandList.innerHTML = results.map(card).join("");
  resultCount.textContent = `${results.length}バンド`;
  emptyState.hidden = results.length !== 0;

  listTitle.textContent = q
    ? "検索結果"
    : activeDay === "all"
      ? "出演バンド"
      : `${dayLabel(activeDay)}の出演バンド`;
}

searchInput.addEventListener("input", render);

document.getElementById("clear-search").addEventListener("click", () => {
  searchInput.value = "";
  render();
  searchInput.focus();
});

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    activeDay = btn.dataset.day;
    tabs.forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

render();
