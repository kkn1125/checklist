import { getEl, PipeLine } from './modules/utils.js';

import * as templates from './modules/template.js';
import { contentEl, demoDatas, inputsEl, listEl, popupEl } from './modules/element.js';

const checkList = (function () {
    function Controller() {
        let models, pipeline;

        this.init = function (model) {
            models   = model;
            pipeline = new PipeLine();

            pipeline.addPipe(window.addEventListener, 'click', this.deleteList);
            pipeline.addPipe(window.addEventListener, 'click', this.addList);
            pipeline.addPipe(
                window.addEventListener,
                'click',
                this.checkContents
            );
            pipeline.excute();
        };

        this.checkContents = function (e) {
            const target = e.target;
            const listItem = target.closest('.list-item');
            if (!listItem || target.classList.contains('delete')) return;

            models.checkContents(parseInt(listItem.id));
        };

        this.addList = function (e) {
            const target = e.target;

            const MIN_TEXT = contentEl.minLength;
            const MAX_TEXT = contentEl.maxLength;

            const CONTENT_LENGTH = contentEl.value.length;
            const MINIMUM_TEXT   = MIN_TEXT <= CONTENT_LENGTH;
            const MAXIMUM_TEXT   = CONTENT_LENGTH <= MAX_TEXT;
            const IS_OVERRANGE   = MINIMUM_TEXT && MAXIMUM_TEXT;
            const CLASS_LIST     = contentEl.classList;

            if (target.id !== 'add') return;

            if (contentEl.value === '' || !IS_OVERRANGE) {
                CLASS_LIST.add('invalid');
                models.addPopupStack(
                    '입력 에러',
                    `빈 칸 또는 ${MIN_TEXT}자 ~ ${MAX_TEXT}자 내로 작성하셔야합니다!`
                );
                setTimeout(() => {
                    CLASS_LIST.remove('invalid');
                }, 5000);
                return;
            }

            pipeline.addPipe(CLASS_LIST.remove.bind(CLASS_LIST), 'invalid');
            pipeline.addPipe(
                models.addList.bind(models),
                group.value,
                contentEl.value
            );
            pipeline.addPipe(
                function () {
                    this.value = '';
                }.bind(contentEl)
            );
            pipeline.addPipe(
                function () {
                    this.value = '';
                }.bind(group)
            );

            pipeline.addPipe(group.focus.bind(group));
            pipeline.excute();
        };

        this.deleteList = function (e) {
            const target = e.target;
            if (!target.classList.contains('delete')) return;
            const id = parseInt(target.dataset.id);
            const isDel = confirm(`${id}번 항목을 삭제하시겠습니까?`);

            if (isDel) models.deleteList(id);
        };
    }

    function Model() {
        let checkList = [], isInitial = null, checkId = 0, views, pipeline;

        function counting() {
            const findMax = [...checkList].map((item) => item.id);

            checkId = findMax.length > 0 ? Math.max(...findMax) + 1 : 0;
        }

        this.init = function (view) {
            views = view;
            pipeline = new PipeLine();
            checkList = this.getList();
            counting();

            this.useDemo();

            this.saveAndUpdate(checkList);
        };

        this.useDemo = function () {
            if (localStorage['checklist']) return;
            demoDatas.forEach(demo =>
                pipeline.addPipe(checkList.push.bind(checkList), demo)
                );
            pipeline.excute();
        };

        this.addPopupStack = function (name, content) {
            views.showPopupStack({
                name,
                content,
                regdate: new Date().getTime(),
            });
        };

        this.checkContents = function (id) {
            checkList.forEach((item) => {
                if (item.id === id) {
                    item.check = !item.check;
                }
            });

            this.saveAndUpdate(checkList);
        };

        this.addList = function (groupName, content, check = false) {
            const group = groupName || 'none';
            const data = {
                id: checkId++,
                group,
                content,
                check,
                regdate: new Date().getTime(),
            };

            checkList.push(data);
            this.saveAndUpdate(checkList);
        };

        this.deleteList = function (id) {
            checkList = checkList.filter((item) => item.id !== id);
            this.saveAndUpdate(checkList);
        };

        this.initialOn = function () {
            isInitial = true;
        }

        this.initialOff = function () {
            isInitial = false;
        }

        // 저장 및 업데이트 (상태관리)
        this.saveAndUpdate = function (dataList) {
            this.initialOn();
            this.saveList(dataList);

            checkList = this.getList();

            this.initialOff();
            this.update(dataList);
        };

        // 저장 - localStorage
        this.saveList = function (dataList) {
            if (!isInitial) return;
            localStorage['checklist'] = JSON.stringify(dataList);
        };

        // 가져오기 - localStorage
        this.getList = function () {
            if (!isInitial && isInitial != null) return;

            return localStorage['checklist']
                ? JSON.parse(localStorage['checklist'])
                : [];
        };

        this.update = function (dataList) {
            views.update(dataList);
        };
    }

    function View() {
        let options;

        this.init = function (option) {
            options = option;
            inputsEl.insertAdjacentHTML(
                'beforeend',
                templates.button(['add', -1, '추가'])
            );
        };

        this.showPopupStack = function (popupInfo) {
            popupEl.insertAdjacentHTML('afterbegin', templates.popup(popupInfo));
            this.popupAnimating();
        };

        this.popupAnimating = function () {
            const CHILDREN = popupEl.children;
            let count = 0;
            let loop = setInterval(() => {
                count++;
                if (count == 5) {
                    Array.last(CHILDREN).classList.add('out');
                }
                if (count > 5) {
                    Array.last(CHILDREN).remove();
                    clearInterval(loop);
                }
            }, 1000);
        };

        this.update = function (dataList) {
            this.clearList();
            listEl.insertAdjacentHTML('beforeend', templates.list(dataList));
        };

        this.clearList = function () {
            listEl.innerHTML = '';
        };
    }

    return {
        init(option) {
            const controller = new Controller();
            const model = new Model();
            const view = new View();

            view.init(option);
            model.init(view);
            controller.init(model);
        },
    };
})();

const option = {};

checkList.init(option);
