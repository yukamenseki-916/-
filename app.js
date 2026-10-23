
const data = window.FESTIVAL_DATA;

const bandList = document.getElementById("band-list");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");
const listTitle = document.getElementById("list-title");
const tabs = [...document.querySelectorAll(".day-tabs button")];

let activeDay = "all";

if (!data || !Array.isArray(data.bands) || !data.schedule) {
  bandList.textContent = "データを読み込めませんでした。";
  throw new Error("FESTIVAL_DATA または schedule がありません。");
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function dayLabel(day) {
  return data.event.dates.find(date => date.id === day)?.label ?? day;
}

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + Number(minutes || 0);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function card(band, appearance, day) {
  const img = `images/${encodeURIComponent(band.slug)}.jpg`;
  const endTime = addMinutes(appearance.time, band.minutes);

  const songs = band.songs.map((song, index) => `
    <li>${esc(song)}</li>
  `).join("");

  const members = band.members.map(member => `
    <li>${esc(member)}</li>
  `).join("");

  return `
    <article class="band-card">
      <img
        class="band-photo"
        src="${img}"
        alt="${esc(band.name)}のバンド写真"
        loading="lazy"
        onerror="this.style.display='none'"
      >

      <div class="band-info">
        <div class="band-top">
          <h3>${esc(band.name)}</h3>
          <span class="duration">${esc(band.minutes)}分</span>
        </div>

        <p class="meta">
          ${esc(appearance.time)}〜${esc(endTime)}
        </p>

        <p class="meta">${esc(dayLabel(day))}</p>

        <div class="songs">
          <strong>演奏曲</strong>
          <ol>${songs}</ol>
        </div>

        <details class="members">
          <summary>メンバーを見る（${band.members.length}人）</summary>
          <ul>${members}</ul>
        </details>
      </div>
    </article>
  `;
}

function render() {
  const query = normalize(searchInput.value);
  const days = activeDay === "all"
    ? data.event.dates
    : data.event.dates.filter(day => day.id === activeDay);

  let total = 0;
  let html = "";

  for (const day of days) {
    const schedule = data.schedule[day.id] || [];

    const appearances = schedule
      .map(item => ({
        item,
        band: data.bands.find(band => band.slug === item.slug)
      }))
      .filter(entry => {
        if (!entry.band) return false;

        if (!query) return true;

        const searchable = [
          entry.band.name,
          ...entry.band.members,
          ...entry.band.songs
        ].join(" ");

        return normalize(searchable).includes(query);
      });

    if (appearances.length === 0) continue;

    total += appearances.length;

    html += `
      <section class="schedule-day">
        <h2 class="schedule-day-title">${esc(day.label)}</h2>
        <div class="day-band-list">
          ${appearances.map(entry =>
            card(entry.band, entry.item, day.id)
          ).join("")}
        </div>
      </section>
    `;
  }

  bandList.innerHTML = html;
  resultCount.textContent = `${total}出演枠`;
  emptyState.hidden = total !== 0;

  if (query) {
    listTitle.textContent = "検索結果";
  } else if (activeDay === "all") {
    listTitle.textContent = "出演スケジュール";
  } else {
    listTitle.textContent = `${dayLabel(activeDay)}の出演バンド`;
  }
}

searchInput.addEventListener("input", render);

document.getElementById("clear-search").addEventListener("click", () => {
  searchInput.value = "";
  render();
  searchInput.focus();
});

tabs.forEach(button => {
  button.addEventListener("click", () => {
    activeDay = button.dataset.day;

    tabs.forEach(tab => {
      tab.classList.toggle("active", tab === button);
    });

    render();
  });
});

render();
