import { getEl } from './utils.js';

const progressBarEl = getEl('#progress-bar');
const inputsEl = getEl('#inputs');
const contentEl = getEl('#content');
const listEl = getEl('#list');
const popupEl = getEl('#popup');
const groupEl = getEl('#group');

const demoDatas = [
    {
        id: 0,
        group: 'GITHUB',
        content: `README.md 작성`,
        check: true,
        regdate: new Date().getTime(),
    },
    {
        id: 1,
        group: 'SEO',
        content: `검색엔진 최적화`,
        check: true,
        regdate: new Date().getTime(),
    },
    {
        id: 2,
        group: 'FILE',
        content: `주석처리`,
        check: false,
        regdate: new Date().getTime(),
    },
    {
        id: 3,
        group: 'Test',
        content: `샘플`,
        check: false,
        regdate: new Date().getTime(),
    },
];

export { progressBarEl, inputsEl, contentEl, listEl, popupEl, groupEl, demoDatas };
