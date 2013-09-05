CommonBuyTemplateNewProductAttributeHandler = Class.create();
CommonBuyTemplateNewProductAttributeHandler.prototype = Object.extend(new CommonHandler(), {

    //----------------------------------

    popups: [],

    //----------------------------------

    initialize: function()
    {
        this.attributesContainer = $('buy_attr_container');

        var requiredGroupedSelect = {};

        Validation.add('M2ePro-attributes-validation-int', M2ePro.translator.translate('Invalid input data. Integer value required.'), function(value, element) {
            if (!element.up('tr').visible()) {
                return true;
            }
            return self['intTypeValidator'](value,element);
        });

        Validation.add('M2ePro-attributes-validation-float', M2ePro.translator.translate('Invalid input data. Decimal value required. Example 12.05'), function(value, element) {
            if (!element.up('tr').visible()) {
                return true;
            }
            return self['floatTypeValidator'](value,element);
        });

        Validation.add('M2ePro-attributes-validation-string', M2ePro.translator.translate('Invalid input data. String value required.'), function(value, element) {
            if (!element.up('tr').visible()) {
                return true;
            }
            return self['stringTypeValidator'](value,element);
        });

        Validation.add('multi_select_validator', M2ePro.translator.translate('This is a required field.'), function(value,element) {
            if (!element.up('tr').visible()) {
                return true;
            }
            return self['multiSelectTypeValidator'](value,element);
        });
    },

    //----------------------------------

    intTypeValidator: function(value,element) {

        if (value.match(/[^\d]+/g) || value <= 0) {
            return false;
        }

        return true;
    },

    stringTypeValidator: function(value,element) {
        return true;
    },

    floatTypeValidator: function(value, element) {

        if (value.match(/[^\d.]+/g)) {
            return false;
        }

        if (isNaN(parseFloat(value)) ||
            substr_count(value,'.') > 1 ||
            value.substr(-1) == '.') {
            return false;
        }

        return true;
    },

    requiredGroupTypeValidator: function(value, element, group)
    {
        var countOfSelected = 0;
        var selects = $$('.' + group);

        selects.each(function(select){
            if (select.value != M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_NONE') &&
                select.value != '') {

                countOfSelected ++;
            }
        });

        if (countOfSelected > 0) {
            return true;
        }
        return false;
    },

    multiSelectTypeValidator: function(value,element)
    {
        if (element.value != '') {
            return true;
        }
        return false;
    },

    //----------------------------------

    clearAttributes: function ()
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler;

        var trs = self.attributesContainer.childElements();
        for (var i = 0; i < trs.length; i++) {
            trs[i].remove();
        }
    },

    showAttributes: function(categoryId)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler;

        self.clearAttributes();

        if (categoryId <= 0) {
            var tr = self.attributesContainer.appendChild(new Element('tr'));
            var td = tr.appendChild(new Element ('td'));
            var label = td.appendChild(new Element ('label')).insert(M2ePro.translator.translate('Select Category first.'));
            return;
        }

        new Ajax.Request( M2ePro.url.get('adminhtml_common_buy_template_newProduct/getAttributes') ,
            {
                method : 'get',
                asynchronous : true,
                parameters : {
                    category_id : categoryId
                },
                onSuccess: function(transport) {
                    var attributes = transport.responseText.evalJSON();
                    var attributesList = attributes[0].attributes.evalJSON();

                    if (M2ePro.formData.attributes.length > 0) {
                        self.renderAttributes(attributesList);
                        self.renderAttributesEditMode(M2ePro.formData.attributes);
                    } else {
                        self.renderAttributes(attributesList);
                    }
                }
            });
    },

    renderAttributesEditMode: function(attributes)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler;

        attributes.each(function(attribute) {

            $('attributes[' + attribute.attribute_name + '][mode]').value = attribute.mode;

            if (attribute.mode == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_RECOMMENDED_VALUE')) {

                $('select_' + attribute.attribute_name).show();
                var recommended_value = attribute.recommended_value.evalJSON();
                var options = $$('#recommended_value_' + attribute.attribute_name.replace(/[\s()]/gi,'_') + ' option');

                for (var i = 0; i < options.length; i++) {
                    recommended_value.each(function(value){
                        if (options[i].value == value) {
                            options[i].selected = true;
                        }
                    });
                }
            } else if (attribute.mode == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_CUSTOM_VALUE')) {
                $('input_' + attribute.attribute_name).show();
                $('custom_value_' + attribute.attribute_name).value = attribute.custom_value;
            } else if (attribute.mode == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_CUSTOM_ATTRIBUTE')) {
                $('attribute_' + attribute.attribute_name).show();
                $('custom_attribute_' + attribute.attribute_name).value = attribute.custom_attribute;
            } else {
                console.log(attribute);
            }
        })
    },

    renderAttributes: function(attributes)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler,
            dataDefinition = {};

        if (attributes.length > 0) {
            var flag = true;
            var iterations = 0;

            attributes.each(function(attribute) {
                iterations ++;
                var requiredGroupId = '';

                if (attribute.required_group_id != '0' && typeof attribute.required_group_id !== 'undefined') {
                    requiredGroupId = attribute.required_group_id;
                    if (flag) {
                        var tr = self.attributesContainer.appendChild(new Element('tr'));
                        var td = tr.appendChild(new Element ('td',{'colspan': '2','style': 'padding: 15px 0'}));
                        td.appendChild(new Element('label')).insert('<b>'+ M2ePro.translator.translate('At least one of the following attributes must be chosen:')+'</tr></b> <span class="required">*</span>');
                    }
                    flag = false;
                } else {
                    flag = true;
                }

            switch (parseInt(attribute.type)) {

                case M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_MULTISELECT'):

                    self.renderAttributeMode(attribute, requiredGroupId);
                    self.renderRecommendedValues(attribute);
                    self.renderCustomValue(attribute);
                    self.renderCustomAttribute(attribute);

                    self.renderHelpIconAllowedValues(attribute, M2ePro.translator.translate('Multiple values ​​must be separated by comma.'));

                    break;

                case M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_SELECT'):

                    self.renderAttributeMode(attribute, requiredGroupId);
                    self.renderRecommendedValues(attribute);
                    self.renderCustomValue(attribute);
                    self.renderCustomAttribute(attribute);

                    self.renderHelpIconAllowedValues(attribute);

                    break;

                case M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_INT'):

                    dataDefinition.definition = M2ePro.translator.translate('Any integer value');
                    dataDefinition.tips = '';
                    dataDefinition.example = '33';

                    self.renderAttributeMode(attribute,requiredGroupId);
                    self.renderCustomValue(attribute);
                    self.renderCustomAttribute(attribute);

                    self.renderHelpIconDataDefinition(attribute, dataDefinition);

                    break;

                case M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_DECIMAL'):

                    dataDefinition.definition = M2ePro.translator.translate('Any decimal value');
                    dataDefinition.tips = '';
                    dataDefinition.example = '10.99';

                    self.renderAttributeMode(attribute, requiredGroupId);
                    self.renderCustomValue(attribute);
                    self.renderCustomAttribute(attribute);

                    self.renderHelpIconDataDefinition(attribute, dataDefinition);

                    break;

                case M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_STRING'):

                    dataDefinition.definition = M2ePro.translator.translate('Any string value');
                    dataDefinition.tips = '';
                    dataDefinition.example = 'Red, Small, Long, Male, XXL';

                    self.renderAttributeMode(attribute, requiredGroupId);
                    self.renderCustomValue(attribute);
                    self.renderCustomAttribute(attribute);

                    self.renderHelpIconDataDefinition(attribute, dataDefinition);

                    break;

                default:
                    self.renderDefaultNoType(attribute);
                    break;
            }

            if (requiredGroupId != '') {
                Validation.add(requiredGroupId, M2ePro.translator.translate('At least one of these attributes is required.'), function(value, element) {
                    return self['requiredGroupTypeValidator'](value,element,requiredGroupId);
                });
            } else {
                if (iterations < attributes.length) {
                    var line = self.renderLine();
                }
            }
        });
        }
    },

    //---------------------------------------

    renderAttributeMode: function(attribute, requiredGroupId)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler,
            title = attribute.title.replace(/[\s()]/gi,'_');

        var tr = self.attributesContainer.appendChild(new Element('tr'));

        var td = tr.appendChild(new Element('td',{'class': 'label'}));
        td.appendChild(new Element('label')).insert(attribute.title + ': ' + (attribute.is_required == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_IS_REQUIRED') ? '<span class="required">*</span>' : ''));

        td = tr.appendChild(new Element('td',{'class': 'value'}));
        var select = td.appendChild(
            new Element('select',
                {'name': 'attributes[' + attribute.title + '][mode]',
                 'id': 'attributes[' + title.replace(/[\s()]/gi,'_') + '][mode]',
                 'class': 'select attributes required-entry ' + requiredGroupId}));

        if (attribute.is_required == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_IS_REQUIRED')) {
            select.appendChild(new Element('option',{'style': 'display: none; '}));
        } else {
            select.appendChild(new Element('option',{'value': M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_NONE')})).insert(M2ePro.translator.translate('None'));
        }

        select.appendChild(new Element('option',{'value': M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_CUSTOM_VALUE')})).insert(M2ePro.translator.translate('Custom Value'));
        select.appendChild(new Element('option',{'value': M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_CUSTOM_ATTRIBUTE')})).insert(M2ePro.translator.translate('Custom Attribute'));

        if (attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_MULTISELECT') ||
            attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_SELECT')) {

            select.appendChild(new Element('option',{'value': M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_RECOMMENDED_VALUE')})).insert(M2ePro.translator.translate('Recommended Values'));
        }

        self.setObserver(attribute, select);
    },

    renderRecommendedValues: function(attribute)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler,
            title = attribute.title.replace(/[\s()]/gi,'_');

        var tr = self.attributesContainer.appendChild(new Element('tr',{'id': 'select_' + title,'style': 'display: none;'}));
        var td = tr.appendChild(new Element('td',{'class': 'label'}));
        td.appendChild(new Element('label')).insert(M2ePro.translator.translate('Recommended Values') + '<span class="required">*</span> : ');

        td = tr.appendChild(new Element('td',{'class': 'value'}));

        var select = td.appendChild(new Element('select',
            {'name': 'attributes[' + attribute.title + '][recommended_value][]',
             'id': 'recommended_value_' + title,
             'class': 'select M2ePro-required-when-visible',
             'style': 'width: 280px'}));

        if (attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_MULTISELECT')) {
            select.setStyle({height: '150px'});
            select.setAttribute('multiple');
            select.setAttribute('class','select multi_select_validator');
        }

        var values = attribute.values.evalJSON();
        values.each(function(value){
            select.appendChild(new Element('option',{'value': value})).insert(value);
        })
    },

    renderCustomValue: function(attribute)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler,
            title = attribute.title.replace(/[\s()]/gi,'_');

        var tr = self.attributesContainer.appendChild(new Element('tr',{'id': 'input_' + title,'style': 'display: none;'}));
        var td = tr.appendChild(new Element('td',{'class': 'label'}));
        var label = td.appendChild(new Element('label')).insert(M2ePro.translator.translate('Custom Value') + '<span class="required">*</span> : ');

        td = tr.appendChild(new Element('td',{'class': 'value'}));

        var validator = self.getValidator(attribute);

        var input = td.appendChild(new Element('input',{
            'id': 'custom_value_' + title,
            'name': 'attributes[' + attribute.title + '][custom_value]',
            'type': 'text',
            'class': 'input-text M2ePro-required-when-visible ' + validator}));
    },

    renderCustomAttribute: function(attribute)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler,
            title = attribute.title.replace(/[\s()]/gi,'_');

        var tr = self.attributesContainer.appendChild(new Element('tr',{'id': 'attribute_' + title,'style': 'display: none;'}));
        var td = tr.appendChild(new Element('td',{'class': 'label'}));
        var label = td.appendChild(new Element('label')).insert(M2ePro.translator.translate('Custom Attribute') + '<span class="required">*</span> : ');

        td = tr.appendChild(new Element('td',{'class': 'value'}));
        var select = td.appendChild(new Element('select',{
            'id': 'custom_attribute_' + title,
            'name': 'attributes[' + attribute.title + '][custom_attribute]',
            'class': 'attributes M2ePro-required-when-visible select',
            'style': 'width: 280px'
        }));

        select.insert('<option style="display: none;"></option>\n' + BuyTemplateNewProductHandlerObj.attributeSetHandler.attrData);
    },

    getValidator: function(attribute)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler,
            className = '';

        if (attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_INT')) {
            className = 'M2ePro-attributes-validation-int';
        } else if (attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_DECIMAL')) {
            className = 'M2ePro-attributes-validation-float';
        } else if (attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_STRING')) {
            className = 'M2ePro-attributes-validation-string';
        }

        return className;
    },

    setObserver: function(attribute, element)
    {
        element.observe('change', function(){

            var title = attribute.title.replace(/[\s()]/gi,'_');

            $('attribute_' + title).hide();
            $('input_'+ title).hide();

            if (attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_SELECT') ||
                attribute.type == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::TYPE_MULTISELECT')) {

                $('select_' + title).hide();
            }

            if (this.value == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_RECOMMENDED_VALUE')) {
                $('select_'+ title).show();
            } else if (this.value == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_CUSTOM_VALUE')) {
                $('input_'+ title).show();
            } else if (this.value == M2ePro.php.constant('Ess_M2ePro_Model_Buy_Template_NewProduct_Attribute::ATTRIBUTE_MODE_CUSTOM_ATTRIBUTE')) {
                $('attribute_' + title).show();
            }
        });
    },

    //---------------------------------------

    renderDefaultNoType: function (attribute)
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler;

        self.attributesContainer
            .appendChild(new Element('tr'))
            .appendChild(new Element('td'))
            .update(M2ePro.translator.translate('The category does not have attributes.'));
    },

    renderLine: function()
    {
        var self = BuyTemplateNewProductHandlerObj.attributesHandler;

        var tr = self.attributesContainer.appendChild(new Element('tr'));
        var td = tr.appendChild(new Element ('td',{'colspan': '2','style': 'padding: 15px 0'}));
        td.appendChild(new Element('hr',{'style': 'border: 1px solid silver; border-bottom: none;'}));
    },

    //----------------------------------------------

    renderHelpIconDataDefinition: function(attribute, dataDefinition, container) {
        if (!dataDefinition.definition) {
            return;
        }

        if (typeof container === 'undefined') {

            var title = attribute.title.replace(/[\s()]/gi,'_'),
                attributeLabel = $('attribute_' + title).down('label'),
                inputLabel = $('input_' + title).down('label');

            BuyTemplateNewProductHandlerObj.attributesHandler.renderHelpIconDataDefinition(attribute, dataDefinition, attributeLabel);
            BuyTemplateNewProductHandlerObj.attributesHandler.renderHelpIconDataDefinition(attribute, dataDefinition, inputLabel);

            return;
        }

        container.insert('&nbsp;(');

        var helpIcon = container.appendChild(new Element('a',{
            'href': 'javascript:',
            'title': M2ePro.translator.translate('Help')
        }));

        helpIcon.insert('?');

        container.insert(')');

        var win;
        var self = this;

        helpIcon.observe('click',function() {
            var position = helpIcon.positionedOffset();

            var winContent = new Element('div');

            winContent.innerHTML += '<div style="padding: 3px 0"></div><h2>' + M2ePro.translator.translate('Definition:') + ' </h2>';
            winContent.innerHTML += '<div>' + dataDefinition.definition + '</div>';

            if (dataDefinition.tips) {
                winContent.innerHTML += '<div style="padding: 5px 0"></div><h2>' + M2ePro.translator.translate('Tips:') + ' </h2>';
                winContent.innerHTML += '<div>' + dataDefinition.tips + '</div>'
            }
            if (dataDefinition.example) {
                winContent.innerHTML += '<div style="padding: 5px 0"></div><h2>' + M2ePro.translator.translate('Examples:') + ' </h2>';
                winContent.innerHTML += '<div>' + dataDefinition.example + '</div>'
            }

            win = win || new Window({
                className: "magento",
                zIndex: 100,
                title: attribute.title + ' ' + M2ePro.translator.translate('Helpful Info:') + ' ',
                width: 400,
                top: position.top - 30,
                left: position.left + 30
            });

            win.setHTMLContent(winContent.outerHTML);

            win.height = win.content.firstChild.getStyle('height');

            if (win.visible) {
                win.hide();
            } else {
                self.popups.each(function(popup) {
                    popup.close();
                });
                win.show();
            }

            self.popups = [win];
        });
    },

    renderHelpIconAllowedValues: function(attribute, notes)
    {
        if (typeof notes === 'undefined') {
            notes = '';
        }

        var container = $('attribute_' + attribute.title.replace(/[\s()]/gi,'_')).down('label');
        container.insert('&nbsp;(');

        var helpIcon = container.appendChild(new Element('a',{
            'href': 'javascript:',
            'title': M2ePro.translator.translate('Help')
        }));

        helpIcon.insert('?');

        container.insert(')');

        var win;
        var self = this;
        var notesHeight = 20;

        helpIcon.observe('click',function() {
            var position = helpIcon.positionedOffset()

            win = win || new Window({
                className: "magento",
                zIndex: 100,
                title: M2ePro.translator.translate('Allowed Values') + ' ',
                top: position.top - 200,
                left: position.left + 30,
                width: 350
            });

            var winContent = new Element('ul',{'style': 'text-align: center; margin-top: 10px'});

            var valuesIn = attribute.values.evalJSON();
            valuesIn.each(function(value) {
                winContent.insert('<li><p>' + value + '</p></li>');
            });

            if (notes.length > 0) {
                winContent.innerHTML += '<div style="padding: 5px 0"></div><h3>' + M2ePro.translator.translate('Notes:') + '</h3>';
                winContent.innerHTML += '<div style="text-align: center"><h4>' + notes + '</h4></div>'
                notesHeight = 100;
            }

            win.setHTMLContent(winContent.outerHTML);

            if (valuesIn.length * 20 + 100 < 300) {
                win.height = valuesIn.length * 20 + notesHeight;
            } else {
                win.height = 300;
            }

            if (win.visible) {
                win.hide();
            } else {
                self.popups.each(function(popup) {
                    popup.close();
                });
                win.show();
            }

            self.popups = [win];
        });
    }

    //----------------------------------------------
});