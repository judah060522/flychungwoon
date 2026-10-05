const TEXT = {
  ko: {
    title: "항공사 체크인 대기 등록 서비스",
    sub: "지금 바로 대기 등록하고, 내차례가 되면 알림을 받아보세요.",
    register: "대기 등록하기",
    live: "실시간 대기확인",
    form: "대기 등록",
    contact: "전화번호 또는 이메일",
    people: "인원",
    next: "다음",
    done: "대기가 등록되었습니다.",
    my: "현재 내 순서는",
    nth: "번째입니다.",
    waitTitle: "실시간 대기 현황",
    current: "현재",
    teams: "팀이 대기 중입니다.",
    approx: "약",
    minutes: "분 정도의 대기시간",
    back: "← 메인으로",
    notice: "등록 후 10분이 지나면 자동으로 대기열에서 제거됩니다.",
    invalid: "이메일과 인원을 정확하게 입력해주세요.",
    simulator: "시뮬레이터",
    test: "시뮬레이터에서는 다른 사람이 등록한 것처럼 대기자를 추가할 수 있습니다.",
    addFake: "대기자 1팀 추가",
    removeFake: "앞 대기자 1팀 제거"
  },
  zh: {
    title: "航空公司值机等候登记服务",
    sub: "立即登记等候，轮到您时我们会通知您。",
    register: "登记等候",
    live: "实时等候查询",
    form: "登记等候",
    contact: "电话号码或电子邮箱",
    people: "人数",
    next: "下一步",
    done: "等候登记成功。",
    my: "您目前是第",
    nth: "位。",
    waitTitle: "实时等候情况",
    current: "目前",
    teams: "组正在等候。",
    approx: "预计约",
    minutes: "分钟等候时间",
    back: "← 返回主页",
    notice: "登记10分钟后将自动从等候队列中移除。",
    invalid: "请输入正确的邮箱和人数。",
    simulator: "模拟器",
    test: "可以模拟其他乘客加入或离开等候队列。",
    addFake: "添加1组模拟等候者",
    removeFake: "移除前方1组模拟等候者"
  },
  en: {
    title: "Airline Check-in Waiting Service",
    sub: "Register now and get notified when it is your turn.",
    register: "Join Waiting List",
    live: "Live Waiting Status",
    form: "Join Waiting List",
    contact: "Phone number or email",
    people: "Number of people",
    next: "Next",
    done: "Your waiting registration is complete.",
    my: "Your current position is",
    nth: "th.",
    waitTitle: "Live Waiting Status",
    current: "Currently",
    teams: "teams are waiting.",
    approx: "Approximately",
    minutes: "minutes waiting time",
    back: "← Home",
    notice: "You will be automatically removed after 10 minutes.",
    invalid: "Please enter a valid email and number of people.",
    simulator: "Simulator",
    test: "You can simulate other passengers joining or leaving the waiting list.",
    addFake: "Add 1 simulated team",
    removeFake: "Remove 1 team ahead"
  },
  ja: {
    title: "航空会社チェックイン待機登録サービス",
    sub: "今すぐ登録して、順番になったらお知らせを受け取りましょう。",
    register: "待機登録する",
    live: "リアルタイム待機確認",
    form: "待機登録",
    contact: "電話番号またはメールアドレス",
    people: "人数",
    next: "次へ",
    done: "待機登録が完了しました。",
    my: "現在の順番は",
    nth: "番目です。",
    waitTitle: "リアルタイム待機状況",
    current: "現在",
    teams: "組が待機中です。",
    approx: "約",
    minutes: "分の待ち時間",
    back: "← ホーム",
    notice: "登録から10分経過すると自動的に待機列から削除されます。",
    invalid: "正しいメールアドレスと人数を入力してください。",
    simulator: "シミュレーター",
    test: "他の乗客が登録・退出する状況をシミュレーションできます。",
    addFake: "シミュレーション待機者を1組追加",
    removeFake: "前の待機者を1組削除"
  }
};

let lang = localStorage.getItem("flyLang") || "ko";
let queue = JSON.parse(localStorage.getItem("flyQueue") || "[]");
let myId = localStorage.getItem("flyMyId") || "";
let liveTimer = null;
let doneTimer = null;

function t(key) {
  return TEXT[lang][key];
}

