document.addEventListener("DOMContentLoaded", function () {
    const calendarGrid = document.getElementById("calendarGrid");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const memoModal = document.getElementById("memoModal");
    const memoText = document.getElementById("memoText");
    const saveMemo = document.getElementById("saveMemo");
    const closeModal = document.getElementById("closeModal");
    const selectedDateDisplay = document.getElementById("selectedDate");
    const monthName = document.getElementById("monthName");

    let selectedDate = "";
    let memos = {}; // メモデータを保存
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    /** カレンダーを更新する関数 */
    function updateCalendar(year, month) {
        calendarGrid.innerHTML = "";
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        monthName.textContent = `${year}年${month + 1}月`;

        // 余白セルを追加（前月の最後の曜日に応じて）
        for (let i = 0; i < firstDay; i++) {
            let emptyCell = document.createElement("div");
            emptyCell.classList.add("day-cell", "empty");
            calendarGrid.appendChild(emptyCell);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            let dayCell = document.createElement("div");
            dayCell.classList.add("day-cell");
            dayCell.textContent = i;

            let formattedMonth = String(month + 1).padStart(2, "0");
            let formattedDay = String(i).padStart(2, "0");
            let dateStr = `${year}-${formattedMonth}-${formattedDay}`;
            dayCell.dataset.date = dateStr;

            let dayOfWeek = (firstDay + i - 1) % 7;
            if (dayOfWeek === 0) dayCell.classList.add("sunday");
            if (dayOfWeek === 6) dayCell.classList.add("saturday");

            // クリックでメモモーダルを開く
            dayCell.addEventListener("click", function () {
                selectedDate = this.dataset.date;
                selectedDateDisplay.textContent = `メモ - ${selectedDate}`;

                // メモの内容を表示（件数付き）


                memoModal.style.display = "flex";
            });

            calendarGrid.appendChild(dayCell);
        }

        loadMemos(); // メモを再ロード
    }

    /** メモを取得し、カレンダーに反映する */
    async function loadMemos() {
        try {
            const response = await fetch("/get_memos/");
            const data = await response.json();
            memos = data.memos; // メモデータを保存

            document.querySelectorAll(".day-cell").forEach(dayCell => {
                const date = dayCell.dataset.date;
                if (memos[date]) {
                    let memoIndicator = document.createElement("div");
                    memoIndicator.classList.add("memo-indicator");
                    memoIndicator.textContent = `${memos[date].length}件のメモ`;

                    // 既存のインジケーターを削除して新しいものを追加
                    let existingIndicator = dayCell.querySelector(".memo-indicator");
                    if (existingIndicator) {
                        existingIndicator.remove();
                    }
                    dayCell.appendChild(memoIndicator);
                }
            });
        } catch (error) {
            console.error("メモの取得に失敗しました:", error);
        }
    }

    /** メモを保存する */
    saveMemo.addEventListener("click", async function () {
        if (!selectedDate) return;
        let memoContent = memoText.value.trim();
        if (!memoContent) return;

        try {
            await fetch("/save_memo/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: selectedDate, text: memoContent }),
            });

            memoModal.style.display = "none";
            updateCalendar(currentYear, currentMonth);
        } catch (error) {
            console.error("メモの保存に失敗しました:", error);
        }
    });

    /** モーダルを閉じる */
    closeModal.addEventListener("click", function () {
        memoModal.style.display = "none";
    });

    /** 前月ボタン */
    prevMonthBtn.addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar(currentYear, currentMonth);
    });

    /** 次月ボタン */
    nextMonthBtn.addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar(currentYear, currentMonth);
    });

    // 📌 **ページ読み込み時にカレンダーを即座に表示**
    updateCalendar(currentYear, currentMonth);
});

async function loadMemos() {
    const response = await fetch("/get_memos/");
    const data = await response.json();
    const memos = data.memos;
    const memoCounts = data.memo_counts;

    document.querySelectorAll(".day-cell").forEach(dayCell => {
        const date = dayCell.dataset.date;
        dayCell.classList.remove("has-memo"); // メモがない状態にリセット

        if (memoCounts[date]) {
            let memoIndicator = document.createElement("div");
            memoIndicator.classList.add("memo-indicator");
            memoIndicator.textContent = `${memoCounts[date]}件のメモ`;
            dayCell.appendChild(memoIndicator);
            dayCell.classList.add("has-memo"); // メモがある日付にクラスを追加
        }
    });
}async function loadMemos() {
    const response = await fetch("/get_memos/");
    const data = await response.json();
    const memos = data.memos;
    const memoCounts = data.memo_counts;

    document.querySelectorAll(".day-cell").forEach(dayCell => {
        const date = dayCell.dataset.date;
        if (memoCounts[date]) {
            let memoIndicator = document.createElement("div");
            memoIndicator.classList.add("memo-indicator");
            memoIndicator.textContent = `${memoCounts[date]}件のメモ`;
            
            // 📌 メモがある日付のセルを強調
            dayCell.classList.add("has-memo");
            dayCell.appendChild(memoIndicator);
        }
    });
}

