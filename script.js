document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const inscriptionTypeItems = document.querySelectorAll('#text-content .product-item[data-type]');
    const chineseStyleGrid = document.querySelector('#text-content .chinese-style');
    const englishStyleGrid = document.querySelector('#text-content .english-style');

    // --- 核心：标签页切换逻辑 ---
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                const activeContent = document.getElementById(`${tabId}-content`);
                if (activeContent) {
                    activeContent.classList.add('active');
                } else {
                    console.error(`Tab content with ID '${tabId}-content' not found.`);
                }
            });
        });
    } else {
        console.error('Tab buttons or tab contents not found. Tab switching will not work.');
    }

    // --- 印风类型切换逻辑 ---
    if (inscriptionTypeItems.length > 0 && chineseStyleGrid && englishStyleGrid) {
        inscriptionTypeItems.forEach(item => {
            item.addEventListener('click', (event) => { // event parameter is useful if stopping propagation etc.
                // Visual feedback for selected inscription type
                inscriptionTypeItems.forEach(it => it.classList.remove('selected-inscription'));
                item.classList.add('selected-inscription');

                const type = item.getAttribute('data-type');
                if (type === 'chinese') {
                    chineseStyleGrid.style.display = 'grid'; // Assuming product-grid uses grid
                    englishStyleGrid.style.display = 'none';
                } else if (type === 'english') {
                    chineseStyleGrid.style.display = 'none';
                    englishStyleGrid.style.display = 'grid';
                }
                // Note: Price calculation will be handled by the generic product item click listener
            });
        });

        // Initialize inscription style visibility based on HTML or a default
        // The HTML already sets display:none for english-style, so chinese-style is visible by default.
        // If you want to dynamically set the first one as "selected-inscription":
        // const firstInscriptionType = document.querySelector('#text-content .product-item[data-type]');
        // if (firstInscriptionType) {
        //     firstInscriptionType.classList.add('selected-inscription');
        //     // And trigger its style display if needed, though HTML default is usually fine
        // }

    } else {
        console.warn('Inscription type items or style grids not fully found. Style switching might be affected.');
    }


    // --- 产品选择、价格计算与摘要 ---
    const allProductItems = document.querySelectorAll('.product-item'); // Select all, including those without price (like印风)
    const quantityInput = document.getElementById('quantity');
    const finalPriceDisplay = document.getElementById('final-price');
    const discountedPriceDisplay = document.getElementById('discounted-price');
    const selectedItemsList = document.getElementById('selected-items');

    let selections = {
        stone: null,
        inscriptionText: null, // For "中文" or "英文" type selection with price
        inscriptionStyle: null, // For specific style like "汉玉印" (no price)
        sideDesign: null, // For 边款设计
        accessoryBox: null,
        accessoryInkpad: null, // 新增印泥选项
        accessoryTassel: null
    };

    function updateSelectionAndPrice() {
        if (!finalPriceDisplay || !discountedPriceDisplay || !selectedItemsList || !quantityInput) {
            console.error('One or more pricing/summary elements are missing from the DOM.');
            return;
        }

        let currentTotalPrice = 0;
        selectedItemsList.innerHTML = ''; // Clear previous selections

        // Helper to add item to summary
        function addItemToSummary(name, price, categoryDetail) {
            const listItem = document.createElement('li');
            let text = `${categoryDetail}: ${name}`;
            if (price !== undefined && price !== null) { // Only add price if it exists
                 text += ` (${price}元)`;
            }
            listItem.textContent = text;
            selectedItemsList.appendChild(listItem);
        }

        // 印石
        if (selections.stone) {
            currentTotalPrice += parseFloat(selections.stone.getAttribute('data-price'));
            addItemToSummary(selections.stone.getAttribute('data-name'), parseFloat(selections.stone.getAttribute('data-price')), '印石');
        }
        // 印文类型 (中文/英文)
        if (selections.inscriptionText) {
            currentTotalPrice += parseFloat(selections.inscriptionText.getAttribute('data-price'));
            addItemToSummary(selections.inscriptionText.getAttribute('data-name'), parseFloat(selections.inscriptionText.getAttribute('data-price')), '印文类型');
        }
        // 印风类型 (e.g., 汉玉印 - no price)
        if (selections.inscriptionStyle) {
            addItemToSummary(selections.inscriptionStyle.getAttribute('data-name'), null, '印风');
        }
        // 边款设计
        if (selections.sideDesign) {
            currentTotalPrice += parseFloat(selections.sideDesign.getAttribute('data-price'));
            addItemToSummary(selections.sideDesign.getAttribute('data-name'), parseFloat(selections.sideDesign.getAttribute('data-price')), '边款设计');
        }
        // 配件 - 礼盒
        if (selections.accessoryBox) {
            currentTotalPrice += parseFloat(selections.accessoryBox.getAttribute('data-price'));
            addItemToSummary(selections.accessoryBox.getAttribute('data-name'), parseFloat(selections.accessoryBox.getAttribute('data-price')), '礼盒礼袋');
        }
        // 配件 - 印泥 (新增)
        if (selections.accessoryInkpad) {
            currentTotalPrice += parseFloat(selections.accessoryInkpad.getAttribute('data-price'));
            addItemToSummary(selections.accessoryInkpad.getAttribute('data-name'), parseFloat(selections.accessoryInkpad.getAttribute('data-price')), '印泥');
        }
        // 配件 - 流苏
        if (selections.accessoryTassel) {
            currentTotalPrice += parseFloat(selections.accessoryTassel.getAttribute('data-price'));
            addItemToSummary(selections.accessoryTassel.getAttribute('data-name'), parseFloat(selections.accessoryTassel.getAttribute('data-price')), '流苏');
        }


        const quantity = parseInt(quantityInput.value) || 1;
        const totalBeforeDiscount = currentTotalPrice * quantity;

        finalPriceDisplay.textContent = `${totalBeforeDiscount.toFixed(2)}元`;

        let discountRate = 1;
        if (totalBeforeDiscount >= 100000) discountRate = 0.85;
        else if (totalBeforeDiscount >= 50000) discountRate = 0.87;
        else if (totalBeforeDiscount >= 10000) discountRate = 0.89;
        else if (totalBeforeDiscount >= 5000) discountRate = 0.92;
        else if (totalBeforeDiscount >= 600) discountRate = 0.95;

        const discountedTotal = totalBeforeDiscount * discountRate;
        discountedPriceDisplay.textContent = `${discountedTotal.toFixed(2)}元`;
        discountedPriceDisplay.style.color = 'gold'; // 金色字体
        discountedPriceDisplay.style.fontWeight = 'bold';
        finalPriceDisplay.style.fontWeight = 'bold'; // 最终价格加粗
    }

    if (allProductItems.length > 0) {
        allProductItems.forEach(item => {
            item.addEventListener('click', () => {
                const parentTabContent = item.closest('.tab-content');
                const parentSubCategory = item.closest('.sub-category');
                let currentCategoryItems = [];

                // Determine the group for single selection
                if (parentTabContent && parentTabContent.id === 'stone-content') {
                    currentCategoryItems = parentTabContent.querySelectorAll('.product-item');
                    selections.stone = item.classList.contains('selected') ? null : item; // Store/clear selection
                } else if (parentSubCategory) {
                    currentCategoryItems = parentSubCategory.querySelectorAll('.product-item');
                    const subCategoryTitle = parentSubCategory.querySelector('h3').textContent;
                    if (subCategoryTitle === '印文类型') {
                        selections.inscriptionText = item.classList.contains('selected') ? null : item;
                        // This click is already handled by inscriptionTypeItems listener for style switching
                    } else if (subCategoryTitle === '印风类型') {
                        selections.inscriptionStyle = item.classList.contains('selected') ? null : item;
                    } else if (subCategoryTitle === '边款设计') {
                        selections.sideDesign = item.classList.contains('selected') ? null : item;
                    } else if (subCategoryTitle === '礼盒礼袋') {
                        selections.accessoryBox = item.classList.contains('selected') ? null : item;
                    } else if (subCategoryTitle === '印泥') { // 新增
                        selections.accessoryInkpad = item.classList.contains('selected') ? null : item;
                    } else if (subCategoryTitle === '流苏') {
                        selections.accessoryTassel = item.classList.contains('selected') ? null : item;
                    }
                }


                // Toggle 'selected' class: deselect others in the group, then toggle current
                let wasSelected = item.classList.contains('selected');
                currentCategoryItems.forEach(sibling => sibling.classList.remove('selected'));
                if (!wasSelected) { // If it wasn't selected, select it now
                    item.classList.add('selected');
                     // Update selection object based on new selection
                    if (parentTabContent && parentTabContent.id === 'stone-content') selections.stone = item;
                    else if (parentSubCategory) {
                        const subCategoryTitle = parentSubCategory.querySelector('h3').textContent;
                        if (subCategoryTitle === '印文类型') selections.inscriptionText = item;
                        else if (subCategoryTitle === '印风类型') selections.inscriptionStyle = item;
                        else if (subCategoryTitle === '边款设计') selections.sideDesign = item;
                        else if (subCategoryTitle === '礼盒礼袋') selections.accessoryBox = item;
                        else if (subCategoryTitle === '印泥') selections.accessoryInkpad = item; // 新增
                        else if (subCategoryTitle === '流苏') selections.accessoryTassel = item;
                    }

                } else { // If it was selected, it's now deselected, so clear from selections object
                     if (parentTabContent && parentTabContent.id === 'stone-content') selections.stone = null;
                     else if (parentSubCategory) {
                        const subCategoryTitle = parentSubCategory.querySelector('h3').textContent;
                        if (subCategoryTitle === '印文类型') selections.inscriptionText = null;
                        else if (subCategoryTitle === '印风类型') selections.inscriptionStyle = null;
                        else if (subCategoryTitle === '边款设计') selections.sideDesign = null;
                        else if (subCategoryTitle === '礼盒礼袋') selections.accessoryBox = null;
                        else if (subCategoryTitle === '印泥') selections.accessoryInkpad = null; // 新增
                        else if (subCategoryTitle === '流苏') selections.accessoryTassel = null;
                    }
                }
                updateSelectionAndPrice();
            });
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('input', updateSelectionAndPrice);
    }

    // Initial price calculation
    updateSelectionAndPrice();


    // --- 完成定制按钮 ---
    const completeButton = document.getElementById('complete-btn');
    if (completeButton) {
        completeButton.addEventListener('click', () => {
            alert('正在准备生成定制图片单...');
            generateOrderImage();
        });
    } else {
        console.warn('Complete button not found.');
    }

    function generateOrderImage() {
        // Element to capture: could be the whole body, or a specific summary section
        // For this example, let's try to capture a div that wraps all selections and price.
        // You might need to add such a wrapper in your HTML or select multiple elements.
        // For simplicity, let's assume you have a section like <section class="order-summary-for-image">
        // that you want to capture. If not, document.body is a fallback.
        const elementToCapture = document.querySelector('.selection-summary') || document.body;

        if (typeof html2canvas === 'undefined') {
            console.log('html2canvas not loaded, attempting to load...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoVBL5g+e9iwTgZe6/8YKEMDTpd1Q ==';
            script.crossOrigin = 'anonymous';
            script.referrerPolicy = 'no-referrer';
            script.onload = () => {
                console.log('html2canvas loaded successfully.');
                captureAndDownload(elementToCapture);
            };
            script.onerror = () => {
                alert('无法加载html2canvas库，图片生成失败。请检查网络连接或手动在HTML中引入该库。');
                console.error('Failed to load html2canvas library.');
            };
            document.head.appendChild(script);
        } else {
            captureAndDownload(elementToCapture);
        }
    }

    function captureAndDownload(element) {
        html2canvas(element, {
            backgroundColor: '#ffffff', // Explicitly set background
            useCORS: true, // If you have images from other domains
            logging: true, // Enable logging for debugging html2canvas
            scale: 2 // Increase scale for better resolution
        }).then(canvas => {
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = '读印企业定制单.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert('定制图片单已生成并开始下载！');
        }).catch(err => {
            console.error('html2canvas failed:', err);
            alert(`生成图片失败: ${err.message || err}`);
        });
    }
});


// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.gallery-slider');
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    
    let currentSlide = 0;
    const slideCount = slides.length;

    function goToSlide(index) {
        if (index < 0) {
            currentSlide = slideCount - 1;
        } else if (index >= slideCount) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    prevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
    });
});


