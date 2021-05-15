Zotero.SaveWithTag = new function () {
    const _this = this;

    // Startup - initialize plugin

    this.init = function () {
        this.resetState('initial');

        // Register callbacks in Zotero as item observers
        if (this.notifierID == null)
            this.notifierID = Zotero.Notifier.registerObserver(this.notifierCallback, ['item']);
        // Unregister callback when the window closes (important to avoid a memory leak)
        window.addEventListener('unload', function (e) {
            Zotero.Notifier.unregisterObserver(_this.notifierID);
            _this.notifierID = null;
        }, false);

    };

    this.notifierCallback = {
        notify: function (event, type, ids, extraData) {
            if (type == 'item' && event == 'add') {
                _this.updateItems(Zotero.Items.get(ids), 'update');
            };
        }
    };

    /** Update logic */

    this.resetState = function (operation) {
        if (this.progressWin) {
            this.progressWin.close();
        };
        switch (operation) {
            case 'update':
                icon = 'chrome://zotero/skin/tick.png';
                resetWindow = new this.ProgressWindow();
                resetWindow.changeHeadline('Finished');
                resetWindow.progress = new resetWindow.ItemProgress(icon);
                resetWindow.progress.setProgress(100);
                resetWindow.progress.setText(this.numberOfUpdatedItems + ' of ' + this.numberOfItemsToUpdate + ' item tag(s) updated.');
                resetWindow.show();
                resetWindow.startCloseTimer(4000);
                break;
            default:
                break;
        };
        this.itemsToUpdate = null;
        this.currentItemIndex = 0;
        this.numberOfUpdatedItems = 0;
        this.numberOfItemsToUpdate = 0;
    };

    this.updateSelectedItems = function (operation) {
        this.updateItems(ZoteroPane.getSelectedItems(), operation);
    };

    function itemHasField(item, field) {
        return Zotero.ItemFields.isValidForType(Zotero.ItemFields.getID(field), item.itemTypeID);
    }

    this.updateItems = function (items, operation) {
        items = items.filter(item => item.getField('title'));

        if (items.length === 0 ||
            this.currentItemIndex < this.numberOfItemsToUpdate) {
            return;
        };

        this.resetState('initial');
        this.numberOfItemsToUpdate = items.length;
        this.itemsToUpdate = items;

        // Progress Windows
        this.progressWin = new this.ProgressWindow({ callOnClick: [] });
        let icon = 'chrome://zotero/skin/toolbar-advanced-search' + (Zotero.hiDPI ? '@2x' : '') + '.png';
        let headline = '';
        switch (operation) {
            case 'update':
                headline = 'Updating tag';
                break;
            default:
                headline = 'Default headline';
                break;
        }
        this.progressWin.changeHeadline(headline, icon);
        this.progressWin.progress = new this.progressWin.ItemProgress();
        this.progressWin.show();

        this.updateNextItem(operation);
    };

    this.updateNextItem = function (operation) {
        this.currentItemIndex++;

        if (this.currentItemIndex > this.numberOfItemsToUpdate) {
            this.resetState(operation);
            return;
        };

        // Progress Windows
        let percent = Math.round(((this.currentItemIndex - 1) / this.numberOfItemsToUpdate) * 100);
        this.progressWin.progress.setProgress(percent);
        this.progressWin.progress.setText('Update Item ' + this.currentItemIndex + ' of ' + this.numberOfItemsToUpdate);

        this.updateItem(
            this.itemsToUpdate[this.currentItemIndex - 1], operation);
    };

    this.updateItem = function (item, operation) {
        //hanmei
        item.addTag('To-Read', 1);
        try { item.saveTx(); } catch (e) {
            Zotero.logError(e);
        }
    };
};