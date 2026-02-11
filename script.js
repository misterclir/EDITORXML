const tableBody = document.querySelector('#itemsTable tbody');
const headerRow = document.getElementById('headerRow');
const addButton = document.getElementById('addButton');
const downloadButton = document.getElementById('downloadButton');
const loadingBag = document.getElementById('loadingBag');
const addModal = document.getElementById('addModal');
const setHelmetSelect = document.getElementById('setHelmetSelect');
const sectionOldConfig = document.getElementById('sectionOldConfig');
const sectionNewConfig = document.getElementById('sectionNewConfig');
const bagStatus = document.getElementById('bagStatus');
const addDropInfoBtn = document.getElementById('addDropInfoBtn');
const totalItemsCount = document.getElementById('totalItemsCount');
const currentBagType = document.getElementById('currentBagType');
const itemsTableScroll = document.getElementById('itemsTableScroll');
const itemsTableScrollTop = document.getElementById('itemsTableScrollTop');
const itemsTableScrollTopInner = document.getElementById('itemsTableScrollTopInner');
const bulkEditBar = document.getElementById('bulkEditBar');
const bulkSelectedCount = document.getElementById('bulkSelectedCount');
const bulkEditOpenBtn = document.getElementById('bulkEditOpenBtn');
const bulkClearSelectionBtn = document.getElementById('bulkClearSelectionBtn');
const bulkEditModal = document.getElementById('bulkEditModal');
const bulkFields = document.getElementById('bulkFields');
const bulkCancelBtn = document.getElementById('bulkCancelBtn');
const bulkApplyBtn = document.getElementById('bulkApplyBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const navBagEditor = document.getElementById('navBagEditor');
const navSettings = document.getElementById('navSettings');
const pageEditor = document.getElementById('pageEditor');
const pageSettings = document.getElementById('pageSettings');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const uploadItemXml = document.getElementById('uploadItemXml');
const settingsItemXmlStatus = document.getElementById('settingsItemXmlStatus');
const clearItemXmlCacheBtn = document.getElementById('clearItemXmlCacheBtn');
const itemListStatus = document.getElementById('itemListStatus');

// Pagination & State
let items = [];
let dropInfos = [];
let bagType = null; // 'old' or 'new'
let itemOptions = new Map(); // Map<SectionIndex, Map<TypeIndex, Name>>
let originalFileName = 'NovaBag.xml';
let currentPage = 1;
const ITEMS_PER_PAGE = 50;
let currentEditingRowIndex = null;
let currentModalSection = null;

let isSyncingTableScroll = false;

const selectedRowIndices = new Set();
let selectionAnchorIndex = null;

const CLASSES = ['DW','DK','FE','MG','DL','SU','RF','GL','RW','SL','GC','KM','LM','IK','AL'];

// Configuração das Colunas
const COLUMNS_CONFIG = {
    old: [
        { key: 'MinLevel', label: 'Min\nLevel', width: '70px', type: 'number', min: 0, max: 15 },
        { key: 'MaxLevel', label: 'Max\nLevel', width: '70px', type: 'number', min: 0, max: 15 },
        { key: 'Durability', label: 'Dura', width: '80px', type: 'number', min: 0, max: 255 },
        { key: 'Skill', label: 'Skill', width: '60px', type: 'number', min: 0, max: 1 },
        { key: 'Luck', label: 'Luck', width: '60px', type: 'number', min: 0, max: 1 },
        { key: 'Option', label: 'Opt', width: '60px', type: 'number', min: 0, max: 7 },
        { key: 'Excellent', label: 'Exc', width: '70px', type: 'number', min: 0, max: 63 },
        { key: 'SetOption', label: 'Set\nOpt', width: '70px', type: 'number', min: 0, max: 255 },
        { key: 'SocketOption', label: 'Sock\nOpt', width: '80px', type: 'number', min: 0, max: 255 },
        { key: 'SocketProbalty', label: 'SockProb\n1-5', width: '160px', type: 'text' }
    ],
    new: [
        { key: 'DropGroup', label: 'Drop\nGroup', width: '70px', type: 'number', min: 0, max: 255 },
        { key: 'Level', label: 'Level', width: '60px', type: 'number', min: 0, max: 15 },
        { key: 'Grade', label: 'Grade', width: '60px', type: 'number', min: 0, max: 15 },
        { key: 'Durability', label: 'Dur', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Option0', label: 'Opt0', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Option1', label: 'Opt1', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Option2', label: 'Opt2', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Option3', label: 'Opt3', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Option4', label: 'Opt4', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Option5', label: 'Opt5', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Option6', label: 'Opt6', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'Attribute', label: 'Attr', width: '60px', type: 'number', min: 0, max: 255 },
        { key: 'ErrtelOptionLevel', label: 'Errtel\nLvl', width: '80px', type: 'number', min: 0, max: 255 },
        { key: 'Duration', label: 'Duration', width: '90px', type: 'number', min: 0, max: 2147483647 }
    ]
};

// --- Initialization ---


// --- Event Listeners ---

document.getElementById('uploadBag').addEventListener('change', handleFileUpload);
addButton.addEventListener('click', () => { addModal.classList.remove('hidden'); });
downloadButton.addEventListener('click', downloadXML);
addDropInfoBtn.addEventListener('click', () => {
    dropInfos.push(createDefaultDropInfo());
    renderDropInfos();
});
document.getElementById('itemSearch').addEventListener('input', (e) => filterModalItems(e.target.value));

if (bulkEditOpenBtn) bulkEditOpenBtn.addEventListener('click', () => openBulkEditModal());
if (bulkClearSelectionBtn) bulkClearSelectionBtn.addEventListener('click', clearSelection);
if (bulkCancelBtn) bulkCancelBtn.addEventListener('click', closeBulkEditModal);
if (bulkApplyBtn) bulkApplyBtn.addEventListener('click', applyBulkEdit);

initTableHorizontalScrollSync();

initApp();

function initApp() {
    initSidebarBehavior();
    initNavigation();
    initItemXmlSettings();
    loadItemXmlFromCache();
    updateBulkBar();
}

function isMobileViewport() {
    return window.matchMedia('(max-width: 1024px)').matches;
}

function setSidebarHidden(isHidden) {
    document.body.classList.toggle('sidebar-hidden', isHidden);
}

function toggleSidebar() {
    const nextHidden = !document.body.classList.contains('sidebar-hidden');
    setSidebarHidden(nextHidden);
    try {
        localStorage.setItem('sidebarHidden', String(nextHidden));
    } catch (_) {}
}

function initSidebarBehavior() {
    let initialHidden = isMobileViewport();
    try {
        const saved = localStorage.getItem('sidebarHidden');
        if (saved === 'true') initialHidden = true;
        if (saved === 'false') initialHidden = false;
    } catch (_) {}

    setSidebarHidden(initialHidden);

    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => setSidebarHidden(true));

    window.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (document.body.classList.contains('sidebar-hidden')) return;
        if (!isMobileViewport()) return;
        setSidebarHidden(true);
    });
}

