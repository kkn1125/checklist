import { progressBarEl } from "./element.js";
import { classnames } from "./utils.js";

function drawProcessGaugeWithPercent (checkList) {
    // 체크리스트 완료 개수
    const done = checkList.filter((item) => item.check).length;
    // 체크리스트 전체 개수
    const total = checkList.length;
    // 퍼센트 소수점 둘째자리까지 구하기
    const percent = parseFloat((done / total) * 100 || 0).toFixed(2);
    // 정수일 때 소수점 제거하기
    const resultPercent =
        percent % parseInt(percent) === 0 ? parseInt(percent) : percent;

    progressBarEl.setAttribute('style', `width: ${resultPercent}%`);
    progressBarEl.setAttribute('aria-valuenow', resultPercent);
    progressBarEl.innerHTML = `${resultPercent}% (${done}/${total})`;
};

function popup({ name, content, regdate }) {
    return `<div class="popup-stack">
        <span class="popup-name">${name}</span>
        <span class="popup-content">${content}</span>
        <span class="popup-regdate">${regdate.format(
            'yyyy. MM. dd HH:mm',
            true
        )}</span>
    </div>`;
}

function list(lists) {
    // 그룹명으로 정렬
    lists = lists.sort((a, b) => {
        return a.group.charCodeAt(0) - b.group.charCodeAt(0);
    });

    // 프로세스 게이지에 퍼센트 그리기
    drawProcessGaugeWithPercent(lists);

    if (lists.length > 0) {
        return lists
            .map(
                (list) => `<li
        id="${list.id}"
        class="list-item"
        ${list.check ? 'check' : ''}>
        <div class="group">${list.group}</div>
        ${this.dropdown(list)}
        ${this.button(['', list.id, '&times;', 'danger'])}
        </li>`
            )
            .join('');
    } else {
        return `<li class="list-item">등록된 체크리스트가 없습니다.</li>`;
    }
}

function dropdown(info) {
    return `<span class="item">
        <span class="contents">${info.content}</span>
        <time>${info.regdate.format('yyyy. MM. dd HH:mm', true)}</time>
    </span>`;
}

function button([type, id = 0, content = 'content', color = 'info', outline]) {
    return `<button
    ${type ? `id="${type}"` : ''}
    ${id > -1 ? `data-id="${id}"` : ''}
    class="${classnames(id > -1 ? 'delete' : '', 'button', color, {
        outline,
    })}">
    ${content}
    </button>`;
}

export { popup, list, dropdown, button };
