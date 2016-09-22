require.config({
    paths: {
        'text': 'lib/text',
        'i18n': 'lib/i18n'
    },
    locale: brackets.getLocale()
});

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule('command/CommandManager');
    var Menus = brackets.getModule('command/Menus');
    var EditorManager = brackets.getModule('editor/EditorManager');
    var AppInit = brackets.getModule('utils/AppInit');
    var Strings = require('strings');
    var PLUGIN_ID = 'advanced.code.folding';
    var config = {
        curlyBracketCode: 123,
        squareBracketCode: 91
    };


    /**
     * Get the extension's actions
     * @return {Array} actions The list of available actions
     */
    function getActions() {
        var actions = [
            {
                label: Strings.COLLAPSE_ALL,
                id: PLUGIN_ID + '.collapse.all',
                action: 'collapse',
                level: 0
            },
            {
                label: Strings.COLLAPSE_TO_FIRST,
                id: PLUGIN_ID + '.collapse.to.first',
                action: 'collapse',
                level: 1
            },
            {
                label: Strings.COLLAPSE_TO_SECOND,
                id: PLUGIN_ID + '.collapse.to.second',
                action: 'collapse',
                level: 2
            },
            {
                label: Strings.COLLAPSE_TO_THIRD,
                id: PLUGIN_ID + '.collapse.to.third',
                action: 'collapse',
                level: 3
            },
            {
                label: Strings.EXPAND_ALL,
                id: PLUGIN_ID + '.expand.all',
                action: 'expand',
                level: 0
            },
            {
                label: Strings.EXPAND_TO_FIRST,
                id: PLUGIN_ID + '.expand.to.first',
                action: 'expand',
                level: 1
            },
            {
                label: Strings.EXPAND_TO_SECOND,
                id: PLUGIN_ID + '.expand.to.second',
                action: 'expand',
                level: 2
            },
            {
                label: Strings.EXPAND_TO_THIRD,
                id: PLUGIN_ID + '.expand.to.third',
                action: 'expand',
                level: 3
            }
        ];

        return actions;
    }

    /**
     * Prepare some data before action's callback start
     * @param {object} action Action's config
     */
    function runAction(action) {
        var allNodesAction;
        var singleNodeAction;

        if (action.action === 'collapse') {
            allNodesAction = CodeMirror.commands.foldToLevel;
            singleNodeAction = 'foldCode';
        } else {
            allNodesAction = CodeMirror.commands.unfoldAll;
            singleNodeAction = 'unfoldCode';
        }

        applyAction(action, allNodesAction, singleNodeAction);
    }

    /**
     * Start selected action
     * @param {object} action Action's config
     * @param {function} allNodesAction Action for the all code regions
     * @param {string} singleNodeAction Name of the action for single code region
     */
    function applyAction(action, allNodesAction, singleNodeAction) {

        var editor = EditorManager.getFocusedEditor();

        if (!editor) {
            return;
        }

        var cm = editor._codeMirror;

        if (!action.level) {
            allNodesAction(cm);
            return;
        }

        config.indentCode = cm.options.indentWithTabs ? 9 : 32;
        config.indentSize = action.level * cm.options.indentUnit;

        var lineNumber = cm.lastLine();

        while (lineNumber >= cm.firstLine()) {
            var lineText = cm.getLine(lineNumber);
            var isNeededLine = true;
            var lastCharCode = lineText.charCodeAt(lineText.length - 1);
            var canApply = (lastCharCode === config.curlyBracketCode || lastCharCode === config.squareBracketCode);

            if (canApply) {
                for (var j = 0; j < config.indentSize; j++) {
                    if (lineText.charCodeAt(j) !== config.indentCode) {
                        isNeededLine = false;
                    }
                }

                if (lineText.charCodeAt(config.indentSize) === config.indentCode) {
                    isNeededLine = false;
                }

                isNeededLine && cm[singleNodeAction](lineNumber);
            }

            lineNumber--;
        }
    }

    /**
     * Initialise the extension
     */
    function init() {

        var actions = getActions();
        var menu = Menus.addMenu(Strings.MENU_LABEL, PLUGIN_ID + '.MainMenu');

        actions.forEach(function (item, index) {
            CommandManager.register(item.label, item.id, function () {
                runAction(item);
            });
            menu.addMenuItem(item.id);

            if (index === 3) {
                menu.addMenuDivider();
            }
        });
    }

    AppInit.appReady(init);

});