function setActivePage(pageKey) {
    if (pageEditor) pageEditor.classList.toggle('hidden', pageKey !== 'editor');
    if (pageSettings) pageSettings.classList.toggle('hidden', pageKey !== 'settings');

    if (navBagEditor) navBagEditor.classList.toggle('active', pageKey === 'editor');
    if (navSettings) navSettings.classList.toggle('active', pageKey === 'settings');

    if (pageTitle && pageSubtitle) {
        if (pageKey === 'settings') {
            pageTitle.textContent = 'Settings';
            pageSubtitle.textContent = 'Gerencie o Item.xml e preferências do editor.';
        } else {
            pageTitle.textContent = 'Event Bag Editor';
            pageSubtitle.textContent = 'Gerencie drops e configurações de bags facilmente.';
        }
    }

    if (downloadButton) downloadButton.classList.toggle('hidden', pageKey !== 'editor');

    if (isMobileViewport()) setSidebarHidden(true);
}

function initNavigation() {
    if (navBagEditor) navBagEditor.addEventListener('click', () => setActivePage('editor'));
    if (navSettings) navSettings.addEventListener('click', () => setActivePage('settings'));
    setActivePage('editor');
}

const ITEMXML_DB_NAME = 'mudevs-bag-editor';
const ITEMXML_DB_VERSION = 1;
const ITEMXML_STORE = 'files';
const ITEMXML_KEY = 'Item.xml';

function openItemXmlDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(ITEMXML_DB_NAME, ITEMXML_DB_VERSION);
        req.onerror = () => reject(req.error);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(ITEMXML_STORE)) {
                db.createObjectStore(ITEMXML_STORE, { keyPath: 'name' });
            }
        };
        req.onsuccess = () => resolve(req.result);
    });
}

async function idbGetFile(name) {
    const db = await openItemXmlDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(ITEMXML_STORE, 'readonly');
        const store = tx.objectStore(ITEMXML_STORE);
        const req = store.get(name);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result || null);
    });
}

async function idbPutFile(record) {
    const db = await openItemXmlDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(ITEMXML_STORE, 'readwrite');
        const store = tx.objectStore(ITEMXML_STORE);
        const req = store.put(record);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve();
    });
}

async function idbDeleteFile(name) {
    const db = await openItemXmlDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(ITEMXML_STORE, 'readwrite');
        const store = tx.objectStore(ITEMXML_STORE);
        const req = store.delete(name);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve();
    });
}

function setHtmlStatus(el, html) {
    if (!el) return;
    el.innerHTML = html;
}

function formatPtDate(value) {
    try {
        return new Date(value).toLocaleString('pt-BR');
    } catch (_) {
        return '';
    }
}

function getItemImageUrl(section, type) {
    const s = String(section ?? '').trim();
    const t = String(type ?? '').trim();
    if (!s || !t) return '';
    return `Item/${encodeURIComponent(s)}/${encodeURIComponent(t)}.png`;
}

function parseItemXmlText(text) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'application/xml');
    if (xmlDoc.querySelector('parsererror')) throw new Error('XML inválido');

    const sections = xmlDoc.querySelectorAll('Section');
    if (sections.length === 0) throw new Error('Nenhuma seção encontrada no Item.xml');

    const nextOptions = new Map();
    let itemsCount = 0;

    sections.forEach(sec => {
        const secIndex = parseInt(sec.getAttribute('Index') || '0');
        const secName = sec.getAttribute('Name') || 'Sem nome';

        if (!nextOptions.has(secIndex)) nextOptions.set(secIndex, { name: secName, items: new Map() });

        sec.querySelectorAll('Item').forEach(itemNode => {
            const type = parseInt(itemNode.getAttribute('Index') || '0');
            const name = itemNode.getAttribute('Name') || 'Sem nome';
            nextOptions.get(secIndex).items.set(type, name);
            itemsCount += 1;
        });
    });

    return { options: nextOptions, sectionsCount: sections.length, itemsCount };
}

function populateHelmetSelect() {
    if (!setHelmetSelect) return;
    if (!itemOptions || itemOptions.size === 0) {
        setHelmetSelect.innerHTML = '';
        return;
    }

    if (itemOptions.has(7)) {
        setHelmetSelect.innerHTML = '<option value="">Escolha o Helmet</option>';
        itemOptions.get(7).items.forEach((name, type) => {
            setHelmetSelect.innerHTML += `<option value="${type}">${name} (Type ${type})</option>`;
        });
    } else {
        setHelmetSelect.innerHTML = '';
    }
}

function resolveItemNamesForLoadedBag() {
    if (!items || items.length === 0) return;
    if (!itemOptions || itemOptions.size === 0) return;

    let changed = false;
    items.forEach(item => {
        if (!item) return;
        if (!itemOptions.has(item.Section)) return;
        const nameMap = itemOptions.get(item.Section).items;
        if (!nameMap.has(item.Type)) return;
        const nextName = nameMap.get(item.Type);
        if (item.Name !== nextName) {
            item.Name = nextName;
            changed = true;
        }
    });

    if (changed) renderPage();
}

function applyItemXmlText(text, meta = {}) {
    const parsed = parseItemXmlText(text);
    itemOptions = parsed.options;
    populateHelmetSelect();
    renderModalSections();
    resolveItemNamesForLoadedBag();

    const when = meta.savedAt ? ` • Cache: ${formatPtDate(meta.savedAt)}` : '';
    const details = `${parsed.sectionsCount} seções • ${parsed.itemsCount} itens${when}`;

    setHtmlStatus(itemListStatus, `<div class="text-green-400 font-medium">Item.xml pronto!</div><div class="text-xs text-gray-500 mt-1">${details}</div>`);
    setHtmlStatus(settingsItemXmlStatus, `<div class="text-green-400 font-medium">Item.xml em cache</div><div class="text-xs text-gray-500 mt-1">${details}</div>`);
}

