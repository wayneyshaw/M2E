EbayListingCategoryChooserHandler = Class.create();
EbayListingCategoryChooserHandler.prototype = Object.extend(new CommonHandler(), {

    marketplaceId: null,
    accountId: null,
    divId: null,

    selectedCategories: {},
    categoryTitles: {},
    attributes: [],

    selectCallback: null,
    unselectCallback: null,
    doneCallback: null,
    cancelCallback: null,

    interfaceMode: null,
    isShowEditLinks: true,
    categoriesRequiringValidation: {},

    tempUnselectedCategory: {},
    tempSelectedCategory: {},

    //----------------------------------

    initialize: function(div, marketplace, account)
    {
        this.marketplaceId = marketplace;
        this.accountId = account;
        this.divId = div;
    },

    //----------------------------------

    setSelectCallback: function(callback)
    {
        this.selectCallback = callback;
    },

    setUnselectCallback: function(callback)
    {
        this.unselectCallback = callback;
    },

    getMarketplaceId: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        return self.marketplaceId;
    },

    getAccountId: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        return self.accountId;
    },

    setAttributes: function(attributes)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        self.attributes = attributes;
    },

    getAttributes: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        return self.attributes;
    },

    setInterfaceMode: function(mode)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        self.interfaceMode = mode;
    },

    setShowEditLinks: function(mode)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        self.isShowEditLinks = mode;
    },

    setSelectedCategory: function(type, mode, value)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        self.selectedCategories[type] = {
            mode: mode,
            value: value
        };
    },

    setSelectedCategories: function(categories)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        self.selectedCategories = categories;
    },

    getSelectedCategory: function(type)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        if (typeof type == 'undefined') {
            return self.selectedCategories;
        }

        if (typeof self.selectedCategories[type] == 'undefined') {

            return {mode: 0, value: ''};
        }

        return self.selectedCategories[type];
    },

    getInternalData: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        var internalData = {};

        internalData['tax_category_mode'] = 0;
        internalData['tax_category_value'] = null;
        internalData['tax_category_attribute'] = null;

        var taxCategoryType = M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_TAX');
        if (typeof self.selectedCategories[taxCategoryType] != 'undefined' &&
            typeof self.selectedCategories[taxCategoryType]['mode'] != 'undefined') {

            internalData['tax_category_mode'] = self.selectedCategories[taxCategoryType].mode;

            if (internalData['tax_category_mode'] == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::TAX_CATEGORY_MODE_VALUE')) {
                internalData['tax_category_value'] = self.selectedCategories[taxCategoryType].value;
            } else if(internalData['tax_category_mode'] == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::TAX_CATEGORY_MODE_ATTRIBUTE')) {
                internalData['tax_category_attribute'] = self.selectedCategories[taxCategoryType].value;
            }
        }

        self.setCategoryToInternalData(
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_EBAY_MAIN'),
            'category_main_',
            internalData
        );
        self.setCategoryToInternalData(
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_EBAY_SECONDARY'),
            'category_secondary_',
            internalData
        );
        self.setCategoryToInternalData(
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_STORE_MAIN'),
            'store_category_main_',
            internalData
        );
        self.setCategoryToInternalData(
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_STORE_SECONDARY'),
            'store_category_secondary_',
            internalData
        );

        return internalData;
    },

    getInternalEbayMainData: function()
    {
        var data = {};

        this.setCategoryToInternalData(
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_EBAY_MAIN'),
            'category_main_',
            data
        );

        return data;
    },

    getConvertedInternalData: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        return self.selectedCategories;
    },

    setCategoryToInternalData: function(type, prefix, data)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        data[prefix + 'mode'] = 0;
        data[prefix + 'id'] = null;
        data[prefix + 'attribute'] = null;

        if (typeof self.selectedCategories[type] != 'undefined' &&
            typeof self.selectedCategories[type]['mode'] != 'undefined') {

            data[prefix + 'mode'] = self.selectedCategories[type].mode;

            if (data[prefix + 'mode'] == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_EBAY')) {
                data[prefix + 'id'] = self.selectedCategories[type].value;
            } else if(data[prefix + 'mode'] == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_ATTRIBUTE')) {
                data[prefix + 'attribute'] = self.selectedCategories[type].value;
            }
        }

        return data;
    },

    getCategoryTitle: function(type)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        if (typeof self.categoryTitles[type] == 'undefined') {
            return '';
        }

        return self.categoryTitles[type];
    },

    setCategoryTitles: function(titles)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        self.categoryTitles = titles;
    },

    //----------------------------------

    showEditPopUp: function(type)
    {
        var self = EbayListingCategoryChooserHandlerObj;
        var selected = self.getSelectedCategory(type);

        new Ajax.Request(M2ePro.url.get('adminhtml_ebay_category/getChooserEditHtml'),
        {
            method: 'post',
            parameters: {
                marketplace_id: self.marketplaceId,
                account_id: self.accountId,
                category_type: type,
                selected_mode: selected.mode,
                selected_value: selected.value,
                selected_path: selected.path
            },
            onSuccess: function(transport)
            {
                if (typeof self.popUp != 'undefined') {
                    self.popUp.close();
                }

                var title = M2ePro.translator.translate('Change') + ' ' + self.getCategoryTitle(type);

                self.openPopUp(title, transport.responseText);
                self.renderRecent();
                self.renderAttributes();
            }
        });
    },

    openPopUp: function(title, html)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        this.popUp = Dialog.info(null, {
            draggable: true,
            resizable: true,
            closable: true,
            className: "magento",
            windowClassName: "popup-window",
            title: title,
            top: 100,
            width: 700,
            height: 420,
            zIndex: 100,
            recenterAuto: false,
            hideEffect: Element.hide,
            showEffect: Element.show,
            closeCallback: function() {
                var type = $('category_type').value;

                delete self.tempSelectedCategory[type];
                delete self.tempUnselectedCategory[type];

                return true;
            }
        });
        $('modal_dialog_message').style.paddingTop = '20px';
        $('modal_dialog_message').insert(html);
        $('modal_dialog_message').innerHTML.evalScripts();
    },

    //----------------------------------

    taxCategoryChange: function(select)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        var taxCategoryMode = select.options[select.selectedIndex].up().getAttribute('tax_category_mode');

        if (taxCategoryMode == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::TAX_CATEGORY_MODE_VALUE')) {
            self.selectedCategories[M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_TAX')] = {
                mode: M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::TAX_CATEGORY_MODE_VALUE'),
                value: select.value
            };
        } else if (taxCategoryMode == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::TAX_CATEGORY_MODE_ATTRIBUTE')) {
            self.selectedCategories[M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_TAX')] = {
                mode: M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::TAX_CATEGORY_MODE_ATTRIBUTE'),
                value: select.value
            };
        } else {
            delete self.selectedCategories[M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_TAX')];
        }
    },

    cancelPopUp: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        self.popUp.close();

        if (typeof self.cancelCallback == 'function') {
            self.cancelCallback();
        }
    },

    //----------------------------------

    selectCategory: function(mode, value)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        var type = $('category_type').value;

        self.tempSelectedCategory[type] = {
            mode: mode,
            value: value
        };
        delete self.tempUnselectedCategory[type];

        new Ajax.Request(M2ePro.url.get('adminhtml_ebay_category/getPath'),
        {
            method: 'post',
            parameters: {
                marketplace_id: self.marketplaceId,
                account_id: self.accountId,
                value: value,
                mode: mode,
                category_type: type
            },
            onSuccess: function(transport)
            {
                $('selected_category_path').innerHTML = transport.responseText;
                $('category_reset_link').show();
                $('category_title_container').innerHTML = $('category_title').value + ' ' + M2ePro.translator.translate('Category') + ':';
            }
        });
    },

    unSelectCategory: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        var type = $('category_type').value;
        self.tempUnselectedCategory[type] = true;
        delete self.tempSelectedCategory[type];

        $('selected_category_path').innerHTML = '';
        $('category_reset_link').hide();
        $('selected_category_path').innerHTML = '<span style="color: grey; font-style: italic">' + M2ePro.translator.translate('Not Selected') + '</span>';
    },

    isCategoryTemporarySelected: function(type)
    {
        return typeof this.tempSelectedCategory[type] != 'undefined'
            && typeof this.tempSelectedCategory[type].mode != 'undefined'
            && this.tempSelectedCategory[type].mode != M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_NONE');
    },

    isCategoryTemporaryUnselected: function(type)
    {
        return typeof this.tempUnselectedCategory[type] != 'undefined';
    },

    isCategorySelected: function(type)
    {
        return typeof this.selectedCategories[type] != 'undefined'
            && typeof this.selectedCategories[type].mode != 'undefined'
            && this.selectedCategories[type].mode != M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_NONE');
    },

    isCategoryValidationRequired: function(type)
    {
        return typeof this.categoriesRequiringValidation[type] != 'undefined' && this.categoriesRequiringValidation[type];
    },

    doneCategory: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;
        var type = $('category_type').value;

        $('category_validation').value = this.isCategoryTemporarySelected(type) ? 1 :
            (this.isCategorySelected(type) && !this.isCategoryTemporaryUnselected(type)) ? 1 : '';

        if (this.isCategoryValidationRequired(type) && !Validation.validate($('category_validation'))) {
            return;
        }

        if (typeof self.tempSelectedCategory[type] != 'undefined') {
            self.selectedCategories[type] = self.tempSelectedCategory[type];

            if (type == 0 && this.selectCallback != null) {
                (this.selectCallback)(self.selectedCategories[type].mode, self.selectedCategories[type].value);
            }
        }

        if (typeof self.tempUnselectedCategory[type] != 'undefined') {
            delete self.selectedCategories[type];

            if (this.unselectCallback != null) {
                (this.unselectCallback)();
            }
        }

        delete self.tempSelectedCategory[type];
        delete self.tempUnselectedCategory[type];
        self.popUp.close();

        self.reload();

        if (typeof self.doneCallback == 'function') {
            self.doneCallback();
        }
    },

    reload: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        var selectedCategories = {};
        var types = [
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_EBAY_MAIN'),
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_EBAY_SECONDARY'),
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_STORE_MAIN'),
            M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_STORE_SECONDARY')
        ];

        types.each(function(type) {
            if (typeof self.selectedCategories[type] == 'undefined') {
                selectedCategories[type] = null;
            } else {
                selectedCategories[type] = self.selectedCategories[type]
            }
        });

        new Ajax.Request(M2ePro.url.get('adminhtml_ebay_category/getChooserHtml'),
        {
            method: 'post',
            parameters: {
                marketplace_id: self.marketplaceId,
                account_id: self.accountId,
                div_id: self.divId,
                selected_categories: Object.toJSON(selectedCategories),
                attributes: implode(',', self.attributes),
                interface_mode: self.interfaceMode,
                is_show_edit_links: self.isShowEditLinks,
                select_callback: self.selectCallback,
                unselect_callback: self.unselectCallback
            },
            onSuccess: function(transport)
            {
                $(self.divId).innerHTML = transport.responseText;
            }
        });
    },

    reloadPopUp: function()
    {
        var self  = EbayListingCategoryChooserHandlerObj;

        var type = $('category_type').value;
        self.showEditPopUp(type);
    },

    //----------------------------------

    renderAttributes: function()
    {
        var self  = EbayListingCategoryChooserHandlerObj;

        if (!$('chooser_attributes_table')) {
            return;
        }

        var type = $('category_type').value;
        var attributesParam = [];
        if (typeof self.selectedCategories[type] != 'undefined'
            && self.selectedCategories[type].mode == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_ATTRIBUTE')) {

            self.attributes.each(function(attribute) {
                if (attribute != self.selectedCategories[type].value) {
                    attributesParam[attributesParam.length] = attribute;
                }
            });
        } else {
            attributesParam = self.attributes;
        }

        new Ajax.Request(M2ePro.url.get('adminhtml_ebay_category/getAttributeLabels'),
        {
            method: 'post',
            parameters: {
                attributes: implode(',', attributesParam)
            },
            onSuccess: function(transport)
            {
                var attributes = transport.responseText.evalJSON();
                var trHtml = '';
                var isTrFinished = false;
                attributes.reverse().each(function(attribute) {
                    if (!isTrFinished) {
                        trHtml = '<tr>';
                    }

                    trHtml += '<td>'+attribute.label+'</td>' +
                            '<td style="padding-left: 55px"><a href="javascript:void(0)" ' +
                            'onclick="EbayListingCategoryChooserHandlerObj.selectCategory('+M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_ATTRIBUTE')+', \''+attribute.code+'\')">' +
                            M2ePro.translator.translate('Select') + '</a></td>';

                    if (isTrFinished) {
                        trHtml += '</tr>';
                        $('chooser_attributes_table').insert(trHtml);
                        isTrFinished = false;
                    } else {
                        isTrFinished = true;
                    }
                });

                if (isTrFinished) {
                    trHtml += '</tr>';
                    $('chooser_attributes_table').insert(trHtml);
                }
            }
        });
    },

    renderRecent: function()
    {
        var self  = EbayListingCategoryChooserHandlerObj;

        if (!$('chooser_recent_table')) {
            return;
        }

        var type = $('category_type').value;

        var selected = null;
        if (typeof self.selectedCategories[type] != "undefined" &&
            self.selectedCategories[type].mode == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_EBAY')) {

            selected = self.selectedCategories[type].value;
        }

        new Ajax.Request(M2ePro.url.get('adminhtml_ebay_category/getRecent'),
        {
            method: 'post',
            parameters: {
                marketplace: self.marketplaceId,
                account: self.accountId,
                selected_category: selected,
                category_type: type
            },
            onSuccess: function(transport)
            {
                var categories = transport.responseText.evalJSON();
                var html = '';

                if (transport.responseText.length > 2) {
                    html += '<tr><td width="730px"></td><td width="70px"></td></tr>';
                    $H(categories).each(function(category) {
                        html += '<tr><td>'+category.value+'</td>' +
                            '<td><a href="javascript:void(0)" ' +
                            'onclick="EbayListingCategoryChooserHandlerObj.selectCategory('+M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_EBAY')+', \''+category.key+'\')">' +
                            M2ePro.translator.translate('Select') + '</a></td></tr>';
                    });
                } else {
                    html += '<tr><td colspan="2" style="padding-left: 200px"><strong>' + M2ePro.translator.translate('No recently used categories') + '</strong></td></tr>';
                }

                $('chooser_recent_table').innerHTML = html;
            }
        });
    },

    search: function()
    {
        var self = EbayListingCategoryChooserHandlerObj;

        var query = $('query').value;
        if (query.length == 0) {
            return;
        }

        var type = $('category_type').value;
        $('chooser_search_results').innerHTML = '';

        new Ajax.Request(M2ePro.url.get('adminhtml_ebay_category/search'),
            {
                method: 'post',
                parameters: {
                    marketplace_id: self.marketplaceId,
                    account_id: self.accountId,
                    query: query,
                    category_type: type
                },
                onSuccess: function(transport)
                {
                    var html = '<table id="search_results_table"><tr><td width="740px"></td><td width="60px"></td></tr>';

                    if (transport.responseText.length > 2) {
                        var result = transport.responseText.evalJSON();
                        result.each(function(category) {
                            html += '<tr><td style="padding: 2px;">';
                            html += category.titles + ' (' + category.id + ')';
                            html += '</td><td style="padding: 2px;">';
                            html += '<a href="javascript:void(0)" ' +
                                'onclick="EbayListingCategoryChooserHandlerObj.selectCategory('+M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_EBAY')+', '+category.id+')">' +
                                M2ePro.translator.translate('Select') + '</a>';
                            html += '</td>';
                        });
                    } else {
                        html += '<tr><td colspan="2" style="padding-left: 270px"><strong>' + M2ePro.translator.translate('No results') + '</strong></td></tr>';
                    }

                    html += '</table>';

                    $('chooser_search_results').innerHTML = html;
                }
            });
    },

    searchReset: function()
    {
        $('chooser_search_results').update();
        $('query').value = '';
        $('query').focus();
    },

    //----------------------------------

    validate: function()
    {
        var self  = EbayListingCategoryChooserHandlerObj;

        $$('#' + self.divId + ' .main-empty-advice')[0].hide();
        var typeEbayMain = M2ePro.php.constant('Ess_M2ePro_Helper_Component_Ebay_Category::CATEGORY_TYPE_EBAY_MAIN');
        if (typeof self.selectedCategories[typeEbayMain] == 'undefined' ||
            typeof self.selectedCategories[typeEbayMain]['mode'] == 'undefined' ||
            self.selectedCategories[typeEbayMain]['mode'] == M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Category::CATEGORY_MODE_NONE')) {

            $$('#' + self.divId + ' .main-empty-advice')[0].show();
            return false;
        }

        return true;
    },

    //----------------------------------

    keyPressQuery: function(event)
    {
        var self = EbayListingCategoryChooserHandlerObj;

        if (event.keyCode == 13) {
            self.search();
        }
    },

    //----------------------------------

    submitData: function(url, redirectUrl)
    {
        var self  = EbayListingCategoryChooserHandlerObj;

        if (!self.validate()) {
            return;
        }

        var categoryData = self.getInternalData();
        categoryData['attributes'] = self.attributes.join(',');

        new Ajax.Request(url,
        {
            method: 'post',
            parameters: {
                category_data: Object.toJSON(categoryData)
            },
            onSuccess: function(transport)
            {
                setLocation(redirectUrl);
            }
        });
    }

    //----------------------------------
});