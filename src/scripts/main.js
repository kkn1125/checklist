const checkList = (function () {
    const app = document.querySelector('#app');
    const add = document.querySelector('#add');
    const progress = document.querySelector('#progress');
    const progressBar = document.querySelector('#progress-bar');
    const inputs = document.querySelector('#inputs');
    const content = document.querySelector('#content');
    const list = document.querySelector('#list')
    const popup = document.querySelector('#popup');

    function Controller () {
        let models;
        
        this.init = function (model) {
            models = model;

            window.addEventListener('click', this.deleteList);
            window.addEventListener('click', this.addList);
            window.addEventListener('click', this.checkContents);
        }

        this.checkContents = function (e) {
            const target = e.target;
            const listItem = target.closest('.list-item')
            // console.log(target.closest('.list-item'), target.classList.contains('delete'))
            if(!listItem || target.classList.contains('delete')) return;

            // const parent = target.offsetParent;

            models.checkContents(parseInt(listItem.id));
        }

        this.addList = function (e) {
            const target = e.target;

            const contentLength = content.value.length;
            const MIN_TEXT = content.minLength;
            const MAX_TEXT = content.maxLength;
            const isOverRange = MIN_TEXT <= contentLength && contentLength <= MAX_TEXT;
            
            if(target.id !== 'add') return;

            if(content.value === '' || !isOverRange) {
                content.classList.add('invalid');
                models.addPopupStack('입력 에러', `빈 칸 또는 ${MIN_TEXT}자 ~ ${MAX_TEXT}자 내로 작성하셔야합니다!`);
                setTimeout(() => {
                    content.classList.remove('invalid');
                }, 5000);
                return;
            }

            content.classList.remove('invalid');
            models.addList(content.value);
            content.value = '';
            content.focus();
        }

        this.deleteList = function (e) {
            const target = e.target;
            if(!target.classList.contains('delete')) return;
            const id = parseInt(target.dataset.id);
            const isDel = confirm(`${id}번 항목을 삭제하시겠습니까?`);

            if(isDel) models.deleteList(id);
        }
    }

    function Model () {
        let userCheckList = [], isUsable = null, count = 0, views;

        function counting() {
            const findMax = [...userCheckList].map(item => item.id);
            
            count = findMax.length > 0?
            Math.max(...findMax) + 1:
            0;
        }

        this.init = function (view) {
            views = view;
            userCheckList = this.getList();
            counting();

            this.useDemo();

            this.saveAndUpdate(userCheckList);
        }

        this.useDemo = function () {
            if(localStorage['checklist']) return;
            userCheckList.push({
                id: 0,
                group: 'GITHUB',
                content: `README.md 작성`,
                check: false,
                regdate: new Date().getTime(),
            },{
                id: 1,
                group: 'SEO',
                content: `검색엔진 최적화`,
                check: false,
                regdate: new Date().getTime(),
            },{
                id: 2,
                group: 'FILE',
                content: `주석처리`,
                check: false,
                regdate: new Date().getTime(),
            },{
                id: 3,
                group: 'Test',
                content: `샘플`,
                check: false,
                regdate: new Date().getTime(),
            })
        }

        this.addPopupStack = function (name, content) {
            views.showPopupStack({
                name,
                content,
                regdate: new Date().getTime(),
            });
        }

        this.checkContents = function (id) {
            userCheckList.forEach(item => {
                if(item.id === id) {
                    item.check = !item.check;
                }
            });

            this.saveAndUpdate(userCheckList);
        }

        this.addList = function (content, check=false) {
            let group = 'none';

            content = content.replace(/@{(.+)}/g, ($a, $1) => {
                group = $1.trim();
                return '';
            }).trim();

            userCheckList.push({
                id: count++,
                group,
                content,
                check,
                regdate: new Date().getTime(),
            });

            this.saveAndUpdate(userCheckList);
        }

        this.deleteList = function (id) {
            userCheckList = userCheckList.filter(item => item.id !== id);

            this.saveAndUpdate(userCheckList);
        }

        // 저장 및 업데이트 (상태관리)
        this.saveAndUpdate = function(dataList) {
            isUsable = true;
            this.saveList(dataList);
            userCheckList = this.getList();
            isUsable = false;
            this.update(dataList);
        }

        // 저장 - localStorage
        this.saveList = function (dataList) {
            if(!isUsable) return;

            localStorage["checklist"] = JSON.stringify(dataList);
        }

        // 가져오기 - localStorage
        this.getList = function () {
            if(!isUsable && isUsable != null) return;

            return localStorage["checklist"]?
            JSON.parse(localStorage["checklist"]):
            [];
        }

        this.update = function (dataList) {
            views.update(dataList);
        }
    }

    function View () {
        let options, templates;

        function format(form, isPad = false) {
            return form.replace(/yyyy|MM|dd|HH|mm|ss|SSS|AP/g, ($1) => {
                const times = new Date(this);

                switch($1) {
                    case 'yyyy': return times.getFullYear().toString().padStart((isPad ? 2 : 0), 0);
                    case 'MM': return times.getMonth().toString().padStart((isPad ? 2 : 0), 0);
                    case 'dd': return times.getDay().toString().padStart((isPad ? 2 : 0), 0);
                    case 'HH': return times.getHours().toString().padStart((isPad ? 2 : 0), 0);
                    case 'mm': return times.getMinutes().toString().padStart((isPad ? 2 : 0), 0);
                    case 'ss': return times.getSeconds().toString().padStart((isPad ? 2 : 0), 0);
                    case 'SSS': return times.getMilliseconds();
                    case 'AP': return times.getHours()>12?'PM':'AM';
                }

                return $1;
            });
        }
        Date.prototype.format = format;
        Number.prototype.format = format;

        this.init = function (option, template) {
            options = option;
            templates = template;

            inputs.insertAdjacentHTML('beforeend', templates.button('add', {id: -1, content: '추가'}));
        }

        this.showPopupStack = function ({name, content, regdate}) {
            popup.insertAdjacentHTML('afterbegin', `
                <div class="popup-stack">
                    <span class="popup-name">${name}</span>
                    <span class="popup-content">${content}</span>
                    <span class="popup-regdate">${regdate.format('yyyy. MM. dd HH:mm', true)}</span>
                </div>
            `);
            
            let count = 0;

            let loop = setInterval(() => {
                count++;
                if(count == 5) {
                    popup.children[popup.children.length-1].classList.add('out');
                }
                if(count>5) {
                    popup.children[popup.children.length-1].remove();
                    clearInterval(loop);
                }
            }, 1000);
        }

        this.update = function (dataList) {
            this.clearList();
            list.insertAdjacentHTML('beforeend', templates.list(dataList));
        }

        this.clearList = function () {
            list.innerHTML = '';
        }
    }

    function Template() {
        function classnames() {
            let temp = [];
            
            [...arguments].forEach(item => {
                if(typeof item === 'object') {
                    const key = Object.keys(item).pop();
                    if (item[key]) temp.push(key);
                } else {
                    if(item) temp.push(item);
                }
            });

            return temp.join(' ');
        }

        this.progressGauge = function(percent, done, total) {
            progressBar.setAttribute('style', `width: ${percent}%`);
            progressBar.setAttribute('aria-valuenow', percent);
            progressBar.innerHTML = `${percent}% (${done}/${total})`;
        }

        this.list = function (lists) {
            lists = lists.sort((a, b) => {
                return a.group.charCodeAt(0) - b.group.charCodeAt(0)
            });
            const done = lists.filter(item => item.check).length;
            const total = lists.length;
            
            const progress = parseFloat((done / total).toFixed(2)) * 100 || 0;
            
            this.progressGauge(progress, done, total);

            if(lists.length>0) {
                return lists.map(list => `
                <li
                id="${list.id}"
                class="list-item"
                ${list.check?'check':''}>
                <div class="group">${list.group}</div>
                ${this.dropdown(list)}
                ${this.button('', {id: list.id, content: '&times;'}, 'danger')}
                </li>
                `).join('');
            } else {
                return `<li class="list-item">등록된 체크리스트가 없습니다.</li>`;
            }
        }

        this.dropdown = function (info) {
            return `<span
            class="item">
                <span class="contents">${info.content}</span>
                <time>${info.regdate.format('yyyy. MM. dd', true)}</time>
            </span>`;
        }

        this.button = function (type, {id = 0, content = 'content'}, color='info', outline) {
            return `<button
            ${type?`id="${type}"`:''}
            ${id>-1?`data-id="${id}"`:''}
            class="${classnames(id>-1?'delete':'', 'button', color, {outline})}">
            ${content}
            </button>`;
        }
    }
    
    return {
        init(option) {
            const controller = new Controller();
            const model = new Model();
            const view = new View();
            const template = new Template();

            view.init(option, template);
            model.init(view);
            controller.init(model);
        }
    }
})();

const option = {

};

checkList.init(option);