function setItemXmlMissingUi() {
    itemOptions = new Map();
    populateHelmetSelect();
    renderModalSections();
    setHtmlStatus(itemListStatus, '<div class="text-yellow-400 font-medium">Item.xml não carregado. Envie em Settings.</div>');
    setHtmlStatus(settingsItemXmlStatus, '<div class="text-yellow-400 font-medium">Nenhum Item.xml em cache.</div>');
}

function setItemXmlErrorUi(message) {
    itemOptions = new Map();
    populateHelmetSelect();
    renderModalSections();
    setHtmlStatus(itemListStatus, `<div class="text-red-400 font-medium">${message}</div>`);
    setHtmlStatus(settingsItemXmlStatus, `<div class="text-red-400 font-medium">${message}</div>`);
}

async function loadItemXmlFromCache() {
    setHtmlStatus(itemListStatus, '<div class="text-gray-400">Carregando Item.xml do cache...</div>');
    setHtmlStatus(settingsItemXmlStatus, '<div class="text-gray-400">Carregando Item.xml do cache...</div>');

    try {
        const record = await idbGetFile(ITEMXML_KEY);
        if (!record || !record.text) {
            setItemXmlMissingUi();
            return;
        }

        applyItemXmlText(record.text, { savedAt: record.savedAt, originalName: record.originalName });
    } catch (e) {
        setItemXmlErrorUi('Falha ao ler o cache do Item.xml');
    }
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => resolve(String(reader.result || ''));
        reader.readAsText(file);
    });
}

function initItemXmlSettings() {
    if (uploadItemXml) {
        uploadItemXml.addEventListener('change', handleItemXmlUpload);
    }
    if (clearItemXmlCacheBtn) {
        clearItemXmlCacheBtn.addEventListener('click', clearItemXmlCache);
    }
}

async function handleItemXmlUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
        setHtmlStatus(settingsItemXmlStatus, '<div class="text-gray-400">Lendo arquivo...</div>');
        const text = await readFileAsText(file);
        applyItemXmlText(text, { savedAt: Date.now(), originalName: file.name });
        await idbPutFile({
            name: ITEMXML_KEY,
            originalName: file.name,
            text,
            savedAt: Date.now(),
            size: text.length
        });

        if (isMobileViewport()) setSidebarHidden(true);
    } catch (err) {
        setItemXmlErrorUi(err && err.message ? err.message : 'Falha ao processar Item.xml');
    } finally {
        if (uploadItemXml) uploadItemXml.value = '';
    }
}

async function clearItemXmlCache() {
    try {
        await idbDeleteFile(ITEMXML_KEY);
    } catch (_) {}

    closeItemSelector();
    setItemXmlMissingUi();
}

// --- File Handling ---

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    originalFileName = file.name;
    loadingBag.style.display = 'flex';
    bagStatus.innerHTML = '<span class="text-yellow-400">Processando arquivo...</span>';

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "application/xml");

            items = [];
            dropInfos = [];
            selectedRowIndices.clear();
            selectionAnchorIndex = null;
            tableBody.innerHTML = '';
            sectionOldConfig.classList.add('hidden');
            sectionNewConfig.classList.add('hidden');

            const bagConfigOld = xmlDoc.getElementsByTagName('BagConfig')[0];
            const bagConfigEx = xmlDoc.getElementsByTagName('BagConfigEx')[0];

            if (bagConfigOld && !bagConfigEx) {
                bagType = 'old';
                loadOldConfig(bagConfigOld, xmlDoc);
                sectionOldConfig.classList.remove('hidden');
                currentBagType.textContent = 'Common Bag';
            } else if (bagConfigEx && !bagConfigOld) {
                bagType = 'new';
                loadNewConfig(bagConfigEx, xmlDoc);
                sectionNewConfig.classList.remove('hidden');
                currentBagType.textContent = 'EX Bag';
            } else {
                throw new Error('Tipo de bag não reconhecido');
            }

            totalItemsCount.textContent = items.length;
            currentPage = 1;
            updateTableHeaders();
            renderPage();
            renderPagination();

            updateBulkBar();
            
            bagStatus.innerHTML = '<div class="text-green-400 font-medium">Arquivo carregado com sucesso!</div>';
        } catch (error) {
            console.error(error);
            bagStatus.innerHTML = `<div class="text-red-400">Erro: ${error.message}</div>`;
        } finally {
            loadingBag.style.display = 'none';
        }
    };
    reader.readAsText(file);
}

// --- Rendering & Pagination ---

function updateTableHorizontalScrollbar() {
    if (!itemsTableScroll || !itemsTableScrollTop || !itemsTableScrollTopInner) return;

    const itemsTable = document.getElementById('itemsTable');
    if (!itemsTable) return;

    const tableWidth = itemsTable.scrollWidth;
    itemsTableScrollTopInner.style.width = `${tableWidth}px`;

    const hasOverflow = tableWidth > itemsTableScroll.clientWidth + 1;
    itemsTableScrollTop.classList.toggle('hidden', !hasOverflow);

    if (!hasOverflow) {
        itemsTableScrollTop.scrollLeft = 0;
        itemsTableScroll.scrollLeft = 0;
    }
}

function initTableHorizontalScrollSync() {
    if (!itemsTableScroll || !itemsTableScrollTop) return;

    itemsTableScrollTop.addEventListener('scroll', () => {
        if (isSyncingTableScroll) return;
        isSyncingTableScroll = true;
        itemsTableScroll.scrollLeft = itemsTableScrollTop.scrollLeft;
        isSyncingTableScroll = false;
    });

    itemsTableScroll.addEventListener('scroll', () => {
        if (isSyncingTableScroll) return;
        isSyncingTableScroll = true;
        itemsTableScrollTop.scrollLeft = itemsTableScroll.scrollLeft;
        isSyncingTableScroll = false;
    });

    window.addEventListener('resize', updateTableHorizontalScrollbar);
    updateTableHorizontalScrollbar();
}

function getCurrentPageRowIndices() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, items.length);
    const indices = [];
    for (let i = start; i < end; i++) {
        if (items[i]) indices.push(i);
    }
    return indices;
}

function updateSelectAllCheckboxState() {
    const selectAll = document.getElementById('selectAllRows');
    if (!selectAll) return;

    const indices = getCurrentPageRowIndices();
    if (indices.length === 0) {
        selectAll.indeterminate = false;
        selectAll.checked = false;
        return;
    }

    const selectedCount = indices.reduce((acc, i) => acc + (selectedRowIndices.has(i) ? 1 : 0), 0);
    selectAll.checked = selectedCount === indices.length;
    selectAll.indeterminate = selectedCount > 0 && selectedCount < indices.length;
}