function saveQueue() {
  localStorage.setItem("flyQueue", JSON.stringify(queue));
}

function cleanQueue() {
  const now = Date.now();
  queue = queue.filter(item => now - item.createdAt < 10 * 60 * 1000);
  saveQueue();
}

function positionOf(id) {
  cleanQueue();
  const index = queue.findIndex(item => item.id === id);
  return index >= 0 ? index + 1 : 0;
}

function setLanguage(newLang) {
  lang = newLang;
  localStorage.setItem("flyLang", lang);
  renderHome();
}

document.querySelectorAll(".languages button").forEach(button => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

function updateLanguageButtons() {
  document.querySelectorAll(".languages button").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
}

function stopTimers() {
  if (liveTimer) clearInterval(liveTimer);
  if (doneTimer) clearTimeout(doneTimer);
  liveTimer = null;
  doneTimer = null;
}

function renderHome() {
  stopTimers();
  cleanQueue();

  document.getElementById("main").innerHTML = `
    <section class="screen">
      <div class="logo">flychungwoon</div>
      <h1>${t("title")}</h1>
      <p class="subtitle">${t("sub")}</p>

      <button class="primary" id="registerBtn">${t("register")}</button><br>
      <button class="secondary" id="liveBtn">${t("live")}</button>
    </section>
  `;

  document.getElementById("registerBtn").onclick = renderRegister;
  document.getElementById("liveBtn").onclick = renderLive;
  updateLanguageButtons();
}

function renderRegister() {
  stopTimers();

  document.getElementById("main").innerHTML = `
    <section class="screen">
      <div class="card">
        <h2>${t("form")}</h2>

        <label>${t("contact")}</label>
        <input id="contact" type="text" placeholder="example@gmail.com">

        <label>${t("people")}</label>
        <input id="people" type="number" min="1" max="20" value="1">

        <p class="notice">${t("notice")}</p>

        <div class="next-wrap">
          <button class="next" id="nextBtn">→</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById("nextBtn").onclick = submitWaiting;
  updateLanguageButtons();
}

function submitWaiting() {
  const contact = document.getElementById("contact").value.trim();
  const people = Number(document.getElementById("people").value);
  const button = document.getElementById("nextBtn");

  if (!contact || !Number.isInteger(people) || people < 1 || people > 20) {
    showToast(t("invalid"));
    return;
  }

  button.disabled = true;

  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
    contact,
    people,
    createdAt: Date.now()
  };

  cleanQueue();
  queue.push(item);
  saveQueue();
  myId = item.id;
  localStorage.setItem("flyMyId", myId);

  renderDone();
}

function renderDone() {
  stopTimers();
  const position = positionOf(myId);

  document.getElementById("main").innerHTML = `
    <section class="screen">
      <div class="card">
        <div class="check">✓</div>
        <h2>${t("done")}</h2>
        <div class="position-text">${t("my")}</div>
        <div class="big-number" id="myPosition">${position}</div>
        <div class="position-text">${t("nth")}</div>
      </div>
    </section>
  `;

  updateLanguageButtons();

  // 5초 뒤 메인 화면으로 이동
  doneTimer = setTimeout(renderHome, 5000);
}

function renderLive() {
  stopTimers();
  cleanQueue();

  document.getElementById("main").innerHTML = `
    <section class="screen">
      <div class="card">
        <h2>${t("waitTitle")}</h2>

        <div class="live-number">
          <span id="teamCount">0</span>
        </div>

        <div class="position-text">
          ${t("current")} <strong id="teamCountText">0</strong> ${t("teams")}
        </div>

        <div class="wait-time">
          ${t("approx")} <strong id="waitMinutes">0</strong> ${t("minutes")}
        </div>
      </div>

      <button class="back" id="backBtn">${t("back")}</button>
    </section>
  `;

  document.getElementById("backBtn").onclick = renderHome;
  updateLiveNumbers();
  liveTimer = setInterval(updateLiveNumbers, 1000);
  updateLanguageButtons();
}

function updateLiveNumbers() {
  cleanQueue();

  const count = queue.length;
  const minutes = count * 3;

  const a = document.getElementById("teamCount");
  const b = document.getElementById("teamCountText");
  const c = document.getElementById("waitMinutes");

  if (a) a.textContent = count;
  if (b) b.textContent = count;
  if (c) c.textContent = minutes;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

renderHome();
