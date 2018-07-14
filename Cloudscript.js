var GOLD_CODE = "GP";
handlers.BeginDungeon = function (args) {
    var currentTime = Date.now();
    var itemId;
    if (args && args.hasOwnProperty("ItemId")) {
        itemId = args["ItemId"];
        log.info("We used the argument passed to us " + itemId);
    }
    else {
        itemId = "FirstDungeon";
        log.info("We defaulted to FirstDungeon");
    }
    var GrantItemRequest = {
        CatalogVersion: "main",
        PlayFabId: currentPlayerId,
        ItemIds: [itemId]
    };
    var grantItemResult = server.GrantItemsToUser(GrantItemRequest);
    var modifyDataRequest = {
        PlayFabId: currentPlayerId,
        ItemInstanceId: grantItemResult.ItemGrantResults[0].ItemInstanceId,
        Data: {
            "StartTime": currentTime.toString()
        }
    };
    server.UpdateUserInventoryItemCustomData(modifyDataRequest);
    return GetItemFromUserInventory(itemId);
};
handlers.CompleteDungeon = function (args) {
    var currentTime = Date.now();
    var itemId;
    if (args && args.hasOwnProperty("ItemId")) {
        itemId = args["ItemId"];
        log.info("We used the argument passed to us " + itemId);
    }
    else {
        itemId = "FirstDungeon";
        log.info("We defaulted to FirstDungeon");
    }
    var dungeon = GetItemFromUserInventory(itemId);
    var rootItem = GetItemFromCatalog("main", itemId);
    if (dungeon !== null && rootItem !== null) {
        var dungeonData = JSON.parse(rootItem.CustomData);
        var endTime = Number(dungeon.CustomData["StartTime"]) + Number(dungeonData["Duration"]);
        log.info("Current time = " + currentTime);
        log.info("End time = " + endTime);
        log.info("Start time = " + dungeon.CustomData["StartTime"]);
        log.info("Duration = " + dungeonData["Duration"]);
        if (currentTime > endTime) {
            var GrantItemRequest = {
                PlayFabId: currentPlayerId,
                CatalogVersion: "main",
                ItemIds: [dungeon.ItemId + "DummyKey"]
            };
            server.GrantItemsToUser(GrantItemRequest);
            var UnlockContainerRequest = {
                PlayFabId: currentPlayerId,
                CatalogVersion: "main",
                ContainerItemId: dungeon.ItemId
            };
            server.UnlockContainerItem(UnlockContainerRequest);
        }
        else {
            log.debug("Not enough time has passed to complete dungeon");
        }
    }
    else {
        log.debug("Couldnt find dungeon in user inventory");
    }
};
handlers.GetMonies = function (args) {
    var GetUserInventoryRequest = {
        "PlayFabId": currentPlayerId
    };
    var GetUserInventoryResult = server.GetUserInventory(GetUserInventoryRequest);
    var userInventory = GetUserInventoryResult.Inventory;
    var userVCBalances = GetUserInventoryResult.VirtualCurrency;
    AddVC(userVCBalances, GOLD_CODE, 50);
};
function AddVC(vcBalances, code, amount) {
    if (vcBalances !== null && vcBalances.hasOwnProperty(code)) {
        vcBalances[code] += amount;
    }
    var AddUserVirtualCurrencyRequest = {
        "PlayFabId": currentPlayerId,
        "VirtualCurrency": code,
        "Amount": amount
    };
    var AddUserVirtualCurrencyResult = server.AddUserVirtualCurrency(AddUserVirtualCurrencyRequest);
}
function GetItemFromCatalog(catalogVer, itemId) {
    var tofind = null;
    var catalog = server.GetCatalogItems({ CatalogVersion: catalogVer }).Catalog;
    catalog.forEach(function (item, index, array) {
        if (item.ItemId == itemId) {
            tofind = item;
            return;
        }
    });
    return tofind;
}
function GetItemFromUserInventory(itemId) {
    var tofind = null;
    var inventory = server.GetUserInventory({ PlayFabId: currentPlayerId }).Inventory;
    inventory.forEach(function (item, index, array) {
        if (item.ItemId == itemId) {
            tofind = item;
            return;
        }
    });
    return tofind;
}
//# sourceMappingURL=Cloudscript.js.map