function toggleRowSelection(index, isSelected) {
    if (isSelected) selectedRowIndices.add(index);
    else selectedRowIndices.delete(index);
    updateSelectAllCheckboxState();
    updateBulkBar();
}

function handleRowCheckboxClick(event, index) {
    const desired = event.target.checked;

    if (event.shiftKey && selectionAnchorIndex !== null) {
        const a = Math.min(selectionAnchorIndex, index);
        const b = Math.max(selectionAnchorIndex, index);

        for (let i = a; i <= b; i++) {
            if (!items[i]) continue;
            if (desired) selectedRowIndices.add(i);
            else selectedRowIndices.delete(i);
        }

        renderPage();
    } else {
        toggleRowSelection(index, desired);
    }

    selectionAnchorIndex = index;
}

function toggleSelectAllCurrentPage(isSelected) {
    getCurrentPageRowIndices().forEach(i => {
        if (isSelected) selectedRowIndices.add(i);
        else selectedRowIndices.delete(i);
    });
    selectionAnchorIndex = null;
    renderPage();
}

function clearSelection() {
    selectedRowIndices.clear();
    selectionAnchorIndex = null;
    renderPage();
}

function updateBulkBar() {
    if (!bulkEditBar || !bulkSelectedCount) return;
    const count = selectedRowIndices.size;
    bulkSelectedCount.textContent = String(count);
    bulkEditBar.classList.toggle('hidden', count === 0);
}

function openBulkEditModal(focusKey = null) {
    if (!bulkEditModal) return;
    if (!bagType) return;

    renderBulkFields();
    clearBulkInputs();
    bulkEditModal.classList.remove('hidden');

    if (focusKey) {
        setTimeout(() => {
            const input = document.getElementById(`bulk_${focusKey}`);
            if (!input) return;
            input.focus();
            if (typeof input.select === 'function') input.select();
        }, 0);
    }
}

function closeBulkEditModal() {
    if (!bulkEditModal) return;
    bulkEditModal.classList.add('hidden');
}

function clearBulkInputs() {
    if (!bulkFields) return;
    bulkFields.querySelectorAll('input').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') return;
        input.value = '';
    });
}

function renderBulkFields() {
    if (!bulkFields) return;
    if (!bagType) return;

    bulkFields.innerHTML = '';

    COLUMNS_CONFIG[bagType].forEach(col => {
        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-1';
        wrapper.dataset.key = col.key;

        const label = document.createElement('label');
        label.className = 'block text-xs font-medium text-gray-400';
        label.textContent = col.label.replace(/\n/g, ' ');

        const input = document.createElement('input');
        input.id = `bulk_${col.key}`;
        input.type = col.type;
        input.placeholder = 'Manter';
        input.className = 'w-full px-3 py-2 text-sm';

        if (col.type === 'number') {
            if (Number.isFinite(col.min)) input.min = String(col.min);
            if (Number.isFinite(col.max)) input.max = String(col.max);
        }

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        bulkFields.appendChild(wrapper);
    });
}

function getBulkTargetMode() {
    const checked = document.querySelector('input[name="bulkTarget"]:checked');
    return checked ? checked.value : 'selected';
}

function getBulkTargetIndices(mode) {
    if (mode === 'all') {
        const indices = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i]) indices.push(i);
        }
        return indices;
    }

    if (mode === 'page') {
        return getCurrentPageRowIndices();
    }

    return Array.from(selectedRowIndices);
}

function applyBulkEdit() {
    if (!bagType) return;
    const targetMode = getBulkTargetMode();
    const indices = getBulkTargetIndices(targetMode);
    if (indices.length === 0) return;

    const apply = [];
    COLUMNS_CONFIG[bagType].forEach(col => {
        const input = document.getElementById(`bulk_${col.key}`);
        if (!input) return;

        const raw = String(input.value ?? '').trim();
        if (raw === '') return;

        if (col.key === 'SocketProbalty') {
            apply.push({ key: col.key, value: raw, type: 'socket' });
            return;
        }

        if (col.type === 'number') {
            let num = Number(raw);
            if (!Number.isFinite(num)) return;
            if (Number.isFinite(col.min)) num = Math.max(col.min, num);
            if (Number.isFinite(col.max)) num = Math.min(col.max, num);
            apply.push({ key: col.key, value: num, type: 'number' });
            return;
        }

        apply.push({ key: col.key, value: raw, type: 'text' });
    });

    if (apply.length === 0) return;

    indices.forEach(i => {
        if (!items[i]) return;
        apply.forEach(change => {
            if (change.type === 'socket') {
                updateSockets(i, change.value);
                return;
            }
            items[i][change.key] = change.value;
        });
    });

    renderPage();
    renderPagination();
    closeBulkEditModal();
}

function updateTableHeaders() {
    if (!bagType) return;

    const itemsTable = document.getElementById('itemsTable');
    itemsTable.style.minWidth = bagType === 'new' ? '1376px' : '1156px';
    
    headerRow.innerHTML = '';

    const thSelect = document.createElement('th');
    thSelect.className = 'text-[10px] text-center font-semibold text-gray-300 uppercase tracking-wider';
    thSelect.style.width = '56px';
    thSelect.innerHTML = '<input id="selectAllRows" type="checkbox" class="rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500" aria-label="Selecionar todos na página">';
    headerRow.appendChild(thSelect);
    
    // Item Column
    const thItem = document.createElement('th');
    thItem.className = 'text-[10px] text-left font-semibold text-gray-300 uppercase tracking-wider';
    thItem.style.width = '360px';
    thItem.style.paddingLeft = '16px';
    thItem.textContent = 'Item';
    headerRow.appendChild(thItem);

    // Dynamic Columns
    COLUMNS_CONFIG[bagType].forEach(col => {
        const th = document.createElement('th');
        th.className = 'text-[10px] text-center font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white';
        th.style.width = col.width;
        th.innerHTML = col.label.replace(/\n/g, '<br>');
        th.title = 'Clique para editar essa coluna em massa';
        th.addEventListener('click', () => {
            if (selectedRowIndices.size === 0) return;
            openBulkEditModal(col.key);
        });
        headerRow.appendChild(th);
    });

    // Action Column
    const thAction = document.createElement('th');
    thAction.className = 'text-[10px] text-center font-semibold text-gray-300 uppercase tracking-wider';
    thAction.style.width = '64px';
    thAction.textContent = 'Ação';
    headerRow.appendChild(thAction);

    const selectAll = document.getElementById('selectAllRows');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => toggleSelectAllCurrentPage(e.target.checked));
        updateSelectAllCheckboxState();
    }

    updateTableHorizontalScrollbar();
}