// 确保在DOM加载完毕后执行
document.addEventListener('DOMContentLoaded', function() {
    updateDynamicShippingText();
});

function updateDynamicShippingText() {
    const shippingElement = document.getElementById('dynamic-shipping-strong-text');

    if (shippingElement) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 7);

        // 格式化日期为 M月D日
        const todayMonth = today.getMonth() + 1; // getMonth() 返回 0-11
        const todayDay = today.getDate();
        const futureMonth = futureDate.getMonth() + 1;
        const futureDay = futureDate.getDate();

        const todayFormatted = `${todayMonth}月${todayDay}日`;
        const futureDateFormatted = `${futureMonth}月${futureDay}日`;

        const newText = `今日定下（${todayFormatted}），预计在7日内完成产品制作（${futureDateFormatted}前），具体请根据石料和包装调整`;
        
        shippingElement.textContent = newText;
    } else {
        console.error('Element with ID "dynamic-shipping-strong-text" not found.');
    }
}


// 添加滚动按钮功能
document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollToBottomBtn = document.getElementById('scrollToBottom');
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // 显示/隐藏返回顶部按钮
        if (scrollPosition > windowHeight / 2) {
            scrollToTopBtn.style.display = 'flex';
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.style.display = 'none';
            scrollToTopBtn.classList.remove('visible');
        }
        
        // 显示/隐藏到达底部按钮
        if (scrollPosition < (documentHeight - windowHeight * 1.5)) {
            scrollToBottomBtn.style.display = 'flex';
            scrollToBottomBtn.classList.add('visible');
        } else {
            scrollToBottomBtn.style.display = 'none';
            scrollToBottomBtn.classList.remove('visible');
        }
    });
    
    // 返回顶部点击事件
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 到达底部点击事件
    scrollToBottomBtn.addEventListener('click', function() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    });
});