//--------------------------------------------------------------------------------------------------//
//Variables

const GOLD_CODE :string = "GP";

handlers.BeginDungeon = function (args) {

    let currentTime = Date.now();

    let itemId: string;
    if(args && args.hasOwnProperty("ItemId")){
        itemId = args["ItemId"];
        log.info("We used the argument passed to us " + itemId);
    } else {
        itemId = "FirstDungeon";
        log.info("We defaulted to FirstDungeon");
    }

    let GrantItemRequest: PlayFabServerModels.GrantItemsToUserRequest = {
        CatalogVersion: "main",
        PlayFabId: currentPlayerId,
        ItemIds: [itemId]
    }
    
    let grantItemResult = server.GrantItemsToUser(GrantItemRequest);

    let modifyDataRequest: PlayFabServerModels.UpdateUserInventoryItemDataRequest = {
        PlayFabId: currentPlayerId,
        ItemInstanceId: grantItemResult.ItemGrantResults[0].ItemInstanceId,
        Data: {
            "StartTime": currentTime.toString(),
        }
    }

    server.UpdateUserInventoryItemCustomData(modifyDataRequest);

    return grantItemResult.ItemGrantResults[0];
}

handlers.CompleteDungeon = function (args) {

    let currentTime = Date.now();
    let inventory = server.GetUserInventory({PlayFabId: currentPlayerId});
    
    let itemId: string;

    if(args && args.hasOwnProperty("ItemId")){
        itemId = args["ItemId"];
        log.info("We used the argument passed to us " + itemId);
    } else {
        itemId = "FirstDungeon";
        log.info("We defaulted to FirstDungeon");
    }
    
    let dungeon: PlayFabServerModels.ItemInstance = null;

    //find the first dungeon in inventory
    inventory.Inventory.forEach(function(item, index, array){
        if(item.ItemId == itemId){
            dungeon = item;
            return;
        }
    });

    if(dungeon !== null){

        const endTime: number = Date.parse(dungeon.CustomData["StartTime"]) + Date.parse(dungeon.CustomData["Duration"]);

        log.info("Current time = " + currentTime);
        log.info("End time = " + endTime);

        if(currentTime > endTime){
            const GrantItemRequest = {
                PlayFabId : currentPlayerId,
                CatalogVersion : "main",
                ItemIds : [ dungeon.ItemId + "DummyKey" ],
            }
        
            server.GrantItemsToUser(GrantItemRequest);
        
            let UnlockContainerRequest = {
                PlayFabId : currentPlayerId,
                CatalogVersion : "main",
                ContainerItemId : dungeon.ItemId,
            }
        
            server.UnlockContainerItem(UnlockContainerRequest);
        } else {
            log.debug("Not enough time has passed to complete dungeon");
        }
    } else {
        log.debug("Couldnt find dungeon in user inventory")
    }
}

handlers.GetMonies = function (args) {
    let GetUserInventoryRequest = {
        "PlayFabId" : currentPlayerId
    };
    let GetUserInventoryResult = server.GetUserInventory(GetUserInventoryRequest);

    var userInventory = GetUserInventoryResult.Inventory;
    var userVCBalances = GetUserInventoryResult.VirtualCurrency;

    AddVC(userVCBalances, GOLD_CODE, 50);
}

function AddVC(vcBalances: {[key:string]: number}, code: string, amount: number)
{
    if(vcBalances !== null && vcBalances.hasOwnProperty(code)){
        vcBalances[code] += amount;
    }

    var AddUserVirtualCurrencyRequest = {
        "PlayFabId" : currentPlayerId,
        "VirtualCurrency" : code,
        "Amount" : amount
    };

    
    var AddUserVirtualCurrencyResult = server.AddUserVirtualCurrency(AddUserVirtualCurrencyRequest);
}