function renderPage() {
    tableBody.innerHTML = '';
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, items.length);

    if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%" class="text-center py-8 text-gray-500">Nenhum item nesta bag.</td></tr>';
        updateTableHorizontalScrollbar();
        updateSelectAllCheckboxState();
        updateBulkBar();
        return;
    }

    const fragment = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
        if (items[i]) {
            fragment.appendChild(createRow(items[i], i));
        }
    }
    tableBody.appendChild(fragment);

    updateTableHorizontalScrollbar();

    updateSelectAllCheckboxState();
    updateBulkBar();
}

function renderPagination() {
    const container = document.getElementById('paginationControls');
    container.innerHTML = '';
    
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    // Helper to create buttons
    const createBtn = (text, page, isActive = false, isDisabled = false) => {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${isActive ? 'active bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        btn.textContent = text;
        btn.disabled = isDisabled;
        if (!isDisabled) {
            btn.onclick = () => {
                currentPage = page;
                renderPage();
                renderPagination();
            };
        }
        return btn;
    };

    // Previous
    container.appendChild(createBtn('Anterior', currentPage - 1, false, currentPage === 1));

    // Page Numbers (Smart range)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
        container.appendChild(createBtn('1', 1));
        if (startPage > 2) container.appendChild(document.createTextNode('...'));
    }

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createBtn(i, i, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) container.appendChild(document.createTextNode('...'));
        container.appendChild(createBtn(totalPages, totalPages));
    }

    // Next
    container.appendChild(createBtn('Próximo', currentPage + 1, false, currentPage === totalPages));
}

function createRow(item, index) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-800/50 transition-colors h-16 border-b border-gray-800';

    let displayName = item.Name || '(Item Desconhecido)';
    let displaySection = '';
    
    // Resolve name from Item.xml if possible
    if (itemOptions.has(item.Section) && itemOptions.get(item.Section).items.has(item.Type)) {
        displayName = itemOptions.get(item.Section).items.get(item.Type);
    }
    
    if (itemOptions.has(item.Section)) {
        displaySection = itemOptions.get(item.Section).name;
    }

    const isSelected = selectedRowIndices.has(index);

    const itemImgUrl = getItemImageUrl(item.Section, item.Type);

    let html = `
        <td class="text-center">
            <input type="checkbox" ${isSelected ? 'checked' : ''}
                class="rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                aria-label="Selecionar item"
                onclick="handleRowCheckboxClick(event, ${index})">
        </td>

        <td style="padding-left: 16px;">
            <div class="flex items-center gap-3 cursor-pointer group" onclick="openItemSelector(${index})">
                <div class="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden group-hover:bg-indigo-500 transition-colors">
                    <img src="${itemImgUrl}" alt="" class="w-full h-full object-contain p-1" loading="lazy"
                        onload="this.nextElementSibling.classList.add('hidden')"
                        onerror="this.classList.add('hidden')">
                    <i class="fa-solid fa-cube text-indigo-400 group-hover:text-white transition-colors"></i>
                </div>
                <div>
                    <div class="font-semibold text-white text-sm leading-snug bag-item-name group-hover:text-indigo-300 transition-colors">${displayName}</div>
                    <div class="text-[11px] text-gray-500">Sec: ${item.Section} (${displaySection}) | Type: ${item.Type}</div>
                </div>
            </div>
        </td>
    `;

    // Dynamic Cells
    COLUMNS_CONFIG[bagType].forEach(col => {
        const val = item[col.key] !== undefined ? item[col.key] : 0;
        
        if (col.key === 'SocketProbalty') {
            const socketVal = `${item.SocketProbalty1},${item.SocketProbalty2},${item.SocketProbalty3},${item.SocketProbalty4},${item.SocketProbalty5}`;
            html += `
                <td class="text-center">
                    <input type="text" value="${socketVal}" 
                        class="table-input bg-gray-900 border border-gray-700 rounded text-center text-gray-300 focus:border-indigo-500 focus:outline-none"
                        onchange="updateSockets(${index}, this.value)">
                </td>`;
        } else {
            html += `
                <td class="text-center">
                    <input type="number" value="${val}" min="${col.min}" max="${col.max}"
                        class="table-input bg-gray-900 border border-gray-700 rounded text-center text-gray-300 focus:border-indigo-500 focus:outline-none"
                        onchange="updateField(${index}, '${col.key}', this.value)">
                </td>`;
        }
    });

    // Delete Action
    html += `
        <td class="text-center px-2">
            <button onclick="removeRow(${index})" class="text-gray-500 hover:text-red-500 transition-colors p-2">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    `;

    row.innerHTML = html;
    return row;
}

// --- Data Management ---

function updateField(index, field, value) {
    if(items[index]) items[index][field] = Number(value);
}

function updateSockets(index, value) {
    if(!items[index]) return;
    const vals = value.split(',').map(v => Number(v.trim()) || 0);
    items[index].SocketProbalty1 = vals[0] || 0;
    items[index].SocketProbalty2 = vals[1] || 0;
    items[index].SocketProbalty3 = vals[2] || 0;
    items[index].SocketProbalty4 = vals[3] || 0;
    items[index].SocketProbalty5 = vals[4] || 0;
}

function removeRow(index) {
    if(confirm('Remover este item?')) {
        items.splice(index, 1);

        const nextSelected = new Set();
        selectedRowIndices.forEach(i => {
            if (i === index) return;
            nextSelected.add(i > index ? i - 1 : i);
        });
        selectedRowIndices.clear();
        nextSelected.forEach(i => selectedRowIndices.add(i));

        renderPage();
        renderPagination();
        totalItemsCount.textContent = items.length;
    }
}

// --- Modal Item Selector Logic ---

function renderModalSections() {
    const list = document.getElementById('selectorSectionList');
    // Keep header
    list.innerHTML = '<div class="p-4 border-b border-gray-700 font-bold text-white bg-gray-800 sticky top-0">Categorias</div>';
    
    const sortedSections = Array.from(itemOptions.keys()).sort((a,b) => a - b);
    
    sortedSections.forEach(secIndex => {
        const data = itemOptions.get(secIndex);
        const div = document.createElement('div');
        div.className = `p-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors border-l-2 border-transparent`;
        div.textContent = `${data.name} (${secIndex})`;
        div.dataset.sec = secIndex;
        div.onclick = () => loadSectionItems(secIndex, div);
        list.appendChild(div);
    });
}

function loadSectionItems(secIndex, elementBtn = null) {
    currentModalSection = secIndex;
    const grid = document.getElementById('selectorItemGrid');
    const title = document.getElementById('selectorTitle');
    
    // Highlight active section
    if (elementBtn) {
        document.querySelectorAll('#selectorSectionList div').forEach(d => {
            d.classList.remove('bg-gray-800', 'text-white', 'border-indigo-500');
            d.classList.add('border-transparent');
        });
        elementBtn.classList.add('bg-gray-800', 'text-white', 'border-indigo-500');
        elementBtn.classList.remove('border-transparent');
    }

    const data = itemOptions.get(secIndex);
    title.textContent = `${data.name} (Section ${secIndex})`;
    
    grid.innerHTML = '';
    const sortedItems = Array.from(data.items.entries()).sort((a,b) => a[0] - b[0]);

    if (sortedItems.length === 0) {
        grid.innerHTML = '<div class="text-center text-gray-500 mt-10">Nenhum item nesta categoria.</div>';
        return;
    }

    // Grid Layout
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3';

    sortedItems.forEach(([type, name]) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-800 p-3 rounded border border-gray-700 hover:border-indigo-500 hover:bg-gray-700 cursor-pointer transition-all flex flex-col items-center text-center gap-2 group item-card';
        card.dataset.name = name.toLowerCase();
        card.onclick = () => selectItemFromModal(secIndex, type, name);

        const imgUrl = getItemImageUrl(secIndex, type);

        card.innerHTML = `
            <div class="w-12 h-12 rounded bg-gray-900 flex items-center justify-center overflow-hidden">
                <img src="${imgUrl}" alt="" class="w-full h-full object-contain p-1" loading="lazy"
                    onload="this.nextElementSibling.classList.add('hidden')"
                    onerror="this.classList.add('hidden')">
                <span class="text-xs font-bold text-gray-500 group-hover:text-indigo-400">${type}</span>
            </div>
            <div class="text-xs text-gray-300 group-hover:text-white font-medium line-clamp-2">${name}</div>
        `;
        gridContainer.appendChild(card);
    });

    grid.appendChild(gridContainer);
}

function filterModalItems(term) {
    if (!term) {
        document.querySelectorAll('.item-card').forEach(el => el.classList.remove('hidden'));
        return;
    }
    term = term.toLowerCase();
    document.querySelectorAll('.item-card').forEach(el => {
        const name = el.dataset.name;
        if (name.includes(term)) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });
}

function openItemSelector(rowIndex) {
    if (!itemOptions || itemOptions.size === 0) {
        setActivePage('settings');
        return;
    }

    currentEditingRowIndex = rowIndex;
    document.getElementById('itemSelectorModal').classList.remove('hidden');
    
    // If row has item, try to open that section
    const item = items[rowIndex];
    if (item && itemOptions.has(item.Section)) {
        // Find the section div and click it to load
        const secDiv = document.querySelector(`#selectorSectionList div[data-sec="${item.Section}"]`);
        if (secDiv) secDiv.click();
    }
}

function closeItemSelector() {
    document.getElementById('itemSelectorModal').classList.add('hidden');
    currentEditingRowIndex = null;
}

function selectItemFromModal(sec, type, name) {
    if (currentEditingRowIndex === null) return;
    
    items[currentEditingRowIndex].Section = sec;
    items[currentEditingRowIndex].Type = type;
    items[currentEditingRowIndex].Name = name;
    
    // Refresh specific row or whole page? Refresh page is safer/easier
    renderPage();
    closeItemSelector();
}

// --- Helper Functions ---

function createDefaultDropInfo() {
    return {
        Index: 0, Section: 5, SectionRate: 10000, MoneyAmount: 0, OptionValue: 0,
        AccountLevels: [true, true, true, true],
        Classes: Array(15).fill(true)
    };
}

function addCommonItem() {
    const newItem = { Section: 0, Type: 0, Name: 'Novo Item' };
    
    // Default values based on bag type
    if (bagType === 'old') {
        newItem.MinLevel = 0; newItem.MaxLevel = 0; newItem.Durability = 0;
        newItem.Skill = 0; newItem.Luck = 0; newItem.Option = 0;
        newItem.Excellent = 0; newItem.SetOption = 0; newItem.SocketOption = 0;
        newItem.SocketProbalty1 = 0; newItem.SocketProbalty2 = 0; newItem.SocketProbalty3 = 0;
        newItem.SocketProbalty4 = 0; newItem.SocketProbalty5 = 0;
    } else {
        newItem.DropGroup = 0; newItem.Level = 0; newItem.Grade = 0;
        newItem.Durability = 0; newItem.Option0 = 0; newItem.Option1 = 0;
        newItem.Option2 = 0; newItem.Option3 = 0; newItem.Option4 = 0;
        newItem.Option5 = 0; newItem.Option6 = 0; newItem.Attribute = 0;
        newItem.ErrtelOptionLevel = 0; newItem.Duration = 0;
    }

    items.push(newItem);
    totalItemsCount.textContent = items.length;
    
    // Go to last page
    currentPage = Math.ceil(items.length / ITEMS_PER_PAGE);
    renderPagination();
    renderPage();
    
    closeModal();
}

function addFullSet() {
    const helmetType = parseInt(setHelmetSelect.value);
    if (isNaN(helmetType)) return;
    
    const baseTypes = [helmetType, helmetType + 1, helmetType + 2, helmetType + 3, helmetType + 4]; // Helm, Armor, Pant, Glove, Boot
    const sections = [7, 8, 9, 10, 11];
    
    baseTypes.forEach((type, i) => {
        const newItem = { Section: sections[i], Type: type, Name: 'Set Item' };
        // Add defaults... (simplified for brevity)
        if (bagType === 'old') { newItem.MinLevel = 0; newItem.MaxLevel = 0; newItem.Durability = 255; }
        else { newItem.Level = 0; newItem.Grade = 0; newItem.Durability = 255; }
        
        // Resolve Name
        if (itemOptions.has(sections[i]) && itemOptions.get(sections[i]).items.has(type)) {
            newItem.Name = itemOptions.get(sections[i]).items.get(type);
        }
        items.push(newItem);
    });

    totalItemsCount.textContent = items.length;
    currentPage = Math.ceil(items.length / ITEMS_PER_PAGE);
    renderPagination();
    renderPage();
    closeModal();
}

function closeModal() {
    addModal.classList.add('hidden');
}

// --- Loaders ---

function loadOldConfig(bagConfig, xmlDoc) {
    document.getElementById('bagName').value = bagConfig.getAttribute('Name') || '';
    document.getElementById('dropZen').value = bagConfig.getAttribute('DropZen') || 0;
    document.getElementById('itemDropRate').value = bagConfig.getAttribute('ItemDropRate') || 10000;
    document.getElementById('itemDropCount').value = bagConfig.getAttribute('ItemDropCount') || 1;
    document.getElementById('setItemDropRate').value = bagConfig.getAttribute('SetItemDropRate') || 0;
    document.getElementById('itemDropType').value = bagConfig.getAttribute('ItemDropType') || 0;
    document.getElementById('fireworks').value = bagConfig.getAttribute('Fireworks') || 1;

    const itemNodes = xmlDoc.getElementsByTagName('Item');
    for (let i = 0; i < itemNodes.length; i++) {
        loadItem(itemNodes[i], 'old');
    }
}

function loadNewConfig(bagConfigEx, xmlDoc) {
    const config = bagConfigEx.getElementsByTagName('Config')[0] || {};
    document.getElementById('configExIndex').value = config.getAttribute('Index') || 0;
    document.getElementById('configExDropRate').value = config.getAttribute('DropRate') || 10000;
    document.getElementById('configExEqualAttr').value = config.getAttribute('EqualAttributes') || 0;

    // Load DropInfos
    dropInfos = [];
    const dropInfoNodes = xmlDoc.getElementsByTagName('DropInfo');
    if (dropInfoNodes.length > 0) {
        for(let i=0; i<dropInfoNodes.length; i++) {
            const node = dropInfoNodes[i];
            let info = {
                Index: node.getAttribute('Index') || 0,
                Section: node.getAttribute('Section') || 5,
                SectionRate: node.getAttribute('SectionRate') || 10000,
                MoneyAmount: node.getAttribute('MoneyAmount') || 0,
                OptionValue: node.getAttribute('OptionValue') || 0,
                AccountLevels: ['0','1','2','3'].map(l => node.getAttribute('AccountLevel'+l) === '1'),
                Classes: CLASSES.map(c => node.getAttribute(c) === '1')
            };
            dropInfos.push(info);
        }
    } else {
        dropInfos.push(createDefaultDropInfo());
    }
    renderDropInfos();

    const ruudInfo = xmlDoc.getElementsByTagName('RuudInfo')[0] || {};
    document.getElementById('ruudSection').value = ruudInfo.getAttribute('Section') || 5;
    document.getElementById('ruudMin').value = ruudInfo.getAttribute('RuudMin') || 100;
    document.getElementById('ruudMax').value = ruudInfo.getAttribute('RuudMax') || 100;

    const itemNodes = xmlDoc.getElementsByTagName('ItemEx');
    for (let i = 0; i < itemNodes.length; i++) {
        loadItem(itemNodes[i], 'new');
    }
}

function loadItem(node, type) {
    let item = {};
    if (type === 'old') {
        item.Section = parseInt(node.getAttribute('Section') || 0);
        item.Type = parseInt(node.getAttribute('Type') || 0);
        item.MinLevel = parseInt(node.getAttribute('MinLevel') || 0);
        item.MaxLevel = parseInt(node.getAttribute('MaxLevel') || 0);
        item.Durability = parseInt(node.getAttribute('Durability') || 0);
        item.Skill = parseInt(node.getAttribute('Skill') || 0);
        item.Luck = parseInt(node.getAttribute('Luck') || 0);
        item.Option = parseInt(node.getAttribute('Option') || 0);
        item.Excellent = parseInt(node.getAttribute('Excellent') || 0);
        item.SetOption = parseInt(node.getAttribute('SetOption') || 0);
        item.SocketOption = parseInt(node.getAttribute('SocketOption') || 0);
        // Socket Probabilities
        item.SocketProbalty1 = parseInt(node.getAttribute('SocketProbalty1') || 0);
        item.SocketProbalty2 = parseInt(node.getAttribute('SocketProbalty2') || 0);
        item.SocketProbalty3 = parseInt(node.getAttribute('SocketProbalty3') || 0);
        item.SocketProbalty4 = parseInt(node.getAttribute('SocketProbalty4') || 0);
        item.SocketProbalty5 = parseInt(node.getAttribute('SocketProbalty5') || 0);
    } else {
        // EX Bag
        const indexVal = parseInt(node.getAttribute('Index') || 0);
        item.Section = Math.floor(indexVal / 512);
        item.Type = indexVal % 512;
        
        item.DropGroup = parseInt(node.getAttribute('DropGroup') || 0);
        item.Level = parseInt(node.getAttribute('Level') || 0);
        item.Grade = parseInt(node.getAttribute('Grade') || 0);
        item.Durability = parseInt(node.getAttribute('Durability') || 0);
        item.Option0 = parseInt(node.getAttribute('Option0') || 0);
        item.Option1 = parseInt(node.getAttribute('Option1') || 0);
        item.Option2 = parseInt(node.getAttribute('Option2') || 0);
        item.Option3 = parseInt(node.getAttribute('Option3') || 0);
        item.Option4 = parseInt(node.getAttribute('Option4') || 0);
        item.Option5 = parseInt(node.getAttribute('Option5') || 0);
        item.Option6 = parseInt(node.getAttribute('Option6') || 0);
        item.Attribute = parseInt(node.getAttribute('Attribute') || 0);
        item.ErrtelOptionLevel = parseInt(node.getAttribute('ErrtelOptionLevel') || 0);
        item.Duration = parseInt(node.getAttribute('Duration') || 0);
    }
    
    // Attempt name resolution
    if (itemOptions.has(item.Section) && itemOptions.get(item.Section).items.has(item.Type)) {
        item.Name = itemOptions.get(item.Section).items.get(item.Type);
    } else {
        item.Name = `Item ${item.Section}-${item.Type}`;
    }

    items.push(item);
}

function renderDropInfos() {
    const container = document.getElementById('dropInfoContainer');
    container.innerHTML = '';
    
    dropInfos.forEach((info, index) => {
        const div = document.createElement('div');
        div.className = 'bg-gray-800 p-6 rounded-lg border border-gray-700 relative shadow-sm mb-4';
        
        // Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex justify-between items-center mb-4 border-b border-gray-700 pb-2';
        headerDiv.innerHTML = `<h4 class="text-sm font-bold text-indigo-400 uppercase tracking-wide">DropInfo #${index + 1}</h4>`;
        
        if (dropInfos.length > 0) {
            const btnRemove = document.createElement('button');
            btnRemove.className = 'text-red-400 hover:text-white hover:bg-red-500/20 px-2 py-1 rounded text-xs font-bold transition-colors';
            btnRemove.innerHTML = '<i class="fa-solid fa-trash mr-1"></i> REMOVER';
            btnRemove.onclick = () => {
                dropInfos.splice(index, 1);
                renderDropInfos();
            };
            headerDiv.appendChild(btnRemove);
        }
        div.appendChild(headerDiv);

        // Inputs
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4';
        
        const createInput = (label, key, min=0, max=null) => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `<label class="block text-xs font-medium mb-1.5 text-gray-400">${label}</label>`;
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-gray-200';
            input.value = info[key];
            input.min = min;
            if (max) input.max = max;
            input.onchange = (e) => { dropInfos[index][key] = e.target.value; };
            wrapper.appendChild(input);
            return wrapper;
        };

        gridDiv.appendChild(createInput('Index', 'Index'));
        gridDiv.appendChild(createInput('Section', 'Section'));
        gridDiv.appendChild(createInput('SectionRate (0-10000)', 'SectionRate', 0, 10000));
        gridDiv.appendChild(createInput('MoneyAmount', 'MoneyAmount'));
        gridDiv.appendChild(createInput('OptionValue', 'OptionValue'));
        
        div.appendChild(gridDiv);

        // Checkboxes
        const checkGrid = document.createElement('div');
        checkGrid.className = 'grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-gray-900/50 p-3 rounded';
        
        ['0','1','2','3'].forEach((l, i) => {
            const label = document.createElement('label');
            label.className = 'flex items-center text-gray-400 cursor-pointer hover:text-white';
            label.innerHTML = `<input type="checkbox" class="mr-2 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500" ${info.AccountLevels[i] ? 'checked' : ''}> AccountLevel${l}`;
            label.querySelector('input').onchange = (e) => { dropInfos[index].AccountLevels[i] = e.target.checked; };
            checkGrid.appendChild(label);
        });
        
        CLASSES.forEach((c, i) => {
            const label = document.createElement('label');
            label.className = 'flex items-center text-gray-400 cursor-pointer hover:text-white';
            label.innerHTML = `<input type="checkbox" class="mr-2 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500" ${info.Classes[i] ? 'checked' : ''}> ${c}`;
            label.querySelector('input').onchange = (e) => { dropInfos[index].Classes[i] = e.target.checked; };
            checkGrid.appendChild(label);
        });

        div.appendChild(checkGrid);
        container.appendChild(div);
    });
}

function downloadXML() {
    let xmlContent = '<?xml version="1.0" encoding="utf-8"?>\n';
    
    if (bagType === 'old') {
        xmlContent += '<BagConfig ';
        xmlContent += `Name="${document.getElementById('bagName').value}" `;
        xmlContent += `DropZen="${document.getElementById('dropZen').value}" `;
        xmlContent += `ItemDropRate="${document.getElementById('itemDropRate').value}" `;
        xmlContent += `ItemDropCount="${document.getElementById('itemDropCount').value}" `;
        xmlContent += `SetItemDropRate="${document.getElementById('setItemDropRate').value}" `;
        xmlContent += `ItemDropType="${document.getElementById('itemDropType').value}" `;
        xmlContent += `Fireworks="${document.getElementById('fireworks').value}">\n`;

        items.forEach(item => {
            if(!item) return;
            xmlContent += `\t<Item Section="${item.Section}" Type="${item.Type}" MinLevel="${item.MinLevel}" MaxLevel="${item.MaxLevel}" Durability="${item.Durability}" Skill="${item.Skill}" Luck="${item.Luck}" Option="${item.Option}" Excellent="${item.Excellent}" SetOption="${item.SetOption}" SocketOption="${item.SocketOption}" SocketProbalty1="${item.SocketProbalty1}" SocketProbalty2="${item.SocketProbalty2}" SocketProbalty3="${item.SocketProbalty3}" SocketProbalty4="${item.SocketProbalty4}" SocketProbalty5="${item.SocketProbalty5}" />\n`;
        });
        xmlContent += '</BagConfig>';
    } else {
        xmlContent += '<BagConfigEx>\n';
        xmlContent += `\t<Config Index="${document.getElementById('configExIndex').value}" DropRate="${document.getElementById('configExDropRate').value}" EqualAttributes="${document.getElementById('configExEqualAttr').value}" />\n`;

        dropInfos.forEach(info => {
            let line = `\t<DropInfo Index="${info.Index}" Section="${info.Section}" SectionRate="${info.SectionRate}" MoneyAmount="${info.MoneyAmount}" OptionValue="${info.OptionValue}" `;
            info.AccountLevels.forEach((v, i) => line += `AccountLevel${i}="${v?1:0}" `);
            CLASSES.forEach((c, i) => line += `${c}="${info.Classes[i]?1:0}" `);
            line += '/>\n';
            xmlContent += line;
        });

        xmlContent += `\t<RuudInfo Section="${document.getElementById('ruudSection').value}" RuudMin="${document.getElementById('ruudMin').value}" RuudMax="${document.getElementById('ruudMax').value}" />\n`;

        items.forEach(item => {
            if(!item) return;
            const indexVal = (item.Section * 512) + item.Type;
            xmlContent += `\t<ItemEx Index="${indexVal}" DropGroup="${item.DropGroup}" Level="${item.Level}" Grade="${item.Grade}" Option0="${item.Option0}" Option1="${item.Option1}" Option2="${item.Option2}" Option3="${item.Option3}" Option4="${item.Option4}" Option5="${item.Option5}" Option6="${item.Option6}" Attribute="${item.Attribute}" ErrtelOptionLevel="${item.ErrtelOptionLevel}" Duration="${item.Duration}" />\n`;
        });

        xmlContent += '</BagConfigEx>';
    }

    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFileName;
    a.click();
    window.URL.revokeObjectURL(url);
}
